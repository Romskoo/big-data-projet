import http from "../http-common";

const getPagePatients = ({numPage,size}) =>{
    return http.get("/patients?page="+numPage+"&size="+size);
}

const getNombrePagesPatients = ({size}) =>{
    return http.get("/patients/nombrepages?size="+size);
}

const getPatientById = ({id}) =>{
    return http.get("/patients/"+id);
}

const changeEtatPatient = ({id,etat}) =>{
    console.log(etat)
    return http.get("/patients/"+id+"?newstate="+etat);
}

const create = (json) =>{
    return http.post("/patients", json);
}

const PatientsService = {
    getPagePatients,
    getNombrePagesPatients,
    create,
    getPatientById,
    changeEtatPatient,
}

export default PatientsService;