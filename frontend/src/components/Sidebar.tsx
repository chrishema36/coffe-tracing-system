'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  GitMerge,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Settings,
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { label: 'Farmers', href: '/farmers', icon: Users, badge: null },
  { label: 'Coffee Bags', href: '/bags', icon: Package, badge: null },
  { label: 'Traceability Graph', href: '/trace/EXPORT-SUPER-LOT-01', icon: GitMerge, badge: '50ms CTE' },
  { label: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen bg-surface border-r border-borderToken flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header & Toggle */}
        <div>
          <div className="p-4 border-b border-borderToken flex items-center justify-between min-h-[73px]">
            <Link
              href="/"
              className={`flex items-center space-x-3 overflow-hidden transition-all ${
                isCollapsed ? 'justify-center w-full' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amberAccent/35 to-amber-900/50 flex items-center justify-center border border-amberAccent/45 shadow-md shadow-amberAccent/15 shrink-0">
                <Coffee className="w-5 h-5 text-amberAccent" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="font-extrabold text-base text-gray-100 leading-tight tracking-tight">
                    CoffeeTrace
                  </h1>
                  <p className="text-[10px] font-extrabold text-amberAccent uppercase tracking-widest">
                    SLR Enterprise v1.0
                  </p>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-3'
                  } rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-amberAccent text-gray-950 shadow-md shadow-amberAccent/20 font-extrabold'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-surfaceHover'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-gray-950' : 'text-gray-400 group-hover:text-amberAccent'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Badge */}
                  {!isCollapsed && item.badge && (
                    <span
                      className={`ml-auto text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-gray-950/20 text-gray-950'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on Collapsed Hover */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-surface border border-borderToken text-gray-100 text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & Collapse Toggle */}
        <div className="p-3 border-t border-borderToken bg-background/40 space-y-3">
          {/* Strict Pagination Indicator */}
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-surfaceHover/80 border border-borderToken text-xs space-y-1 shadow-inner">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-400 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Strict Pagination Guard</span>
              </div>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Max 5 records per page strictly enforced across all REST API endpoints.
              </p>
            </div>
          ) : (
            <div
              title="Strict 5 records per page limit active"
              className="flex justify-center p-2 rounded-xl bg-surfaceHover border border-borderToken text-emerald-400"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-full py-2.5 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-400 hover:text-gray-100 text-xs font-bold transition-all group"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-amberAccent" />
            ) : (
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-amberAccent" />
                <span className="text-[11px]">Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
