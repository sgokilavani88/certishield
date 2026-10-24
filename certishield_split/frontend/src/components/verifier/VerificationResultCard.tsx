import React, { useState } from 'react';
import { 
  Shield, ShieldCheck, AlertTriangle, AlertOctagon, XCircle, Clock, Copy, Check, Download, 
  Share2, ShieldAlert, Award, FileText, ExternalLink, ChevronDown, ChevronUp, Lock 
} from 'lucide-react';
import { VerificationResult, Certificate } from '../../types';
import { downloadCertificatePdf, downloadVerificationReceiptPdf } from '../../utils/pdfGenerator';
import { buildVerificationUrl } from '../../utils/qrHelper';

interface VerificationResultCardProps {
  result: VerificationResult;
  qrDataUrl?: string;
  onReportFraud: (certId: string) => void;
  onReset: () => void;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  result,
  qrDataUrl,
  onReportFraud,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const cert = result.certificate;

  const handleCopyLink = () => {
    if (!cert) return;
    const url = buildVerificationUrl(cert.id, cert.fileHash);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color schemes based on status
  const getStatusConfig = () => {
    switch (result.status) {
      case 'VERIFIED':
        return {
          title: 'VERIFIED AUTHENTIC',
          subtitle: 'Cryptographically Verified Credential',
          bg: 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.35)]',
          textColor: 'text-emerald-400',
          icon: <ShieldCheck className="w-9 h-9 text-emerald-400 animate-shield-pulse" />,
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'TAMPERED':
        return {
          title: 'TAMPERED DOCUMENT',
          subtitle: 'File bytes differ from officially issued record',
          bg: 'bg-red-950/50 border-red-500/90 shadow-[0_0_35px_rgba(239,68,68,0.45)] animate-tamper-shake',
          textColor: 'text-red-400',
          icon: <AlertOctagon className="w-9 h-9 text-red-500" />,
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/50',
        };
      case 'REVOKED':
        return {
          title: 'CREDENTIAL REVOKED',
          subtitle: 'Officially revoked by the issuing institution',
          bg: 'bg-red-950/40 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.35)]',
          textColor: 'text-red-400',
          icon: <XCircle className="w-9 h-9 text-red-400" />,
          badgeBg: 'bg-red-500/20 text-red-300 border-red-500/50',
        };
      case 'EXPIRED':
        return {
          title: 'CREDENTIAL EXPIRED',
          subtitle: 'Past validity expiration date',
          bg: 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.35)]',
          textColor: 'text-amber-400',
          icon: <Clock className="w-9 h-9 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        };
      case 'DUPLICATE_ALERT':
        return {
          title: 'DUPLICATE / FRAUD RISK',
          subtitle: 'Colliding fingerprint or near-duplicate profile in circulation',
          bg: 'bg-orange-950/50 border-orange-500/85 shadow-[0_0_30px_rgba(249,115,22,0.4)]',
          textColor: 'text-orange-400',
          icon: <ShieldAlert className="w-9 h-9 text-orange-400" />,
          badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
        };
      case 'NOT_FOUND':
      default:
        return {
          title: 'RECORD NOT FOUND',
          subtitle: 'No matching certificate exists in the ledger',
          bg: 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
          textColor: 'text-amber-400',
          icon: <AlertTriangle className="w-9 h-9 text-amber-400" />,
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. Main Status Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${statusConfig.bg} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 shrink-0">
              {statusConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-heading font-extrabold text-2xl sm:text-3xl ${statusConfig.textColor}`}>
                  {statusConfig.title}
                </h2>
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${statusConfig.badgeBg}`}>
                  {result.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 font-medium">
                {statusConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Trust Score Ring */}
          <div className="flex items-center gap-4 self-start sm:self-center bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    result.trustScore >= 80
                      ? 'text-emerald-400'
                      : result.trustScore >= 50
                      ? 'text-amber-400'
                      : 'text-red-500'
                  }`}
                  strokeDasharray={`${result.trustScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-heading font-extrabold text-sm text-white">
                {result.trustScore}
              </span>
            </div>
            <div>
              <div className="text-xs font-mono text-[#D8B4FE]">Trust Score</div>
              <div className="text-[11px] text-gray-400 font-mono">
                {result.trustScore >= 80 ? 'High Confidence' : result.trustScore >= 50 ? 'Moderate' : 'High Risk'}
              </div>
            </div>
          </div>
        </div>

        {/* Plain Language Explanation */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-gray-200 leading-relaxed">
          {result.explanation}
        </div>

        {/* Duplicate Warning Callout if present */}
        {result.duplicateMatch && (
          <div className="p-3.5 rounded-xl bg-orange-950/60 border border-orange-500/60 flex items-start gap-3 text-xs text-orange-200">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Duplicate Alert Details: </span>
              {result.duplicateMatch.description}
            </div>
          </div>
        )}

        {/* "Why this score?" Breakdown Accordion */}
        <div className="pt-2">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] hover:text-white transition-colors"
          >
            <span>{showBreakdown ? 'Hide score breakdown' : 'Why this score? (Inspect factors)'}</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showBreakdown && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.scoreBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-white">{item.label}</span>
                    <span className={item.passed ? 'text-emerald-400' : 'text-red-400 font-mono'}>
                      {item.points} / {item.maxPoints} pts
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-snug">
                    {item.reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receipt & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadVerificationReceiptPdf(result)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF2E88]/20 hover:bg-[#FF2E88]/30 border border-[#FF2E88]/50 text-xs font-mono text-[#FF6FB5] hover:text-white transition-all shadow-[0_0_15px_rgba(255,46,136,0.2)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Receipt (PDF)</span>
            </button>

            {cert && (
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-gray-300 hover:text-white transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share Verification Link'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReportFraud(cert?.id || result.computedHash)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-xs font-mono text-red-300 hover:text-white transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Report Suspected Fraud</span>
            </button>

            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 transition-all"
            >
              Verify Another
            </button>
          </div>
        </div>

      </div>

      {/* 2. Certificate Card Visual Representation (if certificate exists) */}
      {cert && (
        <div className="rounded-3xl border border-[#FF2E88]/40 bg-gradient-to-b from-[#180824] via-[#12051B] to-[#0B0510] p-6 sm:p-8 shadow-[0_0_35px_rgba(255,46,136,0.15)] relative overflow-hidden space-y-6">
          
          {/* Subtle watermark seal */}
          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
            <Shield className="w-72 h-72 text-[#FF2E88]" />
          </div>

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF6FB5]">
                OFFICIAL RECORD • BLOCK #{cert.blockNumber}
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
                {cert.institutionName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                ID: {cert.id}
              </span>
              <button
                onClick={() => downloadCertificatePdf(cert, qrDataUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.4)] transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Certificate PDF</span>
              </button>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
            
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-mono text-[#D8B4FE]">RECIPIENT NAME</span>
                <div className="font-heading font-bold text-2xl text-white">
                  {cert.holderName}
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-[#D8B4FE]">DEGREE / PROGRAM</span>
                <div className="font-heading font-semibold text-lg text-[#FF6FB5]">
                  {cert.courseName}
                </div>
                <div className="text-xs text-gray-300 font-mono mt-0.5">
                  {cert.degreeType} • Grade / Honors: {cert.grade}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs font-mono text-[#D8B4FE]">ISSUE DATE</span>
                  <div className="text-sm font-semibold text-white font-mono">
                    {cert.issueDate}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-mono text-[#D8B4FE]">VALIDITY</span>
                  <div className="text-sm font-semibold text-white font-mono">
                    {cert.expiryDate ? `Expires: ${cert.expiryDate}` : 'Permanent (No Expiry)'}
                  </div>
                </div>
              </div>

              {/* Digital Fingerprint SHA-256 Box */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-[#FF6FB5] uppercase font-semibold">
                    Digital Fingerprint (SHA-256)
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Immutable Anchor</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/60 border border-[#FF2E88]/30 font-mono text-[11px] text-[#E9D5FF] break-all select-all">
                  {cert.fileHash}
                </div>
              </div>
            </div>

            {/* QR Code Seal Column */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              {qrDataUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,46,136,0.3)]">
                  <img src={qrDataUrl} alt="Certificate QR Code" className="w-32 h-32" />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-900 rounded-xl flex items-center justify-center text-xs text-gray-500 font-mono">
                  QR Seal
                </div>
              )}
              <div className="text-center">
                <div className="text-[11px] font-mono text-[#FF6FB5] font-semibold">
                  SCAN TO RE-VERIFY
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Zero login required
                </div>
              </div>
            </div>

          </div>

          {/* Cryptographic Ledger Block Anchor */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#D8B4FE] relative z-10">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#FF2E88]" />
              <span>Chained Hash: {cert.previousRecordHash.substring(0, 16)}...</span>
            </div>
            <div>
              <span>Verification Count: {cert.verificationCount} times verified</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
