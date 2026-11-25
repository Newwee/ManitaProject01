import React, { useState, useEffect, useRef } from 'react';
import Counter from '../UI/Counter';
import { Clock, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function ChristmasCountdownCard({
  unlockDate = '2026-12-25T00:00',
  countdownTitle = '',
  lockMode = 'christmas'
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default to avoid screen clutter
  const [position, setPosition] = useState(null); // null = responsive default positioning

  // Drag state
  const isDraggingRef = useRef(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
    currentDx: 0,
    currentDy: 0,
    rafId: null
  });
  const hasMovedRef = useRef(false);
  const cardRef = useRef(null);

  // Keep inside screen on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev || !cardRef.current) return prev;
        const rect = cardRef.current.getBoundingClientRect();
        const maxX = Math.max(8, window.innerWidth - rect.width - 8);
        const maxY = Math.max(8, window.innerHeight - rect.height - 8);
        return {
          x: Math.max(8, Math.min(maxX, prev.x)),
          y: Math.max(8, Math.min(maxY, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (!cardRef.current) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const rect = cardRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      currentDx: 0,
      currentDy: 0,
      rafId: null
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    dragRef.current.currentDx = dx;
    dragRef.current.currentDy = dy;

    if (!dragRef.current.rafId) {
      dragRef.current.rafId = requestAnimationFrame(() => {
        if (cardRef.current && isDraggingRef.current) {
          cardRef.current.style.transform = `translate3d(${dragRef.current.currentDx}px, ${dragRef.current.currentDy}px, 0)`;
        }
        dragRef.current.rafId = null;
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (dragRef.current.rafId) {
      cancelAnimationFrame(dragRef.current.rafId);
      dragRef.current.rafId = null;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (cardRef.current) {
      cardRef.current.style.transform = '';
      if (hasMovedRef.current) {
        const card = cardRef.current;
        const width = card.offsetWidth;
        const height = card.offsetHeight;

        const rawX = dragRef.current.initialLeft + dragRef.current.currentDx;
        const rawY = dragRef.current.initialTop + dragRef.current.currentDy;

        const maxX = Math.max(8, window.innerWidth - width - 8);
        const maxY = Math.max(8, window.innerHeight - height - 8);

        const finalX = Math.min(maxX, Math.max(8, rawX));
        const finalY = Math.min(maxY, Math.max(8, rawY));

        setPosition({ x: finalX, y: finalY });
      }
    }
  };

  useEffect(() => {
    if (lockMode === 'immediate') {
      setTimeLeft(null);
      return;
    }

    const calcTime = () => {
      // Bangkok Time Zone (UTC+7)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const nowBkk = new Date(utc + (3600000 * 7));

      let targetTime;
      if (lockMode === 'christmas') {
        const year = nowBkk.getFullYear();
        let xYear = year;
        const xDate = new Date(`${xYear}-12-25T00:00:00+07:00`);
        if (nowBkk.getTime() >= xDate.getTime()) {
          xDate.setFullYear(year + 1);
        }
        targetTime = xDate.getTime();
      } else if (unlockDate) {
        const cleanIso = unlockDate.length === 16 ? `${unlockDate}:00+07:00` : unlockDate;
        const parsed = new Date(cleanIso);
        targetTime = isNaN(parsed.getTime()) ? (nowBkk.getTime() + 86400000) : parsed.getTime();
      } else {
        const xDate = new Date(`${nowBkk.getFullYear()}-12-25T00:00:00+07:00`);
        targetTime = xDate.getTime();
      }

      const diff = targetTime - nowBkk.getTime();
      if (diff <= 0) {
        setTimeLeft({ isUnlocked: true, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft({ isUnlocked: false, days, hours, minutes, seconds });
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [unlockDate, lockMode]);

  // Don't render if immediate mode or no time
  if (!timeLeft || lockMode === 'immediate') return null;

  // If unlocked, don't show any bulky countdown card
  if (timeLeft.isUnlocked) return null;

  const { days, hours, minutes, seconds } = timeLeft;
  const pad2 = (n) => String(n).padStart(2, '0');
  const title = countdownTitle || (lockMode === 'christmas' ? '🎄 นับถอยหลังสู่คืนคริสต์มาส' : '⏳ นับถอยหลังเปิดกล่องของขวัญ');

  // Option 1: Sleek Mini Pill (Default - completely non-intrusive)
  if (!isExpanded) {
    return (
      <div
        ref={cardRef}
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
        className={`fixed z-[105] select-none touch-none ${
          !position ? 'bottom-[max(1rem,env(safe-area-inset-bottom,1rem))] left-3 sm:top-20 sm:left-6 sm:bottom-auto' : ''
        } animate-in fade-in zoom-in-95 duration-300 will-change-transform`}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!hasMovedRef.current) {
              setIsExpanded(true);
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121624d9] hover:bg-[#121624fa] backdrop-blur-xl border border-amber-300/30 text-white shadow-xl cursor-grab active:cursor-grabbing transition-all hover:scale-105 active:scale-95 group"
          title="คลิกเพื่อขยายดูตัวเลขนับถอยหลัง หรือลากเพื่อเปลี่ยนตำแหน่ง"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse pointer-events-none" />
          <div className="flex items-center gap-1 text-xs font-bold text-amber-100 pointer-events-none font-mono">
            {days > 0 && <span>{days}ว </span>}
            <span>{pad2(hours)}:{pad2(minutes)}:{pad2(seconds)}</span>
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="p-0.5 rounded-full hover:bg-white/10 text-amber-300/80 hover:text-amber-200 transition"
            title="ขยายดูรายละเอียด"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Option 2: Full Odometer Counter Card (when user clicks to expand, also fully draggable)
  return (
    <div
      ref={cardRef}
      style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      className={`fixed z-[105] select-none ${
        !position ? 'bottom-[max(1rem,env(safe-area-inset-bottom,1rem))] left-3 sm:top-20 sm:left-6 sm:bottom-auto' : ''
      } animate-in fade-in zoom-in-95 duration-300 will-change-transform`}
    >
      <div className="w-[min(310px,calc(100vw-24px))] bg-[#121624f2] backdrop-blur-xl border border-amber-200/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/60 text-white relative">
        {/* Top Handle / Header */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full flex items-center justify-between pb-2 cursor-grab active:cursor-grabbing touch-none select-none border-b border-white/10 mb-2.5"
          title="คลิกค้างแล้วลากเพื่อย้ายตำแหน่ง"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-200/90 truncate pointer-events-none">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="truncate">{title}</span>
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition shrink-0 ml-1"
            title="ย่อกลับเป็นปุ่มเล็ก"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Counter Flip Display Tiles */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[50px] h-8 sm:h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1 shadow-inner">
              <Counter
                value={days}
                fontSize={18}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] text-white/50 mt-1 uppercase tracking-wider">วัน</span>
          </div>

          <span className="text-amber-300 font-bold text-xs sm:text-sm -mt-3.5">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[50px] h-8 sm:h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1 shadow-inner">
              <Counter
                value={hours}
                fontSize={18}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] text-white/50 mt-1 uppercase tracking-wider">ชม.</span>
          </div>

          <span className="text-amber-300 font-bold text-xs sm:text-sm -mt-3.5">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[50px] h-8 sm:h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1 shadow-inner">
              <Counter
                value={minutes}
                fontSize={18}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] text-white/50 mt-1 uppercase tracking-wider">นาที</span>
          </div>

          <span className="text-amber-300 font-bold text-xs sm:text-sm -mt-3.5">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[50px] h-8 sm:h-10 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1 shadow-inner">
              <Counter
                value={seconds}
                fontSize={18}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] text-white/50 mt-1 uppercase tracking-wider">วินาที</span>
          </div>
        </div>
      </div>
    </div>
  );
}
