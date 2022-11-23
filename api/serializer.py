from repositories import MachineLearningRepository


def patient_to_json(patient):
    model = MachineLearningRepository.get_model()
    patient_json = {'id': patient.id,
                    'lastName': patient.last_name,
                    'firstName': patient.first_name,
                    'birthDate': patient.birth_date,
                    'height': patient.height,
                    'weight': patient.weight,
                    'hasElectiveSurgery': patient.has_elective_surgery,
                    'gender': patient.gender,
                    'state': patient.state,
                    'unit': patient.unit,
                    'diseases': patient.diseases}
    if patient.state == 'INCERTAIN':
        if model is None:
            patient_json['aliveProba'] = "?"
        else:
            patient_json['aliveProba'] = model.predict_proba(patient.to_predictable_array())[0, 0]
    else:
        if patient.state == 'MORT':
            patient_json['aliveProba'] = 0
        else:
            patient_json['aliveProba'] = 1
    return patient_json


def page_to_json(page):
    return {'page': page.page,
            'size': page.size,
            'totalElements': page.total_elements,
            'content': page.content}
