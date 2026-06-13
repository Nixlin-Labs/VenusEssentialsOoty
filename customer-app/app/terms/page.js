'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="bg-background text-on-background font-body antialiased overflow-x-hidden min-h-screen">
        {/* Page Header */}
        <header className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b border-outline-variant/30 text-center px-5 bg-surface-container-low">
          <div className="max-w-3xl mx-auto relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl md:text-5xl text-primary mb-4"
            >
              Terms of Service
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-body text-base text-on-surface-variant"
            >
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </motion.p>
          </div>
        </header>

        {/* Content Section */}
        <section className="py-16 md:py-24 px-5">
          <div className="max-w-3xl mx-auto space-y-8 text-on-surface-variant font-body leading-relaxed text-sm md:text-base">
            
            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">1. Introduction</h2>
              <p className="mb-4">
                Welcome to Venus Ooty Essentials. These Terms of Service ("Terms") govern your use of our website located at venusooty.com (the "Site") and our botanical and wellness products (the "Products"). By accessing or using our Site, you agree to be bound by these Terms.
              </p>
              <p>
                If you do not agree to these Terms, please do not use our Site or purchase our Products. We reserve the right to update or modify these Terms at any time without prior notice.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">2. Products & Artisanal Variations</h2>
              <p className="mb-4">
                Our products are handcrafted in small batches using natural ingredients sourced from the Nilgiri hills. Due to the artisanal nature of our production and natural variations in botanical crops, slight differences in color, scent, or texture may occur between batches. These variations do not compromise the quality or efficacy of the product.
              </p>
              <p>
                All product descriptions, pricing, and availability are subject to change at any time without notice. We reserve the right to discontinue any product at any time.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">3. Medical Disclaimer</h2>
              <p>
                The information provided on our Site, including details about essential oils and botanical ingredients, is for educational purposes only and is not intended as medical advice. Our products are not intended to diagnose, treat, cure, or prevent any disease. Always consult with a qualified healthcare provider before using essential oils, especially if you are pregnant, nursing, or have a medical condition.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">4. Orders & Payment</h2>
              <p className="mb-4">
                By placing an order, you agree to provide current, complete, and accurate purchase and account information. We use Razorpay as our secure payment gateway. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">5. Intellectual Property</h2>
              <p>
                All content included on this Site, such as text, graphics, logos, images, and software, is the property of Venus Ooty Essentials and is protected by Indian and international copyright laws. You may not reproduce, distribute, or create derivative works from this content without our express written permission.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">6. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by applicable law, Venus Ooty Essentials shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Site or Products.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">7. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, specifically the jurisdiction of the courts in Ooty, Tamil Nadu, without regard to its conflict of law principles.
              </p>
            </div>

            <div className="pt-8 border-t border-outline-variant/30">
              <p>
                If you have any questions about these Terms, please contact us at <a href="mailto:hello@venusooty.com" className="text-secondary hover:text-charcoal underline underline-offset-4">hello@venusooty.com</a>.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
