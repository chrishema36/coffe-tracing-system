'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFarmer } from '../lib/api';
import { Farmer } from '../types';
import { X, UserCog, MapPin, Phone, Mail, Mountain, CheckCircle } from 'lucide-react';
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell';

interface EditFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Farmer | null;
}

export function EditFarmerModal({ isOpen, onClose, farmer }: EditFarmerModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    country: 'Rwanda',
    elevationM: 1500,
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        email: farmer.email || '',
        phone: farmer.phone || '',
        region: farmer.region || '',
        country: farmer.country || 'Rwanda',
        elevationM: farmer.elevationM || 1500,
      });
      setSuccessMsg('');
    }
  }, [farmer]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        region: formData.region.trim(),
        country: formData.country.trim() || 'Rwanda',
        elevationM: formData.elevationM || null,
      };
      return updateFarmer(farmer!.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setSuccessMsg('Farmer profile updated.');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 900);
    },
  });

  return (
    <ModalShell isOpen={isOpen && !!farmer} onClose={onClose} maxWidthClass="max-w-lg">
      <ModalHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-100">Edit Farmer</h2>
              <p className="text-xs text-gray-400 font-mono truncate">
                {farmer?.code} · code is immutable
              </p>
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-col min-h-0 flex-1"
      >
        <ModalBody className="space-y-4 text-xs">
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {mutation.isError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {(mutation.error as any)?.response?.data?.message || 'Failed to update farmer.'}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-gray-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Region
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 flex items-center gap-1">
                <Mountain className="w-3 h-3" /> Elevation (m)
              </label>
              <input
                type="number"
                value={formData.elevationM}
                onChange={(e) => setFormData({ ...formData, elevationM: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-borderToken text-gray-100 focus:outline-none focus:border-amberAccent"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-borderToken text-gray-400 hover:text-gray-200 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-lg bg-amberAccent text-gray-950 font-semibold hover:bg-amberAccent/90 disabled:opacity-50 text-xs"
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </ModalFooter>
      </form>
    </ModalShell>
  );
}
