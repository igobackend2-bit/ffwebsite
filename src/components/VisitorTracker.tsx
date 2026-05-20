'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const { user } = useAuth();
  const pathname = usePathname();
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    const updateVisit = async () => {
      // Throttle updates to once every 30 seconds for more 'live' feel
      const now = Date.now();
      if (now - lastUpdate.current < 30000) return;
      
      try {
        if (user) {
          // If logged in, update their profile with current time and page
          await supabase
            .from('profiles')
            .update({ 
              last_visited_at: new Date().toISOString(),
              last_visited_page: pathname
            })
            .eq('id', user.id);
        }
        lastUpdate.current = now;
      } catch (err) {
        // Silently fail visitor tracking
      }
    };

    updateVisit();
    
    // We use a simple interval as well to keep "Live" status accurate
    const interval = setInterval(updateVisit, 30000);
    
    return () => clearInterval(interval);
  }, [user, pathname]);

  return null; // This component doesn't render anything
}
