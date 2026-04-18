import axios from 'axios';

// Инстанс ТОЛЬКО для обмена токенами (не добавляет Bearer автоматически)
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Можно добавить логирование или обработку ошибок при необходимости
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Auth API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);