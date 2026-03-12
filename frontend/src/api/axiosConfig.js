import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Need to make this configurable in .env later if needed
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
