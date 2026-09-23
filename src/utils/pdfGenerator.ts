import jsPDF from 'jspdf';
import { Payment, Receipt, StudentFeeSummary } from '../types/database';
import { SCHOOL_INFO } from '../services/mockData';

async function getLogoBase64(): Promise<string | null> {
  // Try direct fetch first (avoids crossOrigin canvas tainting)
  try {
    const res = await fetch('/logo.png');
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    // Fall back to Image element method below
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch (err) {
        // canvas tainted or other issue
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });
}

export async function generateReceiptPDF(payment: Payment, receipt: Receipt, feeSummary?: StudentFeeSummary): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const student = payment.student;
  const schoolClass = student?.school_class;

  // Colors matching electric violet modern theme
  const darkIndigo = [30, 27, 75]; // #1e1b4b
  const electricViolet = [99, 102, 241]; // #6366f1
  const emerald = [16, 185, 129]; // #10b981
  const darkGray = [30, 41, 59]; // #1e293b
  const lightGray = [248, 250, 252]; // #f8fafc

  // Header Banner Background (Deep Violet)
  doc.setFillColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
  doc.rect(0, 0, 210, 44, 'F');

  // Violet Accent Line
  doc.setFillColor(electricViolet[0], electricViolet[1], electricViolet[2]);
  doc.rect(0, 44, 210, 3, 'F');

  // Embed School Logo Image
  try {
    const logoDataUrl = await getLogoBase64();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 12, 9, 24, 24);
    }
  } catch (e) {
    console.error('Failed to render logo on PDF', e);
  }

  // School Header Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(SCHOOL_INFO.name, 118, 15, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(199, 210, 254); // light lavender
  doc.text(`"${SCHOOL_INFO.motto}"`, 118, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(SCHOOL_INFO.address, 118, 29, { align: 'center' });
  doc.text(`Tel: ${SCHOOL_INFO.phone} | Email: ${SCHOOL_INFO.email}`, 118, 35, { align: 'center' });

  // Receipt Document Title Badge
  doc.setTextColor(electricViolet[0], electricViolet[1], electricViolet[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('OFFICIAL DIGITAL PAYMENT RECEIPT', 105, 55, { align: 'center' });

  // Metadata Box (Receipt No, Date, Ref & Method)
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(15, 60, 180, 22, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('RECEIPT NO:', 22, 67);
  doc.setTextColor(electricViolet[0], electricViolet[1], electricViolet[2]);
  doc.text(receipt.receipt_no, 48, 67);

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('DATE ISSUED:', 125, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(receipt.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 152, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('TRANSACTION REF:', 22, 75);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
  doc.text(payment.reference, 58, 75);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('PAYMENT CHANNEL:', 125, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.method.replace('_', ' ').toUpperCase(), 164, 75);

  // Student Info Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(electricViolet[0], electricViolet[1], electricViolet[2]);
  doc.text('STUDENT & GUARDIAN DETAILS', 15, 92);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 94, 195, 94);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Student Full Name:', 15, 101);
  doc.setFont('helvetica', 'normal');
  doc.text(student?.full_name || 'N/A', 55, 101);

  doc.setFont('helvetica', 'bold');
  doc.text('Admission Number:', 15, 108);
  doc.setFont('helvetica', 'normal');
  doc.text(student?.admission_no || 'N/A', 55, 108);

  doc.setFont('helvetica', 'bold');
  doc.text('Class / Arm:', 15, 115);
  doc.setFont('helvetica', 'normal');
  doc.text(`${schoolClass?.name || ''} ${schoolClass?.arm || ''}`.trim() || 'N/A', 55, 115);

  doc.setFont('helvetica', 'bold');
  doc.text('Guardian Name:', 120, 101);
  doc.setFont('helvetica', 'normal');
  doc.text(student?.guardian?.full_name || 'N/A', 155, 101);

  doc.setFont('helvetica', 'bold');
  doc.text('Guardian Phone:', 120, 108);
  doc.setFont('helvetica', 'normal');
  doc.text(student?.guardian?.phone || 'N/A', 155, 108);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Term:', 120, 115);
  doc.setFont('helvetica', 'normal');
  doc.text(feeSummary?.session_term ? `${feeSummary.session_term.session} (${feeSummary.session_term.term} Term)` : '2025/2026 First Term', 155, 115);

  // Table of Fees Paid
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(electricViolet[0], electricViolet[1], electricViolet[2]);
  doc.text('PAYMENT BREAKDOWN', 15, 129);

  // Table Header
  doc.setFillColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
  doc.roundedRect(15, 132, 180, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Item Description', 20, 137.5);
  doc.text('Channel', 110, 137.5);
  doc.text('Amount Paid (₦)', 190, 137.5, { align: 'right' });

  // Table Row
  let currentY = 146;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');

  const itemName = payment.fee_structure?.fee_item || 'School Fees Payment (Installment/Full)';

  doc.text(itemName, 20, currentY);
  doc.text(payment.method.replace('_', ' ').toUpperCase(), 110, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`₦${payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`, 190, currentY, { align: 'right' });

  currentY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, currentY, 195, currentY);

  // Total Paid Row Box
  currentY += 10;
  doc.setFillColor(236, 253, 245); // light emerald background
  doc.roundedRect(15, currentY - 5, 180, 12, 2, 2, 'F');
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT PAID:', 20, currentY + 2.5);
  doc.text(`₦${payment.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`, 190, currentY + 2.5, { align: 'right' });

  // Remaining Balance Section if feeSummary provided
  if (feeSummary) {
    currentY += 18;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkIndigo[0], darkIndigo[1], darkIndigo[2]);
    doc.text('TERMLY FINANCIAL STATUS OVERVIEW', 15, currentY);
    doc.line(15, currentY + 2, 195, currentY + 2);

    currentY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Total Fees Expected (This Term):`, 20, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`₦${feeSummary.total_fees_due.toLocaleString('en-NG')}`, 90, currentY);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Cumulative Paid:`, 115, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    doc.text(`₦${feeSummary.total_paid.toLocaleString('en-NG')}`, 190, currentY, { align: 'right' });

    currentY += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`REMAINING OUTSTANDING BALANCE:`, 20, currentY);
    doc.setFontSize(11);
    doc.setTextColor(feeSummary.balance_owed > 0 ? 217 : 16, feeSummary.balance_owed > 0 ? 119 : 185, feeSummary.balance_owed > 0 ? 6 : 129);
    doc.text(`₦${feeSummary.balance_owed.toLocaleString('en-NG')}`, 190, currentY, { align: 'right' });
  }

  // Footer & Audit Trail
  const pageHeight = 297;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, pageHeight - 35, 195, pageHeight - 35);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('This is an official computer-generated digital receipt issued by Solid Foundation Comprehensive High School.', 105, pageHeight - 28, { align: 'center' });
  doc.text('Verification Code: ' + receipt.receipt_no + '-' + payment.reference.slice(-6) + ' | HASH: sfhs_9a3f8b2d1c7e', 105, pageHeight - 23, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(electricViolet[0], electricViolet[1], electricViolet[2]);
  doc.text('Powered by Smart School Fees System & Paystack', 105, pageHeight - 16, { align: 'center' });

  // Save the generated PDF
  doc.save(`${receipt.receipt_no}_Solid_Foundation.pdf`);
}
