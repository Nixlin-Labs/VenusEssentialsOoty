const { Cart, ProductVariant, Product } = require('../models');
const response = require('../utils/response');

/**
 * GET /api/cart — Get user's cart with populated products/variants.
 */
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug images gstPercentage hsnCode status',
      })
      .populate({
        path: 'items.variant',
        select: 'name sku price offerPrice weight stock isActive',
      })
      .populate('coupon');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items with inactive products/variants
    const validItems = cart.items.filter(
      (item) => item.product && item.product.status === 'active' && item.variant && item.variant.isActive
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    return response.success(res, { data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/add — Add item to cart.
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;

    // Validate product and variant
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return response.notFound(res, 'Product');
    }

    const variant = await ProductVariant.findOne({ _id: variantId, product: productId, isActive: true });
    if (!variant) {
      return response.notFound(res, 'Variant');
    }

    // Check stock
    if (variant.stock < quantity) {
      return response.badRequest(res, `Only ${variant.stock} items available in stock`);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.variant.toString() === variantId
    );

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > variant.stock) {
        return response.badRequest(res, `Only ${variant.stock} items available in stock`);
      }
      if (newQuantity > 10) {
        return response.badRequest(res, 'Maximum 10 items per product');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, variant: variantId, quantity });
    }

    await cart.save();

    // Re-fetch with population
    cart = await Cart.findById(cart._id)
      .populate({ path: 'items.product', select: 'name slug images gstPercentage hsnCode status' })
      .populate({ path: 'items.variant', select: 'name sku price offerPrice weight stock isActive' });

    return response.success(res, { data: cart }, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cart/update — Update item quantity.
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { variantId, quantity } = req.body;

    const variant = await ProductVariant.findById(variantId);
    if (!variant) return response.notFound(res, 'Variant');

    if (variant.stock < quantity) {
      return response.badRequest(res, `Only ${variant.stock} items available in stock`);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return response.notFound(res, 'Cart');

    const itemIndex = cart.items.findIndex(
      (item) => item.variant.toString() === variantId
    );

    if (itemIndex === -1) {
      return response.notFound(res, 'Cart item');
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({ path: 'items.product', select: 'name slug images gstPercentage hsnCode status' })
      .populate({ path: 'items.variant', select: 'name sku price offerPrice weight stock isActive' });

    return response.success(res, { data: updatedCart }, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/remove/:variantId
 */
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return response.notFound(res, 'Cart');

    cart.items = cart.items.filter(
      (item) => item.variant.toString() !== req.params.variantId
    );
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({ path: 'items.product', select: 'name slug images gstPercentage hsnCode status' })
      .populate({ path: 'items.variant', select: 'name sku price offerPrice weight stock isActive' });

    return response.success(res, { data: updatedCart }, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/sync — Sync guest cart to user cart on login.
 */
exports.syncGuestCart = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, variantId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.success(res, {}, 'No items to sync');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const guestItem of items) {
      const variant = await ProductVariant.findOne({
        _id: guestItem.variantId,
        product: guestItem.productId,
        isActive: true,
      });
      if (!variant) continue;

      const existingIndex = cart.items.findIndex(
        (item) => item.variant.toString() === guestItem.variantId
      );

      const quantity = Math.min(guestItem.quantity, variant.stock, 10);
      if (quantity <= 0) continue;

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          cart.items[existingIndex].quantity + quantity,
          variant.stock,
          10
        );
      } else {
        cart.items.push({
          product: guestItem.productId,
          variant: guestItem.variantId,
          quantity,
        });
      }
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate({ path: 'items.product', select: 'name slug images gstPercentage hsnCode status' })
      .populate({ path: 'items.variant', select: 'name sku price offerPrice weight stock isActive' });

    return response.success(res, { data: updatedCart }, 'Cart synced successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/clear
 */
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
    return response.success(res, {}, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};
