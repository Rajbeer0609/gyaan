import api from './api';

export const paymentService = {
  createPaymentOrder: (amount, items) =>
    api.post('/payment/create-order', { amount, items }),
  verifyPayment: (paymentData) =>
    api.post('/payment/verify', paymentData),
};
