import React, { useState } from 'react';
import { X, ShieldCheck, Camera, Mic, MapPin, Users, MessageSquare, Image as ImageIcon, AlertOctagon, CheckCircle2, Lock } from 'lucide-react';

interface AppPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppPermissionsModal: React.FC<AppPermissionsModalProps> = ({ isOpen, onClose }) => {
  const [cameraAllowed, setCameraAllowed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#180824] via-[#12051B] to-[#0A030E] border border-[#FF2E88]/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,46,136,0.35)] text-white space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF6FB5] hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2E88]/30 to-[#7B2CBF]/40 border border-[#FF2E88] shadow-[0_0_20px_rgba(255,46,136,0.5)] mx-auto">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            Privacy & App Permissions
          </h2>
          <p className="text-xs text-[#D8B4FE]/80 font-mono">
            Zero-Trust Permission Policy • Inspired by Offensium Vault Principles
          </p>
        </div>

        {/* Smartphone-Styled "App Permissions" Panel (Matching the reference poster!) */}
        <div className="relative mx-auto max-w-md rounded-[28px] p-1 bg-gradient-to-b from-[#FF2E88]/40 to-[#7B2CBF]/30 shadow-[0_0_25px_rgba(255,46,136,0.25)]">
          <div className="bg-[#12051B] rounded-[26px] p-5 border border-white/10 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white tracking-wide">
                CertiShield Permissions
              </span>
              <span className="text-[11px] font-mono text-[#34D399] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Minimum Access Enforced
              </span>
            </div>

            {/* Permission item: Camera (Only one genuinely needed, on-demand for QR) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-[#34D399]/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#34D399]/20 text-[#34D399]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Camera Access</div>
                  <div className="text-[10px] text-[#A7F3D0]">Used exclusively for live QR code scanning on demand</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cameraAllowed}
                  onChange={(e) => setCameraAllowed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34D399]"></div>
              </label>
            </div>

            {/* Permission item: Contacts (Blocked) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-red-500/30 opacity-75">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-300">Contacts & Address Book</div>
                  <div className="text-[10px] text-red-300/80">Never Requested • Zero Need</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/50 text-red-400">
                BLOCKED 🚫
              </span>
            </div>

            {/* Permission item: Location (Blocked) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-red-500/30 opacity-75">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-300">Precise GPS Location</div>
                  <div className="text-[10px] text-red-300/80">Never Requested • Anonymous Verifications</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/50 text-red-400">
                BLOCKED 🚫
              </span>
            </div>

            {/* Permission item: Microphone (Blocked) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-red-500/30 opacity-75">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-300">Microphone & Audio Record</div>
                  <div className="text-[10px] text-red-300/80">Never Requested • Full Privacy</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/50 text-red-400">
                BLOCKED 🚫
              </span>
            </div>

            {/* Permission item: Messages (Blocked) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-red-500/30 opacity-75">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-300">SMS & Private Messages</div>
                  <div className="text-[10px] text-red-300/80">Never Requested</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/50 text-red-400">
                BLOCKED 🚫
              </span>
            </div>

          </div>
        </div>

        {/* Lower Callout Plaque (Exact Poster replica!) */}
        <div className="rounded-2xl border border-[#FF2E88]/40 bg-gradient-to-r from-[#200A2C] via-[#16061F] to-[#200A2C] p-5 shadow-[inset_0_0_20px_rgba(255,46,136,0.15)] space-y-3">
          <div className="text-center font-heading font-extrabold text-lg tracking-wider text-[#FF6FB5]">
            3. QUESTION THE PERMISSIONS
          </div>
          <div className="text-center text-xs font-mono text-[#E9D5FF]/90">
            Ask yourself: Does this app really need this access?
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="space-y-1.5 font-mono">
              <div className="flex items-center gap-2 text-red-400">
                <span>🚩</span> <span>Torch → Contacts</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span>🚩</span> <span>Calculator → Messages</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span>🚩</span> <span>Wallpaper app → Microphone</span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center sm:items-end text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
              <div className="font-heading font-bold text-sm text-white">
                Too much access?
              </div>
              <div className="font-heading font-extrabold text-base text-[#FF2E88] drop-shadow-[0_0_10px_rgba(255,46,136,0.6)]">
                Walk away.
              </div>
            </div>
          </div>
        </div>

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#FF6FB5] text-white font-semibold text-sm shadow-[0_0_20px_rgba(255,46,136,0.5)] hover:shadow-[0_0_30px_rgba(255,46,136,0.8)] transition-all"
        >
          Understood • Close Permissions Panel
        </button>

      </div>
    </div>
  );
};
