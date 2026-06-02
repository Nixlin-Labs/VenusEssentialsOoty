const { Product, ProductVariant, Category } = require('../models');
const { paginate, buildSort } = require('../utils/pagination');
const response = require('../utils/response');

/**
 * GET /api/products
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, inStock, sort, search, page, limit, isBestSeller, showInBestSellers } = req.query;

    const filter = { status: 'active' };

    if (category) {
      const cat = await Category.findOne({ slug: category, isActive: true });
      if (cat) filter.category = cat._id;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (isBestSeller === 'true') {
      filter.isBestSeller = true;
    }

    if (showInBestSellers === 'true') {
      filter.showInBestSellers = true;
    }

    let query = Product.find(filter)
      .populate('category', 'name slug')
      .populate('variants');

    const sortObj = buildSort(sort);
    const result = await paginate(query, { page, limit, sort: sortObj });

    // Filter by price/stock after population
    let products = result.data;

    if (minPrice || maxPrice) {
      products = products.filter((p) => {
        const variants = p.variants || [];
        const minVariantPrice = Math.min(...variants.map((v) => v.effectivePrice || v.price));
        if (minPrice && minVariantPrice < parseFloat(minPrice)) return false;
        if (maxPrice && minVariantPrice > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    if (inStock === 'true') {
      products = products.filter((p) => {
        const variants = p.variants || [];
        return variants.some((v) => v.stock > 0);
      });
    }

    return response.success(res, {
      data: products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/featured
 */
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active', isFeatured: true })
      .populate('category', 'name slug')
      .populate('variants')
      .sort({ sortOrder: 1 })
      .limit(12);

    return response.success(res, { data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/best-sellers
 */
exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active', isBestSeller: true })
      .populate('category', 'name slug')
      .populate('variants')
      .sort({ totalSold: -1 })
      .limit(12);

    return response.success(res, { data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/new-arrivals
 */
exports.getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active', isNewArrival: true })
      .populate('category', 'name slug')
      .populate('variants')
      .sort({ createdAt: -1 })
      .limit(12);

    return response.success(res, { data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/search
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return response.success(res, { data: [] });
    }

    const regex = new RegExp(q, 'i');
    const products = await Product.find({
      status: 'active',
      $or: [
        { name: regex },
        { tags: regex },
        { description: regex },
      ],
    })
      .populate('category', 'name slug')
      .populate('variants')
      .select('name slug images category')
      .limit(parseInt(limit))
      .sort({ totalSold: -1 });

    return response.success(res, { data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:slug
 */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
      .populate('category', 'name slug')
      .populate('variants')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name' },
        options: { sort: { createdAt: -1 }, limit: 20 },
      });

    if (!product) {
      return response.notFound(res, 'Product');
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'active',
    })
      .populate('variants')
      .limit(8);

    return response.success(res, {
      data: { product, relatedProducts },
    });
  } catch (error) {
    next(error);
  }
};
