import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';

export const validateCartStock = async (cartItems) => {
  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${item.name || 'Unknown'}" is currently unavailable.`);
    }

    // Find variant if specified
    if (item.color && item.size && product.variants?.length > 0) {
      const variant = product.variants.find(
        v => v.color.toLowerCase() === item.color.toLowerCase() &&
             v.size.toLowerCase() === item.size.toLowerCase()
      );

      if (!variant) {
        throw new ApiError(
          400,
          `Variant (${item.color} / ${item.size}) of "${product.name}" does not exist.`
        );
      }

      if (variant.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.name}" (${item.color} / ${item.size}). Available: ${variant.stock}, requested: ${item.quantity}.`
        );
      }
    } else {
      if (product.totalStock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for "${product.name}". Available: ${product.totalStock}, requested: ${item.quantity}.`
        );
      }
    }
  }
};

export const deductOrderInventory = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.color && item.size && product.variants?.length > 0) {
      const variant = product.variants.find(
        v => v.color.toLowerCase() === item.color.toLowerCase() &&
             v.size.toLowerCase() === item.size.toLowerCase()
      );

      if (variant) {
        variant.stock = Math.max(0, variant.stock - item.quantity);
      }
    }

    product.totalStock = Math.max(0, product.totalStock - item.quantity);
    await product.save();
  }
};

export const restoreOrderInventory = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.color && item.size && product.variants?.length > 0) {
      const variant = product.variants.find(
        v => v.color.toLowerCase() === item.color.toLowerCase() &&
             v.size.toLowerCase() === item.size.toLowerCase()
      );

      if (variant) {
        variant.stock += item.quantity;
      }
    }

    product.totalStock += item.quantity;
    await product.save();
  }
};
