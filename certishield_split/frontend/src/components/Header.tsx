import React from 'react';
import { Shield, ShieldAlert, Award, UserCheck, Smartphone, Lightbulb, Compass, Database, Globe, Moon, Sun, Lock } from 'lucide-react';
import { UserRole } from '../types';
import { Language, translations } from '../utils/i18n';

interface HeaderProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenPermissions: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onRoleChange,
  activeTab,
  onTabChange,
  language,
  onLanguageChange,
  onOpenPermissions,
  isDark,
  onToggleTheme,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0510]/85 border-b border-[#FF2E88]/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onTabChange('verify')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1A0A1F] to-[#2D0B38] border border-[#FF2E88]/60 shadow-[0_0_15px_rgba(255,46,136,0.4)] group-hover:shadow-[0_0_25px_rgba(255,46,136,0.7)] transition-all">
              <Shield className="w-6 h-6 text-[#FF2E88]" />
              <Lock className="w-2.5 h-2.5 text-white absolute bottom-2" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-[#FF6FB5] to-[#FF2E88] bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#FF2E88]/20 border border-[#FF2E88]/40 text-[#FF6FB5]">
                  v2.4 Live
                </span>
              </div>
              <p className="text-[11px] text-[#C4B5FD] hidden sm:block font-mono tracking-wide">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Role Switcher Pill - Instant 1-Click Demo */}
          <div className="flex items-center bg-[#150722] border border-[#FF2E88]/40 rounded-full p-1 shadow-inner">
            <button
              onClick={() => {
                onRoleChange('VERIFIER');
                onTabChange('verify');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeRole === 'VERIFIER'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white shadow-[0_0_12px_rgba(255,46,136,0.6)]'
                  : 'text-[#D8B4FE] hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Verifier</span>
              <span className="md:hidden">Verify</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('HOLDER');
                onTabChange('holder');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeRole === 'HOLDER'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white shadow-[0_0_12px_rgba(255,46,136,0.6)]'
                  : 'text-[#D8B4FE] hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Holder</span>
              <span className="md:hidden">Wallet</span>
            </button>

            <button
              onClick={() => {
                onRoleChange('ISSUER');
                onTabChange('issuer');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeRole === 'ISSUER'
                  ? 'bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white shadow-[0_0_12px_rgba(255,46,136,0.6)]'
                  : 'text-[#D8B4FE] hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Issuer</span>
              <span className="md:hidden">Issue</span>
            </button>
          </div>

          {/* Quick Actions & Extras */}
          <div className="flex items-center gap-2">
            
            {/* App Permissions Modal Button (Styled after the poster!) */}
            <button
              onClick={onOpenPermissions}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1A0A26] border border-[#FF2E88]/40 hover:border-[#FF2E88] text-xs text-[#FF6FB5] hover:text-white shadow-[0_0_10px_rgba(255,46,136,0.15)] transition-all"
              title="Inspect App Permissions (Privacy-First)"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF2E88]" />
              <span className="hidden lg:inline font-mono">Permissions</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#150722] border border-[#7B2CBF]/50 rounded-xl px-1.5 py-1">
              <Globe className="w-3.5 h-3.5 text-[#FF6FB5] mr-1 hidden sm:inline" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-transparent text-xs text-[#E9D5FF] outline-none font-medium cursor-pointer"
                aria-label="Select Language"
              >
                <option value="en" className="bg-[#14081F] text-white">EN</option>
                <option value="ta" className="bg-[#14081F] text-white">தமிழ்</option>
                <option value="hi" className="bg-[#14081F] text-white">हिन्दी</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-[#1A0A26] border border-[#FF2E88]/30 hover:border-[#FF2E88] text-[#FF6FB5] hover:text-white transition-all"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Sub-nav Links for Desktop */}
        <div className="hidden md:flex items-center gap-6 py-2 border-t border-[#FF2E88]/15 text-xs text-[#C4B5FD] font-mono">
          <button
            onClick={() => onTabChange('verify')}
            className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
              activeTab === 'verify' ? 'text-[#FF2E88] font-bold' : ''
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Verify Portal
          </button>

          <button
            onClick={() => onTabChange('tamper-lab')}
            className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
              activeTab === 'tamper-lab' ? 'text-[#FF2E88] font-bold' : ''
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Tamper Lab
          </button>

          <button
            onClick={() => onTabChange('safety-tips')}
            className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
              activeTab === 'safety-tips' ? 'text-[#FF2E88] font-bold' : ''
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Safety Tips (Poster)
          </button>

          <button
            onClick={() => onTabChange('trust-directory')}
            className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
              activeTab === 'trust-directory' ? 'text-[#FF2E88] font-bold' : ''
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Trust Directory
          </button>

          <button
            onClick={() => onTabChange('audit-log')}
            className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
              activeTab === 'audit-log' ? 'text-[#FF2E88] font-bold' : ''
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Immutable Audit Log
          </button>

          {activeRole === 'ISSUER' && (
            <button
              onClick={() => onTabChange('issuer')}
              className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
                activeTab === 'issuer' ? 'text-[#FF2E88] font-bold' : ''
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Issuer Console
            </button>
          )}

          {activeRole === 'HOLDER' && (
            <button
              onClick={() => onTabChange('holder')}
              className={`transition-colors hover:text-[#FF6FB5] flex items-center gap-1.5 ${
                activeTab === 'holder' ? 'text-[#FF2E88] font-bold' : ''
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              My Certificates
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
