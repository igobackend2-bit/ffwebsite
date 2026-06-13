'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Maximize2, X, ChevronLeft, ChevronRight, Share2, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string;
  name: string;
}

export default function ProductGallery({ images, videoUrl, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  
  const mainImageRef = useRef<HTMLDivElement>(null);

  const validImages = images.filter(img => img && img.trim() !== '');
  if (validImages.length === 0) validImages.push('/placeholder_product.webp');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  const renderVideo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      );
    }
    return (
      <video
        src={url}
        controls
        autoPlay
        preload="none"
        className="w-full h-full object-contain"
      />
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Check out this fresh ${name} on Farmer Factory!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12 h-full">
      {/* Professional Thumbnails Sidebar (Amazon Style) */}
      <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:max-h-[500px] lg:max-h-[700px] py-2 px-2 w-full md:w-32 lg:w-40 flex-shrink-0">
        {validImages.map((url, idx) => (
          <button
            key={idx}
            onMouseEnter={() => { setSelectedIndex(idx); setIsVideoSelected(false); }}
            onClick={() => { setSelectedIndex(idx); setIsVideoSelected(false); }}
            className={`relative flex-shrink-0 w-20 h-20 md:w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
              selectedIndex === idx && !isVideoSelected
                ? 'border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                : 'border-slate-100 bg-white hover:border-primary/30'
            }`}
          >
            <img 
              src={url} 
              alt={`${name} view ${idx + 1}`} 
              className="w-full h-full object-contain p-2" loading="lazy" />
          </button>
        ))}
        {videoUrl && (
          <button
            onMouseEnter={() => setIsVideoSelected(true)}
            onClick={() => setIsVideoSelected(true)}
            className={`relative flex-shrink-0 w-20 h-20 md:w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all duration-300 flex items-center justify-center group ${
              isVideoSelected 
                ? 'border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                : 'border-slate-900 shadow-lg'
            }`}
          >
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <Play className={`w-10 h-10 transition-transform group-hover:scale-125 ${isVideoSelected ? 'text-primary fill-primary' : 'text-white fill-white'}`} />
            </div>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm py-1.5 text-center">
              <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Video</span>
            </div>
          </button>
        )}
      </div>

      {/* Main Viewport */}
      <div className="order-1 md:order-2 flex-1 relative group">
        <div 
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => !isVideoSelected && setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onClick={() => !isVideoSelected && setIsLightboxOpen(true)}
          className="relative aspect-[4/5] md:aspect-square rounded-[4rem] overflow-hidden bg-white shadow-2xl border border-slate-100 flex items-center justify-center cursor-zoom-in"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isVideoSelected ? 'video' : selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="w-full h-full flex items-center justify-center"
            >
              {isVideoSelected && videoUrl ? (
                renderVideo(videoUrl)
              ) : (
                <img 
                  src={validImages[selectedIndex]} 
                  alt={name} 
                  className="w-full h-full object-contain p-8 md:p-12" loading="lazy" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Zoom Lens Overlay */}
          {showZoom && !isVideoSelected && (
            <div 
              className="absolute inset-0 pointer-events-none z-20 hidden lg:block"
              style={{
                backgroundImage: `url(${validImages[selectedIndex]})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}

          {/* Floating Actions */}
          <div className="absolute top-8 right-8 flex flex-col gap-4 z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"
            >
              <Share2 size={20} />
            </button>
            {!isVideoSelected && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"
              >
                <Maximize2 size={20} />
              </button>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={14} />
            <span>Click for Full View</span>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal ("The Pop") */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-xl font-black uppercase tracking-tight">{name} - HD Gallery</h3>
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden bg-slate-50">
              <button 
                onClick={() => setSelectedIndex(prev => (prev === 0 ? validImages.length - 1 : prev - 1))}
                className="absolute left-8 z-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95"
              >
                <ChevronLeft size={32} />
              </button>

              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full h-full flex items-center justify-center p-4 md:p-20"
              >
                <img 
                  src={validImages[selectedIndex]} 
                  alt={name} 
                  className="max-w-full max-h-full object-contain drop-shadow-2xl" loading="lazy" />
              </motion.div>

              <button 
                onClick={() => setSelectedIndex(prev => (prev === validImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-8 z-10 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Modal Footer - Thumbnails */}
            <div className="p-8 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex justify-center gap-4">
              {validImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedIndex === idx ? 'border-primary scale-110 shadow-lg' : 'border-slate-100 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`${name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
