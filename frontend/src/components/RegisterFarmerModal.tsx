'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFarmer } from '../lib/api';
import { X, UserPlus, MapPin, Phone, Mail, Mountain, CheckCircle } from 'lucide-react';

interface RegisterFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterFarmerModal({ isOpen, onClose }: RegisterFarmerModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    code: `FRM-RWA-${Math.floor(100 + Math.random() * 900)}`,
    email: '',
    phone: '',
    region: 'Huye District, Southern Province',
    country: 'Rwanda',
    elevationM: 1900,
  });

  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: createFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setSuccessMsg('Farmer registered successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 rounded-2xl border border-borderToken bg-surface shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderToken/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amberAccent/10 text-amberAccent border border-amberAccent/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-100">Register New Farmer</h2>
              <p className="text-xs text-gray-400">Add a Rwandan coffee producing partner to the system</p>
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
            Failed to register farmer. Please verify input fields.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Farmer Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-amberAccent font-mono font-bold focus:outline-none focus:border-amberAccent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jean-Paul Kagabo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="farmer@coop.rw"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                placeholder="+250-788-000-111"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span>Region / Washing Station</span>
              </label>
              <input
                type="text"
                placeholder="Huye District, Southern Province"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center space-x-1">
                <Mountain className="w-3.5 h-3.5 text-gray-500" />
                <span>Elevation (Meters)</span>
              </label>
              <input
                type="number"
                value={formData.elevationM}
                onChange={(e) => setFormData({ ...formData, elevationM: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
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
              {mutation.isPending ? 'Registering...' : 'Register Farmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
