import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, { reviews }, 'Product reviews fetched.')
    );
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images = [] } = req.body;

    if (!rating || !comment) {
      throw new ApiError(400, 'Rating and comment are required.');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found.');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this product.');
    }

    // Check if verified purchaser
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['Delivered', 'Confirmed', 'Processing', 'Shipped'] },
    });

    const isVerifiedPurchase = Boolean(verifiedOrder);

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      title: title || '',
      comment,
      images,
      isVerifiedPurchase,
    });

    // Recalculate product rating
    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;

    product.rating = Number(avgRating.toFixed(1));
    product.reviewCount = allReviews.length;
    await product.save();

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    return res.status(201).json(
      new ApiResponse(201, { review: populatedReview, productRating: product.rating }, 'Review submitted successfully.')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      throw new ApiError(404, 'Review not found.');
    }

    // Check if owner or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'Unauthorized to delete this review.');
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    const allReviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    if (product) {
      if (allReviews.length > 0) {
        const avgRating =
          allReviews.reduce((sum, item) => sum + item.rating, 0) / allReviews.length;
        product.rating = Number(avgRating.toFixed(1));
        product.reviewCount = allReviews.length;
      } else {
        product.rating = 0;
        product.reviewCount = 0;
      }
      await product.save();
    }

    return res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully.'));
  } catch (error) {
    next(error);
  }
};
