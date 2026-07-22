'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Package,
  GitMerge,
  PlusCircle,
  FileText,
  Settings,
  LayoutDashboard,
  X,
  Command,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegisterFarmer?: () => void;
  onOpenLogBag?: () => void;
  onOpenMergeModal?: () => void;
  onOpenCertificate?: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  badge?: string;
}

interface CommandCategory {
  category: string;
  items: CommandItem[];
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenRegisterFarmer,
  onOpenLogBag,
  onOpenMergeModal,
  onOpenCertificate,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const commandItems: CommandCategory[] = [
    {
      category: 'Quick Actions',
      items: [
        {
          id: 'action-register-farmer',
          label: 'Register New Farmer',
          icon: Users,
          action: () => {
            onClose();
            onOpenRegisterFarmer?.();
          },
          badge: '+ Farmer',
        },
        {
          id: 'action-log-bag',
          label: 'Log Coffee Harvest Bag',
          icon: PlusCircle,
          action: () => {
            onClose();
            onOpenLogBag?.();
          },
          badge: '+ Harvest',
        },
        {
          id: 'action-merge',
          label: 'Merge Bags into Export Lot',
          icon: GitMerge,
          action: () => {
            onClose();
            onOpenMergeModal?.();
          },
          badge: 'Merge',
        },
        {
          id: 'action-certificate',
          label: 'Generate Coffee Origin Certificate',
          icon: FileText,
          action: () => {
            onClose();
            onOpenCertificate?.();
          },
          badge: 'Certificate',
        },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/') },
        { id: 'nav-farmers', label: 'Go to Farmers Directory', icon: Users, action: () => navigate('/farmers') },
        { id: 'nav-bags', label: 'Go to Coffee Bags Ledger', icon: Package, action: () => navigate('/bags') },
        {
          id: 'nav-trace',
          label: 'Go to Traceability Graph (Super Lot 01)',
          icon: GitMerge,
          action: () => navigate('/trace/EXPORT-SUPER-LOT-01'),
        },
        { id: 'nav-settings', label: 'Go to System Settings', icon: Settings, action: () => navigate('/settings') },
      ],
    },
  ];

  const filteredCategories = commandItems
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-borderToken bg-surface shadow-2xl overflow-hidden z-10 space-y-0">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-borderToken bg-surfaceHover/50">
          <Search className="w-4 h-4 text-amberAccent shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, farmer name, or bag code..."
            autoFocus
            className="w-full text-xs font-semibold bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-[10px] font-mono bg-background px-2 py-0.5 rounded border border-borderToken text-gray-400">
              Esc
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.category} className="space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-amberAccent px-3 py-1">
                  {category.category}
                </div>

                <div className="space-y-1">
                  {category.items.map((item: CommandItem) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surfaceHover border border-transparent hover:border-borderToken text-left transition-all text-xs group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-background text-gray-300 group-hover:text-amberAccent transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-gray-200 group-hover:text-gray-100">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amberAccent/10 text-amberAccent border border-amberAccent/20">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-gray-600 mx-auto" />
              <p className="text-xs font-semibold text-gray-400">No command found for "{query}"</p>
              <p className="text-[11px] text-gray-500">Try searching for "Farmer", "Merge", "Bag", or "Settings"</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-background/60 border-t border-borderToken flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <div className="flex items-center space-x-2">
            <Command className="w-3.5 h-3.5 text-amberAccent" />
            <span>CoffeeTrace Command Palette</span>
          </div>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
}
