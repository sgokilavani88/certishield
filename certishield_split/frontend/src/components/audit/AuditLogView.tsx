import React, { useState, useEffect } from 'react';
import { Database, Filter, Search, ShieldCheck, ShieldAlert, FileText, Download, Lock } from 'lucide-react';
import { AuditLogEntry } from '../../types';
import { getAuditLogs } from '../../services/storage';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const all = await getAuditLogs();
      setLogs(all);
    }
    load();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  const handleExportLogsCsv = () => {
    const headers = 'Timestamp,Action,Actor,Role,Details,TargetID,Location\n';
    const rows = filteredLogs
      .map((l) =>
        [
          l.timestamp,
          l.action,
          `"${l.actor}"`,
          l.role,
          `"${l.details.replace(/"/g, '""')}"`,
          l.targetId || '',
          `"${l.ipOrLocation}"`,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CertiShield_Audit_Trail_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'ISSUE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'TAMPER_DETECTED':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'REVOKE':
        return 'bg-red-950/60 text-red-300 border-red-500/50';
      case 'FRAUD_REPORTED':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'VERIFY':
      default:
        return 'bg-[#FF2E88]/20 text-[#FF6FB5] border-[#FF2E88]/40';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FF2E88]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF6FB5] uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Cryptographic Ledger Trail</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">
            Immutable Activity Audit Log
          </h2>
          <p className="text-xs sm:text-sm text-[#D8B4FE]/80">
            Append-only record of issuance, cryptographic verification requests, revocations, and tampering attempts.
          </p>
        </div>

        <button
          onClick={handleExportLogsCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono text-gray-200 hover:text-white transition-all self-start sm:self-center"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor, certificate ID, or action..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#FF2E88] text-white text-xs outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1A0A26] border border-white/15 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="ISSUE">Issuance</option>
            <option value="VERIFY">Verification</option>
            <option value="TAMPER_DETECTED">Tamper Detected</option>
            <option value="REVOKE">Revocation</option>
            <option value="FRAUD_REPORTED">Fraud Reported</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="rounded-3xl border border-[#FF2E88]/30 bg-[#14061E]/90 p-5 sm:p-6 space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono text-xs">
            No audit log records match the search filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-black/50 border border-white/5 hover:border-white/15 transition-all text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${getActionBadge(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-gray-400 text-[11px]">{log.actor}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-[11px]">{log.ipOrLocation}</span>
                </div>
                <div className="text-gray-200 font-sans text-xs">
                  {log.details}
                </div>
              </div>

              <div className="self-start sm:self-center text-right shrink-0">
                <div className="text-[11px] text-[#D8B4FE]">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-[10px] text-gray-500">
                  {new Date(log.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
