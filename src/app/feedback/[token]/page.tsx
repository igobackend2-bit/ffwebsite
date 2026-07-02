'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Loader2, CheckCircle2, XCircle } from 'lucide-react';

// ============================================================================
// Public post-delivery feedback form. Reached only via the one-time link
// emailed after an order is marked DELIVERED (see src/lib/feedback.ts).
// No login required — the token itself is the access control, validated
// server-side by /api/feedback/[token] and /api/feedback/submit.
// ============================================================================

const DELIVERY_TAGS = ['On time', 'Late', 'Item missing', 'Damaged'];

type LoadState = 'loading' | 'ready' | 'already_submitted' | 'invalid' | 'submitted';

export default function FeedbackFormPage() {
  const params = useParams();
  const token = String(params?.token || '');

  const [state, setState] = useState<LoadState>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/feedback/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setState('invalid');
          return;
        }
        const data = await res.json();
        setOrderNumber(data.orderNumber || '');
        setState(data.status === 'submitted' ? 'already_submitted' : 'ready');
      })
      .catch(() => setState('invalid'));
  }, [token]);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSubmit() {
    if (!rating) {
      setError('Please select a star rating first.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, deliveryTags: tags, comment }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      setState('submitted');
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f9f7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-border shadow-xl p-8">
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Loading your feedback form...</p>
          </div>
        )}

        {state === 'invalid' && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <XCircle size={40} className="text-red-400" />
            <p className="font-black uppercase tracking-tight text-lg">Link not found</p>
            <p className="text-sm text-muted-foreground font-medium">
              This feedback link is invalid or has expired. If you think this is a mistake, contact us at{' '}
              <a href="mailto:info.thefarmersfactory@gmail.com" className="text-primary font-bold">
                info.thefarmersfactory@gmail.com
              </a>
              .
            </p>
          </div>
        )}

        {state === 'already_submitted' && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 size={40} className="text-primary" />
            <p className="font-black uppercase tracking-tight text-lg">Already received</p>
            <p className="text-sm text-muted-foreground font-medium">
              Thanks — we already have your feedback for this order. Every response helps us do better.
            </p>
          </div>
        )}

        {state === 'submitted' && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <CheckCircle2 size={40} className="text-primary" />
            <p className="font-black uppercase tracking-tight text-lg">Thank you!</p>
            <p className="text-sm text-muted-foreground font-medium">
              Your feedback has been received and shared with our team. We appreciate you taking the time.
            </p>
          </div>
        )}

        {state === 'ready' && (
          <>
            <div className="text-center mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Farmers Factory</div>
              <div className="text-lg font-black uppercase tracking-tight mt-1.5">How was your delivery?</div>
              {orderNumber && (
                <div className="text-xs text-muted-foreground font-medium mt-1">Order #{orderNumber}</div>
              )}
            </div>

            <div className="border-t border-border my-4" />

            <div className="mb-5">
              <p className="text-xs font-bold text-slate-600 mb-2.5">Overall, how was your experience?</p>
              <div className="flex gap-1.5 justify-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={30}
                      className={s <= (hoverRating || rating) ? 'fill-primary text-primary' : 'text-muted/40'}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-[11px] text-muted-foreground mt-1.5">tap a star to rate &middot; required</p>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-slate-600 mb-2.5">How was the delivery?</p>
              <div className="flex gap-2 flex-wrap">
                {DELIVERY_TAGS.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                        active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-slate-500 hover:border-primary/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">optional &middot; pick any that apply</p>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-slate-600 mb-2">Anything you&apos;d like to tell us?</p>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what went well or what we can improve"
                className="w-full bg-muted/20 border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium resize-none outline-none focus:border-primary/40"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">optional</p>
            </div>

            {error && <p className="text-xs font-bold text-red-500 mb-3 text-center">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </button>

            <p className="text-center text-[11px] text-muted-foreground mt-3.5">
              Takes less than a minute &middot; no login needed
            </p>
          </>
        )}
      </div>
    </main>
  );
}
