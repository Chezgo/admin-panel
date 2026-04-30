import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/v1',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  if (authStore.authenticated) {
    try {
      const token = await authStore.ensureValidToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error('❌ Token error:', err);
      return Promise.reject(err);
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore().logout();
    }
    return Promise.reject(err);
  }
);

export default {
  getAll: (params = {}) => {
    const defaultParams = {
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDir: 'asc',
      ...params
    };
    return api.get('/profile', { params: defaultParams });
  },

  getByName: (name) => api.get('/profile/by-name', { params: { name } }),

  getById: (id) => api.get(`/profile/${id}`),

  create: (data) => api.post('/profile', data),

  update: (id, data) => api.put(`/profile/${id}`, data),

  delete: (id) => api.delete(`/profile/${id}`),
};