'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFarmers } from '../../lib/api';
import { FarmersTable } from '../../components/FarmersTable';
import { RegisterFarmerModal } from '../../components/RegisterFarmerModal';
import { Users, UserPlus, MapPin, Mountain, Award, Sparkles } from 'lucide-react';

export default function FarmersPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['allFarmersStats'],
    queryFn: () => fetchFarmers(1, 100),
  });

  const allFarmers = data?.data || [];
  const totalFarmers = data?.pagination?.totalRecords || allFarmers.length;

  // Calculate distinct regions
  const distinctRegions = new Set(allFarmers.map((f) => f.region)).size || 4;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderToken/70 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amberAccent/10 border border-amberAccent/20 text-amberAccent text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SLR Coffee Supply Chain Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-100 flex items-center space-x-2.5 mt-1 tracking-tight">
            <Users className="w-6 h-6 text-amberAccent" />
            <span>Farmers Management Directory</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Registered smallholder coffee farmers, origin altitude profiles, and harvest yield attributions.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amberAccent to-amber-600 text-gray-950 font-extrabold text-xs hover:opacity-95 shadow-lg shadow-amberAccent/20 transition-all hover:scale-[1.01]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Farmer</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Registered</span>
            <Users className="w-4 h-4 text-amberAccent" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-100 font-mono">
            {totalFarmers} <span className="text-xs font-normal text-gray-400">Farmers</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Origin Regions</span>
            <MapPin className="w-4 h-4 text-amberAccent" />
          </div>
          <div className="mt-2 text-2xl font-black text-gray-100 font-mono">
            {distinctRegions} <span className="text-xs font-normal text-gray-400">Provinces</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-borderToken/60 bg-surface/80 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Avg elevation</span>
            <Mountain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            1,780m <span className="text-xs font-normal text-gray-400">MASL</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <FarmersTable />

      {/* Register Farmer Modal */}
      <RegisterFarmerModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
}
