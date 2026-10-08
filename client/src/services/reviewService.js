import api from './api';

export const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  addReview: (productId, reviewData) => api.post(`/reviews/product/${productId}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
