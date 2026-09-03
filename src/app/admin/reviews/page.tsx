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
  Plus,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getAllProducts } from '@/lib/admin';

// image_urls sometimes comes back from Supabase as a raw JSON *string*
// (e.g. '["https://..."]') instead of a real array — the same issue
// already documented and worked around in Admin > Inventory
// (src/app/admin/inventory/page.tsx). Without parsing it, indexing [0]
// on the string just grabs its first character ('['), which is why every
// review's product thumbnail was showing as a broken image. This also
// replaces the '/placeholder_product.webp' fallback — that file doesn't
// exist in this project's public/ folder, so it was broken too — with a
// small inline placeholder that always renders.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProductThumb(p: any): string {
  let urls = p?.image_urls;
  if (typeof urls === 'string') {
    try { urls = JSON.parse(urls); } catch { urls = []; }
  }
  const first = Array.isArray(urls) ? urls[0] : null;
  return first || p?.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3C/svg%3E";
}

// Lets an admin add a review to a product directly (e.g. to seed a new
// product's first reviews, or record feedback a customer gave outside the
// website) — posts to POST /api/admin/reviews, which inserts it with no
// customer account attached and status 'approved' so it's live right away.
// See ADD_ADMIN_REVIEW_SUPPORT.sql for the one-time database change this
// depends on (reviews.user_id needs to allow NULL for admin-added rows).

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingReview, setAddingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    product_id: '',
    user_name: '',
    rating: 5,
    comment: '',
    is_verified: true,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchReviews();
    // eslint-disable-next-line react-hooks/immutability
    getAllProducts(true).then(({ data }) => setProducts(data || []));
  }, []);

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newReview.product_id) {
      toast.error('Choose a product');
      return;
    }
    if (!newReview.user_name.trim()) {
      toast.error('Enter a customer name');
      return;
    }
    setAddingReview(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: newReview.product_id,
          user_name: newReview.user_name.trim(),
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          is_verified: newReview.is_verified,
        }),
      }).then((r) => r.json());
      if (res?.error) throw new Error(res.error);

      toast.success('Review added — it’s live on the product page now.');
      setShowAddModal(false);
      setNewReview({ product_id: '', user_name: '', rating: 5, comment: '', is_verified: true });
      await fetchReviews();
    } catch (err) {
      console.error('Error adding review:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add review');
    } finally {
      setAddingReview(false);
    }
  }

  async function fetchReviews() {
    try {
      setLoading(true);
      // Goes through the admin API (service-role key) so not-yet-approved
      // reviews from every customer are visible here, not just approved
      // ones — the public RLS policy returns every review to a normal
      // client (there's no per-status filtering at the database level),
      // but is_visible: false ones are meant to be hidden from the
      // storefront until an admin approves them here.
      const res = await fetch('/api/admin/reviews').then(r => r.json());
      if (res.error) throw new Error(res.error);
      const data = res.reviews || [];
      setReviews(data);

      // Calculate stats. This used to read a `status` column
      // ('pending'/'approved'/'rejected') that doesn't exist on the live
      // `reviews` table — every review silently counted as neither pending
      // nor approved, so these numbers were always 0 regardless of reality.
      // is_visible is the real column: true = live on the site, false =
      // waiting for approval.
      if (data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const avg = data.reduce((acc: number, r: any) => acc + r.rating, 0) / data.length;
        setStats({
          total: data.length,
          average: Number(avg.toFixed(1)),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pending: data.filter((r: any) => !r.is_visible).length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          approved: data.filter((r: any) => r.is_visible).length,
          rejected: 0
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

  // Approves a customer's review so it appears on the product page. (There
  // is no separate "reject" state — a review an admin doesn't want either
  // stays pending, or is removed entirely with Delete below.)
  async function approveReview(id: string) {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_visible: true })
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);

      setReviews(prev => {
        const next = prev.map(r => (r.id === id ? { ...r, is_visible: true } : r));
        setStats({
          total: next.length,
          average: next.length > 0 ? Number((next.reduce((acc, r) => acc + r.rating, 0) / next.length).toFixed(1)) : 0,
          pending: next.filter(r => !r.is_visible).length,
          approved: next.filter(r => r.is_visible).length,
          rejected: 0
        });
        return next;
      });

      toast.success('Review approved — now live on the website');
    } catch (err) {
      console.error('Error approving review:', err);
      toast.error('Failed to approve review');
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Product Reviews</h1>
          <p className="text-sm text-muted-foreground font-medium">Customer star ratings & comments on individual products.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shrink-0"
        >
          <Plus size={16} />
          Add Review
        </button>
      </div>

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
                      <img src={getProductThumb(review.products)} alt="Reviewed product image" className="w-full h-full object-cover" loading="lazy" />
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
                      {!review.is_visible ? (
                        <span className="bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle size={8} /> Pending Approval
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={8} /> Live On Site
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
                  {!review.is_visible && (
                    <button
                      onClick={() => approveReview(review.id)}
                      disabled={updatingId === review.id}
                      className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm disabled:opacity-50"
                      title="Accept — show on website"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                    title={review.is_visible ? 'Not needed anymore — delete' : 'Delete Review'}
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

      {/* Add Review Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !addingReview && setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Add a Review</h2>
                  <p className="text-xs text-muted-foreground font-medium">Goes live on the product page immediately.</p>
                </div>
                <button
                  onClick={() => !addingReview && setShowAddModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition-all"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleAddReview} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Product</label>
                  <select
                    required
                    value={newReview.product_id}
                    onChange={(e) => setNewReview({ ...newReview, product_id: e.target.value })}
                    className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Choose a product…</option>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Customer Name</label>
                  <input
                    required
                    type="text"
                    value={newReview.user_name}
                    onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                    placeholder="e.g. Priya S."
                    className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: s })}
                        className="p-1 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star size={28} className={s <= newReview.rating ? 'fill-primary text-primary' : 'text-muted/40'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Comment (optional)</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="What did they say about it?"
                    rows={3}
                    className="w-full bg-muted/30 border border-border rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newReview.is_verified}
                    onChange={(e) => setNewReview({ ...newReview, is_verified: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-bold text-slate-600">Mark as &quot;Verified Buyer&quot;</span>
                </label>

                <button
                  type="submit"
                  disabled={addingReview}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {addingReview ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {addingReview ? 'Adding…' : 'Add Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
