import axios from 'axios';

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Auth API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);