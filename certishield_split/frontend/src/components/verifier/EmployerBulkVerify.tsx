import React, { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertOctagon, XCircle, Clock, ShieldAlert, ArrowRight, FileText } from 'lucide-react';
import { verifyCertificate } from '../../services/verificationEngine';
import { VerificationResult } from '../../types';

interface EmployerBulkVerifyProps {
  onInspectResult: (certId: string) => void;
}

interface BulkVerifyItem {
  id: string;
  candidateName?: string;
  result?: VerificationResult;
  loading: boolean;
}

export const EmployerBulkVerify: React.FC<EmployerBulkVerifyProps> = ({ onInspectResult }) => {
  const [items, setItems] = useState<BulkVerifyItem[]>([]);
  const [running, setRunning] = useState(false);

  // Sample CSV Loader
  const handleLoadSampleBatch = () => {
    const sampleBatch: BulkVerifyItem[] = [
      { id: 'CS-2026-891001', candidateName: 'Candidate A (Elena)', loading: false },
      { id: 'CS-2026-891002', candidateName: 'Candidate B (Aarav)', loading: false },
      { id: 'CS-2025-449102', candidateName: 'Candidate C (Vikram)', loading: false },
      { id: 'CS-2023-772911', candidateName: 'Candidate D (Sophie)', loading: false },
      { id: 'CS-2026-904122', candidateName: 'Candidate E (Devon Clone)', loading: false },
      { id: 'CS-2099-999999', candidateName: 'Candidate F (Fake ID)', loading: false },
    ];
    setItems(sampleBatch);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const newItems: BulkVerifyItem[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip header if present
        if (line.toLowerCase().includes('id') || line.toLowerCase().includes('certificate')) continue;
        const parts = line.split(',');
        const certId = parts[0]?.trim();
        if (certId) {
          newItems.push({
            id: certId,
            candidateName: parts[1]?.trim() || `Applicant #${i + 1}`,
            loading: false,
          });
        }
      }
      setItems(newItems);
    };
    reader.readAsText(file);
  };

  const handleRunBatchVerify = async () => {
    if (items.length === 0) return;
    setRunning(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i].loading = true;
      setItems([...updated]);

      const res = await verifyCertificate({
        method: 'ID_LOOKUP',
        certificateId: updated[i].id,
      });

      updated[i].result = res;
      updated[i].loading = false;
      setItems([...updated]);
    }
    setRunning(false);
  };

  const handleExportCsvReport = () => {
    const headers = 'CertificateID,Candidate,Status,TrustScore,Issuer,Program,ReceiptID\n';
    const rows = items
      .map((item) => {
        const res = item.result;
        return [
          item.id,
          item.candidateName || '',
          res?.status || 'UNVERIFIED',
          res?.trustScore || 0,
          res?.certificate?.institutionName || 'Unknown',
          `"${res?.certificate?.courseName || 'N/A'}"`,
          res?.verificationReceiptId || '',
        ].join(',');
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CertiShield_Employer_Batch_Report_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const verifiedCount = items.filter((i) => i.result?.status === 'VERIFIED').length;
  const flagCount = items.filter((i) => i.result && i.result.status !== 'VERIFIED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FF2E88]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Recruiter & HR Automated Tooling</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Employer Bulk Verification
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
            Upload candidate cohorts from applicant tracking systems (ATS) and verify 50+ credentials in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleBatch}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-[#E9D5FF] transition-all"
          >
            Load Sample Applicant Batch
          </button>
        </div>
      </div>

      {/* Upload Box */}
      <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 space-y-5">
        <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[#FF2E88]/40 hover:border-[#FF2E88] bg-black/40 cursor-pointer transition-all">
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          <Upload className="w-7 h-7 text-[#FF6FB5] mb-2" />
          <span className="text-xs font-semibold text-white">
            Upload Candidate IDs (.CSV or text)
          </span>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5">
            Format: CertificateID, CandidateName (one per line)
          </span>
        </label>

        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-gray-300">
              Loaded: <span className="text-white font-bold">{items.length} candidates</span>
              {verifiedCount > 0 && (
                <span className="text-emerald-400 ml-2">({verifiedCount} Authentic)</span>
              )}
              {flagCount > 0 && (
                <span className="text-red-400 ml-2">({flagCount} Flagged / Issues)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunBatchVerify}
                disabled={running}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,46,136,0.5)] disabled:opacity-50 transition-all"
              >
                {running ? 'Verifying Cohort...' : 'Execute Batch Verification'}
              </button>

              {items.some((i) => i.result) && (
                <button
                  onClick={handleExportCsvReport}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Table */}
        {items.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1A0A26] text-[#FF6FB5] border-b border-white/10">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">ID Claimed</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Trust Score</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 text-gray-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-white">{item.candidateName}</td>
                    <td className="p-3 font-mono">{item.id}</td>
                    <td className="p-3">
                      {item.loading ? (
                        <span className="text-gray-400 animate-pulse">Checking...</span>
                      ) : item.result ? (
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                            item.result.status === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : item.result.status === 'REVOKED'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : item.result.status === 'EXPIRED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          }`}
                        >
                          {item.result.status}
                        </span>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </td>
                    <td className="p-3">
                      {item.result ? (
                        <span
                          className={`font-bold ${
                            item.result.trustScore >= 80 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {item.result.trustScore}/100
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">
                      {item.result && (
                        <button
                          onClick={() => onInspectResult(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#FF6FB5] hover:text-white transition-all"
                        >
                          Inspect Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
