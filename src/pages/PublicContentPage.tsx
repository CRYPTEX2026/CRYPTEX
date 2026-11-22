import React from 'react';
import { Shield, Lock, Globe, CheckCircle2 } from 'lucide-react';

interface PageProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const PublicLayout: React.FC<PageProps> = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="space-y-4 text-center">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">CRYPTEX Global</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{title}</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">{subtitle}</p>
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 text-slate-300 text-sm leading-relaxed shadow-2xl">
        {children}
      </div>
    </div>
  </div>
);

export const About: React.FC = () => (
  <PublicLayout title="About CRYPTEX" subtitle="Secure Digital Assets. Smarter Investing.">
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Institutional-Grade Digital Asset Platform</h3>
      <p>
        CRYPTEX was founded with a singular vision: to build the world's most secure, transparent, and compliant digital asset investment platform for global investors and institutions.
      </p>
      <p>
        Our leadership brings decades of expertise from traditional capital markets, cryptography, and institutional banking, combined with state-of-the-art MPC custody and automated risk controls.
      </p>
    </div>
  </PublicLayout>
);

export const HowItWorks: React.FC = () => (
  <PublicLayout title="How CRYPTEX Works" subtitle="A seamless 3-step pathway to secure digital asset investing">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-emerald-400 font-mono font-bold text-lg">01</span>
          <h4 className="text-white font-bold text-base">Account & KYC</h4>
          <p className="text-xs text-slate-400">Register securely and complete institutional verification in minutes.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-emerald-400 font-mono font-bold text-lg">02</span>
          <h4 className="text-white font-bold text-base">Deposit & Allocate</h4>
          <p className="text-xs text-slate-400">Fund your account via bank wire or crypto and select yield vaults.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-emerald-400 font-mono font-bold text-lg">03</span>
          <h4 className="text-white font-bold text-base">Monitor & Compound</h4>
          <p className="text-xs text-slate-400">Track real-time portfolio performance and auto-compound returns.</p>
        </div>
      </div>
    </div>
  </PublicLayout>
);

export const SecurityPublic: React.FC = () => (
  <PublicLayout title="Security Architecture" subtitle="Military-grade custody and multi-party computation">
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">MPC Technology & Cold Storage</h3>
      <p>
        Private keys are never stored in a single location. CRYPTEX uses Multi-Party Computation (MPC) to split keys into cryptographic shards distributed across ISO-27001 certified secure hardware modules.
      </p>
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
        SOC2 Type II Certified • Biometric MFA • Automated Chain Screening
      </div>
    </div>
  </PublicLayout>
);

export const CompliancePublic: React.FC = () => (
  <PublicLayout title="Compliance & AML Policy" subtitle="Adhering to global regulatory standards">
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Global AML & Sanctions Screening</h3>
      <p>
        CRYPTEX maintains rigorous Know Your Customer (KYC) and Anti-Money Laundering (AML) standards in cooperation with tier-1 compliance partners. All blockchain transactions are continuously screened for illicit exposure.
      </p>
    </div>
  </PublicLayout>
);

export const RiskDisclosure: React.FC = () => (
  <PublicLayout title="Risk Disclosures" subtitle="Important information regarding digital asset investing">
    <div className="space-y-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
      <p className="font-bold uppercase tracking-wider">Risk Warning:</p>
      <p className="leading-relaxed">
        Past performance does not guarantee future results. Digital assets involve significant risk and may lose value. Yields and target returns are variable unless legally specified. CRYPTEX does not provide tax, legal, or investment advice. Users must evaluate their own financial situation before making allocation decisions.
      </p>
    </div>
  </PublicLayout>
);

export const Terms: React.FC = () => (
  <PublicLayout title="Terms of Service" subtitle="Legal agreement for CRYPTEX platform usage">
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">1. Acceptance of Terms</h3>
      <p>By accessing or using CRYPTEX, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
      <h3 className="text-lg font-bold text-white">2. Eligibility</h3>
      <p>Users must be at least 18 years of age and pass required KYC identity verification checks prior to platform participation.</p>
    </div>
  </PublicLayout>
);

export const Privacy: React.FC = () => (
  <PublicLayout title="Privacy Policy" subtitle="How we protect and manage your personal data">
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Data Minimization & Encryption</h3>
      <p>CRYPTEX adheres to strict data minimization principles. Personal and verification documents are encrypted at rest and in transit using AES-256 standards.</p>
    </div>
  </PublicLayout>
);

export const Contact: React.FC = () => (
  <PublicLayout title="Contact Support" subtitle="Get in touch with our 24/7 institutional desk">
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <h4 className="text-white font-bold text-base">Global Support Desk</h4>
        <p className="text-xs text-slate-400">Email: support@cryptex.global</p>
        <p className="text-xs text-slate-400">Institutional Sales: institutional@cryptex.global</p>
        <p className="text-xs text-slate-400">Office: Financial District, Global Tower Level 42</p>
      </div>
    </div>
  </PublicLayout>
);

export const Faq: React.FC = () => (
  <PublicLayout title="Frequently Asked Questions" subtitle="Answers to common questions about CRYPTEX">
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <h4 className="text-white font-bold text-sm mb-1">How are my assets secured?</h4>
        <p className="text-xs text-slate-400">All assets are held in institutional multi-party computation (MPC) custody with isolated key shards and insurance coverage.</p>
      </div>
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <h4 className="text-white font-bold text-sm mb-1">When are investment yields distributed?</h4>
        <p className="text-xs text-slate-400">Yields are automatically credited or compounded on the 1st of every calendar month.</p>
      </div>
    </div>
  </PublicLayout>
);
