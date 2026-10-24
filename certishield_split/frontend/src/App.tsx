import React, { useState, useEffect } from 'react';
import { UserRole, Certificate } from './types';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { VerificationHub } from './components/verifier/VerificationHub';
import { TamperLab } from './components/tamper-lab/TamperLab';
import { SafetyTips } from './components/safety/SafetyTips';
import { InstitutionTrustPage } from './components/trust/InstitutionTrustPage';
import { AuditLogView } from './components/audit/AuditLogView';
import { IssuerStudio } from './components/issuer/IssuerStudio';
import { HolderWallet } from './components/holder/HolderWallet';
import { EmployerBulkVerify } from './components/verifier/EmployerBulkVerify';
import { IssuerDashboard } from './components/analytics/IssuerDashboard';
import { AppPermissionsModal } from './components/privacy/AppPermissionsModal';
import { AIForensicModal } from './components/verifier/AIForensicModal';
import { FraudReportModal } from './components/fraud/FraudReportModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { Language } from './utils/i18n';
import { initializeSeedLedger, getCertificates } from './services/storage';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('VERIFIER');
  const [activeTab, setActiveTab] = useState<string>('verify');
  const [language, setLanguage] = useState<Language>('en');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Modals state
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAiForensicOpen, setIsAiForensicOpen] = useState(false);
  const [isFraudModalOpen, setIsFraudModalOpen] = useState(false);
  const [fraudTargetId, setFraudTargetId] = useState('');

  // Sample cert for Tamper Lab & cross-linking
  const [sampleCert, setSampleCert] = useState<Certificate | null>(null);
  const [targetVerifyId, setTargetVerifyId] = useState<string>('');

  useEffect(() => {
    async function init() {
      const certs = await initializeSeedLedger();
      if (certs.length > 0) {
        setSampleCert(certs[0]);
      }

      // Check URL parameters for direct verification link
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id');
      if (idParam) {
        setTargetVerifyId(idParam);
        setActiveTab('verify');
      }

      // Check onboarding
      const seenOnboarding = localStorage.getItem('certishield_seen_onboarding_v1');
      if (!seenOnboarding && !idParam) {
        setIsOnboardingOpen(true);
        localStorage.setItem('certishield_seen_onboarding_v1', 'true');
      }
    }
    init();
  }, []);

  const handleOpenFraudReport = (certId: string) => {
    setFraudTargetId(certId);
    setIsFraudModalOpen(true);
  };

  const handleNavigateToVerify = (certId?: string) => {
    if (certId) setTargetVerifyId(certId);
    setActiveTab('verify');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-[#0B0510] text-[#F3E8FF]' : 'bg-[#12081C] text-[#F3E8FF]'}`}>
      
      {/* Header */}
      <Header
        activeRole={activeRole}
        onRoleChange={(role) => setActiveRole(role)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        
        {/* Hero Section shown on Verify & Home view */}
        {activeTab === 'verify' && (
          <HeroSection
            onVerifyClick={() => {
              const el = document.getElementById('verification-hub-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onTamperLabClick={() => setActiveTab('tamper-lab')}
            onAiForensicClick={() => setIsAiForensicOpen(true)}
            onSafetyTipsClick={() => setActiveTab('safety-tips')}
            language={language}
          />
        )}

        <div id="verification-hub-anchor">
          {activeTab === 'verify' && (
            <VerificationHub
              onOpenAiForensics={() => setIsAiForensicOpen(true)}
              onReportFraud={handleOpenFraudReport}
              initialCertId={targetVerifyId}
              language={language}
            />
          )}

          {activeTab === 'tamper-lab' && sampleCert && (
            <TamperLab
              sampleCertificate={sampleCert}
              onNavigateToVerify={handleNavigateToVerify}
            />
          )}

          {activeTab === 'safety-tips' && (
            <SafetyTips onVerifyClick={() => setActiveTab('verify')} />
          )}

          {activeTab === 'trust-directory' && (
            <InstitutionTrustPage />
          )}

          {activeTab === 'audit-log' && (
            <AuditLogView />
          )}

          {activeTab === 'issuer' && (
            <IssuerStudio
              onNavigateToVerify={handleNavigateToVerify}
            />
          )}

          {activeTab === 'holder' && (
            <HolderWallet
              onNavigateToVerify={handleNavigateToVerify}
            />
          )}

          {activeTab === 'employer-verify' && (
            <EmployerBulkVerify onInspectResult={handleNavigateToVerify} />
          )}

          {activeTab === 'analytics' && (
            <IssuerDashboard />
          )}
        </div>

      </main>

      {/* Modals */}
      <AppPermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      <AIForensicModal
        isOpen={isAiForensicOpen}
        onClose={() => setIsAiForensicOpen(false)}
        onSelectCertificateForVerify={handleNavigateToVerify}
      />

      <FraudReportModal
        isOpen={isFraudModalOpen}
        onClose={() => setIsFraudModalOpen(false)}
        certificateId={fraudTargetId}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartVerify={() => setActiveTab('verify')}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        activeRole={activeRole}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
      />

      {/* Footer */}
      <Footer
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

    </div>
  );
}
