import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
  return razorpayInstance;
};
