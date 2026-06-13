'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Static fallback data shown while loading or if API fails
const FALLBACK = [
  {
    _id: 'f1',
    name: 'Priya Sharma',
    location: 'Bangalore',
    text: "The Nilgiri Eucalyptus Oil is unlike anything I've tried. Pure, potent, and instantly transports me to the misty hills.",
    rating: 5,
  },
  {
    _id: 'f2',
    name: 'James Mitchell',
    location: 'London',
    text: 'Wild Vetiver Soap has become my daily ritual. The earthy scent and creamy lather are absolutely divine.',
    rating: 5,
  },
  {
    _id: 'f3',
    name: 'Ananya Reddy',
    location: 'Chennai',
    text: 'Finally, skincare that feels as pure as the Nilgiris themselves. Venus Ooty Essentials is a treasure.',
    rating: 5,
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5 text-sand justify-center">
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
  const [testimonials, setTestimonials] = useState(FALLBACK);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${API_BASE}/testimonials`);
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        const items = json?.data;
        if (Array.isArray(items) && items.length > 0) {
          setTestimonials(items);
          setActive(0);
        }
      } catch {
        // keep fallback
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  const t = testimonials[active] || testimonials[0];

  return (
    <section className="relative overflow-hidden bg-primary section-spacing">
      {/* Decorative background botanical pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c6a983' fill-opacity='1'%3E%3Cpath d='M30 5C16.2 5 5 16.2 5 30s11.2 25 25 25 25-11.2 25-25S43.8 5 30 5zm0 45C18.95 50 10 41.05 10 30S18.95 10 30 10s20 8.95 20 20-8.95 20-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">

        {/* Section heading */}
        <div className="mb-10 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mb-3">
            Reviews
          </p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-primary">
            From Our Nilgiri Community
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center animate-pulse py-6">
              <div className="flex justify-center mb-6 opacity-30">{QUOTE_ICON}</div>
              <div className="flex justify-center gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-white/15 rounded-full" />
                ))}
              </div>
              <div className="space-y-3 flex flex-col items-center">
                <div className="h-5 w-5/6 bg-white/15 rounded" />
                <div className="h-5 w-4/6 bg-white/15 rounded" />
                <div className="h-5 w-2/3 bg-white/15 rounded" />
              </div>
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="h-4 w-24 bg-white/15 rounded" />
                <div className="h-3.5 w-16 bg-white/15 rounded" />
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={t._id || active}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">{QUOTE_ICON}</div>
                  <StarRow rating={t.rating} />
                  <p className="mt-6 text-xl leading-relaxed font-display text-on-primary/90 md:text-2xl">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-8">
                    <p className="text-sm font-semibold font-body text-sand">{t.name}</p>
                    {t.location && (
                      <p className="mt-1 text-xs font-body text-on-primary/50">{t.location}</p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mt-10">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="flex items-center justify-center w-10 h-10 transition-all border rounded-full border-on-primary/20 text-on-primary/60 hover:border-on-primary/50 hover:text-on-primary"
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
                        i === active ? 'w-8 bg-sand' : 'w-1.5 bg-on-primary/30'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Next testimonial"
                  className="flex items-center justify-center w-10 h-10 transition-all border rounded-full border-on-primary/20 text-on-primary/60 hover:border-on-primary/50 hover:text-on-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
