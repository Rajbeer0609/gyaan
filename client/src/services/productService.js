import api from './api';

export const productService = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getProductById: (id) => api.get(`/products/id/${id}`),
  getRelatedProducts: (id) => api.get(`/products/related/${id}`),
  // Admin methods
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};
