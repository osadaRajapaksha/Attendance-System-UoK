import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://api.attendancesystemuok.me', 
  // Adjust if backend runs on different port
  //baseURL: 'http://localhost:8080'
  baseURL: 'https://91a7af0b-3a24-428c-93f0-965f563c10ee.e1-us-east-azure.choreoapps.dev'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
