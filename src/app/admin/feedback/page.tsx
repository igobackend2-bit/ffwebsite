'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';

// ============================================================================
// Admin view of customer feedback (part of the Customer Feedback System).
// Reads public.feedback directly — allowed by the feedback_admin_select RLS
// policy (public.ff_is_admin()), same access model every other admin page
// already uses. The L1/CEO view lives in the separate ERP, which reads this
// same table — see the note at the bottom of ADD_CUSTOMER_FEEDBACK_SYSTEM.sql.
// ============================================================================

interface FeedbackRow {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  rating: number | null;
  delivery_tags: string[] | null;
  comment: string | null;
  status: string;
  created_at: string;
  submitted_at: string | null;
}

export default function AdminFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'pending' | 'low'>('all');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setRows(data as FeedbackRow[]);
    setLoading(false);
  }

  const submitted = rows.filter((r) => r.status === 'submitted');
  const avgRating = submitted.length
    ? (submitted.reduce((sum, r) => sum + (r.rating || 0), 0) / submitted.length).toFixed(1)
    : '—';
  const lowRatingCount = submitted.filter((r) => (r.rating || 0) <= 2).length;
  const responseRate = rows.length ? Math.round((submitted.length / rows.length) * 100) : 0;

  const filtered = rows.filter((r) => {
    if (filter === 'submitted') return r.status === 'submitted';
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'low') return r.status === 'submitted' && (r.rating || 0) <= 2;
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase mb-2">
          Customer <span className="text-primary italic font-serif lowercase">Feedback</span>
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Post-delivery survey responses. Also readable by the ERP for L1 and CEO reporting.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Responses</p>
          <p className="text-3xl font-black">{submitted.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Avg rating</p>
          <p className="text-3xl font-black flex items-center gap-1.5">
            {avgRating} <Star size={20} className="fill-primary text-primary" />
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Response rate</p>
          <p className="text-3xl font-black">{responseRate}%</p>
        </div>
        <div className={`rounded-2xl border p-5 ${lowRatingCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-border'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${lowRatingCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            Needs attention
          </p>
          <p className={`text-3xl font-black ${lowRatingCount > 0 ? 'text-red-600' : ''}`}>{lowRatingCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'submitted', 'pending', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
              filter === f ? 'border-primary bg-primary/10 text-primary' : 'border-border text-slate-500'
            }`}
          >
            {f === 'low' ? 'Low ratings' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-medium">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
          No feedback in this filter yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-black text-sm">{r.customer_name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Order #{r.order_number || '—'} &middot; {r.customer_email}
                  </p>
                </div>
                {r.status === 'submitted' ? (
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= (r.rating || 0) ? 'fill-primary text-primary' : 'text-muted/30'}
                      />
                    ))}
                    {(r.rating || 0) <= 2 && (
                      <AlertTriangle size={14} className="text-red-500 ml-1" />
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                    Awaiting response
                  </span>
                )}
              </div>
              {r.delivery_tags && r.delivery_tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {r.delivery_tags.map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted/30 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {r.comment && <p className="text-sm text-slate-600 font-medium">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
