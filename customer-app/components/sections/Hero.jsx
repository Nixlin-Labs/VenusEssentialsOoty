'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const FALLBACK_SLIDE = {
  title: 'Pure Essentials from the Hills of Ooty',
  subtitle: 'Discover our handcrafted collection of essential oils, natural skincare, and wellness rituals, distilled from the pristine Nilgiri highlands. Minimal luxury, bottled.',
  image: {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSY0fQQPm7NXUC0TISiegYUfldg7gyEWkC4CTPGsBY1wc4mSx8oHhD0_bj_VUD8tn-sUX32y0J3p67jAA__sPf9oyH4jzcvo_61bOptBLunDGdzL5ypmtXx0Sf1Gu7otUxY5MQkgdONwLFb5TfRee1cKNJLFId8B4P9PXtvmyuIKUf4vLLqimxSXpdxBmOLG4w8kvQOzmyJuJuoziDziAJ1AQAaCzL7De9D59XyN8r_NKmME1xdTkY5u4cOJ4BmL_fUBc4a-2FfGA-',
    alt: 'Misty Ooty Hills',
  },
  link: '/shop',
  buttonText: 'Shop Now',
};

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners?position=hero');
        if (data?.data && data.data.length > 0) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch hero banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const activeBanners = banners.length > 0 ? banners : [FALLBACK_SLIDE];
  const slide = activeBanners[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [activeBanners.length, currentSlide]);

  return (
    <section className="relative min-h-[85vh] md:min-h-[921px] flex items-center justify-center overflow-hidden bg-surface-container-low">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {/* Background Image */}
          <img
            alt={slide.image?.alt || slide.title}
            className="object-cover object-center w-full h-full opacity-55 scale-102 transition-transform duration-10000 ease-out"
            src={getImageUrl(slide.image?.url)}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl pb-20 mx-auto text-center px-margin-mobile md:px-margin-desktop">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  staggerChildren: 0.1,
                  duration: 0.6,
                },
              },
            }}
            className="flex flex-col items-center"
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              className="px-4 py-1 tracking-widest uppercase border rounded-full font-label-lg text-label-lg text-primary mb-6 bg-surface/50 backdrop-blur-sm border-outline/10"
            >
              Artisanal Wellness
            </motion.span>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 },
              }}
              className="leading-tight font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 max-w-3xl"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 },
              }}
              className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed"
            >
              {slide.subtitle}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 },
              }}
              className="flex flex-col justify-center w-full sm:flex-row gap-4 sm:w-auto"
            >
              <Link
                href={slide.link || '/shop'}
                className="inline-flex justify-center items-center px-8 py-4 bg-primary text-on-primary font-body-sm text-body-sm font-semibold rounded-full hover:bg-primary-container shadow-md transition-all duration-300 min-w-[200px]"
              >
                {slide.buttonText || 'Shop Now'}
              </Link>
              <Link
                href="/shop"
                className="inline-flex justify-center items-center px-8 py-4 bg-transparent border border-outline text-primary font-body-sm text-body-sm font-semibold rounded-full hover:bg-surface-container transition-all duration-300 min-w-[200px]"
              >
                Explore Collection
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Controls */}
      {activeBanners.length > 1 && (
        <>
          {/* Side Arrows */}
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-primary/10 bg-surface/40 hover:bg-surface/80 text-primary transition-all backdrop-blur-sm active:scale-95 shadow-sm"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-primary/10 bg-surface/40 hover:bg-surface/80 text-primary transition-all backdrop-blur-sm active:scale-95 shadow-sm"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_right</span>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-8 bg-primary' : 'w-2 bg-primary/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Organic curved transition bottom */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-[0] z-10">
        <svg className="w-full h-12 md:h-20 fill-background" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.71,113.84,106.39,122.9,160.8,119.53,212.87,116.29,267.75,76.51,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  );
}
