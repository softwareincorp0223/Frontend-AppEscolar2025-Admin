import axios from "axios";

const axiosInstance = axios.create({
  // Servidor
  // baseURL: "https://app.softwareincorp.com.mx:4000",
  // Localhost
  baseURL: "http://localhost:4000",
  timeout: 5000,
});

export default axiosInstance;
