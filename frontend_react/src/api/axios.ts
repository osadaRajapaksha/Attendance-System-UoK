import axios from 'axios';

const api = axios.create({
  //baseURL: 'https://api.attendancesystemuok.me', 
  // Adjust if backend runs on different port
  //baseURL: 'http://localhost:8080'
  baseURL: import.meta.env.VITE_API_BASE_URL 
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
