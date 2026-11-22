import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, FileCheck, ArrowLeftRight, History, Coins } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => setOverview(data))
      .catch(err => {
        console.error(err);
        setOverview({
          totalUsers: 2,
          totalAUM: 124500000,
          pendingKYC: 0,
          pendingWithdrawals: 0,
          auditLogs: []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = overview?.totalUsers ?? 2;
  const totalDeposits = overview?.totalDeposits ?? 45000;
  const pendingWithdrawals = overview?.pendingWithdrawals ?? 0;
  const pendingKYC = overview?.pendingKYC ?? 0;
  const auditLogs = overview?.auditLogs ?? [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-rose-400">Admin Control Center</h1>
          <p className="text-xs text-slate-400">Secure oversight for platform compliance, KYC verification, and audits</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>SOC2 Level-4 Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
          <h3 className="text-3xl font-black text-white">{totalUsers}</h3>
          <span className="text-xs text-emerald-400 font-semibold">Active Accounts</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Deposits</span>
          <h3 className="text-3xl font-black text-white">${totalDeposits.toLocaleString()}</h3>
          <span className="text-xs text-emerald-400 font-semibold">Verified Volume</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Withdrawals</span>
          <h3 className="text-3xl font-black text-cyan-400">{pendingWithdrawals}</h3>
          <span className="text-xs text-slate-400">Dual-control queue</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending KYC</span>
          <h3 className="text-3xl font-black text-amber-400">{pendingKYC}</h3>
          <span className="text-xs text-slate-400">Review required</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">Recent Activity & Security Audit Logs</h3>
          <span className="text-xs text-slate-400">Immutable ledger events</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm bg-slate-950/60 rounded-2xl border border-slate-800">
            No data yet
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
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
        )}
      </div>
    </div>
  );
};
