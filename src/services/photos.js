import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import assembliesApi from '@/services/assemblies';  

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

  getMyPhotos: (params = {}) => {
    const defaultParams = { page: 0, size: 12, ...params };
    return api.get('/photos/my', { params: defaultParams });
  },
  
  // 🔍 Список фото по сборке (если нужно)
  getAssemblyPhotos: (assemblyId, params = {}) => {
    const defaultParams = { page: 0, size: 12, ...params };
    return api.get(`/photos/assembly/${assemblyId}`, { params: defaultParams });
  },
  
  getPhotoUrl: (photoId) => api.get(`/photos/${photoId}/url`),
  
  deletePhoto: (photoId) => api.delete(`/photos/${photoId}`),
  
  uploadPhoto: (file, assemblyId) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadApi = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL + '/v1',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    uploadApi.interceptors.request.use(async (config) => {
      const authStore = useAuthStore();
      if (authStore.authenticated) {
        const token = await authStore.ensureValidToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    return uploadApi.post(`/photos/upload?assemblyId=${assemblyId}`, formData);
  },

  getAssemblies: () => assembliesApi.getAll({ size: 100 }),
};