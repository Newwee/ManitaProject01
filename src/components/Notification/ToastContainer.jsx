import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import SwipeToast from './SwipeToast';

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none flex flex-col gap-2.5 bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 max-w-full"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SwipeToast toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
