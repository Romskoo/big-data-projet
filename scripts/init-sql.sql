CREATE TABLE patient_definitive_state
(
    pds_id    INTEGER PRIMARY KEY,
    pds_label VARCHAR(30)
);

INSERT INTO patient_definitive_state
VALUES (0, 'VIVANT'),
       (1, 'MORT'),
       (2, 'INCERTAIN');


CREATE TABLE patient_unit
(
    pun_id    INTEGER PRIMARY KEY,
    pun_label VARCHAR(50)
);

INSERT INTO patient_unit
VALUES (0, 'ACCIDENT ET URGENCE'),
       (1, 'SALLE D''OPÉRATION'),
       (2, 'ÉTAGE');

CREATE TABLE patient_gender
(
    pge_id    INTEGER PRIMARY KEY,
    pge_label VARCHAR(50)
);

INSERT INTO patient_gender
VALUES (0, 'M'),
       (1, 'F');

CREATE TABLE disease
(
    dis_id    INTEGER PRIMARY KEY,
    dis_label VARCHAR(100)
);

INSERT INTO disease
VALUES (0, 'SIDA'),
       (1, 'CIRRHOSE'),
       (2, 'DIABÈTE'),
       (3, 'INSUFFISANCE HÉPATIQUE'),
       (4, 'IMMUNODÉPRESSION'),
       (5, 'LEUCÉMIE'),
       (6, 'LYMPHOME'),
       (7, 'TUMEUR AVEC MÉTASTASES');


CREATE TABLE patient
(
    pat_id                   uuid PRIMARY KEY,
    pat_last_name            VARCHAR(50),
    pat_first_name           VARCHAR(50),
    pat_birth_date           TIMESTAMP,
    pat_height               FLOAT,
    pat_weight               FLOAT,
    pat_has_elective_surgery BOOLEAN,
    pat_gender_id            INTEGER REFERENCES patient_gender (pge_id),
    pat_unit_id              INTEGER REFERENCES patient_unit (pun_id),
    pat_state_id             INTEGER REFERENCES patient_definitive_state (pds_id)
);

CREATE TABLE patient_disease
(
    pdi_pat_id uuid REFERENCES patient (pat_id),
    pdi_dis_id INTEGER REFERENCES disease (dis_id),
    CONSTRAINT pk_patient_disease PRIMARY KEY (pdi_dis_id, pdi_pat_id)
);

CREATE INDEX patient_last_name_index ON patient (pat_last_name);