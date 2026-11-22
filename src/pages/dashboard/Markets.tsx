import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Sparkles, ArrowRight } from 'lucide-react';
import { Asset } from '../../types';

interface MarketsProps {
  onNavigate: (tab: string) => void;
}

export const Markets: React.FC<MarketsProps> = ({ onNavigate }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/markets')
      .then(res => res.json())
      .then(data => setAssets(data.assets || []))
      .catch(err => console.error(err));
  }, []);

  const categories = ['All', 'Layer 1', 'DeFi', 'AI & Data', 'Stablecoin'];

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Markets & Supported Assets</h1>
          <p className="text-xs text-slate-400">Real-time prices, volume, and custody network availability</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol or asset..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Assets Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="p-4 sm:p-6">Asset</th>
                <th className="p-4 sm:p-6">Category</th>
                <th className="p-4 sm:p-6 text-right">Price (USD)</th>
                <th className="p-4 sm:p-6 text-right">24h Change</th>
                <th className="p-4 sm:p-6 text-right">24h Volume</th>
                <th className="p-4 sm:p-6 text-center">Networks</th>
                <th className="p-4 sm:p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filteredAssets.map(asset => (
                <tr key={asset.symbol} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {asset.symbol}
                      </div>
                      <div>
                        <p className="text-white font-bold">{asset.name}</p>
                        <span className="text-xs text-slate-400 font-mono">{asset.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 sm:p-6">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                      {asset.category}
                    </span>
                  </td>
                  <td className="p-4 sm:p-6 text-right font-mono font-bold text-white">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`p-4 sm:p-6 text-right font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </td>
                  <td className="p-4 sm:p-6 text-right font-mono text-slate-300">
                    ${(asset.volume24h / 1e9).toFixed(2)}B
                  </td>
                  <td className="p-4 sm:p-6 text-center">
                    <span className="text-xs text-slate-400">{asset.networks.length} supported</span>
                  </td>
                  <td className="p-4 sm:p-6 text-right">
                    <button
                      onClick={() => onNavigate('wallets')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Deposit / Trade
                    </button>
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
