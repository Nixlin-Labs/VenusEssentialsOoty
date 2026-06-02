'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useWishlistStore from '@/store/useWishlistStore';
import useAuthStore from '@/store/useAuthStore';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.data.product);
        setRelatedProducts(data.data.relatedProducts || []);
        const variants = data.data.product.variants || [];
        setSelectedVariant(variants.find((v) => v.isDefault) || variants[0] || null);
      } catch (error) {
        console.error('Product fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-wide py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
            <div className="skeleton h-6 w-1/4 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-wide py-20 text-center">
        <span className="text-5xl">😕</span>
        <h2 className="heading-section mt-4">Product Not Found</h2>
      </div>
    );
  }

  const effectivePrice = selectedVariant?.offerPrice && selectedVariant.offerPrice < selectedVariant.price
    ? selectedVariant.offerPrice : selectedVariant?.price || 0;
  const discount = selectedVariant?.offerPrice && selectedVariant.offerPrice < selectedVariant.price
    ? Math.round(((selectedVariant.price - selectedVariant.offerPrice) / selectedVariant.price) * 100)
    : 0;
  const isOutOfStock = selectedVariant && selectedVariant.stock === 0;
  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return;
    const result = await addItem(product, selectedVariant, quantity, isAuthenticated);
    if (result.success) {
      toast.success('Added to bag!');
      openCart();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="container-wide py-4">
        <nav className="text-xs text-muted flex items-center gap-2" id="breadcrumb">
          <a href="/" className="hover:text-forest-700">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-forest-700">Shop</a>
          <span>/</span>
          {product.category && (
            <>
              <a href={`/categories/${product.category.slug}`} className="hover:text-forest-700">{product.category.name}</a>
              <span>/</span>
            </>
          )}
          <span className="text-charcoal-700">{product.name}</span>
        </nav>
      </div>

      <div className="container-wide pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-sand-50 rounded-xl overflow-hidden"
            >
              {product.images?.[selectedImage] ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${product.images[selectedImage].url}`}
                  alt={product.images[selectedImage].alt || product.name}
                  className="w-full h-full object-cover"
                  id="product-main-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-20">🌿</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-forest-800' : 'border-transparent hover:border-sand-300'
                    }`}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img.url}`}
                      alt={img.alt || ''}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-3">
              {product.isNewArrival && <span className="badge badge-primary">New Arrival</span>}
              {product.isBestSeller && <span className="badge badge-accent">Best Seller</span>}
              {discount > 0 && <span className="badge badge-discount">-{discount}% OFF</span>}
            </div>

            {/* Category */}
            {product.category && (
              <p className="label text-sand-600 mb-2">{product.category.name}</p>
            )}

            {/* Name */}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900 leading-tight" id="product-name">
              {product.name}
            </h1>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill={i < Math.round(product.averageRating) ? '#D4A843' : '#D6D9D7'}>
                      <path d="M10 1l2.39 4.84L17.3 6.7l-3.65 3.56.86 5.03L10 13.02l-4.51 2.27.86-5.03L2.7 6.7l4.91-.86L10 1z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-muted">({product.totalReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="price-display text-3xl">₹{effectivePrice}</span>
              {discount > 0 && <span className="price-strike text-lg">₹{selectedVariant?.price}</span>}
              {discount > 0 && <span className="text-sm text-success font-semibold">Save ₹{(selectedVariant.price - selectedVariant.offerPrice).toFixed(0)}</span>}
            </div>
            <p className="text-xs text-muted mt-1">Inclusive of all taxes</p>

            <hr className="divider my-6" />

            {/* Variant Selector */}
            {product.variants?.length > 1 && (
              <div className="mb-6">
                <h3 className="label mb-3">Select Size / Weight</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter((v) => v.isActive).map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => { setSelectedVariant(variant); setQuantity(1); }}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariant?._id === variant._id
                          ? 'border-forest-800 bg-forest-50 text-forest-800'
                          : variant.stock === 0
                            ? 'border-charcoal-100 text-charcoal-300 cursor-not-allowed line-through'
                            : 'border-border hover:border-forest-300 text-charcoal-700'
                      }`}
                      id={`variant-${variant.sku}`}
                    >
                      {variant.name}
                      {variant.weight && (
                        <span className="block text-[10px] text-muted mt-0.5">{variant.weight.value}{variant.weight.unit}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:bg-sand-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(quantity + 1, selectedVariant?.stock || 10, 10))}
                  className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:bg-sand-50 transition-colors"
                  disabled={quantity >= (selectedVariant?.stock || 10) || quantity >= 10}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedVariant}
                className="btn btn-primary btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                id="add-to-cart-btn"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
              </button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={async () => {
                  if (!isAuthenticated) { toast.info('Please sign in'); return; }
                  await toggleWishlist(product._id);
                }}
                className={`btn-icon border rounded-lg w-12 h-12 flex items-center justify-center transition-colors ${
                  isWishlisted ? 'bg-error border-error text-white' : 'border-border text-charcoal-600 hover:border-error hover:text-error'
                }`}
                aria-label="Toggle wishlist"
                id="wishlist-btn"
              >
                <svg width="20" height="20" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </motion.button>
            </div>

            {/* Stock Info */}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 10 && (
              <p className="text-sm text-warning font-medium mb-4">
                ⚡ Only {selectedVariant.stock} left in stock!
              </p>
            )}

            {/* Description */}
            <div className="space-y-4 mt-8">
              <div>
                <h3 className="font-semibold text-charcoal-900 mb-2">Description</h3>
                <div className="text-body text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
              {product.ingredients && (
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-2">Ingredients</h3>
                  <p className="text-body text-sm">{product.ingredients}</p>
                </div>
              )}
              {product.specifications?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-2">Specifications</h3>
                  <dl className="grid grid-cols-2 gap-2">
                    {product.specifications.map((spec, i) => (
                      <div key={i} className="bg-sand-50 px-3 py-2 rounded-md">
                        <dt className="text-xs text-muted">{spec.key}</dt>
                        <dd className="text-sm font-medium text-charcoal-800">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border-light">
              {[
                { icon: '🌿', label: '100% Natural' },
                { icon: '🚚', label: 'Free Shipping 500+' },
                { icon: '🔒', label: 'Secure Payment' },
              ].map((badge) => (
                <div key={badge.label} className="text-center">
                  <span className="text-xl">{badge.icon}</span>
                  <p className="text-[10px] text-muted mt-1">{badge.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="section-header">
              <span className="label text-sand-600 mb-2 block">You May Also Like</span>
              <h2 className="heading-section">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
