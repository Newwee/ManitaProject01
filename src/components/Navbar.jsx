import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, Edit3, Share2, Sparkles, Sun, Moon, Laptop, CheckCircle, Disc } from 'lucide-react';
import MusicPlayerCard from './UI/MusicPlayerCard';

export default function Navbar({
  appMode,
  setAppMode,
  isMusicPlaying,
  onToggleMusic,
  onOpenShareModal,
  themeKey,
  isRecipientOnly = false,
  studioTheme = 'system',
  onChangeStudioTheme,
  isDarkMode = false
}) {
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-3 py-2.5 shadow-sm transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center font-bold shadow-sm shadow-rose-200 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none">
                MANITA
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:inline">
              Create Something Meaningful
            </p>
          </div>
        </div>

        {/* Mode Switcher (Hidden if recipient-only link) */}
        {!isRecipientOnly ? (
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-inner">
            <button
              onClick={() => setAppMode('preview')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                appMode === 'preview'
                  ? 'bg-stone-900 text-white shadow-sm dark:bg-rose-600'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ตัวอย่าง</span>
            </button>
            <button
              onClick={() => setAppMode('builder')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                appMode === 'builder'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ปรับแต่ง (Studio)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
            <span>🎁</span>
            <span>ของขวัญสำหรับคนพิเศษ</span>
          </div>
        )}

        {/* Action Buttons: Studio Theme, Sound & Share */}
        <div className="flex items-center gap-1.5">
          {/* Quick Studio Theme Toggle (Light / Dark / System) */}
          {onChangeStudioTheme && !isRecipientOnly && (
            <div className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => onChangeStudioTheme('light')}
                title="ธีมสว่าง (Light)"
                className={`p-1.5 rounded-lg text-xs transition ${
                  studioTheme === 'light'
                    ? 'bg-white dark:bg-stone-700 text-amber-500 shadow-xs'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeStudioTheme('dark')}
                title="ธีมมืด (Dark)"
                className={`p-1.5 rounded-lg text-xs transition ${
                  studioTheme === 'dark'
                    ? 'bg-white dark:bg-stone-700 text-purple-400 shadow-xs'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeStudioTheme('system')}
                title="ตามระบบ (System)"
                className={`p-1.5 rounded-lg text-xs transition ${
                  studioTheme === 'system'
                    ? 'bg-white dark:bg-stone-700 text-sky-500 shadow-xs'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Music Toggle & Elastic Slider Player Button */}
          <button
            onClick={() => {
              setIsMusicPlayerOpen(prev => !prev);
              if (!isMusicPlaying && onToggleMusic) {
                onToggleMusic();
              }
            }}
            title={isMusicPlaying ? "เปิดเครื่องเล่นเพลง & ปรับระดับเสียง" : "เปิดเสียงดนตรีประจำธีม"}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isMusicPlaying
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Finish & Save / Share Button */}
          {!isRecipientOnly && (
            <button
              onClick={onOpenShareModal}
              title="เสร็จสิ้นและบันทึกของขวัญ เพื่อสร้าง QR Code และลิงก์ส่งต่อ"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden md:inline">✓ เสร็จสิ้น (QR Code)</span>
              <span className="md:hidden">เสร็จสิ้น</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Modern Music Player Card with ElasticSlider */}
      <MusicPlayerCard
        isOpen={isMusicPlayerOpen}
        onClose={() => setIsMusicPlayerOpen(false)}
        themeKey={themeKey}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={onToggleMusic}
        isDarkMode={isDarkMode}
      />
    </header>
  );
}
