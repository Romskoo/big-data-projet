from connection import Connection
from flask import abort
from models import Page, Patient, Disease, Gender, Unit, State
from math import ceil
import tarfile
from os.path import exists
import pickle


class StatisticsRepository:
    def count_states(self):
        return self.simple_aggregation("state")

    def count_diseases(self):
        return self.simple_aggregation("diseases")

    def count_genders(self):
        return self.simple_aggregation("gender")

    def count_units(self):
        return self.simple_aggregation("unit")

    def simple_aggregation(self, agg_field):
        conn = Connection.get_elasticsearch_connection()
        response = conn.search(index="patients", size=0, aggregations={
            agg_field: {
                "terms": {
                    "field": agg_field
                }
            }
        })
        result = []
        for bucket in response['aggregations'][agg_field]['buckets']:
            result.append({'label': bucket['key'], 'value': bucket['doc_count']})
        return result


class DiseaseRepository:
    diseases = []

    def find_all(self):
        if len(self.diseases) == 0:
            conn = Connection.get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT dis_id, dis_label "
                           "FROM disease ")
            diseases_cursor = cursor.fetchall()
            diseases = []
            for disease in diseases_cursor:
                diseases.append(Disease(disease[0], disease[1]))
            self.diseases = diseases
        return self.diseases


class MachineLearningRepository:
    model = None
    if not (exists('/ml/model.pickle')):
        tar = tarfile.open("/ml/model.tar")
        tar.extractall(path='/ml/')
        tar.close()

    @staticmethod
    def get_model():
        if MachineLearningRepository.model is None:
            MachineLearningRepository.model = pickle.load(open('/ml/model.pickle', 'rb'))
        return MachineLearningRepository.model


class GenderRepository:
    genders = []

    def find_all(self):
        if len(self.genders) == 0:
            conn = Connection.get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT pge_id, pge_label "
                           "FROM patient_gender ")
            genders_cursor = cursor.fetchall()
            genders = []
            for gender in genders_cursor:
                genders.append(Gender(gender[0], gender[1]))
            self.genders = genders
        return self.genders


class UnitRepository:
    units = []

    def find_all(self):
        if len(self.units) == 0:
            conn = Connection.get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT pun_id, pun_label "
                           "FROM patient_unit ")
            units_cursor = cursor.fetchall()
            units = []
            for unit in units_cursor:
                units.append(Unit(unit[0], unit[1]))
            self.units = units
        return self.units


class StateRepository:
    states = []

    def find_all(self):
        if len(self.states) == 0:
            conn = Connection.get_postgres_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT pds_id, pds_label "
                           "FROM patient_definitive_state ")
            states_cursor = cursor.fetchall()
            states = []
            for state in states_cursor:
                states.append(State(state[0], state[1]))
            self.states = states
        return self.states


class PatientDiseaseRepository:
    disease_repository = DiseaseRepository()

    def find_all_by_patient_id(self, id):
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT dis_label "
                       "FROM patient_disease "
                       "LEFT JOIN disease d ON d.dis_id = patient_disease.pdi_dis_id "
                       "WHERE pdi_pat_id = (%s)", (id,))
        diseases_cursor = cursor.fetchall()
        diseases = []
        for disease in diseases_cursor:
            diseases.append(disease[0])
        return diseases

    def save(self, patient):
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        for disease in patient.diseases:
            postgres = """ INSERT INTO patient_disease (pdi_pat_id, pdi_dis_id) VALUES (%s,%s)"""
            record = (patient.id, next(filter(lambda x: x.label == disease, self.disease_repository.find_all())).id)
            cursor.execute(postgres, record)
            conn.commit()


class PatientRepository:
    patient_disease_repository = PatientDiseaseRepository()
    gender_repository = GenderRepository()
    unit_repository = UnitRepository()
    state_repository = StateRepository()

    def find_all(self, page_number, page_size):
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        total_elements = self.count()
        if total_elements < page_number * page_size:
            abort(412)
        cursor.execute("SELECT pat_id, pat_last_name, pat_first_name, pat_birth_date, "
                       "pat_height, pat_weight, pat_has_elective_surgery,"
                       "pge_label, pds_label, pun_label "
                       "FROM patient "
                       "LEFT JOIN patient_gender pg ON patient.pat_gender_id = pg.pge_id "
                       "LEFT JOIN patient_definitive_state pds ON patient.pat_state_id = pds.pds_id "
                       "LEFT JOIN patient_unit pu ON patient.pat_unit_id = pu.pun_id ORDER BY pat_last_name LIMIT (%s) OFFSET (%s)",
                       (page_size, page_number * page_size))
        patients_cursor = cursor.fetchall()
        results = self.get_all_patients_from_list(patients_cursor)
        return Page(page_number, page_size, total_elements, results)

    def save(self, patient):
        Connection.get_elasticsearch_connection().index(
            index='patients',
            document=patient.to_elastic_json(),
            id=patient.id)
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        postgres_insert_query = """ INSERT INTO patient (pat_id, pat_last_name, pat_first_name, 
        pat_birth_date, pat_height, pat_weight, pat_has_elective_surgery, pat_gender_id, 
        pat_unit_id, pat_state_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        record_to_insert = (
            patient.id, patient.last_name, patient.first_name, patient.birth_date, patient.height, patient.weight,
            patient.has_elective_surgery,
            next(filter(lambda x: x.label == patient.gender, self.gender_repository.find_all())).id,
            next(filter(lambda x: x.label == patient.unit, self.unit_repository.find_all())).id,
            next(filter(lambda x: x.label == patient.state, self.state_repository.find_all())).id)
        cursor.execute(postgres_insert_query, record_to_insert)
        conn.commit()
        self.patient_disease_repository.save(patient)
        return self.read(patient.id)

    def change_state_patient(self, patient, new_state):
        Connection.get_elasticsearch_connection().delete(
            index='patients',
            id=patient.id)
        patient.state = new_state
        Connection.get_elasticsearch_connection().index(
            index='patients',
            document=patient.to_elastic_json(),
            id=patient.id)
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        postgres_insert_query = """ UPDATE patient SET pat_state_id=(%s) WHERE pat_id=(%s)"""
        record_to_update = (next(filter(lambda x: x.label == patient.state, self.state_repository.find_all())).id,
                            patient.id)
        cursor.execute(postgres_insert_query, record_to_update)
        conn.commit()
        return self.read(patient.id)

    def count(self):
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM patient;')
        results = cursor.fetchone()
        count = 0
        for r in results:
            count = r
        return count

    def countPages(self, page_size):
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM patient;')
        results = cursor.fetchone()
        count = 0
        for r in results:
            count = r
        return ceil(count / page_size)

    def read(self, id):
        conn = Connection.get_postgres_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT pat_id, pat_last_name, pat_first_name, pat_birth_date, "
                       "pat_height, pat_weight, pat_has_elective_surgery,"
                       "pge_label, pds_label, pun_label "
                       "FROM patient "
                       "LEFT JOIN patient_gender pg ON patient.pat_gender_id = pg.pge_id "
                       "LEFT JOIN patient_definitive_state pds ON patient.pat_state_id = pds.pds_id "
                       "LEFT JOIN patient_unit pu ON patient.pat_unit_id = pu.pun_id "
                       "WHERE pat_id=(%s) ", (id,))
        patient_cursor = cursor.fetchone()
        if patient_cursor is None:
            abort(404)
        return self.get_patient_from_row(patient_cursor)

    def get_all_patients_from_list(self, cursor):
        patients = []
        for patient in cursor:
            patients.append(self.get_patient_from_row(patient))
        del cursor
        return patients

    def get_patient_from_row(self, row):
        return Patient(row[0], row[1], row[2],
                       row[3], row[4], row[5],
                       row[6], row[7], row[8], row[9],
                       self.patient_disease_repository.find_all_by_patient_id(row[0]))
