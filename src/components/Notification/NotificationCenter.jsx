import React, { useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  X,
  BellOff
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationCenter({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  } = useNotifications();

  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-start justify-end sm:p-4">
      <div
        ref={panelRef}
        className="w-full sm:max-w-md sm:rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[85vh] sm:mt-12 overflow-hidden transition-all duration-300"
      >
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>การแจ้งเตือน</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                ประวัติกิจกรรมและสถานะของขวัญ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="อ่านทั้งหมด"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">อ่านทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  title="ล้างทั้งหมด"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60 p-2 sm:p-3">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mb-3">
                <BellOff className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                ยังไม่มีการแจ้งเตือนใหม่
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 max-w-xs">
                เมื่อบันทึกของขวัญ คัดลอกลิงก์ หรือเปลี่ยนการตั้งค่า ระบบจะแสดงประวัติที่นี่
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 select-none ${
                  item.read
                    ? 'opacity-70 hover:opacity-100 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <div className="pt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  {item.message && (
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  )}
                </div>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
