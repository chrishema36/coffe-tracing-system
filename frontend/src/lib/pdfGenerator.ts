import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportCertificateData {
  lotId: string;
  weightKg: number;
  region: string;
  variety?: string;
  qualityScore?: number;
  moisturePercent?: number;
  timestamp: string;
  sha256Hash: string;
  attributions?: Array<{
    farmerCode: string;
    farmerName: string;
    region: string;
    country: string;
    contributedWeightKg: number;
    contributionPercentage: number;
  }>;
  farmers?: string[];
}

/**
 * Captures the specified certificate DOM element and exports a crisp, high-resolution PDF certificate.
 */
export async function downloadCertificatePDF(
  elementId: string,
  filename: string = 'CoffeeTrace_Origin_Certificate.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Certificate element with id "${elementId}" not found.`);
  }

  // Temporary clone or high-DPI capture setting
  const canvas = await html2canvas(element, {
    scale: 3, // High DPI capture for ultra crisp text and visuals
    useCORS: true,
    logging: false,
    backgroundColor: '#0c0f17', // Match dark theme container
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // Initialize jsPDF in Landscape mode (A4: 297mm x 210mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(filename);
}
