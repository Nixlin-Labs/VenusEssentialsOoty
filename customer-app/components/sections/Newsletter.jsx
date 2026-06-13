'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Subscription failed');

      // Detect already-subscribed vs new/re-subscribed
      const msg = data.message || '';
      const isAlready = msg.toLowerCase().includes('already');
      setAlreadySubscribed(isAlready);
      setSuccessMsg(msg);
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-surface-container-low section-spacing">
      {/* Decorative side leaves */}
      <div
        className="absolute w-64 h-64 -translate-y-1/2 pointer-events-none -left-24 top-1/2 opacity-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 10 C140 50, 190 80, 180 140 C170 190, 100 200, 60 180 C20 160, 10 100, 30 60 C50 20, 80 -10, 100 10Z"
            fill="#173124"
          />
        </svg>
      </div>
      <div
        className="absolute w-64 h-64 rotate-180 -translate-y-1/2 pointer-events-none -right-24 top-1/2 opacity-10"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M100 10 C140 50, 190 80, 180 140 C170 190, 100 200, 60 180 C20 160, 10 100, 30 60 C50 20, 80 -10, 100 10Z"
            fill="#173124"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="max-w-xl mx-auto text-center">

          {/* Icon */}
          <span
            className="material-symbols-outlined text-sand"
            style={{ fontSize: '40px' }}
          >
            local_florist
          </span>

          {/* Heading */}
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mt-4 mb-3">
            Stay Connected
          </p>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Join the Nilgiri Circle
          </h2>
          <p className="mx-auto max-w-md font-body-md text-body-md leading-relaxed text-on-surface-variant">
            Receive seasonal wellness rituals, early access to new collections, and stories from
            our Ooty workshop straight to your inbox.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-3 px-6 py-3 mt-8 text-sm rounded-full font-body ${
                  alreadySubscribed
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <span
                  className={`material-symbols-outlined filled ${alreadySubscribed ? 'text-amber-500' : 'text-secondary'}`}
                  style={{ fontSize: '20px' }}
                >
                  {alreadySubscribed ? 'info' : 'check_circle'}
                </span>
                {successMsg || "You're on the list — welcome to the circle!"}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col max-w-sm gap-3 mx-auto mt-8 sm:flex-row"
                onSubmit={handleSubmit}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 input-field sm:text-left"
                  aria-label="Email for newsletter"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="py-3 text-sm tracking-wider text-on-primary uppercase transition-colors rounded-full shrink-0 bg-primary px-7 font-body hover:bg-primary-container disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                      Subscribing…
                    </>
                  ) : 'Subscribe'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-error font-body"
            >
              {error}
            </motion.p>
          )}

          <p className="mt-5 text-xs font-body text-outline">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
