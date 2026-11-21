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
  Crosshair
} from 'lucide-react';
import { PRESET_CATEGORIES, THEME_PRESETS, AVAILABLE_STICKERS } from '../../types/themePresets';
import { FRAME_STYLES } from '../GiftExperience/Stage_Camera';
import { compressImageFile } from '../../lib/imageCompressor';

export default function CreatorDashboard({
  config,
  onChangeConfig,
  onSwitchToPreview,
  onOpenShareModal
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

  // Photo upload with auto-compression to <= 1000 KB
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setCompressMsg('กำลังบีบอัดรูปภาพให้ไม่เกิน 1000KB...');

    try {
      const res = await compressImageFile(file);
      const newPhoto = {
        url: res.dataUrl,
        caption: `ภาพความทรงจำ (${res.compressedSizeKB} KB)`
      };

      const updatedPhotos = [...(config.photos || []), newPhoto];
      onChangeConfig({ ...config, photos: updatedPhotos });

      setCompressMsg(`✅ บีบอัดสำเร็จ: ${res.originalSizeKB} KB → ${res.compressedSizeKB} KB (-${res.ratio}%)`);
      setTimeout(() => setCompressMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setCompressMsg('❌ เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setCompressing(false);
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

  return (
    <div className="w-full max-w-5xl mx-auto pt-16 pb-14 px-3 sm:px-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
              MANITA Studio
            </span>
            <span className="text-xs text-stone-400">• Creator Mode</span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 mt-1">
            ออกแบบของขวัญดิจิทัล & เลือกรูปแบบ Preset
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            เลือกรูปแบบประสบการณ์ ปรับแต่งข้อความแชท ใส่รูปภาพ แล้วส่งต่อให้คนพิเศษ
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onSwitchToPreview}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-stone-600" />
            <span>ลองเล่นตัวอย่าง</span>
          </button>
          <button
            onClick={onOpenShareModal}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-200 transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>สร้างลิงก์ & QR Code</span>
          </button>
        </div>
      </div>

      {/* Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1.5">
          <button
            onClick={() => setActiveTab('category')}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'category'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. เลือกหมวด Preset (4 แบบ)</span>
          </button>

          {(currentCategory === 'chat_scratch' || currentCategory === 'chat_camera') && (
            <>
              <button
                onClick={() => setActiveTab('theme')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                  activeTab === 'theme'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>2. เลือกธีมสี & บรรยากาศ</span>
              </button>

              <button
                onClick={() => setActiveTab('entry')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                  activeTab === 'entry'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>3. หน้าแรก & ซองจดหมาย</span>
              </button>

              <button
                onClick={() => setActiveTab('passcode')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                  activeTab === 'passcode'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>4. รหัสผ่าน 6 หลัก</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                  activeTab === 'chat'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>5. ปรับแต่งข้อความแชท</span>
              </button>

              <button
                onClick={() => setActiveTab('reveal')}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                  activeTab === 'reveal'
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                {config.revealType === 'camera' ? (
                  <Camera className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>6. ขูดการ์ด หรือ กล้องถ่ายรูป</span>
              </button>
            </>
          )}

          {currentCategory === 'christmas_tree' && (
            <button
              onClick={() => setActiveTab('tree_settings')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                activeTab === 'tree_settings'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <TreePine className="w-4 h-4" />
              <span>ปรับแต่งต้นคริสต์มาส & คำอวยพร</span>
            </button>
          )}

          {currentCategory === 'arrow_birthday' && (
            <button
              onClick={() => setActiveTab('arrow_settings')}
              className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                activeTab === 'arrow_settings'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>ปรับแต่งยิงธนู & เค้กวันเกิด</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('photos')}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
              activeTab === 'photos'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>อัปโหลดรูปภาพ (≤ 1000KB)</span>
          </button>
        </div>

        {/* Right Editor Panels */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          {/* TAB: PRESET CATEGORIES */}
          {activeTab === 'category' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-500" />
                  <span>เลือกรูปแบบประสบการณ์หลัก (4 Preset Categories)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
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
                      className={`p-4 rounded-3xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 shadow-md ring-2 ring-rose-200'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{cat.icon}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {cat.badge}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-stone-900">{cat.name}</h4>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{cat.desc}</p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-rose-600">
                        <span>{isSelected ? '✓ เลือกหมวดนี้แล้ว' : 'แตะเพื่อเลือกหมวดนี้'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: THEME SELECTION */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-500" />
                  <span>เลือกธีม & บรรยากาศ (Theme Presets)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
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
                          ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
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
                        <h4 className="font-bold text-xs text-stone-800">{t.name}</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">{t.occasion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Background Image Selector (From Assets/Background) */}
              <div className="pt-4 border-t border-stone-200 mt-3">
                <h4 className="text-xs font-bold text-stone-800 mb-1 flex items-center gap-1.5">
                  <span>🖼️</span>
                  <span>เลือกภาพพื้นหลังโทรศัพท์ (Background จาก Assets ตามรูปที่ 2)</span>
                </h4>
                <p className="text-[11px] text-stone-500 mb-3">
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
                            ? 'border-rose-500 bg-rose-50/60 shadow-sm ring-2 ring-rose-200'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                        }`}
                      >
                        <div className="w-full h-16 rounded-xl overflow-hidden bg-stone-200 mb-2 border border-stone-300">
                          {bg.id ? (
                            <img src={bg.id} alt={bg.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#EFE8DF] flex items-center justify-center text-[10px] text-stone-500 font-mono">
                              Pattern
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-stone-800 truncate block">{bg.name}</span>
                        <span className="text-[10px] text-stone-400 truncate block">{bg.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHAT MESSAGES EDITOR (Directly answering user's request for image 2) */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-rose-500" />
                  <span>ปรับแต่งห้องแชท & เพิ่มข้อความพูดคุย (Chat Editor)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  คุณสามารถแก้ไขชื่อ รูปโปรไฟล์ และเพิ่มข้อความตอบโต้ระหว่างผู้ส่งกับผู้รับได้อย่างอิสระ
                </p>
              </div>

              {/* Chat Contact Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ชื่อผู้ส่งในห้องแชท
                  </label>
                  <input
                    type="text"
                    value={config.chatName || ''}
                    onChange={(e) => onChangeConfig({ ...config, chatName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="เช่น คนพิเศษของเธอ ♡"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    รูปโปรไฟล์ (Emoji Avatar)
                  </label>
                  <input
                    type="text"
                    value={config.chatAvatar || '🐻'}
                    onChange={(e) => onChangeConfig({ ...config, chatAvatar: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="🐻"
                  />
                </div>
              </div>

              {/* First Bot message */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ข้อความแชทข้อความแรก (ที่ผู้ส่งทักไป)
                </label>
                <input
                  type="text"
                  value={config.chatMsg1 || ''}
                  onChange={(e) => onChangeConfig({ ...config, chatMsg1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                  placeholder="เช่น เธอทำอะไรอยู่ ว่างไหม?"
                />
              </div>

              {/* Dynamic Interactive Dialog Options */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700">
                    ตัวเลือกที่ให้ผู้รับกดตอบ และข้อความที่ระบบจะตอบกลับ:
                  </label>
                  <button
                    onClick={handleAddChatDialogChoice}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มข้อความแชท</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(config.chatDialog || []).map((choice, dIdx) => (
                    <div key={dIdx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-600">
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
                        <span className="text-[10px] text-stone-400 block mb-0.5">
                          ข้อความบนปุ่มที่ผู้รับกดส่ง:
                        </span>
                        <input
                          type="text"
                          value={choice.userChoice || ''}
                          onChange={(e) => handleUpdateChatChoiceText(dIdx, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block mb-0.5">
                          ข้อความที่ตอบกลับกลับไป:
                        </span>
                        <input
                          type="text"
                          value={choice.botReplies?.[0] || ''}
                          onChange={(e) => handleUpdateBotReplyText(dIdx, 0, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVEAL TYPE (SCRATCH CARD VS INSTANT CAMERA + FRAME SHAPES) */}
          {activeTab === 'reveal' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>เลือกรูปแบบ: การ์ดขูด หรือ กล้องถ่ายรูป (ตามรูปที่ 3, 4, 5)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  เลือกรูปแบบการเปิดเผยความลับว่าจะให้ผู้รับขูดการ์ดสีทอง หรือกดชัตเตอร์กล้องถ่ายรูป
                </p>
              </div>

              {/* Option Selector: Scratch vs Camera */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => onChangeConfig({ ...config, revealType: 'scratch' })}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    config.revealType !== 'camera'
                      ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <span className="text-3xl">🪙</span>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">1. การ์ดขูดรางวัลลับ</h4>
                    <p className="text-[10px] text-stone-500">ใช้นิ้วหรือเมาส์ขูดแถบสีทอง</p>
                  </div>
                </button>

                <button
                  onClick={() => onChangeConfig({ ...config, revealType: 'camera' })}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-center gap-3 ${
                    config.revealType === 'camera'
                      ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <span className="text-3xl">📸</span>
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">2. กล้องถ่ายรูปปริ้นท์ภาพ</h4>
                    <p className="text-[10px] text-stone-500">กดชัตเตอร์สีแดงแล้วรูปจะปริ้นท์ออกมา</p>
                  </div>
                </button>
              </div>

              {/* Conditional Settings based on selection */}
              {config.revealType !== 'camera' ? (
                /* Scratch Secret */
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ของรางวัลลับที่ซ่อนอยู่ใต้การ์ดขูด
                  </label>
                  <input
                    type="text"
                    value={config.scratchSecret || ''}
                    onChange={(e) => onChangeConfig({ ...config, scratchSecret: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="เช่น คูปองตามใจเธอ 1 วันเต็ม! 💖"
                  />
                </div>
              ) : (
                /* Camera Frame Shapes (Image 5) */
                <div className="pt-2 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      เลือกรูปทรงกรอบรูป (Frame Shape Styles ตามรูปที่ 5):
                    </label>
                    <p className="text-[11px] text-stone-500 mb-3">
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
                              ? 'border-rose-500 bg-rose-50/50 shadow-sm ring-2 ring-rose-200'
                              : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                          }`}
                        >
                          {/* Mini visual frame preview */}
                          <div className="w-16 h-16 bg-stone-100 flex items-center justify-center my-2 border border-stone-300 shadow-xs overflow-hidden">
                            {frame.id === 'circle' && (
                              <div className="w-12 h-12 rounded-full border-2 border-stone-800 bg-amber-100" />
                            )}
                            {frame.id === 'square' && (
                              <div className="w-12 h-12 rounded-xs border-2 border-stone-800 bg-rose-100" />
                            )}
                            {frame.id === 'oval' && (
                              <div className="w-10 h-14 rounded-[20px] border-2 border-amber-500 bg-blue-100" />
                            )}
                            {frame.id === 'cloud' && (
                              <div className="w-12 h-12 rounded-[16px] border-2 border-emerald-500 bg-emerald-100"
                                   style={{ borderRadius: '42% 58% 62% 38% / 45% 45% 55% 55%' }} />
                            )}
                            {frame.id === 'dashed' && (
                              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-rose-500 bg-pink-100" />
                            )}
                            {frame.id === 'arch' && (
                              <div className="w-10 h-14 rounded-t-full border-2 border-indigo-500 bg-indigo-100" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-800 block">{frame.name}</span>
                            <span className="text-[10px] text-stone-400">{frame.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: 3D CHRISTMAS TREE SETTINGS */}
          {activeTab === 'tree_settings' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-emerald-600" />
                  <span>ปรับแต่งต้นคริสต์มาส 3D & กล่องของขวัญ</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ปรับหัวข้อ คำอวยพร และรูปภาพในกล่องของขวัญใต้ต้นไม้
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    หัวข้อบนต้นไม้ (Title)
                  </label>
                  <input
                    type="text"
                    value={config.treeTitle || 'Merry Christmas'}
                    onChange={(e) => onChangeConfig({ ...config, treeTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="Merry Christmas"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    คำบรรยายย่อย (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.treeSubtitle || 'A SPECIAL WISH FOR YOU'}
                    onChange={(e) => onChangeConfig({ ...config, treeSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="A SPECIAL WISH FOR YOU"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ข้อความคำอวยพรในกล่องของขวัญ (Wish Message)
                  </label>
                  <textarea
                    rows={4}
                    value={config.treeWish || 'ขอให้เทศกาลนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨'}
                    onChange={(e) => onChangeConfig({ ...config, treeWish: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: 3D ARROW BIRTHDAY SETTINGS */}
          {activeTab === 'arrow_settings' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-pink-500" />
                  <span>ปรับแต่งยิงธนู & เค้กวันเกิด 3D</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ปรับข้อความอวยพรก่อนและหลังยิงธนูเปิดเค้กวันเกิด
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    หัวข้อวันเกิด (Birthday Title)
                  </label>
                  <input
                    type="text"
                    value={config.arrowTitle || 'Happy Birthday'}
                    onChange={(e) => onChangeConfig({ ...config, arrowTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="Happy Birthday"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    คำบรรยายย่อย (Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.arrowSubtitle || 'WISHING YOU ENDLESS HAPPINESS ✨'}
                    onChange={(e) => onChangeConfig({ ...config, arrowSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="WISHING YOU ENDLESS HAPPINESS ✨"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ข้อความการ์ดอวยพรวันเกิด (Wish Letter)
                  </label>
                  <textarea
                    rows={4}
                    value={config.arrowWish || 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖'}
                    onChange={(e) => onChangeConfig({ ...config, arrowWish: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ลงชื่อผู้ส่ง (Sign Off)
                  </label>
                  <input
                    type="text"
                    value={config.arrowSign || '— จากคนที่หวังดีเสมอ ✨'}
                    onChange={(e) => onChangeConfig({ ...config, arrowSign: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="— จากคนที่หวังดีเสมอ ✨"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHOTOS & AUTO COMPRESSION */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-rose-500" />
                    <span>รูปภาพความทรงจำ & สติกเกอร์</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    บีบอัดอัตโนมัติ ≤ 1000KB
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  อัปโหลดรูปภาพของคุณเอง หากยังไม่ได้อัปโหลด ระบบจะแสดงรูปภาพแบบว่าง (Placeholder)
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 hover:border-rose-400 bg-stone-50/50 text-center transition">
                <input
                  type="file"
                  id="photo-upload-input"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={compressing}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-rose-500 mb-1.5 animate-bounce" />
                  <span className="text-xs font-bold text-stone-800">
                    {compressing ? 'กำลังบีบอัดรูปภาพ...' : 'คลิกเพื่ออัปโหลดรูปภาพใหม่'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    ขนาดไม่เกิน 5MB (ระบบจะบีบอัดลงมาไม่เกิน 1000KB โดยอัตโนมัติ)
                  </span>
                </label>
                {compressMsg && (
                  <p className="text-xs font-bold mt-2 text-stone-700">{compressMsg}</p>
                )}
              </div>

              {/* Photo list */}
              <div className="space-y-3">
                {(!config.photos || config.photos.length === 0) ? (
                  <div className="p-4 rounded-2xl bg-stone-50 text-center text-xs text-stone-400">
                    ยังไม่มีรูปภาพที่อัปโหลด (ระบบจะแสดงภาพ Placeholder ที่สะอาดตาแทน)
                  </div>
                ) : (
                  config.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3"
                    >
                      <img
                        src={photo.url}
                        alt="Thumbnail"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-300"
                      />
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-bold text-stone-500 block mb-0.5">
                          คำบรรยายใต้ภาพรูปที่ {idx + 1}
                        </label>
                        <input
                          type="text"
                          value={photo.caption || ''}
                          onChange={(e) => handleUpdatePhotoCaption(idx, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
                          placeholder="คำบรรยายความทรงจำ..."
                        />
                      </div>
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition shrink-0"
                        title="ลบรูปภาพนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Sticker Selector */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-700 mb-2">
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
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
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
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-500" />
                <span>หน้าแรก & ข้อความซองจดหมาย</span>
              </h3>
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    หัวข้อหน้าแรก
                  </label>
                  <input
                    type="text"
                    value={config.introTitle || ''}
                    onChange={(e) => onChangeConfig({ ...config, introTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ข้อความในซองจดหมาย
                  </label>
                  <textarea
                    rows={3}
                    value={config.letterText || ''}
                    onChange={(e) => onChangeConfig({ ...config, letterText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passcode' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <span>รหัสผ่าน 6 หลัก & คำใบ้</span>
              </h3>
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
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
                    className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    คำใบ้รหัสผ่าน
                  </label>
                  <input
                    type="text"
                    value={config.passcodeHint || ''}
                    onChange={(e) => onChangeConfig({ ...config, passcodeHint: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
