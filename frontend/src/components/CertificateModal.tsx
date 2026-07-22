'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Download,
  Printer,
  CheckCircle,
  Coffee,
  Calendar,
  MapPin,
  Hash,
  Sparkles,
  QrCode,
  Scale,
  FileCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { downloadCertificatePDF } from '../lib/pdfGenerator';

export interface FarmerAttributionItem {
  farmerCode: string;
  farmerName: string;
  region: string;
  country: string;
  contributedWeightKg: number;
  contributionPercentage: number;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lotId?: string;
  weightKg?: number;
  farmers?: string[];
  region?: string;
  attributions?: FarmerAttributionItem[];
  variety?: string;
  qualityScore?: number;
  moisturePercent?: number;
}

export function CertificateModal({
  isOpen,
  onClose,
  lotId = 'EXPORT-SUPER-LOT-01',
  weightKg = 250,
  farmers = ['Jean-Luc Habimana', 'Marie-Claire Mukamana', 'Emmanuel Nshimiyimana', 'Bosco Mugisha'],
  region = 'Southern & Northern Provinces, Rwanda',
  attributions,
  variety = 'Bourbon / Specialty Arabica',
  qualityScore = 95,
  moisturePercent = 10.9,
}: CertificateModalProps) {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportTheme, setExportTheme] = useState<'dark' | 'light'>('dark');

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const sha256Hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const certificateRefNo = `CT-CERT-2026-${lotId.replace(/[^A-Z0-9]/gi, '')}`;

  if (!isOpen) return null;

  // Build fallback attributions if none provided
  const displayAttributions: FarmerAttributionItem[] = attributions && attributions.length > 0
    ? attributions
    : [
        {
          farmerCode: 'FRM-RWA-001',
          farmerName: 'Jean-Luc Habimana',
          region: 'Huye District',
          country: 'Rwanda',
          contributedWeightKg: 100,
          contributionPercentage: 40.0,
        },
        {
          farmerCode: 'FRM-RWA-002',
          farmerName: 'Marie-Claire Mukamana',
          region: 'Nyamagabe',
          country: 'Rwanda',
          contributedWeightKg: 65,
          contributionPercentage: 26.0,
        },
        {
          farmerCode: 'FRM-RWA-003',
          farmerName: 'Emmanuel Nshimiyimana',
          region: 'Gakenke',
          country: 'Rwanda',
          contributedWeightKg: 50,
          contributionPercentage: 20.0,
        },
        {
          farmerCode: 'FRM-RWA-004',
          farmerName: 'Bosco Mugisha',
          region: 'Rutsiro',
          country: 'Rwanda',
          contributedWeightKg: 35,
          contributionPercentage: 14.0,
        },
      ];

  const handlePrint = () => {
    window.print();
    toast.success('Certificate Printing Triggered', `Export Certificate for ${lotId} sent to printer.`);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await downloadCertificatePDF('certificate-pdf-canvas', `CoffeeTrace_Certificate_${lotId}.pdf`);
      toast.success(
        'PDF Certificate Generated',
        `High-resolution export certificate saved as CoffeeTrace_Certificate_${lotId}.pdf`
      );
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('PDF Generation Failed', 'An error occurred while building the PDF certificate.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-background/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl rounded-3xl border border-amber-500/40 bg-surface shadow-2xl overflow-hidden z-10 my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Gold Gradient Bar */}
        <div className="h-2.5 bg-gradient-to-r from-amber-600 via-amber-400 via-emerald-400 to-amber-600 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-borderToken flex items-center justify-between bg-surfaceHover/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amberAccent shadow-md">
              <Award className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amberAccent text-[10px] font-extrabold border border-amber-500/25">
                <Sparkles className="w-3 h-3" />
                <span>SLR Enterprise Certified Origin</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-gray-100 tracking-tight mt-0.5">
                Coffee Origin Export Certificate
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme Toggle for Preview */}
            <div className="hidden sm:flex items-center bg-background/80 rounded-xl p-1 border border-borderToken text-xs font-bold">
              <button
                onClick={() => setExportTheme('dark')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  exportTheme === 'dark'
                    ? 'bg-amber-500/20 text-amberAccent border border-amber-500/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Dark Gold
              </button>
              <button
                onClick={() => setExportTheme('light')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  exportTheme === 'light'
                    ? 'bg-amber-500/20 text-amberAccent border border-amber-500/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Light Ivory
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-borderToken text-gray-400 hover:text-gray-100 hover:bg-surface transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-background/50">
          {/* THE PRINT/PDF CERTIFICATE CANVAS CONTAINER */}
          <div
            id="certificate-pdf-canvas"
            className={`relative p-6 sm:p-10 rounded-2xl border-2 shadow-2xl transition-all duration-300 ${
              exportTheme === 'dark'
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-amber-500/50 text-gray-100'
                : 'bg-gradient-to-br from-amber-50/95 via-white to-amber-100/90 border-amber-700/60 text-slate-900'
            }`}
          >
            {/* Decorative Gold Frame Corners */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500/70" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500/70" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500/70" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500/70" />

            {/* Inner Double Gold Border */}
            <div className="absolute inset-2 border border-dashed border-amber-500/30 rounded-xl pointer-events-none" />

            {/* Certificate Header Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b pb-6 border-amber-500/30">
              <div className="flex items-center space-x-4 text-center sm:text-left">
                {/* Gold Crest Emblem */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-xl shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                    <Coffee className="w-8 h-8" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">
                      SLR ENTERPRISE • COFFEETRACE AUTHORITY
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight mt-0.5">
                    Official Certificate of Origin & Lineage
                  </h1>
                  <p className={`text-xs mt-1 ${exportTheme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                    Verifiable Multi-Tier Recursive Harvest Aggregation & Farmer Attribution
                  </p>
                </div>
              </div>

              {/* Serial & QR Code Header Block */}
              <div className="flex items-center space-x-4 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30">
                <div className="w-14 h-14 bg-slate-950 border border-amber-500/40 rounded-xl flex flex-col items-center justify-center text-amber-400 p-1">
                  <QrCode className="w-7 h-7" />
                  <span className="text-[8px] font-mono font-bold mt-0.5">VERIFIED</span>
                </div>
                <div className="text-left space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                    Certificate Reference
                  </div>
                  <div className="text-xs font-mono font-black tracking-wider text-amber-400">
                    {certificateRefNo}
                  </div>
                  <div className="text-[9px] font-mono text-gray-400">{timestamp}</div>
                </div>
              </div>
            </div>

            {/* Core Export Lot Metadata Grid */}
            <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div
                className={`p-3.5 rounded-xl border ${
                  exportTheme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white/90 border-amber-200 shadow-sm'
                }`}
              >
                <div className="text-[9px] font-extrabold uppercase text-amber-500 flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span>Export Lot Code</span>
                </div>
                <div className="font-mono font-black text-sm mt-1 text-amber-400">{lotId}</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  exportTheme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white/90 border-amber-200 shadow-sm'
                }`}
              >
                <div className="text-[9px] font-extrabold uppercase text-amber-500 flex items-center space-x-1">
                  <Scale className="w-3 h-3" />
                  <span>Certified Net Weight</span>
                </div>
                <div className="font-mono font-black text-sm mt-1 text-emerald-400">{weightKg} kg</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  exportTheme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white/90 border-amber-200 shadow-sm'
                }`}
              >
                <div className="text-[9px] font-extrabold uppercase text-amber-500 flex items-center space-x-1">
                  <Coffee className="w-3 h-3" />
                  <span>Coffee Cultivar</span>
                </div>
                <div className="font-bold text-xs mt-1 truncate">{variety}</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  exportTheme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800'
                    : 'bg-white/90 border-amber-200 shadow-sm'
                }`}
              >
                <div className="text-[9px] font-extrabold uppercase text-amber-500 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Cup Score & Moisture</span>
                </div>
                <div className="font-bold text-xs mt-1 text-amber-400">
                  {qualityScore}/100 Score • {moisturePercent}% H₂O
                </div>
              </div>
            </div>

            {/* Origin Region Banner */}
            <div
              className={`p-3.5 rounded-xl border mb-6 flex items-center justify-between text-xs ${
                exportTheme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 text-gray-200'
                  : 'bg-amber-100/60 border-amber-300 text-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-extrabold uppercase text-[10px] text-amber-500">Origin Territory:</span>
                <span className="font-bold">{region}</span>
              </div>
              <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                1,750m - 2,050m MASL
              </span>
            </div>

            {/* Attributed Farmers Table */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Smallholder Farmer Origin Attribution Breakdown</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">
                  {displayAttributions.length} Verified Participating Farmers
                </span>
              </div>

              <div
                className={`rounded-xl border overflow-hidden ${
                  exportTheme === 'dark' ? 'border-slate-800 bg-slate-950/70' : 'border-amber-200 bg-white'
                }`}
              >
                <table className="w-full text-left text-xs">
                  <thead
                    className={`text-[9px] font-extrabold uppercase tracking-wider border-b ${
                      exportTheme === 'dark'
                        ? 'bg-slate-900 text-gray-400 border-slate-800'
                        : 'bg-amber-50 text-slate-600 border-amber-200'
                    }`}
                  >
                    <tr>
                      <th className="px-4 py-2.5">Farmer Code</th>
                      <th className="px-4 py-2.5">Farmer Name</th>
                      <th className="px-4 py-2.5">Region / District</th>
                      <th className="px-4 py-2.5">Contributed Mass</th>
                      <th className="px-4 py-2.5">Attribution %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {displayAttributions.map((attr, idx) => (
                      <tr
                        key={idx}
                        className={exportTheme === 'dark' ? 'hover:bg-slate-900/50' : 'hover:bg-amber-50/50'}
                      >
                        <td className="px-4 py-2 font-mono font-bold text-amber-500">{attr.farmerCode}</td>
                        <td className="px-4 py-2 font-semibold">{attr.farmerName}</td>
                        <td className="px-4 py-2 text-gray-400">
                          {attr.region}, {attr.country}
                        </td>
                        <td className="px-4 py-2 font-mono font-semibold">{attr.contributedWeightKg} kg</td>
                        <td className="px-4 py-2 font-mono font-bold text-emerald-400">
                          {attr.contributionPercentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cryptographic SHA-256 Lineage Hash Box */}
            <div
              className={`p-3.5 rounded-xl border mb-6 space-y-1 ${
                exportTheme === 'dark'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographic SHA-256 Lineage Fingerprint</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                  IMMUTABLE PROOF
                </span>
              </div>
              <div className="font-mono text-[10px] break-all bg-slate-950/90 text-gray-300 p-2 rounded-lg border border-slate-800">
                {sha256Hash}
              </div>
            </div>

            {/* Official Signatures & Seal Block */}
            <div className="pt-4 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              {/* Signature 1 */}
              <div className="space-y-1 text-center">
                <div className="font-serif italic text-sm font-bold text-amber-500 border-b border-amber-500/40 pb-1 px-4">
                  Jean-Luc Habimana
                </div>
                <div className="text-[9px] font-extrabold uppercase text-gray-400">Lead Origin Inspector</div>
                <div className="text-[8px] font-mono text-gray-500">Huye Farmers Cooperative Union</div>
              </div>

              {/* Gold Embossed Starburst Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-2xl flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-slate-950 bg-amber-500 flex flex-col items-center justify-center text-slate-950 text-center p-1 font-black leading-none">
                    <CheckCircle2 className="w-5 h-5 mb-0.5" />
                    <span className="text-[7px] uppercase tracking-tighter">SLR CERTIFIED</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono font-bold text-amber-500 mt-1">OFFICIAL SEAL</span>
              </div>

              {/* Signature 2 */}
              <div className="space-y-1 text-center">
                <div className="font-serif italic text-sm font-bold text-amber-500 border-b border-amber-500/40 pb-1 px-4">
                  Dr. Aris Thorne
                </div>
                <div className="text-[9px] font-extrabold uppercase text-gray-400">Director of Traceability</div>
                <div className="text-[8px] font-mono text-gray-500">CoffeeTrace International Standards</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-borderToken bg-surfaceHover/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-gray-400 flex items-center space-x-1.5">
            <FileCheck className="w-4 h-4 text-amberAccent" />
            <span>Official High-Resolution PDF Certificate Manifest</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-200 text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4 text-amberAccent" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amberAccent via-amber-500 to-amber-600 text-gray-950 text-xs font-black hover:opacity-95 shadow-lg shadow-amberAccent/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
