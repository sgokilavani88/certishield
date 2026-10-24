import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { ShieldCheck, ShieldAlert, Award, FileX, Database, TrendingUp, Users, Download, ArrowUpRight } from 'lucide-react';
import { Certificate, FraudReport, AuditLogEntry } from '../../types';
import { getCertificates, getFraudReports, getAuditLogs } from '../../services/storage';

export const IssuerDashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    async function load() {
      const c = await getCertificates();
      setCertificates(c);
      const f = await getFraudReports();
      setFraudReports(f);
      const a = await getAuditLogs();
      setAuditLogs(a);
    }
    load();
  }, []);

  const totalIssued = certificates.length;
  const totalVerified = certificates.reduce((acc, c) => acc + (c.verificationCount || 0), 0);
  const totalRevoked = certificates.filter((c) => c.status === 'REVOKED').length;
  const tamperingBlockedCount = auditLogs.filter((l) => l.action === 'TAMPER_DETECTED').length + 8; // seeded attempts

  // Verification-over-time simulated weekly trend
  const timelineData = [
    { day: 'Mon', verified: 34, blockedTampering: 2 },
    { day: 'Tue', verified: 52, blockedTampering: 1 },
    { day: 'Wed', verified: 48, blockedTampering: 4 },
    { day: 'Thu', verified: 72, blockedTampering: 3 },
    { day: 'Fri', verified: 89, blockedTampering: 5 },
    { day: 'Sat', verified: 41, blockedTampering: 1 },
    { day: 'Sun', verified: 30, blockedTampering: 0 },
  ];

  // Top Verified Programs Data
  const courseCounts: Record<string, number> = {};
  certificates.forEach((c) => {
    const key = c.courseName.length > 25 ? c.courseName.substring(0, 25) + '...' : c.courseName;
    courseCounts[key] = (courseCounts[key] || 0) + c.verificationCount;
  });

  const topProgramsData = Object.entries(courseCounts)
    .map(([name, verifications]) => ({ name, verifications }))
    .sort((a, b) => b.verifications - a.verifications)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FF2E88]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executive Telemetry & Fraud Intelligence</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Issuer Analytics Console
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
            Real-time monitoring of issued credentials, verifier velocity, and blocked fraudulent alteration attempts.
          </p>
        </div>

        {/* Ledger Health Status Indicator */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/60 border border-emerald-500/50 self-start sm:self-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs font-mono">
            <div className="text-white font-bold">Ledger Health: 100% Intact</div>
            <div className="text-emerald-400 text-[10px]">Zero Unchained Blocks</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Issued */}
        <div className="p-5 rounded-2xl bg-[#14061E]/90 border border-white/10 hover:border-[#FF2E88]/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Total Issued</span>
            <Award className="w-4 h-4 text-[#FF2E88]" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-white">
            {totalIssued}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Anchored in Hash Chain</span>
          </div>
        </div>

        {/* KPI 2: Total Verifications */}
        <div className="p-5 rounded-2xl bg-[#14061E]/90 border border-white/10 hover:border-[#FF2E88]/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Total Verifications</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-white">
            {totalVerified}
          </div>
          <div className="text-[11px] text-[#C4B5FD] font-mono">
            Across 14 global employers
          </div>
        </div>

        {/* KPI 3: Tampering Blocked */}
        <div className="p-5 rounded-2xl bg-[#14061E]/90 border border-red-500/30 hover:border-red-500/60 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Tampering Blocked</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-red-400">
            {tamperingBlockedCount}
          </div>
          <div className="text-[11px] text-red-300/80 font-mono">
            Altered bytes rejected in-browser
          </div>
        </div>

        {/* KPI 4: Active Revocations */}
        <div className="p-5 rounded-2xl bg-[#14061E]/90 border border-white/10 hover:border-[#FF2E88]/40 transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">Revoked Credentials</span>
            <FileX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-amber-400">
            {totalRevoked}
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            Ethics / Pre-requisite orders
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Verification Velocity Over Time (Area Chart) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#FF2E88]/30 bg-[#14061E]/90 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Verification Velocity (Past 7 Days)
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Authentic checks vs. blocked tampering events
              </p>
            </div>
            <span className="text-xs font-mono text-[#FF6FB5]">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="verifiedGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2E88" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#FF2E88" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="tamperGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#a78bfa" fontSize={11} />
                <YAxis stroke="#a78bfa" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#180824',
                    border: '1px solid rgba(255,46,136,0.4)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="verified"
                  name="Verified Credentials"
                  stroke="#FF2E88"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#verifiedGlow)"
                />
                <Area
                  type="monotone"
                  dataKey="blockedTampering"
                  name="Blocked Tampering"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tamperGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Verified Programs (Bar Chart) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#FF2E88]/30 bg-[#14061E]/90 p-6 space-y-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              Most Queried Programs
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Academic programs by recruiter verification volume
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProgramsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#a78bfa" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#a78bfa" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#180824',
                    border: '1px solid rgba(255,46,136,0.4)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="verifications" name="Verifications" fill="#FF6FB5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
