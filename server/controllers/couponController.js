import { Coupon } from '../models/Coupon.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      throw new ApiError(400, 'Coupon code is required.');
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      throw new ApiError(404, 'Invalid coupon code.');
    }

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      throw new ApiError(400, 'This coupon is not yet active.');
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      throw new ApiError(400, 'This coupon has expired.');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, 'This coupon has reached its maximum global usage limit.');
    }

    // Check per-user limit
    if (req.user) {
      const userUsage = coupon.usedBy.filter(u => u.user?.toString() === req.user._id.toString()).length;
      if (userUsage >= coupon.perUserLimit) {
        throw new ApiError(400, `You have already used this coupon the maximum allowed times (${coupon.perUserLimit}).`);
      }
    }

    const amount = Number(orderAmount) || 0;
    if (amount < coupon.minOrderAmount) {
      throw new ApiError(
        400,
        `Minimum order amount of ₹${coupon.minOrderAmount} required to use coupon "${coupon.code}".`
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = Math.min(coupon.discountValue, amount);
    }

    discount = Math.round(discount);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          code: coupon.code,
          discountAmount: discount,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        `Coupon "${coupon.code}" applied! You save ₹${discount}.`
      )
    );
  } catch (error) {
    next(error);
  }
};

// Admin controllers
export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { coupons }, 'Coupons retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, validUntil, usageLimit, perUserLimit } = req.body;

    if (!code || !discountValue || !validUntil) {
      throw new ApiError(400, 'Code, discount value, and valid until date are required.');
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      throw new ApiError(409, 'A coupon with this code already exists.');
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validUntil: new Date(validUntil),
      usageLimit,
      perUserLimit: perUserLimit || 1,
    });

    return res.status(201).json(new ApiResponse(201, { coupon }, 'Coupon created successfully.'));
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.body.code) {
      req.body.code = req.body.code.trim().toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found.');
    }

    return res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon updated.'));
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      throw new ApiError(404, 'Coupon not found.');
    }

    return res.status(200).json(new ApiResponse(200, null, 'Coupon deleted.'));
  } catch (error) {
    next(error);
  }
};
