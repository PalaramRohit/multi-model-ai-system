import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const dashboardService = {
  async getSummary() {
    const response = await api.get(API_ENDPOINTS.dashboard.summary);
    return response.data;
  },

  async getHistory() {
    const response = await api.get(API_ENDPOINTS.dashboard.history);
    return response.data;
  },
};
