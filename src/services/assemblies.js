import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import profilesApi from '@/services/profiles';     
import telescopePartsApi from '@/services/telescopeParts';  

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
    return api.get('/assembly', { params: defaultParams });
  },
  getById: (id) => api.get(`/assembly/${id}`),
  create: (data) => api.post('/assembly', data),
  update: (id, data) => api.put(`/assembly/${id}`, data),
  delete: (id) => api.delete(`/assembly/${id}`),
  
  getProfiles: () => profilesApi.getAll({ size: 100 }), 
  getTelescopeDetails: () => telescopePartsApi.getAll(), 
  
  getAssemblyDetails: (assemblyId) => api.get(`/assembly-detail/by-assembly/${assemblyId}`),
  addDetailToAssembly: (data) => api.post('/assembly-detail', data),
  updateAssemblyDetail: (id, data) => api.put(`/assembly-detail/${id}`, data),
  deleteAssemblyDetail: (id) => api.delete(`/assembly-detail/${id}`),
};