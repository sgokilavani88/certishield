import React, { useState, useEffect } from 'react';
import { 
  UserCheck, ShieldCheck, Share2, Eye, Download, Copy, Check, 
  Clock, Lock, ShieldAlert, Sparkles, SlidersHorizontal, MapPin, ExternalLink 
} from 'lucide-react';
import { Certificate } from '../../types';
import { getCertificates } from '../../services/storage';
import { downloadCertificatePdf } from '../../utils/pdfGenerator';
import { generateQrCodeDataUrl, buildVerificationUrl } from '../../utils/qrHelper';

interface HolderWalletProps {
  onNavigateToVerify: (certId: string) => void;
}

export const HolderWallet: React.FC<HolderWalletProps> = ({ onNavigateToVerify }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedHolder, setSelectedHolder] = useState('Elena Rostova');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});

  // Selective Disclosure State
  const [shareModalCert, setShareModalCert] = useState<Certificate | null>(null);
  const [shareExpiryHours, setShareExpiryHours] = useState<number>(24);
  const [shareAllowGrade, setShareAllowGrade] = useState<boolean>(true);
  const [shareAllowEmail, setShareAllowEmail] = useState<boolean>(false);
  const [shareAllowExpiry, setShareAllowExpiry] = useState<boolean>(true);
  const [generatedShareLink, setGeneratedShareLink] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Simulated Share Tracking Views
  const [shareViews] = useState([
    {
      id: 'v1',
      certId: 'CS-2026-891001',
      verifierOrg: 'Palantir Cyber Intelligence',
      verifiedAt: '12 minutes ago',
      region: 'London, UK',
      verifiedStatus: 'AUTHENTIC',
    },
    {
      id: 'v2',
      certId: 'CS-2026-891001',
      verifierOrg: 'Sentinel Defense Group',
      verifiedAt: '2 hours ago',
      region: 'Zurich, Switzerland',
      verifiedStatus: 'AUTHENTIC',
    },
    {
      id: 'v3',
      certId: 'CS-2026-891001',
      verifierOrg: 'MIT Lincoln Labs Recruitment',
      verifiedAt: 'Yesterday',
      region: 'Boston, MA, USA',
      verifiedStatus: 'AUTHENTIC',
    },
  ]);

  useEffect(() => {
    loadCerts();
  }, [selectedHolder]);

  const loadCerts = async () => {
    const all = await getCertificates();
    setCertificates(all);

    // Filter for current holder
    const holderCerts = all.filter((c) => c.holderName.toLowerCase() === selectedHolder.toLowerCase());
    if (holderCerts.length > 0) {
      setSelectedCert(holderCerts[0]);
    } else if (all.length > 0) {
      setSelectedCert(all[0]);
    }

    // Pre-generate QR codes
    const qrs: Record<string, string> = {};
    for (const c of all) {
      const url = buildVerificationUrl(c.id, c.fileHash);
      qrs[c.id] = await generateQrCodeDataUrl(url);
    }
    setQrCodeUrls(qrs);
  };

  // Distinct holders list
  const availableHolders = Array.from(new Set(certificates.map((c) => c.holderName)));
  const myCerts = certificates.filter((c) => c.holderName.toLowerCase() === selectedHolder.toLowerCase());

  const handleOpenShare = (cert: Certificate) => {
    setShareModalCert(cert);
    const url = buildVerificationUrl(cert.id, cert.fileHash);
    setGeneratedShareLink(url);
    setCopiedLink(false);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(generatedShareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FF2E88]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Digital Credential Wallet</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            My Verified Certificates
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
            Store, selectively disclose, and generate time-limited share links for your tamper-proof credentials.
          </p>
        </div>

        {/* Switch Active Holder Dropdown */}
        <div className="flex items-center gap-2 bg-[#150722] p-1.5 rounded-2xl border border-white/15">
          <span className="text-xs font-mono text-gray-400 pl-2">Holder:</span>
          <select
            value={selectedHolder}
            onChange={(e) => setSelectedHolder(e.target.value)}
            className="bg-[#1A0A26] text-xs text-white font-semibold py-1.5 px-3 rounded-xl border border-[#FF2E88]/40 outline-none cursor-pointer"
          >
            {availableHolders.map((name) => (
              <option key={name} value={name} className="bg-[#14081F] text-white">
                {name} ({certificates.filter((c) => c.holderName === name).length} certs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left is Cards, Right is Selected View & Share Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Wallet Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#FF6FB5]">
            <span>MY CERTIFICATES ({myCerts.length})</span>
            <span>ENCRYPTED IN BROWSER</span>
          </div>

          {myCerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center text-gray-500 font-mono text-xs">
              No certificates issued to this identity yet.
            </div>
          ) : (
            myCerts.map((cert) => {
              const isSelected = selectedCert?.id === cert.id;
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#280936] to-[#180824] border-[#FF2E88] shadow-[0_0_25px_rgba(255,46,136,0.35)]'
                      : 'bg-[#14061E]/80 border-white/10 hover:border-[#FF2E88]/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#FF6FB5] uppercase px-2 py-0.5 rounded bg-[#FF2E88]/20 border border-[#FF2E88]/30">
                          {cert.id}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Block #{cert.blockNumber}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base sm:text-lg text-white">
                        {cert.courseName}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono">
                        {cert.institutionName} • {cert.degreeType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenShare(cert);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF6FB5] hover:text-white transition-all border border-white/10"
                        title="Selective Disclosure & Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadCertificatePdf(cert, qrCodeUrls[cert.id]);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/10"
                        title="Download Certificate PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <span className="text-emerald-400">Honors: {cert.grade}</span>
                    <span className="text-gray-400">Issued: {cert.issueDate}</span>
                  </div>
                </div>
              );
            })
          )}

          {/* Share Activity Tracking Log */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF6FB5] uppercase font-bold">
                <Eye className="w-4 h-4" />
                <span>Share Verification Activity (Who Verified Me)</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Live Tracker</span>
            </div>

            <div className="space-y-2.5">
              {shareViews.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{v.verifierOrg}</div>
                    <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF2E88]" />
                      <span>{v.region}</span> • <span>{v.verifiedAt}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {v.verifiedStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Selected Certificate Detail View with Hologram Seal */}
        <div className="lg:col-span-5 space-y-6">
          {selectedCert ? (
            <div className="rounded-3xl border border-[#FF2E88]/50 bg-gradient-to-b from-[#1E092B] via-[#12051B] to-[#0A030E] p-6 shadow-[0_0_35px_rgba(255,46,136,0.25)] space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono text-[#FF6FB5] uppercase font-bold">
                  Credential Seal • Block #{selectedCert.blockNumber}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {selectedCert.status}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-gray-400 uppercase">ISSUING INSTITUTION</span>
                <div className="font-heading font-bold text-lg text-white">
                  {selectedCert.institutionName}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-gray-400 uppercase">COURSE TITLE</span>
                <div className="font-heading font-bold text-xl text-[#FF6FB5]">
                  {selectedCert.courseName}
                </div>
                <div className="text-xs text-gray-300 font-mono mt-1">
                  {selectedCert.degreeType} • {selectedCert.grade}
                </div>
              </div>

              {/* QR Code Centerpiece */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center space-y-3">
                {qrCodeUrls[selectedCert.id] && (
                  <div className="p-2.5 bg-white rounded-xl shadow-[0_0_20px_rgba(255,46,136,0.4)]">
                    <img
                      src={qrCodeUrls[selectedCert.id]}
                      alt="Certificate Verification QR"
                      className="w-36 h-36"
                    />
                  </div>
                )}
                <div className="text-center font-mono text-xs text-[#E9D5FF]">
                  Point any phone camera to verify instantly
                </div>
              </div>

              {/* SHA-256 Fingerprint */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase">
                  Digital Fingerprint (SHA-256)
                </span>
                <div className="p-2.5 rounded-xl bg-black/70 border border-white/10 font-mono text-[10px] text-[#A7F3D0] break-all select-all">
                  {selectedCert.fileHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleOpenShare(selectedCert)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,46,136,0.4)] flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Privately</span>
                </button>

                <button
                  onClick={() => onNavigateToVerify(selectedCert.id)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/15 flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Test in Verifier</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-black/40 border border-white/10 text-center text-gray-500 font-mono text-xs">
              Select a certificate from the wallet to preview.
            </div>
          )}
        </div>

      </div>

      {/* Selective Disclosure & Share Modal */}
      {shareModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#180824] border border-[#FF2E88]/60 rounded-3xl p-6 sm:p-7 text-white space-y-5 shadow-[0_0_50px_rgba(255,46,136,0.35)]">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#FF2E88]" />
                <h3 className="font-heading font-bold text-lg text-white">
                  Selective Disclosure & Secure Share
                </h3>
              </div>
              <button onClick={() => setShareModalCert(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Control exactly what information employers or verifiers see. You can hide your exact grades or email 
              while still allowing mathematical proof of degree authenticity.
            </p>

            {/* Disclosure Toggles */}
            <div className="space-y-3 p-4 rounded-2xl bg-black/50 border border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Disclose Academic Grade & Honors</div>
                  <div className="text-[10px] text-gray-400 font-mono">Show: {shareModalCert.grade}</div>
                </div>
                <input
                  type="checkbox"
                  checked={shareAllowGrade}
                  onChange={(e) => setShareAllowGrade(e.target.checked)}
                  className="accent-[#FF2E88] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <div className="font-semibold text-white">Disclose Student Email Address</div>
                  <div className="text-[10px] text-gray-400 font-mono">Show: {shareModalCert.holderEmail}</div>
                </div>
                <input
                  type="checkbox"
                  checked={shareAllowEmail}
                  onChange={(e) => setShareAllowEmail(e.target.checked)}
                  className="accent-[#FF2E88] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <div className="font-semibold text-white">Disclose Validity Expiration Date</div>
                  <div className="text-[10px] text-gray-400 font-mono">Show expiry timeline</div>
                </div>
                <input
                  type="checkbox"
                  checked={shareAllowExpiry}
                  onChange={(e) => setShareAllowExpiry(e.target.checked)}
                  className="accent-[#FF2E88] w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Share Expiry Duration */}
            <div>
              <label className="block text-xs font-mono text-[#D8B4FE] uppercase mb-1.5">
                Share Link Expiry
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1 Hour', hours: 1 },
                  { label: '24 Hours', hours: 24 },
                  { label: '7 Days', hours: 168 },
                ].map((opt) => (
                  <button
                    key={opt.hours}
                    onClick={() => setShareExpiryHours(opt.hours)}
                    className={`py-2 rounded-xl text-xs font-mono transition-all border ${
                      shareExpiryHours === opt.hours
                        ? 'bg-[#FF2E88]/20 border-[#FF2E88] text-[#FF6FB5] font-bold'
                        : 'bg-black/40 border-white/10 text-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Link Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[#FF6FB5] uppercase">
                Generated Secure Link
              </span>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/70 border border-white/15">
                <input
                  type="text"
                  readOnly
                  value={generatedShareLink}
                  className="w-full bg-transparent text-xs font-mono text-gray-300 outline-none select-all"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-1.5 rounded-lg bg-[#FF2E88] text-white text-xs font-semibold shrink-0"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShareModalCert(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
