'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Menu, PlusCircle, Command, Award } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { LogBagModal } from './LogBagModal';
import { CertificateModal } from './CertificateModal';
import { CommandPalette } from './CommandPalette';

export function Navbar() {
  const router = useRouter();
  const { toggleMobileSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLogBagOpen, setIsLogBagOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query.toUpperCase().startsWith('BAG-') || query.toUpperCase().startsWith('EXPORT-')) {
      router.push(`/trace/${encodeURIComponent(query)}`);
    } else {
      router.push(`/bags?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-borderToken bg-surface/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3 flex-1 max-w-xl">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-400 hover:text-gray-100 transition-all"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-amberAccent" />
          </button>

          {/* Search Bar with Ctrl+K trigger */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmer or bag (e.g. EXPORT-SUPER-LOT-01)..."
              className="w-full pl-10 pr-20 py-2 text-xs rounded-xl bg-background border border-borderToken text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amberAccent focus:ring-1 focus:ring-amberAccent transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-1 px-1.5 py-0.5 rounded bg-surface border border-borderToken text-[10px] font-mono text-gray-400 hover:text-gray-200"
            >
              <Command className="w-3 h-3 text-amberAccent" />
              <span>Ctrl+K</span>
            </button>
          </form>
        </div>

        {/* Action Buttons & System Badges */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsLogBagOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amberAccent/15 border border-amberAccent/35 text-amberAccent text-xs font-bold hover:bg-amberAccent hover:text-gray-950 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Bag</span>
          </button>

          <button
            onClick={() => setIsCertificateOpen(true)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface border border-borderToken hover:border-amberAccent/40 text-gray-200 text-xs font-bold transition-all shadow-sm"
          >
            <Award className="w-4 h-4 text-amberAccent" />
            <span>Certificate</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL CTE Active</span>
          </div>
        </div>
      </header>

      <LogBagModal isOpen={isLogBagOpen} onClose={() => setIsLogBagOpen(false)} />
      <CertificateModal isOpen={isCertificateOpen} onClose={() => setIsCertificateOpen(false)} />
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenLogBag={() => setIsLogBagOpen(true)}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />
    </>
  );
}
