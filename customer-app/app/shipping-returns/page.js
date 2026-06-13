'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ShippingReturnsPage() {
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
              Shipping & Returns
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-body text-base text-on-surface-variant"
            >
              Everything you need to know about receiving your artisanal wellness products.
            </motion.p>
          </div>
        </header>

        {/* Content Section */}
        <section className="py-16 md:py-24 px-5">
          <div className="max-w-3xl mx-auto space-y-12 text-on-surface-variant font-body leading-relaxed text-sm md:text-base">
            
            {/* Shipping Policy */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-charcoal border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-[28px] text-secondary">local_shipping</span>
                <h2 className="font-display text-2xl m-0">Shipping Policy</h2>
              </div>
              
              <div>
                <h3 className="font-body font-bold text-charcoal mb-2">Processing Time</h3>
                <p>
                  Because our products are handcrafted in small batches in Ooty, please allow 1-3 business days for your order to be processed and prepared for dispatch. Orders placed on weekends or public holidays will be processed on the next business day.
                </p>
              </div>

              <div>
                <h3 className="font-body font-bold text-charcoal mb-2">Shipping Rates & Estimates</h3>
                <p className="mb-2">We offer shipping across India. Shipping charges for your order will be calculated and displayed at checkout.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Standard Shipping:</strong> Typically takes 4-7 business days depending on your location.</li>
                  <li><strong>Free Shipping:</strong> We offer free standard shipping on orders above ₹500 within India.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-body font-bold text-charcoal mb-2">Packaging</h3>
                <p>
                  We are committed to sustainability. Your items will be packed using eco-friendly, recyclable materials designed to protect delicate glass bottles and soaps during transit while minimizing environmental impact.
                </p>
              </div>
            </div>

            {/* Return Policy */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-charcoal border-b border-outline-variant/30 pb-4">
                <span className="material-symbols-outlined text-[28px] text-secondary">assignment_return</span>
                <h2 className="font-display text-2xl m-0">Return & Refund Policy</h2>
              </div>
              
              <div>
                <p className="mb-4">
                  Due to the hygienic nature of personal care products, essential oils, and handmade soaps, we generally do not accept returns or exchanges once a product has been opened or used. 
                </p>
              </div>

              <div>
                <h3 className="font-body font-bold text-charcoal mb-2">Damaged or Defective Items</h3>
                <p>
                  If you receive a product that is damaged during shipping, defective, or incorrect, please contact us within <strong>48 hours</strong> of receiving your delivery. Please email us at <a href="mailto:hello@venusooty.com" className="text-secondary hover:underline">hello@venusooty.com</a> with your order number and clear photos of the damaged item and packaging. We will gladly arrange for a replacement or a full refund.
                </p>
              </div>

              <div>
                <h3 className="font-body font-bold text-charcoal mb-2">Refund Process</h3>
                <p>
                  Approved refunds will be processed automatically to your original method of payment within 5-7 business days. Please remember it can take some time for your bank or credit card company to process and post the refund.
                </p>
              </div>
              
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
                <h3 className="font-body font-bold text-charcoal mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">help</span>
                  Need Help?
                </h3>
                <p className="text-sm">
                  If you have any questions about your order's shipping status or our return policy, please reach out to our customer care team at <a href="mailto:hello@venusooty.com" className="text-secondary font-medium hover:underline">hello@venusooty.com</a> or call us at the number listed on our contact page.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
