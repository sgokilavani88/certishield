import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight, RefreshCw, Download, Sparkles, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { sha256, computeCanonicalDataHash } from '../../utils/crypto';
import { Certificate } from '../../types';
import { generateSampleTamperedDocumentBlob } from '../../services/storage';

interface TamperLabProps {
  sampleCertificate: Certificate;
  onNavigateToVerify: (certId?: string) => void;
}

export const TamperLab: React.FC<TamperLabProps> = ({ sampleCertificate, onNavigateToVerify }) => {
  // Original canonical fields
  const [originalName] = useState('Elena Rostova');
  const [originalCourse] = useState('Master of Advanced Offensive Cybersecurity');
  const [originalGrade] = useState('Distinction (CGPA 3.98/4.0)');
  const [originalDate] = useState('2026-02-15');

  // Interactive tampered fields
  const [tamperedName, setTamperedName] = useState('Elena Rostova');
  const [tamperedCourse, setTamperedCourse] = useState('Master of Advanced Offensive Cybersecurity');
  const [tamperedGrade, setTamperedGrade] = useState('Distinction (CGPA 3.98/4.0)');
  const [tamperedDate, setTamperedDate] = useState('2026-02-15');

  const [originalHash, setOriginalHash] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [bitDiffPercentage, setBitDiffPercentage] = useState(0);

  // Compute original hash on mount
  useEffect(() => {
    async function initOriginal() {
      const h = await computeCanonicalDataHash({
        holderName: originalName,
        institutionName: 'National Cyber Defense University',
        courseName: originalCourse,
        grade: originalGrade,
        issueDate: originalDate,
      });
      setOriginalHash(h);
      setCurrentHash(h);
    }
    initOriginal();
  }, [originalName, originalCourse, originalGrade, originalDate]);

  // Compute live hash as user edits
  useEffect(() => {
    async function updateCurrent() {
      const h = await computeCanonicalDataHash({
        holderName: tamperedName,
        institutionName: 'National Cyber Defense University',
        courseName: tamperedCourse,
        grade: tamperedGrade,
        issueDate: tamperedDate,
      });
      setCurrentHash(h);

      // Calculate bit difference
      if (originalHash && h) {
        let diffChars = 0;
        for (let i = 0; i < h.length; i++) {
          if (h[i] !== originalHash[i]) {
            diffChars++;
          }
        }
        setBitDiffPercentage(Math.round((diffChars / h.length) * 100));
      }
    }
    updateCurrent();
  }, [tamperedName, tamperedCourse, tamperedGrade, tamperedDate, originalHash]);

  const isTampered = originalHash !== currentHash;

  // Preset triggers
  const applyPreset = (type: 'grade' | 'name' | 'date') => {
    if (type === 'grade') {
      setTamperedGrade('Summa Cum Laude (Forged CGPA 4.0/4.0)');
    } else if (type === 'name') {
      setTamperedName('Elena Rostovb'); // 1 character difference
    } else if (type === 'date') {
      setTamperedDate('2026-02-16'); // 1 day difference
    }
  };

  const handleReset = () => {
    setTamperedName(originalName);
    setTamperedCourse(originalCourse);
    setTamperedGrade(originalGrade);
    setTamperedDate(originalDate);
  };

  const handleDownloadTamperedSample = () => {
    const { blob, filename } = generateSampleTamperedDocumentBlob(sampleCertificate);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A0A26] border border-[#FF2E88]/40 text-xs font-mono text-[#FF6FB5]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>LIVE CRYPTOGRAPHIC AVALANCHE LAB</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          The Tamper Lab
        </h1>
        <p className="text-sm sm:text-base text-[#D8B4FE]/80 max-w-2xl mx-auto">
          In CertiShield, certificates are mathematically sealed using SHA-256. 
          Modify even a single letter, date, or grade below to witness the avalanche effect: the digital fingerprint 
          radically changes, making forgery mathematically detectable.
        </p>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 sm:p-8 shadow-[0_0_40px_rgba(255,46,136,0.2)] space-y-6">
        
        {/* Quick presets bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#E9D5FF]">
            <span>Try Quick Tamper Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('name')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF2E88]/30 hover:border-[#FF2E88] text-xs font-mono text-[#FF6FB5] transition-all"
            >
              Change 1 Letter in Name
            </button>
            <button
              onClick={() => applyPreset('grade')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF2E88]/30 hover:border-[#FF2E88] text-xs font-mono text-[#FF6FB5] transition-all"
            >
              Inflate Grade to 4.0
            </button>
            <button
              onClick={() => applyPreset('date')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-[#FF2E88]/30 hover:border-[#FF2E88] text-xs font-mono text-[#FF6FB5] transition-all"
            >
              Shift Date by 1 Day
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono text-gray-300 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Live Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#C4B5FD] uppercase mb-1.5">
              Recipient Name (Try typing or editing)
            </label>
            <input
              type="text"
              value={tamperedName}
              onChange={(e) => setTamperedName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#FF2E88]/40 focus:border-[#FF2E88] text-white text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#C4B5FD] uppercase mb-1.5">
              Grade / Academic Score
            </label>
            <input
              type="text"
              value={tamperedGrade}
              onChange={(e) => setTamperedGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#FF2E88]/40 focus:border-[#FF2E88] text-white text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#C4B5FD] uppercase mb-1.5">
              Academic Program
            </label>
            <input
              type="text"
              value={tamperedCourse}
              onChange={(e) => setTamperedCourse(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#FF2E88]/40 focus:border-[#FF2E88] text-white text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#C4B5FD] uppercase mb-1.5">
              Issue Date
            </label>
            <input
              type="date"
              value={tamperedDate}
              onChange={(e) => setTamperedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-[#FF2E88]/40 focus:border-[#FF2E88] text-white text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Live Comparison Box */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          
          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
              isTampered
                ? 'bg-red-950/40 border-red-500/80 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-tamper-shake'
                : 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {isTampered ? (
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              )}
              <div>
                <div className="font-heading font-bold text-sm sm:text-base">
                  {isTampered
                    ? 'TAMPERING DETECTED: FINGERPRINT DIVERGED'
                    : 'RECORD IN PRISTINE STATE: FINGERPRINTS MATCH'}
                </div>
                <div className="text-xs opacity-85 font-mono">
                  {isTampered
                    ? `Avalanche Effect Active: ${bitDiffPercentage}% of hash characters modified from minor field drift.`
                    : 'Digital digest exactly matches the registered state in Block #1.'}
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-black/40 border border-current">
                {isTampered ? 'STATUS: TAMPERED' : 'STATUS: VERIFIED'}
              </span>
            </div>
          </div>

          {/* Side-by-side Hashes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Fingerprint */}
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                  Original Registry Hash (Block #1)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  GENUINE
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/80 font-mono text-xs text-emerald-200 break-all select-all border border-emerald-500/20">
                {originalHash || 'Computing...'}
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Canonical SHA-256 digest permanently anchored in the immutable chain.
              </p>
            </div>

            {/* Current / Altered Fingerprint */}
            <div
              className={`p-4 rounded-2xl bg-black/60 border space-y-2 transition-all ${
                isTampered ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono uppercase font-semibold ${
                    isTampered ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {isTampered ? 'Tampered Document Hash' : 'Current Document Hash'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isTampered ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isTampered ? 'MISMATCH' : 'MATCH'}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl bg-black/80 font-mono text-xs break-all select-all border ${
                  isTampered ? 'text-red-300 border-red-500/30' : 'text-emerald-200 border-emerald-500/20'
                }`}
              >
                {currentHash || 'Computing...'}
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {isTampered
                  ? 'Notice how completely different the hash is, even from 1 small edit!'
                  : 'Computed dynamically in your browser in real-time.'}
              </p>
            </div>
          </div>

        </div>

        {/* Action Callout for Judges & Evaluators */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#200A2C] via-[#1A0A26] to-[#200A2C] border border-[#FF2E88]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#FF2E88]" />
              <span>Evaluate Live in the Verifier Portal</span>
            </div>
            <p className="text-xs text-[#D8B4FE]/80 max-w-xl">
              Download this ready-made tampered certificate file, then drop it into the "Upload Document" tab in the 
              verification portal to watch CertiShield flag it in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTamperedSample}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/60 text-xs font-mono text-red-200 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample Tampered File</span>
            </button>
            <button
              onClick={() => onNavigateToVerify(sampleCertificate.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.5)] transition-all hover:scale-105"
            >
              <span>Test in Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
