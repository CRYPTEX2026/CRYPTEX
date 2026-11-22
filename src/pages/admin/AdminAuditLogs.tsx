import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => setLogs(data.auditLogs || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-rose-400">Security & Audit Logs</h1>
        <p className="text-xs text-slate-400">Cryptographically verifiable event ledger for compliance audits</p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-black text-white">System Audit Trail</h3>
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-400 uppercase">{log.action}</span>
                  <span className="text-slate-500 font-mono">IP: {log.ipAddress}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
              </div>
              <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
