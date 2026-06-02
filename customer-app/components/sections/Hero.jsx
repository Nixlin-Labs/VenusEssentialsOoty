'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-[921px] flex items-center justify-center overflow-hidden bg-surface-container-low">
      {/* Background Image and Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Misty Ooty Hills"
          className="object-cover object-center w-full h-full opacity-60"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSY0fQQPm7NXUC0TISiegYUfldg7gyEWkC4CTPGsBY1wc4mSx8oHhD0_bj_VUD8tn-sUX32y0J3p67jAA__sPf9oyH4jzcvo_61bOptBLunDGdzL5ypmtXx0Sf1Gu7otUxY5MQkgdONwLFb5TfRee1cKNJLFId8B4P9PXtvmyuIKUf4vLLqimxSXpdxBmOLG4w8kvQOzmyJuJuoziDziAJ1AQAaCzL7De9D59XyN8r_NKmME1xdTkY5u4cOJ4BmL_fUBc4a-2FfGA-"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl pb-20 mx-auto text-center px-margin-mobile md:px-margin-desktop">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.span
            variants={item}
            className="px-4 py-1 tracking-widest uppercase border rounded-full font-label-lg text-label-lg text-primary mb-stack-md bg-surface/50 backdrop-blur-sm border-outline/10"
          >
            Artisanal Wellness
          </motion.span>
          
          <motion.h1
            variants={item}
            className="leading-tight font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-lg"
          >
            Pure Essentials from the Hills of Ooty
          </motion.h1>
          
          <motion.p
            variants={item}
            className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant mb-stack-lg"
          >
            Discover our handcrafted collection of essential oils, natural skincare, and wellness rituals, distilled from the pristine Nilgiri highlands. Minimal luxury, bottled.
          </motion.p>
          
          <motion.div
            variants={item}
            className="flex flex-col justify-center w-full sm:flex-row gap-stack-md sm:w-auto"
          >
            <Link
              href="/shop"
              className="inline-flex justify-center items-center px-8 py-4 bg-primary text-on-primary font-body-sm text-body-sm font-medium rounded-DEFAULT hover:bg-primary-container transition-colors duration-300 min-w-[200px]"
            >
              Shop Now
            </Link>
            <Link
              href="/shop"
              className="inline-flex justify-center items-center px-8 py-4 bg-transparent border border-outline text-primary font-body-sm text-body-sm font-medium rounded-DEFAULT hover:bg-surface-container transition-colors duration-300 min-w-[200px]"
            >
              Explore Collection
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Organic curved transition bottom */}
      <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
        <svg className="w-full h-16 md:h-24 fill-background" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.71,113.84,106.39,122.9,160.8,119.53,212.87,116.29,267.75,76.51,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
}
