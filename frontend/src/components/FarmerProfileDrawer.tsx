'use client';

import React from 'react';
import { X, User, Phone, Mail, MapPin, Package, Award, Calendar, TrendingUp, Coffee, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Farmer } from '../types';

interface FarmerProfileDrawerProps {
  farmer: Farmer | null;
  isOpen: boolean;
  onClose: () => void;
  onLogHarvestForFarmer?: (farmer: Farmer) => void;
}

export function FarmerProfileDrawer({ farmer, isOpen, onClose, onLogHarvestForFarmer }: FarmerProfileDrawerProps) {
  if (!isOpen || !farmer) return null;

  const totalBags = farmer.bags?.length || 0;
  const totalVolumeKg = farmer.bags?.reduce((acc, b) => acc + (b.initialWeightKg || 0), 0) || 0;
  const avgBagWeight = totalBags > 0 ? (totalVolumeKg / totalBags).toFixed(1) : '0';
  const highestYield = farmer.bags?.reduce((max, b) => Math.max(max, b.initialWeightKg || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-background/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-surface border-l border-borderToken h-full overflow-y-auto shadow-2xl flex flex-col justify-between z-10 animate-slideLeft">
        <div>
          {/* Drawer Header */}
          <div className="p-6 border-b border-borderToken bg-surfaceHover/50 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amberAccent/30 to-amber-900/60 flex items-center justify-center border border-amberAccent/40 text-amberAccent text-xl font-black shadow-lg">
                {farmer.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amberAccent/10 text-amberAccent text-[10px] font-extrabold border border-amberAccent/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Producer</span>
                </div>
                <h2 className="text-lg font-black text-gray-100 tracking-tight">{farmer.name}</h2>
                <div className="font-mono text-xs font-bold text-amberAccent">{farmer.code}</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-borderToken text-gray-400 hover:text-gray-100 hover:bg-surface transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Details */}
          <div className="p-6 space-y-6">
            {/* Contact & Location Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-borderToken bg-background/50 flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-amberAccent shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Region / Province</div>
                  <div className="font-semibold text-gray-200">{farmer.region}, {farmer.country}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-borderToken bg-background/50 flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Phone Number</div>
                  <div className="font-mono font-semibold text-gray-200">{farmer.phone || '+250 788 123 456'}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-borderToken bg-background/50 flex items-center space-x-3 sm:col-span-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase">Email Address</div>
                  <div className="font-mono font-semibold text-gray-200 truncate">
                    {farmer.email || `${farmer.code.toLowerCase()}@coffeetrace.org`}
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Statistics Section */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-300 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amberAccent" />
                <span>Producer Performance Statistics</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-borderToken bg-surface/80 space-y-1 border-t-2 border-t-amberAccent">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Lifetime Bags</span>
                  <div className="text-2xl font-black font-mono text-gray-100">{totalBags}</div>
                  <span className="text-[10px] text-amberAccent font-semibold">Logged Harvests</span>
                </div>

                <div className="p-4 rounded-xl border border-borderToken bg-surface/80 space-y-1 border-t-2 border-t-emerald-400">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Lifetime Volume</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">{totalVolumeKg} <span className="text-xs font-normal">kg</span></div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Total Gross Weight</span>
                </div>

                <div className="p-4 rounded-xl border border-borderToken bg-surface/80 space-y-1 border-t-2 border-t-sky-400">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Avg Bag Weight</span>
                  <div className="text-2xl font-black font-mono text-sky-400">{avgBagWeight} <span className="text-xs font-normal">kg</span></div>
                  <span className="text-[10px] text-sky-400 font-semibold">Per Harvest Batch</span>
                </div>

                <div className="p-4 rounded-xl border border-borderToken bg-surface/80 space-y-1 border-t-2 border-t-purple-400">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400">Highest Yield</span>
                  <div className="text-2xl font-black font-mono text-purple-400">{highestYield} <span className="text-xs font-normal">kg</span></div>
                  <span className="text-[10px] text-purple-400 font-semibold">Single Batch Peak</span>
                </div>
              </div>
            </div>

            {/* Harvest History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-200 flex items-center space-x-2">
                  <Coffee className="w-4 h-4 text-amberAccent" />
                  <span>Harvest History Ledger</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{totalBags} records</span>
              </div>

              {farmer.bags && farmer.bags.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {farmer.bags.map((bag) => (
                    <div
                      key={bag.id}
                      className="p-3 rounded-xl border border-borderToken bg-background/60 flex items-center justify-between text-xs hover:border-amberAccent/40 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-gray-200 flex items-center space-x-2">
                          <span>{bag.bagCode}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            {bag.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {bag.variety} • Initial: {bag.initialWeightKg} kg
                        </div>
                      </div>

                      <div className="font-mono font-bold text-amberAccent text-xs">
                        {bag.currentWeightKg} kg
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 border border-dashed border-borderToken rounded-xl">
                  No harvest bags logged for this farmer yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer CTA */}
        <div className="p-5 border-t border-borderToken bg-surfaceHover/40 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-300 text-xs font-bold transition-all"
          >
            Close Profile
          </button>
          {onLogHarvestForFarmer && (
            <button
              onClick={() => {
                onClose();
                onLogHarvestForFarmer(farmer);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-amberAccent hover:bg-amber-500 text-gray-950 text-xs font-extrabold transition-all shadow-md"
            >
              <Package className="w-4 h-4" />
              <span>Log Harvest</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
