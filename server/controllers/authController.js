import crypto from 'crypto';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Please provide name, email, and password.');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email address already exists.');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'customer',
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
          },
          token,
        },
        'Account registered successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Please provide both email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password credentials.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Please contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password credentials.');
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
          },
          token,
        },
        'Logged in successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
        },
        'Current user fetched.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
          },
        },
        'Profile updated successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Please provide both current and new password.');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters.');
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Incorrect current password.');
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully.'));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Please provide your registered email address.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return generic message to prevent email enumeration
      return res.status(200).json(
        new ApiResponse(200, null, 'If that email exists in our records, a reset token has been issued.')
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // In production, send via email service. In dev, log or return token for testing
    console.log(`[Auth] Password reset token for ${email}: ${resetToken}`);

    return res.status(200).json(
      new ApiResponse(
        200,
        { resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined },
        'Password reset link generated. Please check your email or use the reset token.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset token.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully.'));
  } catch (error) {
    next(error);
  }
};
