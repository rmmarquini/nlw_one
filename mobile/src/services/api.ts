import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.126.129:3333/'
});

export default api;