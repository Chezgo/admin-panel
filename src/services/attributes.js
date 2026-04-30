import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import detailTypesApi from '@/services/detailTypes'; // 🔗 Импортируем сервис типов

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
  getAll: (params) => api.get('/detail-attribute', { params }),
  getById: (id) => api.get(`/detail-attribute/${id}`),
  create: (data) => api.post('/detail-attribute', data),
  update: (id, data) => api.put(`/detail-attribute/${id}`, data),
  delete: (id) => api.delete(`/detail-attribute/${id}`),
  
  getTypes: () => detailTypesApi.getAll(),
};