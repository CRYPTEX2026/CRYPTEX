import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, CheckCircle2, ShieldCheck, Clock, X, Eye } from 'lucide-react';
import { sendNotification } from '../../utils/notifications';
import { sendEmailNotification } from '../../utils/email';

export const AdminDeposits: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [success, setSuccess] = useState('');
  const [proofModalUrl, setProofModalUrl] = useState<string | null>(null);

  const loadDeposits = () => {
    try {
      const stored = localStorage.getItem('cryptex_deposits');
      const allDeps = stored ? JSON.parse(stored) : [];
      setDeposits(allDeps);
    } catch (err) {
      console.error(err);
      setDeposits([]);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleApproveDeposit = async (dep: any) => {
    try {
      const userEmail = dep.userEmail;
      const amt = Number(dep.amount);
      const coin = (dep.coin || 'USDC').toUpperCase();

      // 1. Update deposit status in 'cryptex_deposits'
      const storedDeps = localStorage.getItem('cryptex_deposits');
      let allDeps: any[] = storedDeps ? JSON.parse(storedDeps) : [];
      allDeps = allDeps.map(d => d.id === dep.id ? { ...d, status: 'APPROVED' } : d);
      localStorage.setItem('cryptex_deposits', JSON.stringify(allDeps));

      // 2. Update transaction in 'cryptex_transactions'
      const storedTxs = localStorage.getItem('cryptex_transactions');
      let allTxs: any[] = storedTxs ? JSON.parse(storedTxs) : [];
      allTxs = allTxs.map(t => t.id === dep.id ? { ...t, status: 'completed' } : t);
      localStorage.setItem('cryptex_transactions', JSON.stringify(allTxs));

      // 3. Add amount to user's correct coin balance in 'cryptex_users'
      const storedUsers = localStorage.getItem('cryptex_users');
      let users: any[] = storedUsers ? JSON.parse(storedUsers) : [];
      users = users.map(u => {
        if (u.email.toLowerCase() === userEmail.toLowerCase()) {
          const bals = u.balances || { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 };
          bals[coin] = (bals[coin] || 0) + amt;
          return {
            ...u,
            balances: bals,
            balance: (u.balance || 0) + amt,
            totalDeposited: (u.totalDeposited || 0) + amt
          };
        }
        return u;
      });
      localStorage.setItem('cryptex_users', JSON.stringify(users));

      // 4. Start 30-day 10% dividend cycle investment position
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 30);

      const newInvestment = {
        investedAmount: amt,
        planName: '30-Day Staking Vault (10% Dividend)',
        dailyEarning: Number(((amt * 0.10) / 30).toFixed(2)),
        totalEarned: 0,
        dateInvested: now.toISOString().split('T')[0],
        roiDate: future.toISOString().split('T')[0],
        totalDays: 30,
        daysPassed: 0,
        status: 'ACTIVE'
      };

      localStorage.setItem(`cryptex_investment_${userEmail}`, JSON.stringify(newInvestment));

      setSuccess(`Deposit of ${amt} ${coin} for ${userEmail} approved successfully! Credited to ${coin} wallet.`);

      // 5. Notifications & Email
      sendNotification(
        userEmail,
        'Deposit Approved',
        `Your ${coin} deposit of ${amt.toLocaleString()} ${coin} has been approved. Your wallet has been credited and your 30-day 10% dividend cycle has started!`,
        'deposit'
      );

      await sendEmailNotification(
        userEmail,
        `CRYPTEX: Your ${coin} Deposit of ${amt} ${coin} was Approved`,
        `Your deposit of ${amt} ${coin} has been approved. Your ${coin} wallet balance has been updated and your 30-day 10% ROI dividend cycle has officially started.`,
        'deposit',
        dep.userName || 'Investor'
      );

      loadDeposits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectDeposit = async (dep: any) => {
    try {
      const userEmail = dep.userEmail;
      const amt = Number(dep.amount);
      const coin = (dep.coin || 'USDC').toUpperCase();

      // 1. Update deposit status in 'cryptex_deposits'
      const storedDeps = localStorage.getItem('cryptex_deposits');
      let allDeps: any[] = storedDeps ? JSON.parse(storedDeps) : [];
      allDeps = allDeps.map(d => d.id === dep.id ? { ...d, status: 'REJECTED' } : d);
      localStorage.setItem('cryptex_deposits', JSON.stringify(allDeps));

      // 2. Update transaction in 'cryptex_transactions'
      const storedTxs = localStorage.getItem('cryptex_transactions');
      let allTxs: any[] = storedTxs ? JSON.parse(storedTxs) : [];
      allTxs = allTxs.map(t => t.id === dep.id ? { ...t, status: 'failed' } : t);
      localStorage.setItem('cryptex_transactions', JSON.stringify(allTxs));

      setSuccess(`Deposit of ${amt} ${coin} for ${userEmail} rejected.`);

      sendNotification(
        userEmail,
        'Deposit Rejected',
        `Your deposit request of ${amt} ${coin} was rejected by admin.`,
        'deposit'
      );

      await sendEmailNotification(
        userEmail,
        'CRYPTEX: Deposit Rejected',
        `Your deposit request of ${amt} ${coin} was rejected. Please contact support if you have questions.`,
        'deposit',
        dep.userName || 'Investor'
      );

      loadDeposits();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-rose-400">Deposit Management</h1>
        <p className="text-xs text-slate-400">Review pending user deposits, verify coin assets, inspect proof, and approve or reject funding</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-black text-white">Deposit Requests Queue</h3>
        <div className="space-y-4">
          {deposits.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No deposit transactions recorded.</p>
          ) : (
            deposits.map(dep => (
              <div key={dep.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-base">{Number(dep.amount).toLocaleString()} {dep.coin || 'USDC'}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        dep.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        dep.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {dep.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-0.5">{dep.userName} ({dep.userEmail})</p>
                    <p className="text-xs text-slate-400">{dep.method} • <span className="font-mono">{new Date(dep.createdAt || Date.now()).toLocaleString()}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {dep.proof && (
                    <button
                      onClick={() => setProofModalUrl(dep.proof)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Proof</span>
                    </button>
                  )}
                  {dep.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApproveDeposit(dep)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase hover:bg-emerald-400 transition-colors shadow-lg"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDeposit(dep)}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold text-xs uppercase transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proof Modal */}
      {proofModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-white font-bold text-base">Deposit Proof Receipt</h3>
              <button onClick={() => setProofModalUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
              <img src={proofModalUrl} alt="Deposit Proof" className="max-h-[60vh] object-contain rounded-xl" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setProofModalUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
