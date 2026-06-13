'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import QuantitySelector from '@/components/ui/QuantitySelector';
import api from '@/lib/api';
import { useCart } from '@/lib/cartStore';
import ProductCard from '@/components/ui/ProductCard';

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-outline-variant">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-display text-xl text-charcoal">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: '20px' }}
        >
          expand_more
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 font-body text-[15px] leading-relaxed text-on-surface-variant">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarRow({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5 text-sand">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`material-symbols-outlined ${i < Math.floor(rating) ? 'filled' : ''}`}
            style={{ fontSize: '16px' }}
          >
            star
          </span>
        ))}
      </div>
      <span className="font-body text-sm text-on-surface-variant">
        {rating.toFixed(1)} ({count} reviews)
      </span>
    </div>
  );
}

export default function ProductPage({ params }) {
  const { slug } = params;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addItem, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.data.product);
        setRelated(data.data.relatedProducts || []);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)',
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getImageUrl = (url) => (url ? `${API_URL}${url}` : null);

  const images = product.images && product.images.length > 0
    ? product.images.map(i => getImageUrl(i.url))
    : ['/placeholder-product.jpg'];

  const categorySlug = product.category?.slug || '';

  const effectivePrice = selectedVariant?.offerPrice && selectedVariant.offerPrice < selectedVariant.price
    ? selectedVariant.offerPrice : selectedVariant?.price || 0;

  const handleAddToBag = () => {
    addItem({
      productId: product._id,
      name: product.name,
      variant: selectedVariant?.name || '',
      price: effectivePrice,
      quantity,
      image: images[0],
      availableVariants: product.variants || [],
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToBag();
    openCart();
  };

  return (
    <>
      <Navbar activeLink="Categories" />
      <main className="pt-20">
        <div className="container-main py-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              ...(product.category ? [{ label: product.category.name, href: `/shop?category=${categorySlug}` }] : []),
              { label: product.name },
            ]}
            className="mb-8"
          />

          <div className="grid gap-12 lg:grid-cols-[55%_45%]">
            {/* Image Gallery */}
            <div>
              <div
                className="aspect-square relative overflow-hidden rounded-xl bg-surface-container-low cursor-zoom-in border border-[#e4e2dd]"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-100 ease-out"
                  style={isHovered ? zoomStyle : { transform: 'scale(1)', transformOrigin: 'center center' }}
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`h-20 w-20 overflow-hidden rounded-lg border-2 transition-all duration-200 ${activeImage === i
                        ? 'border-primary-container shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.isBestSeller && <Badge className="mb-4">BEST SELLER</Badge>}
              {product.isNewArrival && <Badge className="mb-4 ml-2">NEW ARRIVAL</Badge>}

              <h1 className="font-display text-3xl text-charcoal md:text-[40px] leading-tight">
                {product.name}
              </h1>

              {product.averageRating > 0 && (
                <div className="mt-3">
                  <StarRow rating={product.averageRating} count={product.totalReviews} />
                </div>
              )}

              <div className="mt-4 flex items-end gap-3">
                <p className="font-display text-[28px] text-charcoal">₹{effectivePrice}</p>
                {selectedVariant?.offerPrice && selectedVariant.offerPrice < selectedVariant.price && (
                  <p className="mb-1 font-body text-sm text-on-surface-variant line-through">₹{selectedVariant.price}</p>
                )}
              </div>

              <p className="mt-2 flex items-center gap-1.5 font-body text-[13px] text-secondary">
                <span className="material-symbols-outlined filled" style={{ fontSize: '16px' }}>
                  check_circle
                </span>
                In Stock · Handcrafted in small batches
              </p>

              <div
                className="mt-6 font-body text-[15px] leading-[1.8] text-on-surface-variant"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Scent Profile (Fallback if available) */}
              {product.specifications?.find(s => s.key === 'Scent Profile') && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-1.5">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '16px' }}>
                    spa
                  </span>
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-secondary">
                    {product.specifications.find(s => s.key === 'Scent Profile').value}
                  </span>
                </div>
              )}

              {/* Size Selector */}
              {product.variants && product.variants.length > 1 && (
                <div className="mt-8">
                  <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-outline">
                    Size / Variant
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.filter(v => v.isActive).map((variant) => (
                      <button
                        key={variant._id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={`rounded-md px-5 py-2 font-body text-sm transition-all duration-200 ${selectedVariant?._id === variant._id
                          ? 'border border-charcoal bg-charcoal text-white'
                          : variant.stock === 0
                            ? 'border border-outline/20 text-outline cursor-not-allowed opacity-50'
                            : 'border border-outline-variant text-on-surface-variant hover:border-secondary'
                          }`}
                      >
                        {variant.name}
                        {variant.weight && (
                          <span className="block text-[10px] mt-0.5 opacity-70">
                            {variant.weight.value}{variant.weight.unit}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Bag */}
              <div className="mt-8 flex gap-4">
                <QuantitySelector
                  quantity={quantity}
                  onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                  onIncrease={() => setQuantity(Math.min(quantity + 1, selectedVariant?.stock || 10))}
                />
                <button
                  type="button"
                  onClick={handleAddToBag}
                  disabled={selectedVariant?.stock === 0}
                  className={`relative flex-1 overflow-hidden rounded-md py-3 font-body text-sm uppercase tracking-wider text-white transition-all duration-300 ${addedToCart ? 'bg-secondary' : 'bg-primary-container hover:bg-secondary disabled:opacity-50'
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined filled" style={{ fontSize: '18px' }}>
                          check
                        </span>
                        Added to Bag
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={selectedVariant?.stock === 0}
                className="mt-4 block w-full rounded-md border border-charcoal py-3 text-center font-body text-sm text-charcoal transition-colors hover:bg-surface-container disabled:opacity-50"
              >
                Buy it now
              </button>

              {/* Accordions */}
              <div className="mt-10">
                <AccordionItem title="Product Details" defaultOpen>
                  <ul className="mb-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined filled text-secondary" style={{ fontSize: '16px' }}>
                        eco
                      </span>
                      100% Natural
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined filled text-secondary" style={{ fontSize: '16px' }}>
                        favorite
                      </span>
                      Vegan &amp; Cruelty-Free
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined filled text-secondary" style={{ fontSize: '16px' }}>
                        recycling
                      </span>
                      Palm Oil Free
                    </li>
                  </ul>
                </AccordionItem>
                {product.howToUse && (
                  <AccordionItem title="How to Use">
                    <p>{product.howToUse}</p>
                  </AccordionItem>
                )}
                {product.ingredients && (
                  <AccordionItem title="Ingredients">
                    <p>{product.ingredients}</p>
                  </AccordionItem>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.reviews && product.reviews.length > 0 && (() => {
            const timeAgo = (dateStr) => {
              const date = new Date(dateStr);
              const now = new Date();
              const diff = Math.floor((now - date) / 1000);
              
              if (diff < 60) return 'Just now';
              if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
              if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
              if (diff < 2592000) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
              if (diff < 31536000) return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) > 1 ? 's' : ''} ago`;
              return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) > 1 ? 's' : ''} ago`;
            };

            const sortedReviews = [...product.reviews];

            return (
              <section className="mt-20 pt-10">
                <h2 className="font-display text-[28px] text-charcoal mb-6">
                  Review List
                </h2>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40">
                  <span className="font-body text-[15px] text-on-surface-variant">
                    Showing 1-{sortedReviews.length} of {product.totalReviews || sortedReviews.length} results
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-[15px] text-on-surface-variant">Sort by :</span>
                    <div className="relative">
                      {/* Sort functionality can be added to this select by moving state higher, but visually matching for now */}
                      <select className="appearance-none border border-outline-variant/50 rounded-full pl-5 pr-10 py-2.5 font-body text-[14px] text-charcoal bg-transparent focus:outline-none focus:border-secondary cursor-pointer">
                        <option value="newest">Newest</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" style={{ fontSize: '20px' }}>
                        expand_more
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  {sortedReviews.map((review) => (
                    <div key={review._id} className="py-8 border-b border-outline-variant/30 last:border-0">
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="h-[50px] w-[50px] rounded-full bg-surface-container overflow-hidden flex items-center justify-center font-display text-xl text-primary border border-outline-variant/20 shadow-sm">
                            {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'V'}
                          </div>
                          <div>
                            <h4 className="font-display text-[17px] text-charcoal">{review.user?.name || 'Verified Buyer'}</h4>
                            <span className="font-body text-[13.5px] text-on-surface-variant/80">(Verified)</span>
                          </div>
                        </div>
                        <span className="font-body text-[14px] text-on-surface-variant">
                          {timeAgo(review.createdAt)}
                        </span>
                      </div>

                      {review.title && (
                        <h5 className="font-display text-[17px] text-charcoal font-medium mb-2.5">
                          {review.title}
                        </h5>
                      )}

                      <p className="font-body text-[15.5px] leading-[1.7] text-on-surface-variant mb-4 max-w-5xl">
                        {review.comment}
                      </p>

                      <div className="flex items-center gap-2.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`material-symbols-outlined ${i < review.rating ? 'filled text-sand' : 'text-outline-variant/30'}`}
                              style={{ fontSize: '18px' }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="font-body text-sm text-on-surface-variant font-medium">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-20 border-t border-outline-variant pt-16">
              <h2 className="mb-8 text-center font-display text-2xl text-charcoal md:text-3xl">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p._id} product={p} variant="collection" />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
