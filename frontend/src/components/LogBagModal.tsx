'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBag, fetchFarmers } from '../lib/api';
import { X, PackagePlus, Scale, Sparkles, CheckCircle } from 'lucide-react';
import { CoffeeVariety } from '../types';
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell';

interface LogBagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogBagModal({ isOpen, onClose }: LogBagModalProps) {
  const queryClient = useQueryClient();

  const { data: farmersData } = useQuery({
    queryKey: ['allFarmersList'],
    queryFn: () => fetchFarmers(1, 5),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      farmerId: formData.farmerId || farmers[0]?.id || '',
    };
    mutation.mutate(payload);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-lg">
      <ModalHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-amberAccent/10 text-amberAccent border border-amberAccent/20 shrink-0">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-100">Log Harvested Bag</h2>
              <p className="text-xs text-gray-400 truncate">Record a single-farmer harvest bag</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <ModalBody className="space-y-4 text-xs">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {mutation.isError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              Failed to log bag. Please verify farmer selection and weight parameters.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Bag Code</label>
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
                  Select farmer...
                </option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name} ({farmer.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-gray-500" />
                <span>Weight (kg)</span>
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
                <span>Quality</span>
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
              <option value="BOURBON">Bourbon</option>
              <option value="ARABICA">Arabica</option>
              <option value="GEISHA">Geisha</option>
              <option value="TYPICA">Typica</option>
              <option value="ROBUSTA">Robusta</option>
            </select>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-borderToken text-gray-400 hover:bg-surfaceHover font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 rounded-xl bg-amberAccent text-gray-950 font-bold hover:bg-amberAccent/90 disabled:opacity-50 text-xs"
            >
              {mutation.isPending ? 'Logging...' : 'Log Coffee Bag'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}
