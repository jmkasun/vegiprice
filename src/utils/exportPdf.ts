import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VegetablePrice, Language } from '../types';

export async function exportCurrentViewToPdf(
  elementId: string,
  fileName: string = 'Dambulla_DEC_Market_Report.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export PDF failed: element with id '${elementId}' not found.`);
    return false;
  }

  try {
    // Render element to high-res canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20; // 10mm margins on left & right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    // Handle multi-page if content overflows A4 height
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
}

export function generateOfficialPriceBulletinPdf(
  vegetables: VegetablePrice[],
  language: Language,
  lastUpdated: string
) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const dateStr = new Date().toLocaleDateString('en-CA');

  // Header Banner
  pdf.setFillColor(6, 78, 59); // Emerald-900
  pdf.rect(0, 0, pageWidth, 32, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('DAMBULLA DEDICATED ECONOMIC CENTRE', 14, 13);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(251, 191, 36); // Amber-400
  pdf.text('Official Daily Wholesale & Retail Price Bulletin', 14, 20);

  pdf.setTextColor(209, 250, 229);
  pdf.setFontSize(8.5);
  pdf.text(`Date: ${dateStr} | Ref: dambulladec.com | Updated: ${lastUpdated}`, 14, 26);

  // Decorative Accent line
  pdf.setFillColor(245, 158, 11); // Amber-500
  pdf.rect(0, 32, pageWidth, 2, 'F');

  // Table Headers
  let y = 42;
  pdf.setFillColor(241, 245, 249); // Slate-100
  pdf.rect(10, y, pageWidth - 20, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 41, 59);

  pdf.text('#', 14, y + 5.5);
  pdf.text('Vegetable Item', 24, y + 5.5);
  pdf.text('Category', 85, y + 5.5);
  pdf.text('Wholesale (Min - Max)', 120, y + 5.5);
  pdf.text('Avg (LKR/kg)', 165, y + 5.5);
  pdf.text('Trend', 190, y + 5.5);

  y += 9;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  vegetables.forEach((veg, idx) => {
    // Page overflow check
    if (y > 275) {
      pdf.addPage();
      y = 15;
      
      // Draw sub-header on new page
      pdf.setFillColor(241, 245, 249);
      pdf.rect(10, y, pageWidth - 20, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text('#', 14, y + 5.5);
      pdf.text('Vegetable Item', 24, y + 5.5);
      pdf.text('Category', 85, y + 5.5);
      pdf.text('Wholesale (Min - Max)', 120, y + 5.5);
      pdf.text('Avg (LKR/kg)', 165, y + 5.5);
      pdf.text('Trend', 190, y + 5.5);
      y += 9;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
    }

    // Alternating Row background
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(10, y - 4, pageWidth - 20, 7, 'F');
    }

    pdf.setTextColor(51, 65, 85);
    pdf.text(String(idx + 1), 14, y);
    
    // Vegetable name (English + Sinhala text if clean ascii/unicode safe)
    const nameText = `${veg.nameEn} (${veg.nameSi})`;
    pdf.text(nameText.length > 32 ? nameText.substring(0, 30) + '..' : nameText, 24, y);
    
    pdf.text(veg.category, 85, y);
    pdf.text(`Rs. ${veg.wholesaleMin} - ${veg.wholesaleMax}`, 120, y);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Rs. ${veg.wholesaleAvg}`, 165, y);

    const changeText = `${veg.changePercent >= 0 ? '+' : ''}${veg.changePercent}%`;
    if (veg.changePercent < 0) {
      pdf.setTextColor(220, 38, 38); // Red
    } else if (veg.changePercent > 0) {
      pdf.setTextColor(22, 163, 74); // Green
    } else {
      pdf.setTextColor(100, 116, 139); // Gray
    }
    pdf.text(changeText, 190, y);

    pdf.setFont('helvetica', 'normal');
    y += 6.5;
  });

  // Footer on last page
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    'Dambulla Dedicated Economic Centre • Official Price Tracker Bulletin • Generated automatically',
    14,
    288
  );

  pdf.save(`Dambulla_DEC_Price_Bulletin_${dateStr}.pdf`);
}
