'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, Printer, FileCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { downloadCertificatePDF } from '../lib/pdfGenerator';
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from './ModalShell';

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

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function buildTraceUrl(lotId: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/trace/${encodeURIComponent(lotId)}`;
  }
  return `https://coffe-tracing-system-tau.vercel.app/trace/${encodeURIComponent(lotId)}`;
}

export function CertificateModal({
  isOpen,
  onClose,
  lotId = 'EXPORT-SUPER-LOT-01',
  weightKg = 250,
  farmers = [],
  region = 'Southern & Northern Provinces, Rwanda',
  attributions,
  variety = 'Bourbon',
  qualityScore = 95,
  moisturePercent = 10.9,
}: CertificateModalProps) {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [lineageHash, setLineageHash] = useState<string>('…');

  const issuedAt = new Date();
  const timestamp =
    issuedAt.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const certificateRefNo = `CT-${issuedAt.getFullYear()}-${lotId.replace(/[^A-Z0-9]/gi, '').slice(0, 18)}`;
  const traceUrl = buildTraceUrl(lotId);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=6&data=${encodeURIComponent(traceUrl)}`;

  const displayAttributions: FarmerAttributionItem[] =
    attributions && attributions.length > 0
      ? attributions
      : [
          {
            farmerCode: 'FRM-RWA-001',
            farmerName: 'Jean-Luc Habimana',
            region: 'Huye District',
            country: 'Rwanda',
            contributedWeightKg: 100,
            contributionPercentage: 40,
          },
          {
            farmerCode: 'FRM-RWA-002',
            farmerName: 'Marie-Claire Mukamana',
            region: 'Nyamagabe',
            country: 'Rwanda',
            contributedWeightKg: 65,
            contributionPercentage: 26,
          },
          {
            farmerCode: 'FRM-RWA-003',
            farmerName: 'Emmanuel Nshimiyimana',
            region: 'Gakenke',
            country: 'Rwanda',
            contributedWeightKg: 50,
            contributionPercentage: 20,
          },
          {
            farmerCode: 'FRM-RWA-004',
            farmerName: 'Bosco Mugisha',
            region: 'Rutsiro',
            country: 'Rwanda',
            contributedWeightKg: 35,
            contributionPercentage: 14,
          },
        ];

  useEffect(() => {
    if (!isOpen) return;
    const payload = JSON.stringify({
      lotId,
      weightKg,
      variety,
      qualityScore,
      moisturePercent,
      region,
      farmers: farmers.length ? farmers : displayAttributions.map((a) => a.farmerName),
      attributions: displayAttributions.map((a) => ({
        farmerCode: a.farmerCode,
        contributedWeightKg: a.contributedWeightKg,
        contributionPercentage: a.contributionPercentage,
      })),
    });
    let cancelled = false;
    sha256Hex(payload).then((hash) => {
      if (!cancelled) setLineageHash(hash);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, lotId, weightKg, variety, qualityScore, moisturePercent, region, farmers, attributions]);

  const handlePrint = () => {
    window.print();
    toast.success('Print started', `Certificate for ${lotId}`);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await downloadCertificatePDF('certificate-pdf-canvas', `CoffeeTrace_Certificate_${lotId}.pdf`);
      toast.success('PDF saved', `CoffeeTrace_Certificate_${lotId}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('PDF failed', 'Could not generate the certificate PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-3xl" zClass="z-[120]">
      <ModalHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-gray-100">Origin Certificate</h2>
            <p className="text-xs text-gray-400 truncate">Preview · print or download as PDF</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-borderToken text-gray-400 hover:text-gray-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </ModalHeader>

      <ModalBody className="bg-[#1a1814]/40">
        {/* Printable paper certificate — light document style for PDF */}
        <div
          id="certificate-pdf-canvas"
          className="mx-auto w-full max-w-[720px] bg-white text-[#1c2430] shadow-xl"
          style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
        >
          <div className="border-[3px] border-[#1c2430] m-3 sm:m-4">
            <div className="border border-[#1c2430]/35 m-1.5 p-5 sm:p-8">
              {/* Letterhead */}
              <div className="text-center border-b border-[#1c2430]/25 pb-4 mb-5">
                <p
                  className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#4a5568]"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  CoffeeTrace Export Documentation
                </p>
                <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#1c2430]">
                  Certificate of Origin
                </h1>
                <p
                  className="mt-1 text-[11px] sm:text-xs text-[#4a5568]"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  Farmer weight attribution for multi-tier bag lineage
                </p>
              </div>

              {/* Meta row */}
              <div
                className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start justify-between mb-6"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <div className="space-y-2 text-[11px] sm:text-xs leading-relaxed flex-1">
                  <div className="grid grid-cols-[7.5rem_1fr] gap-x-2 gap-y-1.5">
                    <span className="text-[#64748b]">Certificate No.</span>
                    <span className="font-semibold tracking-wide">{certificateRefNo}</span>
                    <span className="text-[#64748b]">Issued</span>
                    <span>{timestamp}</span>
                    <span className="text-[#64748b]">Export lot</span>
                    <span className="font-mono font-semibold">{lotId}</span>
                    <span className="text-[#64748b]">Net weight</span>
                    <span className="font-semibold">{weightKg} kg</span>
                    <span className="text-[#64748b]">Variety</span>
                    <span>{variety}</span>
                    <span className="text-[#64748b]">Quality / moisture</span>
                    <span>
                      {qualityScore}/100 · {moisturePercent}% H₂O
                    </span>
                    <span className="text-[#64748b]">Origin</span>
                    <span>{region}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 shrink-0 self-center sm:self-start">
                  <div className="w-[88px] h-[88px] border border-[#cbd5e1] bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageUrl}
                      alt="QR code to live lot trace"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] text-[#64748b] text-center max-w-[100px] leading-tight">
                    Scan to open live lot trace
                  </span>
                </div>
              </div>

              {/* Attribution table */}
              <div className="mb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div className="flex items-end justify-between mb-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c2430]">
                    Farmer attribution
                  </h2>
                  <span className="text-[10px] text-[#64748b]">
                    {displayAttributions.length} producer
                    {displayAttributions.length === 1 ? '' : 's'}
                  </span>
                </div>
                <table className="w-full text-left text-[10px] sm:text-[11px] border-collapse">
                  <thead>
                    <tr className="border-y border-[#1c2430]">
                      <th className="py-2 pr-2 font-semibold">Code</th>
                      <th className="py-2 pr-2 font-semibold">Producer</th>
                      <th className="py-2 pr-2 font-semibold hidden sm:table-cell">Region</th>
                      <th className="py-2 pr-2 font-semibold text-right">Mass</th>
                      <th className="py-2 font-semibold text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayAttributions.map((attr) => (
                      <tr key={attr.farmerCode} className="border-b border-[#e2e8f0]">
                        <td className="py-2 pr-2 font-mono text-[10px]">{attr.farmerCode}</td>
                        <td className="py-2 pr-2 font-medium">{attr.farmerName}</td>
                        <td className="py-2 pr-2 text-[#475569] hidden sm:table-cell">
                          {attr.region}, {attr.country}
                        </td>
                        <td className="py-2 pr-2 text-right font-mono">
                          {attr.contributedWeightKg} kg
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {attr.contributionPercentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Integrity line */}
              <div
                className="mb-6 p-3 border border-[#e2e8f0] bg-[#f8fafc]"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#64748b] mb-1">
                  Document fingerprint (SHA-256)
                </p>
                <p className="font-mono text-[9px] sm:text-[10px] break-all text-[#334155] leading-relaxed">
                  {lineageHash}
                </p>
              </div>

              {/* Signatures */}
              <div
                className="grid grid-cols-2 gap-6 sm:gap-10 pt-2"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <div>
                  <div className="h-10 border-b border-[#1c2430]/50 mb-2" />
                  <p className="text-[10px] font-semibold text-[#1c2430]">Origin Inspector</p>
                  <p className="text-[9px] text-[#64748b]">Cooperative verification</p>
                </div>
                <div>
                  <div className="h-10 border-b border-[#1c2430]/50 mb-2" />
                  <p className="text-[10px] font-semibold text-[#1c2430]">CoffeeTrace Desk</p>
                  <p className="text-[9px] text-[#64748b]">Traceability records</p>
                </div>
              </div>

              <p
                className="mt-6 text-center text-[9px] text-[#94a3b8] leading-relaxed"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                This certificate summarises lineage data held in CoffeeTrace at the time of issue.
                Verify the lot at the QR destination for the live graph.
              </p>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-amberAccent shrink-0" />
            <span>A4 portrait PDF · paper document layout</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-borderToken bg-surface hover:bg-surfaceHover text-gray-200 text-xs font-bold"
            >
              <Printer className="w-4 h-4 text-amberAccent" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amberAccent text-gray-950 text-xs font-black hover:opacity-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </ModalFooter>
    </ModalShell>
  );
}
