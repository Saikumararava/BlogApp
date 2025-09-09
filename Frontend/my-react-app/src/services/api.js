// Frontend/src/services/api.js
import axios from 'axios';

const API_ENV = (process.env.REACT_APP_API_URL || '').replace(/\/$/, ''); // remove trailing slash
// If REACT_APP_API_URL is set (production), use that + /api. Otherwise use relative /api for local dev.
const baseURL = API_ENV ? `${API_ENV}/api` : '/api';

const api = axios.create({
  baseURL,
  // Optionally include credentials if your backend uses cookies:
  // withCredentials: true
});

// Example: attach token if you store it in localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // or your auth helper
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

export default api;
