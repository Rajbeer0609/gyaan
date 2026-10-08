import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. No token provided.');
    }

    const secret = process.env.JWT_SECRET || 'gyaan_fallback_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid authentication token.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Authentication token expired. Please login again.'));
    } else {
      next(error);
    }
  }
};
