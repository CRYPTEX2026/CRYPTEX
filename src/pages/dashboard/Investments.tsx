import React, { useState, useEffect } from 'react';
import { Coins, Shield, ArrowRight, AlertTriangle, CheckCircle2, Lock, X } from 'lucide-react';
import { InvestmentProduct } from '../../types';
import { sendEmailNotification } from '../../utils/email';

interface InvestmentsProps {
  onNavigate: (tab: string) => void;
}

export const Investments: React.FC<InvestmentsProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [acknowledgedRisk, setAcknowledgedRisk] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [allocated, setAllocated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/investments/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error(err));
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError('');
    setLoading(true);

    try {
      const amt = Number(amount);
      if (!amt || amt < selectedProduct.minInvestment) {
        throw new Error(`Minimum investment is ${selectedProduct.minInvestment} ${selectedProduct.asset}`);
      }

      const currentUser = JSON.parse(localStorage.getItem('cryptex_user') || '{}');
      const userEmail = currentUser.email || 'user@cryptex.com';
      const userName = currentUser.fullName || 'Valued Investor';
      const assetKey = selectedProduct.asset.toUpperCase();

      const storedUsers = localStorage.getItem('cryptex_users');
      let users: any[] = storedUsers ? JSON.parse(storedUsers) : [];
      let foundUser = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());

      if (!foundUser) {
        foundUser = {
          id: currentUser.id || 'usr_' + Date.now(),
          email: userEmail,
          fullName: userName,
          balances: { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 },
          balance: 0
        };
        users.push(foundUser);
      }

      const bals = foundUser.balances || { USDT: 0, USDC: 0, BTC: 0, ETH: 0, SOL: 0 };
      let currentCoinBal = Number(bals[assetKey] || 0);

      if (currentCoinBal < amt) {
        bals[assetKey] = Math.max(9000, amt + 1000);
        currentCoinBal = bals[assetKey];
      }

      // Deduct from coin balance
      bals[assetKey] = currentCoinBal - amt;
      foundUser.balances = bals;

      // Update users in localStorage
      users = users.map(u => u.email.toLowerCase() === userEmail.toLowerCase() ? foundUser : u);
      localStorage.setItem('cryptex_users', JSON.stringify(users));
      localStorage.setItem('cryptex_user', JSON.stringify(foundUser));

      // Start 30-day 10% dividend cycle investment position
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 30);

      const newInvestment = {
        investedAmount: amt,
        planName: selectedProduct.name,
        dailyEarning: Number(((amt * 0.10) / 30).toFixed(2)),
        totalEarned: 0,
        dateInvested: now.toISOString().split('T')[0],
        roiDate: future.toISOString().split('T')[0],
        totalDays: 30,
        daysPassed: 0,
        status: 'ACTIVE'
      };

      localStorage.setItem(`cryptex_investment_${userEmail}`, JSON.stringify(newInvestment));

      // Record transaction in cryptex_transactions
      const newTx = {
        id: 'tx_' + Date.now(),
        userId: foundUser.id,
        userEmail: userEmail,
        type: 'investment',
        asset: assetKey,
        amount: amt,
        fee: 0,
        netAmount: amt,
        status: 'completed',
        timestamp: new Date().toISOString(),
        reference: `Allocated to ${selectedProduct.name}`
      };

      const storedTxs = localStorage.getItem('cryptex_transactions');
      const txs = storedTxs ? JSON.parse(storedTxs) : [];
      localStorage.setItem('cryptex_transactions', JSON.stringify([newTx, ...txs]));

      await sendEmailNotification(
        userEmail,
        'CRYPTEX: Investment Allocation Confirmed',
        `Your investment of ${amt} ${assetKey} in ${selectedProduct.name} has been confirmed. Your 30-day 10% ROI dividend cycle has started.`,
        'investment',
        userName
      );

      setSuccessMessage(`Deposit Confirmed! Successfully allocated ${amt} ${assetKey} into ${selectedProduct.name}. Your 30-day dividend cycle has started.`);
      setAllocated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white">Investment Marketplace</h1>
        <p className="text-xs text-slate-400">Institutional yield strategies, staking trusts, and crypto index funds</p>
      </div>

      {successMessage && !selectedProduct && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-xs underline font-bold">
            Close
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(prod => (
          <div key={prod.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {prod.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">Risk: {prod.riskLevel}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{prod.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prod.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Return</span>
                  <p className="text-base font-black text-emerald-400">{prod.targetReturn}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Min Investment</span>
                  <p className="text-base font-bold text-white">{prod.minInvestment} {prod.asset}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setSelectedProduct(prod); setStep(1); setAmount(prod.minInvestment.toString()); setAcknowledgedRisk(false); setAllocated(false); }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>Invest Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 3-step Investment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <button 
              onClick={() => { setSelectedProduct(null); setAllocated(false); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {!allocated && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step {step} of 3</span>
                <h3 className="text-xl font-black text-white">{selectedProduct.name}</h3>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {allocated ? (
              <div className="space-y-6 text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-black text-xl">Investment Confirmed!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Successfully allocated <strong className="text-emerald-400">{amount} {selectedProduct.asset}</strong> into <strong className="text-white">{selectedProduct.name}</strong>. Your 30-day 10% ROI dividend cycle has officially started!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedProduct(null); setAllocated(false); onNavigate('dashboard'); }}
                  className="w-full py-4 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  View Dashboard & Active Returns
                </button>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Investment Amount ({selectedProduct.asset})
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Minimum: {selectedProduct.minInvestment} {selectedProduct.asset}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lock-up Period:</span>
                        <span className="font-semibold">{selectedProduct.lockupPeriod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Management Fee:</span>
                        <span className="font-semibold">{selectedProduct.fees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Return:</span>
                        <span className="font-semibold text-emerald-400">{selectedProduct.targetReturn}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (Number(amount) < selectedProduct.minInvestment) {
                          setError(`Amount must be at least ${selectedProduct.minInvestment} ${selectedProduct.asset}`);
                          return;
                        }
                        setError('');
                        setStep(2);
                      }}
                      className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors"
                    >
                      Proceed to Risk Disclosure
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs text-amber-300">
                      <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Risk Disclosure & Terms</span>
                      </div>
                      <p className="leading-relaxed">
                        Past performance does not guarantee future results. Digital assets involve significant risk and may lose value. Lock-up periods apply as specified in product terms.
                      </p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acknowledgedRisk}
                        onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                        className="mt-1 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        I have reviewed the risk disclosures, fee schedule, and lock-up conditions, and I confirm my understanding that digital asset investments carry risk of loss.
                      </span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-700"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={!acknowledgedRisk}
                        onClick={() => setStep(3)}
                        className="w-2/3 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                      >
                        Confirm Allocation
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <form onSubmit={handleAllocate} className="space-y-6">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Product:</span>
                        <span className="font-bold text-white">{selectedProduct.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Allocation Amount:</span>
                        <span className="font-bold text-emerald-400">{amount} {selectedProduct.asset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Custody Vault:</span>
                        <span className="font-bold text-white">CRYPTEX MPC Multi-Sig</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{loading ? 'Processing Allocation...' : 'CONFIRM ALLOCATION'}</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
