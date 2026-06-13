'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CuratedCollections() {
  const [cards, setCards] = useState({ '1': null, '2': null, '3': null });
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      const categories = data.data || [];

      const mapped = { '1': null, '2': null, '3': null };
      categories.forEach((cat) => {
        if (['1', '2', '3'].includes(cat.homeViewOption)) {
          mapped[cat.homeViewOption] = cat;
        }
      });
      setCards(mapped);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');
  const getImageUrl = (url) => (url ? `${API_URL}${url}` : null);

  if (loading) {
    return (
      <section className="section-spacing">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          {/* Heading skeleton */}
          <div className="text-center mb-10 animate-pulse">
            <div className="w-32 h-3 mx-auto mb-4 rounded-full bg-neutral-200" />
            <div className="w-64 h-8 mx-auto rounded bg-neutral-200" />
            <div className="w-48 h-4 mx-auto mt-3 rounded bg-neutral-200" />
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="relative rounded-xl md:col-span-2 bg-neutral-200/60 animate-pulse h-[340px] md:h-[480px]" />
            <div className="grid grid-cols-1 gap-gutter">
              <div className="relative rounded-xl bg-neutral-200/60 animate-pulse h-[180px] md:h-[220px]" />
              <div className="relative rounded-xl bg-neutral-200/60 animate-pulse h-[180px] md:h-[220px]" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hasAnyCard = cards['1'] || cards['2'] || cards['3'];
  if (!hasAnyCard) return null;

  const CardOverlay = ({ cat, large = false, className = '' }) => {
    if (!cat) return <div className={`${className} bg-surface-container-low rounded-xl`} />;

    return (
      <Link
        href={`/shop?category=${cat.slug}`}
        className={`group relative overflow-hidden rounded-xl bg-surface-container-low block ${className}`}
      >
        {getImageUrl(cat.image?.url) ? (
          <img
            alt={cat.image?.alt || cat.name}
            className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            src={getImageUrl(cat.image.url)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>category</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 ${
            large
              ? 'bg-gradient-to-t from-primary/85 via-primary/25 to-transparent'
              : 'bg-gradient-to-t from-primary/75 via-primary/10 to-transparent'
          }`}
        />

        {/* Text */}
        <div className={`absolute bottom-0 left-0 w-full ${large ? 'p-8' : 'p-5'}`}>
          <h3
            className={`text-on-primary font-display mb-2 ${
              large ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'
            }`}
          >
            {cat.name}
          </h3>
          {large && (
            <p className="flex items-center gap-1.5 text-sm font-body text-on-primary/80 transition-transform duration-300 group-hover:translate-x-1.5">
              Shop Category
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className="section-spacing">
      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">

        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mb-3">
            Shop by Category
          </p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-3">
            Curated Collections
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
            Elevate your daily rituals with nature&apos;s finest.
          </p>
        </div>

        {/* Bento-style grid — large card left, 2 stacked right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Large card — spans 2 cols */}
          <CardOverlay
            cat={cards['1']}
            large
            className="h-[320px] md:h-[480px] md:col-span-2"
          />

          {/* Right column — two stacked cards */}
          <div className="grid grid-cols-1 gap-gutter">
            <CardOverlay
              cat={cards['2']}
              className="h-[180px] md:h-[220px]"
            />
            <CardOverlay
              cat={cards['3']}
              className="h-[180px] md:h-[220px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
