'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import api from '@/lib/api';

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?showInBestSellers=true&limit=8&sort=newest&page=${currentPage}`);
        if (data?.data) {
          setBestSellers(data.data);
          setPagination(data.pagination || { page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
        }
      } catch (error) {
        console.error('Failed to fetch best sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, [currentPage]);

  const goToPage = (page) => {
    setCurrentPage(page);
    // Scroll to section top smoothly
    document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="best-sellers" className="section-spacing bg-surface">
      <div className="container-main">
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand">
            Favorites
          </p>
          <h2 className="mt-3 font-display text-3xl text-charcoal md:text-4xl">
            Our Best Sellers
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-[15px] text-on-surface-variant">
            Customer favorites, handcrafted in small batches from Nilgiri botanicals.
          </p>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : bestSellers.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">No best sellers available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product, index) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                variant="default"
                index={index}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex items-center justify-center gap-2"
          >
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="flex items-center gap-1.5 rounded-full border border-border px-5 py-2 font-body text-sm text-charcoal transition-all duration-200 hover:border-primary-container hover:text-primary-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                  className={`h-9 w-9 rounded-full font-body text-sm transition-all duration-200 disabled:cursor-not-allowed ${
                    page === currentPage
                      ? 'bg-primary-container text-white'
                      : 'border border-border text-charcoal hover:border-primary-container hover:text-primary-container'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="flex items-center gap-1.5 rounded-full border border-border px-5 py-2 font-body text-sm text-charcoal transition-all duration-200 hover:border-primary-container hover:text-primary-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-primary-container px-8 py-3 font-body text-sm text-primary-container transition-all duration-300 hover:bg-primary-container hover:text-white"
          >
            View All Products
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
