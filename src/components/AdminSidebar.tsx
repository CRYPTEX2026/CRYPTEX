import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileCheck, 
  ArrowLeftRight, 
  Coins, 
  History, 
  Settings, 
  ArrowLeft,
  Lock,
  ArrowDownLeft,
  LogOut,
  MessageSquare
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onReturnToCustomer: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, onSelectTab, onReturnToCustomer }) => {
  const { logout } = useAuthNav(onReturnToCustomer);
  const [hasUnreadChats, setHasUnreadChats] = useState(false);
  const [pendingKycCount, setPendingKycCount] = useState(0);

  useEffect(() => {
    const checkData = () => {
      try {
        const storedChats = localStorage.getItem('cryptex_support_chats');
        if (storedChats) {
          const chats: any[] = JSON.parse(storedChats);
          const userEmails = Array.from(new Set(chats.map(c => c.userEmail)));
          let unread = false;
          userEmails.forEach(email => {
            const userMsgs = chats.filter(c => c.userEmail === email);
            const lastMsg = userMsgs[userMsgs.length - 1];
            if (lastMsg && lastMsg.from === 'user') {
              unread = true;
            }
          });
          setHasUnreadChats(unread);
        }

        const storedKyc = localStorage.getItem('cryptex_kyc');
        if (storedKyc) {
          const subs: any[] = JSON.parse(storedKyc);
          const count = subs.filter(s => s.status === 'PENDING').length;
          setPendingKycCount(count);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkData();
    const interval = setInterval(checkData, 2000);
    return () => clearInterval(interval);
  }, []);

  const adminItems = [
    { id: 'admin-overview', label: 'Admin Overview', icon: ShieldAlert },
    { id: 'admin-users', label: 'User Directory', icon: Users },
    { id: 'admin-support', label: 'Support Chats', icon: MessageSquare, badge: hasUnreadChats },
    { id: 'admin-deposits', label: 'Deposit Approvals', icon: ArrowDownLeft },
    { id: 'admin-kyc', label: 'KYC Verification', icon: FileCheck, badgeCount: pendingKycCount },
    { id: 'admin-withdrawals', label: 'Withdrawal Approvals', icon: ArrowLeftRight },
    { id: 'admin-products', label: 'Investment Products', icon: Coins },
    { id: 'admin-audit', label: 'Audit & Security Logs', icon: History },
    { id: 'admin-settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#05070c] border-r border-rose-500/20 min-h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-rose-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Lock className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-rose-400">Novatrix Admin</span>
            <span className="block text-[9px] tracking-widest text-slate-400 font-semibold uppercase">Restricted Access</span>
          </div>
        </div>
      </div>

      {/* Security Level Indicator */}
      <div className="p-3 mx-3 my-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
        <div>
          <p className="text-rose-300 text-xs font-semibold">Dual-Control Enabled</p>
          <p className="text-[10px] text-slate-400">SOC2 Level-4 Compliance</p>
        </div>
      </div>

      {/* Admin Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {adminItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || currentTab.replace('_', '-') === item.id.replace('_', '-');
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md">
                  {item.badgeCount}
                </span>
              ) : item.badge && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-md"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout & Exit */}
      <div className="p-4 border-t border-rose-500/20 space-y-2">
        <button
          onClick={logout}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-sm flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Admin Logout</span>
        </button>
        <button
          onClick={onReturnToCustomer}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
};

function useAuthNav(onReturn: () => void) {
  const logout = () => {
    localStorage.removeItem('cryptex_token');
    localStorage.removeItem('cryptex_user');
    localStorage.removeItem('cryptex_admin');
    onReturn();
  };
  return { logout };
}
