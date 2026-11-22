import React, { useState, useEffect } from 'react';
import { Settings, Shield, Plus, Trash2, CheckCircle2, AlertTriangle, Users, Coins } from 'lucide-react';
import { InvestmentProduct, User } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    announcement: '',
    maintenanceMode: false,
    tradingEnabled: true,
    depositEnabled: true,
    withdrawalEnabled: true,
    companyWalletAddress: ''
  });
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [success, setSuccess] = useState('');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdAsset, setNewProdAsset] = useState('USDC');
  const [newProdReturn, setNewProdReturn] = useState('10.0% APY');
  const [newProdRisk, setNewProdRisk] = useState<'Low' | 'Moderate' | 'High' | 'Aggressive'>('Moderate');
  const [newProdMin, setNewProdMin] = useState('100');
  const [newProdLockup, setNewProdLockup] = useState('30 Days');
  const [newProdDesc, setNewProdDesc] = useState('');

  const loadData = () => {
    fetch('/api/platform/settings')
      .then(res => res.json())
      .then(data => { if (data.settings) setSettings(data.settings); })
      .catch(err => console.error(err));

    fetch('/api/investments/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error(err));

    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSuccess('Platform settings & company wallet address updated successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          asset: newProdAsset,
          category: 'Institutional Vault',
          targetReturn: newProdReturn,
          riskLevel: newProdRisk,
          minInvestment: Number(newProdMin),
          lockupPeriod: newProdLockup,
          fees: '0.5% Management',
          liquidity: 'Flexible',
          description: newProdDesc || 'Managed professional yield strategy.'
        })
      });
      if (res.ok) {
        setSuccess('New investment product published to frontend marketplace!');
        setNewProdName('');
        setNewProdDesc('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setSuccess('Investment product removed from marketplace.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-rose-400">Platform Settings & Company Wallet</h1>
        <p className="text-xs text-slate-400">Configure company investment deposit wallet address and frontend feature controls</p>
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

      {/* Frontend & Company Wallet Settings */}
      <form onSubmit={handleSaveSettings} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-400" />
          <span>Global Platform Controls & Company Wallet</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Company Investment Wallet Address</label>
          <input
            type="text"
            required
            value={settings.companyWalletAddress}
            onChange={(e) => setSettings({ ...settings, companyWalletAddress: e.target.value })}
            placeholder="0x71C... Company Vault Address"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-rose-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">Users will see this exact wallet address when clicking "Invest Now" and transferring funds.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Platform Banner Announcement</label>
          <input
            type="text"
            value={settings.announcement}
            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="text-xs text-slate-300 font-medium">Trading Enabled</span>
            <input
              type="checkbox"
              checked={settings.tradingEnabled}
              onChange={(e) => setSettings({ ...settings, tradingEnabled: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="text-xs text-slate-300 font-medium">Deposits Enabled</span>
            <input
              type="checkbox"
              checked={settings.depositEnabled}
              onChange={(e) => setSettings({ ...settings, depositEnabled: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="text-xs text-slate-300 font-medium">Withdrawals Enabled</span>
            <input
              type="checkbox"
              checked={settings.withdrawalEnabled}
              onChange={(e) => setSettings({ ...settings, withdrawalEnabled: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
            <span className="text-xs text-slate-300 font-medium">Maintenance Mode</span>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
            />
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-rose-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-rose-400 transition-colors"
        >
          Save Platform Settings
        </button>
      </form>

      {/* Investment Products Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-rose-400" />
          <span>Manage Investment Products (Frontend Marketplace)</span>
        </h3>

        <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="e.g. Solana High Yield Vault"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Asset Symbol</label>
            <select
              value={newProdAsset}
              onChange={(e) => setNewProdAsset(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            >
              <option value="USDC">USDC</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Target Return</label>
            <input
              type="text"
              required
              value={newProdReturn}
              onChange={(e) => setNewProdReturn(e.target.value)}
              placeholder="12.5% APY"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Risk Level</label>
            <select
              value={newProdRisk}
              onChange={(e) => setNewProdRisk(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            >
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Aggressive">Aggressive</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Min Investment</label>
            <input
              type="number"
              required
              value={newProdMin}
              onChange={(e) => setNewProdMin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Lockup Period</label>
            <input
              type="text"
              required
              value={newProdLockup}
              onChange={(e) => setNewProdLockup(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={newProdDesc}
              onChange={(e) => setNewProdDesc(e.target.value)}
              placeholder="Brief description of investment strategy..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Publish Investment Product to Frontend
            </button>
          </div>
        </form>

        <div className="space-y-3 pt-4">
          <h4 className="text-white font-bold text-sm">Active Products on Frontend</h4>
          {products.map(p => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="text-white font-bold text-sm">{p.name} ({p.asset})</p>
                <span className="text-emerald-400 font-semibold">{p.targetReturn} • Risk: {p.riskLevel} • Min: {p.minInvestment}</span>
              </div>
              <button
                onClick={() => handleDeleteProduct(p.id)}
                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                title="Remove Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
