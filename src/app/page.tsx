'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSlider from '@/components/HeroSlider';
import DeliveryStrip from '@/components/DeliveryStrip';
import FeaturedCategories from '@/components/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyChooseUs from '@/components/WhyChooseUs';
import FarmStories from '@/components/FarmStories';
import LiveFarmStream from '@/components/LiveFarmStream';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

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

      <div className="py-24">
        <FarmStories />
      </div>

      {/* Elite Live Transparency Section */}
      <LiveFarmStream />

      <div className="bg-white py-24">
        <WhyChooseUs />
      </div>
      <Footer />
    </main>
  );
}
