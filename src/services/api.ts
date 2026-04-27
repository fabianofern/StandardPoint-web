import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;

    if (response?.status === 401) {
      useAuthStore.getState().setUnauthenticated();
      const loginUrl = import.meta.env.VITE_TOOLCENTER_LOGIN_URL || 'http://localhost:3000/login';
      window.location.href = loginUrl;
      return Promise.reject(error);
    }

    if (response?.status === 403) {
      useAuthStore.getState().setAccessDenied();
      return Promise.reject(error);
    }
    
    // Tratamento de retry exponencial 
    if (response?.status >= 500 && !error.config.__retryCount) {
      error.config.__retryCount = error.config.__retryCount || 0;
      error.config.__retryCount += 1;
      
      if (error.config.__retryCount <= 3) {
        const delay = Math.pow(2, error.config.__retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return api(error.config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
