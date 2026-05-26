/**
 * Paginate a Mongoose query.
 * @param {object} query - Mongoose query
 * @param {object} options - { page, limit, sort }
 * @returns {object} - { data, pagination }
 */
const paginate = async (query, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 12));
  const sort = options.sort || { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    query.clone().sort(sort).skip(skip).limit(limit),
    query.clone().countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Build sort object from query string.
 * @param {string} sortString - e.g., "price_asc", "createdAt_desc"
 * @returns {object} - Mongoose sort object
 */
const buildSort = (sortString) => {
  const sortMap = {
    price_asc: { 'variants.effectivePrice': 1 },
    price_desc: { 'variants.effectivePrice': -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    best_sellers: { totalSold: -1 },
    rating: { averageRating: -1 },
  };

  return sortMap[sortString] || { createdAt: -1 };
};

module.exports = { paginate, buildSort };
