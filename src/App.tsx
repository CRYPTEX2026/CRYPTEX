import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardBottomNav } from './components/DashboardBottomNav';
import { AdminSidebar } from './components/AdminSidebar';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About, HowItWorks, SecurityPublic, CompliancePublic, RiskDisclosure, Terms, Privacy, Contact, Faq } from './pages/PublicContentPage';

import { Dashboard } from './pages/dashboard/Dashboard';
import { Portfolio } from './pages/dashboard/Portfolio';
import { Markets } from './pages/dashboard/Markets';
import { Investments } from './pages/dashboard/Investments';
import { Wallets } from './pages/dashboard/Wallets';
import { Transactions } from './pages/dashboard/Transactions';
import { Notifications } from './pages/dashboard/Notifications';
import { SecurityCenter } from './pages/dashboard/SecurityCenter';
import { ProfileKYC } from './pages/ProfileKYC';
import { Support } from './pages/dashboard/Support';

import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDeposits } from './pages/admin/AdminDeposits';
import { AdminKYC } from './pages/admin/AdminKYC';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminLogin } from './pages/AdminLogin';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin')) {
        setCurrentPage('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 animate-pulse flex items-center justify-center text-slate-950 font-black">C</div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Loading CRYPTEX Platform...</p>
        </div>
      </div>
    );
  }

  // Handle Authentication pages
  if (currentPage === 'login') return <Login onNavigate={setCurrentPage} />;
  if (currentPage === 'register') return <Register onNavigate={setCurrentPage} />;
  if (currentPage === 'admin-login') return <AdminLogin onNavigate={setCurrentPage} />;

  // Handle Authenticated Dashboard / Customer Portal tabs
  const dashboardTabs = ['dashboard', 'portfolio', 'markets', 'investments', 'wallets', 'transactions', 'notifications', 'security', 'profile', 'support'];

  if (dashboardTabs.includes(currentPage)) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-slate-950">
        <DashboardSidebar currentTab={currentPage} onSelectTab={setCurrentPage} onNavigateHome={() => setCurrentPage('home')} />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto mb-16 lg:mb-0">
          {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
          {currentPage === 'portfolio' && <Portfolio onNavigate={setCurrentPage} />}
          {currentPage === 'markets' && <Markets onNavigate={setCurrentPage} />}
          {currentPage === 'investments' && <Investments onNavigate={setCurrentPage} />}
          {currentPage === 'wallets' && <Wallets onNavigate={setCurrentPage} />}
          {currentPage === 'transactions' && <Transactions />}
          {currentPage === 'notifications' && <Notifications />}
          {currentPage === 'security' && <SecurityCenter />}
          {currentPage === 'profile' && <ProfileKYC />}
          {currentPage === 'support' && <Support />}
        </main>
        <DashboardBottomNav currentTab={currentPage} onSelectTab={setCurrentPage} />
      </div>
    );
  }

  // Handle Admin Portal tabs
  const adminTabs = [
    'admin-overview', 'admin_overview', 
    'admin-users', 'admin_users', 
    'admin-deposits', 'admin_deposits', 
    'admin-kyc', 'admin_kyc', 
    'admin-withdrawals', 'admin_withdrawals', 
    'admin-support', 'admin_support',
    'admin-products', 'admin_products', 
    'admin-audit', 'admin_audit', 
    'admin-settings', 'admin_settings', 
    'admin'
  ];

  if (adminTabs.includes(currentPage)) {
    const isAdmin = user?.role === 'admin' || localStorage.getItem('cryptex_admin') === 'true';
    if (!isAdmin) {
      return <AdminLogin onNavigate={setCurrentPage} />;
    }
    const normalizedTab = currentPage.replace('-', '_');
    return (
      <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col lg:flex-row selection:bg-rose-500 selection:text-slate-950">
        <AdminSidebar currentTab={currentPage} onSelectTab={setCurrentPage} onReturnToCustomer={() => setCurrentPage('home')} />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
          {(normalizedTab === 'admin_overview' || normalizedTab === 'admin') && <AdminOverview />}
          {normalizedTab === 'admin_users' && <AdminUsers />}
          {normalizedTab === 'admin_deposits' && <AdminDeposits />}
          {normalizedTab === 'admin_kyc' && <AdminKYC />}
          {normalizedTab === 'admin_withdrawals' && <AdminWithdrawals />}
          {normalizedTab === 'admin_support' && <AdminSupport />}
          {normalizedTab === 'admin_audit' && <AdminAuditLogs />}
          {normalizedTab === 'admin_settings' && <AdminSettings />}
        </main>
      </div>
    );
  }

  // Public Marketing Website Pages
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
        {currentPage === 'about' && <About />}
        {currentPage === 'how-it-works' && <HowItWorks />}
        {currentPage === 'investments' && <Investments onNavigate={setCurrentPage} />}
        {currentPage === 'assets' && <Markets onNavigate={setCurrentPage} />}
        {currentPage === 'security' && <SecurityPublic />}
        {currentPage === 'compliance' && <CompliancePublic />}
        {currentPage === 'risk-disclosure' && <RiskDisclosure />}
        {currentPage === 'terms' && <Terms />}
        {currentPage === 'privacy' && <Privacy />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'faq' && <Faq />}
      </main>
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
