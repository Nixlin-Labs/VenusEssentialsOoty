'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
              <p className="mb-4">
                At Venus Ooty Essentials, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website venusooty.com or purchase our products.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site (such as purchasing a product).</li>
                <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, or exchange information about our services from the Site. Note: Financial data is securely processed by Razorpay, and we do not store full credit card numbers on our servers.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">2. Use of Your Information</h2>
              <p className="mb-4">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                <li>Create and manage your account.</li>
                <li>Email you regarding your account or order.</li>
                <li>Deliver targeted advertising, newsletters, and other information regarding promotions and the Site to you.</li>
                <li>Improve our products and the customer experience on our website.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">3. Disclosure of Your Information</h2>
              <p className="mb-4">
                We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay), data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
              </ul>
              <p className="mt-4 text-charcoal font-medium">We do not sell, rent, or trade your personal information to third parties.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">4. Cookies and Web Beacons</h2>
              <p>
                We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. You can choose to accept or decline cookies through your browser settings. However, declining cookies may prevent you from taking full advantage of the website.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-charcoal mb-4">5. Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </div>

            <div className="pt-8 border-t border-outline-variant/30">
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:hello@venusooty.com" className="text-secondary hover:text-charcoal underline underline-offset-4">hello@venusooty.com</a>.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
