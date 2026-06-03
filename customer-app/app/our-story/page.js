'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function OurStoryPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const pillars = [
    {
      title: '100% Pure & Untouched',
      desc: 'Our botanical ingredients are sourced directly from high-altitude Nilgiri farms. Free from parabens, phthalates, synthetic fillers, or artificial fragrances.',
      icon: 'spa',
    },
    {
      title: 'Artisanal Small Batches',
      desc: 'To preserve the botanical integrity and potency, every oil, soap, and balm is handcrafted by local artisans in Ooty, ensuring absolute care in every vial.',
      icon: 'science',
    },
    {
      title: 'Slow Steam Distillation',
      desc: 'We extract our essential oils using traditional, low-pressure steam distillation, capturing the full therapeutic essence of Nilgiri eucalyptus, vetiver, and lemongrass.',
      icon: 'oil_barrel',
    },
    {
      title: 'Ecological Integrity',
      desc: 'We are committed to sustainable farming support, biodegradable packaging, and cruelty-free practices to ensure we give back as much as we harvest.',
      icon: 'eco',
    }
  ];

  return (
    <>
      <Navbar activeLink="Our Story" />
      <main className="bg-background text-on-background font-body antialiased overflow-x-hidden min-h-screen">
        
        {/* Page Hero */}
        <header className="relative pt-32 pb-20 md:pt-40 md:pb-28 border-b border-outline-variant/30 text-center px-5 overflow-hidden bg-surface-container-low">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-bg-ooty.png"
              alt="Misty Ooty Nilgiri Hills"
              className="object-cover object-center w-full h-full opacity-40 select-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          
          <div className="max-w-3xl mx-auto relative z-10">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mb-3"
            >
              The Essence of the Highlands
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-primary mb-6"
            >
              Our Story
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-body text-base md:text-lg text-primary-container leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Handcrafting pure, high-altitude botanical skincare and essential remedies from the misty peaks of Ooty since inception.
            </motion.p>
          </div>
        </header>

        {/* Section 1: About Us / The Beginning */}
        <section className="section-spacing max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Image/Visual Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container-low shadow-md border border-outline-variant/30 group"
            >
              <img
                src="/images/our-story-ooty.png"
                alt="Handcrafted in Ooty - Misty Nilgiri hills landscape"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                <span className="material-symbols-outlined text-[36px] text-sand mb-2">landscape</span>
                <h4 className="font-display text-xl text-white font-semibold">Handcrafted in Ooty</h4>
                <p className="font-body text-xs text-white/90 mt-2 leading-relaxed max-w-sm">
                  Deep within the misty Nilgiri hills (2,240m altitude), our workshop blends fresh mountain flora into daily wellness rituals.
                </p>
              </div>
            </motion.div>

            {/* Narrative Column */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-secondary">
                Where Purity Meets Altitude
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal leading-tight">
                Born in the Misty Nilgiris
              </h2>
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                Venus Ooty Essentials was founded with a singular, quiet purpose: to preserve and share the therapeutic botanical heritage of the Nilgiri Mountains. Nestled at heights where the air is pure and the soil is untouched, the Nilgiri hills support some of the most potent plant life in the world.
              </p>
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                We believe that modern wellness has become overly synthetic and complex. By stripping away artificial enhancers and returning to traditional extraction methods, we bring you slow-crafted, premium-grade essentials that reflect the calming, restorative spirit of Ooty.
              </p>
            </motion.div>

          </div>
        </section>

        {/* Section 2: Vision & Mission (Parallel Cards) */}
        <section className="bg-sand-50/30 py-20 border-y border-outline-variant/30">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Vision Card */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-outline-variant/40 p-8 rounded-2xl shadow-card flex flex-col items-center text-center group hover:border-primary/40 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary mb-6 transition-transform duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-[24px]">visibility</span>
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-4">Our Vision</h3>
                <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                  To revive ancient botanical remedies and lead a global return to zero-chemical wellness, establishing the Nilgiris as a recognized sanctuary of premium, eco-responsible artisanal distillation.
                </p>
              </motion.div>

              {/* Mission Card */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="bg-white border border-outline-variant/40 p-8 rounded-2xl shadow-card flex flex-col items-center text-center group hover:border-primary/40 transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary mb-6 transition-transform duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-[24px]">track_changes</span>
                </div>
                <h3 className="font-display text-2xl text-charcoal mb-4">Our Mission</h3>
                <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                  We handcraft pure essential oils, biological skincare, and remedies in Ooty. Through locally sourced, pesticide-free harvest and sustainable methods, we support Nilgiri farming communities while delivering absolute quality.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 3: Why Us */}
        <section className="section-spacing max-w-[1280px] mx-auto px-5 md:px-16">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-sand mb-2">
              Our Values
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal">
              Why Venus Ooty Essentials?
            </h2>
            <p className="font-body text-sm md:text-base text-on-surface-variant mt-4 leading-relaxed">
              Every detail of our process is designed to protect botanical potency and guarantee safety, from harvest to your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {pillars.map((p, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="flex gap-5 items-start p-2"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-container/20 text-secondary">
                  <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-body text-base font-bold text-charcoal tracking-wide">
                    {p.title}
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-primary py-20 md:py-24 text-center px-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c6a983' fill-opacity='1'%3E%3Cpath d='M30 5C16.2 5 5 16.2 5 30s11.2 25 25 25 25-11.2 25-25S43.8 5 30 5zm0 45C18.95 50 10 41.05 10 30S18.95 10 30 10s20 8.95 20 20-8.95 20-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl text-white">
              Experience the Purity of Ooty
            </h2>
            <p className="font-body text-sm md:text-base text-white/80 leading-relaxed max-w-lg mx-auto">
              Bring the calming eucalyptus forests, wild herbal pastures, and soothing floral essence of the highlands into your home.
            </p>
            <div className="pt-4">
              <Link 
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-sand text-primary px-8 py-3.5 font-body text-sm font-semibold tracking-wide shadow-md transition-all duration-300 hover:bg-white hover:text-primary active:scale-95"
              >
                Explore Collections
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
