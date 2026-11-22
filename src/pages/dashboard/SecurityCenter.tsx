import React, { useState } from 'react';
import { ShieldCheck, Lock, Smartphone, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SecurityCenter: React.FC = () => {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(Boolean(user?.mfaEnabled ?? true));
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Security & 2FA Center</h1>
        <p className="text-xs text-slate-400">Manage multi-factor authentication, security keys, and active sessions</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{message}</span>
        </div>
      )}

      {/* 2FA Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-slate-400">Protect account access with TOTP Authenticator apps</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            mfaEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {mfaEnabled ? 'Enabled (Active)' : 'Disabled'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-300">Google Authenticator or compatible TOTP hardware token required for withdrawals.</p>
          <button
            onClick={() => { setMfaEnabled(!mfaEnabled); setMessage('MFA settings updated successfully!'); }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
          >
            {mfaEnabled ? 'Configure 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-black text-white">Active Device Sessions</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Chrome / macOS (Current Session)</p>
                <span className="text-xs text-slate-400">IP: 192.168.1.50 • Verified Device</span>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-bold px-3 py-1 rounded bg-emerald-500/10">Active Now</span>
          </div>
        </div>
      </div>
    </div>
  );
};
