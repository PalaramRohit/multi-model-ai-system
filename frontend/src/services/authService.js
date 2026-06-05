import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const authService = {
  async login(email, password) {
    const response = await api.post(API_ENDPOINTS.auth.login, { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post(API_ENDPOINTS.auth.register, userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get(API_ENDPOINTS.auth.me);
    return response.data;
  },

  async logout() {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
