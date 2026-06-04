'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard, { ProductCardSkeleton } from '@/components/ui/ProductCard';
import api from '@/lib/api';

function FilterContent({
  searchVal,
  setSearchVal,
  sortBy,
  handleSortChange,
  categories,
  activeCategory,
  handleCategoryChange,
  priceVal,
  setPriceVal,
  inStockOnly,
  handleStockChange,
  handleResetFilters,
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <h2 className="font-body text-base font-bold text-charcoal uppercase tracking-wider">
          Filters
        </h2>
        <button
          onClick={handleResetFilters}
          className="font-body text-xs font-semibold text-error hover:underline transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <h3 className="font-body text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">search</span>
          Search
        </h3>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search products."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-full border border-outline-variant bg-white pl-11 pr-4 py-2.5 font-body text-sm text-charcoal outline-none placeholder:text-outline-variant focus:border-secondary transition-colors"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="font-body text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">sort</span>
          Sort By
        </h3>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full appearance-none rounded-full border border-outline-variant bg-white px-5 py-2.5 font-body text-sm text-charcoal outline-none focus:border-secondary cursor-pointer pr-10"
          >
            <option value="newest">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>
            expand_more
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-body text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">filter_list</span>
          Categories
        </h3>
        <ul className="space-y-2 font-body text-sm">
          <li>
            <button
              onClick={() => handleCategoryChange('')}
              className={`w-full text-left rounded-full transition-all duration-200 px-4 py-2.5 ${!activeCategory
                  ? 'bg-primary text-white font-medium shadow-sm'
                  : 'text-on-surface-variant hover:text-charcoal hover:bg-surface-container/50'
                }`}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <li key={cat._id || cat.slug}>
                <button
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left rounded-full transition-all duration-200 px-4 py-2.5 ${isActive
                      ? 'bg-primary text-white font-medium shadow-sm'
                      : 'text-on-surface-variant hover:text-charcoal hover:bg-surface-container/50'
                    }`}
                >
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-body text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">payments</span>
          Price Range
        </h3>
        <div className="space-y-4 rounded-2xl border border-outline-variant bg-white p-5 shadow-card">
          <div className="flex justify-between font-body text-xs text-on-surface-variant font-semibold">
            <span>₹0</span>
            <span>₹5,000</span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={priceVal}
            onChange={(e) => setPriceVal(Number(e.target.value))}
            className="w-full h-1 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-secondary"
          />
          <p className="font-body text-sm font-bold text-primary">
            Up to <span className="font-extrabold text-secondary">₹{priceVal.toLocaleString()}</span>
          </p>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <h3 className="font-body text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
          Availability
        </h3>
        <div className="flex items-center justify-between py-1 bg-white border border-outline-variant rounded-2xl p-4 shadow-card">
          <span className="font-body text-sm text-on-surface font-semibold">In Stock Only</span>
          <button
            type="button"
            onClick={() => handleStockChange(!inStockOnly)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${inStockOnly ? 'bg-secondary' : 'bg-outline-variant/50'
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inStockOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state from URL params
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 5000);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // Local inputs
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [priceVal, setPriceVal] = useState(Number(searchParams.get('maxPrice')) || 5000);

  // Sync initial inputs
  useEffect(() => {
    setActiveCategory(searchParams.get('category') || '');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'newest');
    setMaxPrice(Number(searchParams.get('maxPrice')) || 5000);
    setInStockOnly(searchParams.get('inStock') === 'true');
    setCurrentPage(Number(searchParams.get('page')) || 1);

    setSearchVal(searchParams.get('search') || '');
    setPriceVal(Number(searchParams.get('maxPrice')) || 5000);
  }, [searchParams]);

  // Debounced input search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchVal !== (searchParams.get('search') || '')) {
        updateFilters('search', searchVal);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Debounced slider price
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParam = Number(searchParams.get('maxPrice')) || 5000;
      if (priceVal !== currentParam) {
        updateFilters('maxPrice', priceVal === 5000 ? '' : priceVal.toString());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [priceVal]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);
      if (maxPrice && maxPrice < 5000) params.set('maxPrice', maxPrice.toString());
      if (inStockOnly) params.set('inStock', 'true');
      params.set('page', currentPage.toString());
      params.set('limit', '6');

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Products fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy, maxPrice, inStockOnly, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page on filter changes
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (slug) => {
    updateFilters('category', slug);
  };

  const handleSortChange = (val) => {
    updateFilters('sort', val);
  };

  const handleStockChange = (checked) => {
    updateFilters('inStock', checked ? 'true' : '');
  };

  const handleResetFilters = () => {
    router.push(pathname);
    setSearchVal('');
    setPriceVal(5000);
  };

  return (
    <>
      <Navbar activeLink="Shop All" />
      <main className="bg-background text-on-background font-body antialiased overflow-x-hidden min-h-screen">
        {/* Page Header */}
        <header className="pt-20 pb-10 md:pt-28 md:pb-16 px-5 md:px-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary mb-6">
              Artisanal Collections
            </h1>
            <p className="font-body text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Discover our meticulously curated range of botanical wellness products, handcrafted in small batches from the serene Nilgiri highlands.
            </p>
          </div>
        </header>

        {/* Main Content: Sidebar + Grid */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-16 pb-24 flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 bg-surface-container-low/40 border border-outline-variant/35 rounded-3xl p-6">
              <FilterContent
                searchVal={searchVal}
                setSearchVal={setSearchVal}
                sortBy={sortBy}
                handleSortChange={handleSortChange}
                categories={categories}
                activeCategory={activeCategory}
                handleCategoryChange={handleCategoryChange}
                priceVal={priceVal}
                setPriceVal={setPriceVal}
                inStockOnly={inStockOnly}
                handleStockChange={handleStockChange}
                handleResetFilters={handleResetFilters}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-4">
                {/* Mobile Filters Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-5 py-2.5 font-body text-xs font-semibold text-charcoal hover:bg-surface-container transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-charcoal">filter_list</span>
                  Filters
                </button>

                <span className="font-body text-sm text-on-surface-variant">
                  {pagination ? `${pagination.total} products` : 'Loading...'}
                </span>
              </div>

              <span className="hidden sm:inline font-body text-xs uppercase tracking-wider text-outline">
                Venus Ooty Essentials
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {[...Array(6)].map((_, idx) => (
                  <ProductCardSkeleton key={idx} variant="default" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low/50 rounded-2xl border border-dashed border-outline-variant p-8">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">spa</span>
                <p className="font-body text-base text-on-surface-variant mb-6">
                  No products found matching your selected filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-primary text-white rounded-full font-body text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && !loading && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button
                  onClick={() => updateFilters('page', Math.max(1, currentPage - 1).toString())}
                  disabled={!pagination.hasPrevPage}
                  className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateFilters('page', pageNum.toString())}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive
                          ? 'bg-primary text-white font-semibold'
                          : 'font-body text-sm text-on-surface-variant hover:text-primary hover:border hover:border-outline-variant'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => updateFilters('page', Math.min(pagination.totalPages, currentPage + 1).toString())}
                  disabled={!pagination.hasNextPage}
                  className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </main>
        </section>
      </main>
      <Footer />

      {/* Mobile Left Drawer Filters */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[180] bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            {/* Left Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-[190] flex h-full w-80 flex-col bg-surface p-6 shadow-botanical-hover overflow-y-auto"
            >
              {/* Close Button Header */}
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-charcoal transition-colors shadow-sm"
                  aria-label="Close filters"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>

              {/* Drawer Content */}
              <FilterContent
                searchVal={searchVal}
                setSearchVal={setSearchVal}
                sortBy={sortBy}
                handleSortChange={handleSortChange}
                categories={categories}
                activeCategory={activeCategory}
                handleCategoryChange={handleCategoryChange}
                priceVal={priceVal}
                setPriceVal={setPriceVal}
                inStockOnly={inStockOnly}
                handleStockChange={handleStockChange}
                handleResetFilters={handleResetFilters}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ShopPageSkeleton() {
  return (
    <>
      <Navbar activeLink="Shop All" />
      <main className="bg-background text-on-background font-body antialiased overflow-x-hidden min-h-screen">
        {/* Page Header */}
        <header className="pt-32 pb-16 md:pt-40 md:pb-24 px-5 md:px-16 text-center animate-pulse">
          <div className="max-w-3xl mx-auto">
            <div className="h-12 w-64 bg-neutral-200 mx-auto rounded mb-6" />
            <div className="h-4 w-96 bg-neutral-200 mx-auto rounded" />
          </div>
        </header>

        {/* Main Content: Sidebar + Grid */}
        <div className="max-w-[1280px] mx-auto px-5 md:px-16 pb-24 flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 h-[500px] bg-neutral-100 rounded-3xl border border-outline-variant/30 animate-pulse" />

          {/* Product Grid Area */}
          <div className="flex-grow">
            {/* Toolbar */}
            <div className="h-10 w-full border-b border-outline-variant/30 mb-8 animate-pulse" />

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="animate-pulse flex flex-col w-full">
                  <div className="aspect-square bg-neutral-200 rounded-xl mb-4" />
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-16 bg-neutral-200 rounded mb-1" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-4 w-2/3 bg-neutral-200 rounded" />
                      <div className="h-4 w-10 bg-neutral-200 rounded" />
                    </div>
                    <div className="h-3 w-1/3 bg-neutral-200 rounded mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageSkeleton />}>
      <ShopPageContent />
    </Suspense>
  );
}
