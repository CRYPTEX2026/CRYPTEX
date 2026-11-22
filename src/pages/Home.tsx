import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  TrendingUp, 
  Coins, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  FileText,
  Activity
} from 'lucide-react';
import { Asset, InvestmentProduct } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [products, setProducts] = useState<InvestmentProduct[]>([]);

  useEffect(() => {
    fetch('/api/markets')
      .then(res => res.json())
      .then(data => setAssets(data.assets || []))
      .catch(err => console.error(err));

    fetch('/api/investments/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-emerald-500/10">
              <Shield className="w-4 h-4" />
              <span>Institutional-Grade Digital Asset Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Secure Digital Assets. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Smarter Investing.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
              CRYPTEX provides institutional custody, algorithmic yield strategies, and compliant digital asset portfolio management for global investors and institutions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('investments')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-all"
              >
                Explore Investment Vaults
              </button>
            </div>

            {/* Security Badges */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-800/80 mt-16">
              <div className="flex items-center gap-3 justify-center">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase">MPC Custody</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase">SOC2 Certified</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase">Global Compliance</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase">Real-Time Ledger</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Markets Ticker / Overview */}
      <section className="py-16 bg-[#070a12] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Markets</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Supported Digital Assets</h2>
            </div>
            <button
              onClick={() => onNavigate('assets')}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All Markets</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {assets.slice(0, 4).map((asset) => (
              <div key={asset.symbol} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{asset.symbol}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    asset.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-white">${asset.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400">Vol: ${(asset.volume24h / 1e9).toFixed(2)}B</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunities Preview */}
      <section className="py-24 bg-[#0b0f19] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Investment Marketplace</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Institutional Yield & Staking Vaults</h2>
            <p className="text-slate-400 text-sm">
              Explore professional-grade digital asset strategies structured with strict risk controls and transparent fee schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.slice(0, 2).map((prod) => (
              <div key={prod.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {prod.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Risk: {prod.riskLevel}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{prod.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{prod.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Target Return</span>
                      <p className="text-lg font-black text-emerald-400">{prod.targetReturn}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Lock-up Period</span>
                      <p className="text-lg font-bold text-white">{prod.lockupPeriod}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('investments')}
                  className="w-full py-3.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 hover:text-slate-950 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Review Product Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('investments')}
              className="px-8 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:border-emerald-500/40 transition-all"
            >
              View All Investment Products
            </button>
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section className="py-24 bg-[#070a12] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Enterprise Security</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Military-Grade Custody & Multi-Sig Controls</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                CRYPTEX utilizes state-of-the-art Multi-Party Computation (MPC) custody architecture, isolated hardware security modules, and rigorous compliance checks to safeguard digital assets.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">ISO-27001 and SOC2 Type II Certified Custody Partners</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">Advanced biometric and hardware token MFA enforcement</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">Automated AML and chain analysis transaction screening</p>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => onNavigate('security')}
                  className="px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition-all"
                >
                  Explore Security Architecture
                </button>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Active Threat Monitoring</h4>
                  <p className="text-xs text-slate-400">Real-time telemetry and ledger auditing</p>
                </div>
              </div>
              <div className="space-y-4 text-xs font-mono text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <span>[MPC KEY SHARD A]</span>
                  <span className="text-emerald-400">SECURE / ENCRYPTED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <span>[CHAIN SCREENING AML]</span>
                  <span className="text-emerald-400">PASSED (0 RISK)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                  <span>[WITHDRAWAL DUAL-CONTROL]</span>
                  <span className="text-cyan-400">ACTIVE PROTECTION</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#0b0f19] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white">Ready to Secure Your Digital Wealth?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Join thousands of institutional and high-net-worth investors managing digital assets on CRYPTEX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:scale-105 transition-all"
            >
              Open Your CRYPTEX Account
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-all"
            >
              Contact Institutional Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
