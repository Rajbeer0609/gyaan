import api from './api';

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (itemData) => api.post('/cart', itemData),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};
