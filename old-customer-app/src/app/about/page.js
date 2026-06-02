'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AboutPage() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    api.get('/cms/pages/about-us').then(({ data }) => setPage(data.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-forest-900 py-20">
        <div className="container-tight text-center">
          <span className="text-forest-300 text-xs tracking-[0.3em] uppercase mb-3 block">Our Story</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">About Venus Essentials</h1>
          <p className="text-forest-200 text-lg mt-4 max-w-2xl mx-auto">
            Four decades of crafting premium wellness products from the heart of Ooty
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-tight py-16">
        <div className="max-w-3xl mx-auto prose prose-lg prose-headings:font-display prose-headings:text-forest-900 prose-p:text-charcoal-700 prose-a:text-forest-700">
          {page ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <>
              <h2>Our Heritage</h2>
              <p>
                Founded in 1980 in the serene hills of Ooty, Venus Essentials began as a small family venture 
                dedicated to preserving the rich wellness traditions of the Nilgiri hills. What started as a 
                passion for crafting the perfect coffee blend has evolved into a comprehensive wellness brand.
              </p>
              <h2>Our Mission</h2>
              <p>
                We are committed to bringing you the purest, most authentic products from the Nilgiris. 
                Every product is handcrafted with care, using traditional methods and the finest natural ingredients.
              </p>
              <h2>Quality Promise</h2>
              <p>
                We source directly from local farms and estates, ensuring freshness and supporting 
                the livelihoods of the communities that make our products possible.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
