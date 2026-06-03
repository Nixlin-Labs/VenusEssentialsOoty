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

      // Map homeViewOption to position slots (only 1, 2, 3 — skip 0)
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
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-section-gap-mobile animate-pulse">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm">
              Curated Collections
            </h2>
            <div className="h-4 w-64 bg-neutral-200 mx-auto rounded mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[250px] md:auto-rows-[300px]">
            <div className="md:col-span-2 md:row-span-2 rounded-lg bg-neutral-200/60 animate-pulse relative p-8 flex flex-col justify-end">
              <div className="h-6 w-1/3 bg-neutral-300 rounded mb-2" />
              <div className="h-4 w-1/4 bg-neutral-300 rounded" />
            </div>
            <div className="rounded-lg bg-neutral-200/60 animate-pulse relative p-6 flex flex-col justify-end">
              <div className="h-5 w-1/2 bg-neutral-300 rounded" />
            </div>
            <div className="rounded-lg bg-neutral-200/60 animate-pulse relative p-6 flex flex-col justify-end">
              <div className="h-5 w-1/2 bg-neutral-300 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render the section at all if no home-view categories are configured
  const hasAnyCard = cards['1'] || cards['2'] || cards['3'];
  if (!hasAnyCard) return null;

  const CardOverlay = ({ cat, className, large = false }) => {
    if (!cat) return <div className={`${className} bg-surface-container-low rounded-lg`} />;

    return (
      <Link
        href={`/shop?category=${cat.slug}`}
        className={`group relative overflow-hidden rounded-lg bg-surface-container-low block ${className}`}
      >
        {getImageUrl(cat.image?.url) ? (
          <img
            alt={cat.image?.alt || cat.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={getImageUrl(cat.image.url)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }}>category</span>
          </div>
        )}
        <div className={`absolute inset-0 ${large ? 'bg-gradient-to-t from-primary/80 via-primary/20 to-transparent' : 'bg-gradient-to-t from-primary/70 to-transparent'}`} />
        <div className={`absolute bottom-0 left-0 w-full ${large ? 'p-stack-lg' : 'p-stack-md'}`}>
          <h3 className={`text-on-primary mb-stack-sm ${large ? 'font-headline-sm text-headline-sm' : 'font-headline-sm text-headline-sm'}`}>
            {cat.name}
          </h3>
          {large && (
            <p className="font-body-sm text-body-sm text-on-primary/90 flex items-center group-hover:translate-x-2 transition-transform duration-300">
              Shop Category
              <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
            </p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className="section-spacing">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-section-gap-mobile">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm">
            Curated Collections
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Elevate your daily rituals with nature&apos;s finest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[250px] md:auto-rows-[300px]">
          {/* Position 1: Left large card */}
          <CardOverlay
            cat={cards['1']}
            className="md:col-span-2 md:row-span-2"
            large
          />

          {/* Position 2: Right top card */}
          <CardOverlay cat={cards['2']} className="" />

          {/* Position 3: Right bottom card */}
          <CardOverlay cat={cards['3']} className="" />
        </div>
      </div>
    </section>
  );
}
