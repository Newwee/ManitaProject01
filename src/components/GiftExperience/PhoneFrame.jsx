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
  Palette
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState('all');
  const themeData = THEME_PRESETS[theme] || THEME_PRESETS.scrapbook;
  const containerRef = useRef(null);

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

  // Draggable item helper for custom placed decorations (Saved & Remembered)
  const handleDecPointerDown = (e, decId) => {
    if (!isEditable) return;
    e.stopPropagation();
    e.preventDefault();
    if (!onUpdateDecorations || !containerRef.current) return;

    setSelectedDecId(decId);

    const startX = e.clientX;
    const startY = e.clientY;
    const currentList = [...(decorationsRef.current || [])];
    const targetDec = currentList.find((d) => d.id === decId);
    if (!targetDec) return;

    const initX = targetDec.x !== undefined ? targetDec.x : 50;
    const initY = targetDec.y !== undefined ? targetDec.y : 50;
    const rect = containerRef.current.getBoundingClientRect();

    let lastX = initX;
    let lastY = initY;

    const handlePointerMove = (me) => {
      me.preventDefault();
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      const newX = Math.round(Math.max(4, Math.min(96, initX + dx)));
      const newY = Math.round(Math.max(4, Math.min(96, initY + dy)));

      lastX = newX;
      lastY = newY;

      const nextList = (decorationsRef.current || []).map((d) =>
        d.id === decId ? { ...d, x: newX, y: newY } : d
      );
      decorationsRef.current = nextList;
      onUpdateDecorations(nextList);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      // Commit final position to remember
      const finalList = (decorationsRef.current || []).map((d) =>
        d.id === decId ? { ...d, x: lastX, y: lastY } : d
      );
      decorationsRef.current = finalList;
      onUpdateDecorations(finalList);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleRemoveDecoration = (e, decId) => {
    e.stopPropagation();
    if (onUpdateDecorations) {
      const nextList = (decorationsRef.current || []).filter((d) => d.id !== decId);
      decorationsRef.current = nextList;
      onUpdateDecorations(nextList);
      if (selectedDecId === decId) setSelectedDecId(null);
    }
  };

  const handleScaleDecoration = (e, decId, delta) => {
    e.stopPropagation();
    if (onUpdateDecorations) {
      const nextList = (decorationsRef.current || []).map((d) => {
        if (d.id === decId) {
          const currentScale = d.scale || 1;
          const newScale = Math.max(0.5, Math.min(2.5, +(currentScale + delta).toFixed(2)));
          return { ...d, scale: newScale };
        }
        return d;
      });
      decorationsRef.current = nextList;
      onUpdateDecorations(nextList);
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
      onUpdateDecorations(nextList);
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

      {/* Draggable Placed Decorations Overlay (Position Saved & Remembered) */}
      {decorations &&
        decorations.map((dec) => {
          const isSelected = selectedDecId === dec.id;
          return (
            <div
              key={dec.id}
              onPointerDown={(e) => handleDecPointerDown(e, dec.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDecId(dec.id);
              }}
              style={{
                left: `${dec.x !== undefined ? dec.x : 50}%`,
                top: `${dec.y !== undefined ? dec.y : 50}%`,
                transform: `translate(-50%, -50%) rotate(${dec.rotation || 0}deg) scale(${dec.scale || 1})`,
                touchAction: 'none'
              }}
              className={`absolute z-25 select-none transition-shadow ${
                isEditable ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
              } ${isSelected && isEditable ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-white/70 rounded-xl' : ''}`}
              title={isEditable ? 'แตะค้างแล้วลากเพื่อย้ายตำแหน่งของตกแต่ง' : undefined}
            >
              <img
                src={dec.src}
                alt="decoration"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none drop-shadow-md"
              />

              {/* Action Toolbar on Selected / Hovered Decoration */}
              {isEditable && (
                <div
                  className={`absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900/90 backdrop-blur-xs text-white rounded-full px-1.5 py-0.5 shadow-lg border border-white/20 transition-opacity ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 hover:opacity-100 pointer-events-none'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => handleScaleDecoration(e, dec.id, 0.15)}
                    className="p-0.5 hover:text-rose-400 transition"
                    title="ขยายขนาด"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleScaleDecoration(e, dec.id, -0.15)}
                    className="p-0.5 hover:text-rose-400 transition"
                    title="ย่อขนาด"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRotateDecoration(e, dec.id)}
                    className="p-0.5 hover:text-amber-400 transition"
                    title="หมุนองศา"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveDecoration(e, dec.id)}
                    className="p-0.5 text-red-400 hover:text-red-300 transition"
                    title="ลบสติกเกอร์นี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

      {/* Active Stage Body */}
      <div className="flex-1 flex flex-col overflow-y-auto relative p-3 z-10">
        {children}
      </div>

      {/* Floating Preview Decoration Toolbar (For Creator Mode) */}
      {isEditable && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl text-white text-xs select-none">
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
