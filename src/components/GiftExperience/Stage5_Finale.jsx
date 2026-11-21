import React, { useState } from 'react';
import { Disc, ChevronLeft, ChevronRight, Check, Sparkles, Heart } from 'lucide-react';
import { playSuccessFanfare, playTone } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';
import { DEFAULT_PHOTOS } from '../../types/themePresets';

export default function Stage5_Finale({
  voiceCaption = '"ขอบคุณที่เข้ามาเป็นความสุขของเรานะ ♡"',
  photos = DEFAULT_PHOTOS,
  selectedSticker = '💖',
  coupons = [],
  isMusicPlaying = false,
  onToggleMusic
}) {
  const activePhotos = photos && photos.length > 0 ? photos : DEFAULT_PHOTOS;
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoAnimKey, setPhotoAnimKey] = useState(0);
  const [redeemedCoupons, setRedeemedCoupons] = useState({});

  const handlePrevPhoto = () => {
    setPhotoIdx((prev) => (prev > 0 ? prev - 1 : activePhotos.length - 1));
    setPhotoAnimKey((k) => k + 1);
  };

  const handleNextPhoto = () => {
    setPhotoIdx((prev) => (prev < activePhotos.length - 1 ? prev + 1 : 0));
    setPhotoAnimKey((k) => k + 1);
  };

  const handleRedeemCoupon = (idx) => {
    if (redeemedCoupons[idx]) return;

    setRedeemedCoupons((prev) => ({ ...prev, [idx]: true }));
    playSuccessFanfare();

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const currentPhoto = activePhotos[photoIdx] || activePhotos[0];

  return (
    <div className="flex-1 flex flex-col px-1 pb-4 overflow-y-auto space-y-4 select-none">
      {/* 1. Spinning Vinyl Record & Voice Note Widget */}
      <div className="theme-card p-3 flex items-center gap-3 shadow-md">
        <div
          onClick={onToggleMusic}
          className={`w-12 h-12 rounded-full bg-stone-900 border-2 border-stone-700 flex items-center justify-center shrink-0 cursor-pointer relative shadow-md transition ${
            isMusicPlaying ? 'vinyl-spinning ring-2 ring-rose-400' : 'hover:scale-105'
          }`}
          title="แตะเพื่อเปิด/ปิดเสียงดนตรี"
        >
          {/* Vinyl Grooves */}
          <div className="w-8 h-8 rounded-full border border-stone-800"></div>
          <div className="w-4 h-4 rounded-full bg-rose-400 border-2 border-white absolute"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              ♪ Voice & Melody Note
            </span>
            <button
              onClick={onToggleMusic}
              className="text-[10px] font-bold underline text-stone-600 hover:text-stone-900"
            >
              {isMusicPlaying ? 'หยุดเล่น' : 'แตะแผ่นเสียงเพื่อเล่น'}
            </button>
          </div>
          <p className="font-theme-display text-xs font-semibold truncate mt-0.5 text-stone-800">
            {voiceCaption}
          </p>
        </div>
      </div>

      {/* 2. Polaroid Photo Frame with Pinned Sticker */}
      <div className="flex flex-col items-center">
        <div className="relative bg-white text-stone-800 p-3 pb-4 rounded-md shadow-2xl border border-stone-200 w-64 transform -rotate-1 transition-all">
          {/* Pinned Custom Sticker */}
          <div className="absolute -top-4 -right-3 text-3xl drop-shadow-md select-none transform rotate-12 z-20 animate-bounce">
            {selectedSticker}
          </div>

          {/* Photo container */}
          <div className="w-full aspect-square bg-stone-900 overflow-hidden rounded-sm relative">
            <img
              key={photoAnimKey}
              src={currentPhoto.url}
              alt="Memory"
              className="w-full h-full object-cover polaroid-developing"
              onError={(e) => {
                // Fallback to placeholder if broken link
                e.target.src = '/assets/Background.jpg';
              }}
            />
          </div>

          {/* Caption */}
          <p className="font-theme-display text-sm font-bold text-center mt-2.5 text-stone-800 line-clamp-2 min-h-[22px]">
            {currentPhoto.caption || 'ความทรงจำของเรา ♡'}
          </p>

          {/* Prev/Next controls */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[10px] text-stone-500">
            <button
              onClick={handlePrevPhoto}
              className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>ก่อนหน้า</span>
            </button>
            <span className="font-semibold text-stone-700">
              {photoIdx + 1} / {activePhotos.length}
            </span>
            <button
              onClick={handleNextPhoto}
              className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Redeemable Love/Memory Coupons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold flex items-center gap-1.5 text-stone-800">
            <span>🎟️</span>
            <span>คูปองสิทธิพิเศษ (แตะเพื่อกดใช้สิทธิ์)</span>
          </h4>
          <span className="text-[10px] text-rose-500 font-bold">กดใช้ได้จริง!</span>
        </div>

        <div className="space-y-2.5">
          {coupons.map((coupon, idx) => {
            const isRedeemed = redeemedCoupons[idx];
            return (
              <div
                key={idx}
                onClick={() => handleRedeemCoupon(idx)}
                className={`ticket-cutout theme-card p-3.5 relative overflow-hidden cursor-pointer select-none border-2 transition-all duration-300 ${
                  isRedeemed
                    ? 'opacity-85 border-emerald-500/60 bg-emerald-50/30'
                    : 'hover:scale-[1.01] hover:border-rose-400 active:scale-95'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎁</span>
                    <span className="font-theme-display text-xs font-bold text-stone-800">
                      {coupon}
                    </span>
                  </div>

                  {!isRedeemed ? (
                    <button className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm shrink-0">
                      กดใช้
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      <span>ใช้แล้ว</span>
                    </span>
                  )}
                </div>

                {/* Stamp Slam Overlay */}
                {isRedeemed && (
                  <div className="stamp-redeemed absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-emerald-600 text-emerald-700 px-3 py-0.5 rounded-lg font-black tracking-widest text-xs uppercase bg-white/90 shadow-lg pointer-events-none whitespace-nowrap">
                    REDEEMED • ใช้สิทธิ์แล้ว
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ending Note */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1 font-medium">
          <span>สร้างด้วย</span>
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
          <span>บน MANITA Studio</span>
        </p>
      </div>
    </div>
  );
}
