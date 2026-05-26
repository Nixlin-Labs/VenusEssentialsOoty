const { CmsPage, Banner, Product, Category } = require('../models');
const response = require('../utils/response');

exports.getPage = async (req, res, next) => {
  try {
    const page = await CmsPage.findOne({ slug: req.params.slug, isActive: true });
    if (!page) return response.notFound(res, 'Page');
    return response.success(res, { data: page });
  } catch (error) { next(error); }
};

exports.getBanners = async (req, res, next) => {
  try {
    const { position } = req.query;
    const filter = { isActive: true };
    if (position) filter.position = position;

    // Check expiry
    const now = new Date();
    filter.$or = [
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ];

    const banners = await Banner.find(filter).sort({ sortOrder: 1 });
    return response.success(res, { data: banners });
  } catch (error) { next(error); }
};

exports.getHomepageData = async (req, res, next) => {
  try {
    const [heroBanners, featuredProducts, bestSellers, newArrivals, categories] = await Promise.all([
      Banner.find({ position: 'hero', isActive: true }).sort({ sortOrder: 1 }).limit(5),
      Product.find({ status: 'active', isFeatured: true }).populate('variants').sort({ sortOrder: 1 }).limit(8),
      Product.find({ status: 'active', isBestSeller: true }).populate('variants').sort({ totalSold: -1 }).limit(8),
      Product.find({ status: 'active', isNewArrival: true }).populate('variants').sort({ createdAt: -1 }).limit(8),
      Category.find({ isActive: true }).sort({ sortOrder: 1 }),
    ]);

    return response.success(res, {
      data: { heroBanners, featuredProducts, bestSellers, newArrivals, categories },
    });
  } catch (error) { next(error); }
};
