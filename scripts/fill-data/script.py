import pandas as pd
import warnings
import psycopg2
import uuid
import names
from datetime import datetime
from dateutil.relativedelta import relativedelta
from elasticsearch import Elasticsearch, helpers
import os
import time

print("Lancement du script de génération")

warnings.filterwarnings("ignore")

# On importe le dataset
dataset = pd.read_csv("/scripts/fill-data/data.csv")
# On drop des lignes qu'on ne décide pas d'utiliser
dataset = dataset.dropna(subset=["age", "bmi"])
dataset = dataset[(dataset['icu_admit_source'] != 'Other Hospital') & (dataset['icu_admit_source'] != 'Other ICU')]

# On se connecte à la base de données
conn = None
connection_postgres_achieved = False
while not connection_postgres_achieved:
    time.sleep(1)
    print("Tentative connexion POSTGRES", flush=True)
    try:
        conn = psycopg2.connect(
            host=os.getenv('FLASK_POSTGRES_HOST', 'gmd_postgres'),
            port=int(5432),
            database=os.getenv('FLASK_POSTGRES_DB', 'toto'),
            user=os.getenv('FLASK_POSTGRES_USER', 'user'),
            password=os.getenv('FLASK_POSTGRES_PASSWORD', 'toto'))
        connection_postgres_achieved = True
    except psycopg2.OperationalError:
        connection_postgres_achieved = False

cursor = conn.cursor()
sql = 'SELECT COUNT(*) FROM patient;'
data = []
cursor.execute(sql, data)
results = cursor.fetchone()
for r in results:
    print(r)
if r != 0:
    os._exit(0)

# On lance l'insertion
diseases = ['aids', 'cirrhosis', 'diabetes_mellitus',
            'hepatic_failure', 'immunosuppression', 'leukemia', 'lymphoma',
            'solid_tumor_with_metastasis']

diseases_fr = ['SIDA', 'CIRRHOSE', 'DIABÈTE',
               'INSUFFISANCE HÉPATIQUE', 'IMMUNODÉPRESSION', 'LEUCÉMIE', 'LYMPHOME',
               'TUMEUR AVEC MÉTASTASES']

es = Elasticsearch(
    [{'host': os.getenv('FLASK_ELASTIC_HOST', 'gmd_elasticsearch'), 'port': 9200, 'scheme': 'http'}],
    basic_auth=(os.getenv('FLASK_ELASTIC_USER', 'user'), os.getenv('FLASK_ELASTIC_PASSWORD', 'user'))
)
while not es.ping():
    print("Tentative reconnexion Elastic", flush=True)
    time.sleep(1)
    es = Elasticsearch(
        [{'host': 'gmd_elasticsearch', 'port': 9200, 'scheme': 'http'}],
        basic_auth=(os.getenv('FLASK_ELASTIC_USER', 'user'), os.getenv('FLASK_ELASTIC_PASSWORD', 'user'))
    )

if not es.indices.exists(index="patients"):
    request_body = {
        "mappings": {
            "properties": {
                "lastName": {
                    "type": "keyword"
                },
                "firstName": {
                    "type": "text"
                },
                "birthDate": {
                    "type": "date"
                },
                "height": {
                    "type": "float"
                },
                "weight": {
                    "type": "float"
                },
                "hasElectiveSurgery": {
                    "type": "boolean"
                },
                "gender": {
                    "type": "keyword"
                },
                "unit": {
                    "type": "keyword"
                },
                "state": {
                    "type": "keyword"
                },
                "diseases": {
                    "type": "keyword"
                }
            }
        }
    }
    es.indices.create(index="patients", body=request_body)


# On insère un patient dans les bases de données
def add_patient(row):
    gender_id = 0

    id = str(uuid.uuid4())
    print("INSERTION de l'id " + id)
    first_name = names.get_first_name(gender='male')
    label_gender = "M"
    if row["gender"] == "F":
        gender_id = 1
        label_gender = "F"
        first_name = names.get_first_name(gender='female')
    last_name = names.get_last_name()
    birth_date = datetime.now() - relativedelta(years=row["age"])
    has_elective_surgery = False
    if row["elective_surgery"]:
        has_elective_surgery = True
    icu_id = 0
    label_icu = "ACCIDENT ET URGENCE"
    if row["icu_admit_source"] == "Floor":
        icu_id = 2
        label_icu = "ÉTAGE"

    if row["icu_admit_source"] == "Operating Room / Recovery":
        icu_id = 1
        label_icu = "SALLE D'OPÉRATION"
    death_id = 0
    death_label = "VIVANT"
    if row["hospital_death"]:
        death_id = 1
        death_label = "MORT"

    cursor = conn.cursor()
    postgres_insert_query = """ INSERT INTO patient (pat_id, pat_last_name, pat_first_name, pat_birth_date, pat_height, pat_weight, pat_has_elective_surgery, pat_gender_id, pat_unit_id, pat_state_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    record_to_insert = (
        id, last_name, first_name, birth_date, row["height"], row["weight"], has_elective_surgery, gender_id, icu_id,
        death_id)
    cursor.execute(postgres_insert_query, record_to_insert)
    conn.commit()
    json_object = {"lastName": last_name, "firstName": first_name, "birthDate": birth_date, "height": row["height"],
                   "weight": row["weight"], "hasElectiveSurgery": has_elective_surgery,
                   "gender": label_gender, "unit": label_icu,
                   "state": death_label, "diseases": []}
    for i in range(len(diseases)):
        if row[diseases[i]]:
            cursor = conn.cursor()
            postgres = """ INSERT INTO patient_disease (pdi_pat_id, pdi_dis_id) VALUES (%s,%s)"""
            record = (id, i)
            cursor.execute(postgres, record)
            conn.commit()
            json_object["diseases"].append(diseases_fr[i])
    print(json_object)
    es.index(
        index='patients',
        document=json_object,
        id=id)


dataset.apply(lambda x: add_patient(x), axis=1)
