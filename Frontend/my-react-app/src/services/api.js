// Frontend/my-react-app/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// optional: attach token automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token'); // or your token key
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
