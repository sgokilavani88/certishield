export type UserRole = 'ISSUER' | 'HOLDER' | 'VERIFIER';

export type CertificateStatus = 
  | 'VERIFIED'
  | 'TAMPERED'
  | 'NOT_FOUND'
  | 'REVOKED'
  | 'EXPIRED'
  | 'DUPLICATE_ALERT';

export interface Certificate {
  id: string; // Format: CS-YYYY-XXXXXX
  holderName: string;
  holderEmail: string;
  institutionId: string;
  institutionName: string;
  institutionLogo?: string;
  courseName: string;
  degreeType: string;
  grade: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  fileHash: string; // SHA-256 fingerprint
  canonicalDataHash: string;
  previousRecordHash: string; // Chained to previous ledger entry
  recordHash: string; // Hash of (id + holder + fileHash + prevHash)
  blockNumber: number;
  status: CertificateStatus;
  revokedAt?: string;
  revokeReason?: string;
  reissueVersion?: number;
  reissueOfId?: string;
  createdAt: string;
  verificationCount: number;
  lastVerifiedAt?: string;
  metadata?: Record<string, any>;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  trustScore: number;
  verifiedSince: string;
  accreditation: string;
  website: string;
  issuerPublicKey: string;
  issuedCount: number;
  city: string;
  country: string;
}

export interface VerificationScoreBreakdown {
  label: string;
  points: number;
  maxPoints: number;
  passed: boolean;
  reason: string;
}

export interface VerificationResult {
  status: CertificateStatus;
  certificate?: Certificate;
  trustScore: number; // 0-100
  computedHash: string;
  matchedHash?: string;
  timestamp: string;
  explanation: string;
  scoreBreakdown: VerificationScoreBreakdown[];
  duplicateMatch?: {
    type: 'exact' | 'near';
    conflictId: string;
    description: string;
  };
  verificationReceiptId: string;
}

export interface AIForensicAnomaly {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AIForensicAnalysis {
  holderName: string;
  institutionName: string;
  courseName: string;
  grade: string;
  issueDate: string;
  certificateId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  anomalies: AIForensicAnomaly[];
  visualObservations: string[];
  overallAssessment: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'ISSUE' | 'REVOKE' | 'REISSUE' | 'VERIFY' | 'TAMPER_DETECTED' | 'FRAUD_REPORTED' | 'BULK_ISSUE';
  actor: string;
  role: 'ISSUER' | 'HOLDER' | 'VERIFIER' | 'SYSTEM';
  details: string;
  targetId?: string;
  ipOrLocation: string;
}

export interface FraudReport {
  id: string;
  certificateId: string;
  reporterEmail?: string;
  reason: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'INVESTIGATING' | 'CONFIRMED_FRAUD' | 'DISMISSED';
  evidenceDetails?: string;
}

export interface ShareConfig {
  id: string;
  certificateId: string;
  expiresAt: string; // ISO string
  allowGrade: boolean;
  allowEmail: boolean;
  allowExpiry: boolean;
  active: boolean;
  createdAt: string;
  viewsCount: number;
}
