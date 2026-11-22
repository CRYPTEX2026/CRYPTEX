import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Shield, CheckCircle2, AlertTriangle, X, Coins, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sendNotification } from '../../utils/notifications';
import { sendEmailNotification } from '../../utils/email';

interface WalletsProps {
  onNavigate: (tab: string) => void;
}

export const Wallets: React.FC<WalletsProps> = () => {
  const { user } = useAuth();
  const userEmail = user?.email || 'user@cryptex.com';
  const userName = user?.fullName || 'Investor';

  const [wallets, setWallets] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [currency, setCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [network, setNetwork] = useState('Ethereum (ERC-20)');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [companyWallet, setCompanyWallet] = useState<string>('0x71C92A8b29F41bE8e4d22199b08f8c29124a9102');
  const [copied, setCopied] = useState<boolean>(false);

  const loadWalletsData = () => {
    try {
      const storedUsers = localStorage.getItem('cryptex_users');
      const users: any[] = storedUsers ? JSON.parse(storedUsers) : [];
      const currentUser = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      const bals = currentUser?.balances || { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 };

      const userWalletAddr = user?.btcWalletAddress || 'No wallet yet - Deposit to generate';

      setWallets([
        { id: 'wal_usdt', currency: 'USDT', balance: bals.USDT || 0, network: 'Tether (TRC-20 / ERC-20)', address: userWalletAddr },
        { id: 'wal_usdc', currency: 'USDC', balance: bals.USDC || 0, network: 'Ethereum (ERC-20)', address: userWalletAddr },
        { id: 'wal_btc', currency: 'BTC', balance: bals.BTC || 0, network: 'Bitcoin Network', address: userWalletAddr },
        { id: 'wal_eth', currency: 'ETH', balance: bals.ETH || 0, network: 'Ethereum (ERC-20)', address: userWalletAddr },
        { id: 'wal_sol', currency: 'SOL', balance: bals.SOL || 0, network: 'Solana Network', address: userWalletAddr }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWalletsData();
    fetch('/api/platform/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.companyWalletAddress) {
          setCompanyWallet(data.settings.companyWalletAddress);
        }
      })
      .catch(err => console.error(err));
  }, [userEmail]);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(companyWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalBalanceUSD = wallets.reduce((acc, w) => {
    return acc + w.balance;
  }, 0);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) throw new Error('Please enter a valid deposit amount.');

      const coinSelected = currency.toUpperCase();

      const newDeposit = {
        id: 'dep_' + Date.now(),
        userEmail: userEmail,
        userName: userName,
        amount: amt,
        coin: coinSelected,
        method: `Deposit via ${network}`,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      const storedDeps = localStorage.getItem('cryptex_deposits');
      const deposits = storedDeps ? JSON.parse(storedDeps) : [];
      localStorage.setItem('cryptex_deposits', JSON.stringify([newDeposit, ...deposits]));

      const newTx = {
        id: newDeposit.id,
        userId: user?.id || 'usr_demo',
        userEmail: userEmail,
        type: 'deposit',
        asset: coinSelected,
        amount: amt,
        fee: 0,
        netAmount: amt,
        status: 'pending',
        timestamp: newDeposit.createdAt,
        reference: `Deposit ${amt} ${coinSelected} (Pending Admin Approval)`
      };

      const storedTxs = localStorage.getItem('cryptex_transactions');
      const txs = storedTxs ? JSON.parse(storedTxs) : [];
      localStorage.setItem('cryptex_transactions', JSON.stringify([newTx, ...txs]));

      sendNotification(
        userEmail,
        'Deposit Request Sent',
        `Your deposit of ${amt} ${coinSelected} is pending admin approval.`,
        'deposit'
      );
      await sendEmailNotification(
        userEmail,
        'CRYPTEX: Deposit Request Received',
        `Your deposit of ${amt} ${coinSelected} has been received and is pending admin approval.`,
        'deposit',
        userName
      );

      setMessage(`Deposit request of ${amt} ${coinSelected} submitted successfully. Pending Admin Approval.`);
      setActiveModal(null);
      setAmount('');
      loadWalletsData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amt = Number(amount);
      if (!amt || amt <= 0 || !destinationAddress.trim()) {
        throw new Error('Please enter valid amount and destination address.');
      }

      const curKey = currency.toUpperCase();
      const storedUsers = localStorage.getItem('cryptex_users');
      let users: any[] = storedUsers ? JSON.parse(storedUsers) : [];
      let successWithdraw = false;

      users = users.map(u => {
        if (u.email.toLowerCase() === userEmail.toLowerCase()) {
          const bals = u.balances || { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 };
          if ((bals[curKey] || 0) < amt) {
            throw new Error(`Insufficient ${curKey} balance for withdrawal.`);
          }
          bals[curKey] -= amt;
          successWithdraw = true;
          return {
            ...u,
            balances: bals,
            balance: Math.max(0, (u.balance || 0) - amt)
          };
        }
        return u;
      });

      if (!successWithdraw) throw new Error('User account not found.');
      localStorage.setItem('cryptex_users', JSON.stringify(users));

      const newW = {
        id: 'w_' + Date.now(),
        userEmail: userEmail,
        userName: userName,
        coin: curKey,
        amount: amt,
        address: destinationAddress.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      };

      const stored = localStorage.getItem('cryptex_withdrawals');
      const allW = stored ? JSON.parse(stored) : [];
      localStorage.setItem('cryptex_withdrawals', JSON.stringify([newW, ...allW]));

      sendNotification(
        userEmail,
        'Withdrawal Request Sent',
        `Your withdrawal of ${amt} ${curKey} is pending admin approval.`,
        'withdrawal'
      );
      await sendEmailNotification(
        userEmail,
        'CRYPTEX: Withdrawal Request Received',
        `Your withdrawal of ${amt} ${curKey} is pending admin approval.`,
        'withdrawal',
        userName
      );

      setMessage(`Withdrawal request of ${amt} ${curKey} successfully submitted.`);
      setActiveModal(null);
      setAmount('');
      setDestinationAddress('');
      loadWalletsData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Wallets & Vault Infrastructure</h1>
          <p className="text-xs text-slate-400">Secure MPC-backed multi-currency custody wallets</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCurrency('USDT'); setActiveModal('deposit'); setMessage(''); }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit Assets</span>
          </button>
          <button
            onClick={() => { setCurrency('USDT'); setActiveModal('withdraw'); setMessage(''); }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Assets</span>
          </button>
        </div>
      </div>

      {totalBalanceUSD === 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold">Your wallets are empty. Make a deposit to start.</span>
          </div>
          <button
            onClick={() => { setCurrency('USDT'); setActiveModal('deposit'); setMessage(''); }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase hover:bg-amber-400 transition-colors shrink-0"
          >
            Deposit Assets
          </button>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{message}</span>
        </div>
      )}

      {/* Pending Deposits Banner */}
      {(() => {
        try {
          const storedDeps = localStorage.getItem('cryptex_deposits');
          const deps = storedDeps ? JSON.parse(storedDeps) : [];
          const pending = deps.filter((d: any) => d.userEmail?.toLowerCase() === userEmail.toLowerCase() && d.status === 'PENDING');
          if (pending.length === 0) return null;
          return (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider">Pending Deposits Awaiting Admin Approval:</h4>
              {pending.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl">
                  <span>{p.coin || 'USDC'} {Number(p.amount).toLocaleString()} - Pending</span>
                  <span className="font-bold uppercase bg-amber-500/20 px-2.5 py-1 rounded text-amber-400">PENDING</span>
                </div>
              ))}
            </div>
          );
        } catch (e) {
          return null;
        }
      })()}

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((w: any) => (
          <div key={w.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-white">{w.currency}</span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {w.network}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-2xl font-black text-white">{w.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {w.currency}</p>
              <p className="text-xs text-slate-400 font-mono truncate">Addr: {w.address}</p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => { setCurrency(w.currency); setActiveModal('deposit'); setMessage(''); }}
                className="flex-1 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
              >
                Deposit
              </button>
              <button
                onClick={() => { setCurrency(w.currency); setActiveModal('withdraw'); setMessage(''); }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deposit Modal */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-white">Deposit Digital Assets</h3>
              <p className="text-xs text-emerald-400 font-semibold mt-1">You are depositing to your {currency} wallet</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Select Asset</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="USDT">USDT (Tether)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="1000.00"
                />
              </div>

              {/* Company Wallet Address Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Company Deposit Wallet Address</label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-emerald-400 truncate">{companyWallet}</span>
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Please send the exact amount of {currency} to the company wallet address above. After transaction is completed, click <strong>CONFIRM DEPOSIT</strong> below.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'CONFIRM DEPOSIT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-white">Withdraw Digital Assets</h3>
              <p className="text-xs text-amber-400 font-semibold mt-1">You are withdrawing from your {currency} wallet</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Select Asset</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="USDT">USDT (Tether)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="SOL">SOL (Solana)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Destination Address</label>
                <input
                  type="text"
                  required
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="0x71C... or external address"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="500.00"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                <p className="font-bold uppercase tracking-wider">Network Safety Notice:</p>
                <p>Ensure destination supports the selected network. Blockchain transfers are irreversible.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Processing Withdrawal...' : 'Authorize Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
