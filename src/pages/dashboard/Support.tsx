import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, Plus, CheckCircle2 } from 'lucide-react';
import { SupportTicket } from '../../types';

export const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Investments');
  const [message, setMessage] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchTickets = () => {
    fetch('/api/support/tickets', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('cryptex_token')}` }
    })
      .then(res => res.json())
      .then(data => setTickets(data.tickets || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('cryptex_token')}`
        },
        body: JSON.stringify({ subject, category, message })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Support ticket created successfully!');
        setSubject('');
        setMessage('');
        setShowNewForm(false);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Support & Institutional Help</h1>
          <p className="text-xs text-slate-400">24/7 dedicated support desk for CRYPTEX clients</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}

      {showNewForm && (
        <form onSubmit={handleCreateTicket} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-white">Create Support Ticket</h3>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Brief summary of your question"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Investments">Investments & Yield</option>
              <option value="Wallets">Deposits & Withdrawals</option>
              <option value="KYC">KYC & Compliance</option>
              <option value="Security">Security & 2FA</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Describe your request in detail..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors"
          >
            Submit Ticket
          </button>
        </form>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white">Your Tickets</h3>
        {tickets.map(t => (
          <div key={t.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {t.category}
                </span>
                <h4 className="text-white font-bold text-base mt-2">{t.subject}</h4>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
              }`}>
                {t.status}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {t.messages.map((m, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                  m.sender === 'user' ? 'bg-slate-950/80 border border-slate-800 ml-6' : 'bg-emerald-500/10 border border-emerald-500/20 mr-6 text-emerald-300'
                }`}>
                  <div className="flex justify-between font-semibold text-[10px] text-slate-400 uppercase">
                    <span>{m.sender === 'user' ? 'You' : 'CRYPTEX Support'}</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
