import React, { useState } from 'react';
import { 
  X, Sparkles, Upload, AlertTriangle, ShieldCheck, CheckCircle2, 
  AlertOctagon, FileSearch, ArrowRight, Lock, Eye, RefreshCw 
} from 'lucide-react';
import { AIForensicAnalysis, Certificate } from '../../types';
import { getCertificates } from '../../services/storage';

interface AIForensicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCertificateForVerify?: (certId: string) => void;
}

export const AIForensicModal: React.FC<AIForensicModalProps> = ({
  isOpen,
  onClose,
  onSelectCertificateForVerify,
}) => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIForensicAnalysis | null>(null);
  const [matchedRegistryCert, setMatchedRegistryCert] = useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Handles image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Preset sample certificate for instant AI test
  const handleLoadSampleCertificate = () => {
    // Generate a simulated SVG/Canvas certificate preview dataURL
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark plum background
      ctx.fillStyle = '#160824';
      ctx.fillRect(0, 0, 800, 560);
      
      // Neon border
      ctx.strokeStyle = '#FF2E88';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 520);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('METROPOLITAN INSTITUTE OF TECHNOLOGY', 400, 80);

      ctx.fillStyle = '#FF6FB5';
      ctx.font = '16px sans-serif';
      ctx.fillText('OFFICIAL CREDENTIAL ATTESTATION', 400, 115);

      ctx.fillStyle = '#D8B4FE';
      ctx.font = '18px sans-serif';
      ctx.fillText('This certifies that', 400, 170);

      // Intentionally altered font or recipient
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px serif'; // Differing font serif vs sans
      ctx.fillText('Elena Rostova', 400, 220);

      ctx.fillStyle = '#D8B4FE';
      ctx.font = '16px sans-serif';
      ctx.fillText('has satisfactorily completed the prescribed study in', 400, 270);

      ctx.fillStyle = '#FF2E88';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('M.Sc. in Quantum Resistant Cryptography', 400, 315);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = '18px sans-serif';
      ctx.fillText('Grade: First Class Honors (CGPA 3.98/4.0)', 400, 360);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px monospace';
      ctx.fillText('Certificate ID: CS-2026-891001   •   Date: 2026-02-15', 400, 420);

      // Seal simulation
      ctx.fillStyle = '#FF2E88';
      ctx.beginPath();
      ctx.arc(400, 480, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('SEAL', 400, 484);

      const sampleDataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(sampleDataUrl);
      setAnalysisResult(null);
      setErrorMsg('');
    }
  };

  // Execute Gemini AI analysis via server route
  const handleRunAnalysis = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/gemini/analyze-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to inspect certificate with Gemini AI');
      }

      setAnalysisResult(data.analysis);

      // Cross-match extracted ID or name against registry
      const certs = await getCertificates();
      const extractedId = (data.analysis.certificateId || '').trim();
      const extractedName = (data.analysis.holderName || '').toLowerCase().trim();

      const matched = certs.find(
        (c) =>
          (extractedId && c.id.toUpperCase() === extractedId.toUpperCase()) ||
          (extractedName && c.holderName.toLowerCase().includes(extractedName))
      );

      setMatchedRegistryCert(matched || null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error executing AI forensic inspection.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/60 border-amber-500/80 text-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case 'HIGH':
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-red-950/60 border-red-500/80 text-red-300',
          icon: <AlertOctagon className="w-4 h-4 text-red-400" />,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#180824] via-[#12051B] to-[#0A030E] border border-[#FF2E88]/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,46,136,0.35)] text-white space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF6FB5] hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Vision & Typography Forensics</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Gemini AI Forensic Document Examiner
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
            Audit scanned degrees or phone photos without QR codes for digital cloning, font tampering, seal distortion, and text anomalies.
          </p>
        </div>

        {/* Question the Permissions Consent Dialog */}
        {!consentGiven && (
          <div className="p-5 rounded-2xl bg-[#200A2C] border border-[#FF2E88]/40 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Lock className="w-4 h-4 text-[#FF2E88]" />
              <span>Privacy & AI Analysis Consent</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              In accordance with our zero-trust privacy policy ("Question the Permissions"), your document is never 
              transmitted to external servers during regular verification. If you opt into AI forensic analysis, 
              the image is transmitted securely to Google Gemini 3.8 Flash solely to detect visual tampering and extract text.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#FF6FB5]">
                Consent required before upload
              </span>
              <button
                onClick={() => setConsentGiven(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.4)]"
              >
                I Understand & Opt In
              </button>
            </div>
          </div>
        )}

        {/* Upload & Analysis Controls (Visible after consent) */}
        {consentGiven && (
          <div className="space-y-6">
            
            {/* Image Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8">
                <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[#FF2E88]/40 hover:border-[#FF2E88] bg-black/40 cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-[#FF6FB5] mb-2" />
                  <span className="text-xs font-semibold text-white">
                    {selectedImage ? 'Change Selected Certificate Image' : 'Select Certificate Photo or Scan'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                    Supports JPG, PNG, WEBP (phone photos & scans)
                  </span>
                </label>
              </div>

              <div className="md:col-span-4 flex flex-col gap-2">
                <button
                  onClick={handleLoadSampleCertificate}
                  className="w-full py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#E9D5FF] transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#FF2E88]" />
                  <span>Load Sample Test Scan</span>
                </button>

                <button
                  onClick={handleRunAnalysis}
                  disabled={!selectedImage || analyzing}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] disabled:opacity-50 text-white text-xs font-bold shadow-[0_0_20px_rgba(255,46,136,0.6)] hover:shadow-[0_0_25px_rgba(255,46,136,0.8)] transition-all flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Inspecting Typography...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI Forensic Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Preview of Selected Image */}
            {selectedImage && !analysisResult && (
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-4">
                <img
                  src={selectedImage}
                  alt="Certificate Scan Preview"
                  className="w-20 h-16 object-cover rounded-lg border border-white/20"
                />
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white">Image Ready for Inspection</div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Click "Run AI Forensic Scan" to extract text and analyze seal consistency.
                  </div>
                </div>
              </div>
            )}

            {/* AI Forensic Results Card */}
            {analysisResult && (
              <div className="rounded-2xl border border-[#FF2E88]/40 bg-black/70 p-5 sm:p-6 space-y-6">
                
                {/* Risk Level & Confidence */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold uppercase flex items-center gap-1.5 ${
                        getRiskBadge(analysisResult.riskLevel).bg
                      }`}
                    >
                      {getRiskBadge(analysisResult.riskLevel).icon}
                      <span>AI RISK: {analysisResult.riskLevel}</span>
                    </div>

                    <div className="text-xs font-mono text-[#D8B4FE]">
                      Confidence: {analysisResult.confidenceScore}%
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-gray-400">
                    Model: gemini-3.8-flash (Server-Side)
                  </span>
                </div>

                {/* Overall Assessment */}
                <div className="p-4 rounded-xl bg-[#1A0A26] border border-[#FF2E88]/30 text-xs sm:text-sm text-gray-200 leading-relaxed">
                  <span className="font-bold text-[#FF6FB5]">Executive Forensic Assessment: </span>
                  {analysisResult.overallAssessment}
                </div>

                {/* Anomalies Detected */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#FF6FB5] uppercase tracking-wider font-semibold">
                    Visual & Typographical Anomalies ({analysisResult.anomalies.length} Flagged):
                  </div>
                  {analysisResult.anomalies.length === 0 ? (
                    <div className="text-xs text-emerald-400 font-mono">
                      ✓ No anomalies flagged. Fonts, kerning, and seals appear consistent.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {analysisResult.anomalies.map((ano, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-white font-semibold">{ano.category}</span>
                            <span
                              className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                                ano.severity === 'high'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {ano.severity} risk
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-300 leading-snug">
                            {ano.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Side-by-Side: Claimed (Extracted by AI) vs Registry Ground Truth */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#FF6FB5] uppercase tracking-wider font-semibold">
                      Claimed (AI OCR Extracted) vs Official Registry Match
                    </span>
                    {matchedRegistryCert ? (
                      <span className="text-[11px] font-mono text-emerald-400">
                        ✓ Linked to Record {matchedRegistryCert.id}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-red-400">
                        ✕ No Registry Match Found
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Left: Claimed via OCR */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs">
                      <div className="font-mono text-[#D8B4FE] font-bold pb-1 border-b border-white/10">
                        EXTRACTED FROM DOCUMENT
                      </div>
                      <div>
                        <span className="text-gray-400">Recipient: </span>
                        <span className="font-semibold text-white">{analysisResult.holderName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Institution: </span>
                        <span className="font-semibold text-white">{analysisResult.institutionName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Program: </span>
                        <span className="font-semibold text-white">{analysisResult.courseName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Grade: </span>
                        <span className="font-semibold text-white">{analysisResult.grade || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Serial ID: </span>
                        <span className="font-mono text-[#FF6FB5]">{analysisResult.certificateId || 'None'}</span>
                      </div>
                    </div>

                    {/* Right: Official Registry Record */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-emerald-500/30 space-y-2 text-xs">
                      <div className="font-mono text-emerald-400 font-bold pb-1 border-b border-white/10">
                        REGISTRY GROUND TRUTH
                      </div>
                      {matchedRegistryCert ? (
                        <>
                          <div>
                            <span className="text-gray-400">Recipient: </span>
                            <span className="font-semibold text-white">{matchedRegistryCert.holderName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Institution: </span>
                            <span className="font-semibold text-white">{matchedRegistryCert.institutionName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Program: </span>
                            <span className="font-semibold text-white">{matchedRegistryCert.courseName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Grade: </span>
                            <span className="font-semibold text-emerald-300">{matchedRegistryCert.grade}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Block ID: </span>
                            <span className="font-mono text-emerald-400">{matchedRegistryCert.id}</span>
                          </div>
                        </>
                      ) : (
                        <div className="py-6 text-center text-gray-500 font-mono">
                          Unregistered document or completely fabricated credential.
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Mandatory Disclaimer Badge */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-[11px] font-mono text-purple-200 text-center">
                  ⚖️ ADVISORY ONLY: AI forensic inspection is an advisory intelligence aid. The mathematical SHA-256 hash match against the CertiShield ledger is the legal source of truth.
                </div>

                {/* Action button */}
                {matchedRegistryCert && onSelectCertificateForVerify && (
                  <button
                    onClick={() => {
                      onSelectCertificateForVerify(matchedRegistryCert.id);
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.4)] flex items-center justify-center gap-2"
                  >
                    <span>Run Full Cryptographic Verification on {matchedRegistryCert.id}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
