import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Battery, RotateCcw, ChevronLeft, X } from 'lucide-react';
import { THEME_PRESETS } from '../../types/themePresets';

export default function PhoneFrame({
  theme = 'scrapbook',
  phoneBackground = '/assets/Background.jpg',
  passcodeBackground = '',
  currentStage = 0,
  totalStages = 6,
  onResetExperience,
  onPrevStage,
  onSelectStage,
  decorations = [],
  onUpdateDecorations,
  children
}) {
  const [timeStr, setTimeStr] = useState('12:00');
  const themeData = THEME_PRESETS[theme] || THEME_PRESETS.scrapbook;
  const containerRef = useRef(null);

  // In Stage 1 (Passcode), use specific passcode background if configured
  const effectiveBackground = (currentStage === 1 && passcodeBackground) 
    ? passcodeBackground 
    : phoneBackground;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Draggable item helper for custom placed decorations
  const handleDecPointerDown = (e, decId) => {
    e.stopPropagation();
    if (!onUpdateDecorations || !containerRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const targetDec = decorations.find(d => d.id === decId);
    if (!targetDec) return;

    const initX = targetDec.x || 50;
    const initY = targetDec.y || 50;
    const rect = containerRef.current.getBoundingClientRect();

    const handlePointerMove = (me) => {
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      const newX = Math.max(5, Math.min(95, initX + dx));
      const newY = Math.max(5, Math.min(95, initY + dy));
      
      onUpdateDecorations(decorations.map(d => 
        d.id === decId ? { ...d, x: Math.round(newX), y: Math.round(newY) } : d
      ));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleRemoveDecoration = (e, decId) => {
    e.stopPropagation();
    if (onUpdateDecorations) {
      onUpdateDecorations(decorations.filter(d => d.id !== decId));
    }
  };

  return (
    <div
      ref={containerRef}
      data-theme={theme}
      className="w-full max-w-[420px] mx-auto rounded-[32px] sm:rounded-[40px] shadow-2xl border-[6px] sm:border-[8px] border-stone-800 flex flex-col overflow-hidden relative h-[calc(100dvh-75px)] sm:h-[720px] min-h-[580px] max-h-[820px] transition-all duration-300"
      style={{
        backgroundImage: effectiveBackground ? `url(${effectiveBackground})` : undefined,
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

      {/* Mini Stage Progress Bar, Stage Navigation & Theme Badge */}
      <div className="px-5 py-1.5 flex items-center justify-between z-20 shrink-0 relative">
        {/* Stage progress dots (clickable to switch stage) */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalStages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectStage && onSelectStage(idx)}
              title={`ไปยังด่านที่ ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStage
                  ? 'w-6 bg-rose-500 shadow-xs'
                  : idx < currentStage
                  ? 'w-2.5 bg-stone-700/80 hover:bg-stone-900 cursor-pointer'
                  : 'w-2 bg-stone-400/50 hover:bg-stone-500/70 cursor-pointer'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Back button to previous stage */}
          {currentStage > 0 && onPrevStage && (
            <button
              type="button"
              onClick={onPrevStage}
              title="ย้อนกลับไปด่านก่อนหน้า"
              className="text-stone-800 dark:text-stone-200 px-2 py-0.5 text-[11px] font-bold rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition flex items-center gap-0.5 active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>ย้อนกลับ</span>
            </button>
          )}

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/15 backdrop-blur-sm">
            {themeData.badge}
          </span>

          {currentStage > 0 && onResetExperience && (
            <button
              type="button"
              onClick={onResetExperience}
              title="เริ่มดูของขวัญใหม่ตั้งแต่แรก"
              className="text-stone-700 hover:text-stone-950 p-1 rounded-full hover:bg-black/10 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Draggable Placed Decorations Overlay */}
      {decorations && decorations.map((dec) => (
        <div
          key={dec.id}
          onPointerDown={(e) => handleDecPointerDown(e, dec.id)}
          style={{
            left: `${dec.x}%`,
            top: `${dec.y}%`,
            transform: `translate(-50%, -50%) rotate(${dec.rotation || 0}deg) scale(${dec.scale || 1})`,
            touchAction: 'none'
          }}
          className="absolute z-25 cursor-grab active:cursor-grabbing select-none group"
          title="คลิกค้างแล้วลากเพื่อย้ายตำแหน่งของตกแต่ง"
        >
          <img
            src={dec.src}
            alt="decoration"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none drop-shadow-md transition-transform group-hover:scale-105"
          />
          {onUpdateDecorations && (
            <button
              onClick={(e) => handleRemoveDecoration(e, dec.id)}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
              title="ลบของตกแต่งชิ้นนี้"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      ))}

      {/* Active Stage Body */}
      <div className="flex-1 flex flex-col overflow-y-auto relative p-3 z-10">
        {children}
      </div>
    </div>
  );
}
