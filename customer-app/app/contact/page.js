'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSettingsStore } from '@/lib/settingsStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PinIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 8l10 7 10-7" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.52 3.48A11.8 11.8 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.58 5.93L0 24l6.39-1.67a11.84 11.84 0 0 0 5.66 1.44h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.41-8.42ZM12.06 21.77a9.82 9.82 0 0 1-5-1.37l-.36-.21-3.79.99 1.01-3.7-.24-.38a9.8 9.8 0 0 1-1.5-5.23c0-5.43 4.42-9.85 9.86-9.85a9.8 9.8 0 0 1 6.97 2.89 9.8 9.8 0 0 1 2.88 6.96c0 5.44-4.42 9.86-9.84 9.86Zm5.4-7.38c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.19.3-.76.98-.93 1.18-.17.2-.34.22-.64.08-.3-.15-1.25-.46-2.38-1.48-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.38-.27.3-1.04 1.01-1.04 2.46s1.07 2.86 1.22 3.06c.15.2 2.09 3.19 5.06 4.47.71.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.71.25-1.31.17-1.43-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}
export default function ContactPage() {
  const { settings } = useSettingsStore();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });
    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      setStatus({ loading: false, error: '', success: true });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false });
    }
  };

  return (
    <>
      <Navbar activeLink="Contact Us" />
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
              Get in Touch
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-primary mb-6"
            >
              Contact Us
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-body text-base md:text-lg text-primary-container leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Whether you have a question about our artisanal processes, need assistance with an order, or simply want to connect with nature&apos;s essence, we are here for you.
            </motion.p>
          </div>
        </header>

        <div className="container-main py-16">

          <div className="grid gap-12 mt-16 lg:grid-cols-5">
            <div className="p-8 bg-white rounded-xl shadow-botanical lg:col-span-3">
              <h2 className="text-2xl font-display text-charcoal">Send us a message</h2>
              
              {status.success ? (
                <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center border border-primary/20">
                  <div className="text-4xl mb-4">🌿</div>
                  <h3 className="text-xl font-display text-charcoal mb-2">Message Sent Successfully</h3>
                  <p className="text-on-surface-variant text-sm font-body">
                    Thank you for reaching out to us. We will get back to you as soon as possible.
                  </p>
                  <button onClick={() => setStatus({ ...status, success: false })} className="mt-6 text-primary hover:underline text-sm font-medium">
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  {status.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{status.error}</div>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-body text-xs text-[#727973]">
                        Full Name
                      </label>
                      <input name="name" value={formData.name} onChange={handleChange} required type="text" className="input-field" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="mb-2 block font-body text-xs text-[#727973]">
                        Email Address
                      </label>
                      <input name="email" value={formData.email} onChange={handleChange} required type="email" className="input-field" placeholder="you@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-xs text-[#727973]">
                      Subject
                    </label>
                    <input name="subject" value={formData.subject} onChange={handleChange} required type="text" className="input-field" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="mb-2 block font-body text-xs text-[#727973]">
                      Message
                    </label>
                    <textarea
                      name="message" value={formData.message} onChange={handleChange} required
                      rows={4}
                      className="resize-none input-field"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="px-6 py-3 text-sm tracking-wider text-white uppercase rounded-md bg-primary-container font-body hover:bg-secondary disabled:opacity-50"
                  >
                    {status.loading ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-display text-charcoal">Our Workshop</h2>
              <ul className="mt-8 space-y-6">
                <li className="flex gap-4">
                  <PinIcon />
                  <div className="text-sm leading-relaxed font-body text-on-surface-variant">
                    <p className="font-medium text-charcoal">{settings?.company_name || 'Venus Ooty Essentials'}</p>
                    <p className="whitespace-pre-wrap">{settings?.company_address || '14 Botanical Garden Road\nOoty, Tamil Nadu 643001\nIndia'}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <EnvelopeIcon />
                  <a
                    href={`mailto:${settings?.company_email || 'hello@venusooty.com'}`}
                    className="text-sm font-body text-on-surface-variant hover:text-charcoal"
                  >
                    {settings?.company_email || 'hello@venusooty.com'}
                  </a>
                </li>
                <li className="flex gap-4">
                  <ChatIcon />
                  <span className="text-sm font-body text-on-surface-variant">
                    {settings?.company_phone || '+91 98765 43210'}
                  </span>
                </li>
                <li className="flex gap-4">
                  <WhatsAppIcon />
                  <span className="text-sm font-body text-on-surface-variant">
                    {settings?.whatsapp_number ||'+91 98765 43210'}
                  </span>
                </li>
              </ul>
              <div className="relative mt-8 overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
                  alt="Stylized map of Ooty region"
                  className="object-cover w-full h-48"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md">
                    <PinIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
