'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { craftItems, values } from '@/lib/data';

function BentoCard({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  if (item.type === 'image-large') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.15, duration: 0.6 }}
        className={`relative min-h-[280px] overflow-hidden rounded-xl ${
          index === 0 ? 'md:col-span-1 md:row-span-1' : 'md:col-span-1'
        }`}
      >
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(27,28,25,0.85) 0%, transparent 50%)',
          }}
        />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-2xl font-display">{item.title}</h3>
          <p className="max-w-sm mt-2 text-sm font-body text-white/90">
            {item.description}
          </p>
          {item.checklist && (
            <ul className="mt-4 space-y-1 text-sm font-body">
              {item.checklist.map((c) => (
                <li key={c}>⊙ {c}</li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="flex min-h-[220px] flex-col justify-center rounded-xl bg-surface p-8 shadow-card"
    >
      <div className="mb-4 text-primary-container">
        {item.icon === 'droplet' && (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
          </svg>
        )}
        {item.icon === 'hourglass' && (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M6 2h12v4l-4 4 4 4v4H6v-4l4-4-4-4V2z" />
          </svg>
        )}
      </div>
      <h3 className="font-display text-[22px] text-charcoal">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed font-body text-on-surface-variant">
        {item.description}
      </p>
    </motion.div>
  );
}

export default function OurStoryPage() {
  return (
    <>
      <Navbar activeLink="Our Story" />
      <main className="pt-24">
        <section className="relative flex min-h-[60vh] items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1632678008080-723a9c4a58e7?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=1920&q=80"
            alt="Nilgiri misty hills"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(23,49,36,0.55) 0%, rgba(23,49,36,0.75) 100%)',
            }}
          />
          <div className="relative z-10 py-32 text-center container-main">
            <p className="font-body text-xs font-medium uppercase tracking-[0.25em] text-sand">
              Our Story
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white drop-shadow-md md:text-[52px]">
              Rooted in the Clouds of Ooty
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-base leading-relaxed font-body text-white/90">
              Born in the misty Nilgiri highlands, Venus Ooty Essentials began as a small
              workshop dedicated to preserving the ancient art of botanical distillation. Today,
              we share the pure essence of the Blue Mountains with wellness seekers worldwide.
            </p>
          </div>
        </section>

        <section className="section-gap bg-surface">
          <div className="grid gap-12 container-main lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-4xl font-display text-charcoal">
                The Nilgiri Heritage
              </h2>
              <div className="mt-4 h-0.5 w-16 bg-sand" />
              <p className="mt-6 font-body text-[15px] leading-[1.8] text-on-surface-variant">
                The Nilgiri Biosphere Reserve—India&apos;s first UNESCO World Heritage site—is
                home to over 3,000 species of flowering plants. The unique combination of altitude,
                mist, and red laterite soil creates botanicals of extraordinary potency.
              </p>
              <p className="mt-4 font-body text-[15px] leading-[1.8] text-on-surface-variant">
                We partner with third-generation cultivators and distillers who have tended these
                hills for decades, ensuring every drop of oil and every bar of soap carries the
                authentic spirit of Ooty.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1674498260932-6f7d8eed6d9f?q=80&w=773&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80"
              alt="Nilgiri tea gardens"
              className="w-full rounded-xl shadow-botanical"
            />
          </div>
        </section>

        <section className="section-gap bg-surface-container">
          <div className="container-main">
            <h2 className="text-4xl text-center font-display text-charcoal">
              Artisanal Craftsmanship
            </h2>
            <p className="mt-2 text-center font-body text-on-surface-variant">
              Handmade & Small Batch
            </p>
            <div className="grid gap-4 mt-12 md:grid-cols-2">
              {craftItems.map((item, index) => (
                <BentoCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap bg-surface">
          <div className="container-main">
            <h2 className="text-4xl text-center font-display text-charcoal">Our Values</h2>
            <div className="grid gap-8 mt-12 md:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="flex gap-6 p-8 rounded-xl bg-surface-container-low">
                  <div className="flex items-center justify-center rounded-full h-14 w-14 shrink-0 bg-primary/10">
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontSize: '28px' }}
                    >
                      {v.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[22px] text-charcoal">{v.title}</h3>
                    <p className="mt-3 font-body text-[15px] leading-relaxed text-on-surface-variant">
                      {v.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
