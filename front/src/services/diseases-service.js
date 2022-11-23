import http from "../http-common";

const getDiseases = () => {
    return http.get("/diseases");
}

const DiseasesService = {
    getDiseases
}

export default DiseasesService;