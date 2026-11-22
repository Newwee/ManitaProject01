import React, { useState, useEffect } from 'react';
import { Lock, Clock, Heart, Sparkles, ChevronRight, Gift } from 'lucide-react';
import { playChime } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';
import BlurText from '../UI/BlurText';
import GlareHover from '../UI/GlareHover';

export default function Stage0_Entry({
  theme = 'scrapbook',
  introTitle = 'เรามีอะไรจะให้ดู...',
  introSub = 'แตะที่ตราประทับหัวใจเพื่อเปิดซองจดหมาย',
  letterText = 'มีอะไรจะบอกด้วยแหละ 💌',
  envelopeStyle = 'default',
  introTitlePos = { x: 0, y: 0 },
  introSubPos = { x: 0, y: 0 },
  badgePos = { x: 0, y: 0 },
  promptPos = { x: 0, y: 0 },
  badgeText = 'วันครบรอบ ♡',
  promptText = 'แตะที่ของขวัญเพื่อเปิดดูด่านต่อไป',
  onChangeConfig,
  isEditable = false,
  timeLockEnabled = false,
  timeLockDate = '',
  onNextStage
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isBypassed, setIsBypassed] = useState(false);

  // Helper to drag text elements interactively (Requirement 8)
  const handleDragText = (e, key, currentPos) => {
    if (!onChangeConfig) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = currentPos?.x || 0;
    const initY = currentPos?.y || 0;

    const handleMove = (me) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      onChangeConfig({ [key]: { x: Math.round(initX + dx), y: Math.round(initY + dy) } });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  // Time capsule calculation
  useEffect(() => {
    if (!timeLockEnabled || !timeLockDate || isBypassed) {
      setIsLocked(false);
      return;
    }

    const target = new Date(timeLockDate).getTime();
    const updateTime = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, mins, secs });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeLockEnabled, timeLockDate, isBypassed]);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    playChime();

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Advance to passcode stage after opening animation
    setTimeout(() => {
      onNextStage();
    }, 1100);
  };

  // If locked by Time Capsule
  if (isLocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="theme-card p-6 w-full max-w-xs text-center z-30 shadow-xl border-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl animate-bounce">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-theme-display text-lg font-bold mb-1">
            Time Capsule Locked
          </h3>
          <p className="text-xs opacity-75 mb-4">
            ของขวัญชิ้นนี้ถูกล็อกเวลาไว้ จะเปิดได้เมื่อถึงเวลาที่กำหนด
          </p>

          {/* Countdown Grid */}
          <div className="grid grid-cols-4 gap-1.5 mb-5 font-mono">
            <div className="bg-black/5 p-2 rounded-xl">
              <div className="text-base font-bold text-rose-600">{countdown.days}</div>
              <div className="text-[9px] opacity-60 uppercase">วัน</div>
            </div>
            <div className="bg-black/5 p-2 rounded-xl">
              <div className="text-base font-bold text-rose-600">{countdown.hours}</div>
              <div className="text-[9px] opacity-60 uppercase">ชม.</div>
            </div>
            <div className="bg-black/5 p-2 rounded-xl">
              <div className="text-base font-bold text-rose-600">{countdown.mins}</div>
              <div className="text-[9px] opacity-60 uppercase">นาที</div>
            </div>
            <div className="bg-black/5 p-2 rounded-xl">
              <div className="text-base font-bold text-rose-600">{countdown.secs}</div>
              <div className="text-[9px] opacity-60 uppercase">วินาที</div>
            </div>
          </div>

          <button
            onClick={() => setIsBypassed(true)}
            className="text-[11px] text-stone-500 hover:text-stone-800 underline font-medium"
          >
            กดที่นี่เพื่อทดสอบเปิดดูทันที (Bypass Mode)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center select-none py-6 relative">
      {/* Movable Top Badge (วันครบรอบ ♡) - Requirement 8 */}
      {badgeText && (
        <div
          onPointerDown={(e) => handleDragText(e, 'badgePos', badgePos)}
          style={{
            transform: `translate(${badgePos?.x || 0}px, ${badgePos?.y || 0}px)`,
            touchAction: 'none'
          }}
          className="absolute top-1 right-2 z-20 cursor-grab active:cursor-grabbing px-2.5 py-0.5 rounded-full bg-black/15 backdrop-blur-sm text-[11px] font-bold text-stone-700 hover:ring-1 hover:ring-rose-400 select-none transition-shadow"
          title="คลิกค้างแล้วลากเพื่อปรับตำแหน่งป้าย"
        >
          <span>{badgeText}</span>
        </div>
      )}

      {/* Headings: Title & Subtitle (Draggable / Movable) - Requirement 8 */}
      <div
        onPointerDown={(e) => handleDragText(e, 'introTitlePos', introTitlePos)}
        style={{
          transform: `translate(${introTitlePos?.x || 0}px, ${introTitlePos?.y || 0}px)`,
          touchAction: 'none'
        }}
        className="mb-5 cursor-grab active:cursor-grabbing relative select-none hover:ring-1 hover:ring-rose-400/40 rounded-xl px-2 py-1 transition-shadow"
        title="คลิกค้างแล้วลากเพื่อปรับตำแหน่งหัวข้อ"
      >
        <BlurText
          text={introTitle}
          delay={40}
          animateBy="words"
          className="font-theme-display text-2xl sm:text-3xl font-extrabold mb-1.5 leading-snug pointer-events-none"
        />
        <p className="text-xs opacity-75 max-w-xs mx-auto mt-1 pointer-events-none">
          {introSub}
        </p>
      </div>

      {/* CUSTOM SLICED ENVELOPE (Requirement 4) */}
      {envelopeStyle && envelopeStyle !== 'default' ? (
        <GlareHover maxTilt={8} glareOpacity={0.25} borderRadius="20px" className="mt-1">
          <div
            onClick={handleOpen}
            className={`envelope-wrapper relative w-72 h-52 sm:w-80 sm:h-56 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-95 ${
              isOpen ? 'envelope-open' : ''
            }`}
          >
            {/* Letter inside that slides up */}
            <div className="envelope-letter absolute inset-x-6 top-6 bottom-4 bg-[#FFFDF9] rounded-2xl border border-[#D5C2B0] shadow-md p-4 flex flex-col items-center justify-center text-center z-10">
              <span className="text-[10px] text-rose-500 font-bold mb-1 tracking-wider uppercase">DEAR SPECIAL ONE</span>
              <p className="font-theme-display text-sm font-bold text-stone-800 line-clamp-3">
                {letterText}
              </p>
              <div className="w-12 h-0.5 bg-rose-200 mt-2 rounded-full" />
            </div>

            {/* Sliced Envelope Front Container */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none drop-shadow-xl">
              <img
                src={envelopeStyle}
                alt="Custom Envelope"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Front Wax Seal Heart Button */}
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-[#A8383B] border-4 border-[#8E2B2E] shadow-xl flex items-center justify-center text-white text-lg transition-transform duration-300 ${
                isOpen ? 'scale-0 opacity-0' : 'animate-pulse hover:scale-110'
              }`}
            >
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
          </div>
        </GlareHover>
      ) : theme === 'scrapbook' ? (
        <GlareHover maxTilt={7} glareOpacity={0.3} borderRadius="16px" className="mt-2">
          <div
            onClick={handleOpen}
            className={`envelope-wrapper relative w-72 h-48 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-95 ${
              isOpen ? 'envelope-open' : ''
            }`}
          >
            {/* Envelope Pocket Body */}
          <div className="absolute inset-0 bg-[#E8DACB] rounded-2xl border-2 border-[#C8A27C] shadow-lg overflow-hidden z-10">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #D4BEA8 0, #D4BEA8 1px, transparent 0, transparent 16px)'
              }}
            />
            {/* Inner shadows for paper feel */}
            <div className="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-black/5" />
          </div>

          {/* Envelope Triangle Flap */}
          <div
            className="envelope-flap absolute -top-1 left-0 right-0 h-28 z-20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              backgroundColor: '#DFCBB8',
              borderBottom: '2px solid #C09A74'
            }}
          />

          {/* Letter inside that slides up */}
          <div className="envelope-letter absolute inset-x-4 top-4 bottom-2 bg-[#FFFDF9] rounded-xl border border-[#D5C2B0] shadow-sm p-4 flex flex-col items-center justify-center text-center z-15">
            <span className="text-xs text-rose-500 font-bold mb-1">DEAR SPECIAL ONE</span>
            <p className="font-theme-display text-sm font-bold text-stone-800 line-clamp-2">
              {letterText}
            </p>
            <div className="w-12 h-0.5 bg-rose-200 mt-2 rounded-full" />
          </div>

          {/* Front Wax Seal Button */}
          <div
            className={`absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-[#A8383B] border-4 border-[#8E2B2E] shadow-xl flex items-center justify-center text-white text-lg transition-transform duration-300 ${
              isOpen ? 'scale-0 opacity-0' : 'animate-pulse hover:scale-110'
            }`}
          >
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
        </div>
        </GlareHover>
      ) : null}

      {/* THEME 2: Y2K Cyber Pixel Box */}
      {!envelopeStyle && theme === 'y2k' && (
        <div
          onClick={handleOpen}
          className="w-full max-w-xs bg-[#E0E0E0] border-4 border-t-white border-l-white border-r-stone-800 border-b-stone-800 shadow-[6px_6px_0px_#FF3399] p-4 text-left cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 transition"
        >
          <div className="bg-[#FF3399] px-2 py-1 text-white text-[11px] font-bold flex items-center justify-between mb-3">
            <span>🎁 GIFT_FILE_V1.EXE</span>
            <span className="bg-white text-black px-1 text-[9px]">X</span>
          </div>
          <div className="bg-white border-2 border-stone-600 p-4 mb-3 text-center">
            <div className="text-4xl mb-2 animate-bounce">👾</div>
            <p className="font-theme-display text-sm font-bold text-[#2D1B4E]">
              {letterText}
            </p>
          </div>
          <button className="w-full py-2.5 bg-[#FF3399] text-white font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#2D1B4E] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>CLICK TO UNPACK FILE</span>
          </button>
        </div>
      )}

      {/* THEME 3: Midnight Cinema Ticket */}
      {!envelopeStyle && theme === 'cinema' && (
        <div
          onClick={handleOpen}
          className="w-full max-w-xs bg-[#252030] border-2 border-[#E8B86D]/60 rounded-2xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer text-left relative overflow-hidden group hover:border-[#E8B86D] transition"
        >
          <div className="flex items-center justify-between border-b border-[#E8B86D]/20 pb-3 mb-3">
            <span className="text-[10px] font-mono tracking-widest text-[#E8B86D] uppercase">
              ADMIT ONE • MEMORY CINEMA
            </span>
            <span className="text-xs">🎬</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#FDF6E9] mb-1">
            Midnight Screening
          </h3>
          <p className="text-xs text-[#C5B8A5] mb-4">
            {letterText}
          </p>
          <div className="bg-[#1A1622] rounded-xl p-3 flex items-center justify-between border border-[#E8B86D]/30 group-hover:bg-[#E8B86D] group-hover:text-stone-900 transition">
            <span className="text-xs font-bold text-[#E8B86D] group-hover:text-stone-900">
              แตะเพื่อฉายภาพยนตร์ความทรงจำ
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* THEME 4: Festive Celebration Gift Box */}
      {!envelopeStyle && theme === 'festive' && (
        <div
          onClick={handleOpen}
          className="w-full max-w-xs bg-[#FFFDF7] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-2xl cursor-pointer text-center relative group hover:scale-[1.02] transition"
        >
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#C83E3B] to-rose-400 text-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition">
            <Gift className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
            HOLIDAY SPECIAL
          </span>
          <p className="font-theme-display text-sm font-bold text-[#1B3B2B] mt-1 mb-4">
            {letterText}
          </p>
          <button className="w-full py-2.5 rounded-2xl bg-[#C83E3B] hover:bg-[#b03431] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5">
            <span>แตะเพื่อแกะกล่องของขวัญ 🎄</span>
          </button>
        </div>
      )}

      {/* Tap prompt (Draggable / Movable) - Requirement 8 */}
      <div
        onPointerDown={(e) => handleDragText(e, 'promptPos', promptPos)}
        style={{
          transform: `translate(${promptPos?.x || 0}px, ${promptPos?.y || 0}px)`,
          touchAction: 'none'
        }}
        className="mt-6 cursor-grab active:cursor-grabbing select-none hover:ring-1 hover:ring-rose-400/40 rounded-lg px-2 py-0.5 transition-shadow"
        title="คลิกค้างแล้วลากเพื่อปรับตำแหน่งข้อความ"
      >
        <p className="text-[11px] opacity-60 animate-pulse pointer-events-none">
          {promptText}
        </p>
      </div>
    </div>
  );
}
