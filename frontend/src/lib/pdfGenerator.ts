import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures the certificate DOM and exports a portrait A4 PDF
 * sized to fit the page with white paper margins.
 */
export async function downloadCertificatePDF(
  elementId: string,
  filename: string = 'CoffeeTrace_Origin_Certificate.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Certificate element with id "${elementId}" not found.`);
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const renderWidth = canvas.width * ratio;
  const renderHeight = canvas.height * ratio;
  const x = (pageWidth - renderWidth) / 2;
  const y = margin;

  pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
  pdf.save(filename);
}
