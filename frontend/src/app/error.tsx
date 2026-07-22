'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Uncaught Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amberAccent shadow-lg">
        <AlertTriangle className="w-7 h-7 text-amberAccent" />
      </div>

      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-black text-gray-100">Something went wrong!</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          {error?.message || 'An unexpected runtime error occurred while loading this view.'}
        </p>
      </div>

      <button
        onClick={() => reset()}
        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amberAccent text-gray-950 text-xs font-extrabold hover:opacity-95 shadow-md shadow-amberAccent/20 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
