import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  userEmail: string;
  userName: string;
  message: string;
  from: 'user' | 'admin';
  timestamp: string;
}

export const SupportChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || 'user@cryptex.com';
  const userName = user?.fullName || 'Valued Investor';

  // Load and poll messages from localStorage
  useEffect(() => {
    const loadMessages = () => {
      try {
        const stored = localStorage.getItem('cryptex_support_chats');
        if (stored) {
          const allChats: ChatMessage[] = JSON.parse(stored);
          const userChats = allChats.filter(c => c.userEmail === userEmail);
          
          // Check for unread admin replies
          const lastMsg = userChats[userChats.length - 1];
          if (lastMsg && lastMsg.from === 'admin' && !isOpen) {
            setHasUnread(true);
          }
          
          setMessages(userChats);
        } else {
          // Default greeting
          const initial: ChatMessage[] = [
            {
              id: 'init-1',
              userEmail: userEmail,
              userName: userName,
              message: 'Hello! Welcome to Novatrix Capital Support. How can our compliance or investment desk assist you today?',
              from: 'admin',
              timestamp: new Date().toISOString()
            }
          ];
          localStorage.setItem('cryptex_support_chats', JSON.stringify(initial));
          setMessages(initial);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [userEmail, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userEmail: userEmail,
      userName: userName,
      message: inputMessage.trim(),
      from: 'user',
      timestamp: new Date().toISOString()
    };

    try {
      const stored = localStorage.getItem('cryptex_support_chats');
      const allChats: ChatMessage[] = stored ? JSON.parse(stored) : [];
      const updated = [...allChats, newMsg];
      localStorage.setItem('cryptex_support_chats', JSON.stringify(updated));
      setMessages(updated.filter(c => c.userEmail === userEmail));
      setInputMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#F0B90B] text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 transition-all focus:outline-none ring-4 ring-[#F0B90B]/20"
        title="Chat with Support"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.5]" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
            !
          </span>
        )}
      </button>

      {/* Chat Window Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-full sm:w-[380px] h-[520px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Novatrix Support</h3>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Admin Online • Secure Channel
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0f1d]">
            {messages.map((msg) => {
              const isUser = msg.from === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isUser ? 'You' : 'Admin Desk'}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#F0B90B] text-slate-950 font-medium rounded-br-none shadow-md'
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

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message to admin..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F0B90B] transition-colors"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-[#F0B90B] text-slate-950 flex items-center justify-center hover:bg-[#d9a50a] transition-all shrink-0 font-bold shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
