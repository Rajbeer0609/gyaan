import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images totalStock variants isActive',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product no longer exists
    cart.items = cart.items.filter(item => item.product !== null);

    return res.status(200).json(
      new ApiResponse(200, { cart }, 'Cart retrieved successfully.')
    );
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, color, size, quantity = 1 } = req.body;

    if (!productId || !color || !size) {
      throw new ApiError(400, 'Product ID, color, and size are required.');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found or inactive.');
    }

    // Check variant stock
    const variant = product.variants.find(
      v => v.color.toLowerCase() === color.toLowerCase() &&
           v.size.toLowerCase() === size.toLowerCase()
    );

    const availableStock = variant ? variant.stock : product.totalStock;
    if (availableStock < quantity) {
      throw new ApiError(
        400,
        `Only ${availableStock} units available for ${product.name} (${color}/${size}).`
      );
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if this variant is already in cart
    const existingIndex = cart.items.findIndex(
      item =>
        item.product.toString() === productId &&
        item.color.toLowerCase() === color.toLowerCase() &&
        item.size.toLowerCase() === size.toLowerCase()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > availableStock) {
        throw new ApiError(
          400,
          `Cannot add more. Maximum available stock is ${availableStock}.`
        );
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = variant?.price || product.price;
    } else {
      cart.items.push({
        product: product._id,
        variantId: variant?._id || null,
        color,
        size,
        quantity: Number(quantity),
        price: variant?.price || product.price,
      });
    }

    await cart.save();

    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images totalStock variants',
    });

    return res.status(200).json(
      new ApiResponse(200, { cart }, 'Item added to cart.')
    );
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new ApiError(400, 'Quantity must be at least 1.');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new ApiError(404, 'Cart not found.');
    }

    const item = cart.items.id(itemId);
    if (!item) {
      throw new ApiError(404, 'Item not found in cart.');
    }

    const product = await Product.findById(item.product);
    if (!product) {
      cart.items.pull(itemId);
      await cart.save();
      throw new ApiError(404, 'Product no longer exists. Removed from cart.');
    }

    // Validate stock
    const variant = product.variants.find(
      v => v.color.toLowerCase() === item.color.toLowerCase() &&
           v.size.toLowerCase() === item.size.toLowerCase()
    );
    const availableStock = variant ? variant.stock : product.totalStock;

    if (quantity > availableStock) {
      throw new ApiError(
        400,
        `Cannot set quantity to ${quantity}. Only ${availableStock} units available.`
      );
    }

    item.quantity = Number(quantity);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images totalStock variants',
    });

    return res.status(200).json(
      new ApiResponse(200, { cart: populatedCart }, 'Cart item updated.')
    );
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      throw new ApiError(404, 'Cart not found.');
    }

    cart.items.pull(itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price compareAtPrice images totalStock variants',
    });

    return res.status(200).json(
      new ApiResponse(200, { cart: populatedCart }, 'Item removed from cart.')
    );
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json(
      new ApiResponse(200, { cart: { items: [] } }, 'Cart cleared.')
    );
  } catch (error) {
    next(error);
  }
};
