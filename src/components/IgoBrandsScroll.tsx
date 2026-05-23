'use client';

import React, { useState } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

// IGO Gold colour (exact match from igoagritechfarms.in)
const GOLD = '#c5a03f';

// ─── All 26 IGO Group brands — names, categories, logos extracted from live site ─
const IGO_BRANDS = [
  {
    id: 'igo-agritech-farms',
    name: 'IGO Agritech Farms',
    category: 'Core Business',
    logo: '/brands/igo agritech farms .webp',
    description: 'Leading agricultural engineering and infrastructure development for modern tech-enabled farming across India.',
    active: true,
  },
  {
    id: 'farmers-factory',
    name: 'Farmers Factory',
    category: 'Processing & Mfg',
    logo: '/brands/farmers factory .webp',
    description: 'State-of-the-art food processing and manufacturing division delivering pure, fresh, organic products directly to consumers.',
    active: true,
  },
  {
    id: 'valluvam',
    name: 'Valluvam',
    category: 'Agri Consultancy',
    logo: '/brands/valluvam .webp',
    description: 'Expert agricultural consultancy providing strategic guidance, research, and sustainable farming methodologies.',
    active: true,
  },
  {
    id: 'protein-cuts',
    name: 'Protein Cuts',
    category: 'Farm-to-Table',
    logo: '/brands/proten cuts .webp',
    description: 'Premium quality, ethically sourced meat and protein products delivered fresh from our trusted network of farms.',
    active: true,
  },
  {
    id: 'igo-agrimart',
    name: 'IGO Agri Mart',
    category: 'Distribution',
    logo: '/brands/igo agri mart .webp',
    description: 'Comprehensive agricultural distribution network supplying seeds, fertilizers, and essential farming equipment.',
    active: true,
  },
  {
    id: 'igo-nursery',
    name: 'IGO Nursery',
    category: 'Plant Propagation',
    logo: '/brands/igo nursery .webp',
    description: 'Advanced plant propagation center offering high-yield saplings and organic seedlings for commercial farming.',
    active: true,
  },
  {
    id: 'palm-cafe',
    name: 'Palm Cafe',
    category: 'F&B',
    logo: '/brands/palm cafe .webp',
    description: 'Farm-to-cafe dining experience showcasing our fresh produce through healthy, sustainable culinary creations.',
    active: true,
  },
  {
    id: 'igo-exports-imports',
    name: 'IGO Exports & Imports',
    category: 'Trade',
    logo: '/brands/tech farming export .webp',
    description: 'International trade division connecting Indian agri products to global markets and bringing world-class inputs to India.',
    active: true,
  },
  {
    id: 'igo-foundation',
    name: 'IGO Tech Farming Scientist Foundation',
    category: 'Foundation',
    logo: '/brands/igo-foundation.webp',
    description: 'Research and education foundation advancing agri-science and technology for the next generation of tech farming.',
    active: true,
  },
  {
    id: 'igo-mart',
    name: 'IGO Mart',
    category: 'Retail',
    logo: '/brands/igo mart .webp',
    description: 'Supermarket chain offering quality products at accessible prices — part of IGO Group\'s consumer retail vision.',
    active: true,
  },
  {
    id: 'igo-fintech',
    name: 'IGO Fintech',
    category: 'Fintech',
    logo: '/brands/igo fintech .webp',
    description: 'Micro finance unit providing financial support to farmers and agriculture entrepreneurs across India.',
    active: true,
  },
  {
    id: 'igo-farmgate-mandi',
    name: 'IGO Farmgate Mandi',
    category: 'Programme',
    logo: '/brands/igo farm gate mandi.webp',
    description: 'Direct procurement platform empowering farmers to sell produce straight from the farm gate at fair market prices.',
    active: true,
  },
  {
    id: 'igo-farm-land-estates',
    name: 'IGO Farm Land Estates',
    category: 'Real Estate',
    logo: '',
    description: 'Premier agricultural real estate division specializing in sustainable farm land development and management.',
    active: false,
  },
  {
    id: 'igo-wealth-management',
    name: 'IGO Wealth Management Services',
    category: 'Investment',
    logo: '',
    description: 'Expert financial advisory tailored for agricultural investments and rural wealth generation.',
    active: false,
  },
  {
    id: 'igo-franchise',
    name: 'IGO Franchise',
    category: 'Franchise',
    logo: '',
    description: 'Expanding our successful agricultural models through comprehensive franchise partnership opportunities.',
    active: false,
  },
  {
    id: 'igo-crop-care',
    name: 'IGO Crop Care',
    category: 'Agri Input',
    logo: '',
    description: 'Advanced agricultural input division focusing on organic pest control and sustainable crop protection.',
    active: false,
  },
  {
    id: 'igo-organic-pharmacy',
    name: 'IGO Organic Pharmacy',
    category: 'Healthcare',
    logo: '',
    description: 'Pioneering healthcare division integrating traditional medicinal plants with modern pharmaceutical standards.',
    active: false,
  },
  {
    id: 'igo-natural-cosmetics',
    name: 'IGO Natural Cosmetics',
    category: 'Lifestyle',
    logo: '',
    description: 'Premium organic beauty and personal care products crafted from naturally sourced farm ingredients.',
    active: false,
  },
  {
    id: 'igo-farm-factories',
    name: 'IGO Farm Factories',
    category: 'Infrastructure',
    logo: '',
    description: 'Building next-generation agricultural processing facilities for maximum yield and minimum waste.',
    active: false,
  },
  {
    id: 'igo-agrimart-sub',
    name: 'IGO AgriMart',
    category: 'Distribution',
    logo: '/brands/igo agri mart .webp',
    description: 'Comprehensive agricultural distribution network supplying seeds, fertilizers, and essential farming equipment.',
    active: true,
  },
  {
    id: 'india-green',
    name: 'India Green',
    category: 'Sustainability',
    logo: '',
    description: 'Dedicated sustainability initiative focusing on environmental conservation and green farming practices.',
    active: false,
  },
  {
    id: 'india-green-organics',
    name: 'India Green Organics',
    category: 'Organic',
    logo: '',
    description: 'Promoting chemical-free farming and certifying organic produce for national and international markets.',
    active: false,
  },
  {
    id: 'igo-farm-loans',
    name: 'IGO Farm Loans, Subsidy & Grants',
    category: 'Finance',
    logo: '',
    description: 'Facilitating financial access, government subsidies, and specialized grants for farmers across India.',
    active: false,
  },
  {
    id: 'igo-farm-automation',
    name: 'IGO Farm Automation',
    category: 'Technology',
    logo: '',
    description: 'Developing cutting-edge IoT solutions, drone technology, and automated systems for precision agriculture.',
    active: false,
  },
  {
    id: 'igo-training-courses',
    name: 'IGO Training Courses',
    category: 'Education',
    logo: '',
    description: 'Comprehensive educational programs empowering the next generation of farmers with modern agricultural techniques.',
    active: false,
  },
  {
    id: 'igo-green-energy',
    name: 'IGO Green Energy',
    category: 'Energy',
    logo: '',
    description: 'Renewable energy solutions for agricultural operations, including solar and biomass power generation.',
    active: false,
  },
] as const;

// ─── Single brand card — exact classes from igoagritechfarms.in ──────────────
function BrandCard({ brand }: { brand: (typeof IGO_BRANDS)[number] }) {
  const [imgError, setImgError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hasLogo = brand.logo && !imgError;

  return (
    <div
      className="shrink-0 w-[22rem] group bg-white border border-black/[0.08] rounded-[2rem] overflow-hidden transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/10 flex flex-col"
      onMouseEnter={() => !brand.active && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* ── Logo box — light grey bg, full width, tall ── */}
      <div className="w-full bg-[#f0f0f0] flex items-center justify-center relative" style={{ height: '220px' }}>
        {hasLogo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
            {/* Exact circle-with-border icon style as in the reference */}
            <div
              className="w-24 h-24 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm"
            >
              <Package size={36} strokeWidth={1.2} className="text-slate-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 text-center px-6 leading-loose">
              DEVELOPMENT<br/>IN PROGRESS
            </span>
          </div>
        )}

        {/* ── Coming Soon golden tooltip on hover (inactive only) ── */}
        {!brand.active && showTooltip && (
          <div
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg"
            style={{ background: GOLD, color: '#fff', letterSpacing: '0.15em' }}
          >
            Coming Soon
          </div>
        )}
      </div>

      {/* ── Text content area ── */}
      <div className="p-7 flex flex-col flex-1">
        {/* ── Category label ── */}
        <div
          className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2"
          style={{ color: GOLD }}
        >
          {brand.category}
        </div>

        {/* ── Brand name ── */}
        <h3 className="text-lg font-extrabold text-gray-900 mb-3 leading-snug">
          {brand.name}
        </h3>

        {/* ── Description ── */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {brand.description}
        </p>

        {/* ── Status badge ── */}
        <div className="mt-auto pt-4 border-t border-black/5">
          {brand.active ? (
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center justify-between w-full"
              style={{ color: GOLD }}
            >
              ACTIVE DIVISION
              <span className="text-base leading-none">&rarr;</span>
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between w-full">
              IN DEVELOPMENT
              <span className="text-base leading-none">&rarr;</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main exported section ────────────────────────────────────────────────────
export default function IgoBrandsScroll() {
  // Duplicate once → CSS animation translates -50% = seamless infinite loop
  const displayBrands = [...IGO_BRANDS, ...IGO_BRANDS];

  return (
    <section className="py-24 overflow-hidden border-t border-black/5" style={{ background: '#f7f6f3' }}>

      {/* ── Heading ── */}
      <div className="relative text-center mb-16 px-6 overflow-hidden">

        {/* Watermark Images behind text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
          aria-hidden="true"
        >
          {/* India Map Watermark (Left) */}
          <img
            src="/brands/background image of brand .webp"
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-[110%] -translate-y-[35%] w-[260px] md:w-[300px] opacity-[0.15] object-contain mix-blend-multiply"
          />
          
          {/* IGO Group Text Logo Watermark (Right) */}
          <img
            src="/brands/igo groups .webp"
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-[20%] -translate-y-[45%] w-[380px] md:w-[460px] opacity-[0.08] object-contain mix-blend-multiply grayscale"
          />
        </div>

        {/* Label row */}
        <div className="relative z-10 flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-10" style={{ background: `${GOLD}88` }} />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.4em]"
            style={{ color: GOLD }}
          >
            The Sovereign Ecosystem
          </p>
          <div className="h-px w-10" style={{ background: `${GOLD}88` }} />
        </div>

        {/* Main title — serif, large */}
        <h2
          className="relative z-10 text-5xl md:text-6xl font-black text-gray-950 mb-6 leading-tight drop-shadow-sm"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          The{' '}
          <span
            className="italic font-black"
            style={{ color: GOLD }}
          >
            26 Verticals
          </span>{' '}
          of IGO.
        </h2>

        {/* Subtitle */}
        <p className="relative z-10 text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed mb-10 drop-shadow-sm">
          A sovereign agricultural ecosystem covering Engineering,{' '}
          Production, Trade, and Consumer Lifestyle.
        </p>

        {/* Arrow nav row */}
        <div className="relative flex items-center justify-center gap-5">
          <button
            className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center text-gray-500 hover:border-black/40 transition-colors duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.35em] text-gray-400"
          >
            Explore All 26 Verticals
          </span>
          <button
            className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center text-gray-500 hover:border-black/40 transition-colors duration-200"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Scrolling track ── */}
      <div className="relative py-10 overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 h-full w-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, #f7f6f3 0%, transparent 100%)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 h-full w-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, #f7f6f3 0%, transparent 100%)' }}
        />

        {/* Animated strip */}
        <div className="igo-brands-track flex gap-8 pl-8 will-change-transform select-none w-max">
          {displayBrands.map((brand, i) => (
            <BrandCard key={`${brand.id}-${i}`} brand={brand} />
          ))}
        </div>
      </div>

    </section>
  );
}
