'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function PromotionalBanner() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data } = await api.get('/cms/banners?position=promotional');
        if (data?.data) {
          setPromotions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch promotional banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const validPromotions = promotions.filter(promo => promo.image?.url);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === validPromotions.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? validPromotions.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (validPromotions.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [validPromotions.length, currentSlide]);

  if (loading) {
    return (
      <div className="w-full h-[250px] md:h-[350px] bg-neutral-100 animate-pulse" />
    );
  }

  if (validPromotions.length === 0) {
    return null;
  }

  const slide = validPromotions[currentSlide];
  const imageUrl = getImageUrl(slide.image.url);

  return (
    <section className="relative w-full overflow-hidden bg-background py-4">
      <div className="relative w-full h-[260px] md:h-[340px] overflow-hidden bg-surface-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            {/* Background Image */}
            <img
              src={imageUrl}
              alt={slide.image.alt || slide.title}
              className="object-cover object-center w-full h-full"
            />
            {/* Elegant dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent md:from-black/80 md:via-black/35" />
          </motion.div>
        </AnimatePresence>

        {/* Content Wrapper */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl text-left text-white"
              >
                <h3 className="leading-tight font-display text-2xl md:text-3.5xl mb-3 font-semibold text-white drop-shadow-sm">
                  {slide.title}
                </h3>
                
                {slide.subtitle && (
                  <p className="font-body text-sm md:text-base text-white/90 mb-6 max-w-md leading-relaxed drop-shadow-xs">
                    {slide.subtitle}
                  </p>
                )}

                {slide.link && (
                  <Link
                    href={slide.link}
                    className="inline-flex justify-center items-center px-6 py-3 bg-white text-primary hover:bg-primary hover:text-white font-body text-xs md:text-sm font-semibold rounded-full shadow-md transition-all duration-300 transform active:scale-95"
                  >
                    {slide.buttonText || 'Shop Offer'}
                    <span className="material-symbols-outlined ml-2 text-[16px]">arrow_forward</span>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slider Controls */}
        {validPromotions.length > 1 && (
          <>
            {/* Arrow Buttons */}
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 hover:bg-black/50 text-white transition-all backdrop-blur-xs active:scale-95 shadow-sm"
              aria-label="Previous slide"
              suppressHydrationWarning
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 hover:bg-black/50 text-white transition-all backdrop-blur-xs active:scale-95 shadow-sm"
              aria-label="Next slide"
              suppressHydrationWarning
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {validPromotions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/45'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  suppressHydrationWarning
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
