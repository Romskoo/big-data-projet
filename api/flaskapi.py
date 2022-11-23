from flask import Flask, jsonify, abort, request
from flask_cors import CORS

import json
from repositories import PatientRepository, DiseaseRepository, MachineLearningRepository, \
    GenderRepository, StatisticsRepository, UnitRepository, StateRepository
from utils import is_valid_uuid, check_patient_body_and_return_patient
from serializer import page_to_json, patient_to_json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
patient_repository = PatientRepository()
disease_repository = DiseaseRepository()
gender_repository = GenderRepository()
unit_repository = UnitRepository()
state_repository = StateRepository()
statistics_repository = StatisticsRepository()


@app.route("/patients", methods=['GET'])
def get_all_patients():
    args = request.args
    page_number = args.get("page", default=0, type=int)
    page_size = args.get("size", default=20, type=int)
    patients_page = patient_repository.find_all(page_number, page_size)
    print(patients_page, flush=True)
    patients_page.content = list(map(lambda patient: patient_to_json(patient), patients_page.content))
    return json.dumps(page_to_json(patients_page), default=str, ensure_ascii=False)


@app.route("/patients", methods=['POST'])
def create_patient():
    request_json = request.get_json()
    print(request_json, flush=True)
    patient = check_patient_body_and_return_patient(request_json, gender_repository, unit_repository,
                                                    disease_repository)

    return json.dumps(patient_to_json(patient_repository.save(patient)), default=str, ensure_ascii=False)


@app.route("/patients/nombrepages", methods=['GET'])
def get_nomre_pages_patients():
    args = request.args
    page_size = args.get("size", default=20, type=int)
    return json.dumps(patient_repository.countPages(page_size), default=str, ensure_ascii=False)


@app.route("/patients/<id>", methods=['GET'])
def read_patient(id):
    if not is_valid_uuid(id):
        abort(412)
    args = request.args
    new_state = args.get("newstate", default="", type=str)
    patient = patient_repository.read(id)
    if new_state == "":
        return json.dumps(patient_to_json(patient), default=str, ensure_ascii=False)
    else:
        if (new_state == "MORT" or new_state == "VIVANT") and patient.state == "INCERTAIN":
            patient = patient_repository.change_state_patient(patient, new_state)
        return json.dumps(patient_to_json(patient), default=str, ensure_ascii=False)


@app.route("/diseases", methods=['GET'])
def list_diseases():
    return json.dumps(list(map(lambda l: l.label, disease_repository.find_all())), default=str, ensure_ascii=False)


@app.route("/diseases/statistics", methods=['GET'])
def diseases_statistics():
    return json.dumps(statistics_repository.count_diseases(), default=str, ensure_ascii=False)


@app.route("/genders", methods=['GET'])
def list_genders():
    return json.dumps(list(map(lambda l: l.label, gender_repository.find_all())), default=str, ensure_ascii=False)


@app.route("/genders/statistics", methods=['GET'])
def genders_statistics():
    return json.dumps(statistics_repository.count_genders(), default=str, ensure_ascii=False)


@app.route("/units", methods=['GET'])
def list_units():
    return json.dumps(list(map(lambda l: l.label, unit_repository.find_all())), default=str, ensure_ascii=False)


@app.route("/units/statistics", methods=['GET'])
def units_statistics():
    return json.dumps(statistics_repository.count_units(), default=str, ensure_ascii=False)


@app.route("/states", methods=['GET'])
def list_states():
    return json.dumps(list(map(lambda l: l.label, state_repository.find_all())), default=str, ensure_ascii=False)


@app.route("/states/statistics", methods=['GET'])
def states_statistics():
    return json.dumps(statistics_repository.count_states(), default=str, ensure_ascii=False)


if __name__ == "__main__":
    MachineLearningRepository.get_model()
    app.run(debug=False, host='0.0.0.0', port=5000)
