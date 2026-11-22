import React from 'react';
import { 
  LayoutDashboard, 
  PieChart, 
  TrendingUp, 
  Coins, 
  Wallet, 
  ArrowLeftRight, 
  Bell, 
  ShieldCheck, 
  User, 
  HelpCircle, 
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNavigateHome: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ currentTab, onSelectTab, onNavigateHome }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'markets', label: 'Markets & Assets', icon: TrendingUp },
    { id: 'investments', label: 'Investment Products', icon: Coins },
    { id: 'wallets', label: 'Wallets & Vaults', icon: Wallet },
    { id: 'transactions', label: 'Transaction Ledger', icon: ArrowLeftRight },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
    { id: 'profile', label: 'Profile & KYC', icon: User },
    { id: 'support', label: 'Support & Help', icon: HelpCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#070a12] border-r border-slate-800/80 min-h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">Novatrix Capital</span>
            <span className="block text-[9px] tracking-widest text-emerald-400 font-semibold uppercase">Institutional Portal</span>
          </div>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="p-4 mx-3 my-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <img 
          src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
          alt="Avatar" 
          className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30"
        />
        <div className="overflow-hidden">
          <p className="text-white text-sm font-semibold truncate">{user?.fullName || 'Valued Investor'}</p>
          {(() => {
            const kyc = user?.kycStatus || 'not_started';
            const approved = kyc === 'approved';
            const pending = kyc === 'pending' || kyc === 'under_review';
            return (
              <div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${approved ? 'bg-emerald-500' : pending ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                  <span className={`text-[11px] uppercase tracking-wide font-medium ${approved ? 'text-emerald-400' : pending ? 'text-amber-400' : 'text-rose-400'}`}>
                    {approved ? 'Verified KYC' : pending ? 'Pending KYC' : 'Not Verified'}
                  </span>
                </div>
                {!approved && (
                  <button 
                    onClick={() => onSelectTab('profile')}
                    className="text-[10px] text-emerald-400 underline font-semibold mt-0.5 block hover:text-emerald-300"
                  >
                    Verify Now →
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin Switcher / Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={() => onSelectTab('admin_overview')}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors"
        >
          <span>Admin Portal</span>
        </button>
        <button
          onClick={logout}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
