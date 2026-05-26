'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';

export default function CmsPage({ params }) {
  const { slug } = use(params);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cms/pages/${slug}`)
      .then(({ data }) => setPage(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="skeleton h-40 w-full" />
        <div className="container-tight py-12 max-w-3xl mx-auto space-y-4">
          <div className="skeleton h-8 w-1/2 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container-tight py-20 text-center">
        <span className="text-5xl mb-4 block">📄</span>
        <h2 className="heading-section">Page Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-forest-900 py-16">
        <div className="container-tight text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{page.title}</h1>
        </div>
      </div>
      <div className="container-tight py-12">
        <div className="max-w-3xl mx-auto prose prose-lg prose-headings:font-display prose-headings:text-forest-900 prose-p:text-charcoal-700 prose-a:text-forest-700 prose-strong:text-charcoal-900">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </div>
    </div>
  );
}
