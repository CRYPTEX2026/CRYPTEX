import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, AlertTriangle, Upload, CheckCircle2, XCircle, FileText, Lock, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendEmailNotification } from '../utils/email';

interface KycSubmission {
  userEmail: string;
  userName: string;
  idFront: string;
  idBack: string;
  selfie: string;
  proofOfAddress: string;
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  adminNote: string;
}

export const ProfileKYC: React.FC = () => {
  const { user, updateUser } = useAuth();
  const userEmail = user?.email || 'user@cryptex.com';
  const userName = user?.fullName || 'Valued Investor';

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [country, setCountry] = useState(user?.country || '');
  const [walletAddress, setWalletAddress] = useState(user?.btcWalletAddress || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // KYC state
  const [kycData, setKycData] = useState<KycSubmission | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<string>('');
  const [idBackFile, setIdBackFile] = useState<string>('');
  const [selfieFile, setSelfieFile] = useState<string>('');
  const [proofFile, setProofFile] = useState<string>('');
  const [kycMessage, setKycMessage] = useState('');
  const [loadingKyc, setLoadingKyc] = useState(false);

  useEffect(() => {
    loadKyc();
  }, [userEmail]);

  const loadKyc = () => {
    try {
      const stored = localStorage.getItem('cryptex_kyc');
      if (stored) {
        const submissions: KycSubmission[] = JSON.parse(stored);
        const mySub = submissions.find(s => s.userEmail.toLowerCase() === userEmail.toLowerCase());
        if (mySub) {
          setKycData(mySub);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      fullName,
      phone,
      dob,
      country,
      btcWalletAddress: walletAddress
    };

    // Update localStorage cryptex_users
    try {
      const stored = localStorage.getItem('cryptex_users');
      if (stored) {
        const users: any[] = JSON.parse(stored);
        const newUsers = users.map(u => u.email.toLowerCase() === userEmail.toLowerCase() ? updatedUser : u);
        localStorage.setItem('cryptex_users', JSON.stringify(newUsers));
      }
      updateUser(updatedUser);
      setProfileSuccess('Profile information updated successfully.');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFrontFile || !idBackFile || !selfieFile || !proofFile) {
      setKycMessage('Please upload all 4 required verification documents.');
      return;
    }

    setLoadingKyc(true);
    try {
      const newSub: KycSubmission = {
        userEmail: userEmail,
        userName: userName,
        idFront: idFrontFile,
        idBack: idBackFile,
        selfie: selfieFile,
        proofOfAddress: proofFile,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        adminNote: ''
      };

      const stored = localStorage.getItem('cryptex_kyc');
      const submissions: KycSubmission[] = stored ? JSON.parse(stored) : [];
      const filtered = submissions.filter(s => s.userEmail.toLowerCase() !== userEmail.toLowerCase());
      const updated = [newSub, ...filtered];
      localStorage.setItem('cryptex_kyc', JSON.stringify(updated));
      setKycData(newSub);

      // Send in-app and email notification
      await sendEmailNotification(
        userEmail,
        'CRYPTEX: KYC Verification Submitted',
        `Your KYC verification documents have been submitted and are under review. You will receive an email once approved.`,
        'kyc',
        userName
      );

      setKycMessage('KYC submitted successfully. Status is now PENDING review.');
    } catch (err) {
      console.error(err);
      setKycMessage('Failed to submit KYC documents.');
    } finally {
      setLoadingKyc(false);
    }
  };

  const status = kycData?.status || 'NOT_SUBMITTED';

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-black text-white">Profile & KYC Verification</h1>
        <p className="text-xs text-slate-400">Manage your institutional account details and compliance verification</p>
      </div>

      {/* Section A: PROFILE INFO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Personal & Account Information</h3>
            <p className="text-xs text-slate-400">Update your verified legal details</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {profileSuccess}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Legal Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address (Read-Only)</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2834"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Country of Residence</label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="United States"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Default Withdrawal Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder="bc1q..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Section B: KYC VERIFICATION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">KYC & Compliance Verification</h3>
              <p className="text-xs text-slate-400">Submit identity documents for institutional tier access</p>
            </div>
          </div>

          <div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
              'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {status === 'APPROVED' ? 'APPROVED ✓' : status === 'PENDING' ? 'PENDING REVIEW' : status === 'REJECTED' ? 'REJECTED ✕' : 'NOT SUBMITTED'}
            </span>
          </div>
        </div>

        {kycMessage && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
            {kycMessage}
          </div>
        )}

        {status === 'REJECTED' && kycData?.adminNote && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-1">
            <p className="font-bold">Rejection Reason from Compliance Admin:</p>
            <p>{kycData.adminNote}</p>
            <p className="text-[10px] text-rose-400 pt-1">Please review the notes and re-upload correct documentation below.</p>
          </div>
        )}

        {status === 'APPROVED' ? (
          <div className="p-8 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-white font-bold text-base">Your account is verified ✓</h4>
            <p className="text-slate-400 text-xs">All limits are unlocked. Full trading & withdrawal privileges enabled.</p>
          </div>
        ) : status === 'PENDING' ? (
          <div className="p-8 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-amber-500/30">
            <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h4 className="text-white font-bold text-base">Your KYC is under review</h4>
            <p className="text-slate-400 text-xs">Our compliance team is verifying your submitted documents. You will get an email when approved.</p>
          </div>
        ) : (
          <form onSubmit={handleKycSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* ID Front */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">1. Government ID Front *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e, setIdFrontFile)}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                  required={!idFrontFile}
                />
                {idFrontFile && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <FileText className="w-4 h-4" />
                    <span>File uploaded & ready</span>
                  </div>
                )}
              </div>

              {/* ID Back */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">2. Government ID Back *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e, setIdBackFile)}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                  required={!idBackFile}
                />
                {idBackFile && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <FileText className="w-4 h-4" />
                    <span>File uploaded & ready</span>
                  </div>
                )}
              </div>

              {/* Selfie */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">3. Selfie Holding ID *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e, setSelfieFile)}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                  required={!selfieFile}
                />
                {selfieFile && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <FileText className="w-4 h-4" />
                    <span>File uploaded & ready</span>
                  </div>
                )}
              </div>

              {/* Proof of Address */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">4. Proof of Address (Utility Bill) *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e, setProofFile)}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                  required={!proofFile}
                />
                {proofFile && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <FileText className="w-4 h-4" />
                    <span>File uploaded & ready</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loadingKyc}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {loadingKyc ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
