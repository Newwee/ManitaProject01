import React, { useState, useEffect, useRef } from 'react';
import { Lock, Clock, Heart, Sparkles, ChevronRight, Gift, Plus, Minus, RotateCw } from 'lucide-react';
import { playChime } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';
import BlurText from '../UI/BlurText';
import GlareHover from '../UI/GlareHover';

/**
 * Interactive & Transformable Wax Seal Button
 * Supports dragging anywhere on the envelope, corner scale, rotation, and tap-to-open
 */
function WaxSealButton({
  pos = { x: 50, y: 50 },
  scale = 1,
  rotation = 0,
  isOpen = false,
  isEditable = false,
  wrapperRef,
  onOpen,
  onChangeConfig
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [tempPos, setTempPos] = useState(null);
  const [tempScale, setTempScale] = useState(null);
  const [tempRotation, setTempRotation] = useState(null);

  const activeTransformRef = useRef(null);
  const sealRef = useRef(null);

  const currentX = tempPos?.x !== undefined ? tempPos.x : (pos?.x !== undefined ? pos.x : 50);
  const currentY = tempPos?.y !== undefined ? tempPos.y : (pos?.y !== undefined ? pos.y : 50);
  const currentScale = tempScale !== null ? tempScale : (scale || 1);
  const currentRotation = tempRotation !== null ? tempRotation : (rotation || 0);

  // Auto-deselect when clicking outside
  useEffect(() => {
    if (!isSelected) return;
    const handleOutsideClick = (e) => {
      if (sealRef.current && !sealRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick);
    return () => window.removeEventListener('pointerdown', handleOutsideClick);
  }, [isSelected]);

  // 1. Move Pointer Down
  const handleMovePointerDown = (e) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const rect = wrapperRef.current ? wrapperRef.current.getBoundingClientRect() : { width: 300, height: 200 };
    activeTransformRef.current = {
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
      width: rect.width,
      height: rect.height,
      hasMoved: false
    };
    setIsDragging(true);
  };

  // 2. Corner Scale Pointer Down
  const handleScalePointerDown = (e) => {
    if (!isEditable) return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const rect = sealRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const initialDist = Math.max(15, Math.hypot(e.clientX - centerX, e.clientY - centerY));

    activeTransformRef.current = {
      type: 'scale',
      centerX,
      centerY,
      initialDist,
      initScale: currentScale,
      hasMoved: false
    };
    setIsDragging(true);
  };

  // 3. Rotation Pointer Down
  const handleRotatePointerDown = (e) => {
    if (!isEditable) return;
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const rect = sealRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    activeTransformRef.current = {
      type: 'rotate',
      centerX,
      centerY,
      initialAngle,
      initRotation: currentRotation,
      hasMoved: false
    };
    setIsDragging(true);
  };

  // Unified Pointer Move
  const handlePointerMove = (e) => {
    const transform = activeTransformRef.current;
    if (!transform) return;
    e.stopPropagation();

    const dist = Math.hypot(
      e.clientX - (transform.startX || transform.centerX),
      e.clientY - (transform.startY || transform.centerY)
    );
    if (dist > 4) transform.hasMoved = true;

    if (transform.type === 'move') {
      const { startX, startY, initX, initY, width, height } = transform;
      const dx = ((e.clientX - startX) / width) * 100;
      const dy = ((e.clientY - startY) / height) * 100;
      const newX = Math.round(Math.max(5, Math.min(95, initX + dx)));
      const newY = Math.round(Math.max(5, Math.min(95, initY + dy)));
      setTempPos({ x: newX, y: newY });
    } else if (transform.type === 'scale') {
      const { centerX, centerY, initialDist, initScale } = transform;
      const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const ratio = currentDist / initialDist;
      const newScale = Math.max(0.5, Math.min(2.5, +(initScale * ratio).toFixed(2)));
      setTempScale(newScale);
    } else if (transform.type === 'rotate') {
      const { centerX, centerY, initialAngle, initRotation } = transform;
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const delta = currentAngle - initialAngle;
      let newRot = Math.round((initRotation + delta) % 360);
      if (newRot < 0) newRot += 360;
      setTempRotation(newRot);
    }
  };

  // Unified Pointer Up
  const handlePointerUp = (e) => {
    const transform = activeTransformRef.current;
    if (!transform) return;
    e.stopPropagation();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const { type, hasMoved } = transform;
    activeTransformRef.current = null;
    setIsDragging(false);

    if (hasMoved) {
      if (type === 'move' && tempPos) {
        onChangeConfig && onChangeConfig({ waxSealPos: tempPos });
      } else if (type === 'scale' && tempScale) {
        onChangeConfig && onChangeConfig({ waxSealScale: tempScale });
      } else if (type === 'rotate' && tempRotation !== null) {
        onChangeConfig && onChangeConfig({ waxSealRotation: tempRotation });
      }
      return;
    }

    // Clean tap without drag
    if (!isEditable) {
      onOpen && onOpen();
    } else {
      setIsSelected((prev) => !prev);
    }
  };

  // Quick action toolbar helpers
  const handleStepScale = (e, delta) => {
    e.stopPropagation();
    const nextScale = Math.max(0.5, Math.min(2.5, +(currentScale + delta).toFixed(2)));
    setTempScale(null);
    onChangeConfig && onChangeConfig({ waxSealScale: nextScale });
  };

  const handleStepRotate = (e) => {
    e.stopPropagation();
    const nextRot = (currentRotation + 20) % 360;
    setTempRotation(null);
    onChangeConfig && onChangeConfig({ waxSealRotation: nextRot });
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setTempPos(null);
    setTempScale(null);
    setTempRotation(null);
    onChangeConfig && onChangeConfig({ waxSealPos: { x: 50, y: 50 }, waxSealScale: 1, waxSealRotation: 0 });
  };

  return (
    <div
      ref={sealRef}
      style={{
        left: `${currentX}%`,
        top: `${currentY}%`,
        transform: `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${currentScale})`,
        touchAction: 'none'
      }}
      className={`absolute z-40 select-none ${
        isOpen ? 'scale-0 opacity-0 pointer-events-none' : ''
      } transition-transform duration-300`}
    >
      {/* Wax Seal Circle Button */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handleMovePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-12 h-12 rounded-full bg-[#A8383B] border-4 border-[#8E2B2E] shadow-xl flex items-center justify-center text-white text-lg relative transition-all ${
          isEditable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer animate-pulse hover:scale-110'
        } ${isSelected && isEditable ? 'ring-2 ring-dashed ring-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : ''}`}
        title={isEditable ? 'คลิกลากเพื่อย้ายตำแหน่ง หรือแตะเพื่อปรับแต่ง/เปิดซอง' : 'แตะเพื่อเปิดซองจดหมาย'}
      >
        <Heart className="w-5 h-5 fill-white text-white pointer-events-none" />

        {/* Transform Gizmo Handles when selected in Edit mode */}
        {isSelected && isEditable && (
          <>
            {/* Top Rotation Stem & Handle */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center select-none z-50">
              <div
                onPointerDown={handleRotatePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="w-6 h-6 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center text-rose-600 hover:bg-rose-50 active:scale-110 cursor-grab active:cursor-grabbing touch-none"
                title="ลากเพื่อหมุนองศา"
              >
                <RotateCw className="w-3 h-3" />
              </div>
              <div className="w-0.5 h-2.5 bg-rose-500" />
            </div>

            {/* Corner Scale Pull Handle (SE) */}
            <div
              onPointerDown={handleScalePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center cursor-nwse-resize z-50 hover:scale-125 active:scale-125 touch-none"
              title="ลากเพื่อย่อ-ขยายตราประทับ"
            >
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </div>

            {/* Quick Action Floating Toolbar */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900/95 backdrop-blur-md text-white rounded-full px-2 py-0.5 shadow-2xl border border-white/25 z-50 whitespace-nowrap text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => handleStepScale(e, 0.15)}
                className="p-1 hover:text-rose-400 active:scale-90 transition rounded-full"
                title="ขยายขนาด (+)"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => handleStepScale(e, -0.15)}
                className="p-1 hover:text-rose-400 active:scale-90 transition rounded-full"
                title="ย่อขนาด (-)"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleStepRotate}
                className="p-1 hover:text-amber-400 active:scale-90 transition rounded-full"
                title="หมุนองศา (+20°)"
              >
                <RotateCw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-1.5 py-0.5 hover:text-rose-300 active:scale-90 transition text-[10px] font-semibold"
                title="รีเซ็ตกลับตรงกลาง"
              >
                กึ่งกลาง
              </button>
              <div className="w-px h-3 bg-white/20 mx-0.5" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen && onOpen();
                }}
                className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 rounded-full text-white text-[10px] font-bold active:scale-95 transition flex items-center gap-1"
                title="กดไปหน้าถัดไป"
              >
                <span>กดไปหน้าถัดไป ➔</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
  waxSealPos = { x: 50, y: 50 },
  waxSealScale = 1,
  waxSealRotation = 0,
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

  const customEnvelopeWrapperRef = useRef(null);
  const scrapbookEnvelopeWrapperRef = useRef(null);

  // Helper to drag text elements interactively (Requirement 8 - Position Saved & Remembered)
  const handleDragText = (e, key, currentPos) => {
    if (!onChangeConfig || !isEditable) return;
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initX = currentPos?.x || 0;
    const initY = currentPos?.y || 0;

    let lastX = initX;
    let lastY = initY;

    const handleMove = (me) => {
      me.preventDefault();
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      lastX = Math.round(initX + dx);
      lastY = Math.round(initY + dy);
      onChangeConfig({ [key]: { x: lastX, y: lastY } });
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      onChangeConfig({ [key]: { x: lastX, y: lastY } });
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
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
        <GlareHover maxTilt={8} glareOpacity={0.25} borderRadius="20px" className="mt-4 sm:mt-6">
          <div
            ref={customEnvelopeWrapperRef}
            onClick={isEditable ? undefined : handleOpen}
            className={`envelope-wrapper relative w-72 h-52 sm:w-80 sm:h-56 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-95 ${
              isOpen ? 'envelope-open' : ''
            }`}
          >
            {/* Letter inside that is tucked inside when closed, and slides up when opened */}
            <div
              className={`envelope-letter absolute w-[80%] max-w-[230px] mx-auto inset-x-0 top-6 bottom-4 bg-[#FFFDF9] rounded-2xl border-2 border-[#D5C2B0] shadow-md p-4 flex flex-col items-center justify-center text-center transition-all duration-700 ease-out ${
                isOpen
                  ? '-translate-y-28 sm:-translate-y-32 opacity-100 z-30 shadow-2xl scale-100 pointer-events-auto'
                  : 'opacity-0 translate-y-6 scale-95 pointer-events-none z-10'
              }`}
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 18px, #EFE7DE 19px)'
              }}
            >
              {/* Header Tab */}
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/90 border border-rose-300 text-[10px] font-extrabold text-rose-600 uppercase tracking-widest shadow-2xs mb-2">
                <span>💌</span>
                <span>DEAR SPECIAL ONE</span>
              </div>

              {/* Letter Message Preview / Full Content */}
              <p className="font-theme-display text-xs sm:text-sm font-bold text-stone-800 line-clamp-3 leading-relaxed px-1">
                {letterText}
              </p>
              <div className="w-10 h-0.5 bg-rose-300/70 mt-2 rounded-full" />
            </div>

            {/* Sliced Envelope Front Container */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none drop-shadow-xl">
              <img
                src={envelopeStyle}
                alt="Custom Envelope"
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Front Wax Seal Heart Button - Draggable & Transformable */}
            <WaxSealButton
              pos={waxSealPos}
              scale={waxSealScale}
              rotation={waxSealRotation}
              isOpen={isOpen}
              isEditable={isEditable}
              wrapperRef={customEnvelopeWrapperRef}
              onOpen={handleOpen}
              onChangeConfig={onChangeConfig}
            />
          </div>
        </GlareHover>
      ) : theme === 'scrapbook' ? (
        <GlareHover maxTilt={7} glareOpacity={0.3} borderRadius="16px" className="mt-4 sm:mt-6">
          <div
            ref={scrapbookEnvelopeWrapperRef}
            onClick={isEditable ? undefined : handleOpen}
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

            {/* Letter inside that stays inside when closed and slides up when opened */}
            <div
              className={`envelope-letter absolute inset-x-4 top-4 bottom-2 bg-[#FFFDF9] rounded-xl border-2 border-[#D5C2B0] shadow-md p-3.5 flex flex-col items-center justify-center text-center transition-all duration-700 ease-out ${
                isOpen ? '-translate-y-26 sm:-translate-y-30 shadow-2xl z-30 opacity-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none z-10'
              }`}
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 18px, #EFE7DE 19px)'
              }}
            >
              {/* Header Tab */}
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/90 border border-rose-300 text-[10px] font-extrabold text-rose-600 uppercase tracking-widest shadow-2xs mb-2">
                <span>💌</span>
                <span>DEAR SPECIAL ONE</span>
              </div>
              <p className="font-theme-display text-xs sm:text-sm font-bold text-stone-800 line-clamp-2 px-1">
                {letterText}
              </p>
              <div className="w-12 h-0.5 bg-rose-200 mt-2 rounded-full" />
            </div>

            {/* Front Wax Seal Button - Draggable & Transformable */}
            <WaxSealButton
              pos={waxSealPos}
              scale={waxSealScale}
              rotation={waxSealRotation}
              isOpen={isOpen}
              isEditable={isEditable}
              wrapperRef={scrapbookEnvelopeWrapperRef}
              onOpen={handleOpen}
              onChangeConfig={onChangeConfig}
            />
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

      {/* Explicit Next Stage Button in Edit/Studio Mode */}
      {isEditable && (
        <div className="mt-5 pb-16 flex flex-col items-center gap-1.5 z-30 select-none">
          <button
            type="button"
            onClick={handleOpen}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-white/20"
            title="กดเพื่อไปยังด่านถัดไป"
          >
            <span>กดไปหน้าถัดไป ➔</span>
          </button>
          <span className="text-[10px] text-stone-500 dark:text-stone-400">
            (สามารถลากจัดตำแหน่งตราประทับสีแดงได้อิสระ เมื่อพอใจแล้วกดปุ่มนี้เพื่อไปหน้าถัดไป)
          </span>
        </div>
      )}
    </div>
  );
}
