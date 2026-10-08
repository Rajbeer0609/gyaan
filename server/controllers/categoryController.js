import { Category } from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    const { gender } = req.query;
    const query = { isActive: true, parent: null };

    if (gender && gender !== 'all') {
      query.$or = [{ gender: 'all' }, { gender: gender.toLowerCase() }];
    }

    const categories = await Category.find(query)
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { sortOrder: 1, name: 1 } },
      })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return res.status(200).json(
      new ApiResponse(200, { categories }, 'Categories retrieved successfully.')
    );
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug: slug.toLowerCase(), isActive: true })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
      })
      .populate('parent');

    if (!category) {
      throw new ApiError(404, 'Category not found.');
    }

    return res.status(200).json(
      new ApiResponse(200, { category }, 'Category details retrieved.')
    );
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parent, gender, sortOrder } = req.body;

    if (!name) {
      throw new ApiError(400, 'Category name is required.');
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new ApiError(409, 'Category with this name or slug already exists.');
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      parent: parent || null,
      gender: gender || 'all',
      sortOrder: sortOrder || 0,
    });

    return res.status(201).json(
      new ApiResponse(201, { category }, 'Category created successfully.')
    );
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ApiError(404, 'Category not found.');
    }

    return res.status(200).json(
      new ApiResponse(200, { category }, 'Category updated successfully.')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new ApiError(404, 'Category not found.');
    }

    return res.status(200).json(
      new ApiResponse(200, null, 'Category deleted successfully.')
    );
  } catch (error) {
    next(error);
  }
};
