import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1 to 5)'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per product per user
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
