'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/TranslationContext';

const FALLBACK_STORIES = [
  { id: '1', farmer: 'Arjun', title: 'Morning Harvest', image_url: '/Vegetables/drumstick.jpg', video_url: null, is_live: true },
  { id: '2', farmer: 'Meera', title: 'Organic Secrets', image_url: '/Fruits/MangoBanganapalli.jfif', video_url: null, is_live: true },
  { id: '3', farmer: 'Senthil', title: 'Oil Extraction', image_url: '/Valluvam/coconut-1L.jpg', video_url: null, is_live: true },
  { id: '4', farmer: 'Kiran', title: 'Soil Quality', image_url: '/Vegetables/ooty-carrot.jpg', video_url: null, is_live: true },
];

export default function FarmStories() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stories, setStories] = React.useState<any[]>([]);
  const [activeVideo, setActiveVideo] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('farm_stories')
          .select('*')
          .eq('is_live', true)
          .order('display_order', { ascending: true });

        if (!error && data && data.length > 0) {
          setStories(data);
        } else {
          setStories(FALLBACK_STORIES);
        }
      } catch (err) {
        console.error('Failed to fetch stories:', err);
        setStories(FALLBACK_STORIES);
      }
    }
    fetchStories();
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
              <Sparkles size={16} />
              <span>{t('stories.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase">
              {t('stories.title').split(' ').slice(0, 1).join(' ')} <span className="text-primary italic font-serif lowercase">{t('stories.title').split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>
          <p className="text-muted-foreground font-medium max-w-xs md:text-right">
            {t('stories.desc')}
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide px-2">
          {stories.map((story, idx) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => story.video_url && setActiveVideo(story.video_url)}
              className="flex-shrink-0 w-72 h-[480px] rounded-[2.5rem] relative overflow-hidden group cursor-pointer shadow-2xl shadow-black/10"
            >
              {activeVideo === story.video_url && story.video_url ? (
                <video src={story.video_url} autoPlay controls className="w-full h-full object-cover" / preload="none">
              ) : (
                <>
                  <img 
                    src={story.image_url} 
                    alt={story.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 text-white pointer-events-none">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black uppercase">
                        {story.farmer?.[0] || 'F'}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{story.farmer}</span>
                    </div>
                    <h4 className="text-xl font-black mb-4">{story.title}</h4>
                    
                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                       <div className="flex items-center gap-4">
                          <Heart size={20} className="hover:text-red-500 transition-colors pointer-events-auto" />
                          <MessageCircle size={20} className="hover:text-primary transition-colors pointer-events-auto" />
                       </div>
                       <Share2 size={20} className="hover:text-primary transition-colors pointer-events-auto" />
                    </div>
                  </div>
                  
                  {story.is_live && (
                    <div className="absolute top-6 right-6">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                         <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                         LIVE
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
