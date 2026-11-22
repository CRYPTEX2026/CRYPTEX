import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2, AlertTriangle, Eye, Trash2, Ban, UserCheck, X, PlusCircle } from 'lucide-react';
import { User } from '../../types';
import { sendNotification } from '../../utils/notifications';
import { sendEmailNotification } from '../../utils/email';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [fundModalUser, setFundModalUser] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundAsset, setFundAsset] = useState('USDC');
  const [success, setSuccess] = useState('');

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('cryptex_users');
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        setUsers([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUserAction = (id: string, action: 'approve_account' | 'suspend' | 'block' | 'delete') => {
    try {
      const stored = localStorage.getItem('cryptex_users');
      let currentUsers: User[] = stored ? JSON.parse(stored) : [];

      if (action === 'delete') {
        currentUsers = currentUsers.filter(u => u.id !== id);
      } else {
        currentUsers = currentUsers.map(u => {
          if (u.id === id) {
            return {
              ...u,
              kycStatus: action === 'approve_account' ? 'approved' : action === 'block' ? 'rejected' : 'restricted' as any
            };
          }
          return u;
        });
      }

      localStorage.setItem('cryptex_users', JSON.stringify(currentUsers));
      setUsers(currentUsers);
      setSuccess(`User account action (${action}) completed successfully.`);
      if (selectedUserDetail?.user?.id === id) {
        setSelectedUserDetail(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreditUserFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundModalUser || !fundAmount) return;

    const amt = Number(fundAmount);
    if (amt <= 0) return;

    const userEmail = fundModalUser.email;
    const assetKey = fundAsset.toUpperCase();
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 30);

    const newTx = {
      id: 'tx_' + Date.now(),
      userId: fundModalUser.id,
      userEmail: userEmail,
      type: 'deposit',
      asset: assetKey,
      amount: amt,
      fee: 0,
      netAmount: amt,
      status: 'completed',
      timestamp: now.toISOString(),
      reference: 'Credited directly by Administrator'
    };

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

    try {
      // 1. Update cryptex_users balances
      const storedUsers = localStorage.getItem('cryptex_users');
      let users: any[] = storedUsers ? JSON.parse(storedUsers) : [];
      users = users.map(u => {
        if (u.email.toLowerCase() === userEmail.toLowerCase()) {
          const bals = u.balances || { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 };
          bals[assetKey] = (bals[assetKey] || 0) + amt;
          const updatedUser = {
            ...u,
            balances: bals,
            balance: (u.balance || 0) + amt,
            totalDeposited: (u.totalDeposited || 0) + amt
          };
          const activeUser = localStorage.getItem('cryptex_user');
          if (activeUser) {
            try {
              const parsedActive = JSON.parse(activeUser);
              if (parsedActive.email?.toLowerCase() === userEmail.toLowerCase()) {
                localStorage.setItem('cryptex_user', JSON.stringify(updatedUser));
              }
            } catch (e) {}
          }
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem('cryptex_users', JSON.stringify(users));

      // 2. Update cryptex_transactions & cryptex_transactions_{userEmail}
      const storedTx = localStorage.getItem(`cryptex_transactions_${userEmail}`);
      const txs = storedTx ? JSON.parse(storedTx) : [];
      localStorage.setItem(`cryptex_transactions_${userEmail}`, JSON.stringify([newTx, ...txs]));

      const globalStoredTx = localStorage.getItem('cryptex_transactions');
      const globalTxs = globalStoredTx ? JSON.parse(globalStoredTx) : [];
      localStorage.setItem('cryptex_transactions', JSON.stringify([newTx, ...globalTxs]));

      // 3. Investment position
      localStorage.setItem(`cryptex_investment_${userEmail}`, JSON.stringify(newInvestment));

      sendNotification(
        userEmail,
        'Funds Credited & Dividend Cycle Started',
        `Admin credited ${amt.toLocaleString()} ${assetKey} to your ${assetKey} wallet. Your 30-day 10% ROI dividend cycle has started!`,
        'deposit'
      );

      await sendEmailNotification(
        userEmail,
        `CRYPTEX: ${amt} ${assetKey} Credited & Dividend Cycle Started`,
        `Admin has credited ${amt.toLocaleString()} ${assetKey} to your ${assetKey} wallet. Your 30-day 10% ROI dividend cycle has officially started. Login to view your earnings.`,
        'deposit',
        fundModalUser.fullName
      );

      setSuccess(`Successfully credited ${amt} ${assetKey} to ${fundModalUser.fullName}'s ${assetKey} wallet and started their 30-day dividend cycle.`);
      setFundModalUser(null);
      setFundAmount('');
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckProfile = (id: string) => {
    try {
      const stored = localStorage.getItem('cryptex_users');
      const currentUsers: User[] = stored ? JSON.parse(stored) : [];
      const target = currentUsers.find(u => u.id === id);
      if (target) {
        setSelectedUserDetail({
          user: target,
          wallets: [
            { id: 'w1', currency: 'USDC', balance: 0, network: 'Ethereum' },
            { id: 'w2', currency: 'BTC', balance: 0, network: 'Bitcoin' }
          ],
          positions: []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-rose-400">User Directory & Management</h1>
        <p className="text-xs text-slate-400">Approve, suspend, block, delete, inspect profiles, and credit funds</p>
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

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="p-4 sm:p-6">User</th>
                <th className="p-4 sm:p-6">Role</th>
                <th className="p-4 sm:p-6">Status / KYC</th>
                <th className="p-4 sm:p-6">2FA</th>
                <th className="p-4 sm:p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-6">
                    <div>
                      <p className="text-white font-bold">{u.fullName}</p>
                      <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      u.kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {u.kycStatus}
                    </span>
                  </td>
                  <td className="p-4 sm:p-6 text-emerald-400 font-semibold">
                    {u.mfaEnabled ? 'Enabled' : 'No'}
                  </td>
                  <td className="p-4 sm:p-6 text-right space-x-2">
                    <button
                      onClick={() => setFundModalUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1 inline-flex"
                      title="Add Funds & Start Dividend"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Funds</span>
                    </button>
                    <button
                      onClick={() => handleCheckProfile(u.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleUserAction(u.id, 'approve_account')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUserAction(u.id, 'delete')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Funds Modal */}
      {fundModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreditUserFunds} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-white font-bold text-base">Add Funds to User Dashboard</h3>
                <p className="text-xs text-slate-400">Crediting {fundModalUser.fullName} ({fundModalUser.email})</p>
              </div>
              <button type="button" onClick={() => setFundModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Select Asset</label>
                <select
                  value={fundAsset}
                  onChange={(e) => setFundAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Amount ($ USD equivalent)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <p className="font-bold">Automatic Dividend Cycle:</p>
                <p>Crediting funds will automatically initialize an active 30-day investment vault position yielding a 10% total ROI dividend cycle.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFundModalUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase hover:bg-emerald-400 shadow-lg"
              >
                Credit User & Start Dividend
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Profile Inspection Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setSelectedUserDetail(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xl">
                {selectedUserDetail.user.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{selectedUserDetail.user.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedUserDetail.user.email} • ID: {selectedUserDetail.user.id}</p>
                <span className="text-xs text-emerald-400 font-bold uppercase mt-1 inline-block">KYC: {selectedUserDetail.user.kycStatus}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => handleUserAction(selectedUserDetail.user.id, 'delete')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase hover:bg-rose-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
