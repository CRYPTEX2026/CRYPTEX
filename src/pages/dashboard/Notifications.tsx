import React from 'react';
import { Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const notifications = [
    { id: 'not_1', title: 'Monthly Yield Distribution', message: 'Yields for Bitcoin Alpha Yield Vault have been credited to your USDC wallet.', time: '2 hours ago', unread: true },
    { id: 'not_2', title: 'Security Alert: New Session Login', message: 'Successful login detected from Chrome on macOS (IP: 192.168.1.50).', time: '1 day ago', unread: false },
    { id: 'not_3', title: 'KYC Verification Approved', message: 'Your institutional identity verification has been successfully approved.', time: '3 days ago', unread: false }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">Notifications & Alerts</h1>
        <p className="text-xs text-slate-400">Real-time security alerts, yield distributions, and account updates</p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {notifications.map(n => (
          <div key={n.id} className={`p-6 rounded-3xl border transition-all flex items-start gap-4 ${
            n.unread ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-900/40 border-slate-800'
          }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              n.unread ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">{n.title}</h3>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
