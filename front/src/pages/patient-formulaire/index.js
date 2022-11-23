/**
 =========================================================
 * Soft UI Dashboard React - v4.0.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
 * Copyright 2022 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import "./formulaire.css"

// @mui icons

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard React examples
import DashboardLayout from "components/DashboardLayout";
import Footer from "components/Footer";
import {useEffect, useState} from "react";
import gendersService from "../../services/genders-service";
import unitsService from "../../services/units-service";
import diseasesServices from "../../services/diseases-service";
import patientsService from "../../services/patients-service";
import DashboardNavbar from "../../components/DashboardNavbar";
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputAdornment, Radio,
    RadioGroup,
    Select,
    TextField
} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import {AdapterMoment} from "@mui/x-date-pickers/AdapterMoment";
import {useNavigate} from "react-router-dom";
import moment from "moment";

// Overview page components




function PatientFormulaire() {

    const defaultValues = {
        lastName: "",
        firstName: "",
        birthDate: moment("01/01/1970", "DD/MM/YYYY"),
        gender: "M",
        unit: "ACCIDENT ET URGENCE",
        height: "170",
        weight: "70",
        hasElectiveSurgery: false,
        diseases: []
    };

    const [genders, setGenders] = useState([]);
    const [units, setUnits] = useState([]);
    const [diseases, setDiseases] = useState([]);


    useEffect(() => {
        gendersService.getGenders()
            .then(response => {
                setGenders(response.data)
            })
    }, [])


    useEffect(() => {
        unitsService.getUnits()
            .then(response => {
                setUnits(response.data)
            })
    }, [])

    useEffect(() => {
        diseasesServices.getDiseases()
            .then(response => {
                setDiseases(response.data)
            })
    }, [])

    const [formValues, setFormValues] = useState(defaultValues);

    const handleInputChange = (e) => {
        if (e && e.target) {
            const {name, value} = e.target;
            setFormValues({
                ...formValues,
                [name]: value
            });
        } else {
            setFormValues({
                ...formValues,
                birthDate: e
            });
        }

    };

    const handleSwitchChange = (e) => {
        const {name, checked} = e.target;
        setFormValues({
            ...formValues,
            [name]: checked
        });
    }
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        if (formValues.lastName === '') {
            return;
        }

        if (formValues.firstName === '') {
            return;
        }

        if (parseInt(formValues.weight) < 0 || parseInt(formValues.weight) > 1000) {
            return;
        }

        if (parseInt(formValues.height) < 0 || parseInt(formValues.height) > 300) {
            return;
        }

        if (!formValues.birthDate || !formValues.birthDate.isValid()) {
            return;
        }

        if (window.confirm('Etes-vous sûr de vouloir créer ce patient ?')) {
            formValues.birthDate.set("hour", 12);
            patientsService.create({
                lastName: formValues.lastName,
                firstName: formValues.firstName,
                birthDate: formValues.birthDate.format('YYYY-MM-DD HH:mm:ss'),
                height: parseInt(formValues.height),
                weight: parseInt(formValues.weight),
                hasElectiveSurgery: formValues.hasElectiveSurgery,
                gender: formValues.gender,
                unit: formValues.unit,
                diseases: formValues.diseases
            }).then(patient => {
                navigate("/dashboard")
            })

        }
    };

    const diseaseInCheckDiseases = (disease) => {
        if (formValues.diseases) {
            return formValues.diseases.includes(disease)
        }
        return false;
    }

    const handleDiseaseChange = (e) => {
        const {name, checked} = e.target;
        if (checked) {
            const newDiseases = [...formValues.diseases]
            newDiseases.push(name)
            setFormValues({
                ...formValues,
                diseases: newDiseases
            });
        } else {
            const newDiseases = formValues.diseases.filter(disease => disease !== name)
            setFormValues({
                ...formValues,
                diseases: newDiseases
            });
        }

    }

    return (
        <DashboardLayout>
            <DashboardNavbar/>
            <SoftBox mb={3}>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <SoftBox pt={2} px={2}>
                            <SoftBox mb={0.5}>
                                <SoftTypography variant="h6" fontWeight="medium">
                                    Créer un patient
                                </SoftTypography>
                            </SoftBox>
                            <SoftBox mb={1}>
                                <SoftTypography variant="button" fontWeight="regular" color="text">
                                    Veuillez remplir tous les champs afin de pouvoir valider le formulaire de création
                                    d'un
                                    patient
                                </SoftTypography>
                            </SoftBox>
                        </SoftBox>
                        <SoftBox p={2}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6} xl={6} className="form-info">
                                    <span>Informations du patient</span>
                                    <FormControl error={formValues.lastName === ''}>
                                        <FormLabel>Nom</FormLabel>
                                        <TextField
                                            id="lastName-input"
                                            name="lastName"
                                            type="text"
                                            value={formValues.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>
                                    <FormControl error={formValues.firstName === ''}>
                                        <FormLabel>Prénom</FormLabel>
                                        <TextField
                                            id="firstName-input"
                                            name="firstName"
                                            type="text"
                                            value={formValues.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </FormControl>

                                    <FormControl error={!formValues.birthDate || !formValues.birthDate.isValid()}>
                                        <FormLabel>Date de naissance</FormLabel>
                                        <LocalizationProvider dateAdapter={AdapterMoment}>
                                            <DatePicker
                                                disableFuture
                                                name="birthDate"
                                                inputFormat="DD/MM/yyyy"
                                                value={formValues.birthDate}
                                                onChange={handleInputChange}
                                                renderInput={(params) => <TextField {...params} />}
                                            />
                                        </LocalizationProvider>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Sexe</FormLabel>
                                        <RadioGroup className="gender"
                                                    name="gender"
                                                    value={formValues.gender}
                                                    onChange={handleInputChange}
                                                    row>
                                            {
                                                genders.map((data) =>
                                                    <FormControlLabel
                                                        key={data}
                                                        value={data}
                                                        control={<Radio size="small"/>}
                                                        label={data}
                                                    />
                                                )
                                            }
                                        </RadioGroup>
                                    </FormControl>

                                    <FormControl
                                        error={parseInt(formValues.height) < 0 || parseInt(formValues.height) > 300}>
                                        <FormLabel>Taille</FormLabel>
                                        <TextField
                                            id="height-input"
                                            name="height"
                                            type="number"
                                            value={formValues.height}
                                            onChange={handleInputChange}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                                            }}
                                        />
                                    </FormControl>
                                    <FormControl
                                        error={parseInt(formValues.weight) < 0 || parseInt(formValues.weight) > 1000}>
                                        <FormLabel>Masse</FormLabel>
                                        <TextField
                                            id="weight-input"
                                            name="weight"
                                            type="number"
                                            value={formValues.weight}
                                            onChange={handleInputChange}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                                            }}
                                        />
                                    </FormControl>


                                </Grid>
                                <Grid item xs={12} md={6} xl={6} className="form-info">
                                    <span>
                                       Affectation et maladies
                                    </span>
                                    <FormControl>
                                        <FormLabel>Unité d'affectation</FormLabel>
                                        <Select
                                            name="unit"
                                            value={formValues.unit}
                                            onChange={handleInputChange}
                                        >
                                            {
                                                units.map((data) =>
                                                    <MenuItem key={data} value={data}>
                                                        {data}
                                                    </MenuItem>
                                                )
                                            }
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Vient pour une opération planifiée</FormLabel>
                                        <Switch
                                            name="hasElectiveSurgery"
                                            checked={formValues.hasElectiveSurgery}
                                            onChange={handleSwitchChange}
                                            inputProps={{'aria-label': 'controlled'}}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Maladies</FormLabel>
                                        {
                                            diseases.map((data) =>
                                                <FormControlLabel className="disease"
                                                                  control={
                                                                      <Checkbox checked={diseaseInCheckDiseases(data)}
                                                                                onChange={handleDiseaseChange}
                                                                                name={data}/>
                                                                  }
                                                                  label={data}
                                                />
                                            )
                                        }

                                    </FormControl>

                                </Grid>
                            </Grid>
                        </SoftBox>
                        <SoftBox p={2} className="validator">
                            <Button variant="contained" color="primary" type="submit">
                                Valider
                            </Button>
                        </SoftBox>
                    </form>

                </Card>
            </SoftBox>

            <Footer/>
        </DashboardLayout>
    );
}

export default PatientFormulaire;
