import React, { useState, useEffect } from 'react';
import { Wifi, Battery, RotateCcw } from 'lucide-react';
import { THEME_PRESETS } from '../../types/themePresets';

export default function PhoneFrame({
  theme = 'scrapbook',
  phoneBackground = '/assets/Background.jpg',
  currentStage = 0,
  totalStages = 6,
  onResetExperience,
  children
}) {
  const [timeStr, setTimeStr] = useState('12:00');
  const themeData = THEME_PRESETS[theme] || THEME_PRESETS.scrapbook;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-theme={theme}
      className="w-full max-w-[420px] mx-auto rounded-[32px] sm:rounded-[40px] shadow-2xl border-[6px] sm:border-[8px] border-stone-800 flex flex-col overflow-hidden relative h-[calc(100dvh-75px)] sm:h-[720px] min-h-[580px] max-h-[820px] transition-all duration-300"
      style={{
        backgroundImage: phoneBackground ? `url(${phoneBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Soft translucent layer so text/keypads are always sharp and readable */}
      <div className="absolute inset-0 bg-stone-900/10 pointer-events-none z-0" />

      {/* Phone Camera Notch & Status Bar */}
      <div className="w-full pt-3 pb-2 px-6 flex items-center justify-between text-xs select-none z-30 shrink-0 opacity-80 relative">
        <span className="font-semibold text-[11px] tracking-tight">{timeStr}</span>
        
        {/* Dynamic Island / Speaker Pill */}
        <div className="w-20 h-4 bg-stone-900 rounded-full flex items-center justify-center shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-stone-800 mr-2 border border-stone-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-900/40"></div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Mini Stage Progress Bar & Theme Badge */}
      <div className="px-5 py-1.5 flex items-center justify-between z-20 shrink-0 relative">
        <div className="flex items-center gap-1">
          {Array.from({ length: totalStages }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStage
                  ? 'w-6 bg-rose-500'
                  : idx < currentStage
                  ? 'w-3 bg-stone-600'
                  : 'w-1.5 bg-stone-400/50'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/15 backdrop-blur-sm">
            {themeData.badge}
          </span>
          {currentStage > 0 && (
            <button
              onClick={onResetExperience}
              title="เริ่มดูของขวัญใหม่ตั้งแต่แรก"
              className="text-stone-700 hover:text-stone-950 p-1 rounded-full hover:bg-black/10 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Active Stage Body */}
      <div className="flex-1 flex flex-col overflow-y-auto relative p-3 z-10">
        {children}
      </div>
    </div>
  );
}
