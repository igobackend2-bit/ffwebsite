'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Logs one real 'visit' event per browser session, feeding the admin
// dashboard's Conversion Funnel widget (see ADD_ANALYTICS_EVENTS_FUNNEL.sql
// and src/lib/admin.ts). sessionStorage guard means a visitor navigating
// between multiple pages in the same visit only counts once, not once per
// page — this is meant to represent "sessions", not raw page views.
// Fire-and-forget: never blocks rendering, never shown to the visitor.
// ============================================================================

export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('ff_visit_logged')) return;
      sessionStorage.setItem('ff_visit_logged', 'true');
    } catch {
      // sessionStorage unavailable (privacy mode etc.) — skip silently,
      // never break the page for this.
      return;
    }

    supabase.from('analytics_events').insert({ event_type: 'visit' }).then(({ error }) => {
      if (error) console.warn('[Analytics] Visit log failed:', error.message);
    });
  }, []);

  return null;
}
