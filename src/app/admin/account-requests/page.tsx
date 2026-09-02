'use client';

// Admin review queue for customers who asked (from Profile > Settings) to
// have their account deleted. Approving here permanently deletes the
// customer's account — see /api/admin/account-requests for exactly what
// that removes. Rejecting just dismisses the request; the account is
// untouched.

import React, { useEffect, useState } from 'react';
import { UserX, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DeletionRequest {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  reason: string | null;
  created_at: string;
}

export default function AccountRequestsPage() {
  const [rows, setRows] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/account-requests');
      const data = await res.json();
      setRows(data.requests || []);
    } catch (e) {
      console.error('Failed to load account deletion requests:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActingId(id);
    try {
      const res = await fetch('/api/admin/account-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Something went wrong. Please try again.');
        return;
      }
      if (action === 'approve') {
        toast.success('Account permanently deleted.');
      } else {
        toast.success('Request dismissed. The account was not changed.');
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Account request action failed:', e);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setActingId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase mb-2">
          Account <span className="text-primary italic font-serif lowercase">Requests</span>
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Customers who asked to have their account deleted. Approving is permanent — it deletes their
          login, profile, order history, cart, wishlist, saved addresses and notifications. Rejecting
          just dismisses the request and leaves their account untouched.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-medium">
          <UserX size={32} className="mx-auto mb-3 opacity-40" />
          No pending account deletion requests.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-black text-sm">{r.full_name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground font-medium">{r.email || r.user_id}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full inline-block mt-2">
                    Requested {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {r.reason && (
                    <p className="text-sm text-slate-600 font-medium mt-3 max-w-xl">&ldquo;{r.reason}&rdquo;</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {confirmId === r.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                      <AlertTriangle size={16} className="text-red-500 shrink-0" />
                      <span className="text-xs font-bold text-red-600">Delete permanently?</span>
                      <button
                        onClick={() => handleAction(r.id, 'approve')}
                        disabled={actingId === r.id}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
                      >
                        {actingId === r.id ? <Loader2 size={12} className="animate-spin" /> : 'Yes, delete'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        disabled={actingId === r.id}
                        className="px-3 py-1.5 bg-white border border-border rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(r.id, 'reject')}
                        disabled={actingId === r.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-muted/50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-50"
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        onClick={() => setConfirmId(r.id)}
                        disabled={actingId === r.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        <Check size={14} /> Approve &amp; Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
