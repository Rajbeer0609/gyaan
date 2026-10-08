import api from './api';

export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: (params = {}) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  // Admin methods
  getAllOrders: (params = {}) => api.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, status, comment) =>
    api.put(`/orders/${id}/status`, { status, comment }),
};
