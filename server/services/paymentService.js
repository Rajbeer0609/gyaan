import crypto from 'crypto';
import { getRazorpayInstance } from '../config/razorpay.js';
import { ApiError } from '../utils/apiError.js';

export const createRazorpayOrder = async (amountInINR, receiptId, notes = {}) => {
  const razorpay = getRazorpayInstance();
  const key_id = process.env.RAZORPAY_KEY_ID;

  // Convert INR to paise (Razorpay takes amount in smallest currency unit)
  const amountInPaise = Math.round(amountInINR * 100);

  // If credentials are mock/placeholder for local development testing
  if (!key_id || key_id.includes('placeholder') || key_id.includes('YourTestKey')) {
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      isMock: true,
      key: key_id || 'rzp_test_placeholder_id',
    };
  }

  try {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes,
    };

    const order = await razorpay.orders.create(options);
    return {
      ...order,
      isMock: false,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (err) {
    console.error('[Razorpay Order Creation Error]:', err);
    throw new ApiError(500, `Razorpay order generation failed: ${err.message}`);
  }
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // In test/mock mode
  if (!secret || secret.includes('placeholder') || secret.includes('YourTestKey')) {
    // If mock order, accept valid mock signature
    if (orderId && paymentId && signature) {
      return true;
    }
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
