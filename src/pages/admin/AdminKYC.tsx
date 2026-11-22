import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Eye, FileText, X } from 'lucide-react';
import { sendEmailNotification } from '../../utils/email';

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

export const AdminKYC: React.FC = () => {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [viewImageModal, setViewImageModal] = useState<{ title: string; src: string } | null>(null);
  const [rejectModalEmail, setRejectModalEmail] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [success, setSuccess] = useState('');

  const loadSubmissions = () => {
    try {
      const stored = localStorage.getItem('cryptex_kyc');
      if (stored) {
        setSubmissions(JSON.parse(stored));
      } else {
        setSubmissions([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleApprove = async (sub: KycSubmission) => {
    try {
      const stored = localStorage.getItem('cryptex_kyc');
      const all: KycSubmission[] = stored ? JSON.parse(stored) : [];
      const updated = all.map(s => s.userEmail.toLowerCase() === sub.userEmail.toLowerCase() ? { ...s, status: 'APPROVED' as const } : s);
      localStorage.setItem('cryptex_kyc', JSON.stringify(updated));

      const usersStored = localStorage.getItem('cryptex_users');
      if (usersStored) {
        const users: any[] = JSON.parse(usersStored);
        const newUsers = users.map(u => u.email.toLowerCase() === sub.userEmail.toLowerCase() ? { ...u, kycStatus: 'approved' } : u);
        localStorage.setItem('cryptex_users', JSON.stringify(newUsers));
      }

      setSubmissions(updated);
      setSuccess(`KYC approved for ${sub.userName}`);

      await sendEmailNotification(
        sub.userEmail,
        'CRYPTEX: KYC Verification Approved',
        `Your KYC verification has been approved. You can now invest and withdraw funds without restriction.`,
        'kyc',
        sub.userName
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalEmail || !rejectReason.trim()) return;

    try {
      const stored = localStorage.getItem('cryptex_kyc');
      const all: KycSubmission[] = stored ? JSON.parse(stored) : [];
      const sub = all.find(s => s.userEmail.toLowerCase() === rejectModalEmail.toLowerCase());

      const updated = all.map(s => s.userEmail.toLowerCase() === rejectModalEmail.toLowerCase() ? { ...s, status: 'REJECTED' as const, adminNote: rejectReason.trim() } : s);
      localStorage.setItem('cryptex_kyc', JSON.stringify(updated));

      const usersStored = localStorage.getItem('cryptex_users');
      if (usersStored) {
        const users: any[] = JSON.parse(usersStored);
        const newUsers = users.map(u => u.email.toLowerCase() === rejectModalEmail.toLowerCase() ? { ...u, kycStatus: 'rejected' } : u);
        localStorage.setItem('cryptex_users', JSON.stringify(newUsers));
      }

      setSubmissions(updated);
      setSuccess(`KYC rejected for ${rejectModalEmail}`);
      setRejectModalEmail(null);
      setRejectReason('');

      if (sub) {
        await sendEmailNotification(
          sub.userEmail,
          'CRYPTEX: KYC Verification Rejected',
          `Your KYC verification was rejected. Reason: ${rejectReason.trim()}. Please re-upload corrected documents in your Profile & KYC page.`,
          'kyc',
          sub.userName
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = submissions.filter(s => {
    if (filter === 'PENDING') return s.status === 'PENDING';
    if (filter === 'APPROVED') return s.status === 'APPROVED';
    if (filter === 'REJECTED') return s.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-rose-400">KYC Verification Management</h1>
          <p className="text-xs text-slate-400">Review, approve, or reject user identity documents</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                filter === f ? 'bg-rose-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="p-4 sm:p-6">User</th>
                <th className="p-4 sm:p-6">Submitted Date</th>
                <th className="p-4 sm:p-6">Documents</th>
                <th className="p-4 sm:p-6">Status</th>
                <th className="p-4 sm:p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 text-xs">
                    No KYC submissions yet.
                  </td>
                </tr>
              ) : (
                filtered.map(sub => (
                  <tr key={sub.userEmail} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 sm:p-6">
                      <div>
                        <p className="text-white font-bold">{sub.userName}</p>
                        <span className="text-xs text-slate-400 font-mono">{sub.userEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-xs text-slate-300">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewImageModal({ title: 'ID Front', src: sub.idFront })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                        >
                          ID Front
                        </button>
                        <button
                          onClick={() => setViewImageModal({ title: 'ID Back', src: sub.idBack })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                        >
                          ID Back
                        </button>
                        <button
                          onClick={() => setViewImageModal({ title: 'Selfie', src: sub.selfie })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                        >
                          Selfie
                        </button>
                        <button
                          onClick={() => setViewImageModal({ title: 'Proof of Address', src: sub.proofOfAddress })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
                        >
                          Address
                        </button>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        sub.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(sub)}
                        disabled={sub.status === 'APPROVED'}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase hover:bg-emerald-400 transition-colors disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModalEmail(sub.userEmail)}
                        disabled={sub.status === 'REJECTED'}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs uppercase hover:bg-rose-500/30 transition-colors border border-rose-500/30 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Image Modal */}
      {viewImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-white font-bold text-base">{viewImageModal.title}</h3>
              <button onClick={() => setViewImageModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-950 p-4 rounded-2xl">
              <img src={viewImageModal.src} alt={viewImageModal.title} className="max-w-full max-h-[60vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalEmail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRejectConfirm} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-white font-bold text-base">Reject KYC Verification</h3>
              <button type="button" onClick={() => setRejectModalEmail(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Blurry ID photo, name mismatch, expired document..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalEmail(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase hover:bg-rose-500"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
