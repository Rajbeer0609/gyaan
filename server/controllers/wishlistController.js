import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price compareAtPrice discountPercentage images totalStock rating reviewCount isActive',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Filter out inactive or deleted products
    wishlist.products = wishlist.products.filter(p => p !== null && p.isActive);

    return res.status(200).json(
      new ApiResponse(200, { wishlist }, 'Wishlist retrieved.')
    );
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      throw new ApiError(400, 'Product ID is required.');
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found.');
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price compareAtPrice discountPercentage images totalStock rating reviewCount',
    });

    return res.status(200).json(
      new ApiResponse(200, { wishlist: populatedWishlist }, 'Product added to wishlist.')
    );
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      throw new ApiError(404, 'Wishlist not found.');
    }

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price compareAtPrice discountPercentage images totalStock rating reviewCount',
    });

    return res.status(200).json(
      new ApiResponse(200, { wishlist: populatedWishlist }, 'Product removed from wishlist.')
    );
  } catch (error) {
    next(error);
  }
};
