'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveFarmStream from '@/components/LiveFarmStream';

export default function StreamsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      
      {/* Immersive Stream View */}
      <div className="pt-20">
        <LiveFarmStream />
      </div>

      <Footer />
    </main>
  );
}
