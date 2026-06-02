import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Venus Ooty Essentials – Pure Nilgiri Botanicals',
  description:
    'Handcrafted wellness products from the Nilgiri highlands. Shop pure botanical oils, herbal teas, and skincare from Ooty.',
  keywords: [
    'Ooty essentials',
    'Nilgiri botanicals',
    'natural skincare',
    'organic wellness India',
    'herbal tea Ooty',
    'essential oils India',
  ],
  openGraph: {
    title: 'Venus Ooty Essentials – Pure Nilgiri Botanicals',
    description:
      'Handcrafted wellness products from the Nilgiri highlands. Shop pure botanical oils, herbal teas, and skincare from Ooty.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venus Ooty Essentials – Pure Nilgiri Botanicals',
    description:
      'Handcrafted wellness products from the Nilgiri highlands. Shop pure botanical oils, herbal teas, and skincare from Ooty.',
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Venus Ooty Essentials',
  description: 'Artisanal wellness products from the Nilgiri highlands',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '14 Botanical Garden Road',
    addressLocality: 'Ooty',
    addressRegion: 'Tamil Nadu',
    postalCode: '643001',
    addressCountry: 'IN',
  },
  email: 'hello@venusooty.com',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
