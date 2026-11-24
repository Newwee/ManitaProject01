import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  Edit3,
  Share2,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  CheckCircle,
  Disc,
  Columns2,
  Smartphone
} from 'lucide-react';
import AboutModal from './UI/AboutModal';

export default function Navbar({
  appMode,
  setAppMode,
  desktopViewMode = 'split',
  setDesktopViewMode,
  isMusicPlaying,
  onToggleMusic,
  onOpenShareModal,
  themeKey,
  presetCategory = 'chat_scratch',
  isRecipientOnly = false,
  studioTheme = 'system',
  onChangeStudioTheme,
  isDarkMode = false
}) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-3 py-2.5 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand with ManitaLogo.png (Click to open About MANITA) */}
        <div
          onClick={() => setIsAboutModalOpen(true)}
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer hover:opacity-85 active:scale-95 transition group"
          title="เกี่ยวกับ MANITA (About MANITA)"
        >
          <img
            src="/assets/ManitaLogo.png"
            alt="MANITA Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain shadow-sm shrink-0 group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-none group-hover:text-rose-500 transition-colors">
                MANITA
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold leading-none">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 hidden sm:inline">
              Create Something Meaningful
            </p>
          </div>
        </div>

        {/* View Switchers (Hidden if recipient-only link) */}
        {!isRecipientOnly && (
          <>
            {/* 1. Mobile Mode Switcher (Visible ONLY on mobile < 768px / < md) */}
            <div className="flex md:hidden items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-full border border-stone-200 dark:border-stone-700 shadow-inner">
              <button
                type="button"
                onClick={() => setAppMode && setAppMode('preview')}
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
                type="button"
                onClick={() => setAppMode && setAppMode('builder')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  appMode === 'builder'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ปรับแต่ง</span>
              </button>
            </div>

            {/* 2. iPad / Tablet / Desktop Toggle View Controller (Visible on md and up >= 768px) */}
            {setDesktopViewMode && (
              <div className="hidden md:flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-inner transition-all">
                {/* Toggle Editor / Full Editor Mode */}
                <button
                  type="button"
                  onClick={() => setDesktopViewMode(desktopViewMode === 'editor' ? 'split' : 'editor')}
                  title={
                    desktopViewMode === 'editor'
                      ? 'กลับสู่โหมดแบ่งหน้าจอ (Split View)'
                      : 'ซ่อนตัวอย่าง / แสดงหน้าต่างแก้ไขเต็มจอ (Full Editor Mode)'
                  }
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                    desktopViewMode === 'editor'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">แก้ไขเต็มจอ</span>
                  <span className="lg:hidden">แก้ไข</span>
                </button>

                {/* Split View (Default on iPad/Desktop) */}
                <button
                  type="button"
                  onClick={() => setDesktopViewMode('split')}
                  title="โหมดแบ่งหน้าจอ: แสดงทั้งฝั่งแก้ไข (ซ้าย) และตัวอย่างมือถือสด (ขวา) [ค่าเริ่มต้น]"
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                    desktopViewMode === 'split'
                      ? 'bg-stone-900 text-white shadow-sm dark:bg-rose-600'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">แบ่งหน้าจอ (Split)</span>
                  <span className="lg:hidden">แบ่งจอ</span>
                </button>

                {/* Toggle Preview / Full Preview Mode */}
                <button
                  type="button"
                  onClick={() => setDesktopViewMode(desktopViewMode === 'preview' ? 'split' : 'preview')}
                  title={
                    desktopViewMode === 'preview'
                      ? 'กลับสู่โหมดแบ่งหน้าจอ (Split View)'
                      : 'ซ่อนหน้าต่างแก้ไข / ขยายตัวอย่างมือถือเต็มตา (Full Preview Mode)'
                  }
                  className={`px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 select-none ${
                    desktopViewMode === 'preview'
                      ? 'bg-stone-900 text-white shadow-sm dark:bg-rose-600'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">ตัวอย่างเต็มตา</span>
                  <span className="lg:hidden">ตัวอย่าง</span>
                </button>
              </div>
            )}
          </>
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

          {/* Music Sound Toggle */}
          {presetCategory !== 'christmas_tree' && (
            <button
              onClick={() => {
                if (onToggleMusic) onToggleMusic();
              }}
              title={isMusicPlaying ? 'ปิดเสียงดนตรี' : 'เปิดเสียงดนตรีประจำธีม'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isMusicPlaying
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Finish & Save / Share Button */}
          {!isRecipientOnly && (
            <button
              onClick={onOpenShareModal}
              title="เสร็จสิ้นและบันทึกของขวัญ เพื่อสร้าง QR Code และลิงก์ส่งต่อ"
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap shrink-0"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden md:inline">✓ เสร็จสิ้น (QR Code)</span>
              <span className="md:hidden">เสร็จสิ้น</span>
            </button>
          )}
        </div>
      </div>

      {/* About MANITA Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </header>
  );
}
