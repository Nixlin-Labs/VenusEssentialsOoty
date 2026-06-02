'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

function HeroSection({ banners }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  return (
    <section className="relative overflow-hidden bg-forest-900" id="hero-section">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container-wide relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-forest-300 text-xs tracking-[0.3em] uppercase font-medium mb-4">
              ✦ Established 1980 · Ooty, Nilgiri Hills ✦
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Premium Wellness,<br />
              <span className="text-sand-400">Rooted in Heritage</span>
            </h1>
            <p className="text-forest-200 text-lg leading-relaxed max-w-lg mb-8">
              From the misty hills of Ooty, we bring you handcrafted coffee, aromatic teas, 
              pure essential oils, and artisanal chocolates — perfected over 40+ years.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn btn-lg bg-white text-forest-900 hover:bg-sand-50 font-bold" id="hero-shop-btn">
                Explore Collection
              </Link>
              <Link href="/about" className="btn btn-lg border border-forest-400 text-forest-200 hover:bg-forest-800 hover:text-white">
                Our Story
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-forest-700">
              {[
                { value: '40+', label: 'Years Heritage' },
                { value: '50K+', label: 'Happy Customers' },
                { value: '100%', label: 'Natural' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-sand-400 font-display">{stat.value}</p>
                  <p className="text-xs text-forest-300 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Decorative Ring */}
              <div className="absolute inset-0 border-2 border-forest-600 rounded-full opacity-20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-8 border border-sand-500 rounded-full opacity-30 animate-[spin_30s_linear_infinite_reverse]" />

              {/* Center Content */}
              <div className="absolute inset-16 bg-forest-800 rounded-full flex items-center justify-center shadow-glow">
                <div className="text-center">
                  <span className="text-6xl">🌿</span>
                  <p className="text-forest-200 text-xs tracking-[0.2em] uppercase mt-3">Pure & Natural</p>
                </div>
              </div>

              {/* Floating Product Badges */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                <span className="text-xl">☕</span>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Coffee Blends</p>
                  <p className="text-[10px] text-muted">From ₹199</p>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity }} className="absolute bottom-16 left-0 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                <span className="text-xl">🫖</span>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Tea Collection</p>
                  <p className="text-[10px] text-muted">From ₹149</p>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-4 right-8 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
                <span className="text-xl">🍫</span>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Chocolates</p>
                  <p className="text-[10px] text-muted">From ₹249</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CategorySection({ categories }) {
  if (!categories || categories.length === 0) return null;

  const categoryIcons = {
    'coffee-powders': '☕',
    'tea-powders': '🫖',
    'essential-oils': '🌸',
    'chocolates': '🍫',
    'wellness-products': '🌿',
  };

  return (
    <section className="section bg-surface" id="categories-section">
      <div className="container-wide">
        <div className="section-header">
          <span className="label text-sand-600 mb-2 block">Explore Our World</span>
          <h2 className="heading-section">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 stagger-children">
          {categories.map((cat) => (
            <Link
              key={cat._id || cat.slug}
              href={`/categories/${cat.slug}`}
              className="group text-center"
              id={`category-${cat.slug}`}
            >
              <div className="aspect-square bg-sand-50 rounded-2xl flex items-center justify-center group-hover:bg-forest-50 transition-colors duration-300 shadow-xs group-hover:shadow-md">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {categoryIcons[cat.slug] || '🌿'}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-charcoal-800 group-hover:text-forest-700 transition-colors">
                {cat.name}
              </h3>
              {cat.productCount > 0 && (
                <p className="text-xs text-muted">{cat.productCount} products</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection({ title, subtitle, products, viewAllHref }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="section" id={`${title.toLowerCase().replace(/\s+/g, '-')}-section`}>
      <div className="container-wide">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="label text-sand-600 mb-2 block">{subtitle}</span>
            <h2 className="heading-section">{title}</h2>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="btn btn-ghost text-sm group">
              View All
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeritageSection() {
  return (
    <section className="relative overflow-hidden bg-forest-900 py-20 lg:py-28" id="heritage-section">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>
      <div className="container-wide relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-forest-300 text-xs tracking-[0.3em] uppercase mb-4 block">Our Legacy</span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              From the Misty Hills<br />
              <span className="text-sand-400">of Ooty</span>
            </h2>
            <p className="text-forest-200 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              For over four decades, Venus Essentials has been crafting premium wellness products 
              using time-honored traditions and the finest ingredients from the Nilgiri hills. 
              Every product tells the story of our heritage.
            </p>
            <Link href="/about" className="btn btn-lg bg-sand-500 text-white hover:bg-sand-600">
              Discover Our Heritage
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="section bg-sand-50" id="newsletter-section">
      <div className="container-tight">
        <div className="max-w-xl mx-auto text-center">
          <span className="label text-sand-600 mb-2 block">Stay Connected</span>
          <h2 className="heading-section mb-3">Join Our Community</h2>
          <p className="text-body mb-8">Get exclusive offers, new product updates, and wellness tips from Ooty.</p>
          <form className="flex gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="input flex-1" id="newsletter-email" />
            <button className="btn btn-primary" id="newsletter-submit">Subscribe</button>
          </form>
          <p className="text-xs text-muted mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const { data: res } = await api.get('/cms/homepage');
        setData(res.data);
      } catch (error) {
        console.error('Homepage fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 w-10 h-10" />
          <p className="text-sm text-muted">Loading Venus Essentials...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection banners={data?.heroBanners || []} />
      <CategorySection categories={data?.categories || []} />
      <ProductSection
        title="Featured Products"
        subtitle="Curated Selection"
        products={data?.featuredProducts || []}
        viewAllHref="/shop?filter=featured"
      />
      <HeritageSection />
      <ProductSection
        title="Best Sellers"
        subtitle="Most Loved"
        products={data?.bestSellers || []}
        viewAllHref="/shop?filter=best-sellers"
      />
      <ProductSection
        title="New Arrivals"
        subtitle="Just In"
        products={data?.newArrivals || []}
        viewAllHref="/shop?filter=new-arrivals"
      />
      <NewsletterSection />
    </>
  );
}
