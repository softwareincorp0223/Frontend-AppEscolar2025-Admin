import axios from 'axios';

// Configuración básica de Axios
const axiosInstance = axios.create({
    //Servidor
    //baseURL: 'https://app.softwareincorp.com.mx:4000', 
    //localhost
    baseURL: 'http://localhost:4000', 
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000, // Tiempo máximo de espera para las peticiones
});

export default axiosInstance;
