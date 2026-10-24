import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, Upload, Search, Camera, Sparkles, FileText, CheckCircle2, 
  AlertTriangle, ShieldCheck, ArrowRight, ShieldAlert, Lock, Info 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VerificationResult, Certificate } from '../../types';
import { verifyCertificate } from '../../services/verificationEngine';
import { generateQrCodeDataUrl, buildVerificationUrl } from '../../utils/qrHelper';
import { hashFile } from '../../utils/crypto';
import { VerificationResultCard } from './VerificationResultCard';
import { Language, translations } from '../../utils/i18n';

interface VerificationHubProps {
  onOpenAiForensics: () => void;
  onReportFraud: (certId: string) => void;
  initialCertId?: string;
  language: Language;
}

export const VerificationHub: React.FC<VerificationHubProps> = ({
  onOpenAiForensics,
  onReportFraud,
  initialCertId,
  language,
}) => {
  const t = translations[language];
  const [activeMethod, setActiveMethod] = useState<'ID' | 'FILE' | 'QR'>('ID');

  // Input states
  const [inputCertId, setInputCertId] = useState(initialCertId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [computingHash, setComputingHash] = useState(false);
  const [computedFileHash, setComputedFileHash] = useState<string>('');

  // Camera QR scanner states
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Result state
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Check URL params or initial cert ID on mount
  useEffect(() => {
    if (initialCertId) {
      setInputCertId(initialCertId);
      handleVerifyId(initialCertId);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id');
      if (urlId) {
        setInputCertId(urlId);
        handleVerifyId(urlId);
      }
    }
  }, [initialCertId]);

  // Clean up camera stream if leaving QR tab
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF2E88', '#FF6FB5', '#7B2CBF', '#10B981'],
    });
  };

  // 1. Verify by ID
  const handleVerifyId = async (idToVerify?: string) => {
    const id = (idToVerify || inputCertId).trim();
    if (!id) return;

    setIsVerifying(true);
    setResult(null);

    try {
      const res = await verifyCertificate({
        method: 'ID_LOOKUP',
        certificateId: id,
      });

      if (res.certificate) {
        const qrUrl = buildVerificationUrl(res.certificate.id, res.certificate.fileHash);
        const dataUrl = await generateQrCodeDataUrl(qrUrl);
        setQrDataUrl(dataUrl);
      }

      setResult(res);
      if (res.status === 'VERIFIED') triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Verify by File Upload (Live Web Crypto SHA-256)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setComputingHash(true);
    setResult(null);

    try {
      // Calculate real SHA-256 in browser
      const hash = await hashFile(file);
      setComputedFileHash(hash);

      const arrayBuffer = await file.arrayBuffer();

      setIsVerifying(true);
      const res = await verifyCertificate({
        method: 'FILE_HASH',
        fileBuffer: arrayBuffer,
        providedHash: hash,
        certificateId: inputCertId ? inputCertId.trim() : undefined,
      });

      if (res.certificate) {
        const qrUrl = buildVerificationUrl(res.certificate.id, res.certificate.fileHash);
        const dataUrl = await generateQrCodeDataUrl(qrUrl);
        setQrDataUrl(dataUrl);
      }

      setResult(res);
      if (res.status === 'VERIFIED') triggerConfetti();
    } catch (err) {
      console.error(err);
    } finally {
      setComputingHash(false);
      setIsVerifying(false);
    }
  };

  // 3. Camera QR Handler
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setCameraPermissionGranted(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please verify device permissions or test with ID / File upload below.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleSimulateQrScan = (scannedId: string) => {
    stopCamera();
    setInputCertId(scannedId);
    handleVerifyId(scannedId);
  };

  const handleResetVerification = () => {
    setResult(null);
    setInputCertId('');
    setSelectedFile(null);
    setComputedFileHash('');
    stopCamera();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* If result is ready, render the full VerificationResultCard */}
      {result ? (
        <VerificationResultCard
          result={result}
          qrDataUrl={qrDataUrl}
          onReportFraud={onReportFraud}
          onReset={handleResetVerification}
        />
      ) : (
        /* Verification Input Interface */
        <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/95 p-6 sm:p-8 shadow-[0_0_40px_rgba(255,46,136,0.25)] space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero-Login Cryptographic Verifier</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
                Verify Any Credential
              </h2>
              <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
                Authenticate degrees, professional diplomas, and certificates against our tamper-evident ledger.
              </p>
            </div>

            {/* AI Forensic Trigger Button */}
            <button
              onClick={onOpenAiForensics}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7B2CBF] to-[#FF2E88] text-white text-xs font-semibold shadow-[0_0_20px_rgba(255,46,136,0.4)] hover:shadow-[0_0_25px_rgba(255,46,136,0.7)] hover:scale-105 transition-all self-start sm:self-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Forensic Inspection</span>
            </button>
          </div>

          {/* 3 Verification Method Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10">
            <button
              onClick={() => {
                setActiveMethod('ID');
                stopCamera();
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMethod === 'ID'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white shadow-[0_0_15px_rgba(255,46,136,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t.enterId}</span>
            </button>

            <button
              onClick={() => {
                setActiveMethod('FILE');
                stopCamera();
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMethod === 'FILE'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white shadow-[0_0_15px_rgba(255,46,136,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{t.uploadDoc}</span>
            </button>

            <button
              onClick={() => setActiveMethod('QR')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeMethod === 'QR'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white shadow-[0_0_15px_rgba(255,46,136,0.5)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>{t.scanQr}</span>
            </button>
          </div>

          {/* TAB 1: ENTER CERTIFICATE ID */}
          {activeMethod === 'ID' && (
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#D8B4FE] uppercase">
                  Certificate Serial Number or ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputCertId}
                    onChange={(e) => setInputCertId(e.target.value)}
                    placeholder="e.g. CS-2026-891001"
                    className="w-full pl-4 pr-32 py-3.5 rounded-2xl bg-black/60 border border-[#FF2E88]/40 focus:border-[#FF2E88] text-white font-mono text-sm sm:text-base outline-none shadow-inner transition-all placeholder:text-gray-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyId()}
                  />
                  <button
                    onClick={() => handleVerifyId()}
                    disabled={isVerifying || !inputCertId.trim()}
                    className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-semibold text-xs sm:text-sm shadow-[0_0_15px_rgba(255,46,136,0.5)] hover:shadow-[0_0_20px_rgba(255,46,136,0.8)] disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <span className="animate-pulse">Checking...</span>
                    ) : (
                      <>
                        <span>Verify</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Chips to Test All Status Outcomes */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3 text-[#FF6FB5]" />
                  <span>Try Demo Test Credentials (1-Click Evaluation):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setInputCertId('CS-2026-891001');
                      handleVerifyId('CS-2026-891001');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/50 text-xs font-mono text-emerald-300 transition-all"
                  >
                    🟢 Valid (CS-2026-891001)
                  </button>

                  <button
                    onClick={() => {
                      setInputCertId('CS-2025-449102');
                      handleVerifyId('CS-2025-449102');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 text-xs font-mono text-red-300 transition-all"
                  >
                    🔴 Revoked (CS-2025-449102)
                  </button>

                  <button
                    onClick={() => {
                      setInputCertId('CS-2023-772911');
                      handleVerifyId('CS-2023-772911');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-xs font-mono text-amber-300 transition-all"
                  >
                    🟡 Expired (CS-2023-772911)
                  </button>

                  <button
                    onClick={() => {
                      setInputCertId('CS-2026-904122');
                      handleVerifyId('CS-2026-904122');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/50 border border-orange-500/50 text-xs font-mono text-orange-300 transition-all"
                  >
                    🟠 Duplicate (CS-2026-904122)
                  </button>

                  <button
                    onClick={() => {
                      setInputCertId('CS-2099-000000');
                      handleVerifyId('CS-2099-000000');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-900/60 hover:bg-gray-800/60 border border-gray-600/50 text-xs font-mono text-gray-400 transition-all"
                  >
                    ⚪ Not Found (CS-2099-000000)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD DOCUMENT */}
          {activeMethod === 'FILE' && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-300 space-y-1">
                <div className="font-semibold text-[#FF6FB5]">
                  In-Browser Cryptographic Fingerprinting (Zero Server Exposure)
                </div>
                <p>
                  Your file is hashed on your device using the Web Crypto API. The file never leaves your browser 
                  unless you choose optional AI forensics. A single byte difference produces a completely different hash.
                </p>
              </div>

              {/* Optional Certificate ID binding */}
              <div>
                <label className="block text-xs font-mono text-[#D8B4FE] uppercase mb-1">
                  Claimed Certificate ID (Optional — helps cross-match)
                </label>
                <input
                  type="text"
                  value={inputCertId}
                  onChange={(e) => setInputCertId(e.target.value)}
                  placeholder="e.g. CS-2026-891001 (or leave blank for hash auto-lookup)"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-[#FF2E88] text-white text-xs font-mono outline-none"
                />
              </div>

              {/* Drag and Drop Box */}
              <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#FF2E88]/40 hover:border-[#FF2E88] bg-black/40 cursor-pointer group transition-all">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-[#FF2E88]/10 group-hover:bg-[#FF2E88]/20 border border-[#FF2E88]/40 flex items-center justify-center text-[#FF2E88] mb-3 transition-all shadow-[0_0_15px_rgba(255,46,136,0.3)]">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-[#FF6FB5] transition-colors">
                  {selectedFile ? selectedFile.name : 'Click or drop certificate file here'}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-mono">
                  Supports PDF, PNG, JPG, or JSON credentials
                </div>
              </label>

              {computingHash && (
                <div className="p-3 rounded-xl bg-black/60 border border-[#FF2E88]/40 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-[#FF2E88] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-[#FF6FB5]">
                    Calculating live SHA-256 digest in browser memory...
                  </span>
                </div>
              )}

              {computedFileHash && (
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[11px] font-mono text-[#D8B4FE] uppercase">
                    Computed SHA-256 Digest:
                  </div>
                  <div className="font-mono text-xs text-emerald-400 break-all select-all">
                    {computedFileHash}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCAN QR CODE */}
          {activeMethod === 'QR' && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-300 space-y-1">
                <div className="font-semibold text-[#FF6FB5] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privacy First: Camera requested only while scanning</span>
                </div>
                <p>
                  Per our Question the Permissions architecture, camera access is stopped immediately after a QR code 
                  is recognized. No video is recorded or streamed.
                </p>
              </div>

              {/* Camera Scanner View */}
              <div className="relative rounded-2xl overflow-hidden border border-[#FF2E88]/40 bg-black min-h-[260px] flex flex-col items-center justify-center p-4">
                <video
                  ref={videoRef}
                  className={`w-full max-w-sm rounded-xl aspect-square object-cover ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                  playsInline
                  muted
                />

                {!cameraActive && (
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF2E88]/20 border border-[#FF2E88] flex items-center justify-center mx-auto text-[#FF2E88]">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Camera Scanner Inactive
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.5)] transition-all"
                    >
                      Start Camera Scanner
                    </button>
                  </div>
                )}

                {cameraActive && (
                  <div className="absolute bottom-4 flex items-center gap-2">
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-xl bg-red-900/80 border border-red-500/80 text-white text-xs font-semibold"
                    >
                      Stop Camera
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300 mt-3">
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Fast Simulated QR Scan Buttons */}
              <div className="pt-2">
                <div className="text-[11px] font-mono text-gray-400 mb-2">
                  Or simulate scanning a QR code from a mobile credential:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSimulateQrScan('CS-2026-891001')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#FF2E88]/30 text-xs font-mono text-[#FF6FB5]"
                  >
                    Simulate MIT QR (CS-2026-891001)
                  </button>
                  <button
                    onClick={() => handleSimulateQrScan('CS-2026-891003')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#FF2E88]/30 text-xs font-mono text-[#FF6FB5]"
                  >
                    Simulate AGBA QR (CS-2026-891003)
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
