'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testimonials } from '@/lib/data';

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5 text-sand">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[18px] ${i < rating ? 'filled' : ''}`}
          style={{ fontSize: '18px' }}
        >
          star
        </span>
      ))}
    </div>
  );
}

const QUOTE_ICON = (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="text-sand/40">
    <path
      d="M0 28V16.8C0 12.267 1.2 8.4 3.6 5.2 6.067 2 9.6 0.4 14.2 0l1.4 2.8C12.267 3.6 10 5.067 8.4 7.2 6.8 9.267 6 11.6 6 14.2V16h8V28H0Zm20 0V16.8c0-4.533 1.2-8.4 3.6-11.6C26.067 2 29.6 0.4 34.2 0l1.4 2.8c-3.333.8-5.6 2.267-7.2 4.4C26.8 9.267 26 11.6 26 14.2V16h8V28H20Z"
      fill="currentColor"
    />
  </svg>
);

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  const t = testimonials[active];

  return (
    <section className="relative overflow-hidden bg-primary section-spacing">
      {/* Decorative background botanical pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c6a983' fill-opacity='1'%3E%3Cpath d='M30 5C16.2 5 5 16.2 5 30s11.2 25 25 25 25-11.2 25-25S43.8 5 30 5zm0 45C18.95 50 10 41.05 10 30S18.95 10 30 10s20 8.95 20 20-8.95 20-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative container-main">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand">
            Reviews
          </p>
          <h2 className="mt-3 text-3xl text-white font-display md:text-4xl">
            From Our Nilgiri Community
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">{QUOTE_ICON}</div>
              <StarRow rating={t.rating} />
              <p className="mt-6 text-xl leading-relaxed font-display text-white/90 md:text-2xl">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-8">
                <p className="text-sm font-semibold font-body text-sand">{t.name}</p>
                <p className="mt-1 text-xs font-body text-white/50">{t.location}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex items-center justify-center w-10 h-10 transition-all border rounded-full border-white/20 text-white/60 hover:border-white/50 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-8 bg-sand' : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="flex items-center justify-center w-10 h-10 transition-all border rounded-full border-white/20 text-white/60 hover:border-white/50 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
