import uuid

import numpy.compat
from flask import abort
from datetime import datetime
from models import Patient


def is_valid_uuid(value):
    try:
        uuid.UUID(str(value))

        return True
    except ValueError:
        return False


def to_bool(value):
    valid = {'true': True, 't': True, '1': True,
             'false': False, 'f': False, '0': False,
             }

    if isinstance(value, bool):
        return value

    if not isinstance(value, numpy.compat.basestring):
        raise ValueError('invalid literal for boolean. Not a string.')

    lower_value = value.lower()
    if lower_value in valid:
        return valid[lower_value]
    else:
        abort(412)


def is_valid_timestamp(value):
    try:
        datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        return True
    except (ValueError, TypeError):
        return False


def check_patient_body_and_return_patient(request_json, gender_repository, unit_repository, disease_repository):
    # Vérification des paramètres
    if "lastName" not in request_json.keys() or request_json['lastName'] == "":
        abort(412)
    last_name = request_json['lastName']

    if "firstName" not in request_json.keys() or request_json['firstName'] == "":
        abort(412)
    first_name = request_json['firstName']

    if "birthDate" not in request_json.keys() or not is_valid_timestamp(request_json['birthDate']):
        abort(412)
    birth_date = datetime.strptime(request_json['birthDate'], "%Y-%m-%d %H:%M:%S")

    if "height" not in request_json.keys() or not str(request_json['height']).isnumeric() or float(
            request_json['height']) < 0:
        abort(412)
    height = request_json['height']

    if "weight" not in request_json.keys() or not str(request_json['weight']).isnumeric() or float(
            request_json['weight']) < 0:
        abort(412)
    weight = request_json['weight']

    if "hasElectiveSurgery" not in request_json.keys():
        abort(412)
    has_elective_surgery = to_bool(request_json['hasElectiveSurgery'])

    if "gender" not in request_json.keys() or request_json['gender'] not in list(
            map(lambda x: x.label, gender_repository.find_all())):
        abort(412)
    gender = request_json['gender']

    if "unit" not in request_json.keys() or request_json["unit"] not in list(
            map(lambda x: x.label, unit_repository.find_all())):
        abort(412)
    unit = request_json['unit']

    if "diseases" not in request_json.keys() or not hasattr(request_json["diseases"], "__len__") or len(
            list(
                set(request_json["diseases"]) - set(list(map(lambda x: x.label, disease_repository.find_all()))))) != 0:
        abort(412)
    diseases = request_json["diseases"]
    return Patient(str(uuid.uuid4()), last_name, first_name, birth_date, height, weight, has_elective_surgery, gender,
                   "INCERTAIN", unit, diseases)
