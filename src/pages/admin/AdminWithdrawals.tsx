import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, ShieldAlert, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { sendNotification } from '../../utils/notifications';

interface WithdrawalItem {
  id: string;
  userEmail: string;
  userName: string;
  amount: number;
  address: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [success, setSuccess] = useState('');

  const loadWithdrawals = () => {
    try {
      const stored = localStorage.getItem('cryptex_withdrawals');
      if (stored) {
        setWithdrawals(JSON.parse(stored));
      } else {
        setWithdrawals([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const stored = localStorage.getItem('cryptex_withdrawals');
      if (!stored) return;
      const all: WithdrawalItem[] = JSON.parse(stored);
      
      let targetUserEmail = '';
      let targetAmount = 0;

      const updated = all.map(w => {
        if (w.id === id) {
          targetUserEmail = w.userEmail;
          targetAmount = w.amount;
          return { ...w, status: action };
        }
        return w;
      });

      localStorage.setItem('cryptex_withdrawals', JSON.stringify(updated));
      setWithdrawals(updated);

      if (targetUserEmail) {
        if (action === 'APPROVED') {
          sendNotification(
            targetUserEmail,
            'Withdrawal Approved',
            `Your withdrawal of $${targetAmount.toLocaleString()} has been approved and sent to your wallet.`,
            'withdrawal'
          );
          setSuccess(`Withdrawal of $${targetAmount} approved and notification sent.`);
        } else {
          sendNotification(
            targetUserEmail,
            'Withdrawal Rejected',
            `Your withdrawal of $${targetAmount.toLocaleString()} was rejected. Please contact support.`,
            'withdrawal'
          );
          setSuccess(`Withdrawal of $${targetAmount} rejected and notification sent.`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-rose-400">Withdrawal Approvals (Dual-Control)</h1>
        <p className="text-xs text-slate-400">High-risk withdrawal review and cryptographic execution workflow</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-black text-white">Withdrawal Requests Queue ({withdrawals.length})</h3>
        
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs">No pending withdrawal requests in queue.</p>
            </div>
          ) : (
            withdrawals.map(w => (
              <div key={w.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-base">${w.amount.toLocaleString()}</h4>
                      <span className="text-xs text-slate-400">({w.userName})</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">Address: {w.address}</p>
                    <span className="text-[10px] text-slate-500">{w.userEmail} • Date: {w.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    w.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {w.status}
                  </span>

                  {w.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(w.id, 'APPROVED')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase hover:bg-emerald-400 transition-colors shadow-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(w.id, 'REJECTED')}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs uppercase hover:bg-rose-500/30 transition-colors border border-rose-500/30"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
