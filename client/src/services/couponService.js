import api from './api';

export const couponService = {
  validateCoupon: (code, orderAmount) =>
    api.post('/coupons/validate', { code, orderAmount }),
  getAllCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};
