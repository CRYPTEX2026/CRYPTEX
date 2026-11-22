import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ShieldCheck, User, Search, Clock, CheckCircle } from 'lucide-react';
import { sendNotification } from '../../utils/notifications';

interface ChatMessage {
  id: string;
  userEmail: string;
  userName: string;
  message: string;
  from: 'user' | 'admin';
  timestamp: string;
}

export const AdminSupport: React.FC = () => {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = () => {
    try {
      const stored = localStorage.getItem('cryptex_support_chats');
      if (stored) {
        const allChats: ChatMessage[] = JSON.parse(stored);
        setChats(allChats);
        if (!selectedUserEmail && allChats.length > 0) {
          setSelectedUserEmail(allChats[0].userEmail);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUserEmail, chats]);

  // Extract unique users
  const uniqueUsers = Array.from(new Set(chats.map(c => c.userEmail))).map(email => {
    const userMsgs = chats.filter(c => c.userEmail === email);
    const lastMsg = userMsgs[userMsgs.length - 1];
    return {
      email,
      name: lastMsg?.userName || email.split('@')[0],
      lastMessage: lastMsg?.message || '',
      timestamp: lastMsg?.timestamp || new Date().toISOString()
    };
  });

  const activeThread = chats.filter(c => c.userEmail === selectedUserEmail);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUserEmail) return;

    const targetUser = uniqueUsers.find(u => u.email === selectedUserEmail);
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userEmail: selectedUserEmail,
      userName: targetUser?.name || selectedUserEmail.split('@')[0],
      message: replyText.trim(),
      from: 'admin',
      timestamp: new Date().toISOString()
    };

    try {
      const updated = [...chats, newMsg];
      localStorage.setItem('cryptex_support_chats', JSON.stringify(updated));
      setChats(updated);

      sendNotification(
        selectedUserEmail,
        'New Message from Admin',
        'Admin replied to your support chat.',
        'support'
      );

      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Admin Desk</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span className="text-xs text-slate-400">Secure Client Support Live Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Support & Live Chats</h1>
          <p className="text-slate-400 text-xs">Manage inquiries and communicate with investors in real-time.</p>
        </div>
      </div>

      {/* Main Chat Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px] bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* User Sidebar List */}
        <div className="border-r border-slate-800 flex flex-col bg-slate-950/40">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-white font-bold text-sm">Active Inquiries ({uniqueUsers.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {uniqueUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No support chats yet.</div>
            ) : (
              uniqueUsers.map(u => {
                const isSelected = u.email === selectedUserEmail;
                return (
                  <button
                    key={u.email}
                    onClick={() => setSelectedUserEmail(u.email)}
                    className={`w-full p-4 text-left transition-all flex flex-col gap-1 ${
                      isSelected ? 'bg-rose-500/10 border-l-4 border-rose-500' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-xs">{u.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{u.lastMessage}</p>
                    <span className="text-[10px] text-slate-500">{u.email}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900/40">
          {selectedUserEmail ? (
            <>
              {/* Thread Header */}
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm">
                    {uniqueUsers.find(u => u.email === selectedUserEmail)?.name || selectedUserEmail}
                  </h4>
                  <span className="text-xs text-slate-400">{selectedUserEmail}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Active Conversation
                </span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#070a14]">
                {activeThread.map(msg => {
                  const isAdmin = msg.from === 'admin';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isAdmin ? 'Admin Desk' : msg.userName}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-rose-500 text-slate-950 font-medium rounded-br-none shadow-md'
                            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply as admin..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-rose-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/25 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">Select an investor conversation from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
