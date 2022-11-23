import http from "../http-common";

const getUnits = () => {
    return http.get("/units");
}

const UnitsService = {
    getUnits
}

export default UnitsService;