// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
  },
  // Dashboard
  dashboard: {
    summary: '/api/dashboard/summary',
    history: '/api/dashboard/history',
  },
  // Medical
  medical: {
    predict: (modelType) => `/api/medical/predict/${modelType}`,
    uploadKnowledge: '/api/medical/upload_knowledge',
    knowledgeStatus: '/api/medical/knowledge_status',
    consult: '/api/medical/consult',
  },
  // Agriculture
  agriculture: {
    analyzeCrop: '/api/agriculture/analyze_crop',
    recommend: '/api/agriculture/recommend',
  },
  // Finance
  finance: {
    analyze: '/api/finance/analyze',
    predictBill: '/api/finance/predict_bill',
  },
  // Student
  student: {
    analyze: '/api/student/analyze',
  },
  // Settings
  settings: {
    base: '/api/settings',
  },
  // TTS
  tts: {
    synthesize: '/api/tts/synthesize',
  },
  // Admin
  admin: {
    verify: '/api/admin/verify',
    users: '/api/admin/users',
    queries: '/api/admin/analytics/queries',
    kpis: '/api/admin/analytics/kpis',
    performance: '/api/admin/analytics/performance',
    heatmap: '/api/admin/analytics/heatmap',
    logs: '/api/admin/logs', // Placeholder for future
  },
};
