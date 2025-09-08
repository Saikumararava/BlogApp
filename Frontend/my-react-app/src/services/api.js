// Frontend: src/services/api.js
import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE.replace(/\/$/, '')}/api` // ensure no trailing slash + add /api once
});

api.interceptors.request.use(cfg => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
