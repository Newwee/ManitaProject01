import React, { useState } from 'react';
import {
  Palette,
  Mail,
  Lock,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Ticket,
  Plus,
  Trash2,
  Upload,
  Check,
  Eye,
  Share2,
  Layers,
  TreePine,
  Crosshair,
  CheckCircle,
  Sun,
  Moon,
  Laptop,
  ArrowRight,
  ArrowLeft,
  Gift
} from 'lucide-react';
import { PRESET_CATEGORIES, THEME_PRESETS, AVAILABLE_STICKERS } from '../../types/themePresets';
import { FRAME_STYLES } from '../GiftExperience/Stage_Camera';
import { compressImageFile } from '../../lib/imageCompressor';

export default function CreatorDashboard({
  config,
  onChangeConfig,
  onSwitchToPreview,
  onOpenShareModal,
  studioTheme = 'system',
  onChangeStudioTheme,
  isDarkMode = false
}) {
  const [activeTab, setActiveTab] = useState('category');
  const [compressing, setCompressing] = useState(false);
  const [compressMsg, setCompressMsg] = useState('');

  const currentCategory = config.presetCategory || 'chat_scratch';

  const handleSelectCategory = (catId) => {
    onChangeConfig({
      ...config,
      presetCategory: catId,
      revealType: catId === 'chat_camera' ? 'camera' : 'scratch'
    });

    // Auto-advance to Tab 2 on preset selection & scroll tab into view
    const nextTab =
      catId === 'christmas_tree'
        ? 'tree_settings'
        : catId === 'arrow_birthday'
        ? 'arrow_settings'
        : 'theme';

    setActiveTab(nextTab);

    setTimeout(() => {
      const tabBtn = document.getElementById(`studio-tab-${nextTab}`);
      if (tabBtn) {
        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  };

  const handleSelectThemePreset = (themeKey) => {
    const preset = THEME_PRESETS[themeKey];
    if (!preset) return;

    onChangeConfig({
      ...config,
      theme: preset.id,
      introTitle: preset.introTitle,
      introSub: preset.introSub,
      letterText: preset.letterText,
      passcodeHint: preset.passcodeHint,
      chatName: preset.chatName,
      chatAvatar: preset.chatAvatar,
      chatMsg1: preset.chatMsg1,
      chatDialog: preset.chatDialog,
      scratchSecret: preset.scratchSecret,
      voiceCaption: preset.voiceCaption,
      coupons: [...preset.coupons]
    });
  };

  // Multi-file photo upload with auto-compression (PNG, JPG, JPEG, GIF)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setCompressing(true);
    setCompressMsg(`กำลังโหลดและจัดการรูปภาพ ${files.length} รูป (PNG, JPG, GIF)...`);

    try {
      const newPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await compressImageFile(file);
        newPhotos.push({
          url: res.dataUrl,
          caption: 'ภาพความทรงจำ'
        });
      }

      const updatedPhotos = [...(config.photos || []), ...newPhotos];
      onChangeConfig({ ...config, photos: updatedPhotos });

      setCompressMsg(`✅ อัปโหลดรูปภาพสำเร็จ (${files.length} รูป)`);
      setTimeout(() => setCompressMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setCompressMsg('❌ เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = (idx) => {
    const updated = (config.photos || []).filter((_, i) => i !== idx);
    onChangeConfig({ ...config, photos: updated });
  };

  const handleUpdatePhotoCaption = (idx, caption) => {
    const updated = [...(config.photos || [])];
    if (updated[idx]) {
      updated[idx].caption = caption;
      onChangeConfig({ ...config, photos: updated });
    }
  };

  // Coupons Customization Handlers (Image 2)
  const handleAddCoupon = () => {
    const updated = [
      ...(config.coupons || []),
      '🎁 คูปองพิเศษตามใจ 1 วันเต็ม'
    ];
    onChangeConfig({ ...config, coupons: updated });
  };

  const handleUpdateCoupon = (idx, text) => {
    const updated = [...(config.coupons || [])];
    updated[idx] = text;
    onChangeConfig({ ...config, coupons: updated });
  };

  const handleRemoveCoupon = (idx) => {
    const updated = (config.coupons || []).filter((_, i) => i !== idx);
    onChangeConfig({ ...config, coupons: updated });
  };

  // Add / Remove custom chat dialog choice
  const handleAddChatDialogChoice = () => {
    const updatedDialog = [
      ...(config.chatDialog || []),
      {
        userChoice: 'ข้อความตอบกลับใหม่ ✨',
        botReplies: ['ข้อความที่คนส่งจะตอบกลับอัตโนมัติ ❤️']
      }
    ];
    onChangeConfig({ ...config, chatDialog: updatedDialog });
  };

  const handleRemoveChatDialogChoice = (idx) => {
    const updatedDialog = (config.chatDialog || []).filter((_, i) => i !== idx);
    onChangeConfig({ ...config, chatDialog: updatedDialog });
  };

  const handleUpdateChatChoiceText = (idx, text) => {
    const updated = [...(config.chatDialog || [])];
    if (updated[idx]) {
      updated[idx].userChoice = text;
      onChangeConfig({ ...config, chatDialog: updated });
    }
  };

  const handleUpdateBotReplyText = (dialogIdx, replyIdx, text) => {
    const updated = [...(config.chatDialog || [])];
    if (updated[dialogIdx]) {
      const replies = [...(updated[dialogIdx].botReplies || [])];
      replies[replyIdx] = text;
      updated[dialogIdx].botReplies = replies;
      onChangeConfig({ ...config, chatDialog: updated });
    }
  };

  // Navigation tab list helper
  const getTabList = () => {
    if (currentCategory === 'christmas_tree') {
      return ['category', 'tree_settings', 'photos'];
    }
    if (currentCategory === 'arrow_birthday') {
      return ['category', 'arrow_settings', 'photos'];
    }
    return ['category', 'theme', 'entry', 'passcode', 'chat', 'reveal', 'photos', 'coupons'];
  };

  const handleNextTab = () => {
    const list = getTabList();
    const currIdx = list.indexOf(activeTab);
    if (currIdx < list.length - 1) {
      setActiveTab(list[currIdx + 1]);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else {
      onOpenShareModal();
    }
  };

  const handlePrevTab = () => {
    const list = getTabList();
    const currIdx = list.indexOf(activeTab);
    if (currIdx > 0) {
      setActiveTab(list[currIdx - 1]);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const currentTabIdx = getTabList().indexOf(activeTab);
  const totalTabsCount = getTabList().length;

  return (
    <div className="w-full max-w-5xl mx-auto pt-16 sm:pt-20 pb-20 px-3 sm:px-6 transition-colors duration-300">
      {/* Top Banner with Studio Theme Switcher and Finish Button */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200 dark:border-stone-800 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
              MANITA Studio
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">• Creator Mode</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
            ปรับแต่งของขวัญดิจิทัล & เลือกรูปแบบ Preset
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            ปรับแต่งข้อความ เลือกโทนสี ใส่รูปภาพ แล้วกดเสร็จสิ้นเพื่อรับ QR Code และลิงก์ส่งต่อ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Studio Theme Switcher: Dark / Light / System */}
          {onChangeStudioTheme && (
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => onChangeStudioTheme('light')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  studioTheme === 'light'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="โหมดสว่าง (Light)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[11px]">สว่าง</span>
              </button>
              <button
                onClick={() => onChangeStudioTheme('dark')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  studioTheme === 'dark'
                    ? 'bg-stone-900 text-purple-300 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="โหมดมืด (Dark)"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[11px]">มืด</span>
              </button>
              <button
                onClick={() => onChangeStudioTheme('system')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  studioTheme === 'system'
                    ? 'bg-white dark:bg-stone-700 text-sky-500 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="ตามระบบ (System)"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="text-[11px]">ระบบ</span>
              </button>
            </div>
          )}

          {/* Preview Button */}
          <button
            onClick={onSwitchToPreview}
            className="px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            <span>ลองเล่นตัวอย่าง</span>
          </button>

          {/* Primary Finish & Save Button */}
          <button
            onClick={onOpenShareModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition flex items-center gap-2 group ring-2 ring-emerald-300/40"
          >
            <CheckCircle className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span>✓ เสร็จสิ้น (บันทึกของขวัญ)</span>
          </button>
        </div>
      </div>

      {/* Builder Layout: Responsive Grid / Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs (Horizontal on mobile/tablet, Vertical sidebar on desktop) */}
        <div className="lg:col-span-1">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2.5 lg:pb-0 gap-1.5 no-scrollbar scroll-smooth">
            <button
              id="studio-tab-category"
              onClick={() => setActiveTab('category')}
              className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'category'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>1. เลือกหมวด Preset (4 แบบ)</span>
            </button>

            {(currentCategory === 'chat_scratch' || currentCategory === 'chat_camera') && (
              <>
                <button
                  id="studio-tab-theme"
                  onClick={() => setActiveTab('theme')}
                  className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                    activeTab === 'theme'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <Palette className="w-4 h-4 shrink-0" />
                  <span>2. เลือกธีมสี & ภาพพื้นหลัง</span>
                </button>

                <button
                  id="studio-tab-entry"
                  onClick={() => setActiveTab('entry')}
                  className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                    activeTab === 'entry'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>3. หน้าแรก & ซองจดหมาย</span>
                </button>

                <button
                  id="studio-tab-passcode"
                  onClick={() => setActiveTab('passcode')}
                  className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                    activeTab === 'passcode'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>4. รหัสผ่าน 6 หลัก</span>
                </button>

                <button
                  id="studio-tab-chat"
                  onClick={() => setActiveTab('chat')}
                  className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                    activeTab === 'chat'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>5. ปรับแต่งข้อความแชท</span>
                </button>

                <button
                  id="studio-tab-reveal"
                  onClick={() => setActiveTab('reveal')}
                  className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                    activeTab === 'reveal'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                      : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {config.revealType === 'camera' ? (
                    <Camera className="w-4 h-4 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 shrink-0" />
                  )}
                  <span>6. ขูดการ์ด หรือ กล้องถ่ายรูป</span>
                </button>
              </>
            )}

            {currentCategory === 'christmas_tree' && (
              <button
                id="studio-tab-tree_settings"
                onClick={() => setActiveTab('tree_settings')}
                className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                  activeTab === 'tree_settings'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <TreePine className="w-4 h-4 shrink-0" />
                <span>2. ปรับแต่งต้นคริสต์มาส & ธีม</span>
              </button>
            )}

            {currentCategory === 'arrow_birthday' && (
              <button
                id="studio-tab-arrow_settings"
                onClick={() => setActiveTab('arrow_settings')}
                className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                  activeTab === 'arrow_settings'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Crosshair className="w-4 h-4 shrink-0" />
                <span>2. ปรับแต่งยิงธนู & เค้กวันเกิด</span>
              </button>
            )}

            <button
              id="studio-tab-photos"
              onClick={() => setActiveTab('photos')}
              className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'photos'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>{currentCategory === 'christmas_tree' || currentCategory === 'arrow_birthday' ? '3. อัปโหลดรูปภาพ (ความทรงจำ)' : '7. อัปโหลดรูปภาพ (ความทรงจำ)'}</span>
            </button>

            {(currentCategory === 'chat_scratch' || currentCategory === 'chat_camera') && (
              <button
                id="studio-tab-coupons"
                onClick={() => setActiveTab('coupons')}
                className={`shrink-0 whitespace-nowrap lg:whitespace-normal text-left px-3.5 py-2.5 lg:py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition ${
                  activeTab === 'coupons'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                }`}
              >
                <Gift className="w-4 h-4 shrink-0" />
                <span>8. คูปองสิทธิพิเศษ & โน้ตเสียง</span>
              </button>
            )}
          </div>

          {/* Desktop Sidebar Finish Box */}
          <div className="hidden lg:block pt-3 border-t border-stone-200 dark:border-stone-700 mt-3">
            <button
              onClick={onOpenShareModal}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <CheckCircle className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>✓ เสร็จสิ้น (บันทึกของขวัญ)</span>
            </button>
            <p className="text-[10px] text-center text-stone-400 dark:text-stone-500 mt-2 font-medium">
              กดเพื่อบันทึกและรับ QR Code + ลิงก์สำหรับส่ง
            </p>
          </div>
        </div>

        {/* Right Editor Panels */}
        <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-colors duration-300">
          <div>
            {/* TAB 1: PRESET CATEGORIES */}
            {activeTab === 'category' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-500" />
                    <span>เลือกรูปแบบประสบการณ์หลัก (4 Preset Categories)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    เลือกหมวดหมู่ที่ต้องการสร้างสรรค์ แต่ละแบบจะให้ประสบการณ์และการโต้ตอบที่แตกต่างกัน
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {PRESET_CATEGORIES.map((cat) => {
                    const isSelected = currentCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-4 sm:p-5 rounded-3xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-200 dark:ring-rose-800'
                            : 'border-stone-200 dark:border-stone-750 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">{cat.icon}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-rose-500 text-white'
                                : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                            }`}>
                              {cat.badge}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">{cat.name}</h4>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{cat.desc}</p>
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                          <span>{isSelected ? '✓ เลือกหมวดนี้แล้ว' : 'แตะเพื่อเลือกหมวดนี้'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: THEME SELECTION & BACKGROUND CHOOSER */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-rose-500" />
                    <span>เลือกธีม & บรรยากาศ (Theme Presets)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    เลือกพาเลทสี เพลงสังเคราะห์ประจำธีม และสไตล์การตกแต่ง
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {Object.values(THEME_PRESETS).map((t) => {
                    const isSelected = config.theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectThemePreset(t.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{t.emoji}</span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                กำลังเลือก
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">{t.name}</h4>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{t.occasion}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Background Image Selector */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700 mt-3">
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-1.5">
                    <span>🖼️</span>
                    <span>เลือกภาพพื้นหลังโทรศัพท์ (Background จาก Assets)</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
                    เลือกรูปภาพพื้นหลังที่จะแสดงบนหน้าจอโทรศัพท์ (หน้าซองจดหมาย, รหัสผ่าน, แชท, กล้อง, ขูดการ์ด)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: '/assets/Background.jpg', name: 'Background.jpg', desc: 'ภาพพื้นหลังอบอุ่น' },
                      { id: '/assets/ChatBG.jpg', name: 'ChatBG.jpg', desc: 'ภาพพื้นหลังห้องแชท' },
                      { id: '/assets/PhotoBG.jpg', name: 'PhotoBG.jpg', desc: 'ภาพพื้นหลังโพลารอยด์' },
                      { id: '', name: 'ลายจุดประจำธีม', desc: 'Pattern ดั้งเดิม' }
                    ].map((bg) => {
                      const currentBg = config.phoneBackground !== undefined ? config.phoneBackground : '/assets/Background.jpg';
                      const isSelected = currentBg === bg.id;
                      return (
                        <div
                          key={bg.id}
                          onClick={() => onChangeConfig({ ...config, phoneBackground: bg.id })}
                          className={`p-2.5 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 shadow-sm ring-2 ring-rose-200 dark:ring-rose-800'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50 dark:bg-stone-800/40'
                          }`}
                        >
                          <div className="w-full h-16 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-700 mb-2 border border-stone-300 dark:border-stone-600">
                            {bg.id ? (
                              <img src={bg.id} alt={bg.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#EFE8DF] dark:bg-stone-800 flex items-center justify-center text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                                Pattern
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate block">{bg.name}</span>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 truncate block">{bg.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CHAT MESSAGES EDITOR */}
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-rose-500" />
                    <span>ปรับแต่งห้องแชท & เพิ่มข้อความพูดคุย (Chat Editor)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    แก้ไขชื่อผู้ส่ง รูปโปรไฟล์ และเพิ่มตัวเลือกตอบโต้ระหว่างผู้ส่งกับผู้รับได้อย่างอิสระ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ชื่อผู้ส่งในห้องแชท
                    </label>
                    <input
                      type="text"
                      value={config.chatName || ''}
                      onChange={(e) => onChangeConfig({ ...config, chatName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="เช่น คนพิเศษของเธอ ♡"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      รูปโปรไฟล์ (Emoji Avatar)
                    </label>
                    <input
                      type="text"
                      value={config.chatAvatar || '🐻'}
                      onChange={(e) => onChangeConfig({ ...config, chatAvatar: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="🐻"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ข้อความแชทข้อความแรก (ที่ผู้ส่งทักไป)
                  </label>
                  <input
                    type="text"
                    value={config.chatMsg1 || ''}
                    onChange={(e) => onChangeConfig({ ...config, chatMsg1: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="เช่น เธอทำอะไรอยู่ ว่างไหม?"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      ตัวเลือกที่ให้ผู้รับกดตอบ และข้อความที่ระบบจะตอบกลับ:
                    </label>
                    <button
                      onClick={handleAddChatDialogChoice}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มข้อความแชท</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(config.chatDialog || []).map((choice, dIdx) => (
                      <div key={dIdx} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                            ตัวเลือกที่ {dIdx + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveChatDialogChoice(dIdx)}
                            className="p-1 text-stone-400 hover:text-rose-500 transition"
                            title="ลบตัวเลือกนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block mb-0.5">
                            ข้อความบนปุ่มที่ผู้รับกดส่ง:
                          </span>
                          <input
                            type="text"
                            value={choice.userChoice || ''}
                            onChange={(e) => handleUpdateChatChoiceText(dIdx, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block mb-0.5">
                            ข้อความที่ตอบกลับกลับไป:
                          </span>
                          <input
                            type="text"
                            value={choice.botReplies?.[0] || ''}
                            onChange={(e) => handleUpdateBotReplyText(dIdx, 0, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REVEAL TYPE (SCRATCH CARD VS INSTANT CAMERA) */}
            {activeTab === 'reveal' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>เลือกรูปแบบ: การ์ดขูด หรือ กล้องถ่ายรูป</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    เลือกรูปแบบการเปิดเผยความลับว่าจะให้ผู้รับขูดการ์ดสีทอง หรือกดชัตเตอร์กล้องถ่ายรูป
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => onChangeConfig({ ...config, revealType: 'scratch', presetCategory: 'chat_scratch' })}
                    className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                      config.revealType !== 'camera'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-200 dark:ring-rose-800'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40'
                    }`}
                  >
                    <span className="text-3xl">🪙</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">1. การ์ดขูดรางวัลลับ</h4>
                      <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">ใช้นิ้วหรือเมาส์ขูดแถบสีทอง</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeConfig({ ...config, revealType: 'camera', presetCategory: 'chat_camera' })}
                    className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                      config.revealType === 'camera'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-200 dark:ring-rose-800'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40'
                    }`}
                  >
                    <span className="text-3xl">📸</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">2. กล้องถ่ายรูปปริ้นท์ภาพ</h4>
                      <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400">กดชัตเตอร์สีแดงแล้วรูปจะปริ้นท์ออกมา</p>
                    </div>
                  </button>
                </div>

                {config.revealType !== 'camera' ? (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ของรางวัลลับที่ซ่อนอยู่ใต้การ์ดขูด
                    </label>
                    <input
                      type="text"
                      value={config.scratchSecret || ''}
                      onChange={(e) => onChangeConfig({ ...config, scratchSecret: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="เช่น คูปองตามใจเธอ 1 วันเต็ม! 💖"
                    />
                  </div>
                ) : (
                  <div className="pt-2 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        เลือกรูปทรงกรอบรูป (Frame Shape Styles):
                      </label>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
                        เลือกทรงกรอบรูปที่ต้องการให้ปริ้นท์ออกมาจากกล้อง
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {FRAME_STYLES.map((frame) => {
                        const isSelected = (config.cameraFrameStyle || 'square') === frame.id;
                        return (
                          <div
                            key={frame.id}
                            onClick={() => onChangeConfig({ ...config, cameraFrameStyle: frame.id })}
                            className={`p-3 rounded-2xl border-2 cursor-pointer transition text-center flex flex-col items-center justify-between ${
                              isSelected
                                ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm ring-2 ring-rose-200 dark:ring-rose-800'
                                : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/40'
                            }`}
                          >
                            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 flex items-center justify-center my-2 border border-stone-300 dark:border-stone-600 shadow-xs overflow-hidden">
                              {frame.id === 'circle' && (
                                <div className="w-12 h-12 rounded-full border-2 border-stone-800 dark:border-stone-200 bg-amber-100 dark:bg-amber-950/40" />
                              )}
                              {frame.id === 'square' && (
                                <div className="w-12 h-12 rounded-xs border-2 border-stone-800 dark:border-stone-200 bg-rose-100 dark:bg-rose-950/40" />
                              )}
                              {frame.id === 'oval' && (
                                <div className="w-10 h-14 rounded-[20px] border-2 border-amber-500 bg-blue-100 dark:bg-blue-950/40" />
                              )}
                              {frame.id === 'cloud' && (
                                <div className="w-12 h-12 rounded-[16px] border-2 border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40"
                                     style={{ borderRadius: '42% 58% 62% 38% / 45% 45% 55% 55%' }} />
                              )}
                              {frame.id === 'dashed' && (
                                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-rose-500 bg-pink-100 dark:bg-pink-950/40" />
                              )}
                              {frame.id === 'arch' && (
                                <div className="w-10 h-14 rounded-t-full border-2 border-indigo-500 bg-indigo-100 dark:bg-indigo-950/40" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">{frame.name}</span>
                              <span className="text-[10px] text-stone-400 dark:text-stone-500">{frame.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: 3D CHRISTMAS TREE SETTINGS (Moved from Preview into Studio) */}
            {activeTab === 'tree_settings' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-emerald-600" />
                    <span>ปรับแต่งต้นคริสต์มาส 3D & ธีมสี (Christmas Settings)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    เลือกโทนสีของต้นไม้ ปรับข้อความอวยพร และใส่รูปภาพความทรงจำในกล่องของขวัญ
                  </p>
                </div>

                {/* Tree Themes Selector */}
                <div className="pt-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    เลือกโทนสีและบรรยากาศต้นคริสต์มาส (4 Color Themes):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'classic', name: '🎄 Classic', desc: 'เขียวคลาสสิก อบอุ่น' },
                      { id: 'gold', name: '✨ Gold', desc: 'ทองอร่าม เปล่งประกาย' },
                      { id: 'pink', name: '🌸 Pink', desc: 'ชมพูหวาน โรแมนติก' },
                      { id: 'blue', name: '❄️ Frozen', desc: 'ฟ้าหิมะ เยือกแข็ง' }
                    ].map((theme) => {
                      const isSelected = (config.treeTheme || 'classic') === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => onChangeConfig({ ...config, treeTheme: theme.id })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 ring-2 ring-rose-200 dark:ring-rose-800 shadow-sm'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50 dark:bg-stone-800/40'
                          }`}
                        >
                          <div>
                            <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100 block">{theme.name}</span>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 block">{theme.desc}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 mt-2">✓ เลือกธีมนี้แล้ว</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      หัวข้อบนต้นไม้ (Title)
                    </label>
                    <input
                      type="text"
                      value={config.treeTitle || 'Merry Christmas'}
                      onChange={(e) => onChangeConfig({ ...config, treeTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="Merry Christmas"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      คำบรรยายย่อย (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={config.treeSubtitle || 'A SPECIAL WISH FOR YOU'}
                      onChange={(e) => onChangeConfig({ ...config, treeSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="A SPECIAL WISH FOR YOU"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ข้อความคำอวยพรในกล่องของขวัญ (Wish Message)
                    </label>
                    <textarea
                      rows={4}
                      value={config.treeWish || 'ขอให้เทศกาลนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨'}
                      onChange={(e) => onChangeConfig({ ...config, treeWish: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Creator Lock System (4 Modes) */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                      <span>🔒 ระบบล็อกและเงื่อนไขการเปิดกล่องของขวัญ (Lock Settings):</span>
                      <span className="text-[10px] text-stone-400 font-normal">เวลาไทย (Asia/Bangkok)</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[
                        { id: 'immediate', label: '🔓 เปิดได้ทันที', desc: 'ไม่ล็อกกล่อง' },
                        { id: 'custom_date', label: '📅 กำหนดวันเอง', desc: 'ระบุวัน-เวลาปลดล็อก' },
                        { id: 'christmas', label: '🎄 วันคริสต์มาส', desc: 'ล็อกถึง 25 ธ.ค. 00:00' },
                        { id: 'per_box', label: '📦 ล็อกรายกล่อง', desc: 'ตั้งเวลาแยก 5 กล่อง' }
                      ].map((m) => {
                        const isSel = (config.treeLockMode || 'immediate') === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => onChangeConfig({ ...config, treeLockMode: m.id })}
                            className={`p-2.5 rounded-xl border-2 cursor-pointer transition text-left ${
                              isSel
                                ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-stone-900 dark:text-white shadow-xs'
                                : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            <span className="text-xs font-bold block">{m.label}</span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500 block">{m.desc}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mode 2: Custom Date input */}
                    {config.treeLockMode === 'custom_date' && (
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 mb-3">
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          ⏰ กำหนดวัน-เวลาปลดล็อกกล่องของขวัญ (Asia/Bangkok)
                        </label>
                        <input
                          type="datetime-local"
                          value={config.treeUnlockDate || '2026-12-25T00:00'}
                          onChange={(e) => onChangeConfig({ ...config, treeUnlockDate: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    )}

                    {/* Mode 4: Per-box Date inputs */}
                    {config.treeLockMode === 'per_box' && (
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 mb-3 space-y-2">
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          📦 กำหนดวัน-เวลาปลดล็อกแยกตามกล่อง (กล่อง 1 - 5):
                        </label>
                        {[0, 1, 2, 3, 4].map((idx) => {
                          const dates = config.treeBoxUnlockDates || ['2026-12-25T00:00', '2026-12-25T00:00', '2026-12-25T00:00', '2026-12-25T00:00', '2026-12-25T00:00'];
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-stone-700 dark:text-stone-300 w-16 shrink-0">กล่องที่ {idx + 1}:</span>
                              <input
                                type="datetime-local"
                                value={dates[idx] || '2026-12-25T00:00'}
                                onChange={(e) => {
                                  const newDates = [...dates];
                                  newDates[idx] = e.target.value;
                                  onChangeConfig({ ...config, treeBoxUnlockDates: newDates });
                                }}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Locked Message */}
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ข้อความแจ้งเตือนเมื่อผู้รับคลิกกล่องที่ยังล็อก (Lock Toast Message)
                      </label>
                      <input
                        type="text"
                        value={config.treeLockMessage || '🔒 กล่องของขวัญยังเปิดไม่ได้นะ รอถึงเวลาปลดล็อกก่อน!'}
                        onChange={(e) => onChangeConfig({ ...config, treeLockMessage: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                        placeholder="ข้อความแจ้งเตือนเมื่อกล่องยังล็อก"
                      />
                    </div>

                    {/* Show Countdown Card Toggle */}
                    <div 
                      onClick={() => onChangeConfig({ ...config, treeShowCountdown: config.treeShowCountdown !== undefined ? !config.treeShowCountdown : false })}
                      className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 cursor-pointer hover:border-rose-300 transition mb-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">⏳</span>
                        <div>
                          <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                            แสดงการ์ดนับถอยหลัง (Countdown Card)
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">
                            ลอยแสดงเวลานับถอยหลังหรือข้อความฉลองบนหน้าจอ
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                          (config.treeShowCountdown !== undefined ? config.treeShowCountdown : true)
                            ? 'bg-rose-500'
                            : 'bg-stone-300 dark:bg-stone-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center text-[10px] ${
                            (config.treeShowCountdown !== undefined ? config.treeShowCountdown : true)
                              ? 'translate-x-5 text-rose-500 font-bold'
                              : 'translate-x-0'
                          }`}
                        >
                          {(config.treeShowCountdown !== undefined ? config.treeShowCountdown : true) && '✓'}
                        </div>
                      </div>
                    </div>

                    {/* 3D Decoration Switches */}
                    <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                        สวิตช์เปิด/ปิดฟีเจอร์ตกแต่ง 3D (Decorations):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {[
                          { key: 'santa', label: '🎅 ซานต้าบินผ่าน' },
                          { key: 'props', label: '⛄ มนุษย์หิมะ & หมี' },
                          { key: 'balls', label: '🔮 ลูกบอลแก้ว 3D' },
                          { key: 'landscape', label: '🏔️ ดวงจันทร์ & ภูเขา' }
                        ].map((item) => {
                          const decs = config.treeDecorations || { santa: true, props: true, balls: true, landscape: true };
                          const isEnabled = decs[item.key] !== false;
                          return (
                            <button
                              type="button"
                              key={item.key}
                              onClick={() => {
                                onChangeConfig({
                                  ...config,
                                  treeDecorations: {
                                    ...decs,
                                    [item.key]: !isEnabled
                                  }
                                });
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                                isEnabled
                                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 shadow-xs'
                                  : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-60'
                              }`}
                            >
                              <span className="font-bold text-stone-800 dark:text-stone-200 text-[11px] truncate">
                                {item.label}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black transition shrink-0 ml-1.5 ${
                                  isEnabled
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-transparent'
                                }`}
                              >
                                ✓
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: 3D ARROW BIRTHDAY SETTINGS (Moved from Preview into Studio) */}
            {activeTab === 'arrow_settings' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-pink-500" />
                    <span>ปรับแต่งยิงธนู & เค้กวันเกิด 3D</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    ปรับข้อความอวยพรก่อนและหลังยิงธนูเปิดเค้กวันเกิด
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      หัวข้อหลัก (Title)
                    </label>
                    <input
                      type="text"
                      value={config.arrowTitle || 'Happy Birthday'}
                      onChange={(e) => onChangeConfig({ ...config, arrowTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="Happy Birthday"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      คำบรรยายย่อย (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={config.arrowSubtitle || 'WISHING YOU ENDLESS HAPPINESS ✨'}
                      onChange={(e) => onChangeConfig({ ...config, arrowSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="WISHING YOU ENDLESS HAPPINESS ✨"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ข้อความคำอวยพรหลังยิงธนู (Wish Message)
                    </label>
                    <textarea
                      rows={4}
                      value={config.arrowWish || 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖'}
                      onChange={(e) => onChangeConfig({ ...config, arrowWish: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      คำลงท้าย (Sign-off)
                    </label>
                    <input
                      type="text"
                      value={config.arrowSign || '— จากคนที่หวังดีเสมอ ✨'}
                      onChange={(e) => onChangeConfig({ ...config, arrowSign: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:border-rose-500"
                      placeholder="— จากคนที่หวังดีเสมอ ✨"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PHOTOS & UPLOADS */}
            {activeTab === 'photos' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-rose-500" />
                      <span>รูปภาพความทรงจำ & สติกเกอร์</span>
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    อัปโหลดรูปภาพของคุณเอง หากยังไม่ได้อัปโหลด ระบบจะแสดงรูปภาพแบบว่าง (Placeholder) ที่สะอาดตา
                  </p>
                </div>

                {/* Upload Dropzone */}
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-rose-400 dark:hover:border-rose-500 bg-stone-50/50 dark:bg-stone-800/40 text-center transition">
                  <input
                    type="file"
                    id="photo-upload-input"
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={compressing}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
                    <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                      {compressing ? 'กำลังประมวลผลรูปภาพ...' : 'คลิกเพื่อเลือกรูปภาพ (เลือกได้หลายรูปพร้อมกัน)'}
                    </span>
                    <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 mt-1">
                      รองรับไฟล์ PNG, JPG, JPEG, GIF (เลือกหลายรูปได้ • จัดการขนาดและคุณภาพให้อัตโนมัติ)
                    </span>
                  </label>
                  {compressMsg && (
                    <p className="text-xs font-bold mt-2 text-emerald-600 dark:text-emerald-400">{compressMsg}</p>
                  )}
                </div>

                {/* Photo list */}
                <div className="space-y-3">
                  {(!config.photos || config.photos.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 text-center text-xs text-stone-400 dark:text-stone-500">
                      ยังไม่มีรูปภาพที่อัปโหลด (ระบบจะแสดงภาพ Placeholder ที่สะอาดตาแทน)
                    </div>
                  ) : (
                    config.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-3"
                      >
                        <img
                          src={photo.url}
                          alt="Thumbnail"
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-300 dark:border-stone-600"
                        />
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-0.5">
                            คำบรรยายรูปภาพที่ {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={photo.caption || ''}
                            onChange={(e) => handleUpdatePhotoCaption(idx, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                            placeholder="คำบรรยายความทรงจำ..."
                          />
                        </div>
                        <button
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition shrink-0"
                          title="ลบรูปภาพนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Sticker Selector */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    เลือกสติกเกอร์ประดับ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_STICKERS.map((stk) => {
                      const isSelected = config.selectedSticker === stk;
                      return (
                        <button
                          key={stk}
                          onClick={() => onChangeConfig({ ...config, selectedSticker: stk })}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-md scale-110 ring-2 ring-rose-300'
                              : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {stk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ENTRY & PASSCODE */}
            {activeTab === 'entry' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-rose-500" />
                  <span>หน้าแรก & ข้อความซองจดหมาย</span>
                </h3>
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      หัวข้อหน้าแรก
                    </label>
                    <input
                      type="text"
                      value={config.introTitle || ''}
                      onChange={(e) => onChangeConfig({ ...config, introTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      ข้อความในซองจดหมาย
                    </label>
                    <textarea
                      rows={3}
                      value={config.letterText || ''}
                      onChange={(e) => onChangeConfig({ ...config, letterText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'passcode' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>รหัสผ่าน 6 หลัก & คำใบ้</span>
                </h3>
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      รหัสผ่าน (6 หลัก)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={config.passcode || '231069'}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        onChangeConfig({ ...config, passcode: val });
                      }}
                      className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-mono tracking-widest text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      คำใบ้รหัสผ่าน
                    </label>
                    <input
                      type="text"
                      value={config.passcodeHint || ''}
                      onChange={(e) => onChangeConfig({ ...config, passcodeHint: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: COUPONS & VOICE NOTE (Image 2 customization) */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-rose-500" />
                    <span>ปรับแต่งคูปองสิทธิพิเศษ & โน้ตเสียง</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    คูปองของขวัญที่คนพิเศษสามารถกดรับสิทธิ์ได้จริง และข้อความเสียงในหน้าบทสรุป
                  </p>
                </div>

                {/* Redeemable Coupons List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      รายการคูปอง ({config.coupons?.length || 0} ใบ)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCoupon}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm shadow-rose-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มคูปองใหม่</span>
                    </button>
                  </div>

                  {(!config.coupons || config.coupons.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 text-center text-xs text-stone-400">
                      ยังไม่มีคูปอง (กดปุ่ม "เพิ่มคูปองใหม่" เพื่อสร้างคูปองน่ารักๆ)
                    </div>
                  ) : (
                    config.coupons.map((coupon, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
                          🎁
                        </div>
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => handleUpdateCoupon(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none"
                          placeholder="เช่น 🍜 คูปองเลี้ยงชาบู 1 มื้อ"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition shrink-0"
                          title="ลบคูปองนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Suggestion Chips */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1.5">
                      💡 ข้อความคูปองแนะนำ (แตะเพื่อเพิ่มด่วน):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '🍜 คูปองเลี้ยงชาบู / หมูกระทะ 1 มื้อ',
                        '🤗 คูปองกอดฟรี + ตามใจ 1 วันเต็ม',
                        '☕ คูปองเลี้ยงกาแฟ / ชานม 1 แก้ว',
                        '🎬 คูปองพาไปดูหนังเรื่องที่อยากดู',
                        '🚗 คูปองคนขับรถพาเที่ยว 1 ทริป',
                        '🍰 คูปองเลี้ยงขนมเค้ก & ของหวาน'
                      ].map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const updated = [...(config.coupons || []), item];
                            onChangeConfig({ ...config, coupons: updated });
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Voice Note Caption Section */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                    ข้อความเสียง / คำพูดตอนจบ (Voice Note Caption)
                  </label>
                  <input
                    type="text"
                    value={config.voiceCaption || ''}
                    onChange={(e) => onChangeConfig({ ...config, voiceCaption: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    placeholder='เช่น "ขอบคุณที่เข้ามาเป็นความสุขของเรานะ ♡"'
                  />
                  <p className="text-[10px] text-stone-400">
                    * ข้อความนี้จะแสดงข้างแผ่นเสียงไวนิลหมุนได้ในหน้าสุดท้าย
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Responsive Action Bar at bottom of each panel */}
          <div className="mt-8 pt-5 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevTab}
                disabled={currentTabIdx === 0}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับ</span>
              </button>

              {currentTabIdx < totalTabsCount - 1 && (
                <button
                  onClick={handleNextTab}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>ขั้นตอนถัดไป</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onOpenShareModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2 group ring-2 ring-emerald-300/40"
            >
              <CheckCircle className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>✓ เสร็จสิ้น (บันทึกและรับ QR Code)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
