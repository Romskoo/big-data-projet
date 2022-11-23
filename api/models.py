import pandas as pd
from datetime import datetime


class Page:
    def __init__(self, page, size, total_elements, content):
        self.page = page
        self.size = size
        self.total_elements = total_elements
        self.content = content


class Patient:
    def __init__(self, id, last_name, first_name, birth_date,
                 height, weight, has_elective_surgery, gender, state, unit, diseases):
        self.id = id
        self.last_name = last_name
        self.first_name = first_name
        self.birth_date = birth_date
        self.height = height
        self.weight = weight
        self.has_elective_surgery = has_elective_surgery
        self.gender = gender
        self.state = state
        self.unit = unit
        self.diseases = diseases

    def to_row_data_frame(self, to_train=True):
        row_df = {'age': self.age(),
                  'bmi': self.bmi(),
                  'has_elective_surgery': bool(self.has_elective_surgery),
                  'is_male': self.gender == 'M',
                  'in_etage': self.unit == 'ÉTAGE',
                  'in_operation': self.unit == 'SALLE D\'OPÉRATION',
                  'has_sida': self.has_disease('SIDA'),
                  'has_cirrhose': self.has_disease('CIRRHOSE'),
                  'has_diabete': self.has_disease('DIABÈTE'),
                  'has_insuffisance': self.has_disease('INSUFFISANCE HÉPATIQUE'),
                  'has_immuno': self.has_disease('IMMUNODÉPRESSION'),
                  'has_leucemie': self.has_disease('LEUCÉMIE'),
                  'has_lymphome': self.has_disease('LYMPHOME'),
                  'has_tumeur': self.has_disease('TUMEUR AVEC MÉTASTASES')
                  }
        if to_train:
            row_df['hospital_death'] = ('MORT' == str(self.state))
        return row_df

    def to_predictable_array(self):
        dataframe = pd.DataFrame.from_records([self.to_row_data_frame(False)])
        return dataframe.to_numpy()

    def age(self):
        today = datetime.today()
        convert_birth_date = self.birth_date
        age = today.year - convert_birth_date.year - (
                (today.month, today.day) < (convert_birth_date.month, convert_birth_date.day))
        return age

    def bmi(self):
        return self.weight / pow((float(self.height) / 100.0), 2)

    def has_disease(self, name):
        return name in list(self.diseases)

    def to_elastic_json(self):
        return {"lastName": self.last_name, "firstName": self.first_name, "birthDate": self.birth_date,
                "height": self.height,
                "weight": self.weight, "hasElectiveSurgery": self.has_elective_surgery,
                "gender": self.gender, "unit": self.unit,
                "state": self.state, "diseases": self.diseases}


class Disease:
    def __init__(self, id, label):
        self.id = id
        self.label = label


class Gender:
    def __init__(self, id, label):
        self.id = id
        self.label = label


class Unit:
    def __init__(self, id, label):
        self.id = id
        self.label = label


class State:
    def __init__(self, id, label):
        self.id = id
        self.label = label
