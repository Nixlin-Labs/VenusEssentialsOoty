const { User, Product, ProductVariant, Cart } = require('../models');
const response = require('../utils/response');

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        match: { status: 'active' },
        populate: { path: 'variants', match: { isActive: true } },
      });

    return response.success(res, { data: user.wishlist || [] });
  } catch (error) { next(error); }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    let action;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      const product = await Product.findById(productId);
      if (!product || product.status !== 'active') return response.notFound(res, 'Product');
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();
    return response.success(res, { data: { action, wishlist: user.wishlist } }, `Product ${action} to wishlist`);
  } catch (error) { next(error); }
};

exports.moveToCart = async (req, res, next) => {
  try {
    const { productId, variantId } = req.body;

    const variant = await ProductVariant.findOne({ _id: variantId, product: productId, isActive: true });
    if (!variant || variant.stock === 0) return response.badRequest(res, 'Product is out of stock');

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.findIndex((i) => i.variant.toString() === variantId);
    if (existing === -1) {
      cart.items.push({ product: productId, variant: variantId, quantity: 1 });
    }
    await cart.save();

    // Remove from wishlist
    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: productId } });

    return response.success(res, {}, 'Moved to cart');
  } catch (error) { next(error); }
};
