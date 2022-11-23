import http from "../http-common";

const countStates = () => {
    return http.get("/states/statistics");
};

const countGenders = () => {
    return http.get("/genders/statistics");
};

const countUnits = () => {
    return http.get("/units/statistics");
};

const countDiseases = () => {
    return http.get("/diseases/statistics");
};

const StatisticsService = {
    countStates,
    countGenders,
    countUnits,
    countDiseases
};

export default StatisticsService;