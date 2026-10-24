import React, { useState } from 'react';
import { Award, ShieldCheck, ExternalLink, Copy, Check, Code, Globe, Lock, MapPin } from 'lucide-react';
import { SEED_INSTITUTIONS } from '../../services/storage';

export const InstitutionTrustPage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedInst, setSelectedInst] = useState(SEED_INSTITUTIONS[0]);

  const embedCodeSnippet = `<!-- CertiShield Cryptographic Verification Badge -->
<div id="certishield-badge" data-institution="${selectedInst.code}"></div>
<script src="https://certishield.app/embed/v1/badge.js" async></script>`;

  const handleCopySnippet = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A0A26] border border-[#FF2E88]/40 text-xs font-mono text-[#FF6FB5]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHICALLY ACCREDITED ISSUERS</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Public Institution Trust Registry
        </h1>
        <p className="text-sm sm:text-base text-[#D8B4FE]/80 max-w-2xl mx-auto">
          Every issuing university and agency on CertiShield maintains a published cryptographic public key. 
          Certificates can only be anchored to our ledger using authorized signing credentials.
        </p>
      </div>

      {/* Institutions Directory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SEED_INSTITUTIONS.map((inst, idx) => {
          const isSelected = selectedInst.id === inst.id;
          return (
            <div
              key={inst.id}
              onClick={() => setSelectedInst(inst)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-[#220A30] to-[#12051B] border-[#FF2E88] shadow-[0_0_30px_rgba(255,46,136,0.35)]'
                  : 'bg-[#14061E]/80 border-white/10 hover:border-[#FF2E88]/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF2E88]/10 border border-[#FF2E88]/40 flex items-center justify-center text-[#FF2E88]">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Trust Score: {inst.trustScore}%
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-white">
                    {inst.name}
                  </h3>
                  <div className="text-xs text-[#FF6FB5] font-mono mt-0.5">
                    Code: {inst.code}
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {inst.accreditation}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 space-y-2 text-[11px] font-mono">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF2E88]" />
                    {inst.city}, {inst.country}
                  </span>
                  <span>{inst.issuedCount}+ Issued</span>
                </div>

                <div className="p-2 rounded-lg bg-black/60 border border-white/5 break-all text-[10px] text-gray-400">
                  <span className="text-[#FF6FB5]">Key: </span>{inst.issuerPublicKey.substring(0, 18)}...
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embeddable Verification Widget Snippet Generator */}
      <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/95 p-6 sm:p-8 space-y-4 shadow-[0_0_35px_rgba(255,46,136,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Code className="w-4 h-4 text-[#FF2E88]" />
              <span>Embeddable "Verify with CertiShield" Badge for {selectedInst.code}</span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Copy and paste this snippet onto official university registrar or careers portals.
            </p>
          </div>

          <button
            onClick={() => handleCopySnippet(99, embedCodeSnippet)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.4)]"
          >
            {copiedIndex === 99 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 99 ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-[#E9D5FF] overflow-x-auto select-all">
          {embedCodeSnippet}
        </pre>

        {/* Live Widget Preview */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF2E88]/20 border border-[#FF2E88] flex items-center justify-center text-[#FF2E88]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Live Widget Preview: Official Verification Seal
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                Issued by {selectedInst.name} • Cryptographically Protected
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Accredited Root: {selectedInst.trustScore}%</span>
          </div>
        </div>

      </div>

    </div>
  );
};
