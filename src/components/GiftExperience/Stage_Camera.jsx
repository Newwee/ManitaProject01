import React, { useState } from 'react';
import { Camera, Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import { playKeyClick, playSuccessFanfare, playTone } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';

export const FRAME_STYLES = [
  { id: 'square', name: 'สี่เหลี่ยมคลาสสิก', desc: 'กรอบโพลารอยด์ขอบขาว' },
  { id: 'circle', name: 'วงกลมมินิมอล', desc: 'กรอบกลมโค้งมน' },
  { id: 'oval', name: 'วงรีนุ่มนวล', desc: 'กรอบวงรีทรงแคปซูล' },
  { id: 'cloud', name: 'ก้อนเมฆหยัก', desc: 'กรอบขอบหยักฟุ้ง' },
  { id: 'dashed', name: 'เส้นประน่ารัก', desc: 'กรอบขอบมนลายเส้นประ' },
  { id: 'arch', name: 'ทรงโค้ง Arch', desc: 'กรอบสไตล์ประตูโค้ง' }
];

export default function Stage_Camera({
  photos = [],
  cameraFrameStyle = 'square',
  onNextStage
}) {
  const [isPrinted, setIsPrinted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const activePhoto = photos && photos.length > 0 && photos[photoIndex]?.url
    ? photos[photoIndex].url
    : '/assets/placeholder_photo.svg';

  const caption = photos && photos.length > 0 && photos[photoIndex]?.caption
    ? photos[photoIndex].caption
    : 'บันทึกภาพความทรงจำของเรา 📸';

  const handleSnap = () => {
    if (isPrinted) return;

    // Camera click sound
    playKeyClick();
    setTimeout(() => {
      playTone(300, 0.15, 'triangle', 0.1);
    }, 120);

    // Camera flash effect
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setIsPrinted(true);
      playSuccessFanfare();
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.6 }
      });
    }, 280);
  };

  const handleRetake = () => {
    setIsPrinted(false);
  };

  // Render photo with selected frame style
  const renderFramedPhoto = () => {
    switch (cameraFrameStyle) {
      case 'circle':
        return (
          <div className="w-52 h-52 mx-auto rounded-full p-2 bg-white shadow-2xl border-4 border-stone-800 overflow-hidden relative">
            <img
              src={activePhoto}
              alt="Memory"
              className="w-full h-full object-cover rounded-full polaroid-developing"
            />
          </div>
        );

      case 'oval':
        return (
          <div className="w-48 h-60 mx-auto rounded-[60px] p-2 bg-white shadow-2xl border-4 border-amber-300 overflow-hidden relative">
            <img
              src={activePhoto}
              alt="Memory"
              className="w-full h-full object-cover rounded-[52px] polaroid-developing"
            />
          </div>
        );

      case 'cloud':
        return (
          <div className="w-56 h-56 mx-auto p-3 bg-white shadow-2xl relative rounded-[32px] border-4 border-emerald-400 overflow-hidden"
               style={{ borderRadius: '42% 58% 62% 38% / 45% 45% 55% 55%' }}>
            <img
              src={activePhoto}
              alt="Memory"
              className="w-full h-full object-cover polaroid-developing"
              style={{ borderRadius: '42% 58% 62% 38% / 45% 45% 55% 55%' }}
            />
          </div>
        );

      case 'dashed':
        return (
          <div className="w-52 h-56 mx-auto p-3 bg-white shadow-2xl rounded-3xl border-4 border-dashed border-rose-400 overflow-hidden relative">
            <img
              src={activePhoto}
              alt="Memory"
              className="w-full h-full object-cover rounded-2xl polaroid-developing"
            />
          </div>
        );

      case 'arch':
        return (
          <div className="w-48 h-60 mx-auto p-2 bg-white shadow-2xl rounded-t-full rounded-b-2xl border-4 border-indigo-400 overflow-hidden relative">
            <img
              src={activePhoto}
              alt="Memory"
              className="w-full h-full object-cover rounded-t-full rounded-b-xl polaroid-developing"
            />
          </div>
        );

      case 'square':
      default:
        return (
          <div className="w-56 bg-white p-3 pb-6 rounded-md shadow-2xl border border-stone-200 mx-auto transform -rotate-1">
            <div className="w-full aspect-square bg-stone-900 rounded-sm overflow-hidden mb-2">
              <img
                src={activePhoto}
                alt="Memory"
                className="w-full h-full object-cover polaroid-developing"
              />
            </div>
            <p className="font-theme-display text-xs font-bold text-center text-stone-800 truncate px-1">
              {caption}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-3 py-2 text-center select-none relative overflow-y-auto">
      {/* Flash overlay */}
      {isFlashing && (
        <div className="fixed inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 opacity-90 animate-pulse" />
      )}

      {/* Header */}
      <div className="pt-2 mb-2">
        <h3 className="font-theme-display text-2xl font-bold text-stone-900 flex items-center justify-center gap-1.5">
          <span>ยิ้มหน่อยย</span>
          <span>📸</span>
        </h3>
        <p className="text-xs opacity-75 mt-0.5">
          กดปุ่มชัตเตอร์สีแดงเพื่อปริ้นท์รูปความทรงจำ
        </p>
      </div>

      {/* Instant Camera Device (Matching Image 4) */}
      <div className="relative w-64 bg-white rounded-3xl shadow-2xl border-2 border-stone-200/90 p-4 pt-3 transition-transform hover:scale-[1.01]">
        {/* Rainbow color stripe */}
        <div className="flex h-1.5 w-full rounded-full overflow-hidden mb-3.5 shadow-xs">
          <div className="flex-1 bg-[#E06D75]"></div>
          <div className="flex-1 bg-[#E5C07B]"></div>
          <div className="flex-1 bg-[#E5D780]"></div>
          <div className="flex-1 bg-[#98C379]"></div>
        </div>

        {/* Camera Face Layout */}
        <div className="flex items-center justify-between px-1 mb-3">
          {/* Viewfinder Square */}
          <div className="w-10 h-10 rounded-xl bg-stone-800 border-2 border-stone-600 shadow-inner flex items-center justify-center relative overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-400/40" />
            </div>
          </div>

          {/* Large Center Lens */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-900 border-4 border-stone-700 shadow-2xl flex items-center justify-center relative">
            <div className="w-16 h-16 rounded-full bg-stone-950 border-2 border-stone-700 flex items-center justify-center relative overflow-hidden">
              {/* Reflection Highlight */}
              <div className="absolute top-2 left-3 w-4 h-2 rounded-full bg-white/20 transform -rotate-45" />
              <div className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-900/60" />
              </div>
            </div>
          </div>

          {/* Red Shutter Button "กด" */}
          <button
            onClick={handleSnap}
            disabled={isPrinted}
            className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#DE5B63] to-[#F28289] text-white font-bold text-xs shadow-lg flex items-center justify-center border-2 border-white active:scale-90 transition ${
              isPrinted
                ? 'opacity-60 cursor-not-allowed scale-95'
                : 'hover:scale-105 animate-pulse shadow-rose-300'
            }`}
          >
            <span>กด</span>
          </button>
        </div>

        {/* Bottom Film Slot */}
        <div className="w-48 h-2.5 mx-auto bg-stone-900 rounded-full shadow-inner border border-stone-800" />
      </div>

      {/* Photo Output Area (Dashed Box in Image 4) */}
      <div className="w-full my-3 min-h-[220px] flex flex-col items-center justify-center">
        {!isPrinted ? (
          <div className="w-64 h-48 rounded-2xl border-2 border-dashed border-stone-300/80 bg-white/30 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-stone-400 relative">
            <span className="text-xl mb-1">🌸</span>
            <p className="font-theme-display text-xs font-semibold text-stone-500">
              รอรูปภาพปริ้นท์ออกมาตรงนี้น้า...
            </p>
            <span className="text-xs text-amber-400 mt-1">✨</span>
          </div>
        ) : (
          <div className="w-full animate-bounce-soft">
            {renderFramedPhoto()}
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => setPhotoIndex((p) => (p > 0 ? p - 1 : photos.length - 1))}
                  className="px-2 py-0.5 rounded bg-white text-[10px] font-bold shadow-xs text-stone-600"
                >
                  ← รูปก่อนหน้า
                </button>
                <span className="text-[10px] font-bold text-stone-500">
                  {photoIndex + 1} / {photos.length}
                </span>
                <button
                  onClick={() => setPhotoIndex((p) => (p < photos.length - 1 ? p + 1 : 0))}
                  className="px-2 py-0.5 rounded bg-white text-[10px] font-bold shadow-xs text-stone-600"
                >
                  รูปถัดไป →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Navigation */}
      <div className="w-full max-w-xs pb-1">
        {isPrinted ? (
          <div className="space-y-1.5">
            <button
              onClick={onNextStage}
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>ไปด่านสุดท้าย: อัลบั้มความทรงจำ & แผ่นเสียง</span>
              <ChevronRight className="w-4 h-4 text-rose-300" />
            </button>
            <button
              onClick={handleRetake}
              className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 mx-auto pt-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>กดถ่ายใหม่อีกครั้ง</span>
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-stone-400 font-medium animate-pulse">
            👆 แตะปุ่มชัตเตอร์สีแดงบนตัวกล้อง
          </p>
        )}
      </div>
    </div>
  );
}
