'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import DeliveryStrip from '@/components/DeliveryStrip';
import FeaturedCategories from '@/components/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';
import IgoBrandsScroll from '@/components/IgoBrandsScroll';

// Lazy-load heavy below-the-fold components for faster initial page load
const WhyChooseUs = dynamic(() => import('@/components/WhyChooseUs'), { ssr: false });
const FarmStories = dynamic(() => import('@/components/FarmStories'), { ssr: false });
const LiveFarmStream = dynamic(() => import('@/components/LiveFarmStream'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSlider />
      <DeliveryStrip />
      
      <div className="container mx-auto px-6 md:px-10 py-24">
        <FeaturedCategories />
      </div>

      <div className="bg-[#f9f9f7] py-24">
        <div className="container mx-auto px-6 md:px-10">
          <FeaturedProducts />
        </div>
      </div>

      <div className="py-24 below-fold">
        <FarmStories />
      </div>

      {/* Elite Live Transparency Section */}
      <div className="below-fold">
        <LiveFarmStream />
      </div>

      <div className="bg-white py-24 below-fold">
        <WhyChooseUs />
      </div>

      {/* IGO Group – 26 brands scrolling marquee */}
      <div className="below-fold">
        <IgoBrandsScroll />
      </div>

      <Footer />
    </main>
  );
}
