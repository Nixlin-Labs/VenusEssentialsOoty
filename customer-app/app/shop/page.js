'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import CustomSelect from '@/components/ui/CustomSelect';
import api from '@/lib/api';

function ShopPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [activeScent, setActiveScent] = useState(searchParams.get('scent') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);

  // Sync state with URL params
  useEffect(() => {
    setActiveCategory(searchParams.get('category') || '');
    setActiveScent(searchParams.get('scent') || '');
    setSearchQuery(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'newest');
    setCurrentPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

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
      if (activeScent) params.set('scent', activeScent);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) {
        // Map UI sort to API sort format if needed
        let sortParam = sortBy;
        if (sortBy === 'Price: Low to High') sortParam = 'price_asc';
        else if (sortBy === 'Price: High to Low') sortParam = 'price_desc';
        else if (sortBy === 'Newest Arrivals') sortParam = 'newest';
        params.set('sort', sortParam);
      }
      params.set('page', currentPage);
      params.set('limit', 6);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Products fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeScent, searchQuery, sortBy, currentPage]);

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
    // Reset page on filter change
    if (key !== 'page') params.set('page', 1);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (slug) => {
    updateFilters('category', slug);
  };

  const handleScentChange = (scentName) => {
    updateFilters('scent', scentName.toLowerCase());
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  // Static scent profiles for now, or fetch from API if available
  const scentProfiles = ['Floral', 'Earthy', 'Citrus', 'Woody'];

  return (
    <>
      <Navbar activeLink="Shop All" />
      <main className="bg-background text-on-background font-body-md antialiased overflow-x-hidden min-h-screen">
        {/* Page Header */}
        <header className="pt-32 pb-16 md:pt-40 md:pb-24 px-margin-mobile md:px-margin-desktop text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">
              Artisanal Collections
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Discover our meticulously curated range of botanical wellness products, handcrafted in the serene Nilgiri highlands to elevate your daily rituals.
            </p>
          </div>
        </header>

        {/* Main Content: Sidebar + Grid */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap flex flex-col lg:flex-row gap-gutter">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 mb-12 lg:mb-0">
            <div className="sticky top-32 space-y-12">
              {/* Category Filter */}
              <div>
                <h3 className="font-label-lg text-label-lg text-primary border-b border-outline/20 pb-3 mb-4 uppercase tracking-widest">
                  Categories
                </h3>
                <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant">
                  <li>
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left transition-colors flex items-center justify-between ${
                        !activeCategory ? 'text-primary font-medium font-semibold' : 'hover:text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">eco</span>
                        Shop All
                      </span>
                    </button>
                  </li>
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.slug;
                    return (
                      <li key={cat._id || cat.slug}>
                        <button
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`w-full text-left transition-colors flex items-center justify-between ${
                            isActive ? 'text-primary font-medium font-semibold' : 'hover:text-primary'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {cat.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Scent Profile Filter */}
              <div>
                <h3 className="font-label-lg text-label-lg text-primary border-b border-outline/20 pb-3 mb-4 uppercase tracking-widest">
                  Scent Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scentProfiles.map((scent) => {
                    const isActive = activeScent === scent.toLowerCase();
                    return (
                      <button
                        key={scent}
                        onClick={() => handleScentChange(isActive ? '' : scent)}
                        className={`px-3 py-1 font-label-md text-label-md rounded-full border transition-colors ${
                          isActive
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-surface-container text-on-surface-variant border-outline/10 hover:border-primary/30'
                        }`}
                      >
                        {scent}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline/10">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {pagination ? `${pagination.total} products` : 'Loading...'}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Sort by
                </span>
                <CustomSelect
                  options={[
                    { label: 'Featured', value: 'Featured' },
                    { label: 'Price: Low to High', value: 'Price: Low to High' },
                    { label: 'Price: High to Low', value: 'Price: High to Low' },
                    { label: 'Newest Arrivals', value: 'Newest Arrivals' },
                  ]}
                  value={sortBy}
                  onChange={(val) => updateFilters('sort', val)}
                  buttonClassName="border-none bg-transparent hover:bg-surface-container font-body-sm text-body-sm text-primary py-0.5 pr-6 cursor-pointer"
                />
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-xl border border-dashed border-outline-variant p-8">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">spa</span>
                <p className="font-body-lg text-on-surface-variant mb-6">
                  No products found matching your selected filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-primary text-white rounded-full font-label-lg hover:bg-primary-container transition-colors shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    variant="collection"
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && !loading && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <button
                  onClick={() => updateFilters('page', Math.max(1, currentPage - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="w-10 h-10 rounded-full border border-outline/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateFilters('page', pageNum)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-primary text-on-primary border border-primary font-label-lg'
                          : 'font-body-md text-on-surface-variant hover:text-primary hover:border hover:border-outline/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => updateFilters('page', Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={!pagination.hasNextPage}
                  className="w-10 h-10 rounded-full border border-outline/20 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            )}
          </main>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
