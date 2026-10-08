import { Address } from '../models/Address.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { addresses }, 'Addresses retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, email, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      throw new ApiError(400, 'Please provide all required address fields.');
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || existingCount === 0;

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phone,
      email: email || req.user.email,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      country: country || 'India',
      isDefault: shouldBeDefault,
    });

    return res.status(201).json(new ApiResponse(201, { address }, 'Address added successfully.'));
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    let address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
      throw new ApiError(404, 'Address not found.');
    }

    Object.assign(address, req.body);
    await address.save();

    return res.status(200).json(new ApiResponse(200, { address }, 'Address updated successfully.'));
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

    if (!address) {
      throw new ApiError(404, 'Address not found.');
    }

    // If deleted address was default, make the newest remaining address default
    if (address.isDefault) {
      const nextDefault = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    return res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully.'));
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
      throw new ApiError(404, 'Address not found.');
    }

    address.isDefault = true;
    await address.save();

    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, { addresses }, 'Default address updated.'));
  } catch (error) {
    next(error);
  }
};
