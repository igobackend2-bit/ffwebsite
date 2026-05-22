'use client';

import React, { useState } from 'react';
import { Play, Eye, Users, MapPin, Wind, Thermometer, Droplets, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/TranslationContext';

const FALLBACK_STREAMS = [
  {
    id: 'fallback-sprinkler',
    name: '3D AI SPRINKLER SYSTEM',
    location: 'CENTER FIELD',
    video_url: 'https://cdn.pixabay.com/video/2016/10/11/5815-185444985_large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=2071&auto=format&fit=crop',
    viewers: 342,
    temp: '24°C',
    humidity: '72%',
    wind: '8 km/h',
    is_active: true
  },
  {
    id: 'fallback-harvest-1',
    name: 'VEGGIE HARVEST A',
    location: 'NORTH FIELD',
    video_url: '/harvest/harvesting_videos.mp4',
    thumbnail_url: '/harvest/veggie_thumb.png',
    viewers: 124,
    temp: '28°C',
    humidity: '65%',
    wind: '12 km/h',
    is_active: true
  },
  {
    id: 'fallback-harvest-2',
    name: 'FRUIT HARVEST B',
    location: 'EAST FIELD',
    video_url: '/harvest/harvesting_videos_2.mp4',
    thumbnail_url: '/harvest/fruit_thumb.png',
    viewers: 89,
    temp: '26°C',
    humidity: '60%',
    wind: '15 km/h',
    is_active: true
  }
];

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const lowercase = url.toLowerCase();
  return lowercase.includes('.mp4') || lowercase.includes('.webm') || lowercase.includes('video');
};

export default function LiveFarmStream() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [streams, setStreams] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeStream, setActiveStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchStreams() {
      try {
        const { data, error } = await supabase
          .from('farm_streams')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          setStreams(data);
          setActiveStream(data[0]);
        } else {
          setStreams(FALLBACK_STREAMS);
          setActiveStream(FALLBACK_STREAMS[0]);
        }
      } catch (err) {
        console.error('Failed to fetch streams:', err);
        setStreams(FALLBACK_STREAMS);
        setActiveStream(FALLBACK_STREAMS[0]);
      } finally {
        setLoading(false);
      }
    }
    fetchStreams();

    // Set up Realtime listener
    const channel = supabase
      .channel('farm_streams_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farm_streams' }, () => {
        fetchStreams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return (
    <div className="py-20 bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  if (!activeStream) return null;

  return (
    <section className="py-32 bg-[#0A0A0A] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.4em] mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{t('streams.badge')}</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              {t('streams.title').split(' ').slice(0, 2).join(' ')} <br /> <span className="text-primary italic font-serif lowercase">{t('streams.title').split(' ').slice(2).join(' ')}</span>
            </h2>
          </div>
          <p className="text-white/40 font-medium max-w-sm md:text-right text-lg">
            {t('streams.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Stream Player */}
          <div className="lg:col-span-3">
            <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group bg-black">
              {isVideoUrl(activeStream.video_url) ? (
                <video 
                  key={activeStream.id}
                  src={activeStream.video_url} 
                  poster={activeStream.thumbnail_url}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover transition-transform duration-[10s] ease-linear group-hover:scale-105"
                />
              ) : (
                <img 
                  src={activeStream.video_url || activeStream.thumbnail_url} 
                  alt={activeStream.name} 
                  className="w-full h-full object-cover transition-transform duration-[10s] ease-linear group-hover:scale-110" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
              
              {/* Overlay Info */}
              <div className="absolute top-10 left-10 flex flex-col gap-4">
                <div className="flex items-center gap-3 bg-red-600 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                   <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                   LIVE: {t(activeStream.name)}
                </div>
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                   <Users size={14} className="text-primary" />
                   {activeStream.viewers || 124} {t('streams.watching')}
                </div>
              </div>

              <div className="absolute top-10 right-10 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                 <MapPin size={14} className="text-primary" />
                 {t(activeStream.location) || t('NORTH FIELD')}
              </div>

              <div className="absolute bottom-10 left-10 right-10 flex flex-wrap items-end justify-between gap-6">
                 <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2 text-white/40 uppercase text-[9px] font-black tracking-widest mb-1"><Thermometer size={14} /> {t('streams.temp')}</div>
                       <span className="text-2xl font-black">{activeStream.temp || '28°C'}</span>
                    </div>
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2 text-white/40 uppercase text-[9px] font-black tracking-widest mb-1"><Droplets size={14} /> {t('streams.humidity')}</div>
                       <span className="text-2xl font-black">{activeStream.humidity || '65%'}</span>
                    </div>
                    <div className="flex flex-col">
                       <div className="flex items-center gap-2 text-white/40 uppercase text-[9px] font-black tracking-widest mb-1"><Wind size={14} /> {t('streams.wind')}</div>
                       <span className="text-2xl font-black">{activeStream.wind || '12 km/h'}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {t('streams.irrigation')}
                 </div>
              </div>
            </div>
          </div>

          {/* Stream Selector */}
          <div className="flex flex-col gap-4">
            {streams.map((stream) => (
              <button
                key={stream.id}
                onClick={() => setActiveStream(stream)}
                className={`flex-1 group relative rounded-[2rem] overflow-hidden border transition-all duration-500 ${
                  activeStream.id === stream.id ? 'border-primary ring-2 ring-primary/20' : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                {isVideoUrl(stream.thumbnail_url || stream.video_url) ? (
                  <video 
                    src={stream.thumbnail_url || stream.video_url} 
                    muted 
                    playsInline 
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={stream.thumbnail_url || stream.video_url} 
                    alt={stream.name} 
                    className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                )}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                <div className="relative p-6 flex flex-col justify-end h-full">
                  <h4 className="text-lg font-black uppercase tracking-tight text-left">{t(stream.name)}</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] text-left">{t(stream.location)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
