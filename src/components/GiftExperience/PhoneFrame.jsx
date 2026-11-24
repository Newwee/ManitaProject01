import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Battery,
  RotateCcw,
  ChevronLeft,
  X,
  Sparkles,
  Plus,
  Minus,
  RotateCw,
  Trash2,
  Move
} from 'lucide-react';
import { THEME_PRESETS } from '../../types/themePresets';
import { DECORATION_ASSETS } from '../../types/assetManifests';

const DECORATION_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด (146)' },
  { id: 'letters', label: '🔤 อักษรวินเทจ A-Z', pattern: '_1_261122_1' },
  { id: 'symbols', label: '🔢 ตัวเลข & สัญลักษณ์', pattern: '_1_261122_2' },
  { id: 'ribbons', label: '🎀 ริบบิ้น & โบว์', pattern: '_1_261122_3' },
  { id: 'bears', label: '🧸 หมี & ตัวการ์ตูน', pattern: '261122_1' },
  { id: 'badges', label: '🏷️ เข็มกลัด & แสตมป์', pattern: '261122_2' },
  { id: 'lace', label: '🧵 ลูกไม้ & กรอบวินเทจ', pattern: '261122_3' },
  { id: 'hearts', label: '💖 หัวใจ & ประกาย', pattern: '261122_4' },
  { id: 'treats', label: '🍰 ของขวัญ & ขนม', pattern: '261122_5' }
];

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
  onAddDecoration,
  isEditable = false,
  children
}) {
  const [timeStr, setTimeStr] = useState('12:00');
  const [selectedDecId, setSelectedDecId] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState('all');
  const themeData = THEME_PRESETS[theme] || THEME_PRESETS.scrapbook;

  const containerRef = useRef(null);
  const decElementsRef = useRef({});
  const activeTransformRef = useRef(null);

  // Keep ref up-to-date with current decorations to eliminate stale closure bugs during drag
  const decorationsRef = useRef(decorations);
  useEffect(() => {
    decorationsRef.current = decorations;
  }, [decorations]);

  // In Stage 1 (Passcode), use specific passcode background if configured
  const effectiveBackground =
    currentStage === 1 && passcodeBackground
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

  // Helper to get center coordinates of a decoration on screen
  const getDecCenter = (decId) => {
    const el = decElementsRef.current[decId];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    };
  };

  // 1. Move Handler: Dragging the decoration body anywhere on the phone
  const handleBodyPointerDown = (e, dec) => {
    if (!isEditable) return;
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    setSelectedDecId(dec.id);
    setIsTransforming(true);

    const containerRect = containerRef.current.getBoundingClientRect();
    activeTransformRef.current = {
      type: 'move',
      decId: dec.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: dec.x !== undefined ? dec.x : 50,
      initY: dec.y !== undefined ? dec.y : 50,
      width: containerRect.width,
      height: containerRect.height,
      currentX: dec.x !== undefined ? dec.x : 50,
      currentY: dec.y !== undefined ? dec.y : 50
    };
  };

  // 2. Corner Scale Handler: Dragging corner handles to pull/resize
  const handleScalePointerDown = (e, dec, corner) => {
    if (!isEditable) return;
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const center = getDecCenter(dec.id);
    if (!center) return;

    setIsTransforming(true);
    const initialDist = Math.max(15, Math.hypot(e.clientX - center.x, e.clientY - center.y));
    const initScale = dec.scale || 1;

    activeTransformRef.current = {
      type: 'scale',
      decId: dec.id,
      corner,
      centerX: center.x,
      centerY: center.y,
      initialDist,
      initScale,
      currentScale: initScale
    };
  };

  // 3. Rotation Handler: Dragging top stem/handle to rotate
  const handleRotatePointerDown = (e, dec) => {
    if (!isEditable) return;
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    const center = getDecCenter(dec.id);
    if (!center) return;

    setIsTransforming(true);
    const initialAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
    const initRotation = dec.rotation || 0;

    activeTransformRef.current = {
      type: 'rotate',
      decId: dec.id,
      centerX: center.x,
      centerY: center.y,
      initialAngle,
      initRotation,
      currentRotation: initRotation,
      hasMoved: false
    };
  };

  // Unified Pointer Move
  const handleTransformPointerMove = (e) => {
    const transform = activeTransformRef.current;
    if (!transform) return;
    e.stopPropagation();

    if (transform.type === 'move') {
      const { startX, startY, initX, initY, width, height, decId } = transform;
      const dx = ((e.clientX - startX) / width) * 100;
      const dy = ((e.clientY - startY) / height) * 100;

      const newX = Math.round(Math.max(4, Math.min(96, initX + dx)));
      const newY = Math.round(Math.max(4, Math.min(96, initY + dy)));

      transform.currentX = newX;
      transform.currentY = newY;

      const overTrash = newY >= 75 && newX >= 25 && newX <= 75;
      setIsOverTrash(overTrash);

      const nextList = (decorationsRef.current || []).map((d) =>
        d.id === decId ? { ...d, x: newX, y: newY } : d
      );
      decorationsRef.current = nextList;
      if (onUpdateDecorations) {
        onUpdateDecorations(nextList, false); // Fast 60fps update
      }
    } else if (transform.type === 'scale') {
      const { centerX, centerY, initialDist, initScale, decId } = transform;
      const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const ratio = currentDist / initialDist;
      const newScale = Math.max(0.4, Math.min(3.2, +(initScale * ratio).toFixed(2)));

      transform.currentScale = newScale;

      const nextList = (decorationsRef.current || []).map((d) =>
        d.id === decId ? { ...d, scale: newScale } : d
      );
      decorationsRef.current = nextList;
      if (onUpdateDecorations) {
        onUpdateDecorations(nextList, false);
      }
    } else if (transform.type === 'rotate') {
      const { centerX, centerY, initialAngle, initRotation, decId } = transform;
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const delta = currentAngle - initialAngle;
      let newRot = Math.round((initRotation + delta) % 360);
      if (newRot < 0) newRot += 360;

      transform.currentRotation = newRot;
      transform.hasMoved = true;

      const nextList = (decorationsRef.current || []).map((d) =>
        d.id === decId ? { ...d, rotation: newRot } : d
      );
      decorationsRef.current = nextList;
      if (onUpdateDecorations) {
        onUpdateDecorations(nextList, false);
      }
    }
  };

  // Unified Pointer Up / Release
  const handleTransformPointerUp = (e) => {
    const transform = activeTransformRef.current;
    if (!transform) return;
    e.stopPropagation();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const { decId, type } = transform;

    if (type === 'move' && isOverTrash) {
      handleRemoveDecoration(null, decId);
      setIsOverTrash(false);
      activeTransformRef.current = null;
      setIsTransforming(false);
      return;
    }
    setIsOverTrash(false);

    let finalList = decorationsRef.current || [];

    if (type === 'rotate' && !transform.hasMoved) {
      const nextRot = ((transform.initRotation || 0) + 20) % 360;
      finalList = finalList.map((d) => (d.id === decId ? { ...d, rotation: nextRot } : d));
    } else if (type === 'move' && transform.currentX !== undefined) {
      finalList = finalList.map((d) =>
        d.id === decId ? { ...d, x: transform.currentX, y: transform.currentY } : d
      );
    } else if (type === 'scale' && transform.currentScale !== undefined) {
      finalList = finalList.map((d) =>
        d.id === decId ? { ...d, scale: transform.currentScale } : d
      );
    }

    decorationsRef.current = finalList;
    if (onUpdateDecorations) {
      onUpdateDecorations(finalList, true);
    }

    activeTransformRef.current = null;
    setIsTransforming(false);
  };

  const handleRemoveDecoration = (e, decId) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const currentList = decorationsRef.current || decorations || [];
    const nextList = currentList.filter((d) => d.id !== decId);
    decorationsRef.current = nextList;
    if (onUpdateDecorations) {
      onUpdateDecorations(nextList, true);
    }
    setSelectedDecId(null);
  };

  const handleScaleDecoration = (e, decId, delta) => {
    e.stopPropagation();
    if (onUpdateDecorations) {
      const nextList = (decorationsRef.current || []).map((d) => {
        if (d.id === decId) {
          const currentScale = d.scale || 1;
          const newScale = Math.max(0.4, Math.min(3.2, +(currentScale + delta).toFixed(2)));
          return { ...d, scale: newScale };
        }
        return d;
      });
      decorationsRef.current = nextList;
      onUpdateDecorations(nextList, true);
    }
  };

  const handleRotateDecoration = (e, decId) => {
    e.stopPropagation();
    if (onUpdateDecorations) {
      const nextList = (decorationsRef.current || []).map((d) => {
        if (d.id === decId) {
          const currentRot = d.rotation || 0;
          return { ...d, rotation: (currentRot + 20) % 360 };
        }
        return d;
      });
      decorationsRef.current = nextList;
      onUpdateDecorations(nextList, true);
    }
  };

  // Filtered decorations for the preview drawer
  const filteredDrawerDecs = DECORATION_ASSETS.filter((item) => {
    if (drawerCategory === 'all') return true;
    const cat = DECORATION_CATEGORIES.find((c) => c.id === drawerCategory);
    return cat?.pattern ? item.sourceFile?.includes(cat.pattern) : true;
  });

  return (
    <div
      ref={containerRef}
      onClick={() => setSelectedDecId(null)}
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

      {/* Phone Camera Notch & Status Bar (Dims during transform) */}
      <div
        className={`w-full pt-3 pb-2 px-6 flex items-center justify-between text-xs select-none z-20 shrink-0 relative transition-opacity duration-200 ${
          isTransforming ? 'opacity-20' : 'opacity-85'
        }`}
      >
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

      {/* Mini Stage Progress Bar, Stage Navigation & Theme Badge (Dims during transform) */}
      <div
        className={`px-5 py-1.5 flex items-center justify-between z-20 shrink-0 relative transition-opacity duration-200 ${
          isTransforming ? 'opacity-20' : 'opacity-100'
        }`}
      >
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

      {/* Active Stage Body (Keypad, Envelope, Chat) - Dims & disables pointer events during active transform */}
      <div
        className={`flex-1 flex flex-col overflow-y-auto relative p-3 z-10 transition-opacity duration-200 ${
          isTransforming ? 'opacity-20 pointer-events-none' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {/* DRAGGABLE & TRANSFORMABLE DECORATIONS OVERLAY (RENDERED AFTER STAGE BODY WITH HIGH Z-INDEX) */}
      {decorations &&
        decorations.map((dec) => {
          const isSelected = selectedDecId === dec.id;
          const currentRotation = dec.rotation || 0;
          const currentScale = dec.scale || 1;

          return (
            <div
              key={dec.id}
              ref={(el) => {
                decElementsRef.current[dec.id] = el;
              }}
              style={{
                left: `${dec.x !== undefined ? dec.x : 50}%`,
                top: `${dec.y !== undefined ? dec.y : 50}%`,
                transform: `translate(-50%, -50%) rotate(${currentRotation}deg) scale(${currentScale})`,
                touchAction: 'none'
              }}
              className={`absolute select-none transition-shadow ${
                isSelected ? 'z-50' : 'z-40'
              } ${isEditable ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'} ${
                isTransforming && !isSelected ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {/* Main Decoration Container */}
              <div
                onPointerDown={(e) => handleBodyPointerDown(e, dec)}
                onPointerMove={handleTransformPointerMove}
                onPointerUp={handleTransformPointerUp}
                onPointerCancel={handleTransformPointerUp}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDecId(dec.id);
                }}
                className={`relative p-1 rounded-xl transition-all ${
                  isSelected && isEditable
                    ? 'ring-2 ring-dashed ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] bg-white/10 backdrop-blur-2xs'
                    : ''
                }`}
                title={isEditable ? 'แตะ/คลิกเพื่อเลือก ดึงมุมปรับขนาด หรือลากไปวางตำแหน่งใดก็ได้' : undefined}
              >
                {/* Sticker Image */}
                <img
                  src={dec.src}
                  alt="decoration"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none drop-shadow-md select-none"
                />

                {/* INTERACTIVE TRANSFORM GIZMO (VISIBLE WHEN SELECTED IN EDIT MODE) */}
                {isSelected && isEditable && (
                  <>
                    {/* Top Rotation Stem & Handle (ปรับความเอียงได้) */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-50 select-none">
                      <div
                        onPointerDown={(e) => handleRotatePointerDown(e, dec)}
                        onPointerMove={handleTransformPointerMove}
                        onPointerUp={handleTransformPointerUp}
                        onPointerCancel={handleTransformPointerUp}
                        className="w-7 h-7 rounded-full bg-white border-2 border-rose-500 shadow-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 hover:scale-115 active:scale-125 cursor-grab active:cursor-grabbing transition-transform touch-none"
                        title="คลิกลากเพื่อหมุนองศาอิสระ หรือแตะเพื่อหมุน +20°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-0.5 h-3 bg-rose-500" />
                    </div>

                    {/* 4 Corner Pull Handles for Interactive Resizing (ดึงมุมปรับขนาด) */}
                    {/* Top-Left (NW) */}
                    <div
                      onPointerDown={(e) => handleScalePointerDown(e, dec, 'nw')}
                      onPointerMove={handleTransformPointerMove}
                      onPointerUp={handleTransformPointerUp}
                      onPointerCancel={handleTransformPointerUp}
                      className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center cursor-nwse-resize z-50 hover:scale-125 active:scale-125 transition-transform touch-none"
                      title="ลากมุมนี้เพื่อย่อ-ขยายขนาด"
                    >
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>

                    {/* Top-Right (NE) */}
                    <div
                      onPointerDown={(e) => handleScalePointerDown(e, dec, 'ne')}
                      onPointerMove={handleTransformPointerMove}
                      onPointerUp={handleTransformPointerUp}
                      onPointerCancel={handleTransformPointerUp}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center cursor-nesw-resize z-50 hover:scale-125 active:scale-125 transition-transform touch-none"
                      title="ลากมุมนี้เพื่อย่อ-ขยายขนาด"
                    >
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>

                    {/* Bottom-Left (SW) */}
                    <div
                      onPointerDown={(e) => handleScalePointerDown(e, dec, 'sw')}
                      onPointerMove={handleTransformPointerMove}
                      onPointerUp={handleTransformPointerUp}
                      onPointerCancel={handleTransformPointerUp}
                      className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center cursor-nesw-resize z-50 hover:scale-125 active:scale-125 transition-transform touch-none"
                      title="ลากมุมนี้เพื่อย่อ-ขยายขนาด"
                    >
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>

                    {/* Bottom-Right (SE) */}
                    <div
                      onPointerDown={(e) => handleScalePointerDown(e, dec, 'se')}
                      onPointerMove={handleTransformPointerMove}
                      onPointerUp={handleTransformPointerUp}
                      onPointerCancel={handleTransformPointerUp}
                      className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-white border-2 border-rose-500 shadow-md flex items-center justify-center cursor-nwse-resize z-50 hover:scale-125 active:scale-125 transition-transform touch-none"
                      title="ลากมุมนี้เพื่อย่อ-ขยายขนาด"
                    >
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>

                    {/* Quick Floating Toolbar (Above the rotation handle) */}
                    <div
                      className="absolute -top-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-stone-900/95 backdrop-blur-md text-white rounded-full px-2 py-1 shadow-2xl border border-white/25 z-50 select-none animate-in fade-in zoom-in-95 duration-150"
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerMove={(e) => e.stopPropagation()}
                      onPointerUp={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleScaleDecoration(e, dec.id, 0.15)}
                        className="p-1 hover:text-rose-400 active:scale-90 transition rounded-full hover:bg-white/10"
                        title="ขยายขนาด (+)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleScaleDecoration(e, dec.id, -0.15)}
                        className="p-1 hover:text-rose-400 active:scale-90 transition rounded-full hover:bg-white/10"
                        title="ย่อขนาด (-)"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleRotateDecoration(e, dec.id)}
                        className="p-1 hover:text-amber-400 active:scale-90 transition rounded-full hover:bg-white/10"
                        title="หมุนองศา (+20°)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-3 bg-white/20 mx-0.5" />
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleRemoveDecoration(e, dec.id)}
                        className="p-1 text-red-400 hover:text-red-300 active:scale-90 transition rounded-full hover:bg-red-500/20 cursor-pointer"
                        title="ลบสติกเกอร์นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

      {isEditable && isTransforming && activeTransformRef.current?.type === 'move' && (
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200 flex flex-col items-center gap-1.5 ${
            isOverTrash ? 'scale-125 -translate-y-2' : 'scale-100 animate-bounce'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${
              isOverTrash
                ? 'bg-red-600 text-white ring-4 ring-red-400/90 shadow-[0_0_25px_rgba(239,68,68,0.85)] animate-pulse'
                : 'bg-stone-900/90 text-red-400 border border-red-500/40 backdrop-blur-md'
            }`}
          >
            <Trash2 className={`transition-transform duration-200 ${isOverTrash ? 'w-7 h-7 scale-110' : 'w-6 h-6'}`} />
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-md whitespace-nowrap transition-all ${
              isOverTrash
                ? 'bg-red-600 text-white'
                : 'bg-stone-900/85 text-red-200 border border-white/20 backdrop-blur-xs'
            }`}
          >
            {isOverTrash ? 'ปล่อยเพื่อลบทันที! 🔥' : 'ลากมาที่นี่เพื่อลบ 🗑️'}
          </span>
        </div>
      )}

      {/* Floating Preview Decoration Toolbar (For Creator Mode) - Dims during transform */}
      {isEditable && (
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl text-white text-xs select-none transition-opacity duration-200 ${
            isTransforming ? 'opacity-20 pointer-events-none' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDrawerOpen(!isDrawerOpen);
            }}
            className="flex items-center gap-1.5 font-bold hover:text-rose-300 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>🎨 ตกแต่งการ์ด</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/80 text-[10px]">
              {decorations.length}
            </span>
          </button>
          {decorations.length > 0 && (
            <>
              <span className="text-white/30">|</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUpdateDecorations) {
                    decorationsRef.current = [];
                    onUpdateDecorations([]);
                    setSelectedDecId(null);
                  }
                }}
                className="text-[11px] text-stone-300 hover:text-red-400 transition"
                title="ล้างของตกแต่งทั้งหมดบนหน้าจอ"
              >
                ล้างทั้งหมด
              </button>
            </>
          )}
        </div>
      )}

      {/* Sliding Decoration Drawer inside Preview */}
      {isEditable && isDrawerOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-2 bottom-2 max-h-[55%] rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200 dark:border-stone-700 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-100">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>แตะสติกเกอร์เพื่อวาง แล้วลากย้ายได้เลย</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5 border-b border-stone-100 dark:border-stone-800 no-scrollbar shrink-0">
            {DECORATION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setDrawerCategory(cat.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 transition ${
                  drawerCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sticker Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-5 gap-2">
            {filteredDrawerDecs.map((dec, idx) => (
              <button
                key={dec.id}
                type="button"
                onClick={() => {
                  if (onAddDecoration) {
                    onAddDecoration(dec);
                  } else if (onUpdateDecorations) {
                    const newDec = {
                      id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                      src: dec.src,
                      x: 50,
                      y: 50,
                      scale: 1,
                      rotation: 0
                    };
                    const nextList = [...(decorationsRef.current || []), newDec];
                    decorationsRef.current = nextList;
                    onUpdateDecorations(nextList);
                  }
                }}
                title={`สติกเกอร์ที่ ${idx + 1}`}
                className="w-12 h-12 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-800/80 hover:border-rose-400 hover:scale-110 active:scale-95 transition p-1 flex items-center justify-center shadow-2xs"
              >
                <img
                  src={dec.src}
                  alt={`Sticker ${idx + 1}`}
                  className="w-full h-full object-contain pointer-events-none"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
