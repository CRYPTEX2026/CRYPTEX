import React from 'react';
import { Shield, Lock, Globe, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#070a12] border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">Novatrix Capital</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Secure Digital Assets. Smarter Investing. Novatrix Capital provides institutional-grade custody, algorithmic yield strategies, and compliant digital asset management for global investors.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg w-fit">
              <Lock className="w-4 h-4" />
              <span>SOC2 Certified & ISO-27001 Custody Infrastructure</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate('investments')} className="hover:text-emerald-400 transition-colors">Investment Products</button></li>
              <li><button onClick={() => onNavigate('assets')} className="hover:text-emerald-400 transition-colors">Assets & Markets</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-emerald-400 transition-colors">How It Works</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-emerald-400 transition-colors">Fees & Pricing</button></li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Trust & Safety</h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate('security')} className="hover:text-emerald-400 transition-colors">Security Architecture</button></li>
              <li><button onClick={() => onNavigate('compliance')} className="hover:text-emerald-400 transition-colors">AML & KYC Policy</button></li>
              <li><button onClick={() => onNavigate('risk-disclosure')} className="hover:text-emerald-400 transition-colors">Risk Disclosures</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-emerald-400 transition-colors">Help & FAQ</button></li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Legal & Company</h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors">About Novatrix</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">Contact Support</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>

        {/* Risk Disclaimer Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-8 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300 uppercase tracking-wide">Important Regulatory & Risk Disclosure</p>
          <p>
            Past performance does not guarantee future results. Digital assets involve significant risk and may lose value. Yields and target returns are variable unless legally specified. Novatrix Capital does not provide tax, legal, or investment advice. Users must evaluate their own financial situation and consult licensed professionals before making allocation decisions.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Novatrix Capital Global Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-300">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-300">Terms</button>
            <button onClick={() => onNavigate('cookie-policy')} className="hover:text-slate-300">Cookie Policy</button>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5" /> Global / English
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
