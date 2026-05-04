import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import attributesApi from '@/services/attributes';  // 🔗 Для справочника атрибутов

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/v1',
  headers: { 'Content-Type': 'application/json' }
});

// 🔑 Авто-подстановка токена
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

// 🔄 Обработка 401
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
  // ===== ЗНАЧЕНИЯ АТРИБУТОВ =====
  // 📄 Получить все значения атрибутов для детали
  getByDetailId: (detailId) => api.get(`/detail-attribute-value/${detailId}/attribute-values`),
  
  // ➕ Создать значение атрибута
  create: (data) => api.post('/detail-attribute-value', data),
  
  // ✏️ Обновить значение атрибута
  update: (id, data) => api.put(`/detail-attribute-value/${id}`, data),
  
  // 🗑️ Удалить значение атрибута
  delete: (id) => api.delete(`/detail-attribute-value/${id}`),
  
  // 🔗 Справочник атрибутов (для dropdown)
  getAttributes: () => attributesApi.getAll(),
};