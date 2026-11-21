import React, { useState } from 'react';
import {
  Palette,
  Mail,
  Lock,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Image as ImageIcon,
  Ticket,
  Plus,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Eye,
  Share2
} from 'lucide-react';
import { THEME_PRESETS, AVAILABLE_STICKERS } from '../../types/themePresets';
import { compressImageFile } from '../../lib/imageCompressor';

export default function CreatorDashboard({
  config,
  onChangeConfig,
  onSwitchToPreview,
  onOpenShareModal
}) {
  const [activeTab, setActiveTab] = useState('theme');
  const [compressing, setCompressing] = useState(false);
  const [compressMsg, setCompressMsg] = useState('');

  const currentTheme = THEME_PRESETS[config.theme] || THEME_PRESETS.scrapbook;

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

  const handleAddCoupon = () => {
    const newCoupon = '🎁 คูปองพิเศษตามใจเธอ 1 อย่าง';
    onChangeConfig({
      ...config,
      coupons: [...(config.coupons || []), newCoupon]
    });
  };

  const handleRemoveCoupon = (idx) => {
    const updated = (config.coupons || []).filter((_, i) => i !== idx);
    onChangeConfig({ ...config, coupons: updated });
  };

  const handleUpdateCoupon = (idx, text) => {
    const updated = [...(config.coupons || [])];
    updated[idx] = text;
    onChangeConfig({ ...config, coupons: updated });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-16 pb-14 px-3 sm:px-6">
      {/* Top Banner / Callout */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
              MANITA Studio
            </span>
            <span className="text-xs text-stone-400">• Creator Mode</span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 mt-1">
            ออกแบบของขวัญดิจิทัล & เลือกธีมเทศกาล
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ปรับแต่งเนื้อหา ใส่รูปภาพ บันทึกความทรงจำ แล้วสร้าง QR Code ส่งให้คนพิเศษได้ทันที
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

      {/* Builder Layout: Category Tabs + Form Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1.5">
          {[
            { id: 'theme', label: '1. เลือกธีมเทศกาล', icon: Palette },
            { id: 'entry', label: '2. หน้าแรก & ซองจดหมาย', icon: Mail },
            { id: 'passcode', label: '3. รหัสผ่าน 6 หลัก', icon: Lock },
            { id: 'chat', label: '4. แชทจำลองความรู้สึก', icon: MessageCircle },
            { id: 'quiz', label: '5. แบบทดสอบ Mini Quiz', icon: HelpCircle },
            { id: 'scratch', label: '6. การ์ดขูดรางวัลลับ', icon: Sparkles },
            { id: 'photos', label: '7. รูปภาพ & สติกเกอร์', icon: ImageIcon },
            { id: 'coupons', label: '8. คูปอง & โน้ตเสียง', icon: Ticket }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Editor Panels */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          {/* TAB 1: THEME & OCCASION */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-500" />
                  <span>เลือกธีม & บรรยากาศ (4 Visual Themes)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  การเลือกธีมจะเปลี่ยนพาเลทสี เพลงสังเคราะห์ แอนิเมชัน และข้อความเริ่มต้นทั้งหมด
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

                      <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center gap-1.5 text-[10px] text-stone-400">
                        <span>โทน: {t.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ENTRY & ENVELOPE */}
          {activeTab === 'entry' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-rose-500" />
                  <span>หน้าแรก & ซองจดหมายเปิดของขวัญ</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ข้อความต้อนรับและจดหมายที่ซ่อนอยู่ในซอง 3D
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    หัวข้อหน้าแรก (Intro Title)
                  </label>
                  <input
                    type="text"
                    value={config.introTitle || ''}
                    onChange={(e) => onChangeConfig({ ...config, introTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="เช่น เรามีอะไรจะให้ดู..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    คำอธิบายสั้นๆ ใต้หัวข้อ (Intro Subtitle)
                  </label>
                  <input
                    type="text"
                    value={config.introSub || ''}
                    onChange={(e) => onChangeConfig({ ...config, introSub: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="เช่น แตะที่ตราประทับหัวใจเพื่อเปิดซองจดหมาย"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ข้อความในการ์ดจดหมาย (Letter Text)
                  </label>
                  <textarea
                    rows={3}
                    value={config.letterText || ''}
                    onChange={(e) => onChangeConfig({ ...config, letterText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="ข้อความซึ้งๆ ที่อยากบอก..."
                  />
                </div>

                {/* Time Capsule Lock Toggle */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800">
                        ล็อกเวลาเปิดของขวัญ (Time Capsule Feature)
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        หากเปิดใช้งาน ผู้รับจะไม่สามารถเปิดดูของขวัญได้จนกว่าจะถึงเวลาที่กำหนด
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(config.timeLockEnabled)}
                      onChange={(e) =>
                        onChangeConfig({ ...config, timeLockEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-rose-500 rounded focus:ring-rose-400"
                    />
                  </div>

                  {config.timeLockEnabled && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        วันและเวลาที่อนุญาตให้เปิด (Target Unlock Date)
                      </label>
                      <input
                        type="datetime-local"
                        value={config.timeLockDate || ''}
                        onChange={(e) =>
                          onChangeConfig({ ...config, timeLockDate: e.target.value })
                        }
                        className="px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASSCODE */}
          {activeTab === 'passcode' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>รหัสผ่าน 6 หลัก (Passcode System)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ตั้งรหัสผ่าน 6 หลักเพื่อเพิ่มความสนุกและตื่นเต้นให้ผู้รับ
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    รหัสผ่าน 6 หลัก (Passcode PIN)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={config.passcode || '231069'}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      onChangeConfig({ ...config, passcode: val });
                    }}
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-mono tracking-widest text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="231069"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    คำใบ้รหัสผ่าน (Passcode Hint)
                  </label>
                  <input
                    type="text"
                    value={config.passcodeHint || ''}
                    onChange={(e) => onChangeConfig({ ...config, passcodeHint: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                    placeholder="เช่น วันครบรอบของเรา หรือวันเกิดเธอ"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHAT SIMULATOR */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-rose-500" />
                  <span>แชทจำลองความรู้สึก (Simulated Chat)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ปรับชื่อผู้ส่ง อิโมจิรูปโปรไฟล์ และข้อความแชททักทาย
                </p>
              </div>

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

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ข้อความแชทข้อความแรก
                </label>
                <input
                  type="text"
                  value={config.chatMsg1 || ''}
                  onChange={(e) => onChangeConfig({ ...config, chatMsg1: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                  placeholder="เช่น เธอทำอะไรอยู่ ว่างไหม?"
                />
              </div>
            </div>
          )}

          {/* TAB 5: MINI QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-500" />
                  <span>คำถามทายใจ Mini Quiz</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ตั้งคำถามทบทวนความทรงจำเพื่อความสนุกก่อนถึงของขวัญชิ้นใหญ่
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {(config.quizzes || []).map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">ข้อที่ {qIdx + 1}</span>
                      <span className="text-[10px] text-rose-500 font-bold">
                        (เลือกข้อที่ถูกต้องทางขวา)
                      </span>
                    </div>

                    <input
                      type="text"
                      value={q.question || ''}
                      onChange={(e) => {
                        const updated = [...config.quizzes];
                        updated[qIdx].question = e.target.value;
                        onChangeConfig({ ...config, quizzes: updated });
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
                      placeholder="คำถาม..."
                    />

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_${qIdx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => {
                              const updated = [...config.quizzes];
                              updated[qIdx].correctIndex = optIdx;
                              onChangeConfig({ ...config, quizzes: updated });
                            }}
                            className="text-rose-500 focus:ring-rose-400"
                          />
                          <input
                            type="text"
                            value={opt || ''}
                            onChange={(e) => {
                              const updated = [...config.quizzes];
                              updated[qIdx].options[optIdx] = e.target.value;
                              onChangeConfig({ ...config, quizzes: updated });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white"
                            placeholder={`ตัวเลือกที่ ${optIdx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCRATCH CARD */}
          {activeTab === 'scratch' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  <span>การ์ดขูดรางวัลลับ (Scratch-to-Reveal)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  ข้อความลับที่จะปรากฏขึ้นเมื่อผู้รับใช้นิ้วหรือเมาส์ขูดแถบสีทอง
                </p>
              </div>

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
            </div>
          )}

          {/* TAB 7: PHOTOS & STICKERS */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-rose-500" />
                    <span>รูปภาพในกรอบ Polaroid & สติกเกอร์</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    จำกัดรูป & บีบอัดอัตโนมัติ ≤ 1000KB
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  อัปโหลดรูปภาพความทรงจำ โดยระบบจะบีบอัดให้อัตโนมัติไม่เกิน 1000KB ตามข้อกำหนด
                </p>
              </div>

              {/* Upload Action */}
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
                    รองรับ JPG, PNG (สูงสุด 5MB บีบอัดลงเหลือ ≤ 1000KB)
                  </span>
                </label>
                {compressMsg && (
                  <p className="text-xs font-bold mt-2 text-stone-700">{compressMsg}</p>
                )}
              </div>

              {/* Photo list */}
              <div className="space-y-3">
                {(config.photos || []).map((photo, idx) => (
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
                ))}
              </div>

              {/* Sticker Selector */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  เลือกสติกเกอร์แปะบนกรอบ Polaroid
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

          {/* TAB 8: COUPONS & VOICE NOTE */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-rose-500" />
                  <span>คูปองสิทธิพิเศษ & คำพูดในโน้ตเสียง</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  คูปองที่ผู้รับสามารถกดใช้สิทธิ์ได้จริง พร้อมแอนิเมชันปั๊มตราประทับ
                </p>
              </div>

              {/* Voice Caption */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  คำพูดในโน้ตเสียง (Voice Note Quote)
                </label>
                <input
                  type="text"
                  value={config.voiceCaption || ''}
                  onChange={(e) => onChangeConfig({ ...config, voiceCaption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
                  placeholder='เช่น "ขอบคุณที่เข้ามาเป็นความสุขของเรานะ ♡"'
                />
              </div>

              {/* Coupons list */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    รายการคูปองสิทธิพิเศษ
                  </label>
                  <button
                    onClick={handleAddCoupon}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มคูปอง</span>
                  </button>
                </div>

                {(config.coupons || []).map((cpn, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cpn || ''}
                      onChange={(e) => handleUpdateCoupon(idx, e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800"
                      placeholder="ชื่อคูปอง..."
                    />
                    <button
                      onClick={() => handleRemoveCoupon(idx)}
                      className="p-2 text-stone-400 hover:text-rose-500 transition"
                      title="ลบคูปองนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
