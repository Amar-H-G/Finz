import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

export const getHealth = () => api.get('/health').then(res => res.data);

// Ingestion
export const uploadCsv = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/ingest/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const seedSampleData = () => api.post('/ingest/seed').then(res => res.data);
export const getImportBatches = () => api.get('/ingest/batches').then(res => res.data);

// Transactions
export const getTransactions = (params) => api.get('/transactions', { params }).then(res => res.data);
export const getTransactionById = (id) => api.get(`/transactions/${id}`).then(res => res.data);
export const getCategorySummary = () => api.get('/transactions/categories/summary').then(res => res.data);

// P&L Financials
export const getPnlReport = (month) => api.get('/pnl', { params: { month } }).then(res => res.data);
export const getPnlTransactions = (month, category) => api.get('/pnl/transactions', { params: { month, category } }).then(res => res.data);

// Variance Analysis
export const getPeriodVariance = (priorMonth, currentMonth, options = {}) =>
  api.get('/variance', { params: { priorMonth, currentMonth, ...options } }).then(res => res.data);

// Review Queue & Audit
export const getReviewItems = (status) => api.get('/review', { params: { status } }).then(res => res.data);
export const correctClassification = (id, data) => api.post(`/review/${id}/correct`, data).then(res => res.data);
export const resolveReview = (id, data) => api.post(`/review/${id}/resolve`, data).then(res => res.data);
export const getReviewAuditTrail = (transactionId) => api.get(`/review/${transactionId}/audit`).then(res => res.data);

// AI Financial Analyst
export const askAnalyst = (question) => api.post('/analyst/ask', { question }).then(res => res.data);

export default api;
