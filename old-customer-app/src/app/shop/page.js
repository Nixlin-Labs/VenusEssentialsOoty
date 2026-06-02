'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_sellers', label: 'Best Sellers' },
  { value: 'rating', label: 'Top Rated' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('q') || '',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.search) params.set('search', filters.search);
      params.set('page', filters.page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Products fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data || []);
      } catch { /* silent */ }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-forest-900 py-12 lg:py-16">
        <div className="container-wide text-center">
          <span className="text-forest-300 text-xs tracking-[0.3em] uppercase mb-2 block">Venus Essentials</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Our Collection</h1>
          <p className="text-forest-200 text-sm mt-2">Premium wellness products crafted with love from Ooty</p>
        </div>
      </div>

      <div className="container-wide py-8 lg:py-12">
        <div className="lg:flex lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0 mb-8 lg:mb-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="label mb-3">Search</h3>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  placeholder="Search products..."
                  className="input"
                  id="shop-search"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="label mb-3">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilters({ ...filters, category: '', page: 1 })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!filters.category ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-charcoal-600 hover:bg-sand-50'}`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id || cat.slug}
                      onClick={() => setFilters({ ...filters, category: cat.slug, page: 1 })}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${filters.category === cat.slug ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-charcoal-600 hover:bg-sand-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light">
              <p className="text-sm text-muted">
                {pagination ? `${pagination.total} products` : 'Loading...'}
              </p>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                className="input w-auto text-sm py-2 pr-8"
                id="shop-sort"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-square rounded-lg" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="heading-card text-charcoal-500">No products found</p>
                <p className="text-sm text-muted mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                  {products.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      className="btn btn-ghost btn-sm disabled:opacity-30"
                    >
                      ← Prev
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilters({ ...filters, page: i + 1 })}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          filters.page === i + 1
                            ? 'bg-forest-800 text-white'
                            : 'text-charcoal-600 hover:bg-sand-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={!pagination.hasNextPage}
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      className="btn btn-ghost btn-sm disabled:opacity-30"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
