import React from 'react';
import { Shield, Lock, User, MessageSquare, Mic, MapPin, Image as ImageIcon, Sparkles, FileSearch, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface HeroSectionProps {
  onVerifyClick: () => void;
  onTamperLabClick: () => void;
  onAiForensicClick: () => void;
  onSafetyTipsClick: () => void;
  language: Language;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onVerifyClick,
  onTamperLabClick,
  onAiForensicClick,
  onSafetyTipsClick,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="relative overflow-hidden py-10 sm:py-16 cyber-circuit-bg">
      {/* Background ambient radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-[#FF2E88]/20 via-[#7B2CBF]/30 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A0A26] border border-[#FF2E88]/40 shadow-[0_0_15px_rgba(255,46,136,0.25)] text-xs text-[#FF6FB5] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#FF2E88] animate-ping" />
              <span>Next-Gen Anti-Tamper Credential Ledger</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Verify certificates in seconds.{' '}
              <span className="bg-gradient-to-r from-[#FF2E88] via-[#FF6FB5] to-[#C084FC] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,46,136,0.5)]">
                Detect fakes before they hire.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#D8B4FE]/90 max-w-2xl leading-relaxed">
              Employers, universities, and students verify degrees and licenses with zero login. Powered by 
              in-browser SHA-256 digital fingerprints, a tamper-evident hash chain, and Gemini AI forensic inspection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={onVerifyClick}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-semibold text-sm sm:text-base shadow-[0_0_25px_rgba(255,46,136,0.6)] hover:shadow-[0_0_35px_rgba(255,46,136,0.85)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{t.verifyNow}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onAiForensicClick}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#1A0A26] border border-[#FF2E88]/50 hover:border-[#FF2E88] text-[#F3E8FF] hover:text-white font-medium text-sm sm:text-base shadow-[0_0_15px_rgba(255,46,136,0.15)] hover:shadow-[0_0_20px_rgba(255,46,136,0.35)] transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#FF2E88]" />
                <span>AI Forensic Scan</span>
              </button>

              <button
                onClick={onTamperLabClick}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-sm text-[#E9D5FF] border border-white/10 transition-all font-mono"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Tamper Lab Demo</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#FF2E88]/20 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="font-heading font-bold text-xl sm:text-2xl text-white">
                  2,950+
                </div>
                <div className="text-[11px] sm:text-xs text-[#C4B5FD] font-mono">
                  Certificates Protected
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-heading font-bold text-xl sm:text-2xl text-[#FF2E88]">
                  100%
                </div>
                <div className="text-[11px] sm:text-xs text-[#C4B5FD] font-mono">
                  Tamper Detection
                </div>
              </div>

              <div className="text-center lg:text-left">
                <div className="font-heading font-bold text-xl sm:text-2xl text-[#34D399]">
                  &lt; 0.5s
                </div>
                <div className="text-[11px] sm:text-xs text-[#C4B5FD] font-mono">
                  Verification Time
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Shield with Padlock and Floating Neon Tiles (Exact Poster Style) */}
          <div className="lg:col-span-5 flex items-center justify-center relative py-6">
            
            {/* The Cyber Shield Container */}
            <div className="relative w-72 h-80 sm:w-80 sm:h-96 flex items-center justify-center">
              
              {/* Circuit starburst background circles */}
              <div className="absolute inset-0 rounded-full border border-[#FF2E88]/20 animate-spin" style={{ animationDuration: '40s' }} />
              <div className="absolute inset-4 rounded-full border border-dashed border-[#7B2CBF]/30 animate-spin" style={{ animationDuration: '60s', animationDirection: 'reverse' }} />
              <div className="absolute inset-10 rounded-full bg-gradient-to-b from-[#2D0B38]/50 to-[#1A0A1F]/80 blur-md" />

              {/* Glowing Shield with Padlock in the Center */}
              <div className="relative z-20 flex flex-col items-center justify-center animate-shield-pulse">
                <div className="relative">
                  {/* Outer Shield Glow */}
                  <div className="w-32 h-40 sm:w-36 sm:h-44 bg-gradient-to-b from-[#FF2E88] to-[#7B2CBF] p-[2.5px] rounded-b-[40px] rounded-t-xl shadow-[0_0_40px_rgba(255,46,136,0.8),inset_0_0_20px_rgba(255,46,136,0.5)]">
                    <div className="w-full h-full bg-[#1A0A26] rounded-b-[38px] rounded-t-[10px] flex flex-col items-center justify-center p-3 relative overflow-hidden">
                      {/* Shield subtle gloss highlight */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 skew-y-12 blur-sm pointer-events-none" />
                      
                      {/* Padlock Icon */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FF2E88]/30 to-[#7B2CBF]/40 border border-[#FF6FB5]/60 flex items-center justify-center shadow-[0_0_25px_rgba(255,46,136,0.7)]">
                        <Lock className="w-8 h-8 sm:w-9 sm:h-9 text-white drop-shadow-[0_0_10px_#FF2E88]" />
                      </div>
                      
                      <span className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#FF6FB5] font-bold">
                        SECURE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Rounded-Square Icon Tiles (Matching the reference poster!) */}
              {/* 1. User Tile (Top Left) */}
              <div className="absolute top-2 left-2 sm:-left-2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A0A26]/90 border border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.5)] hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-[#FF6FB5]" />
              </div>

              {/* 2. Chat Bubble Tile (Top Right) */}
              <div className="absolute top-6 right-2 sm:-right-2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A0A26]/90 border border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.5)] hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5 text-[#FF6FB5]" />
              </div>

              {/* 3. Microphone Tile (Middle Left) */}
              <div className="absolute top-36 -left-4 sm:-left-6 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A0A26]/90 border border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.5)] hover:scale-110 transition-transform">
                <Mic className="w-5 h-5 text-[#FF6FB5]" />
              </div>

              {/* 4. Location Pin Tile (Lower Left) */}
              <div className="absolute bottom-6 left-0 sm:-left-2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A0A26]/90 border border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.5)] hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-[#FF6FB5]" />
              </div>

              {/* 5. Image / Gallery Tile (Bottom Right) */}
              <div className="absolute bottom-4 right-1 sm:-right-1 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1A0A26]/90 border border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.5)] hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5 text-[#FF6FB5]" />
              </div>

              {/* Circuit lines linking the tiles */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <path d="M 40 40 Q 100 120 130 140" stroke="#FF2E88" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                <path d="M 280 60 Q 200 130 170 150" stroke="#FF2E88" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                <path d="M 30 170 Q 90 180 120 180" stroke="#7B2CBF" strokeWidth="1.5" fill="none" />
                <path d="M 270 280 Q 200 230 170 210" stroke="#FF6FB5" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
              </svg>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
