import React from 'react';
import { Shield, Lock, Smartphone, Globe, ArrowUpRight, Github } from 'lucide-react';

interface FooterProps {
  onOpenPermissions: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPermissions, onNavigateTab }) => {
  return (
    <footer className="border-t border-[#FF2E88]/20 bg-[#07030A] text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-16 font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A0A1F] to-[#2D0B38] border border-[#FF2E88]/60 text-[#FF2E88]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-base text-white">
                CertiShield
              </span>
              <span className="text-[10px] text-[#FF6FB5] px-2 py-0.5 rounded bg-[#FF2E88]/20 border border-[#FF2E88]/30">
                Verify. Trust. Protect.
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md font-sans">
              An immutable, privacy-first credential verification engine built to eradicate diploma fraud, 
              prevent unauthorized certificate duplication, and block tampered resumes in under 0.5 seconds.
            </p>
            <div className="text-[11px] text-gray-500">
              Inspired by cybersecurity awareness and zero-trust permission models.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-white font-bold uppercase tracking-wider text-xs">
              Ecosystem
            </div>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <button onClick={() => onNavigateTab('verify')} className="hover:text-[#FF6FB5] transition-colors">
                  Instant Verifier
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('tamper-lab')} className="hover:text-[#FF6FB5] transition-colors">
                  Tamper Lab Demo
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('safety-tips')} className="hover:text-[#FF6FB5] transition-colors">
                  Safety Tips (Poster)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('trust-directory')} className="hover:text-[#FF6FB5] transition-colors">
                  Trust Directory
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Governance */}
          <div className="space-y-2">
            <div className="text-white font-bold uppercase tracking-wider text-xs">
              Privacy & Audit
            </div>
            <ul className="space-y-1.5 text-gray-400">
              <li>
                <button onClick={onOpenPermissions} className="hover:text-[#FF6FB5] transition-colors flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#FF2E88]" />
                  <span>Question the Permissions</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('audit-log')} className="hover:text-[#FF6FB5] transition-colors">
                  Immutable Audit Log
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('employer-verify')} className="hover:text-[#FF6FB5] transition-colors">
                  Employer Bulk Verification
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('analytics')} className="hover:text-[#FF6FB5] transition-colors">
                  Issuer Telemetry
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            © {new Date().getFullYear()} CertiShield Systems. Zero user login required for verification.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Web Crypto SHA-256 Engine Active
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
