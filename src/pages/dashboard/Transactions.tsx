import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Coins, Search } from 'lucide-react';
import { Transaction } from '../../types';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch('/api/user/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data.transactions || []))
      .catch(err => console.error(err));
  }, []);

  const filtered = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.reference.toLowerCase().includes(search.toLowerCase()) || t.asset.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Transaction Ledger</h1>
          <p className="text-xs text-slate-400">Auditable immutable ledger of deposits, withdrawals, and allocations</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or asset..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'deposit', 'withdrawal', 'investment'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider capitalize transition-all ${
              filter === f ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="p-4 sm:p-6">Type</th>
                <th className="p-4 sm:p-6">Reference</th>
                <th className="p-4 sm:p-6">Asset / Amount</th>
                <th className="p-4 sm:p-6">Fee</th>
                <th className="p-4 sm:p-6">Status</th>
                <th className="p-4 sm:p-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.type === 'withdrawal' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> :
                         tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                      </div>
                      <span className="text-white font-bold capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6">
                    <p className="text-white font-medium text-xs">{tx.reference}</p>
                    {tx.txHash && <span className="text-[10px] text-slate-400 font-mono">Hash: {tx.txHash}</span>}
                  </td>
                  <td className="p-4 sm:p-6 font-mono font-bold text-white">
                    {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount} {tx.asset}
                  </td>
                  <td className="p-4 sm:p-6 font-mono text-slate-400 text-xs">
                    {tx.fee} {tx.asset}
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold">
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 sm:p-6 text-xs text-slate-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
