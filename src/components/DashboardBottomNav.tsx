import React from 'react';
import { LayoutDashboard, PieChart, TrendingUp, Coins, Wallet } from 'lucide-react';

interface DashboardBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const DashboardBottomNav: React.FC<DashboardBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'investments', label: 'Invest', icon: Coins },
    { id: 'wallets', label: 'Wallets', icon: Wallet }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070a12]/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
