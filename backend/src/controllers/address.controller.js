const { Address } = require('../models');
const response = require('../utils/response');

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return response.success(res, { data: addresses });
  } catch (error) { next(error); }
};

exports.createAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, type, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const addressCount = await Address.countDocuments({ user: req.user._id });
    const address = await Address.create({
      user: req.user._id,
      fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, type,
      isDefault: isDefault || addressCount === 0,
    });

    return response.created(res, { data: address }, 'Address added');
  } catch (error) { next(error); }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!address) return response.notFound(res, 'Address');
    return response.success(res, { data: address }, 'Address updated');
  } catch (error) { next(error); }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return response.notFound(res, 'Address');

    if (address.isDefault) {
      const firstAddress = await Address.findOne({ user: req.user._id });
      if (firstAddress) { firstAddress.isDefault = true; await firstAddress.save(); }
    }

    return response.success(res, {}, 'Address deleted');
  } catch (error) { next(error); }
};

exports.setDefault = async (req, res, next) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return response.notFound(res, 'Address');
    return response.success(res, { data: address }, 'Default address updated');
  } catch (error) { next(error); }
};
