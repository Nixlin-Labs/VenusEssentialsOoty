const { Category, Product } = require('../models');
const response = require('../utils/response');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 });
    return response.success(res, { data: categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return response.notFound(res, 'Category');

    return response.success(res, { data: category });
  } catch (error) {
    next(error);
  }
};
