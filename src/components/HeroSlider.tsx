'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/TranslationContext';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  media_url: string;
  type: 'image' | 'video';
  theme: 'light' | 'dark';
}

const PERMANENT_SLIDE: Slide = {
  id: 'permanent-hero-video',
  title: 'Farmers Factory',
  subtitle: 'Direct from the fields to your home. Harvesting purity, delivering health within 24 hours.',
  cta: 'Shop Fresh Harvest',
  href: '/products',
  media_url: '/header_video.mp4', 
  type: 'video',
  theme: 'dark'
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'default-2',
    title: 'Pure Organic Fruits',
    subtitle: 'Taste the sweetness of nature with our hand-picked 3D organic fruits, delivered fresh within 24 hours.',
    cta: 'Shop Fruits',
    href: '/products?category=Fruits',
    media_url: '/banners/fruits_3d.png',
    type: 'image',
    theme: 'dark'
  },
  {
    id: 'default-3',
    title: 'Traditional Valluvam',
    subtitle: 'Experience the purity of ancient traditions with our curated Valluvam collection.',
    cta: 'Explore Valluvam',
    href: '/products?category=Valluvam Products',
    media_url: '/banners/valluvam_3d.png',
    type: 'image',
    theme: 'dark'
  }
];

export default function HeroSlider() {
  const { t } = useTranslation();
  const [slides, setSlides] = useState<Slide[]>([PERMANENT_SLIDE]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDynamicBanners() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dynamicSlides: Slide[] = data.map((b: any) => ({
            id: b.id,
            title: b.title || 'Organic Freshness',
            subtitle: b.subtitle || 'Fresh from our fields to your table.',
            cta: b.cta_text || 'Explore More',
            href: b.cta_link || '/products',
            media_url: b.media_url,
            type: b.media_type || 'image',
            theme: 'dark'
          }));
          setSlides([PERMANENT_SLIDE, ...dynamicSlides]);
        } else {
          setSlides([PERMANENT_SLIDE, ...DEFAULT_SLIDES]);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic banners:', err);
        setSlides([PERMANENT_SLIDE, ...DEFAULT_SLIDES]);
      } finally {
        setLoading(false);
      }
    }
    fetchDynamicBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 1.25; // 8 seconds total (100 / (8000/100))
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, slides.length]);

  const slideVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 45 : -45,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.6 },
        rotateY: { duration: 0.8 },
        scale: { duration: 0.8 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? -45 : 45,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  };

  if (loading) return (
    <div className="h-[95vh] w-full bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Harvesting Experience...</p>
      </div>
    </div>
  );

  const currentSlide = slides[currentIndex];

  const getTranslatedSlide = (slide: Slide) => {
    if (!slide) return { title: '', subtitle: '', cta: '' };
    let titleKey = '';
    let subtitleKey = '';
    let ctaKey = '';

    if (slide.id === 'permanent-hero-video') {
      titleKey = 'hero.permanent.title';
      subtitleKey = 'hero.permanent.subtitle';
      ctaKey = 'hero.permanent.cta';
    } else if (slide.id === 'default-2') {
      titleKey = 'hero.fruits.title';
      subtitleKey = 'hero.fruits.subtitle';
      ctaKey = 'hero.fruits.cta';
    } else if (slide.id === 'default-3') {
      titleKey = 'hero.valluvam.title';
      subtitleKey = 'hero.valluvam.subtitle';
      ctaKey = 'hero.valluvam.cta';
    }

    return {
      title: titleKey ? t(titleKey) : t(slide.title),
      subtitle: subtitleKey ? t(subtitleKey) : t(slide.subtitle),
      cta: ctaKey ? t(ctaKey) : t(slide.cta)
    };
  };

  const translated = getTranslatedSlide(currentSlide);

  if (!currentSlide) return null;

  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-black [perspective:2000px]">
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <motion.div 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
            className="w-full h-full"
          >
            {currentSlide.type === 'video' ? (
              <video
                key={currentSlide.media_url}
                src={currentSlide.media_url}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={currentSlide.media_url}
                alt={currentSlide.title}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
          
          {/* Seamless Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center pt-32 md:pt-40 pointer-events-none">
        <div className="relative w-full flex flex-col justify-center">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={`content-${currentIndex}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -direction * 100, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-full max-w-2xl flex flex-col justify-center pointer-events-auto"
            >
              {/* No Box - Pure Transparent Floating Content */}
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-block px-6 py-2 bg-primary/10 backdrop-blur-xl rounded-full text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-12 border border-primary/20 w-fit shadow-2xl"
            >
              {t('hero.guaranteed')}
            </motion.span>
            
            <h1 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter uppercase drop-shadow-2xl">
              {translated.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? 'text-primary' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-14 max-w-xl font-medium leading-relaxed drop-shadow-lg">
              {translated.subtitle}
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Link 
                href={currentSlide.href}
                className="group relative bg-primary text-white px-12 py-6 rounded-full font-black flex items-center gap-4 hover:bg-white hover:text-primary transition-all transform hover:scale-105 shadow-2xl shadow-primary/40 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="uppercase tracking-widest text-sm relative z-10">{translated.cta}</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform relative z-10" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

      {/* Controls */}
      <div className="absolute bottom-10 right-10 z-20 flex items-center gap-4">
        {currentSlide.type === 'video' && (
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        )}
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <div className="absolute top-1/2 -translate-y-1/2 left-10 z-20 hidden md:block">
            <button 
              onClick={prevSlide}
              className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-primary transition-all transform hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-10 z-20 hidden md:block">
            <button 
              onClick={nextSlide}
              className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-primary transition-all transform hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </>
      )}

      {/* Slide Indicators & Progress */}
      <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-6">
        <div className="flex gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
                setProgress(0);
              }}
              className="group relative"
            >
              <div className={`h-1.5 transition-all duration-500 rounded-full bg-white/20 overflow-hidden ${
                i === currentIndex ? 'w-16' : 'w-8 hover:w-12 hover:bg-white/40'
              }`}>
                {i === currentIndex && (
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                )}
              </div>
              <span className={`absolute -top-6 left-0 text-[10px] font-bold text-white transition-opacity duration-300 ${
                i === currentIndex ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
              }`}>
                0{i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
