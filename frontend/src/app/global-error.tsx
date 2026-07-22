'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0E0C0A] text-gray-100 min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-borderToken bg-surface max-w-lg text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amberAccent">
            <AlertTriangle className="w-7 h-7 text-amberAccent" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-100">Global Application Error</h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {error?.message || 'A critical layout error occurred in the application root.'}
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amberAccent text-gray-950 text-xs font-extrabold hover:opacity-95 shadow-md shadow-amberAccent/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
