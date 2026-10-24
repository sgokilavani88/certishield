import React from 'react';
import { ShieldCheck, AlertTriangle, Eye, Lock, FileSearch, Smartphone, ArrowRight } from 'lucide-react';

interface SafetyTipsProps {
  onVerifyClick: () => void;
}

export const SafetyTips: React.FC<SafetyTipsProps> = ({ onVerifyClick }) => {
  const tips = [
    {
      number: '1',
      title: 'Inspect the Cryptographic Digital Fingerprint',
      question: 'Does the document have an immutable cryptographic hash, or is it just a flat PDF?',
      redFlags: [
        'A PDF where text can be selected and edited in free browser tools',
        'Inconsistent fonts or fuzzy scanned seals over clean vector text',
        'No public SHA-256 hash or block verification link',
      ],
      rule: 'Mathematical proof beats visual stamps every time.',
      accent: 'from-[#FF2E88] to-[#FF6FB5]',
    },
    {
      number: '2',
      title: 'Verify the Issuer’s Cryptographic Public Key',
      question: 'Is the institution listed in an accredited registry with verifiable keys?',
      redFlags: [
        'Certificate issued from generic webmail (@gmail.com / @yahoo.com)',
        'Institution name has subtle misspellings (e.g. "Harward University")',
        'Unregistered private entity masquerading as a licensed university',
      ],
      rule: 'Never accept credentials from unverified or unaccredited issuers.',
      accent: 'from-[#7B2CBF] to-[#C084FC]',
    },
    {
      number: '3',
      title: 'Question the Permissions (Offensium Vault Principle)',
      question: 'Does this verification tool or mobile app really need this access?',
      redFlags: [
        'Torch app requesting Contacts access 🚩',
        'Calculator requesting SMS / Messages access 🚩',
        'Wallpaper app requesting Microphone & Audio access 🚩',
      ],
      rule: 'Too much access? Walk away.',
      accent: 'from-[#FF2E88] to-[#9333EA]',
      highlight: true,
    },
    {
      number: '4',
      title: 'Beware of Duplicate Credential Circulation',
      question: 'Are multiple job applicants submitting the exact same certificate?',
      redFlags: [
        'Two candidates from different cities presenting identical serial numbers',
        'Same diploma image with only the student name airbrushed or retyped',
        'Sudden high-velocity spikes in verification queries for one student',
      ],
      rule: 'CertiShield flags identical fingerprints instantly across all employers.',
      accent: 'from-[#F59E0B] to-[#EF4444]',
    },
    {
      number: '5',
      title: 'Always Require an Authenticated Verification Receipt',
      question: 'Did your HR department generate a verifiable cryptographic audit receipt?',
      redFlags: [
        'Relying purely on a phone call or unverifiable reference letter',
        'Accepting cropped screenshots of verification portals',
        'No digital signature or verifier timestamp saved in company records',
      ],
      rule: 'Download a CertiShield cryptographic receipt with every verification.',
      accent: 'from-[#10B981] to-[#06B6D4]',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A0A26] border border-[#FF2E88]/40 text-xs font-mono text-[#FF6FB5] shadow-[0_0_15px_rgba(255,46,136,0.3)]">
          <Eye className="w-3.5 h-3.5" />
          <span>CYBERSECURITY AWARENESS DIRECTORY</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          5 Golden Rules for Spotting Fake Certificates
        </h1>
        <p className="text-sm sm:text-base text-[#D8B4FE]/80 max-w-2xl mx-auto">
          Diploma fraud and credential forgery cost organizations billions every year. 
          Use these five cybersecurity principles to inspect credentials before taking action.
        </p>
      </div>

      {/* Numbered Tip Cards (Matching the reference poster layout!) */}
      <div className="space-y-6">
        {tips.map((tip) => (
          <div
            key={tip.number}
            className={`rounded-2xl border transition-all p-6 sm:p-7 relative overflow-hidden ${
              tip.highlight
                ? 'bg-gradient-to-r from-[#2A0938] via-[#16061F] to-[#250833] border-[#FF2E88] shadow-[0_0_30px_rgba(255,46,136,0.3)]'
                : 'bg-[#150720]/80 border-[#FF2E88]/30 hover:border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.1)]'
            }`}
          >
            {/* Top Row: Number & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tip.accent} flex items-center justify-center font-heading font-black text-xl text-white shadow-[0_0_15px_rgba(255,46,136,0.4)]`}
                >
                  {tip.number}
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
                  {tip.title}
                </h3>
              </div>

              {tip.highlight && (
                <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-mono bg-[#FF2E88]/20 border border-[#FF2E88] text-[#FF6FB5]">
                  ★ Poster Reference Theme
                </span>
              )}
            </div>

            {/* Prompt Question */}
            <div className="pt-4 pb-2 text-sm font-semibold text-[#FF6FB5]">
              Ask yourself: {tip.question}
            </div>

            {/* Red flags & Action */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-8 space-y-2">
                <div className="text-xs font-mono text-[#C4B5FD] uppercase tracking-wider">
                  Common Red Flags:
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-300">
                  {tip.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400 font-bold shrink-0">🚩</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-4 p-4 rounded-xl bg-black/40 border border-[#FF2E88]/30 flex flex-col justify-center items-center text-center space-y-1">
                <span className="text-[11px] font-mono text-[#D8B4FE] uppercase">
                  Golden Rule
                </span>
                <span className="text-xs font-bold text-white leading-tight">
                  {tip.rule}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#200A2C] via-[#16061F] to-[#200A2C] border border-[#FF2E88]/50 text-center space-y-4 shadow-[0_0_40px_rgba(255,46,136,0.3)]">
        <h3 className="font-heading text-2xl font-bold text-white">
          Ready to verify a real certificate?
        </h3>
        <p className="text-xs sm:text-sm text-[#D8B4FE]/80 max-w-xl mx-auto">
          Scan a QR code, upload any diploma file to check its SHA-256 fingerprint, or enter any Certificate ID.
        </p>
        <button
          onClick={onVerifyClick}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-semibold text-sm shadow-[0_0_20px_rgba(255,46,136,0.6)] hover:shadow-[0_0_30px_rgba(255,46,136,0.85)] hover:scale-105 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Launch Verification Hub</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

    </div>
  );
};
