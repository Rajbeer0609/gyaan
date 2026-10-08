import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      gender,
      minPrice,
      maxPrice,
      size,
      color,
      rating,
      discount,
      brand,
      material,
      inStock,
      sort = 'newest',
      featured,
      newArrival,
      bestSeller,
      onSale,
    } = req.query;

    const query = { isActive: true };

    // Search query
    if (search && search.trim() !== '') {
      query.$text = { $search: search.trim() };
    }

    // Gender filter
    if (gender && gender !== 'all') {
      query.gender = gender.toLowerCase();
    }

    // Category filter
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCategory = await Category.findOne({ slug: category.toLowerCase() });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Minimum Discount
    if (discount) {
      query.discountPercentage = { $gte: Number(discount) };
    }

    // Rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sizes
    if (size) {
      const sizesArray = Array.isArray(size) ? size : size.split(',');
      query['variants.size'] = { $in: sizesArray.map(s => s.trim().toUpperCase()) };
    }

    // Color
    if (color) {
      const colorsArray = Array.isArray(color) ? color : color.split(',');
      query['variants.color'] = { $in: colorsArray.map(c => new RegExp(`^${c.trim()}$`, 'i')) };
    }

    // Brand
    if (brand) {
      query.brand = new RegExp(`^${brand}$`, 'i');
    }

    // Material
    if (material) {
      query.material = new RegExp(material, 'i');
    }

    // In Stock
    if (inStock === 'true' || inStock === true) {
      query.totalStock = { $gt: 0 };
    }

    // Flags
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (onSale === 'true') query.isOnSale = true;

    // Sorting
    let sortOptions = { createdAt: -1 };
    switch (sort) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'discount':
        sortOptions = { discountPercentage: -1 };
        break;
      case 'popular':
      case 'best-seller':
        sortOptions = { isBestSeller: -1, reviewCount: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          products,
          pagination: {
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        },
        'Products retrieved successfully.'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug.toLowerCase(), isActive: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found.');
    }

    return res.status(200).json(new ApiResponse(200, { product }, 'Product details retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      throw new ApiError(404, 'Product not found.');
    }

    return res.status(200).json(new ApiResponse(200, { product }, 'Product details retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      throw new ApiError(404, 'Product not found.');
    }

    const related = await Product.find({
      _id: { $ne: currentProduct._id },
      category: currentProduct.category,
      gender: currentProduct.gender,
      isActive: true,
    })
      .limit(6)
      .populate('category', 'name slug');

    return res.status(200).json(new ApiResponse(200, { products: related }, 'Related products fetched.'));
  } catch (error) {
    next(error);
  }
};

// Admin controllers
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    if (!productData.slug) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Verify slug uniqueness
    const existing = await Product.findOne({ slug: productData.slug });
    if (existing) {
      productData.slug = `${productData.slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.create(productData);

    return res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully.'));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new ApiError(404, 'Product not found.');
    }

    return res.status(200).json(new ApiResponse(200, { product }, 'Product updated successfully.'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new ApiError(404, 'Product not found.');
    }

    return res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully.'));
  } catch (error) {
    next(error);
  }
};
