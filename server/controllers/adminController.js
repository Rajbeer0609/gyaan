import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      revenueAgg,
      lowStockProducts,
      bestSellers,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      Product.find({ totalStock: { $lte: 5 }, isActive: true })
        .select('name slug totalStock price images')
        .limit(10)
        .lean(),
      Product.find({ isBestSeller: true, isActive: true })
        .select('name slug price totalStock rating images')
        .limit(5)
        .lean(),
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Last 7 days sales aggregation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          recentOrders,
          lowStockProducts,
          bestSellers,
          salesTrend,
        },
        'Admin dashboard statistics fetched successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          customers,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        'Customer list retrieved.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days, 10));

    const salesByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          salesByDate,
          statusBreakdown,
        },
        'Analytics data fetched.'
      )
    );
  } catch (error) {
    next(error);
  }
};
