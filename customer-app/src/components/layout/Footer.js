import Link from 'next/link';

const footerLinks = {
  shop: [
    { href: '/categories/coffee-powders', label: 'Coffee Powders' },
    { href: '/categories/tea-powders', label: 'Tea Powders' },
    { href: '/categories/essential-oils', label: 'Essential Oils' },
    { href: '/categories/chocolates', label: 'Chocolates' },
    { href: '/shop', label: 'All Products' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/heritage', label: 'Our Heritage' },
    { href: '/contact', label: 'Contact Us' },
  ],
  support: [
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white" id="site-footer">
      {/* Heritage Band */}
      <div className="bg-forest-800 py-8">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🌿', label: '100% Natural', desc: 'Pure ingredients' },
            { icon: '🏔️', label: 'Ooty Origin', desc: 'Nilgiri hills' },
            { icon: '⏳', label: '40+ Years', desc: 'Heritage brand' },
            { icon: '🚚', label: 'Free Shipping', desc: 'Orders above ₹500' },
          ].map((item, i) => (
            <div key={i} className="group">
              <span className="text-2xl block mb-2 group-hover:animate-float">{item.icon}</span>
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-xs text-forest-300 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <h2 className="font-display text-2xl font-bold text-white">Venus Essentials</h2>
              <p className="text-forest-300 text-xs tracking-[0.2em] uppercase mt-1">Ooty · Since 1980</p>
            </Link>
            <p className="text-forest-300 text-sm mt-4 leading-relaxed">
              Crafting premium wellness products from the serene hills of Ooty for over four decades. 
              Every product carries the essence of Nilgiri heritage.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {['instagram', 'facebook', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 bg-forest-700 hover:bg-forest-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs text-forest-200 font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="label text-forest-200 mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-forest-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-forest-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-forest-400">
            © {new Date().getFullYear()} Venus Essentials. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-forest-400">Secure Payments via</span>
            <div className="flex items-center gap-2 bg-forest-800 px-3 py-1.5 rounded-md">
              <span className="text-[10px] font-bold text-forest-200">Razorpay</span>
              <span className="text-[10px] text-forest-400">|</span>
              <span className="text-[10px] text-forest-200">UPI</span>
              <span className="text-[10px] text-forest-400">|</span>
              <span className="text-[10px] text-forest-200">Cards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
