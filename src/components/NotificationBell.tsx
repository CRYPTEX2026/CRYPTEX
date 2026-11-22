import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  AppNotification, 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearAllNotifications 
} from '../utils/notifications';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const userEmail = user?.email || 'user@cryptex.com';

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<AppNotification | null>(null);

  const loadNotifs = () => {
    const list = getNotifications(userEmail);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifs();

    const handleNewNotif = (e: any) => {
      const notif: AppNotification = e.detail;
      if (notif && notif.userEmail.toLowerCase() === userEmail.toLowerCase()) {
        loadNotifs();
        setToast(notif);
        setTimeout(() => {
          setToast(null);
        }, 5000);
      }
    };

    const handleUpdate = () => {
      loadNotifs();
    };

    window.addEventListener('cryptex_notification_sent', handleNewNotif as EventListener);
    window.addEventListener('cryptex_notification_updated', handleUpdate);

    return () => {
      window.removeEventListener('cryptex_notification_sent', handleNewNotif as EventListener);
      window.removeEventListener('cryptex_notification_updated', handleUpdate);
    };
  }, [userEmail]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleItemClick = (n: AppNotification) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={() => markAllAsRead(userEmail)}
                    className="text-[10px] font-semibold text-emerald-400 hover:underline"
                    title="Mark all as read"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => clearAllNotifications(userEmail)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-rose-400"
                    title="Clear all notifications"
                  >
                    Clear
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 bg-[#080d1a]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                    n.isRead ? 'bg-slate-900/40 hover:bg-slate-900/80' : 'bg-slate-900 hover:bg-slate-800/80 border-l-4 border-emerald-500'
                  }`}
                >
                  <div className="mt-0.5">
                    {!n.isRead ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${n.isRead ? 'text-slate-300' : 'text-white'}`}>{n.title}</h4>
                      <span className="text-[10px] text-slate-500">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Popup (Bottom-Right) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold text-xs">{toast.title}</h4>
              <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white text-xs">×</button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
