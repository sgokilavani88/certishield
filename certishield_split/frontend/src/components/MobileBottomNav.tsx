import React from 'react';
import { Shield, UserCheck, Award, ShieldAlert, Smartphone } from 'lucide-react';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeRole: UserRole;
  onOpenPermissions: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeRole,
  onOpenPermissions,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0510]/95 backdrop-blur-xl border-t border-[#FF2E88]/30 px-3 py-2 flex items-center justify-around shadow-[0_-5px_25px_rgba(255,46,136,0.2)]">
      
      <button
        onClick={() => onTabChange('verify')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeTab === 'verify' ? 'text-[#FF2E88]' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Shield className="w-5 h-5" />
        <span className="text-[10px] font-mono font-medium">Verify</span>
      </button>

      <button
        onClick={() => onTabChange('tamper-lab')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeTab === 'tamper-lab' ? 'text-[#FF2E88]' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <ShieldAlert className="w-5 h-5" />
        <span className="text-[10px] font-mono font-medium">Tamper Lab</span>
      </button>

      <button
        onClick={() => onTabChange('holder')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeTab === 'holder' ? 'text-[#FF2E88]' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <UserCheck className="w-5 h-5" />
        <span className="text-[10px] font-mono font-medium">Wallet</span>
      </button>

      <button
        onClick={() => onTabChange('issuer')}
        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
          activeTab === 'issuer' ? 'text-[#FF2E88]' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Award className="w-5 h-5" />
        <span className="text-[10px] font-mono font-medium">Issuer</span>
      </button>

      <button
        onClick={onOpenPermissions}
        className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-[#FF6FB5] hover:text-white transition-all"
      >
        <Smartphone className="w-5 h-5" />
        <span className="text-[10px] font-mono font-medium">Privacy</span>
      </button>

    </nav>
  );
};
