import { Certificate, Institution, AuditLogEntry, FraudReport, ShareConfig } from '../types';
import { computeCanonicalDataHash, computeRecordHash, generateCertificateId, sha256 } from '../utils/crypto';

const CERT_STORAGE_KEY = 'certishield_certificates_v1';
const INST_STORAGE_KEY = 'certishield_institutions_v1';
const AUDIT_STORAGE_KEY = 'certishield_audit_logs_v1';
const FRAUD_STORAGE_KEY = 'certishield_fraud_reports_v1';
const SHARE_STORAGE_KEY = 'certishield_share_configs_v1';

export const SEED_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-mit',
    name: 'Metropolitan Institute of Technology',
    code: 'MIT-TECH',
    trustScore: 99,
    verifiedSince: '2019-04-12',
    accreditation: 'Global Engineering & Computing Accreditation Board (GECAB Level-1)',
    website: 'https://mit-tech.ac.edu',
    issuerPublicKey: '0x9E7F4b3c99021aE4E2C7991a08BFe708172948cd',
    issuedCount: 1420,
    city: 'Boston',
    country: 'United States',
  },
  {
    id: 'inst-ncdu',
    name: 'National Cyber Defense University',
    code: 'NCDU',
    trustScore: 98,
    verifiedSince: '2020-01-15',
    accreditation: 'International Cyber Standards Authority (ICSA ISO/IEC 27001)',
    website: 'https://cyberdefense.gov.edu',
    issuerPublicKey: '0x3D11A79f6C84C37b678Fa5bC56Ce08A276bB9a84',
    issuedCount: 890,
    city: 'Geneva',
    country: 'Switzerland',
  },
  {
    id: 'inst-agba',
    name: 'Apex Global Business Academy',
    code: 'AGBA',
    trustScore: 96,
    verifiedSince: '2021-08-30',
    accreditation: 'Association of Collegiate Business Schools and Programs (ACBSP)',
    website: 'https://apexbusiness.edu',
    issuerPublicKey: '0x7B99E5f12C091A49B8801dE539a2B94Fa0197711',
    issuedCount: 640,
    city: 'Singapore',
    country: 'Singapore',
  },
];

// Seed certificate templates
const RAW_SEED_DATA = [
  {
    id: 'CS-2026-891001',
    holderName: 'Elena Rostova',
    holderEmail: 'elena.rostova@cyberdefense.org',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Master of Advanced Offensive Cybersecurity',
    degreeType: 'Postgraduate Degree',
    grade: 'Distinction (CGPA 3.98/4.0)',
    issueDate: '2026-02-15',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891002',
    holderName: 'Aarav Sharma',
    holderEmail: 'aarav.sharma@techcorp.in',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'B.Sc. in Artificial Intelligence & Machine Learning',
    degreeType: 'Undergraduate Degree',
    grade: 'First Class with Honors (92.4%)',
    issueDate: '2026-03-01',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891003',
    holderName: 'Kavitha Sivakumar',
    holderEmail: 'kavitha.s@agba.edu',
    institutionId: 'inst-agba',
    institutionName: 'Apex Global Business Academy',
    courseName: 'Executive MBA in Financial Cryptography',
    degreeType: 'Executive Master',
    grade: 'Summa Cum Laude',
    issueDate: '2026-03-12',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891004',
    holderName: 'Marcus Vance',
    holderEmail: 'marcus.v@cloudscale.net',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'Distributed Cloud Architecture Fellow',
    degreeType: 'Fellowship Certification',
    grade: 'Grade A+ (Distinguished Fellow)',
    issueDate: '2026-03-20',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2025-449102',
    holderName: 'Vikramaditya Roy',
    holderEmail: 'vikram.roy99@mailbox.org',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Certified Digital Forensics Investigator',
    degreeType: 'Professional License',
    grade: 'Grade B+',
    issueDate: '2025-11-10',
    status: 'REVOKED' as const,
    revokedAt: '2026-01-14T09:30:00Z',
    revokeReason: 'Credential Revocation Order #914: Falsified prerequisite transcripts and prior work history confirmed during internal audit.',
  },
  {
    id: 'CS-2024-118903',
    holderName: 'Julian Sterling',
    holderEmail: 'julian.sterling@financeholdings.co.uk',
    institutionId: 'inst-agba',
    institutionName: 'Apex Global Business Academy',
    courseName: 'Master of Corporate Risk Governance',
    degreeType: 'Postgraduate Degree',
    grade: 'Pass with Merit',
    issueDate: '2024-06-18',
    status: 'REVOKED' as const,
    revokedAt: '2025-09-02T14:15:00Z',
    revokeReason: 'Academic Ethics Board Finding #221: Substantial uncredited thesis duplication and code theft.',
  },
  {
    id: 'CS-2023-772911',
    holderName: 'Sophie Lindqvist',
    holderEmail: 'sophie.lindqvist@nordicsec.se',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Critical Infrastructure Penetration Specialist',
    degreeType: 'Time-Limited License',
    grade: 'Grade A',
    issueDate: '2023-05-15',
    expiryDate: '2025-05-15',
    status: 'EXPIRED' as const,
  },
  {
    id: 'CS-2026-904121',
    holderName: 'Devon Keith Miller',
    holderEmail: 'devon.miller@cyberops.us',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'M.Sc. in Quantum Resistant Cryptography',
    degreeType: 'Postgraduate Degree',
    grade: 'First Class (CGPA 3.89/4.0)',
    issueDate: '2026-01-20',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-904122', // Duplicate of 904121
    holderName: 'Devon Keith Miller',
    holderEmail: 'devon.miller.clone@shadowmail.cc',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'M.Sc. in Quantum Resistant Cryptography',
    degreeType: 'Postgraduate Degree',
    grade: 'First Class (CGPA 3.89/4.0)',
    issueDate: '2026-01-20',
    status: 'DUPLICATE_ALERT' as const,
  },
  {
    id: 'CS-2026-891005',
    holderName: 'Priya Narayanan',
    holderEmail: 'priya.n@mit-alumni.org',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'Postgraduate Diploma in Blockchain Engineering',
    degreeType: 'Postgraduate Diploma',
    grade: 'Distinction (94.8%)',
    issueDate: '2026-02-28',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891006',
    holderName: 'Alexander Wu',
    holderEmail: 'alex.wu@zenithfintech.com',
    institutionId: 'inst-agba',
    institutionName: 'Apex Global Business Academy',
    courseName: 'Global FinTech and Algorithmic Trading',
    degreeType: 'Certification',
    grade: 'Grade A+',
    issueDate: '2026-03-05',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891007',
    holderName: 'Fatima Al-Mansoor',
    holderEmail: 'f.almansoor@certi-defense.ae',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Threat Intelligence & Darknet Reconnaissance',
    degreeType: 'Specialist Certificate',
    grade: 'High Distinction',
    issueDate: '2026-03-10',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891008',
    holderName: 'Liam O’Connor',
    holderEmail: 'liam.oc@dublin-eng.ie',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'B.Sc. in Software System Safety',
    degreeType: 'Undergraduate Degree',
    grade: 'First Class Honors (1:1)',
    issueDate: '2026-03-15',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891009',
    holderName: 'Zainab Qureshi',
    holderEmail: 'zainab.q@agba-alumni.pk',
    institutionId: 'inst-agba',
    institutionName: 'Apex Global Business Academy',
    courseName: 'Strategic Leadership & ESG Metrics',
    degreeType: 'Executive Diploma',
    grade: 'Grade A',
    issueDate: '2026-03-18',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891010',
    holderName: 'Lucas Ferreira',
    holderEmail: 'lucas.f@saopaulo-tech.br',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Zero Trust Network Architecture Masterclass',
    degreeType: 'Professional Credential',
    grade: 'Passed with Honors',
    issueDate: '2026-03-22',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891011',
    holderName: 'Mei-Ling Chen',
    holderEmail: 'ml.chen@cybersec-taipei.tw',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Hardware Security & Side-Channel Analysis',
    degreeType: 'Advanced Diploma',
    grade: 'Grade A+',
    issueDate: '2026-03-25',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891012',
    holderName: 'Siddharth Varma',
    holderEmail: 'siddharth.v@dataworks.in',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'M.Sc. in Big Data Analytics & Distributed ML',
    degreeType: 'Postgraduate Degree',
    grade: 'Distinction (CGPA 3.92/4.0)',
    issueDate: '2026-03-28',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891013',
    holderName: 'Ananya Deshmukh',
    holderEmail: 'ananya.d@agba.edu',
    institutionId: 'inst-agba',
    institutionName: 'Apex Global Business Academy',
    courseName: 'International Business Strategy & M&A',
    degreeType: 'Master of Commerce',
    grade: 'First Class with Distinction',
    issueDate: '2026-04-01',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891014',
    holderName: 'Mateo Rossi',
    holderEmail: 'm.rossi@milano-cyber.it',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Automated Vulnerability Research & Exploitation',
    degreeType: 'Specialist Certificate',
    grade: 'Distinction',
    issueDate: '2026-04-05',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891015',
    holderName: 'Chloe Dubois',
    holderEmail: 'chloe.dubois@paris-analytics.fr',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'Bioinformatics & Computational Genomics',
    degreeType: 'Master of Science',
    grade: 'Mention Très Bien',
    issueDate: '2026-04-08',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891016',
    holderName: 'Kenji Takahashi',
    holderEmail: 'kenji.t@tokyo-security.jp',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Incident Response & Live Memory Forensics',
    degreeType: 'Professional License',
    grade: 'Grade A',
    issueDate: '2026-04-10',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891017',
    holderName: 'Hannah Mueller',
    holderEmail: 'hannah.mueller@berlin-tech.de',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'Autonomous Robotics & Sensor Fusion',
    degreeType: 'Bachelor of Engineering',
    grade: '1.2 (Sehr Gut)',
    issueDate: '2026-04-12',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891018',
    holderName: 'Kwame Mensah',
    holderEmail: 'kwame.mensah@accra-fin.gh',
    institutionId: 'inst-agba',
    institutionName: 'Apex Global Business Academy',
    courseName: 'Digital Banking Operations & Compliance',
    degreeType: 'Professional Diploma',
    grade: 'Distinction',
    issueDate: '2026-04-14',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891019',
    holderName: 'Dmitri Ivanov',
    holderEmail: 'dmitri.ivanov@secureshield.ee',
    institutionId: 'inst-ncdu',
    institutionName: 'National Cyber Defense University',
    courseName: 'Sovereign Cyber Resilience & Critical Infra Defense',
    degreeType: 'Executive Fellowship',
    grade: 'Highest Honors',
    issueDate: '2026-04-16',
    status: 'VERIFIED' as const,
  },
  {
    id: 'CS-2026-891020',
    holderName: 'Nadia Benali',
    holderEmail: 'nadia.benali@mit-alumni.ma',
    institutionId: 'inst-mit',
    institutionName: 'Metropolitan Institute of Technology',
    courseName: 'Neuromorphic Computing & Edge Neural Nets',
    degreeType: 'Master of Science',
    grade: 'Grade A+ (Distinction)',
    issueDate: '2026-04-18',
    status: 'VERIFIED' as const,
  },
];

/**
 * Initializes and builds a cryptographically chained ledger of 25 certificates.
 */
export async function initializeSeedLedger(): Promise<Certificate[]> {
  const existing = localStorage.getItem(CERT_STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed) && parsed.length >= 20) {
        return parsed;
      }
    } catch {
      // Fall through to reseed
    }
  }

  const certificates: Certificate[] = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < RAW_SEED_DATA.length; i++) {
    const raw = RAW_SEED_DATA[i];
    const blockNumber = i + 1;
    const createdAt = `${raw.issueDate}T10:00:00.000Z`;

    // Compute canonical data hash
    const canonicalHash = await computeCanonicalDataHash({
      holderName: raw.holderName,
      institutionName: raw.institutionName,
      courseName: raw.courseName,
      grade: raw.grade,
      issueDate: raw.issueDate,
      expiryDate: raw.expiryDate,
    });

    // File hash: deterministic for seed
    const fileHash =
      raw.id === 'CS-2026-904122'
        ? certificates[7].fileHash // Duplicate hash to match #904121!
        : await sha256(`DOC_PAYLOAD::${raw.id}::${canonicalHash}::SECURE_SEAL`);

    // Compute ledger record hash
    const recordHash = await computeRecordHash({
      blockNumber,
      previousRecordHash: prevHash,
      certificateId: raw.id,
      fileHash,
      canonicalDataHash: canonicalHash,
      createdAt,
    });

    const cert: Certificate = {
      ...raw,
      canonicalDataHash: canonicalHash,
      fileHash: fileHash,
      previousRecordHash: prevHash,
      recordHash: recordHash,
      blockNumber: blockNumber,
      createdAt: createdAt,
      verificationCount: Math.floor(10 + Math.random() * 85),
      lastVerifiedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)).toISOString(),
    };

    certificates.push(cert);
    prevHash = recordHash;
  }

  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certificates));
  localStorage.setItem(INST_STORAGE_KEY, JSON.stringify(SEED_INSTITUTIONS));

  // Seed audit logs
  seedInitialAuditLogs(certificates);

  return certificates;
}

function seedInitialAuditLogs(certificates: Certificate[]) {
  const auditLogs: AuditLogEntry[] = [
    {
      id: 'log-001',
      timestamp: '2026-04-20T14:32:01.000Z',
      action: 'ISSUE',
      actor: 'Prof. Julian Vance (Registrar)',
      role: 'ISSUER',
      details: 'Issued cryptographic credential CS-2026-891001 for Elena Rostova',
      targetId: 'CS-2026-891001',
      ipOrLocation: 'Geneva, Switzerland',
    },
    {
      id: 'log-002',
      timestamp: '2026-04-21T09:15:22.000Z',
      action: 'VERIFY',
      actor: 'Public Verifier',
      role: 'VERIFIER',
      details: 'Direct SHA-256 document scan verified successfully for CS-2026-891002',
      targetId: 'CS-2026-891002',
      ipOrLocation: 'San Francisco, CA',
    },
    {
      id: 'log-003',
      timestamp: '2026-04-22T11:45:09.000Z',
      action: 'TAMPER_DETECTED',
      actor: 'CertiShield Security Node',
      role: 'SYSTEM',
      details: 'ALERT: Byte mismatch detected on uploaded credential attempting to claim CS-2026-891001. Verification blocked.',
      targetId: 'CS-2026-891001',
      ipOrLocation: 'Frankfurt, Germany',
    },
    {
      id: 'log-004',
      timestamp: '2026-04-22T16:20:44.000Z',
      action: 'REVOKE',
      actor: 'Dean of Academic Integrity',
      role: 'ISSUER',
      details: 'Revoked certificate CS-2025-449102: Order #914 falsified prerequisites.',
      targetId: 'CS-2025-449102',
      ipOrLocation: 'Geneva, Switzerland',
    },
    {
      id: 'log-005',
      timestamp: '2026-04-23T12:05:18.000Z',
      action: 'FRAUD_REPORTED',
      actor: 'Recruiter @ Sentinel Shield',
      role: 'VERIFIER',
      details: 'Fraud report submitted for near-duplicate diploma with altered recipient name.',
      targetId: 'CS-2026-904122',
      ipOrLocation: 'London, UK',
    },
  ];

  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLogs));

  const fraudReports: FraudReport[] = [
    {
      id: 'fraud-101',
      certificateId: 'CS-2026-904122',
      reporterEmail: 'hiring@defenseconsultants.com',
      reason: 'Candidate submitted identical quantum cryptography certificate fingerprint under a different resume email.',
      submittedAt: '2026-04-23T12:05:18.000Z',
      status: 'INVESTIGATING',
      evidenceDetails: 'Fingerprint collides with CS-2026-904121 (Devon Keith Miller). Candidate claims to be external contractor.',
    },
  ];
  localStorage.setItem(FRAUD_STORAGE_KEY, JSON.stringify(fraudReports));
}

// Repository Methods
export async function getCertificates(): Promise<Certificate[]> {
  const data = localStorage.getItem(CERT_STORAGE_KEY);
  if (!data) {
    return initializeSeedLedger();
  }
  try {
    return JSON.parse(data);
  } catch {
    return initializeSeedLedger();
  }
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  const certs = await getCertificates();
  return certs.find((c) => c.id.toUpperCase().trim() === id.toUpperCase().trim()) || null;
}

export async function getCertificateByHash(hash: string): Promise<Certificate | null> {
  const certs = await getCertificates();
  const cleanHash = hash.toLowerCase().trim();
  return certs.find((c) => c.fileHash.toLowerCase() === cleanHash || c.canonicalDataHash.toLowerCase() === cleanHash) || null;
}

export async function issueCertificate(payload: {
  holderName: string;
  holderEmail: string;
  institutionId: string;
  courseName: string;
  degreeType: string;
  grade: string;
  issueDate: string;
  expiryDate?: string;
  fileBuffer?: ArrayBuffer;
}): Promise<Certificate> {
  const certs = await getCertificates();
  const insts = await getInstitutions();
  const inst = insts.find((i) => i.id === payload.institutionId) || insts[0];

  const newId = generateCertificateId();
  const blockNumber = certs.length + 1;
  const prevRecord = certs[certs.length - 1];
  const prevHash = prevRecord ? prevRecord.recordHash : '0000000000000000000000000000000000000000000000000000000000000000';
  const createdAt = new Date().toISOString();

  const canonicalHash = await computeCanonicalDataHash({
    holderName: payload.holderName,
    institutionName: inst.name,
    courseName: payload.courseName,
    grade: payload.grade,
    issueDate: payload.issueDate,
    expiryDate: payload.expiryDate,
  });

  const fileHash = payload.fileBuffer
    ? await sha256(payload.fileBuffer)
    : await sha256(`DOC_FILE::${newId}::${canonicalHash}::${createdAt}`);

  const recordHash = await computeRecordHash({
    blockNumber,
    previousRecordHash: prevHash,
    certificateId: newId,
    fileHash,
    canonicalDataHash: canonicalHash,
    createdAt,
  });

  const newCert: Certificate = {
    id: newId,
    holderName: payload.holderName.trim(),
    holderEmail: payload.holderEmail.trim(),
    institutionId: inst.id,
    institutionName: inst.name,
    courseName: payload.courseName.trim(),
    degreeType: payload.degreeType || 'Certificate of Excellence',
    grade: payload.grade.trim(),
    issueDate: payload.issueDate,
    expiryDate: payload.expiryDate,
    fileHash,
    canonicalDataHash: canonicalHash,
    previousRecordHash: prevHash,
    recordHash,
    blockNumber,
    status: 'VERIFIED',
    createdAt,
    verificationCount: 0,
  };

  certs.push(newCert);
  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));

  // Log in audit log
  await addAuditLog({
    action: 'ISSUE',
    actor: `${inst.name} Admin`,
    role: 'ISSUER',
    details: `Issued new tamper-evident certificate ${newCert.id} to ${newCert.holderName}`,
    targetId: newCert.id,
    ipOrLocation: `${inst.city}, ${inst.country}`,
  });

  return newCert;
}

export async function revokeCertificate(id: string, reason: string): Promise<Certificate> {
  const certs = await getCertificates();
  const index = certs.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Certificate not found');

  certs[index].status = 'REVOKED';
  certs[index].revokedAt = new Date().toISOString();
  certs[index].revokeReason = reason;

  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));

  await addAuditLog({
    action: 'REVOKE',
    actor: 'Institution Administrator',
    role: 'ISSUER',
    details: `Revoked ${id}: "${reason}"`,
    targetId: id,
    ipOrLocation: 'Security Console',
  });

  return certs[index];
}

export async function reissueCertificate(
  oldId: string,
  updates: Partial<Certificate>
): Promise<Certificate> {
  const oldCert = await getCertificateById(oldId);
  if (!oldCert) throw new Error('Original certificate not found');

  // Mark old as revoked / superseded
  await revokeCertificate(oldId, `Superseded by reissue`);

  // Issue new certificate with version
  const newCert = await issueCertificate({
    holderName: updates.holderName || oldCert.holderName,
    holderEmail: updates.holderEmail || oldCert.holderEmail,
    institutionId: oldCert.institutionId,
    courseName: updates.courseName || oldCert.courseName,
    degreeType: updates.degreeType || oldCert.degreeType,
    grade: updates.grade || oldCert.grade,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: updates.expiryDate || oldCert.expiryDate,
  });

  // Attach version metadata
  const certs = await getCertificates();
  const newIndex = certs.findIndex((c) => c.id === newCert.id);
  if (newIndex !== -1) {
    certs[newIndex].reissueOfId = oldId;
    certs[newIndex].reissueVersion = (oldCert.reissueVersion || 1) + 1;
    localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));
  }

  await addAuditLog({
    action: 'REISSUE',
    actor: 'Institution Administrator',
    role: 'ISSUER',
    details: `Reissued certificate ${newCert.id} (v${(oldCert.reissueVersion || 1) + 1}) replacing ${oldId}`,
    targetId: newCert.id,
    ipOrLocation: 'Registrar Terminal',
  });

  return certs[newIndex];
}

export async function getInstitutions(): Promise<Institution[]> {
  const data = localStorage.getItem(INST_STORAGE_KEY);
  if (!data) return SEED_INSTITUTIONS;
  try {
    return JSON.parse(data);
  } catch {
    return SEED_INSTITUTIONS;
  }
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const data = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
  const logs = await getAuditLogs();
  const newLog: AuditLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  return newLog;
}

export async function getFraudReports(): Promise<FraudReport[]> {
  const data = localStorage.getItem(FRAUD_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function submitFraudReport(report: {
  certificateId: string;
  reporterEmail?: string;
  reason: string;
  evidenceDetails?: string;
}): Promise<FraudReport> {
  const reports = await getFraudReports();
  const newReport: FraudReport = {
    id: `fraud-${Date.now()}`,
    certificateId: report.certificateId,
    reporterEmail: report.reporterEmail,
    reason: report.reason,
    evidenceDetails: report.evidenceDetails,
    submittedAt: new Date().toISOString(),
    status: 'PENDING_REVIEW',
  };
  reports.unshift(newReport);
  localStorage.setItem(FRAUD_STORAGE_KEY, JSON.stringify(reports));

  await addAuditLog({
    action: 'FRAUD_REPORTED',
    actor: report.reporterEmail || 'Anonymous Verifier',
    role: 'VERIFIER',
    details: `Fraud report filed against ${report.certificateId}: ${report.reason.substring(0, 50)}...`,
    targetId: report.certificateId,
    ipOrLocation: 'Community Verifier Portal',
  });

  return newReport;
}

export async function updateFraudReportStatus(
  reportId: string,
  status: FraudReport['status']
): Promise<void> {
  const reports = await getFraudReports();
  const index = reports.findIndex((r) => r.id === reportId);
  if (index !== -1) {
    reports[index].status = status;
    localStorage.setItem(FRAUD_STORAGE_KEY, JSON.stringify(reports));
  }
}

/**
 * Creates a simulated tampered certificate file for demonstration & judging.
 * Produces a downloadable file with a single flipped byte/character.
 */
export function generateSampleTamperedDocumentBlob(cert: Certificate): {
  blob: Blob;
  filename: string;
  originalHash: string;
  tamperedContent: string;
} {
  const tamperedContent = JSON.stringify(
    {
      certificateId: cert.id,
      holderName: cert.holderName + ' [ALTERED BY FRAUDULENT EDITOR]',
      institution: cert.institutionName,
      course: cert.courseName,
      grade: 'Grade A+ (Distinction - FORGED)',
      issueDate: cert.issueDate,
      originalExpectedFingerprint: cert.fileHash,
      securityWatermark: 'TAMPER_INJECTION_TEST_CANARY_0xDEADBEEF',
    },
    null,
    2
  );

  const blob = new Blob([tamperedContent], { type: 'application/json' });
  return {
    blob,
    filename: `${cert.id}_TAMPERED_SAMPLE.json`,
    originalHash: cert.fileHash,
    tamperedContent,
  };
}

/**
 * Intentionally injects a tamper into the ledger storage for Tamper Lab demonstrations.
 */
export async function injectTamperIntoBlock(blockNumber: number, field: 'grade' | 'holderName'): Promise<void> {
  const certs = await getCertificates();
  const target = certs.find((c) => c.blockNumber === blockNumber);
  if (!target) return;

  if (field === 'grade') {
    target.grade = 'Distinction (Tampered Grade)';
  } else {
    target.holderName = target.holderName + ' (Illicit Alteration)';
  }

  localStorage.setItem(CERT_STORAGE_KEY, JSON.stringify(certs));
}

/**
 * Resets ledger to pristine cryptographic state.
 */
export async function resetToPristineLedger(): Promise<Certificate[]> {
  localStorage.removeItem(CERT_STORAGE_KEY);
  localStorage.removeItem(INST_STORAGE_KEY);
  localStorage.removeItem(AUDIT_STORAGE_KEY);
  localStorage.removeItem(FRAUD_STORAGE_KEY);
  return initializeSeedLedger();
}
