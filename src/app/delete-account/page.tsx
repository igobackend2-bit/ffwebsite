'use client';

// Public "Account & Data Deletion" page — required by Google Play (and the
// App Store) for any app that supports account creation: a URL that's
// reachable without installing the app, describes how a user can delete
// their account and data, and lets them actually request it.
//
// Reuses the exact same request flow already built into
// Profile > Settings ("Delete My Account") and the same
// /api/account/request-deletion route — a logged-in visitor can submit the
// request right here; a logged-out visitor gets clear instructions plus an
// email fallback, since we need to know *whose* account to delete.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { Trash2, Loader2, LogIn, Mail, ShieldCheck, Clock } from 'lucide-react';

const SUPPORT_EMAIL = 'info.thefarmersfactory@gmail.com';

export default function DeleteAccountPage() {
  const { user, loading: authLoading } = useAuth();

  const [deletionPending, setDeletionPending] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setCheckingStatus(false);
      return;
    }
    fetch(`/api/account/request-deletion?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => setDeletionPending(!!data.pending))
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [user?.id]);

  const handleRequestDeletion = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          reason,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Could not submit your request. Please try again.');
        return;
      }
      setDeletionPending(true);
      setShowConfirm(false);
      toast.success(
        result.alreadyPending
          ? "You've already requested account deletion — our team will review it soon."
          : 'Your account deletion request has been sent. Our team will review it shortly.'
      );
    } catch (e) {
      console.error('Account deletion request failed:', e);
      toast.error('Could not submit your request. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-3xl">
        <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter">
          Delete <span className="text-primary italic font-serif lowercase">Account</span>
        </h1>
        <p className="text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl">
          You can request that your Farmers Factory account and all associated data be permanently
          deleted at any time. This page explains what gets deleted and lets you start the request.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <ShieldCheck size={22} className="text-primary mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">What&apos;s deleted</p>
            <p className="text-sm font-bold text-slate-700 leading-snug">
              Your profile, order history, cart, wishlist, saved addresses and notifications.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <ShieldCheck size={22} className="text-primary mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">How it works</p>
            <p className="text-sm font-bold text-slate-700 leading-snug">
              You submit a request below (or by email). Our team reviews and confirms it.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <Clock size={22} className="text-primary mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Timeline</p>
            <p className="text-sm font-bold text-slate-700 leading-snug">
              Requests are reviewed and processed within 7 business days.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 border-2 border-red-100 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Request Account Deletion</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-lg">
                This permanently deletes your account and cannot be undone.
              </p>
            </div>
          </div>

          {authLoading || checkingStatus ? (
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <Loader2 size={18} className="animate-spin" /> Checking your account...
            </div>
          ) : !user ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 font-medium">
                Log in to submit a deletion request for your account — we need to verify which account
                to delete first.
              </p>
              <Link
                href="/auth?redirect=/delete-account"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
              >
                <LogIn size={16} /> Log In to Continue
              </Link>

              <div className="pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-2">
                  Can&apos;t log in? Email us from your registered address and we&apos;ll process your
                  deletion request manually.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Account%20Deletion%20Request`}
                  className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                >
                  <Mail size={16} /> {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          ) : deletionPending ? (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 text-sm font-bold text-amber-700">
              Your account deletion request is pending review. Our team will process it shortly.
            </div>
          ) : showConfirm ? (
            <div className="space-y-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional — tell us why you're leaving"
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-6 text-sm font-medium focus:ring-2 focus:ring-red-200 outline-none resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRequestDeletion}
                  disabled={submitting}
                  className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Confirm Deletion Request'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                  className="bg-white border border-slate-200 text-slate-500 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-white border-2 border-red-200 text-red-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
            >
              Delete My Account
            </button>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
