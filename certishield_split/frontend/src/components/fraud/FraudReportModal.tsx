import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { submitFraudReport } from '../../services/storage';

interface FraudReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: string;
}

export const FraudReportModal: React.FC<FraudReportModalProps> = ({
  isOpen,
  onClose,
  certificateId,
}) => {
  const [certId, setCertId] = useState(certificateId);
  const [reporterEmail, setReporterEmail] = useState('');
  const [reason, setReason] = useState('');
  const [evidenceDetails, setEvidenceDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await submitFraudReport({
        certificateId: certId.trim(),
        reporterEmail: reporterEmail.trim() || undefined,
        reason: reason.trim(),
        evidenceDetails: evidenceDetails.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#180824] via-[#12051B] to-[#0A030E] border border-red-500/60 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.35)] text-white space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">
              Report Suspected Fraud
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Confidential report transmitted to institutional integrity teams
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-heading font-bold text-white text-base">
              Report Successfully Logged
            </h4>
            <p className="text-xs text-gray-300">
              Your report has been queued for registrar investigation. The certificate's risk profile will reflect this review.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                Target Certificate ID *
              </label>
              <input
                type="text"
                required
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-red-500 text-white font-mono text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                Your Email Address (Optional — for investigator contact)
              </label>
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-red-500 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                Reason for Suspicion *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Candidate resume has altered candidate name, identical grade was used by another applicant, or mismatched graduation date."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-red-500 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                Evidence Details or URLs (Optional)
              </label>
              <input
                type="text"
                value={evidenceDetails}
                onChange={(e) => setEvidenceDetails(e.target.value)}
                placeholder="e.g. LinkedIn profile link or job application reference"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-red-500 text-white text-xs outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-300 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'File Fraud Report'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
