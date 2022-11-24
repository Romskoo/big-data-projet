import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:" + process.env["REACT_APP_API_PORT"] + "/",
  headers: {
    "Content-type": "application/json"
  }
});