import React, { useState } from 'react';
import { Shield, Menu, X, ChevronDown, Lock, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white">Novatrix Capital</span>
              <span className="block text-[10px] tracking-widest text-emerald-400 font-semibold uppercase">Institutional Assets</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => onNavigate('home')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'home' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => onNavigate('investments')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'investments' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              Investments
            </button>
            <button 
              onClick={() => onNavigate('assets')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'assets' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              Assets & Markets
            </button>
            <button 
              onClick={() => onNavigate('how-it-works')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'how-it-works' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              How It Works
            </button>
            <button 
              onClick={() => onNavigate('security')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'security' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              Security
            </button>
            <button 
              onClick={() => onNavigate('compliance')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'compliance' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              Compliance
            </button>
            <button 
              onClick={() => onNavigate('about')} 
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${currentPage === 'about' ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              About
            </button>
          </nav>

          {/* CTA Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="relative group overflow-hidden rounded-xl p-px font-semibold text-xs uppercase tracking-wider"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 group-hover:scale-105"></span>
              <span className="relative px-5 py-2.5 rounded-[11px] bg-slate-950 text-white flex items-center gap-2 transition-colors group-hover:bg-transparent">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <button 
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            Overview
          </button>
          <button 
            onClick={() => { onNavigate('investments'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            Investments
          </button>
          <button 
            onClick={() => { onNavigate('assets'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            Assets & Markets
          </button>
          <button 
            onClick={() => { onNavigate('how-it-works'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            How It Works
          </button>
          <button 
            onClick={() => { onNavigate('security'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            Security
          </button>
          <button 
            onClick={() => { onNavigate('compliance'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            Compliance
          </button>
          <button 
            onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }} 
            className="block w-full text-left py-2 text-slate-300 font-medium hover:text-emerald-400"
          >
            About
          </button>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="w-full py-3 rounded-xl bg-slate-800 text-white font-medium text-center"
            >
              Sign In
            </button>
            <button
              onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-center"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
