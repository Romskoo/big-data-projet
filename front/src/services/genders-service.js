import http from "../http-common";

const getGenders = () => {
    return http.get("/genders");
}

const GendersService = {
    getGenders
}

export default GendersService;