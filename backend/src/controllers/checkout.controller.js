const { ProductVariant, Product, Coupon } = require('../models');
const env = require('../config/env');
const response = require('../utils/response');

/**
 * POST /api/checkout/validate — Validate cart items stock and address.
 */
exports.validateCheckout = async (req, res, next) => {
  try {
    const { items, address } = req.body;
    const errors = [];

    if (!items || items.length === 0) {
      return response.badRequest(res, 'Cart is empty');
    }

    // Validate stock for each item
    for (const item of items) {
      const variant = await ProductVariant.findById(item.variantId).populate('product', 'name status');
      if (!variant) {
        errors.push({ variantId: item.variantId, message: 'Product variant no longer available' });
        continue;
      }
      if (!variant.isActive || variant.product.status !== 'active') {
        errors.push({ variantId: item.variantId, message: `${variant.product.name} is no longer available` });
        continue;
      }
      if (variant.stock < item.quantity) {
        errors.push({
          variantId: item.variantId,
          message: variant.stock === 0
            ? `${variant.product.name} - ${variant.name} is out of stock`
            : `Only ${variant.stock} units of ${variant.product.name} - ${variant.name} available`,
          availableStock: variant.stock,
        });
      }
    }

    // Validate address
    if (address) {
      const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
      for (const field of requiredFields) {
        if (!address[field]) {
          errors.push({ field, message: `${field} is required` });
        }
      }
      if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
        errors.push({ field: 'pincode', message: 'Invalid pincode format' });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    return response.success(res, {}, 'Checkout validated');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/checkout/apply-coupon
 */
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return response.badRequest(res, 'Invalid coupon code');
    }

    const userId = req.user ? req.user._id : null;
    const validation = coupon.isValid(subtotal || 0, userId);
    if (!validation.valid) {
      return response.badRequest(res, validation.message);
    }

    const discount = coupon.calculateDiscount(subtotal || 0);

    return response.success(res, {
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount,
          freeShipping: coupon.freeShipping,
        },
      },
    }, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/checkout/remove-coupon
 */
exports.removeCoupon = async (req, res, next) => {
  try {
    return response.success(res, { data: { coupon: null } }, 'Coupon removed');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/checkout/calculate — Calculate cart totals with GST and shipping.
 */
exports.calculateTotals = async (req, res, next) => {
  try {
    const { items, couponCode } = req.body;

    if (!items || items.length === 0) {
      return response.badRequest(res, 'Cart is empty');
    }

    let subtotal = 0;
    let totalGST = 0;
    const calculatedItems = [];

    for (const item of items) {
      const variant = await ProductVariant.findById(item.variantId);
      const product = await Product.findById(item.productId);
      if (!variant || !product) continue;

      const effectivePrice = variant.offerPrice && variant.offerPrice < variant.price
        ? variant.offerPrice
        : variant.price;

      const itemTotal = effectivePrice * item.quantity;
      const gstAmount = (itemTotal * product.gstPercentage) / (100 + product.gstPercentage);

      subtotal += itemTotal;
      totalGST += gstAmount;

      calculatedItems.push({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        variantName: variant.name,
        price: variant.price,
        offerPrice: variant.offerPrice,
        effectivePrice,
        quantity: item.quantity,
        total: itemTotal,
        gst: gstAmount,
        gstPercentage: product.gstPercentage,
      });
    }

    // Coupon discount
    let discount = 0;
    let couponData = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const userId = req.user ? req.user._id : null;
        const validation = coupon.isValid(subtotal, userId);
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          couponData = { code: coupon.code, type: coupon.type, value: coupon.value, discount, freeShipping: coupon.freeShipping };
        }
      }
    }

    // Shipping
    const isFreeShipping = (couponData && couponData.freeShipping) || subtotal >= env.FREE_SHIPPING_THRESHOLD;
    const shippingCharge = isFreeShipping ? 0 : env.DEFAULT_SHIPPING_CHARGE;

    // GST breakdown (CGST/SGST split evenly for intra-state)
    const cgst = totalGST / 2;
    const sgst = totalGST / 2;

    const total = subtotal - discount + shippingCharge;

    return response.success(res, {
      data: {
        items: calculatedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        gst: {
          cgst: Math.round(cgst * 100) / 100,
          sgst: Math.round(sgst * 100) / 100,
          total: Math.round(totalGST * 100) / 100,
        },
        discount: Math.round(discount * 100) / 100,
        shippingCharge,
        total: Math.round(total * 100) / 100,
        coupon: couponData,
        isFreeShipping,
      },
    });
  } catch (error) {
    next(error);
  }
};
