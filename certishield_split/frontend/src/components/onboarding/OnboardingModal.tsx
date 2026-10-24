import React, { useState } from 'react';
import { ShieldCheck, Lock, Upload, ArrowRight, Check, X, Smartphone } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVerify: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartVerify,
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      badge: 'STEP 1 OF 3 • ZERO LOGIN',
      title: 'Instant Cryptographic Verification',
      desc: 'Verify any university degree or professional license in under a second with no account required. Scan a QR code, upload a PDF/image, or enter the Certificate ID.',
      icon: <ShieldCheck className="w-10 h-10 text-[#FF2E88]" />,
    },
    {
      step: 2,
      badge: 'STEP 2 OF 3 • ZERO SERVER RISK',
      title: 'In-Browser Digital Fingerprinting',
      desc: 'Your documents never leave your device. CertiShield hashes files in memory using SHA-256. A single altered pixel, grade, or character immediately triggers a TAMPERED alert.',
      icon: <Lock className="w-10 h-10 text-[#FF6FB5]" />,
    },
    {
      step: 3,
      badge: 'STEP 3 OF 3 • QUESTION THE PERMISSIONS',
      title: 'Privacy-First Architecture',
      desc: 'Inspired by cyber-defense principles: we request camera access solely for QR scanning on demand. No location, no contacts, no microphone. Download signed audit receipts anytime.',
      icon: <Smartphone className="w-10 h-10 text-[#C084FC]" />,
    },
  ];

  const current = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#180824] via-[#12051B] to-[#0A030E] border border-[#FF2E88]/50 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-[0_0_50px_rgba(255,46,136,0.35)]">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                s <= step ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center space-y-4 pt-2">
          <div className="w-20 h-20 rounded-3xl bg-[#1A0A26] border border-[#FF2E88]/40 shadow-[0_0_25px_rgba(255,46,136,0.4)] flex items-center justify-center mx-auto">
            {current.icon}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF6FB5] font-bold">
              {current.badge}
            </span>
            <h3 className="font-heading font-extrabold text-2xl text-white">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#D8B4FE]/80 leading-relaxed max-w-sm mx-auto">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-semibold text-xs shadow-[0_0_15px_rgba(255,46,136,0.4)] flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onStartVerify();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,46,136,0.7)] flex items-center gap-1.5 hover:scale-105 transition-all"
            >
              <span>Start Verifying Now</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
