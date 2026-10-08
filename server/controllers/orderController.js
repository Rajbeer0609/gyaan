import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Cart } from '../models/Cart.js';
import { Coupon } from '../models/Coupon.js';
import { validateCartStock, deductOrderInventory, restoreOrderInventory } from '../services/inventoryService.js';
import { verifyRazorpaySignature } from '../services/paymentService.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      subtotal,
      discount = 0,
      shippingFee = 0,
      tax = 0,
      total,
      couponCode = null,
      paymentMethod = 'razorpay',
      razorpayOrderId = null,
      razorpayPaymentId = null,
      razorpaySignature = null,
      notes = '',
    } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item.');
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      throw new ApiError(400, 'Complete shipping address is required.');
    }

    // Server-side inventory re-validation right before order finalization
    await validateCartStock(items);

    // Verify payment if Razorpay
    if (paymentMethod === 'razorpay') {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new ApiError(400, 'Razorpay payment confirmation details are missing.');
      }

      const isValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        throw new ApiError(400, 'Invalid payment signature. Order cannot be created.');
      }
    }

    // Generate unique order number
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(Math.random() * 900 + 100);
    const orderNumber = `GYAAN-${new Date().getFullYear()}-${timestamp}${randomHex}`;

    // Handle coupon tracking
    let appliedCoupon = { code: null, discountAmount: 0 };
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        coupon.usedCount += 1;
        coupon.usedBy.push({ user: req.user._id, usedAt: new Date() });
        await coupon.save();
        appliedCoupon = { code: coupon.code, discountAmount: Number(discount) };
      }
    }

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      coupon: appliedCoupon,
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'completed' : 'pending',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderStatus: 'Confirmed',
      statusHistory: [
        {
          status: 'Confirmed',
          comment: paymentMethod === 'razorpay' ? 'Payment captured successfully via Razorpay.' : 'Cash on Delivery order placed.',
          updatedAt: new Date(),
        },
      ],
      notes,
    });

    // Create payment record
    if (paymentMethod === 'razorpay') {
      await Payment.create({
        order: order._id,
        user: req.user._id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: total,
        currency: 'INR',
        status: 'captured',
        method: 'razorpay',
      });
    }

    // Deduct stock in inventory
    await deductOrderInventory(items);

    // Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    return res.status(201).json(
      new ApiResponse(201, { order }, 'Order placed successfully.')
    );
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orders,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        'Orders retrieved.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = { _id: id };

    // If not admin, restrict to own order
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query).populate('user', 'name email phone');
    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    return res.status(200).json(new ApiResponse(200, { order }, 'Order details retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      throw new ApiError(
        400,
        `Cannot cancel an order that is already in "${order.orderStatus}" status.`
      );
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      comment: 'Cancelled by customer.',
      updatedAt: new Date(),
    });

    await order.save();

    // Restore inventory
    await restoreOrderInventory(order.items);

    return res.status(200).json(
      new ApiResponse(200, { order }, 'Order cancelled successfully and stock restored.')
    );
  } catch (error) {
    next(error);
  }
};

// Admin controllers
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'shippingAddress.fullName': new RegExp(search, 'i') },
        { 'shippingAddress.phone': new RegExp(search, 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orders,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        'All orders retrieved.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment = '' } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded',
    ];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid order status. Allowed: ${validStatuses.join(', ')}`);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new ApiError(404, 'Order not found.');
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      comment: comment || `Status updated from ${oldStatus} to ${status}.`,
      updatedAt: new Date(),
    });

    // If changing to Cancelled or Returned, restore inventory
    if (['Cancelled', 'Returned'].includes(status) && !['Cancelled', 'Returned'].includes(oldStatus)) {
      await restoreOrderInventory(order.items);
    }

    await order.save();

    return res.status(200).json(
      new ApiResponse(200, { order }, `Order status updated to ${status}.`)
    );
  } catch (error) {
    next(error);
  }
};
