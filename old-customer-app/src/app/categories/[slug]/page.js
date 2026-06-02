'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get(`/categories/${slug}`),
          api.get(`/products?category=${slug}&limit=24`),
        ]);
        setCategory(catRes.data.data);
        setProducts(prodRes.data.data || []);
      } catch (error) {
        console.error('Category fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="skeleton h-48 w-full" />
        <div className="container-wide py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-square rounded-lg" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category Hero */}
      <div className="bg-forest-900 py-16">
        <div className="container-wide text-center">
          <span className="text-forest-300 text-xs tracking-[0.3em] uppercase mb-3 block">Category</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{category?.name || slug}</h1>
          {category?.description && (
            <p className="text-forest-200 text-sm mt-3 max-w-lg mx-auto">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container-wide py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🌿</span>
            <p className="heading-card text-charcoal-500">No products in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
