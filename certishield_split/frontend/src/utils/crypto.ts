import { Certificate } from '../types';

/**
 * Computes a standard SHA-256 hexadecimal hash using Web Crypto API.
 * Works natively in modern browsers and Web Workers.
 */
export async function sha256(data: string | ArrayBuffer | Uint8Array): Promise<string> {
  let source: ArrayBuffer;

  if (typeof data === 'string') {
    const uint8 = new TextEncoder().encode(data);
    source = uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer;
  } else if (data instanceof Uint8Array) {
    source = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  } else {
    source = data;
  }

  const hashBuffer = await window.crypto.subtle.digest('SHA-256', source);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes SHA-256 of a browser File object.
 */
export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return sha256(arrayBuffer);
}

/**
 * Computes a deterministic canonical hash from structured certificate fields.
 */
export async function computeCanonicalDataHash(fields: {
  holderName: string;
  institutionName: string;
  courseName: string;
  grade: string;
  issueDate: string;
  expiryDate?: string;
}): Promise<string> {
  const normalized = [
    fields.holderName.trim().toLowerCase(),
    fields.institutionName.trim().toLowerCase(),
    fields.courseName.trim().toLowerCase(),
    fields.grade.trim().toLowerCase(),
    fields.issueDate.trim(),
    (fields.expiryDate || '').trim(),
  ].join('||');

  return sha256(`CANONICAL_V1::${normalized}`);
}

/**
 * Computes the cryptographic block record hash for the tamper-evident ledger.
 */
export async function computeRecordHash(params: {
  blockNumber: number;
  previousRecordHash: string;
  certificateId: string;
  fileHash: string;
  canonicalDataHash: string;
  createdAt: string;
}): Promise<string> {
  const payload = [
    params.blockNumber,
    params.previousRecordHash,
    params.certificateId,
    params.fileHash,
    params.canonicalDataHash,
    params.createdAt,
  ].join('##');

  return sha256(`BLOCK::${payload}`);
}

/**
 * Generates unique Certificate ID with format CS-YYYY-XXXXXX
 */
export function generateCertificateId(year: number = new Date().getFullYear()): string {
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `CS-${year}-${randomPart}`;
}

/**
 * Verifies the integrity of the entire tamper-evident registry chain.
 * Recomputes all hashes from Genesis to the latest block.
 */
export async function verifyLedgerIntegrity(
  records: Certificate[]
): Promise<{
  isValid: boolean;
  brokenBlockNumber?: number;
  brokenCertificateId?: string;
  reason?: string;
  checkedBlocks: number;
}> {
  if (!records || records.length === 0) {
    return { isValid: true, checkedBlocks: 0 };
  }

  // Sort chronologically by blockNumber
  const sorted = [...records].sort((a, b) => a.blockNumber - b.blockNumber);

  for (let i = 0; i < sorted.length; i++) {
    const cert = sorted[i];

    // Check link to previous block
    if (i === 0) {
      if (cert.previousRecordHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        return {
          isValid: false,
          brokenBlockNumber: cert.blockNumber,
          brokenCertificateId: cert.id,
          reason: `Genesis block previousRecordHash must be 64 zeros, found: ${cert.previousRecordHash.substring(0, 12)}...`,
          checkedBlocks: i + 1,
        };
      }
    } else {
      const prevCert = sorted[i - 1];
      if (cert.previousRecordHash !== prevCert.recordHash) {
        return {
          isValid: false,
          brokenBlockNumber: cert.blockNumber,
          brokenCertificateId: cert.id,
          reason: `Block #${cert.blockNumber} previous hash does not match Block #${prevCert.blockNumber} record hash. Chain severed!`,
          checkedBlocks: i + 1,
        };
      }
    }

    // Recompute record hash
    const expectedRecordHash = await computeRecordHash({
      blockNumber: cert.blockNumber,
      previousRecordHash: cert.previousRecordHash,
      certificateId: cert.id,
      fileHash: cert.fileHash,
      canonicalDataHash: cert.canonicalDataHash,
      createdAt: cert.createdAt,
    });

    if (expectedRecordHash !== cert.recordHash) {
      return {
        isValid: false,
        brokenBlockNumber: cert.blockNumber,
        brokenCertificateId: cert.id,
        reason: `Cryptographic tamper in Block #${cert.blockNumber} (${cert.id}): computed record hash mismatch!`,
        checkedBlocks: i + 1,
      };
    }
  }

  return {
    isValid: true,
    checkedBlocks: sorted.length,
  };
}

/**
 * Text similarity calculation (0 to 1) for duplicate & near-duplicate detection.
 */
export function calculateTextSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
