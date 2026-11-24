import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const NOTIFICATIONS_STORAGE_KEY = 'manita_notifications_history_v1';
const MAX_HISTORY = 30;
const MAX_TOASTS = 3;

const NotificationContext = createContext(null);

export function NotificationProvider({ children, preferences }) {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);
  const preferencesRef = useRef(preferences);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = 'info', title = '', message = '', duration = null }) => {
      const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const timestamp = new Date().toISOString();

      const newNotif = {
        id,
        type,
        title,
        message,
        timestamp,
        read: false
      };

      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== id)].slice(0, MAX_HISTORY));

      const prefs = preferencesRef.current || {};
      const notifPrefs = prefs.notifications || {};
      const isEnabled = notifPrefs.enabled !== false;
      const isQuiet = notifPrefs.quietMode !== false;

      if (!isEnabled) return id;

      if (isQuiet && type !== 'success' && type !== 'error') {
        return id;
      }

      const toastDuration = duration || notifPrefs.duration || 4000;

      setToasts((prev) => {
        const next = [{ ...newNotif, duration: toastDuration }, ...prev];
        return next.slice(0, MAX_TOASTS);
      });

      return id;
    },
    []
  );

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        notify,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      toasts: [],
      unreadCount: 0,
      notify: () => {},
      dismissToast: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAllNotifications: () => {}
    };
  }
  return ctx;
}
