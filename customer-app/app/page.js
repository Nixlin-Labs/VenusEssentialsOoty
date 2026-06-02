"use client"
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import CuratedCollections from '@/components/sections/CuratedCollections';
import BestSellers from '@/components/sections/BestSellers';
import VenusPromise from '@/components/sections/VenusPromise';
import Testimonials from '@/components/sections/Testimonials';
import Newsletter from '@/components/sections/Newsletter';

export default function HomePage() {
  return (
    <>
      <Navbar activeLink="Home" />
      <main>
        <Hero />
        <CuratedCollections />
        <BestSellers />
        <VenusPromise />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
