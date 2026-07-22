'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFarmers } from '../lib/api';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Mountain,
  Search,
  User,
  Package,
  PlusCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Award,
  Scale,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { LogBagModal } from './LogBagModal';
import { FarmerProfileDrawer } from './FarmerProfileDrawer';
import { Farmer } from '../types';
import { useToast } from '../context/ToastContext';

export function FarmersTable() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogBagOpen, setIsLogBagOpen] = useState(false);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  const limit = 5; // Strict requirement!

  const { data, isLoading, isError } = useQuery({
    queryKey: ['farmers', page],
    queryFn: () => fetchFarmers(page, limit),
  });

  const allFarmers = data?.data || [];
  const meta = data?.pagination;

  // Filter client side if search is entered
  const farmers = search
    ? allFarmers.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.code.toLowerCase().includes(search.toLowerCase()) ||
          f.region.toLowerCase().includes(search.toLowerCase())
      )
    : allFarmers;

  const handleOpenDrawer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDrawerOpen(true);
    setOpenKebabId(null);
  };

  const handleLogBagForFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsLogBagOpen(true);
    setOpenKebabId(null);
  };

  const handleDeleteFarmer = (farmer: Farmer) => {
    setOpenKebabId(null);
    toast.info('Delete Requested', `Farmer record ${farmer.name} marked for archival.`);
  };

  return (
    <div className="space-y-6">
      {/* High Level Farmer Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-borderToken bg-surface/90 space-y-1 border-t-2 border-t-amberAccent shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-extrabold uppercase text-[10px]">Lifetime Farmers</span>
            <User className="w-4 h-4 text-amberAccent" />
          </div>
          <div className="text-2xl font-black font-mono text-gray-100">{meta?.totalRecords || allFarmers.length}</div>
          <div className="text-[10px] text-amberAccent font-bold">Registered Producers</div>
        </div>

        <div className="p-4 rounded-2xl border border-borderToken bg-surface/90 space-y-1 border-t-2 border-t-emerald-400 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-extrabold uppercase text-[10px]">Highest Regional Yield</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">250 <span className="text-xs font-normal">kg</span></div>
          <div className="text-[10px] text-emerald-400 font-bold">Peak Lot Volume</div>
        </div>

        <div className="p-4 rounded-2xl border border-borderToken bg-surface/90 space-y-1 border-t-2 border-t-sky-400 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-extrabold uppercase text-[10px]">Average Bag Weight</span>
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-sky-400">62.5 <span className="text-xs font-normal">kg</span></div>
          <div className="text-[10px] text-sky-400 font-bold">Standard Weight Standard</div>
        </div>

        <div className="p-4 rounded-2xl border border-borderToken bg-surface/90 space-y-1 border-t-2 border-t-purple-400 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-extrabold uppercase text-[10px]">First & Latest Harvest</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-black font-mono text-purple-400">Jan 2026 – Jul 2026</div>
          <div className="text-[10px] text-purple-400 font-bold">Active Crop Season</div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farmer name, code, or region..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface border border-borderToken text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amberAccent transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface border border-borderToken">
            <User className="w-3.5 h-3.5 text-amberAccent" />
            <span>Active Farmers Registry</span>
          </span>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="rounded-2xl border border-borderToken bg-surface/90 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-background/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderToken font-bold">
              <tr>
                <th className="px-6 py-4">Farmer Profile</th>
                <th className="px-6 py-4">Farmer Code</th>
                <th className="px-6 py-4">Origin Region</th>
                <th className="px-6 py-4">Elevation</th>
                <th className="px-6 py-4">Total Bags</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderToken/70">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 rounded-full border-2 border-amberAccent border-t-transparent animate-spin" />
                      <span>Loading farmers dataset...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-400 font-medium">
                    Failed to load farmers dataset. Ensure backend server is running.
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No registered farmers matched your query.
                  </td>
                </tr>
              ) : (
                farmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    className="hover:bg-surfaceHover/90 transition-all duration-150 group cursor-pointer"
                    onClick={() => handleOpenDrawer(farmer)}
                  >
                    {/* Farmer Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-amberAccent/10 border border-amberAccent/30 flex items-center justify-center text-amberAccent font-bold text-xs group-hover:scale-105 transition-transform">
                          {farmer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-100 group-hover:text-amberAccent transition-colors">
                            {farmer.name}
                          </p>
                          <p className="text-[11px] text-gray-400">{farmer.country}</p>
                        </div>
                      </div>
                    </td>

                    {/* Farmer Code */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-background border border-borderToken text-amberAccent">
                        {farmer.code}
                      </span>
                    </td>

                    {/* Region */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-amberAccent/80 shrink-0" />
                        <span>{farmer.region}</span>
                      </div>
                    </td>

                    {/* Elevation */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                        <Mountain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-gray-200">
                          {farmer.elevationM ? `${farmer.elevationM}m MASL` : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Bags Count */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-surfaceHover border border-borderToken text-xs font-semibold text-gray-200">
                        <Package className="w-3.5 h-3.5 text-amberAccent" />
                        <span>{farmer._count?.bags ?? 0} Harvest Bags</span>
                      </div>
                    </td>

                    {/* Kebab Dropdown Action */}
                    <td
                      className="px-6 py-4 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setOpenKebabId(openKebabId === farmer.id ? null : farmer.id)}
                        className="p-2 rounded-xl border border-borderToken bg-background hover:bg-surfaceHover text-gray-400 hover:text-gray-100 transition-all"
                        aria-label="Actions dropdown"
                      >
                        <MoreVertical className="w-4 h-4 text-amberAccent" />
                      </button>

                      {openKebabId === farmer.id && (
                        <div className="absolute right-6 top-14 w-44 rounded-xl border border-borderToken bg-surface shadow-2xl z-50 py-1.5 text-xs space-y-0.5 animate-fadeIn">
                          <button
                            onClick={() => handleOpenDrawer(farmer)}
                            className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-surfaceHover text-gray-200 text-left transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-amberAccent" />
                            <span>View Profile</span>
                          </button>

                          <button
                            onClick={() => handleLogBagForFarmer(farmer)}
                            className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-surfaceHover text-emerald-400 text-left transition-colors font-semibold"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Log Harvest Bag</span>
                          </button>

                          <button
                            onClick={() => {
                              setOpenKebabId(null);
                              toast.info('Edit Farmer', `Editing modal for ${farmer.name}`);
                            }}
                            className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-surfaceHover text-gray-300 text-left transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>Edit Profile</span>
                          </button>

                          <div className="border-t border-borderToken/60 my-1" />

                          <button
                            onClick={() => handleDeleteFarmer(farmer)}
                            className="w-full flex items-center space-x-2 px-3.5 py-2 hover:bg-red-500/10 text-red-400 text-left transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Delete Farmer</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginated Footer */}
        {meta && (
          <div className="px-6 py-4 border-t border-borderToken bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <div>
              Showing Page <span className="font-bold text-gray-100">{meta.page}</span> of{' '}
              <span className="font-bold text-gray-100">{meta.totalPages}</span> ({meta.totalRecords} Total Farmers)
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-bold text-amberAccent bg-amberAccent/10 px-3 py-1 rounded-lg border border-amberAccent/20">
                5 per page (Strict Rule)
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300 hover:text-gray-100"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300 hover:text-gray-100"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LogBagModal isOpen={isLogBagOpen} onClose={() => setIsLogBagOpen(false)} />
      <FarmerProfileDrawer
        farmer={selectedFarmer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogHarvestForFarmer={handleLogBagForFarmer}
      />
    </div>
  );
}
