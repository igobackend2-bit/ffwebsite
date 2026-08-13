'use client';

import React, { useEffect, useState } from 'react';
import {
  Star,
  MessageSquare,
  User,
  Package,
  Calendar,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminReviews() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      // Goes through the admin API (service-role key) so pending/rejected
      // reviews from every customer are visible here, not just approved
      // ones — the public RLS policy only returns approved reviews (plus
      // a customer's own) to a normal client.
      const res = await fetch('/api/admin/reviews').then(r => r.json());
      if (res.error) throw new Error(res.error);
      const data = res.reviews || [];
      setReviews(data);

      // Calculate stats
      if (data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const avg = data.reduce((acc: number, r: any) => acc + r.rating, 0) / data.length;
        setStats({
          total: data.length,
          average: Number(avg.toFixed(1)),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pending: data.filter((r: any) => r.status === 'pending').length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          approved: data.filter((r: any) => r.status === 'approved').length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rejected: data.filter((r: any) => r.status === 'rejected').length
        });
      } else {
        setStats({ total: 0, average: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);

      setReviews(prev => {
        const next = prev.map(r => (r.id === id ? { ...r, status } : r));
        setStats({
          total: next.length,
          average: next.length > 0 ? Number((next.reduce((acc, r) => acc + r.rating, 0) / next.length).toFixed(1)) : 0,
          pending: next.filter(r => r.status === 'pending').length,
          approved: next.filter(r => r.status === 'approved').length,
          rejected: next.filter(r => r.status === 'rejected').length
        });
        return next;
      });

      const label = status === 'approved' ? 'Review approved — now visible on the website' : status === 'rejected' ? 'Review rejected — hidden from the website' : 'Review marked as pending';
      toast.success(label);
    } catch (err) {
      console.error('Error updating review status:', err);
      toast.error('Failed to update review status');
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' }).then(r => r.json());
      if (res.error) throw new Error(res.error);

      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error('Failed to delete review');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Star size={20} className="fill-primary" />
            <span className="text-xs font-black uppercase tracking-widest">Average Rating</span>
          </div>
          <p className="text-4xl font-black">{stats.average} / 5.0</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <MessageSquare size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Total Feedback</span>
          </div>
          <p className="text-4xl font-black">{stats.total}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <AlertCircle size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Pending Approval</span>
          </div>
          <p className="text-4xl font-black">{stats.pending}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <CheckCircle size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Approved (Live)</span>
          </div>
          <p className="text-4xl font-black">{stats.approved}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border bg-muted/10">
          <h3 className="text-xl font-black uppercase tracking-tight">Customer Messages & Ratings</h3>
          <p className="text-sm text-muted-foreground font-medium">Monitor and manage all customer feedback across the store.</p>
        </div>

        <div className="divide-y divide-border">
          {reviews.length > 0 ? (
            reviews.map((review, idx) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-8 hover:bg-muted/10 transition-colors flex flex-col md:flex-row gap-8"
              >
                {/* Product Info */}
                <div className="w-full md:w-64 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-muted rounded-xl overflow-hidden border border-border">
                      <img src={review.products?.image_urls?.[0] || '/placeholder_product.webp'} alt="Reviewed product image" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Product</p>
                      <h4 className="font-black text-sm line-clamp-1">{review.products?.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <span className="font-black text-sm">{review.user_name}</span>
                      {review.is_verified && (
                        <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={8} /> Verified Buyer
                        </span>
                      )}
                      {review.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle size={8} /> Pending Approval
                        </span>
                      )}
                      {review.status === 'approved' && (
                        <span className="bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={8} /> Approved
                        </span>
                      )}
                      {review.status === 'rejected' && (
                        <span className="bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <X size={8} /> Rejected
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center justify-center gap-2">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(review.id, 'approved')}
                      disabled={updatingId === review.id}
                      className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm disabled:opacity-50"
                      title="Accept — show on website"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(review.id, 'rejected')}
                      disabled={updatingId === review.id}
                      className="p-3 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white rounded-2xl transition-all shadow-sm disabled:opacity-50"
                      title="Reject — hide from website"
                    >
                      <X size={18} />
                    </button>
                  )}
                  {review.status !== 'pending' && (
                    <button
                      onClick={() => updateStatus(review.id, 'pending')}
                      disabled={updatingId === review.id}
                      className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-500 hover:text-white rounded-2xl transition-all shadow-sm disabled:opacity-50"
                      title="Mark as pending"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                    title="Delete Review"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-32 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <MessageSquare size={40} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest">No Feedback Yet</h3>
              <p className="text-muted-foreground font-medium">Customer reviews and messages will appear here once submitted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
