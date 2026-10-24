export type Language = 'en' | 'ta' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  verifyNow: string;
  issueCert: string;
  holderWallet: string;
  issuerDashboard: string;
  appPermissions: string;
  safetyTips: string;
  tamperLab: string;
  trustDirectory: string;
  auditLog: string;
  switchRole: string;
  roleIssuer: string;
  roleHolder: string;
  roleVerifier: string;
  scanQr: string;
  uploadDoc: string;
  enterId: string;
  digitalFingerprint: string;
  digitalFingerprintTooltip: string;
  statusVerified: string;
  statusTampered: string;
  statusNotFound: string;
  statusRevoked: string;
  statusExpired: string;
  statusDuplicate: string;
  trustScore: string;
  verificationReceipt: string;
  downloadReceipt: string;
  reportFraud: string;
  aiForensics: string;
  advisoryOnly: string;
  privacyNotice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'CertiShield',
    tagline: 'Verify. Trust. Protect.',
    verifyNow: 'Verify Now',
    issueCert: 'Issue Certificate',
    holderWallet: 'Holder Wallet',
    issuerDashboard: 'Issuer Console',
    appPermissions: 'App Permissions',
    safetyTips: 'Safety Tips',
    tamperLab: 'Tamper Lab',
    trustDirectory: 'Trust Directory',
    auditLog: 'Audit Log',
    switchRole: 'Active Role',
    roleIssuer: 'Issuer (Institution)',
    roleHolder: 'Holder (Student)',
    roleVerifier: 'Verifier (Employer)',
    scanQr: 'Scan QR Code',
    uploadDoc: 'Upload Document',
    enterId: 'Enter Certificate ID',
    digitalFingerprint: 'Digital Fingerprint',
    digitalFingerprintTooltip: 'A unique cryptographic code (SHA-256) calculated from file data. If even one pixel or letter changes, the code completely changes.',
    statusVerified: 'VERIFIED AUTHENTIC',
    statusTampered: 'TAMPERED DOCUMENT',
    statusNotFound: 'RECORD NOT FOUND',
    statusRevoked: 'CREDENTIAL REVOKED',
    statusExpired: 'CREDENTIAL EXPIRED',
    statusDuplicate: 'DUPLICATE ALERT',
    trustScore: 'Trust Score',
    verificationReceipt: 'Verification Receipt',
    downloadReceipt: 'Download Receipt (PDF)',
    reportFraud: 'Report Suspected Fraud',
    aiForensics: 'AI Forensic Scan',
    advisoryOnly: 'AI findings are advisory intelligence. The cryptographic registry hash is the source of truth.',
    privacyNotice: 'Privacy-First: Files are hashed locally on your device. Only SHA-256 fingerprints are checked.',
  },
  ta: {
    appName: 'செர்டிஷீல்டு',
    tagline: 'சரிபார். நம்பு. பாதுகா.',
    verifyNow: 'இப்போதே சரிபார்க்கவும்',
    issueCert: 'சான்றிதழ் வழங்குக',
    holderWallet: 'சான்றிதழ் பை',
    issuerDashboard: 'வழங்குநர் கன்சோல்',
    appPermissions: 'பயன்பாட்டு அனுமதிகள்',
    safetyTips: 'பாதுகாப்பு குறிப்புகள்',
    tamperLab: 'டேம்பர் லேப்',
    trustDirectory: 'நம்பகத்தன்மை அடைவு',
    auditLog: 'தணிக்கை பதிவு',
    switchRole: 'செயலில் உள்ள பங்கு',
    roleIssuer: 'வழங்குநர் (பல்கலைக்கழகம்)',
    roleHolder: 'வைத்திருப்பவர் (மாணவர்)',
    roleVerifier: 'சரிபார்ப்பவர் (நிறுவனம்)',
    scanQr: 'QR குறியீட்டை ஸ்கேன் செய்க',
    uploadDoc: 'ஆவணத்தைப் பதிவேற்றவும்',
    enterId: 'சான்றிதழ் எண் உள்ளிடவும்',
    digitalFingerprint: 'டிஜிட்டல் கைரேகை',
    digitalFingerprintTooltip: 'கோப்புத் தரவிலிருந்து கணக்கிடப்படும் தனித்துவமான குறியீடு. ஒரு எழுத்து மாறினாலும் இந்த குறியீடு முற்றிலும் மாறும்.',
    statusVerified: 'உண்மையானது என சரிபார்க்கப்பட்டது',
    statusTampered: 'மாற்றியமைக்கப்பட்ட ஆவணம்',
    statusNotFound: 'பதிவு கிடைக்கவில்லை',
    statusRevoked: 'சான்றிதழ் ரத்து செய்யப்பட்டுள்ளது',
    statusExpired: 'காலாவதியான சான்றிதழ்',
    statusDuplicate: 'போலி / நகல் எச்சரிக்கை',
    trustScore: 'நம்பகத்தன்மை மதிப்பெண்',
    verificationReceipt: 'சரிபார்ப்பு ரசீது',
    downloadReceipt: 'ரசீதைப் பதிவிறக்குக (PDF)',
    reportFraud: 'மோசடியைப் புகாரளிக்கவும்',
    aiForensics: 'AI தடயவியல் ஸ்கேன்',
    advisoryOnly: 'AI கண்டுபிடிப்புகள் ஆலோசனை தகவல்கள் மட்டுமே. கிரிப்டோகிராஃபிக் ஹாஷ் அதிகாரப்பூர்வ உண்மை.',
    privacyNotice: 'தனியுரிமை முன்னுரிமை: கோப்புகள் உங்கள் சாதனத்திலேயே பகுப்பாய்வு செய்யப்படுகின்றன.',
  },
  hi: {
    appName: 'सर्टिशील्ड',
    tagline: 'सत्यापित करें. विश्वास करें. सुरक्षित रहें.',
    verifyNow: 'अभी सत्यापित करें',
    issueCert: 'प्रमाणपत्र जारी करें',
    holderWallet: 'प्रमाणपत्र वॉलेट',
    issuerDashboard: 'जारीकर्ता कंसोल',
    appPermissions: 'ऐप अनुमतियां',
    safetyTips: 'सुरक्षा सुझाव',
    tamperLab: 'टैम्पर लैब',
    trustDirectory: 'विश्वसनीय संस्थान सूची',
    auditLog: 'ऑडिट लॉग',
    switchRole: 'सक्रिय भूमिका',
    roleIssuer: 'जारीकर्ता (विश्वविद्यालय)',
    roleHolder: 'धारक (छात्र)',
    roleVerifier: 'सत्यापनकर्ता (नियोक्ता)',
    scanQr: 'QR कोड स्कैन करें',
    uploadDoc: 'दस्तावेज़ अपलोड करें',
    enterId: 'प्रमाणपत्र आईडी दर्ज करें',
    digitalFingerprint: 'डिजिटल फिंगरप्रिंट',
    digitalFingerprintTooltip: 'दस्तावेज़ के डेटा से बना एक अद्वितीय कोड। एक भी अक्षर बदलने पर यह कोड पूरी तरह बदल जाता है।',
    statusVerified: 'सत्यापित असली',
    statusTampered: 'छेड़छाड़ किया गया दस्तावेज़',
    statusNotFound: 'रिकॉर्ड नहीं मिला',
    statusRevoked: 'प्रमाणपत्र रद्द कर दिया गया',
    statusExpired: 'प्रमाणपत्र समाप्त हो चुका है',
    statusDuplicate: 'डुप्लीकेट / धोखाधड़ी चेतावनी',
    trustScore: 'विश्वसनीयता स्कोर',
    verificationReceipt: 'सत्यापन रसीद',
    downloadReceipt: 'रसीद डाउनलोड करें (PDF)',
    reportFraud: 'धोखाधड़ी की रिपोर्ट करें',
    aiForensics: 'AI फोरेंसिक विश्लेषण',
    advisoryOnly: 'AI परिणाम केवल परामर्श हेतु हैं। लेज़र का डिजिटल फिंगरप्रिंट ही अंतिम सत्य है।',
    privacyNotice: 'गोपनीयता सर्वोपरि: दस्तावेज़ केवल आपके डिवाइस पर ही संसाधित होते हैं।',
  },
};
