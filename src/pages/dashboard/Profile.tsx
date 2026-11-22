import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const submitKYC = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cryptex_token')}`
        }
      });
      const data = await res.json();
      if (res.ok && user) {
        updateUser({ ...user, kycStatus: 'pending' });
        setSuccess('KYC documents submitted successfully. Under review by compliance team.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Profile & KYC Onboarding</h1>
        <p className="text-xs text-slate-400">Institutional verification and compliance documentation</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <img 
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
            alt="Avatar" 
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40"
          />
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-2xl font-black text-white">{user?.fullName}</h3>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                KYC Status: {user?.kycStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* KYC Verification Form / Status */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-base">Identity Verification (KYC / AML)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            In compliance with global regulatory frameworks, high-net-worth and institutional accounts require verified identity credentials.
          </p>

          {user?.kycStatus === 'approved' ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">Your identity verification has been fully approved. No further actions required.</span>
            </div>
          ) : user?.kycStatus === 'pending' ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300">
              <FileCheck className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">Your documents are currently under review by our compliance team.</span>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-300">Required Information:</p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Government-issued photo identification (Passport or Driver's License)</li>
                  <li>Proof of residence (Utility bill or bank statement within 90 days)</li>
                  <li>Source of funds questionnaire</li>
                </ul>
              </div>

              <button
                onClick={submitKYC}
                disabled={submitting}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                <span>{submitting ? 'Submitting...' : 'Submit Verification Documents'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
