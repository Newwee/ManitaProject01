import React, { useState, useRef } from 'react';
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
  Gift,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { PRESET_CATEGORIES, THEME_PRESETS, AVAILABLE_STICKERS, SCRATCH_COLORS } from '../../types/themePresets';
import { FRAME_STYLES } from '../GiftExperience/Stage_Camera';
import { compressImageFile } from '../../lib/imageCompressor';
import { ENVELOPE_ASSETS, DECORATION_ASSETS } from '../../types/assetManifests';
import { useNotifications } from '../../context/NotificationContext';

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

export default function CreatorDashboard({
  config,
  onChangeConfig,
  onSwitchToPreview,
  onOpenShareModal,
  studioTheme = 'system',
  onChangeStudioTheme,
  isDarkMode = false,
  isEmbedded = false,
  onActiveTabChange,
  preferences
}) {
  const { notify } = useNotifications();
  const [activeTab, setActiveTab] = useState('category');
  const [compressing, setCompressing] = useState(false);
  const [compressMsg, setCompressMsg] = useState('');

  React.useEffect(() => {
    if (onActiveTabChange) {
      onActiveTabChange(activeTab);
    }
  }, [activeTab, onActiveTabChange]);

  // Gallery Navigation & View Mode States
  const [decorCategory, setDecorCategory] = useState('all');
  const [decorViewMode, setDecorViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [envelopeViewMode, setEnvelopeViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const decorScrollRef = useRef(null);
  const envelopeScrollRef = useRef(null);
  const catScrollRef = useRef(null);
  const placedScrollRef = useRef(null);

  // Mouse Drag-To-Scroll Moved tracking refs
  const decorMovedRef = useRef(false);
  const envelopeMovedRef = useRef(false);
  const catMovedRef = useRef(false);
  const placedMovedRef = useRef(false);

  // Smooth Click-and-Drag-To-Scroll for PC mouse users
  const bindDragScroll = (ref, isMovedRef) => ({
    onMouseDown: (e) => {
      if (e.button !== 0 || !ref.current) return;
      ref.current.isMouseDown = true;
      ref.current.startX = e.pageX - ref.current.offsetLeft;
      ref.current.scrollStart = ref.current.scrollLeft;
      if (isMovedRef) isMovedRef.current = false;
    },
    onMouseMove: (e) => {
      if (!ref.current?.isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - ref.current.startX) * 1.5;
      if (Math.abs(walk) > 4) {
        if (isMovedRef) isMovedRef.current = true;
      }
      ref.current.scrollLeft = ref.current.scrollStart - walk;
    },
    onMouseUp: () => {
      if (ref.current) ref.current.isMouseDown = false;
      setTimeout(() => {
        if (isMovedRef) isMovedRef.current = false;
      }, 80);
    },
    onMouseLeave: () => {
      if (ref.current) ref.current.isMouseDown = false;
      setTimeout(() => {
        if (isMovedRef) isMovedRef.current = false;
      }, 80);
    }
  });

  const handleScroll = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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
      notify({
        type: 'success',
        title: 'อัปโหลดรูปภาพสำเร็จ',
        message: `อัปโหลดและปรับขนาดรูปภาพ ${files.length} รูปเรียบร้อยแล้ว`
      });
      setTimeout(() => setCompressMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setCompressMsg('❌ เกิดข้อผิดพลาดในการโหลดรูปภาพ');
      notify({
        type: 'error',
        title: 'เกิดข้อผิดพลาดในการโหลดรูปภาพ',
        message: 'ไม่สามารถประมวลผลไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง'
      });
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

  const handleCustomBgUpload = async (e, field = 'phoneBackground') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setCompressMsg('กำลังประมวลผลรูปภาพพื้นหลัง...');

    try {
      const res = await compressImageFile(file);
      onChangeConfig({ ...config, [field]: res.dataUrl });
      setCompressMsg('✅ อัปโหลดภาพพื้นหลังสำเร็จ');
      notify({
        type: 'success',
        title: 'เปลี่ยนภาพพื้นหลังสำเร็จ',
        message: 'บันทึกภาพพื้นหลังที่กำหนดเองเรียบร้อยแล้ว'
      });
      setTimeout(() => setCompressMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setCompressMsg('❌ เกิดข้อผิดพลาดในการโหลดรูปภาพ');
      notify({
        type: 'error',
        title: 'เกิดข้อผิดพลาดในการโหลดรูปภาพ',
        message: 'ไม่สามารถประมวลผลภาพพื้นหลังได้'
      });
    } finally {
      setCompressing(false);
      if (e.target) e.target.value = '';
    }
  };

  // Stickers & Decorations Handlers (Draggable across phone)
  const handleAddDecoration = (item) => {
    const currentDecs = config.decorations || [];
    const newDec = {
      id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      src: item.src,
      x: 45 + Math.floor(Math.random() * 10),
      y: 45 + Math.floor(Math.random() * 10),
      scale: 1,
      rotation: 0
    };
    onChangeConfig({
      ...config,
      decorations: [...currentDecs, newDec]
    });
  };

  const handleRemoveDecoration = (id) => {
    const currentDecs = config.decorations || [];
    onChangeConfig({
      ...config,
      decorations: currentDecs.filter(d => d.id !== id)
    });
  };

  // Post-it Sticky Notes Handlers for Passcode Screen
  const handleAddPostItNote = () => {
    const currentNotes = config.passcodeNotes || [];
    const colors = ['#FEF08A', '#FBCFE8', '#BAE6FD', '#BBF7D0'];
    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      text: 'ข้อความใบ้ 💡',
      color: colors[currentNotes.length % colors.length],
      x: 20 + (currentNotes.length * 15) % 55,
      y: 20 + (currentNotes.length * 8) % 30,
      rotation: ((currentNotes.length % 2 === 0 ? 1 : -1) * (2 + (currentNotes.length * 1.5) % 5)).toFixed(1)
    };
    onChangeConfig({
      ...config,
      passcodeNotes: [...currentNotes, newNote]
    });
  };

  const handleUpdatePostItNote = (id, updates) => {
    const currentNotes = config.passcodeNotes || [];
    onChangeConfig({
      ...config,
      passcodeNotes: currentNotes.map(n => (n.id === id ? { ...n, ...updates } : n))
    });
  };

  const handleRemovePostItNote = (id) => {
    const currentNotes = config.passcodeNotes || [];
    onChangeConfig({
      ...config,
      passcodeNotes: currentNotes.filter(n => n.id !== id)
    });
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
    <div className={`w-full max-w-5xl mx-auto pb-20 px-3 sm:px-6 transition-colors duration-300 ${
      isEmbedded ? 'pt-4 sm:pt-6' : 'pt-16 sm:pt-20'
    }`}>
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
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group tween-hover"
            >
              <CheckCircle className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
              <span>✓ เสร็จสิ้น (บันทึกของขวัญ)</span>
            </button>
            <p className="text-[10px] text-center text-stone-400 dark:text-stone-500 mt-2 font-medium">
              กดเพื่อบันทึกและรับ QR Code + ลิงก์สำหรับส่ง
            </p>
          </div>
        </div>

        {/* Right Editor Panels */}
        <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-colors duration-300">
          <div
            key={activeTab}
            className={preferences?.animation?.tabTransitions ? 'tab-transition-enter' : ''}
          >
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
                        className={`p-4 sm:p-5 rounded-3xl border-2 cursor-pointer transition text-left flex flex-col justify-between tween-hover ${
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

                  {/* Custom Background Upload */}
                  <div className="mt-3 p-3 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-850 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          อัปโหลดภาพพื้นหลังของคุณเอง
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">
                          รองรับไฟล์ JPG, PNG, GIF (ปรับสเกลพอดีหน้าจอโทรศัพท์อัตโนมัติ)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {config.phoneBackground && config.phoneBackground.startsWith('data:') && (
                        <button
                          type="button"
                          onClick={() => onChangeConfig({ ...config, phoneBackground: '/assets/Background.jpg' })}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                        >
                          คืนค่าเริ่มต้น
                        </button>
                      )}
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
                        <span>เลือกไฟล์รูปภาพ</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleCustomBgUpload(e, 'phoneBackground')}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Stickers & Screen Decorations (Draggable) */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>คลังของตกแต่ง (Stickers & Decorations จาก Assets)</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        แตะเพื่อเพิ่มสติกเกอร์ลงบนหน้าจอโทรศัพท์ — สามารถลากเลื่อนตำแหน่งในหน้าตัวอย่างได้อิสระ
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      {/* View Mode Toggle */}
                      <button
                        type="button"
                        onClick={() => setDecorViewMode(decorViewMode === 'carousel' ? 'grid' : 'carousel')}
                        className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 transition flex items-center gap-1"
                      >
                        {decorViewMode === 'carousel' ? (
                          <>
                            <LayoutGrid className="w-3 h-3 text-rose-500" />
                            <span>ดูทั้งหมด (ตาราง)</span>
                          </>
                        ) : (
                          <>
                            <ListFilter className="w-3 h-3 text-rose-500" />
                            <span>แถวเลื่อน (สไลด์)</span>
                          </>
                        )}
                      </button>

                      {/* Carousel Arrow Navigation */}
                      {decorViewMode === 'carousel' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleScroll(decorScrollRef, -320)}
                            className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition"
                            title="เลื่อนซ้าย"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScroll(decorScrollRef, 320)}
                            className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition"
                            title="เลื่อนขวา"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Filter Pills (Mouse Drag-to-Scroll) */}
                  <div
                    ref={catScrollRef}
                    {...bindDragScroll(catScrollRef, catMovedRef)}
                    onWheel={(e) => {
                      if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
                    }}
                    className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 no-scrollbar cursor-grab active:cursor-grabbing select-none"
                  >
                    {DECORATION_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (catMovedRef.current) return;
                          setDecorCategory(cat.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                          decorCategory === cat.id
                            ? 'bg-rose-500 text-white shadow-2xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Stickers Display (Carousel with Mouse Drag-to-Scroll or Grid) */}
                  {decorViewMode === 'carousel' ? (
                    <div className="relative">
                      <div
                        ref={decorScrollRef}
                        {...bindDragScroll(decorScrollRef, decorMovedRef)}
                        onWheel={(e) => {
                          if (e.deltaY !== 0) {
                            e.currentTarget.scrollLeft += e.deltaY;
                          }
                        }}
                        className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-600 border border-stone-200 dark:border-stone-700/60 p-2.5 rounded-2xl bg-stone-50/50 dark:bg-stone-850 cursor-grab active:cursor-grabbing select-none"
                      >
                        {DECORATION_ASSETS.filter((item) => {
                          if (decorCategory === 'all') return true;
                          const cat = DECORATION_CATEGORIES.find((c) => c.id === decorCategory);
                          return cat?.pattern ? item.sourceFile?.includes(cat.pattern) : true;
                        }).map((dec, idx) => (
                          <button
                            key={dec.id}
                            type="button"
                            onClick={(e) => {
                              if (decorMovedRef.current) {
                                e.preventDefault();
                                return;
                              }
                              handleAddDecoration(dec);
                            }}
                            title={`สติกเกอร์ที่ ${idx + 1} (แตะเพื่อเพิ่มลงบนจอ)`}
                            className="w-12 h-12 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-rose-400 hover:scale-110 active:scale-95 transition shrink-0 p-1 flex items-center justify-center relative group/btn shadow-2xs select-none"
                          >
                            <img
                              src={dec.src}
                              alt={`Dec ${idx + 1}`}
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                              className="w-full h-full object-contain pointer-events-none select-none"
                              loading="lazy"
                            />
                            <span className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover/btn:opacity-100 rounded-xl transition flex items-center justify-center">
                              <Plus className="w-3.5 h-3.5 text-rose-600" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-stone-200 dark:border-stone-700/60 p-3 rounded-2xl bg-stone-50/50 dark:bg-stone-850 max-h-72 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {DECORATION_ASSETS.filter((item) => {
                        if (decorCategory === 'all') return true;
                        const cat = DECORATION_CATEGORIES.find((c) => c.id === decorCategory);
                        return cat?.pattern ? item.sourceFile?.includes(cat.pattern) : true;
                      }).map((dec, idx) => (
                        <button
                          key={dec.id}
                          type="button"
                          onClick={() => handleAddDecoration(dec)}
                          title={`สติกเกอร์ที่ ${idx + 1}`}
                          className="w-full aspect-square rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-rose-400 hover:scale-105 active:scale-95 transition p-1 flex items-center justify-center relative group/btn shadow-2xs select-none"
                        >
                          <img
                            src={dec.src}
                            alt={`Dec ${idx + 1}`}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            className="w-full h-full object-contain pointer-events-none select-none"
                            loading="lazy"
                          />
                          <span className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover/btn:opacity-100 rounded-xl transition flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-rose-600" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active Decorations Placed on Phone */}
                  {(config.decorations && config.decorations.length > 0) && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300 mb-2">
                        <span>ของตกแต่งบนหน้าจอ ({config.decorations.length} ชิ้น)</span>
                        <div className="flex items-center gap-2">
                          {onSwitchToPreview && (
                            <button
                              type="button"
                              onClick={onSwitchToPreview}
                              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                            >
                              <Eye className="w-3 h-3" />
                              <span>ไปหน้าตัวอย่างเพื่อลากย้าย</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onChangeConfig({ ...config, decorations: [] })}
                            className="text-[10px] text-rose-600 hover:underline font-semibold"
                          >
                            ล้างทั้งหมด
                          </button>
                        </div>
                      </div>
                      <div
                        ref={placedScrollRef}
                        {...bindDragScroll(placedScrollRef, placedMovedRef)}
                        onWheel={(e) => {
                          if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
                        }}
                        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-rose-800 cursor-grab active:cursor-grabbing select-none"
                      >
                        {config.decorations.map((d, i) => (
                          <div
                            key={d.id}
                            className="relative w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-rose-200 p-1 flex items-center justify-center shrink-0 group select-none"
                          >
                            <img
                              src={d.src}
                              alt="Placed dec"
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                              className="w-full h-full object-contain pointer-events-none select-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDecoration(d.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <div className="pt-2 space-y-4">
                    <div>
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

                    {/* Scratch Card Foil Color Selector */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                        <span>เลือกสีแถบฟอยล์ขูดการ์ด (Foil Color)</span>
                        <span className="text-[10px] text-stone-400 font-normal">7 สียอดนิยม หรือกำหนดเอง</span>
                      </label>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
                        เลือกเฉดสีของแผ่นฟอยล์ที่ผู้รับจะต้องขูดเพื่อเปิดของขวัญ
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                        {SCRATCH_COLORS.map((color) => {
                          const isSelected = (config.scratchColor || 'gold') === color.id;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => onChangeConfig({ ...config, scratchColor: color.id })}
                              className={`p-2.5 rounded-2xl border-2 text-left transition flex items-center gap-2.5 ${
                                isSelected
                                  ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-2 ring-rose-200 dark:ring-rose-800 shadow-sm'
                                  : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-800/40'
                              }`}
                            >
                              <div
                                className="w-7 h-7 rounded-full shadow-inner border border-white/50 shrink-0"
                                style={{ background: color.swatchGrad }}
                              />
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block truncate">
                                  {color.label.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-stone-400 dark:text-stone-500 block truncate">
                                  {color.label.split('(')[1]?.replace(')', '') || ''}
                                </span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Hex Color Picker */}
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={config.scratchColor?.startsWith('#') ? config.scratchColor : '#D4AF37'}
                            onChange={(e) => onChangeConfig({ ...config, scratchColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                          />
                          <div>
                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                              กำหนดสีฟอยล์เองตามใจชอบ (Custom Color)
                            </span>
                            <span className="text-[10px] text-stone-400">
                              จิ้มที่กล่องสีเพื่อเลือกสีฟอยล์แบบ Hex Color ใดๆ ก็ได้
                            </span>
                          </div>
                        </div>
                        {config.scratchColor?.startsWith('#') && (
                          <span className="text-xs font-mono font-bold text-rose-500 bg-rose-100 dark:bg-rose-900/40 px-2.5 py-1 rounded-lg">
                            {config.scratchColor.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
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
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 transition mb-3">
                      <div 
                        onClick={() => onChangeConfig({ ...config, treeShowCountdown: config.treeShowCountdown !== undefined ? !config.treeShowCountdown : false })}
                        className="flex items-center justify-between cursor-pointer hover:opacity-90"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">⏳</span>
                          <div>
                            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                              แสดงการ์ดนับถอยหลัง (Countdown Card)
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400">
                              ลอยแสดงเวลานับถอยหลัง Odometer (PC อยู่จุดโล่ง / มือถือปรับขนาดกะทัดรัด)
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

                      {/* Optional custom countdown title if enabled */}
                      {(config.treeShowCountdown !== undefined ? config.treeShowCountdown : true) && (
                        <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                          <input
                            type="text"
                            value={config.treeCountdownTitle || ''}
                            onChange={(e) => onChangeConfig({ ...config, treeCountdownTitle: e.target.value })}
                            placeholder="หัวข้อการ์ด (เว้นว่างไว้จะใช้ค่าเริ่มต้น)"
                            className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900 focus:outline-none focus:border-rose-500 placeholder:text-stone-400"
                          />
                        </div>
                      )}
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
                            value={(photo.caption || '').replace(/\s*\(\d+(\.\d+)?\s*KB\)/i, '')}
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

            {/* TAB: ENTRY & ENVELOPE STYLES */}
            {activeTab === 'entry' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-500" />
                    <span>หน้าแรก & ซองจดหมาย (Envelope & Entry)</span>
                  </h3>
                  <span className="text-[10px] text-stone-400">
                    {ENVELOPE_ASSETS.length} ลายซอง
                  </span>
                </div>

                {/* Sliced Envelope Style Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                        เลือกลวดลายซองจดหมาย (Envelope Styles)
                      </label>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        เลือกสไตล์ซองจดหมายที่ถูกใจ (มี {ENVELOPE_ASSETS.length} ลาย พร้อมซองกระดาษคลาสสิก)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEnvelopeViewMode(envelopeViewMode === 'carousel' ? 'grid' : 'carousel')}
                        className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 transition flex items-center gap-1"
                      >
                        {envelopeViewMode === 'carousel' ? (
                          <>
                            <LayoutGrid className="w-3 h-3 text-rose-500" />
                            <span>ดูทั้งหมด (ตาราง)</span>
                          </>
                        ) : (
                          <>
                            <ListFilter className="w-3 h-3 text-rose-500" />
                            <span>แถวเลื่อน (สไลด์)</span>
                          </>
                        )}
                      </button>

                      {envelopeViewMode === 'carousel' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleScroll(envelopeScrollRef, -320)}
                            className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition"
                            title="เลื่อนซ้าย"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScroll(envelopeScrollRef, 320)}
                            className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition"
                            title="เลื่อนขวา"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {envelopeViewMode === 'carousel' ? (
                    <div
                      ref={envelopeScrollRef}
                      {...bindDragScroll(envelopeScrollRef, envelopeMovedRef)}
                      onWheel={(e) => {
                        if (e.deltaY !== 0) {
                          e.currentTarget.scrollLeft += e.deltaY;
                        }
                      }}
                      className="flex items-center gap-2.5 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-600 border border-stone-200 dark:border-stone-700 p-2.5 rounded-2xl bg-stone-50/50 dark:bg-stone-850 cursor-grab active:cursor-grabbing select-none"
                    >
                      {/* Classic Paper Envelope */}
                      <button
                        type="button"
                        onClick={() => {
                          if (envelopeMovedRef.current) return;
                          onChangeConfig({ ...config, envelopeStyle: '' });
                        }}
                        className={`h-20 w-28 rounded-xl border-2 p-2 shrink-0 transition flex flex-col items-center justify-center text-center select-none ${
                          !config.envelopeStyle
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 font-bold shadow-xs'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        <span className="text-xl mb-1 pointer-events-none">✉️</span>
                        <span className="text-[11px] font-semibold pointer-events-none">กระดาษคลาสสิก</span>
                      </button>

                      {/* All Sliced Envelope Assets */}
                      {ENVELOPE_ASSETS.map((env, idx) => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => {
                            if (envelopeMovedRef.current) return;
                            onChangeConfig({ ...config, envelopeStyle: env.src });
                          }}
                          title={`ซองจดหมายแบบที่ ${idx + 1}`}
                          className={`h-20 w-28 rounded-xl border-2 p-1.5 shrink-0 transition flex items-center justify-center relative bg-white dark:bg-stone-800 select-none ${
                            config.envelopeStyle === env.src
                              ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                              : 'border-stone-200 dark:border-stone-700 hover:border-rose-300'
                          }`}
                        >
                          <img
                            src={env.src}
                            alt={`Envelope ${idx + 1}`}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            className="w-full h-full object-contain pointer-events-none select-none"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-stone-200 dark:border-stone-700 p-3 rounded-2xl bg-stone-50/50 dark:bg-stone-850 max-h-80 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {/* Classic Paper Envelope */}
                      <button
                        type="button"
                        onClick={() => onChangeConfig({ ...config, envelopeStyle: '' })}
                        className={`h-22 rounded-xl border-2 p-2 transition flex flex-col items-center justify-center text-center ${
                          !config.envelopeStyle
                            ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-600 font-bold shadow-xs'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        <span className="text-2xl mb-1">✉️</span>
                        <span className="text-[11px] font-semibold">กระดาษคลาสสิก</span>
                      </button>

                      {/* All Sliced Envelope Assets */}
                      {ENVELOPE_ASSETS.map((env, idx) => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => onChangeConfig({ ...config, envelopeStyle: env.src })}
                          title={`ซองจดหมายแบบที่ ${idx + 1}`}
                          className={`h-22 rounded-xl border-2 p-2 transition flex items-center justify-center relative bg-white dark:bg-stone-800 ${
                            config.envelopeStyle === env.src
                              ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-xs'
                              : 'border-stone-200 dark:border-stone-700 hover:border-rose-300'
                          }`}
                        >
                          <img
                            src={env.src}
                            alt={`Envelope ${idx + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text Customization Inputs */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        ข้อความป้ายหัวบน (Top Badge)
                      </label>
                      <input
                        type="text"
                        placeholder="วันครบรอบ ♡"
                        value={config.badgeText || ''}
                        onChange={(e) => onChangeConfig({ ...config, badgeText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        คำแนะนำด้านล่าง (Bottom Prompt)
                      </label>
                      <input
                        type="text"
                        placeholder="แตะที่ของขวัญเพื่อเปิดดูด่านต่อไป"
                        value={config.promptText || ''}
                        onChange={(e) => onChangeConfig({ ...config, promptText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      หัวข้อหลักหน้าแรก (Main Title)
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
                      ข้อความในซองจดหมาย (เมื่อเปิดออก)
                    </label>
                    <textarea
                      rows={3}
                      value={config.letterText || ''}
                      onChange={(e) => onChangeConfig({ ...config, letterText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    />
                  </div>
                </div>

                {/* Draggable Note */}
                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <strong>ฟังก์ชันลากตำแหน่ง (Draggable Text):</strong> ป้ายหัวบน, หัวข้อหลัก และคำแนะนำด้านล่าง สามารถใช้นิ้วหรือเมาส์แตะลากย้ายตำแหน่งบนหน้าจอโทรศัพท์ได้โดยตรง
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PASSCODE & STICKY NOTES */}
            {activeTab === 'passcode' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>หน้ารหัสผ่าน & โน้ตคำใบ้ Post-it</span>
                </h3>

                {/* Passcode Specific Background */}
                <div className="pt-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    เลือกพื้นหลังเฉพาะสำหรับหน้ารหัสผ่าน (Passcode Background)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {[
                      { id: '', name: 'เหมือนพื้นหลังหลัก', desc: 'ตามหน้าจอโทรศัพท์' },
                      { id: '/assets/ChatBG.jpg', name: 'ChatBG.jpg', desc: 'ลายลูกไม้เขียวพาสเทล' },
                      { id: '/assets/Background.jpg', name: 'Background.jpg', desc: 'อบอุ่นลายสก๊อต' },
                      { id: '/assets/PhotoBG.jpg', name: 'PhotoBG.jpg', desc: 'โพลารอยด์โบว์ฟ้า' }
                    ].map((bg) => {
                      const isSelected = (config.passcodeBackground || '') === bg.id;
                      return (
                        <div
                          key={bg.id}
                          onClick={() => onChangeConfig({ ...config, passcodeBackground: bg.id })}
                          className={`p-2 rounded-xl border-2 cursor-pointer transition text-left ${
                            isSelected
                              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-2 ring-rose-200'
                              : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40'
                          }`}
                        >
                          <div className="w-full h-12 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-700 mb-1 border border-stone-300 dark:border-stone-600">
                            {bg.id ? (
                              <img src={bg.id} alt={bg.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500">
                                ค่าเริ่มต้น
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block truncate">{bg.name}</span>
                          <span className="text-[10px] text-stone-400 block truncate">{bg.desc}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom upload for passcode bg */}
                  <div className="flex items-center justify-between p-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-850">
                    <span className="text-[11px] text-stone-600 dark:text-stone-300">
                      หรืออัปโหลดภาพพื้นหลังหน้ารหัสผ่านของคุณเอง:
                    </span>
                    <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลดรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCustomBgUpload(e, 'passcodeBackground')}
                      />
                    </label>
                  </div>
                </div>

                {/* Passcode & Hint Form */}
                <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-700">
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
                      คำใบ้รหัสผ่าน (จะแสดงใต้ช่องกรอก)
                    </label>
                    <input
                      type="text"
                      value={config.passcodeHint || ''}
                      onChange={(e) => onChangeConfig({ ...config, passcodeHint: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-800"
                    />
                  </div>
                </div>

                {/* Draggable Post-it Sticky Notes Section */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Post-it โน้ตคำใบ้แบบติดสติกเกอร์ (Draggable Sticky Notes)
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        เพิ่มกระดาษโน้ตแปะบนหน้าจอ สามารถลากเคลื่อนย้ายตำแหน่งได้อิสระ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPostItNote}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่ม Post-it</span>
                    </button>
                  </div>

                  {/* List of active Post-it Notes */}
                  {(!config.passcodeNotes || config.passcodeNotes.length === 0) ? (
                    <div className="p-3 text-center rounded-xl bg-stone-100/70 dark:bg-stone-800/40 text-[11px] text-stone-500">
                      ยังไม่มีโน้ต Post-it (กดปุ่ม &quot;เพิ่ม Post-it&quot; เพื่อใส่คำใบ้พิเศษแปะบนหน้าจอ)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {config.passcodeNotes.map((note, idx) => (
                        <div
                          key={note.id}
                          className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex items-center gap-2"
                        >
                          {/* Color picker circles */}
                          <div className="flex items-center gap-1 shrink-0">
                            {['#FEF08A', '#FBCFE8', '#BAE6FD', '#BBF7D0'].map((col) => (
                              <button
                                key={col}
                                type="button"
                                onClick={() => handleUpdatePostItNote(note.id, { color: col })}
                                className={`w-5 h-5 rounded-full border transition ${
                                  note.color === col ? 'ring-2 ring-offset-1 ring-stone-800 scale-110' : 'opacity-70'
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>

                          {/* Note text input */}
                          <input
                            type="text"
                            value={note.text || ''}
                            onChange={(e) => handleUpdatePostItNote(note.id, { text: e.target.value })}
                            className="flex-1 px-2.5 py-1 rounded-lg text-xs border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100"
                            placeholder="ข้อความในโน้ต..."
                          />

                          {/* Delete note */}
                          <button
                            type="button"
                            onClick={() => handleRemovePostItNote(note.id)}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-500/25 active:scale-95 transition flex items-center justify-center gap-2 group ring-2 ring-emerald-300/40 tween-hover"
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
