'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard, { ProductCardSkeleton } from '@/components/ui/ProductCard';
import api from '@/lib/api';

export default function BestSellers() {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/products?showInBestSellers=true&limit=8&sort=newest&page=${currentPage}`
        );
        if (data?.data) {
          setBestSellers(data.data);
          setPagination(
            data.pagination || {
              page: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
          );
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
    document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="best-sellers" className="section-spacing bg-surface">
      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">

        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mb-3">
            Favorites
          </p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-3">
            Our Best Sellers
          </h2>
          <p className="mx-auto max-w-md font-body-md text-body-md text-on-surface-variant">
            Customer favorites, handcrafted in small batches from Nilgiri botanicals.
          </p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <ProductCardSkeleton key={idx} variant="default" />
            ))}
          </div>
        ) : bestSellers.length === 0 ? (
          <p className="py-12 text-center text-on-surface-variant font-body">
            No best sellers available right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-4 md:gap-y-8">
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

        {/* Pagination — only shows when backend says totalPages > 1 */}
        {!loading && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex items-center justify-center gap-2"
          >
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant px-5 py-2 font-body text-sm text-on-surface-variant transition-all duration-200 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_back
              </span>
              Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`h-9 w-9 rounded-full font-body text-sm transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-primary text-on-primary shadow-botanical'
                      : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant px-5 py-2 font-body text-sm text-on-surface-variant transition-all duration-200 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
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
            className="inline-flex items-center gap-2 rounded-full border border-primary px-8 py-3 font-body text-sm text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary"
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