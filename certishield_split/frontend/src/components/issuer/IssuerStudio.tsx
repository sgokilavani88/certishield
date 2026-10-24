import React, { useState, useEffect } from 'react';
import { 
  Award, PlusCircle, Upload, CheckCircle2, AlertTriangle, ShieldCheck, 
  Trash2, RefreshCw, FileText, Download, Database, Users, ShieldAlert, 
  Lock, ArrowRight, Eye, X, AlertOctagon 
} from 'lucide-react';
import { Certificate, Institution, FraudReport } from '../../types';
import { 
  getCertificates, getInstitutions, issueCertificate, revokeCertificate, 
  reissueCertificate, getFraudReports, updateFraudReportStatus 
} from '../../services/storage';
import { verifyLedgerIntegrity } from '../../utils/crypto';
import { generateQrCodeDataUrl, buildVerificationUrl } from '../../utils/qrHelper';
import { downloadCertificatePdf } from '../../utils/pdfGenerator';

interface IssuerStudioProps {
  onCertificateIssued?: (cert: Certificate) => void;
  onNavigateToVerify: (certId: string) => void;
}

export const IssuerStudio: React.FC<IssuerStudioProps> = ({
  onCertificateIssued,
  onNavigateToVerify,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ISSUE' | 'MANAGE' | 'BULK' | 'INTEGRITY' | 'FRAUD'>('ISSUE');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([]);

  // Issue Form State
  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [degreeType, setDegreeType] = useState('Bachelor of Science');
  const [grade, setGrade] = useState('First Class with Distinction');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedResult, setIssuedResult] = useState<Certificate | null>(null);
  const [issuedQrUrl, setIssuedQrUrl] = useState<string>('');

  // Revoke modal
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  // Reissue modal
  const [reissuingCert, setReissuingCert] = useState<Certificate | null>(null);
  const [reissueGrade, setReissueGrade] = useState('');

  // Ledger audit state
  const [ledgerAuditStatus, setLedgerAuditStatus] = useState<{
    running: boolean;
    result?: { isValid: boolean; brokenBlockNumber?: number; reason?: string; checkedBlocks: number };
  }>({ running: false });

  // Bulk CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [bulkProgress, setBulkProgress] = useState<number>(0);
  const [bulkSuccessCount, setBulkSuccessCount] = useState<number>(0);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const insts = await getInstitutions();
    setInstitutions(insts);
    if (insts.length > 0 && !institutionId) {
      setInstitutionId(insts[0].id);
    }
    const certs = await getCertificates();
    setCertificates(certs);
    const reports = await getFraudReports();
    setFraudReports(reports);
  };

  // Submit new Certificate
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName || !holderEmail || !courseName || !grade) return;

    setIsSubmitting(true);
    try {
      let fileBuffer: ArrayBuffer | undefined;
      if (fileUpload) {
        fileBuffer = await fileUpload.arrayBuffer();
      }

      const newCert = await issueCertificate({
        holderName,
        holderEmail,
        institutionId: institutionId || institutions[0].id,
        courseName,
        degreeType,
        grade,
        issueDate,
        expiryDate: expiryDate || undefined,
        fileBuffer,
      });

      const qrUrl = buildVerificationUrl(newCert.id, newCert.fileHash);
      const dataUrl = await generateQrCodeDataUrl(qrUrl);
      setIssuedQrUrl(dataUrl);
      setIssuedResult(newCert);

      // Reset form
      setHolderName('');
      setHolderEmail('');
      setCourseName('');
      setFileUpload(null);

      await loadData();
      if (onCertificateIssued) onCertificateIssued(newCert);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revoke Handler
  const handleConfirmRevoke = async () => {
    if (!revokingCert || !revokeReason.trim()) return;
    await revokeCertificate(revokingCert.id, revokeReason.trim());
    setRevokingCert(null);
    setRevokeReason('');
    await loadData();
  };

  // Reissue Handler
  const handleConfirmReissue = async () => {
    if (!reissuingCert) return;
    await reissueCertificate(reissuingCert.id, {
      grade: reissueGrade || reissuingCert.grade,
    });
    setReissuingCert(null);
    setReissueGrade('');
    await loadData();
  };

  // Ledger Integrity Audit
  const handleRunLedgerAudit = async () => {
    setLedgerAuditStatus({ running: true });
    const currentCerts = await getCertificates();
    const result = await verifyLedgerIntegrity(currentCerts);
    setLedgerAuditStatus({ running: false, result });
  };

  // Bulk CSV Parser
  const handleCsvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsedRows = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length >= 4) {
          parsedRows.push({
            holderName: cols[0] || 'Unknown',
            holderEmail: cols[1] || 'student@domain.com',
            courseName: cols[2] || 'Degree Program',
            grade: cols[3] || 'Pass',
            degreeType: cols[4] || 'Certification',
            isValid: !!cols[0] && cols[1]?.includes('@'),
            error: !cols[1]?.includes('@') ? 'Invalid email format' : '',
          });
        }
      }
      setCsvRows(parsedRows);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkIssue = async () => {
    if (csvRows.length === 0) return;
    setBulkProgress(10);
    let success = 0;

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i];
      if (row.isValid) {
        await issueCertificate({
          holderName: row.holderName,
          holderEmail: row.holderEmail,
          institutionId: institutionId || institutions[0].id,
          courseName: row.courseName,
          degreeType: row.degreeType,
          grade: row.grade,
          issueDate: new Date().toISOString().split('T')[0],
        });
        success++;
      }
      setBulkProgress(Math.round(((i + 1) / csvRows.length) * 100));
    }

    setBulkSuccessCount(success);
    await loadData();
  };

  const filteredCerts = certificates.filter((c) => {
    const matchesSearch =
      c.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FF2E88]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Institution Administration Console</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Issuer Credential Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
            Mint tamper-evident certificates, audit immutable block chain integrity, and handle revocations.
          </p>
        </div>

        <button
          onClick={handleRunLedgerAudit}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A0A26] border border-[#FF2E88]/50 hover:border-[#FF2E88] text-[#FF6FB5] hover:text-white text-xs font-mono transition-all shadow-[0_0_15px_rgba(255,46,136,0.2)] self-start sm:self-center"
        >
          <Database className="w-4 h-4 text-[#FF2E88]" />
          <span>Audit Ledger Integrity</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('ISSUE')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'ISSUE'
              ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold shadow-[0_0_12px_rgba(255,46,136,0.5)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Issue Single Credential
        </button>

        <button
          onClick={() => setActiveSubTab('BULK')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'BULK'
              ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold shadow-[0_0_12px_rgba(255,46,136,0.5)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Bulk CSV Issuance
        </button>

        <button
          onClick={() => setActiveSubTab('MANAGE')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'MANAGE'
              ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold shadow-[0_0_12px_rgba(255,46,136,0.5)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Manage Registry ({certificates.length})
        </button>

        <button
          onClick={() => setActiveSubTab('INTEGRITY')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'INTEGRITY'
              ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold shadow-[0_0_12px_rgba(255,46,136,0.5)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Ledger Blocks & Audit
        </button>

        <button
          onClick={() => setActiveSubTab('FRAUD')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeSubTab === 'FRAUD'
              ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold shadow-[0_0_12px_rgba(255,46,136,0.5)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Fraud Reports Queue ({fraudReports.length})
        </button>
      </div>

      {/* SUBTAB 1: ISSUE SINGLE */}
      {activeSubTab === 'ISSUE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Issue Form */}
          <div className="lg:col-span-7 rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 sm:p-8 shadow-[0_0_35px_rgba(255,46,136,0.2)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <PlusCircle className="w-5 h-5 text-[#FF2E88]" />
              <h3 className="font-heading font-bold text-lg text-white">
                New Cryptographic Credential
              </h3>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="e.g. Dr. Maya Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={holderEmail}
                    onChange={(e) => setHolderEmail(e.target.value)}
                    placeholder="e.g. maya.patel@alumni.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                  Issuing University / Institution *
                </label>
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A0A26] border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none cursor-pointer"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-[#14081F] text-white">
                      {inst.name} ({inst.code}) — Trust Score: {inst.trustScore}%
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Course / Degree Program *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. M.Sc. in Cloud Security"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Credential Type
                  </label>
                  <select
                    value={degreeType}
                    onChange={(e) => setDegreeType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A0A26] border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  >
                    <option value="Postgraduate Degree">Postgraduate Degree</option>
                    <option value="Undergraduate Degree">Undergraduate Degree</option>
                    <option value="Executive Master">Executive Master</option>
                    <option value="Professional License">Professional License</option>
                    <option value="Executive Fellowship">Executive Fellowship</option>
                    <option value="Specialist Certificate">Specialist Certificate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Grade / Result *
                  </label>
                  <input
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. First Class (94%)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                    Optional Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-sm outline-none"
                  />
                </div>
              </div>

              {/* Optional File Attachment */}
              <div>
                <label className="block font-mono text-[#D8B4FE] uppercase mb-1">
                  Attach Official Signed PDF/PNG (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 cursor-pointer text-xs font-mono text-gray-300 transition-all flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{fileUpload ? fileUpload.name : 'Choose File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    If attached, file's exact binary SHA-256 is anchored in the block.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold text-sm shadow-[0_0_25px_rgba(255,46,136,0.6)] hover:shadow-[0_0_35px_rgba(255,46,136,0.9)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Computing Fingerprint & Anchoring to Block...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Issue & Anchor to Tamper-Evident Ledger</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Issued Preview & Seal */}
          <div className="lg:col-span-5 space-y-6">
            {issuedResult ? (
              <div className="rounded-3xl border border-emerald-500/80 bg-gradient-to-b from-[#16291E] via-[#0E1A13] to-[#0A120D] p-6 shadow-[0_0_35px_rgba(16,185,129,0.3)] space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Credential Successfully Anchored</span>
                </div>

                <div>
                  <h4 className="font-heading font-bold text-xl text-white">
                    {issuedResult.holderName}
                  </h4>
                  <div className="text-xs text-emerald-300 font-mono">
                    {issuedResult.courseName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 text-xs font-mono space-y-1">
                  <div><span className="text-gray-400">ID:</span> <span className="text-white">{issuedResult.id}</span></div>
                  <div><span className="text-gray-400">Block:</span> <span className="text-white">#{issuedResult.blockNumber}</span></div>
                  <div className="break-all"><span className="text-gray-400">Fingerprint:</span> <span className="text-emerald-300 text-[10px]">{issuedResult.fileHash}</span></div>
                </div>

                {issuedQrUrl && (
                  <div className="flex justify-center p-3 bg-white rounded-xl shadow-lg">
                    <img src={issuedQrUrl} alt="Certificate QR" className="w-32 h-32" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => downloadCertificatePdf(issuedResult, issuedQrUrl)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/60 text-xs font-mono text-emerald-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => onNavigateToVerify(issuedResult.id)}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Verify Live</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/40 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FF2E88]/10 border border-[#FF2E88]/30 flex items-center justify-center mx-auto text-[#FF2E88]">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="font-heading font-semibold text-white">
                  Tamper-Evident Ledger Preview
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-mono">
                  When you submit a credential, CertiShield generates a SHA-256 fingerprint, 
                  links it cryptographically to the preceding record, and generates an unforgeable QR verification seal.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUBTAB 2: BULK CSV ISSUANCE */}
      {activeSubTab === 'BULK' && (
        <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Bulk Credential Issuance via CSV
              </h3>
              <p className="text-xs text-gray-400">
                Issue up to 200 certificates in a single batch with automatic row-level schema validation.
              </p>
            </div>

            <a
              href="data:text/csv;charset=utf-8,HolderName,HolderEmail,CourseName,Grade,DegreeType%0AJohn%20Doe,john.doe@university.edu,M.Sc.%20Cyber%20Defense,Distinction,Postgraduate%0ASarah%20Connor,sarah.c@tech.edu,B.Sc.%20AI%20Engineering,First%20Class,Undergraduate"
              download="certishield_bulk_template.csv"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono text-[#FF6FB5]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </a>
          </div>

          {/* Upload CSV */}
          <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#FF2E88]/40 hover:border-[#FF2E88] bg-black/40 cursor-pointer transition-all">
            <input type="file" accept=".csv" onChange={handleCsvSelect} className="hidden" />
            <Upload className="w-8 h-8 text-[#FF6FB5] mb-2" />
            <span className="text-xs font-semibold text-white">
              {csvFile ? csvFile.name : 'Select or Drop CSV Spreadsheet'}
            </span>
          </label>

          {/* CSV Preview Table */}
          {csvRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#D8B4FE]">
                  Previewing {csvRows.length} Rows (Ready for Cryptographic Minting)
                </span>
                <span className="text-emerald-400">
                  {csvRows.filter((r) => r.isValid).length} Valid • {csvRows.filter((r) => !r.isValid).length} Errors
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#1A0A26] text-[#FF6FB5] border-b border-white/10">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {csvRows.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-3 text-gray-500">{idx + 1}</td>
                        <td className="p-3 font-semibold text-white">{row.holderName}</td>
                        <td className="p-3">{row.holderEmail}</td>
                        <td className="p-3 text-[#D8B4FE]">{row.courseName}</td>
                        <td className="p-3">{row.grade}</td>
                        <td className="p-3">
                          {row.isValid ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">
                              <AlertOctagon className="w-3.5 h-3.5" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Progress bar if running */}
              {bulkProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-gray-300">
                    <span>Anchoring certificates to chain...</span>
                    <span>{bulkProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] transition-all"
                      style={{ width: `${bulkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {bulkSuccessCount > 0 && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-mono text-emerald-300">
                  ✓ Successfully issued {bulkSuccessCount} credentials to the immutable ledger!
                </div>
              )}

              <button
                onClick={handleExecuteBulkIssue}
                disabled={bulkProgress > 0 && bulkProgress < 100}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,46,136,0.6)]"
              >
                Execute Bulk Issuance ({csvRows.filter((r) => r.isValid).length} records)
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: MANAGE REGISTRY */}
      {activeSubTab === 'MANAGE' && (
        <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 sm:p-8 space-y-6">
          
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, recipient name, or program..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#1A0A26] border border-white/15 text-xs text-white outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="VERIFIED">Verified</option>
                <option value="REVOKED">Revoked</option>
                <option value="EXPIRED">Expired</option>
                <option value="DUPLICATE_ALERT">Duplicate Alert</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1A0A26] text-[#FF6FB5] border-b border-white/10">
                <tr>
                  <th className="p-3">Block #</th>
                  <th className="p-3">Certificate ID</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-white/5">
                    <td className="p-3 text-gray-500">#{cert.blockNumber}</td>
                    <td className="p-3 font-semibold text-white">{cert.id}</td>
                    <td className="p-3">{cert.holderName}</td>
                    <td className="p-3 text-[#D8B4FE] max-w-xs truncate">{cert.courseName}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                          cert.status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : cert.status === 'REVOKED'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : cert.status === 'EXPIRED'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onNavigateToVerify(cert.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                          title="Verify in Portal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {cert.status !== 'REVOKED' && (
                          <button
                            onClick={() => setRevokingCert(cert)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200"
                            title="Revoke Certificate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setReissuingCert(cert);
                            setReissueGrade(cert.grade);
                          }}
                          className="p-1.5 rounded-lg bg-[#FF2E88]/10 hover:bg-[#FF2E88]/20 text-[#FF6FB5]"
                          title="Reissue / Update Version"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SUBTAB 4: LEDGER CHAIN INTEGRITY AUDIT */}
      {activeSubTab === 'INTEGRITY' && (
        <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Ledger Chain Integrity Auditor
              </h3>
              <p className="text-xs text-gray-400">
                Verifies cryptographic parent hash continuity from Genesis Block #1 through Block #{certificates.length}.
              </p>
            </div>

            <button
              onClick={handleRunLedgerAudit}
              disabled={ledgerAuditStatus.running}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,46,136,0.5)] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ledgerAuditStatus.running ? 'animate-spin' : ''}`} />
              <span>{ledgerAuditStatus.running ? 'Verifying Chain...' : 'Run Full Ledger Audit'}</span>
            </button>
          </div>

          {/* Result Banner */}
          {ledgerAuditStatus.result && (
            <div
              className={`p-5 rounded-2xl border flex items-center justify-between ${
                ledgerAuditStatus.result.isValid
                  ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                  : 'bg-red-950/60 border-red-500/80 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
              }`}
            >
              <div className="flex items-center gap-3">
                {ledgerAuditStatus.result.isValid ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <AlertOctagon className="w-8 h-8 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="font-heading font-bold text-sm sm:text-base">
                    {ledgerAuditStatus.result.isValid
                      ? 'LEDGER INTEGRITY 100% INTACT'
                      : 'LEDGER CHAIN SEVERED / TAMPER DETECTED'}
                  </div>
                  <div className="text-xs opacity-90 font-mono mt-0.5">
                    {ledgerAuditStatus.result.isValid
                      ? `All ${ledgerAuditStatus.result.checkedBlocks} blocks validated sequentially. Zero hash drift or illicit insertions.`
                      : ledgerAuditStatus.result.reason}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sequential Block Chain Visualization */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#FF6FB5] uppercase font-semibold">
              Recent Cryptographic Blocks:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certificates.slice(-6).reverse().map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF6FB5] font-bold">Block #{b.blockNumber}</span>
                    <span className="text-gray-400 text-[10px]">{b.createdAt.split('T')[0]}</span>
                  </div>
                  <div><span className="text-gray-400">ID:</span> <span className="text-white font-semibold">{b.id}</span></div>
                  <div><span className="text-gray-400">Holder:</span> <span className="text-gray-200">{b.holderName}</span></div>
                  <div className="break-all text-[10px] text-[#A7F3D0]">
                    <span className="text-gray-500">Record Hash: </span>{b.recordHash}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 5: FRAUD REPORTS */}
      {activeSubTab === 'FRAUD' && (
        <div className="rounded-3xl border border-[#FF2E88]/40 bg-[#14061E]/90 p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-white/10">
            <h3 className="font-heading font-bold text-xl text-white">
              Public Fraud Reports Review Queue
            </h3>
            <p className="text-xs text-gray-400">
              Community and employer submissions flagging forged transcripts, duplicate serials, or suspicious resumes.
            </p>
          </div>

          {fraudReports.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-mono text-xs">
              No active fraud reports currently pending investigation.
            </div>
          ) : (
            <div className="space-y-4">
              {fraudReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl bg-black/60 border border-[#FF2E88]/30 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-400" />
                      <span className="font-mono text-xs text-white font-bold">
                        Report #{report.id} • Target: {report.certificateId}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                        report.status === 'PENDING_REVIEW'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : report.status === 'INVESTIGATING'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-200">
                    <span className="font-semibold text-gray-400">Reporter Reason: </span>
                    "{report.reason}"
                  </p>

                  {report.evidenceDetails && (
                    <div className="text-[11px] font-mono text-gray-400 p-2.5 rounded-lg bg-black/40 border border-white/5">
                      Evidence: {report.evidenceDetails}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                    <span className="text-gray-500">
                      Filed: {report.submittedAt.split('T')[0]}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateFraudReportStatus(report.id, 'INVESTIGATING')}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300"
                      >
                        Investigate
                      </button>
                      <button
                        onClick={() => updateFraudReportStatus(report.id, 'CONFIRMED_FRAUD')}
                        className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40"
                      >
                        Confirm Fraud
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revoke Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#180824] border border-red-500/60 rounded-3xl p-6 text-white space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.35)]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Revoke Certificate: {revokingCert.id}</span>
              </div>
              <button onClick={() => setRevokingCert(null)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Revoking marks this credential permanently invalid across all employer verification checks.
            </p>

            <div>
              <label className="block text-xs font-mono text-[#D8B4FE] uppercase mb-1">
                Official Revocation Reason *
              </label>
              <textarea
                rows={3}
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Falsified prerequisite transcripts or academic ethics violation..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-red-500 text-white text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokingCert(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reissue Modal */}
      {reissuingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#180824] border border-[#FF2E88]/60 rounded-3xl p-6 text-white space-y-4 shadow-[0_0_40px_rgba(255,46,136,0.35)]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#FF6FB5] font-bold text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Reissue Credential: {reissuingCert.id}</span>
              </div>
              <button onClick={() => setReissuingCert(null)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Reissuing supersedes the old credential, logs a version increment (e.g. v2), 
              and mints a fresh cryptographic anchor with updated metadata.
            </p>

            <div>
              <label className="block text-xs font-mono text-[#D8B4FE] uppercase mb-1">
                Updated Grade / Honors
              </label>
              <input
                type="text"
                value={reissueGrade}
                onChange={(e) => setReissueGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReissuingCert(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReissue}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white text-xs font-bold"
              >
                Reissue as New Version
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
