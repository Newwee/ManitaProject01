import React, { useState, useEffect } from 'react';
import Counter from '../UI/Counter';
import { Clock, Sparkles } from 'lucide-react';

export default function ChristmasCountdownCard({
  unlockDate = '2026-12-25T00:00',
  countdownTitle = '',
  lockMode = 'christmas'
}) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // If immediate mode, no countdown needed
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
          // If past Christmas this year, target next Christmas
          xDate.setFullYear(year + 1);
        }
        targetTime = xDate.getTime();
      } else if (unlockDate) {
        // Custom unlock date
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

  // Don't render if immediate or no time info
  if (!timeLeft || lockMode === 'immediate') return null;

  // If unlocked, show sleek celebratory banner that doesn't block the gift boxes
  if (timeLeft.isUnlocked) {
    return (
      <div className="fixed top-16 sm:top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in duration-500">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/40 text-amber-200 shadow-xl text-xs sm:text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span>ปลดล็อกของขวัญแล้ว! Merry Christmas! 🎁</span>
        </div>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  const title = countdownTitle || (lockMode === 'christmas' ? '🎄 นับถอยหลังสู่คืนคริสต์มาส' : '⏳ นับถอยหลังถึงเวลาเปิดกล่องของขวัญ');

  return (
    <div
      className={`fixed z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-500 ${
        isMobile
          ? 'top-16 left-1/2 -translate-x-1/2 max-w-[calc(100vw-28px)]'
          : 'top-6 left-6 max-w-sm'
      }`}
    >
      <div className="bg-[#121624c9] hover:bg-[#121624f0] backdrop-blur-xl border border-amber-200/25 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-2xl shadow-black/50 text-white pointer-events-auto transition-all">
        {/* Title */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold text-amber-200/90 mb-2 truncate">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="truncate">{title}</span>
        </div>

        {/* Counter Flip Display Tiles */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[56px] h-9 sm:h-12 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1.5 shadow-inner">
              <Counter
                value={days}
                fontSize={isMobile ? 18 : 26}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/50 mt-1 uppercase tracking-wider">วัน</span>
          </div>

          <span className="text-amber-300 font-bold text-sm sm:text-base -mt-4">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[56px] h-9 sm:h-12 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1.5 shadow-inner">
              <Counter
                value={hours}
                fontSize={isMobile ? 18 : 26}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/50 mt-1 uppercase tracking-wider">ชม.</span>
          </div>

          <span className="text-amber-300 font-bold text-sm sm:text-base -mt-4">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[56px] h-9 sm:h-12 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1.5 shadow-inner">
              <Counter
                value={minutes}
                fontSize={isMobile ? 18 : 26}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/50 mt-1 uppercase tracking-wider">นาที</span>
          </div>

          <span className="text-amber-300 font-bold text-sm sm:text-base -mt-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="min-w-[42px] sm:min-w-[56px] h-9 sm:h-12 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center px-1.5 shadow-inner">
              <Counter
                value={seconds}
                fontSize={isMobile ? 18 : 26}
                fontWeight={700}
                textColor="#fff8e7"
                minDigits={2}
                duration={0.6}
                bounce={0.2}
                motionBlur
                tabular
              />
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/50 mt-1 uppercase tracking-wider">วินาที</span>
          </div>
        </div>
      </div>
    </div>
  );
}
