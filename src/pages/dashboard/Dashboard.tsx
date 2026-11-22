import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SupportChat } from '../../components/SupportChat';
import { NotificationBell } from '../../components/NotificationBell';
import { sendNotification } from '../../utils/notifications';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

interface InvestmentInfo {
  investedAmount: number;
  planName: string;
  dailyEarning: number;
  totalEarned: number;
  dateInvested: string;
  roiDate: string;
  totalDays: number;
  daysPassed: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
}

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  asset: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'completed' | 'pending' | 'failed';
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const userEmail = user?.email || 'user@cryptex.com';

  const [investment, setInvestment] = useState<InvestmentInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');

  useEffect(() => {
    try {
      const storedTx = localStorage.getItem(`cryptex_transactions_${userEmail}`);
      const globalStoredTx = localStorage.getItem('cryptex_transactions');
      
      let userTxs: TransactionItem[] = [];
      if (storedTx) {
        userTxs = JSON.parse(storedTx);
      }
      if (globalStoredTx) {
        const globalParsed = JSON.parse(globalStoredTx);
        const myGlobal = globalParsed.filter((t: any) => t.userEmail?.toLowerCase() === userEmail.toLowerCase() || t.userId === user?.id);
        myGlobal.forEach((gt: any) => {
          if (!userTxs.some(t => t.id === gt.id)) {
            userTxs.push({
              id: gt.id,
              type: gt.type ? gt.type.charAt(0).toUpperCase() + gt.type.slice(1) : 'Deposit',
              amount: gt.amount,
              asset: gt.asset || 'USDC',
              date: new Date(gt.timestamp || Date.now()).toISOString().split('T')[0],
              status: gt.status || 'completed'
            });
          }
        });
      }

      const storedInv = localStorage.getItem(`cryptex_investment_${userEmail}`);
      if (storedInv) {
        setInvestment(JSON.parse(storedInv));
      } else {
        // Auto-initialize active investment if user has funds or investments so dashboard always displays investment info
        const storedUsers = localStorage.getItem('cryptex_users');
        const users: any[] = storedUsers ? JSON.parse(storedUsers) : [];
        const u = users.find(x => x.email.toLowerCase() === userEmail.toLowerCase());
        const totalUserBal = (u?.balance || 0) + Object.values(u?.balances || {}).reduce((acc: any, val: any) => acc + Number(val || 0), 0);

        if (totalUserBal > 0 || userTxs.length > 0) {
          const invAmt = totalUserBal > 0 ? totalUserBal : 15000;
          const now = new Date();
          const future = new Date();
          future.setDate(now.getDate() + 30);
          const defaultInv: InvestmentInfo = {
            investedAmount: invAmt,
            planName: '30-Day Staking Vault (10% Dividend)',
            dailyEarning: Number(((invAmt * 0.10) / 30).toFixed(2)),
            totalEarned: Number((invAmt * 0.035).toFixed(2)),
            dateInvested: new Date(Date.now() - 86400000 * 11).toISOString().split('T')[0],
            roiDate: future.toISOString().split('T')[0],
            totalDays: 30,
            daysPassed: 11,
            status: 'ACTIVE'
          };
          localStorage.setItem(`cryptex_investment_${userEmail}`, JSON.stringify(defaultInv));
          setInvestment(defaultInv);
        } else {
          setInvestment(null);
        }
      }

      const storedWithdrawals = localStorage.getItem('cryptex_withdrawals');
      if (storedWithdrawals) {
        const allW = JSON.parse(storedWithdrawals);
        const myW = allW.filter((w: any) => w.userEmail === userEmail);
        myW.forEach((w: any) => {
          if (!userTxs.some(t => t.id === w.id)) {
            userTxs.push({
              id: w.id || String(Date.now()),
              type: 'Withdrawal',
              amount: w.amount,
              asset: w.coin || 'USD',
              date: w.date || new Date().toISOString().split('T')[0],
              status: w.status || 'PENDING'
            });
          }
        });
      }

      setTransactions(userTxs);
    } catch (e) {
      console.error(e);
      setInvestment(null);
      setTransactions([]);
    }
  }, [userEmail]);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || !withdrawAddress.trim()) {
      setWithdrawMessage('Please enter a valid amount and wallet address.');
      return;
    }

    const newWithdrawal = {
      id: Date.now().toString(),
      userEmail: userEmail,
      userName: user?.fullName || 'Investor',
      amount: amt,
      address: withdrawAddress.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };

    try {
      const stored = localStorage.getItem('cryptex_withdrawals');
      const allW = stored ? JSON.parse(stored) : [];
      localStorage.setItem('cryptex_withdrawals', JSON.stringify([newWithdrawal, ...allW]));

      sendNotification(
        userEmail,
        'Withdrawal Request Sent',
        `Your withdrawal of $${amt.toLocaleString()} is pending admin approval.`,
        'withdrawal'
      );

      setTransactions(prev => [
        {
          id: newWithdrawal.id,
          type: 'Withdrawal',
          amount: amt,
          asset: 'USD',
          date: newWithdrawal.date,
          status: 'PENDING'
        },
        ...prev
      ]);

      setWithdrawMessage('Withdrawal request sent - Pending Admin Approval');
      setWithdrawAmount('');
      setWithdrawAddress('');
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawMessage('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setWithdrawMessage('Failed to submit withdrawal request.');
    }
  };

  const progressPercent = investment ? Math.min(100, Math.round((investment.daysPassed / investment.totalDays) * 100)) : 0;
  const daysLeft = investment ? Math.max(0, investment.totalDays - investment.daysPassed) : 0;

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F0B90B]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F0B90B]">Investor Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B]"></span>
            <span className="text-xs text-slate-400">Secure MPC Custody</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {user?.fullName || 'Investor'}</h1>
          <p className="text-slate-400 text-sm">Monitor your active digital asset allocations and returns in real-time.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <NotificationBell />
        </div>
      </div>

      {/* TOP CARD - My Investment (Invested Amount, Investment Cycle, Daily Accumulated Dividend) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">My Active Investment</h3>
                {investment && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    investment.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {investment.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{investment ? investment.planName : 'No Active Plan'} (30-Day Yield Cycle)</p>
            </div>
          </div>

          {investment && (
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-6 py-3.5 rounded-xl bg-[#F0B90B] text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-[#d9a50a] transition-all shadow-lg shadow-[#F0B90B]/20 flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>Request Withdrawal</span>
            </button>
          )}
        </div>

        {investment ? (
          <div className="space-y-6">
            {/* Main Stats Grid: Invested Amount, Daily Earning, Total Earned So Far, ROI Maturity Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Invested Amount</span>
                <h4 className="text-2xl font-black text-white">${investment.investedAmount.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-500">Date Invested: {investment.dateInvested}</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Daily Accumulated Dividend</span>
                <h4 className="text-2xl font-black text-emerald-400">+${investment.dailyEarning.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ day</span></h4>
                <p className="text-[10px] text-slate-500">Accruing daily yields (10% cycle)</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Earned So Far</span>
                <h4 className="text-2xl font-black text-emerald-400">+${investment.totalEarned.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-500">Credited to Vault</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-[#F0B90B]/30 space-y-1 bg-gradient-to-br from-slate-950 to-[#F0B90B]/5">
                <span className="text-[11px] font-bold text-[#F0B90B] uppercase tracking-wider">Investment Cycle (ROI)</span>
                <h4 className="text-xl font-black text-white">{investment.roiDate}</h4>
                <p className="text-[11px] font-bold text-[#F0B90B]">{daysLeft} days left ({investment.totalDays} Days Cycle)</p>
              </div>
            </div>

            {/* Investment Progress Bar */}
            <div className="space-y-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Investment Cycle Progress ({progressPercent}%)</span>
                <span className="text-slate-400">{investment.daysPassed} of {investment.totalDays} days passed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#F0B90B] transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-base">No Active Investment</h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">Deploy funds into institutional crypto staking and yield vaults to start earning daily returns.</p>
            </div>
            <button
              onClick={() => onNavigate('investments')}
              className="px-6 py-3 rounded-xl bg-[#F0B90B] text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#d9a50a] transition-all shadow-lg"
            >
              Invest Now
            </button>
          </div>
        )}
      </div>

      {/* MY TRANSACTIONS WITH DROPDOWN ARROW */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div 
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setShowAllTransactions(!showAllTransactions)}
        >
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>My Transactions History</span>
            </h3>
            <p className="text-xs text-slate-400">Ledger history of deposits, investments, earnings, and withdrawals (Click arrow to expand/collapse)</p>
          </div>
          <button
            type="button"
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors shadow-lg border border-slate-700"
            onClick={(e) => {
              e.stopPropagation();
              setShowAllTransactions(!showAllTransactions);
            }}
            title="Toggle transaction history view"
          >
            <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showAllTransactions ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`divide-y divide-slate-800/80 transition-all duration-300 overflow-hidden ${showAllTransactions ? 'max-h-[1200px]' : 'max-h-[260px]'}`}>
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded yet.</p>
          ) : (
            transactions.map(tx => {
              const isPositive = tx.type === 'Deposit' || tx.type === 'Daily Earning' || tx.type === 'deposit';
              return (
                <div key={tx.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h5 className="text-white font-bold text-sm">{tx.type}</h5>
                      <span className="text-[11px] text-slate-400">{tx.asset} • {tx.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${isPositive ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {isPositive ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      tx.status === 'COMPLETED' || tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      tx.status === 'PENDING' || tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-black text-base">Request Withdrawal</h3>
                  <p className="text-xs text-slate-400">Transfer funds to external Bitcoin / Crypto address</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {withdrawMessage && (
                <div className={`p-4 rounded-xl text-xs font-bold border ${
                  withdrawMessage.includes('sent') 
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}>
                  {withdrawMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Withdrawal Amount (USD)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F0B90B] transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Destination Wallet Address (BTC / USDT)</label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="e.g. bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F0B90B] transition-colors font-mono text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#F0B90B] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#d9a50a] transition-all shadow-xl shadow-[#F0B90B]/20"
              >
                Confirm Withdrawal Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Support Button + Chat Popup */}
      <SupportChat />
    </div>
  );
};
