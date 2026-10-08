import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getCustomers: (params = {}) => api.get('/admin/customers', { params }),
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
};
