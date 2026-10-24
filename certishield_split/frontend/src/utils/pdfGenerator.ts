import { jsPDF } from 'jspdf';
import { Certificate, VerificationResult } from '../types';

export function downloadCertificatePdf(cert: Certificate, qrDataUrl?: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Dark cyber background styling
  doc.setFillColor(11, 5, 16);
  doc.rect(0, 0, width, height, 'F');

  // Neon pink border
  doc.setDrawColor(255, 46, 136);
  doc.setLineWidth(2);
  doc.rect(8, 8, width - 16, height - 16);

  // Inner subtle border
  doc.setDrawColor(123, 44, 191);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, width - 24, height - 24);

  // Header Title
  doc.setTextColor(255, 46, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CERTISHIELD CRYPTOGRAPHIC CREDENTIAL REGISTRY', width / 2, 24, { align: 'center' });

  // Institution
  doc.setTextColor(243, 232, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(cert.institutionName.toUpperCase(), width / 2, 38, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(190, 160, 220);
  doc.text('This is to officially certify that', width / 2, 50, { align: 'center' });

  // Holder Name
  doc.setTextColor(255, 111, 181);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(cert.holderName, width / 2, 66, { align: 'center' });

  // Fulfillment text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(243, 232, 255);
  doc.text('has successfully completed the prescribed academic curriculum and assessment for', width / 2, 78, { align: 'center' });

  // Course / Degree
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(cert.courseName, width / 2, 90, { align: 'center' });

  // Grade & Degree Type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(255, 46, 136);
  doc.text(`${cert.degreeType}  •  Honors / Result: ${cert.grade}`, width / 2, 102, { align: 'center' });

  // Metadata Panel Box
  doc.setFillColor(26, 10, 31);
  doc.roundedRect(20, 115, width - 40, 52, 3, 3, 'F');
  doc.setDrawColor(255, 46, 136);
  doc.setLineWidth(0.4);
  doc.roundedRect(20, 115, width - 40, 52, 3, 3, 'D');

  // Certificate ID & Dates
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 111, 181);
  doc.text('CERTIFICATE ID:', 26, 126);
  doc.setTextColor(255, 255, 255);
  doc.text(cert.id, 62, 126);

  doc.setTextColor(255, 111, 181);
  doc.text('DATE OF ISSUE:', 26, 134);
  doc.setTextColor(255, 255, 255);
  doc.text(cert.issueDate, 62, 134);

  if (cert.expiryDate) {
    doc.setTextColor(255, 111, 181);
    doc.text('EXPIRY DATE:', 26, 142);
    doc.setTextColor(255, 255, 255);
    doc.text(cert.expiryDate, 62, 142);
  }

  doc.setTextColor(255, 111, 181);
  doc.text('LEDGER BLOCK #:', 26, 150);
  doc.setTextColor(255, 255, 255);
  doc.text(`${cert.blockNumber} (Immutable Chain)`, 62, 150);

  // Digital Fingerprint (SHA-256)
  doc.setTextColor(255, 111, 181);
  doc.text('DIGITAL FINGERPRINT (SHA-256):', 26, 158);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 240);
  doc.text(cert.fileHash, 26, 163);

  // QR Code
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', width - 68, 120, 42, 42);
  }

  // Footer notes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 140, 180);
  doc.text(
    'Verify instantly at any time by scanning the QR code or visiting certishield.app • Tamper-evident cryptographic ledger',
    width / 2,
    height - 12,
    { align: 'center' }
  );

  doc.save(`${cert.id}_${cert.holderName.replace(/\s+/g, '_')}_Certificate.pdf`);
}

export function downloadVerificationReceiptPdf(result: VerificationResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Dark cyber background
  doc.setFillColor(11, 5, 16);
  doc.rect(0, 0, width, height, 'F');

  // Border
  doc.setDrawColor(255, 46, 136);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, width - 20, height - 20);

  // Receipt Header
  doc.setTextColor(255, 46, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CERTISHIELD VERIFICATION RECEIPT', width / 2, 25, { align: 'center' });

  doc.setTextColor(180, 160, 210);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Official Cryptographic Integrity Proof & Verifier Attestation', width / 2, 32, { align: 'center' });

  // Status Box
  let statusFill = [20, 40, 30]; // Green default
  let statusBorder = [16, 185, 129];
  let statusText = 'VERIFIED AUTHENTIC';

  if (result.status === 'TAMPERED') {
    statusFill = [50, 10, 20];
    statusBorder = [239, 68, 68];
    statusText = 'TAMPERED / FINGERPRINT MISMATCH';
  } else if (result.status === 'REVOKED') {
    statusFill = [50, 10, 20];
    statusBorder = [239, 68, 68];
    statusText = 'REVOKED CREDENTIAL';
  } else if (result.status === 'NOT_FOUND') {
    statusFill = [50, 40, 10];
    statusBorder = [245, 158, 11];
    statusText = 'RECORD NOT FOUND';
  } else if (result.status === 'DUPLICATE_ALERT') {
    statusFill = [50, 30, 10];
    statusBorder = [249, 115, 22];
    statusText = 'DUPLICATE / FRAUD RISK ALERT';
  }

  doc.setFillColor(statusFill[0], statusFill[1], statusFill[2]);
  doc.setDrawColor(statusBorder[0], statusBorder[1], statusBorder[2]);
  doc.roundedRect(18, 42, width - 36, 26, 3, 3, 'FD');

  doc.setTextColor(statusBorder[0], statusBorder[1], statusBorder[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(statusText, width / 2, 54, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Trust Score: ${result.trustScore} / 100`, width / 2, 63, { align: 'center' });

  // Receipt Metadata
  doc.setFillColor(26, 10, 31);
  doc.setDrawColor(123, 44, 191);
  doc.roundedRect(18, 76, width - 36, 68, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 111, 181);
  doc.text('RECEIPT ID:', 24, 86);
  doc.setTextColor(255, 255, 255);
  doc.text(result.verificationReceiptId, 68, 86);

  doc.setTextColor(255, 111, 181);
  doc.text('TIMESTAMP (UTC):', 24, 94);
  doc.setTextColor(255, 255, 255);
  doc.text(result.timestamp, 68, 94);

  doc.setTextColor(255, 111, 181);
  doc.text('VERIFIED ID:', 24, 102);
  doc.setTextColor(255, 255, 255);
  doc.text(result.certificate?.id || 'N/A', 68, 102);

  doc.setTextColor(255, 111, 181);
  doc.text('HOLDER:', 24, 110);
  doc.setTextColor(255, 255, 255);
  doc.text(result.certificate?.holderName || 'Unregistered', 68, 110);

  doc.setTextColor(255, 111, 181);
  doc.text('ISSUER:', 24, 118);
  doc.setTextColor(255, 255, 255);
  doc.text(result.certificate?.institutionName || 'Unknown', 68, 118);

  doc.setTextColor(255, 111, 181);
  doc.text('PROGRAM:', 24, 126);
  doc.setTextColor(255, 255, 255);
  doc.text(result.certificate?.courseName || 'N/A', 68, 126);

  doc.setTextColor(255, 111, 181);
  doc.text('LEDGER BLOCK #:', 24, 134);
  doc.setTextColor(255, 255, 255);
  doc.text(`${result.certificate?.blockNumber || 0}`, 68, 134);

  // Cryptographic Digests Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 46, 136);
  doc.text('CRYPTOGRAPHIC FINGERPRINT ATTESTATION', 18, 156);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(200, 180, 230);
  doc.text('Verifier-Side Computed SHA-256 Digest:', 18, 164);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(result.computedHash || 'None', 18, 170);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(200, 180, 230);
  doc.text('Registry Expected SHA-256 Digest:', 18, 178);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(result.matchedHash || 'No Match in Ledger', 18, 184);

  // Explanation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 46, 136);
  doc.text('VERIFICATION ASSESSMENT:', 18, 198);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 220, 245);
  const splitExplanation = doc.splitTextToSize(result.explanation, width - 36);
  doc.text(splitExplanation, 18, 205);

  // Trust Factors Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 46, 136);
  doc.text('TRUST EVALUATION BREAKDOWN:', 18, 225);

  let y = 233;
  result.scoreBreakdown.forEach((factor) => {
    doc.setFont('helvetica', factor.passed ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(factor.passed ? 52 : 239, factor.passed ? 211 : 68, factor.passed ? 153 : 68);
    doc.text(`${factor.passed ? '[PASSED]' : '[FAILED]'}  ${factor.label} (${factor.points}/${factor.maxPoints} pts)`, 20, y);
    doc.setTextColor(190, 175, 215);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`- ${factor.reason}`, 26, y + 4.5);
    y += 10;
  });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(140, 120, 160);
  doc.text('Generated by CertiShield Anti-Tamper Engine • In-Browser Cryptographic Proof', width / 2, height - 14, { align: 'center' });

  doc.save(`CertiShield_Receipt_${result.verificationReceiptId}.pdf`);
}
