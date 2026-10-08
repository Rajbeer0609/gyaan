import api from './api';

export const categoryService = {
  getCategories: (params = {}) => api.get('/categories', { params }),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  // Admin methods
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};
