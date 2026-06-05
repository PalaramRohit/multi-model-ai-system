import api from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const medicalService = {
  async predict(modelType, formData) {
    const response = await api.post(API_ENDPOINTS.medical.predict(modelType), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadKnowledge(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(API_ENDPOINTS.medical.uploadKnowledge, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getKnowledgeStatus() {
    const response = await api.get(API_ENDPOINTS.medical.knowledgeStatus);
    return response.data;
  },

  async consult(data) {
    // data: { symptoms: string, language: string }
    const response = await api.post(API_ENDPOINTS.medical.consult, data);
    return response.data;
  },
};

export const agricultureService = {
  async analyzeCrop(formData) {
    const response = await api.post(API_ENDPOINTS.agriculture.analyzeCrop, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async recommend(data) {
    const response = await api.post(API_ENDPOINTS.agriculture.recommend, data);
    return response.data;
  },
};

export const financeService = {
  async analyze(formData) {
    const response = await api.post(API_ENDPOINTS.finance.analyze, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async predictBill(data) {
    const response = await api.post(API_ENDPOINTS.finance.predictBill, data);
    return response.data;
  },
};

export const studentService = {
  async analyze(data) {
    const response = await api.post(API_ENDPOINTS.student.analyze, data);
    return response.data;
  },
};
