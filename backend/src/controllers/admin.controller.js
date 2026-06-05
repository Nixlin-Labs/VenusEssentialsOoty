const {
  Product, ProductVariant, Category, Order, User, Coupon, Review,
  CmsPage, Banner, Role, Settings, AuditLog, Payment, NewsletterSubscriber, Enquiry, Testimonial, Address,
} = require('../models');
const { paginate } = require('../utils/pagination');
const { generateUniqueSlug } = require('../utils/slugify');
const { processImage, deleteFile } = require('../middleware/upload');
const { createAuditLog } = require('../middleware/auditLogger');
const { sendDispatchEmail, sendRefundEmail } = require('../utils/email');
const response = require('../utils/response');

// ==================== DASHBOARD ====================

exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalOrders, monthlyOrders, totalRevenue, monthlyRevenue,
      totalCustomers, pendingOrders, lowStockCount, pendingReviews,
      recentOrders, topProducts,
    ] = await Promise.all([
      Order.countDocuments({ orderStatus: { $ne: 'pending_payment' } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'pending_payment' } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed'] } }),
      ProductVariant.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true }),
      Review.countDocuments({ status: 'pending' }),
      Order.find({ orderStatus: { $ne: 'pending_payment' } }).sort({ createdAt: -1 }).limit(10).select('orderNumber total orderStatus createdAt'),
      Product.find({ status: 'active' }).sort({ totalSold: -1 }).limit(5).select('name totalSold images'),
    ]);

    return response.success(res, {
      data: {
        totalOrders,
        monthlyOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalCustomers,
        pendingOrders,
        lowStockCount,
        pendingReviews,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) { next(error); }
};

// ==================== PRODUCTS ====================

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getProducts = async (req, res, next) => {
  try {
    const { status, category, search, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      const [matchingCategories, matchingVariants] = await Promise.all([
        Category.find({ name: regex }).select('_id'),
        ProductVariant.find({
          $or: [
            { name: regex },
            { sku: regex },
            { 'weight.unit': regex },
          ],
        }).select('product'),
      ]);

      filter.$or = [
        { name: regex },
        { slug: regex },
        { description: regex },
        { shortDescription: regex },
        { ingredients: regex },
        { status: regex },
        { hsnCode: regex },
        { tags: regex },
        { seoTitle: regex },
        { seoDescription: regex },
        { seoKeywords: regex },
        { 'specifications.key': regex },
        { 'specifications.value': regex },
        { category: { $in: matchingCategories.map((item) => item._id) } },
        { _id: { $in: matchingVariants.map((item) => item.product).filter(Boolean) } },
      ];
    }

    const query = Product.find(filter).populate('category', 'name').populate('variants');
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });

    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category').populate('variants');
    if (!product) return response.notFound(res, 'Product');
    return response.success(res, { data: product });
  } catch (error) { next(error); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    const slug = await generateUniqueSlug(Product, data.name);

    // Process images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filename = `${slug}-${Date.now()}-${i}`;
        const result = await processImage(file.buffer, 'products', filename);
        images.push({ url: result.url, alt: data.name, isPrimary: i === 0, sortOrder: i });
      }
    }

    const product = await Product.create({ ...data, slug, images });

    await createAuditLog({
      user: req.user, action: 'create', entity: 'product',
      entityId: product._id, entityName: product.name,
      description: `Created product: ${product.name}`, req,
    });

    return response.created(res, { data: product }, 'Product created');
  } catch (error) { next(error); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return response.notFound(res, 'Product');

    const data = JSON.parse(req.body.data || '{}');
    const previousValue = product.toObject();

    if (data.name && data.name !== product.name) {
      data.slug = await generateUniqueSlug(Product, data.name, product._id);
    }

    // Process new images
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        const filename = `${product.slug}-${Date.now()}-${i}`;
        const result = await processImage(req.files[i].buffer, 'products', filename);
        newImages.push({ url: result.url, alt: data.name || product.name, isPrimary: false, sortOrder: product.images.length + i });
      }
      data.images = [...(data.existingImages || product.images), ...newImages];
    } else if (data.existingImages) {
      data.images = data.existingImages;
    }

    const wasArchived = product.status === 'archived';
    Object.assign(product, data);
    await product.save();

    if (wasArchived && product.status !== 'archived') {
      await ProductVariant.updateMany({ product: product._id }, { isActive: true });
    }

    await createAuditLog({
      user: req.user, action: 'update', entity: 'product',
      entityId: product._id, entityName: product.name,
      previousValue, updatedValue: product.toObject(),
      description: `Updated product: ${product.name}`, req,
    });

    return response.success(res, { data: product }, 'Product updated');
  } catch (error) { next(error); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return response.notFound(res, 'Product');

    product.status = 'archived';
    await product.save();
    await ProductVariant.updateMany({ product: product._id }, { isActive: false });

    await createAuditLog({
      user: req.user, action: 'delete', entity: 'product',
      entityId: product._id, entityName: product.name,
      description: `Archived product: ${product.name}`, req,
    });

    return response.success(res, {}, 'Product archived');
  } catch (error) { next(error); }
};

// ==================== VARIANTS ====================

exports.createVariant = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return response.notFound(res, 'Product');

    const variant = await ProductVariant.create({ ...req.body, product: product._id });

    await createAuditLog({
      user: req.user, action: 'create', entity: 'inventory',
      entityId: variant._id, entityName: `${product.name} - ${variant.name}`,
      description: `Created variant: ${variant.name} for ${product.name}`, req,
    });

    return response.created(res, { data: variant }, 'Variant created');
  } catch (error) { next(error); }
};

exports.updateVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.id);
    if (!variant) return response.notFound(res, 'Variant');

    const previousValue = variant.toObject();
    Object.assign(variant, req.body);
    await variant.save();

    await createAuditLog({
      user: req.user, action: 'update', entity: 'inventory',
      entityId: variant._id, entityName: variant.name,
      previousValue, updatedValue: variant.toObject(), req,
    });

    return response.success(res, { data: variant }, 'Variant updated');
  } catch (error) { next(error); }
};

exports.deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!variant) return response.notFound(res, 'Variant');
    return response.success(res, {}, 'Variant deactivated');
  } catch (error) { next(error); }
};

// ==================== CATEGORIES ====================

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    return response.success(res, { data: categories });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = await generateUniqueSlug(Category, data.name);

    if (req.file) {
      const result = await processImage(req.file.buffer, 'categories', data.slug);
      data.image = { url: result.url, alt: data.name };
    }

    const category = await Category.create(data);
    return response.created(res, { data: category }, 'Category created');
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return response.notFound(res, 'Category');

    if (req.body.name && req.body.name !== category.name) {
      req.body.slug = await generateUniqueSlug(Category, req.body.name, category._id);
    }

    if (req.file) {
      const result = await processImage(req.file.buffer, 'categories', category.slug);
      req.body.image = { url: result.url, alt: req.body.name || category.name };
    }

    Object.assign(category, req.body);
    await category.save();

    return response.success(res, { data: category }, 'Category updated');
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id, status: 'active' });
    if (productCount > 0) {
      return response.badRequest(res, `Cannot delete category with ${productCount} active products`);
    }

    await Category.findByIdAndDelete(req.params.id);
    return response.success(res, {}, 'Category deleted');
  } catch (error) { next(error); }
};

// ==================== INVENTORY ====================

exports.getInventory = async (req, res, next) => {
  try {
    const { search, lowStock, page, limit } = req.query;
    const filter = { isActive: true };

    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    let query = ProductVariant.find(filter).populate('product', 'name slug images status');

    if (search) {
      const products = await Product.find({ name: new RegExp(search, 'i') }).select('_id');
      filter.product = { $in: products.map((p) => p._id) };
      query = ProductVariant.find(filter).populate('product', 'name slug images status');
    }

    const result = await paginate(query, { page, limit, sort: { stock: 1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock < 0) return response.badRequest(res, 'Stock cannot be negative');

    const variant = await ProductVariant.findById(req.params.variantId);
    if (!variant) return response.notFound(res, 'Variant');

    const previousStock = variant.stock;
    variant.stock = stock;
    await variant.save();

    await createAuditLog({
      user: req.user, action: 'stock_update', entity: 'inventory',
      entityId: variant._id, entityName: variant.name,
      previousValue: { stock: previousStock }, updatedValue: { stock },
      description: `Stock updated from ${previousStock} to ${stock}`, req,
    });

    return response.success(res, { data: variant }, 'Stock updated');
  } catch (error) { next(error); }
};

exports.getLowStockAlerts = async (req, res, next) => {
  try {
    const variants = await ProductVariant.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).populate('product', 'name slug images');

    return response.success(res, { data: variants });
  } catch (error) { next(error); }
};

// ==================== ORDERS ====================

exports.getOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, startDate, endDate, page, limit } = req.query;
    const filter = {};

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.$or = [
      { orderNumber: new RegExp(search, 'i') },
      { guestEmail: new RegExp(search, 'i') },
    ];
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const query = Order.find(filter).populate('user', 'name email phone');
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });

    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return response.notFound(res, 'Order');
    return response.success(res, { data: order });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, courierName, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return response.notFound(res, 'Order');

    const previousStatus = order.orderStatus;
    const validTransitions = {
      placed: ['confirmed', 'rejected', 'cancelled'],
      confirmed: ['packed', 'cancelled'],
      packed: ['dispatched', 'cancelled'],
      dispatched: ['delivered'],
      delivered: [],
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      return response.badRequest(res, `Cannot transition from ${order.orderStatus} to ${status}`);
    }

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || '', updatedBy: req.user._id });

    if (status === 'dispatched') {
      if (courierName) order.courierName = courierName;
      if (trackingNumber) order.trackingNumber = trackingNumber;

      // Send dispatch email
      const email = order.user
        ? (await User.findById(order.user))?.email
        : order.guestEmail;
      if (email) await sendDispatchEmail(email, order);
    }

    if (status === 'rejected' || status === 'cancelled') {
      order.cancelledBy = 'admin';
      // Restore stock
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(item.variant, { $inc: { stock: item.quantity } });
      }
    }

    await order.save();

    await createAuditLog({
      user: req.user, action: 'status_change', entity: 'order',
      entityId: order._id, entityName: order.orderNumber,
      previousValue: { status: previousStatus }, updatedValue: { status },
      description: `Order ${order.orderNumber} status: ${previousStatus} → ${status}`, req,
    });

    return response.success(res, { data: order }, 'Order status updated');
  } catch (error) { next(error); }
};

exports.processRefund = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return response.notFound(res, 'Order');

    if (order.paymentStatus !== 'paid') {
      return response.badRequest(res, 'Order payment not captured');
    }

    const refundAmount = amount || order.total;
    const payment = await Payment.findOne({ order: order._id, status: 'captured' });

    if (payment) {
      try {
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100),
        });
        payment.refundId = refund.id;
        payment.refundAmount = refundAmount;
        payment.refundStatus = 'processed';
        payment.refundedAt = new Date();
        await payment.save();
      } catch (refundError) {
        return response.error(res, `Refund failed: ${refundError.message}`);
      }
    }

    order.refundAmount = refundAmount;
    order.refundStatus = 'processed';
    order.paymentStatus = refundAmount >= order.total ? 'refunded' : 'partially_refunded';
    order.orderStatus = 'refunded';
    order.statusHistory.push({ status: 'refunded', note: `Refund of ₹${refundAmount} processed`, updatedBy: req.user._id });
    await order.save();

    // Send refund email
    const email = order.user ? (await User.findById(order.user))?.email : order.guestEmail;
    if (email) await sendRefundEmail(email, order, refundAmount);

    await createAuditLog({
      user: req.user, action: 'refund', entity: 'order',
      entityId: order._id, entityName: order.orderNumber,
      description: `Refund of ₹${refundAmount} processed for ${order.orderNumber}`, req,
    });

    return response.success(res, { data: order }, 'Refund processed');
  } catch (error) { next(error); }
};

// ==================== CUSTOMERS ====================

exports.getCustomers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];

    const query = User.find(filter).select('-password -otp -refreshTokens');
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-password -otp -refreshTokens');
    if (!customer) return response.notFound(res, 'Customer');

    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 }).limit(20);
    const addresses = await Address.find({ user: customer._id }).sort({ isDefault: -1, createdAt: -1 });
    return response.success(res, { data: { customer, orders, addresses } });
  } catch (error) { next(error); }
};

exports.toggleBlockCustomer = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return response.notFound(res, 'Customer');

    customer.isBlocked = !customer.isBlocked;
    if (customer.isBlocked) customer.refreshTokens = [];
    await customer.save();

    await createAuditLog({
      user: req.user,
      action: customer.isBlocked ? 'block' : 'unblock',
      entity: 'user', entityId: customer._id, entityName: customer.name,
      description: `${customer.isBlocked ? 'Blocked' : 'Unblocked'} customer: ${customer.name}`, req,
    });

    return response.success(res, { data: { isBlocked: customer.isBlocked } },
      `Customer ${customer.isBlocked ? 'blocked' : 'unblocked'}`);
  } catch (error) { next(error); }
};

// ==================== COUPONS ====================

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return response.success(res, { data: coupons });
  } catch (error) { next(error); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    return response.created(res, { data: coupon }, 'Coupon created');
  } catch (error) { next(error); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return response.notFound(res, 'Coupon');
    return response.success(res, { data: coupon }, 'Coupon updated');
  } catch (error) { next(error); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    return response.success(res, {}, 'Coupon deleted');
  } catch (error) { next(error); }
};

// ==================== REVIEWS ====================

exports.getReviews = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const query = Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name slug');
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.moderateReview = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return response.notFound(res, 'Review');

    review.status = action === 'approve' ? 'approved' : 'rejected';
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    if (action === 'reject') review.rejectionReason = rejectionReason || '';
    await review.save();

    // Update product rating
    if (action === 'approve') {
      const stats = await Review.aggregate([
        { $match: { product: review.product, status: 'approved' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats[0]) {
        await Product.findByIdAndUpdate(review.product, {
          averageRating: Math.round(stats[0].avg * 10) / 10,
          totalReviews: stats[0].count,
        });
      }
    }

    return response.success(res, { data: review }, `Review ${review.status}`);
  } catch (error) { next(error); }
};

// ==================== CMS PAGES ====================

exports.getCmsPages = async (req, res, next) => {
  try {
    const pages = await CmsPage.find().sort({ sortOrder: 1 });
    return response.success(res, { data: pages });
  } catch (error) { next(error); }
};

exports.createCmsPage = async (req, res, next) => {
  try {
    req.body.slug = await generateUniqueSlug(CmsPage, req.body.title);
    const page = await CmsPage.create(req.body);
    return response.created(res, { data: page }, 'Page created');
  } catch (error) { next(error); }
};

exports.updateCmsPage = async (req, res, next) => {
  try {
    const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return response.notFound(res, 'Page');
    return response.success(res, { data: page }, 'Page updated');
  } catch (error) { next(error); }
};

exports.deleteCmsPage = async (req, res, next) => {
  try {
    await CmsPage.findByIdAndDelete(req.params.id);
    return response.success(res, {}, 'Page deleted');
  } catch (error) { next(error); }
};

// ==================== BANNERS ====================

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ position: 1, sortOrder: 1 });
    return response.success(res, { data: banners });
  } catch (error) { next(error); }
};

exports.createBanner = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file) {
      const result = await processImage(req.file.buffer, 'banners', `banner-${Date.now()}`);
      data.image = { url: result.url, alt: data.title };
    }
    const banner = await Banner.create(data);
    return response.created(res, { data: banner }, 'Banner created');
  } catch (error) { next(error); }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return response.notFound(res, 'Banner');

    if (req.file) {
      const result = await processImage(req.file.buffer, 'banners', `banner-${Date.now()}`);
      req.body.image = { url: result.url, alt: req.body.title || banner.title };
    }

    Object.assign(banner, req.body);
    await banner.save();
    return response.success(res, { data: banner }, 'Banner updated');
  } catch (error) { next(error); }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return response.notFound(res, 'Banner');
    if (banner.image?.url) deleteFile(banner.image.url);
    return response.success(res, {}, 'Banner deleted');
  } catch (error) { next(error); }
};

// ==================== REPORTS ====================

exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const match = { paymentStatus: 'paid' };
    if (startDate) match.createdAt = { $gte: new Date(startDate) };
    if (endDate) match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };

    const groupFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const report = await Order.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
      }},
      { $sort: { _id: 1 } },
    ]);

    return response.success(res, { data: report });
  } catch (error) { next(error); }
};

exports.getRevenueReport = async (req, res, next) => {
  try {
    const report = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        totalGST: { $sum: '$gst.total' },
        totalShipping: { $sum: '$shippingCharge' },
        totalDiscount: { $sum: '$discount' },
        avgOrderValue: { $avg: '$total' },
      }},
    ]);
    return response.success(res, { data: report[0] || {} });
  } catch (error) { next(error); }
};

exports.getProductReport = async (req, res, next) => {
  try {
    const topProducts = await Product.find({ status: 'active' })
      .sort({ totalSold: -1 }).limit(20).select('name totalSold averageRating images');
    return response.success(res, { data: topProducts });
  } catch (error) { next(error); }
};

// ==================== ROLES ====================

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    return response.success(res, { data: roles });
  } catch (error) { next(error); }
};

exports.createRole = async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    return response.created(res, { data: role });
  } catch (error) { next(error); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return response.notFound(res, 'Role');
    return response.success(res, { data: role });
  } catch (error) { next(error); }
};

// ==================== ADMIN USERS ====================

exports.getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'customer' } }).select('-password -otp -refreshTokens');
    return response.success(res, { data: users });
  } catch (error) { next(error); }
};

exports.createAdminUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const user = await User.create({ name, email, phone, password, role, isVerified: true });

    await createAuditLog({
      user: req.user, action: 'create', entity: 'user',
      entityId: user._id, entityName: user.name,
      description: `Created admin user: ${user.name} (${role})`, req,
    });

    return response.created(res, { data: user.toSafeJSON() });
  } catch (error) { next(error); }
};

exports.updateAdminUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password -otp -refreshTokens');
    if (!user) return response.notFound(res, 'User');
    return response.success(res, { data: user });
  } catch (error) { next(error); }
};

// ==================== SETTINGS ====================

exports.getSettings = async (req, res, next) => {
  try {
    const dbSettings = await Settings.find();

    const settings = {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      whatsapp: '',
      storeAddress: '',
      gstNumber: '',
      shippingFreeAbove: 500,
      shippingCharge: 50,
      gstPercentage: 18,
      currency: 'INR',
      socialMedia: {
        instagram: '',
        facebook: '',
        youtube: '',
      },
    };

    const keyMap = {
      company_name: 'storeName',
      company_email: 'storeEmail',
      company_phone: 'storePhone',
      whatsapp_number: 'whatsapp',
      company_address: 'storeAddress',
      gst_number: 'gstNumber',
      free_shipping_threshold: 'shippingFreeAbove',
      default_shipping_charge: 'shippingCharge',
      default_gst_percentage: 'gstPercentage',
      currency: 'currency',
    };

    dbSettings.forEach((item) => {
      if (keyMap[item.key]) {
        settings[keyMap[item.key]] = item.value;
      }

      if (item.key === 'instagram_url') {
        settings.socialMedia.instagram = item.value;
      }

      if (item.key === 'facebook_url') {
        settings.socialMedia.facebook = item.value;
      }

      if (item.key === 'youtube_url') {
        settings.socialMedia.youtube = item.value;
      }
    });

    return response.success(res, {
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    console.log('settings', req.body);

const settingsMap = {
  storeName: {
    key: 'company_name',
    group: 'general',
    label: 'Company Name',
  },
  storeEmail: {
    key: 'company_email',
    group: 'contact',
    label: 'Email',
  },
  storePhone: {
    key: 'company_phone',
    group: 'contact',
    label: 'Phone',
  },
  storeAddress: {
    key: 'company_address',
    group: 'general',
    label: 'Company Address',
  },

  // These already exist in DB
  gstNumber: {
    key: 'gst_number',
    group: 'tax',
    label: 'GST Number',
  },
  gstPercentage: {
    key: 'default_gst_percentage',
    group: 'tax',
    label: 'Default GST %',
  },
  shippingFreeAbove: {
    key: 'free_shipping_threshold',
    group: 'shipping',
    label: 'Free Shipping Threshold (₹)',
  },
  shippingCharge: {
    key: 'default_shipping_charge',
    group: 'shipping',
    label: 'Default Shipping Charge (₹)',
  },

  // Missing in DB currently - will be auto-created
  whatsapp: {
    key: 'whatsapp_number',
    group: 'contact',
    label: 'WhatsApp Number',
  },
  currency: {
    key: 'currency',
    group: 'general',
    label: 'Currency',
  },

  // SEO settings already exist
  siteTitle: {
    key: 'site_title',
    group: 'seo',
    label: 'Site Title',
  },
  siteDescription: {
    key: 'site_description',
    group: 'seo',
    label: 'Site Description',
  },
};

const socialMediaMap = {
  instagram: {
    key: 'instagram_url',
    group: 'social',
    label: 'Instagram URL',
  },
  facebook: {
    key: 'facebook_url',
    group: 'social',
    label: 'Facebook URL',
  },
  youtube: {
    key: 'youtube_url',
    group: 'social',
    label: 'YouTube URL',
  },
};

for (const [field, config] of Object.entries(settingsMap)) {
  if (settings[field] !== undefined) {
    await Settings.findOneAndUpdate(
      { key: config.key },
      {
        value: settings[field],
        group: config.group,
        label: config.label,
      },
      { upsert: true }
    );
  }
}

if (settings.socialMedia) {
  for (const [field, config] of Object.entries(socialMediaMap)) {
    await Settings.findOneAndUpdate(
      { key: config.key },
      {
        value: settings.socialMedia[field] || '',
        group: config.group,
        label: config.label,
      },
      { upsert: true }
    );
  }
}

    await createAuditLog({
      user: req.user,
      action: 'settings_update',
      entity: 'settings',
      entityId: req.user._id,
      entityName: 'Platform Settings',
      description: 'Updated platform settings',
      req,
    });

    return response.success(res, {}, 'Settings updated');
  } catch (error) {
    next(error);
  }
};

// ==================== AUDIT LOGS ====================

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { entity, action, page, limit } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (action) filter.action = action;

    const query = AuditLog.find(filter);
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

// ==================== NEWSLETTER SUBSCRIBERS ====================

exports.getNewsletterSubscribers = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const filter = {};
    if (search) filter.email = new RegExp(search, 'i');
    if (status === 'active') filter.isActive = true;
    if (status === 'unsubscribed') filter.isActive = false;

    const query = NewsletterSubscriber.find(filter);
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.deleteNewsletterSubscriber = async (req, res, next) => {
  try {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) return response.notFound(res, 'Subscriber');
    return response.success(res, {}, 'Subscriber removed');
  } catch (error) { next(error); }
};

exports.toggleNewsletterSubscriber = async (req, res, next) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);
    if (!subscriber) return response.notFound(res, 'Subscriber');
    subscriber.isActive = !subscriber.isActive;
    subscriber.unsubscribedAt = subscriber.isActive ? null : new Date();
    await subscriber.save();
    return response.success(res, { data: subscriber }, `Subscriber ${subscriber.isActive ? 'reactivated' : 'unsubscribed'}`);
  } catch (error) { next(error); }
};

// ==================== ENQUIRIES ====================

exports.getEnquiries = async (req, res, next) => {
  try {
    const { search, isRead, page, limit } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') }
      ];
    }
    if (isRead !== undefined && isRead !== '') {
      filter.isRead = isRead === 'true';
    }

    const query = Enquiry.find(filter);
    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};

exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return response.notFound(res, 'Enquiry');
    return response.success(res, {}, 'Enquiry deleted successfully');
  } catch (error) { next(error); }
};

exports.toggleEnquiryRead = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return response.notFound(res, 'Enquiry');
    enquiry.isRead = !enquiry.isRead;
    await enquiry.save();
    return response.success(res, { data: enquiry }, `Enquiry marked as ${enquiry.isRead ? 'read' : 'unread'}`);
  } catch (error) { next(error); }
};

// ==================== TESTIMONIALS ====================

exports.getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 });
    return response.success(res, { data: testimonials });
  } catch (error) { next(error); }
};

exports.createTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    return response.created(res, { data: testimonial }, 'Testimonial created');
  } catch (error) { next(error); }
};

exports.updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!testimonial) return response.notFound(res, 'Testimonial');
    return response.success(res, { data: testimonial }, 'Testimonial updated');
  } catch (error) { next(error); }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return response.notFound(res, 'Testimonial');
    return response.success(res, {}, 'Testimonial deleted');
  } catch (error) { next(error); }
};

exports.toggleTestimonialStatus = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return response.notFound(res, 'Testimonial');
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    return response.success(res, { data: testimonial }, `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) { next(error); }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let query = Payment.find(filter)
      .populate({
        path: 'order',
        select: 'orderNumber user total orderStatus createdAt guestName guestEmail guestPhone',
        populate: {
          path: 'user',
          select: 'name email phone mobile'
        }
      });

    if (search) {
      filter.$or = [
        { razorpayOrderId: new RegExp(search, 'i') },
        { razorpayPaymentId: new RegExp(search, 'i') },
        { status: new RegExp(search, 'i') },
        { method: new RegExp(search, 'i') }
      ];
      query = Payment.find(filter)
        .populate({
          path: 'order',
          select: 'orderNumber user total orderStatus createdAt guestName guestEmail guestPhone',
          populate: {
            path: 'user',
            select: 'name email phone mobile'
          }
        });
    }

    const result = await paginate(query, { page, limit, sort: { createdAt: -1 } });
    return response.success(res, { data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
};
