import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

// Base Axios instance — all requests go through /api (proxied to Express in dev)
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach JWT to every request if present
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Reload to push user to login screen (AuthContext will detect no token)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// ─── AI endpoints ─────────────────────────────────────────────────────────────

export const detectErrors = (data, options = {}) =>
  api.post('/ai/detect-errors', data, { signal: options.signal });

export const getSuggestions = (data, options = {}) =>
  api.post('/ai/suggest', data, { signal: options.signal });

export const explainCode = (data, options = {}) =>
  api.post('/ai/explain', data, { signal: options.signal });

// ─── History endpoints ───────────────────────────────────────────────────────

export const saveHistory = (data) => api.post('/history', data);
export const fetchHistory = (page = 1) => api.get('/history', { params: { page } });
export const deleteHistoryItem = (id) => api.delete(`/history/${id}`);

export default api;
