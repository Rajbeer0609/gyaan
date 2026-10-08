import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      default: '#000000',
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'kids', 'unisex'],
      required: [true, 'Target gender is required'],
    },
    brand: {
      type: String,
      default: 'GYAAN',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Price must be positive'],
    },
    compareAtPrice: {
      type: Number,
      default: 0,
      min: [0, 'Compare-at price must be positive'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sku: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      validate: [val => val.length > 0, 'At least one product image is required'],
    },
    videos: {
      type: [String],
      default: [],
    },
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, default: '#000000' },
      },
    ],
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },
    material: {
      type: String,
      default: 'Premium Cotton Blend',
    },
    fabric: {
      type: String,
      default: '100% Combed Cotton',
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    variants: [variantSchema],
    totalStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total stock and discount before saving
productSchema.pre('save', function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  }
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    this.discountPercentage = Math.round(
      ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
    );
    this.isOnSale = true;
  }
  next();
});

// Text indexing for fast search
productSchema.index({
  name: 'text',
  shortDescription: 'text',
  description: 'text',
  tags: 'text',
  brand: 'text',
});

// Compound indexes for performant filtering
productSchema.index({ category: 1, gender: 1, price: 1 });
productSchema.index({ gender: 1, isFeatured: 1 });
productSchema.index({ gender: 1, isNewArrival: 1 });

export const Product = mongoose.model('Product', productSchema);
