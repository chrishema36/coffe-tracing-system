'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBag, fetchFarmers } from '../lib/api';
import { X, PackagePlus, Scale, Sparkles, CheckCircle } from 'lucide-react';
import { CoffeeVariety } from '../types';

interface LogBagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogBagModal({ isOpen, onClose }: LogBagModalProps) {
  const queryClient = useQueryClient();

  const { data: farmersData } = useQuery({
    queryKey: ['allFarmersList'],
    queryFn: () => fetchFarmers(1, 100),
    enabled: isOpen,
  });

  const farmers = farmersData?.data || [];

  const [formData, setFormData] = useState({
    bagCode: `BAG-RWA-2026-H${Math.floor(100 + Math.random() * 900)}`,
    initialWeightKg: 60.0,
    moisturePercent: 11.2,
    qualityScore: 90,
    variety: CoffeeVariety.BOURBON,
    farmerId: '',
  });

  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: createBag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bags'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setSuccessMsg('Harvested coffee bag logged successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerId && farmers.length > 0) {
      formData.farmerId = farmers[0].id;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl border border-borderToken bg-surface shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderToken/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amberAccent/10 text-amberAccent border border-amberAccent/20">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">Log Harvested Bag</h2>
              <p className="text-xs text-gray-400">Record a new single-farmer harvested coffee bag</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200 hover:bg-surfaceHover transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emeraldAccent/10 border border-emeraldAccent/30 text-emeraldAccent text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {mutation.isError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            Failed to log bag. Please verify farmer selection and weight parameters.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Bag Identification Code</label>
              <input
                type="text"
                value={formData.bagCode}
                onChange={(e) => setFormData({ ...formData, bagCode: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-amberAccent font-mono font-bold focus:outline-none focus:border-amberAccent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Farmer Origin</label>
              <select
                value={formData.farmerId}
                onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              >
                <option value="" disabled>
                  Select Rwandan Farmer...
                </option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name} ({farmer.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-gray-500" />
                <span>Initial Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.initialWeightKg}
                onChange={(e) => setFormData({ ...formData, initialWeightKg: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Moisture %</label>
              <input
                type="number"
                step="0.1"
                value={formData.moisturePercent}
                onChange={(e) => setFormData({ ...formData, moisturePercent: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amberAccent" />
                <span>Quality Score</span>
              </label>
              <input
                type="number"
                value={formData.qualityScore}
                onChange={(e) => setFormData({ ...formData, qualityScore: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-amberAccent font-mono font-bold focus:outline-none focus:border-amberAccent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300">Coffee Variety</label>
            <select
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value as CoffeeVariety })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
            >
              <option value="BOURBON">Bourbon (Rwandan Specialty)</option>
              <option value="ARABICA">Arabica</option>
              <option value="GEISHA">Geisha</option>
              <option value="TYPICA">Typica</option>
              <option value="ROBUSTA">Robusta</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-borderToken/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-borderToken text-gray-400 hover:bg-surfaceHover transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 rounded-xl bg-amberAccent text-gray-950 font-bold hover:bg-amberAccent/90 shadow-lg shadow-amberAccent/20 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? 'Logging...' : 'Log Coffee Bag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
