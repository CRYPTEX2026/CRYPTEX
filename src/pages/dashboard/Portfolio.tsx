import React, { useState, useEffect } from 'react';
import { PieChart, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import { InvestmentPosition } from '../../types';

interface PortfolioProps {
  onNavigate: (tab: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onNavigate }) => {
  const [portfolio, setPortfolio] = useState<{
    totalValueUSD: number;
    availableBalanceUSD: number;
    investedAmountUSD: number;
    unrealizedGainUSD: number;
    wallets: any[];
    positions: InvestmentPosition[];
  } | null>(null);
  const [range, setRange] = useState<'24H' | '7D' | '30D' | '90D' | '1Y' | 'All'>('30D');

  useEffect(() => {
    fetch('/api/user/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Portfolio Management</h1>
          <p className="text-xs text-slate-400">Comprehensive digital asset allocation & performance audit</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {(['24H', '7D', '30D', '90D', '1Y', 'All'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Portfolio Value</span>
          <h3 className="text-3xl font-black text-white">
            ${portfolio ? portfolio.totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '124,500.00'}
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">Live Valuation</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Liquid Cash & Tokens</span>
          <h3 className="text-3xl font-black text-white">
            ${portfolio ? portfolio.availableBalanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '65,200.00'}
          </h3>
          <span className="text-xs text-slate-400">Available for withdrawal</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Invested in Vaults</span>
          <h3 className="text-3xl font-black text-white">
            ${portfolio ? portfolio.investedAmountUSD.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '59,300.00'}
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">Earning Variable Yield</span>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-lg font-black text-white">Wallet Balances</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolio?.wallets?.map(w => (
            <div key={w.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-base">{w.currency}</span>
                <span className="text-xs text-emerald-400 font-semibold">{w.network}</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-white">{w.balance} {w.currency}</p>
                <p className="text-xs text-slate-400">Locked: {w.lockedBalance} {w.currency}</p>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onNavigate('wallets')}
                  className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  Deposit
                </button>
                <button
                  onClick={() => onNavigate('wallets')}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Investment Positions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">Active Investment Positions</h3>
          <button
            onClick={() => onNavigate('investments')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Explore More Vaults
          </button>
        </div>

        <div className="space-y-3">
          {portfolio?.positions?.map(pos => (
            <div key={pos.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-bold text-sm">{pos.productName}</h4>
                <p className="text-xs text-slate-400">Started: {new Date(pos.startDate).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Invested</span>
                  <p className="text-white font-bold text-sm">{pos.investedAmount} {pos.asset}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Value</span>
                  <p className="text-emerald-400 font-bold text-sm">{pos.currentValue} {pos.asset}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gain / Loss</span>
                  <p className="text-emerald-400 font-bold text-sm">+{pos.gainLossPercent}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
