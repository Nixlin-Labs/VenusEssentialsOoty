import "./globals.css";
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import SearchModal from '@/components/layout/SearchModal';

export const metadata = {
  title: "Venus Essentials — Premium Wellness from Ooty",
  description: "Premium coffee powders, tea blends, essential oils and artisanal chocolates from the hills of Ooty. 40+ years of heritage wellness crafted with love.",
  keywords: ["Venus Essentials", "Ooty", "coffee powder", "tea powder", "essential oils", "chocolates", "wellness", "Nilgiri"],
  openGraph: {
    title: "Venus Essentials — Premium Wellness from Ooty",
    description: "Premium coffee, tea, essential oils and chocolates from the hills of Ooty. 40+ years of heritage wellness.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <AuthModal />
        <SearchModal />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-lg)',
            },
          }}
        />
      </body>
    </html>
  );
}
