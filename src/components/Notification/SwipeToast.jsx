import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function SwipeToast({ toast, onDismiss }) {
  const { id, type = 'info', title, message, duration = 4000 } = toast;
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isPaused || isDismissing) return;

    startTimeRef.current = Date.now();
    const interval = 25;

    const timer = setInterval(() => {
      remainingTimeRef.current -= interval;
      const pct = Math.max(0, (remainingTimeRef.current / duration) * 100);
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        clearInterval(timer);
        triggerDismiss('right');
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, isDismissing, duration]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        triggerDismiss('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerDismiss = (direction = 'right') => {
    setIsDismissing(true);
    setOffsetX(direction === 'left' ? -380 : 380);
    setTimeout(() => {
      onDismiss(id);
    }, 250);
  };

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPaused(false);

    if (Math.abs(offsetX) > 85) {
      triggerDismiss(offsetX > 0 ? 'right' : 'left');
    } else {
      setOffsetX(0);
    }
  };

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />
  };

  const borderClass = {
    success: 'border-emerald-200 dark:border-emerald-800/60 shadow-emerald-500/10',
    error: 'border-rose-200 dark:border-rose-800/60 shadow-rose-500/10',
    warning: 'border-amber-200 dark:border-amber-800/60 shadow-amber-500/10',
    info: 'border-sky-200 dark:border-sky-800/60 shadow-sky-500/10'
  }[type] || 'border-stone-200 dark:border-stone-800';

  const progressBg = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500'
  }[type] || 'bg-rose-500';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        transform: `translateX(${offsetX}px)`,
        opacity: isDismissing ? 0 : Math.max(0.2, 1 - Math.abs(offsetX) / 280),
        transition: isDraggingRef.current ? 'none' : 'transform 260ms ease-out, opacity 260ms ease-out'
      }}
      className={`relative overflow-hidden rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border ${borderClass} shadow-xl p-3.5 sm:p-4 text-left select-none will-change-transform cursor-grab active:cursor-grabbing`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">{iconMap[type] || iconMap.info}</div>
        <div className="flex-1 min-w-0 pr-2">
          {title && (
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {title}
            </h4>
          )}
          {message && (
            <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed break-words">
              {message}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerDismiss('right');
          }}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-1 bg-stone-100 dark:bg-stone-800 overflow-hidden">
        <div
          className={`h-full ${progressBg} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
