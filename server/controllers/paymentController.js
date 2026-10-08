import { createRazorpayOrder, verifyRazorpaySignature } from '../services/paymentService.js';
import { validateCartStock } from '../services/inventoryService.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, items } = req.body;

    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Invalid payment amount.');
    }

    // Server-side inventory validation prior to initiating payment
    if (items && items.length > 0) {
      await validateCartStock(items);
    }

    const receiptId = `rcpt_${Date.now().toString().slice(-8)}`;
    const razorpayOrder = await createRazorpayOrder(amount, receiptId, {
      userId: req.user._id.toString(),
      userEmail: req.user.email,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: razorpayOrder.key,
          isMock: razorpayOrder.isMock || false,
        },
        'Payment order initialized successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new ApiError(400, 'Razorpay order ID, payment ID, and signature are required.');
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new ApiError(400, 'Payment verification failed. Invalid cryptographic signature.');
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { verified: true },
        'Payment signature verified successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};
