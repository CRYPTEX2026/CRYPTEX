export interface AppNotification {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'earning' | 'kyc' | 'support';
  isRead: boolean;
  timestamp: string;
}

export const getNotifications = (userEmail: string): AppNotification[] => {
  try {
    const stored = localStorage.getItem('cryptex_notifications');
    if (!stored) return [];
    const all: AppNotification[] = JSON.parse(stored);
    return all.filter(n => n.userEmail.toLowerCase() === userEmail.toLowerCase());
  } catch (e) {
    return [];
  }
};

export const sendNotification = (
  userEmail: string,
  title: string,
  message: string,
  type: 'deposit' | 'withdrawal' | 'investment' | 'earning' | 'kyc' | 'support'
) => {
  if (!userEmail) return;
  try {
    const stored = localStorage.getItem('cryptex_notifications');
    const all: AppNotification[] = stored ? JSON.parse(stored) : [];
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userEmail: userEmail.toLowerCase(),
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    all.unshift(newNotif);
    localStorage.setItem('cryptex_notifications', JSON.stringify(all));

    window.dispatchEvent(new CustomEvent('cryptex_notification_sent', { detail: newNotif }));
    return newNotif;
  } catch (e) {
    console.error('Failed to send notification:', e);
  }
};

export const markAsRead = (id: string) => {
  try {
    const stored = localStorage.getItem('cryptex_notifications');
    if (!stored) return;
    const all: AppNotification[] = JSON.parse(stored);
    const updated = all.map(n => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem('cryptex_notifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cryptex_notification_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const markAllAsRead = (userEmail: string) => {
  try {
    const stored = localStorage.getItem('cryptex_notifications');
    if (!stored) return;
    const all: AppNotification[] = JSON.parse(stored);
    const updated = all.map(n => n.userEmail.toLowerCase() === userEmail.toLowerCase() ? { ...n, isRead: true } : n);
    localStorage.setItem('cryptex_notifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cryptex_notification_updated'));
  } catch (e) {
    console.error(e);
  }
};

export const clearAllNotifications = (userEmail: string) => {
  try {
    const stored = localStorage.getItem('cryptex_notifications');
    if (!stored) return;
    const all: AppNotification[] = JSON.parse(stored);
    const filtered = all.filter(n => n.userEmail.toLowerCase() !== userEmail.toLowerCase());
    localStorage.setItem('cryptex_notifications', JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('cryptex_notification_updated'));
  } catch (e) {
    console.error(e);
  }
};
