'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 mb-8 animate-bounce">
        <AlertCircle size={40} />
      </div>
      
      <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tight">
        Something went wrong
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-10 font-medium">
        We encountered an internal error while loading the admin dashboard. 
        This might be due to a connection issue or a data mismatch.
      </p>

      {process.env.NODE_ENV === 'development' && (
        <div className="bg-muted/50 p-6 rounded-2xl mb-10 text-left w-full max-w-2xl overflow-auto border border-border">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Error Details</p>
          <code className="text-sm font-mono text-red-600 block whitespace-pre-wrap">
            {error.message || 'Unknown Error'}
          </code>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
        
        <Link
          href="/"
          className="flex items-center gap-2 px-8 py-4 bg-white border border-border rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted transition-all active:scale-95"
        >
          <Home size={18} />
          Back to Store
        </Link>
      </div>
    </div>
  );
}
