const { Review, Order, Product } = require('../models');
const { paginate } = require('../utils/pagination');
const response = require('../utils/response');

exports.createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment, title } = req.body;

    // Verify purchase — user must have a delivered order containing this product
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      orderStatus: 'delivered',
      'items.product': productId,
    });

    if (!order) {
      return response.badRequest(res, 'You can only review products from delivered orders');
    }

    // Check for existing review
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return response.badRequest(res, 'You have already reviewed this product');
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating,
      title,
      comment,
      status: 'pending',
    });

    return response.created(res, { data: review }, 'Review submitted for moderation');
  } catch (error) {
    next(error);
  }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const query = Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'name');

    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });

    // Calculate average
    const stats = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: { $push: '$rating' },
        },
      },
    ]);

    return response.success(res, {
      data: result.data,
      pagination: result.pagination,
      stats: stats[0] || { averageRating: 0, totalReviews: 0 },
    });
  } catch (error) {
    next(error);
  }
};
