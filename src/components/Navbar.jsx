import React from 'react';
import { Volume2, VolumeX, Eye, Edit3, Share2, Sparkles } from 'lucide-react';

export default function Navbar({
  appMode,
  setAppMode,
  isMusicPlaying,
  onToggleMusic,
  onOpenShareModal,
  themeKey,
  isRecipientOnly = false
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 px-3 py-2.5 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-sm shadow-rose-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-stone-900 tracking-tight leading-none">
                MANITA
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-stone-500 hidden sm:inline">
              Create Something Meaningful
            </p>
          </div>
        </div>

        {/* Mode Switcher (Hidden if recipient-only link) */}
        {!isRecipientOnly ? (
          <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 shadow-inner">
            <button
              onClick={() => setAppMode('preview')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                appMode === 'preview'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ตัวอย่างของขวัญ</span>
            </button>
            <button
              onClick={() => setAppMode('builder')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                appMode === 'builder'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ปรับแต่งเอง (Studio)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            <span>🎁</span>
            <span>ของขวัญสำหรับคนพิเศษ</span>
          </div>
        )}

        {/* Action Buttons: Sound & Share */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMusic}
            title={isMusicPlaying ? "ปิดเสียงดนตรี" : "เปิดเสียงดนตรีประจำธีม"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isMusicPlaying
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!isRecipientOnly && (
            <button
              onClick={onOpenShareModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">แชร์ / QR Code</span>
              <span className="sm:hidden">แชร์</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
