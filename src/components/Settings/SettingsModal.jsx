import React, { useState } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Layers,
  Bell,
  Sun,
  Moon,
  Laptop,
  RotateCcw,
  Sliders,
  Check,
  CheckCircle2,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { DEFAULT_PREFERENCES } from '../../lib/userPreferences';

export default function SettingsModal({
  isOpen,
  onClose,
  preferences,
  onChangePreferences,
  onResetPreferences,
  isDarkMode = false
}) {
  const [activeTab, setActiveTab] = useState('appearance');

  if (!isOpen) return null;

  const updateSection = (section, updates) => {
    onChangePreferences({
      ...preferences,
      [section]: {
        ...(preferences[section] || {}),
        ...updates
      }
    });
  };

  const currentTheme = preferences.appearance?.theme || 'system';
  const bgStyle = preferences.background?.style || 'original';
  const animIntensity = preferences.animation?.intensity || 'normal';

  const tabs = [
    { id: 'appearance', label: 'รูปลักษณ์', icon: <Palette className="w-4 h-4" /> },
    { id: 'background', label: 'ภาพพื้นหลัง', icon: <Layers className="w-4 h-4" /> },
    { id: 'animation', label: 'แอนิเมชัน', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: <Bell className="w-4 h-4" /> }
  ];

  const backgroundOptions = [
    {
      id: 'original',
      name: 'Original Background (ค่าเริ่มต้น)',
      desc: 'พื้นหลังลายจุดคลาสสิกดั้งเดิมของ MANITA เรียบง่าย อบอุ่น และสบายตา'
    },
    {
      id: 'soft_aurora',
      name: 'Soft Aurora (แสงออโรรานุ่มนวล)',
      desc: 'แสงไฟแผ่วเบาสีพาสเทลเคลื่อนไหวอย่างช้าๆ สร้างบรรยากาศโรแมนติก'
    },
    {
      id: 'aurora',
      name: 'Aurora Wave (ริบบิ้นแสงเหนือ)',
      desc: 'ระลอกคลื่นแสงเหนือระยิบระยับพาดผ่านด้านบน ให้ความรู้สึกพรีเมียม'
    },
    {
      id: 'floating_particles',
      name: 'Starry Dust (ละอองดาวลอยละล่อง)',
      desc: 'ประกายละอองดาวและหัวใจจิ๋วลอยอย่างนุ่มนวล เพิ่มมนต์สะกดให้น่าประทับใจ'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none transition-colors duration-300">
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/70 text-rose-500 flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 dark:text-stone-100 leading-snug">
                การตั้งค่าส่วนบุคคล (Personalization)
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                ปรับแต่งความสวยงามและเอฟเฟกต์ตามสไตล์ที่คุณชอบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:w-48 border-b sm:border-b-0 sm:border-r border-stone-100 dark:border-stone-800 p-2 sm:p-3 flex sm:flex-col overflow-x-auto sm:overflow-visible gap-1 shrink-0 no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 text-left ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-xs font-extrabold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-left">
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                    ธีมหน้าจอ (Theme Mode)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'light', label: 'สว่าง (Light)', icon: <Sun className="w-4 h-4 text-amber-500" /> },
                      { id: 'dark', label: 'มืด (Dark)', icon: <Moon className="w-4 h-4 text-purple-400" /> },
                      { id: 'system', label: 'ตามระบบ', icon: <Laptop className="w-4 h-4 text-sky-500" /> }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateSection('appearance', { theme: item.id })}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                          currentTheme === item.id
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        เอฟเฟกต์กระจกฝ้า (Glass Surface)
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        เพิ่มความโปร่งแสงและเงาสะท้อนระดับพรีเมียมบนกล่องเมนู
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('appearance', { glassSurface: !preferences.appearance?.glassSurface })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.appearance?.glassSurface ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.appearance?.glassSurface ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        เอฟเฟกต์บรรยากาศใน Studio
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        แสดงเส้นใยเรืองแสง (Ghost Fibers) ในหน้าสร้างของขวัญ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('appearance', { visualEffects: !preferences.appearance?.visualEffects })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.appearance?.visualEffects ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.appearance?.visualEffects ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      เลือกรูปแบบพื้นหลัง (Background Style)
                    </label>
                    {bgStyle !== 'original' && (
                      <button
                        type="button"
                        onClick={() => updateSection('background', { style: 'original' })}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition"
                      >
                        ปิดเอฟเฟกต์ (กลับสู่ Original)
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {backgroundOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => updateSection('background', { style: opt.id })}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                          bgStyle === opt.id
                            ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 hover:border-stone-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="shrink-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              bgStyle === opt.id
                                ? 'border-rose-500 bg-rose-500 text-white'
                                : 'border-stone-300 dark:border-stone-600'
                            }`}
                          >
                            {bgStyle === opt.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {opt.name}
                            </h4>
                            {bgStyle === opt.id && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0">
                                กำลังแสดงผลสด
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                            {opt.desc}
                          </p>
                        </div>

                        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-center relative shadow-xs">
                          {opt.id === 'original' && (
                            <div
                              className="w-full h-full bg-[#EFE8DF] dark:bg-[#121214]"
                              style={{
                                backgroundImage: isDarkMode
                                  ? 'radial-gradient(rgba(255, 255, 255, 0.2) 1.5px, transparent 1.5px)'
                                  : 'radial-gradient(rgba(200, 162, 124, 0.4) 1.5px, transparent 1.5px)',
                                backgroundSize: '6px 6px'
                              }}
                            />
                          )}
                          {opt.id === 'soft_aurora' && (
                            <div className="w-full h-full bg-stone-900 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/80 via-purple-500/80 to-sky-400/80 blur-xs" />
                            </div>
                          )}
                          {opt.id === 'aurora' && (
                            <div className="w-full h-full bg-stone-950 relative overflow-hidden">
                              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-cyan-400 to-amber-300 blur-xs opacity-90 animate-pulse" />
                            </div>
                          )}
                          {opt.id === 'floating_particles' && (
                            <div className="w-full h-full bg-stone-900 flex items-center justify-center gap-0.5 text-[10px] text-pink-300">
                              <span>✨</span>
                              <span>♥</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {bgStyle !== 'original' && (
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800/60 space-y-4">
                    <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                      <span>✨ กำลังแสดงผลสดบนหน้าจอ</span>
                      <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">ปรับค่าแสงได้ตามต้องการ</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-stone-700 dark:text-stone-300">ความเข้มแสง (Intensity)</span>
                        <span className="text-rose-500 font-mono">{preferences.background?.intensity || 70}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={preferences.background?.intensity || 70}
                        onChange={(e) => updateSection('background', { intensity: Number(e.target.value) })}
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-stone-700 dark:text-stone-300">ความเร็วการเคลื่อนไหว (Speed)</span>
                        <span className="text-rose-500 font-mono">{preferences.background?.speed || 1}x</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 0.6, label: 'ช้า (0.6x)' },
                          { val: 1, label: 'ปกติ (1.0x)' },
                          { val: 1.5, label: 'เร็ว (1.5x)' }
                        ].map((s) => (
                          <button
                            key={s.val}
                            type="button"
                            onClick={() => updateSection('background', { speed: s.val })}
                            className={`py-1.5 rounded-xl border text-xs font-bold transition ${
                              (preferences.background?.speed || 1) === s.val
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-stone-700 dark:text-stone-300">ความโปร่งแสง (Opacity)</span>
                        <span className="text-rose-500 font-mono">{preferences.background?.opacity || 60}%</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="90"
                        value={preferences.background?.opacity || 60}
                        onChange={(e) => updateSection('background', { opacity: Number(e.target.value) })}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'animation' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                    ระดับความเคลื่อนไหว (Animation Level)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'off', label: 'ปิด (Off)' },
                      { id: 'subtle', label: 'นุ่มนวล (Subtle)' },
                      { id: 'normal', label: 'ปกติ (Normal)' }
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => updateSection('animation', { intensity: lvl.id })}
                        className={`p-2.5 rounded-2xl border text-xs font-bold transition ${
                          animIntensity === lvl.id
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 shadow-xs'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        ประกายดาวเมื่อคลิก (Click Spark)
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        ประกายดาวและหัวใจจิ๋วระยิบระยับเมื่อแตะหรือคลิกหน้าจอ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('animation', { clickSpark: !preferences.animation?.clickSpark })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.animation?.clickSpark ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.animation?.clickSpark ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        ข้อความเปิดตัวนุ่มนวล (Blur Text Reveal)
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        แสดงข้อความหัวข้อด้วยเอฟเฟกต์เบลอเปิดตัวอย่างนุ่มนวล
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('animation', { blurText: !preferences.animation?.blurText })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.animation?.blurText ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.animation?.blurText ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        ประกายบริเวณขอบปุ่ม (Star Border)
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        เพิ่มเส้นแสงประกายดาววิ่งรอบปุ่มสำคัญให้สะดุดตา
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('animation', { starBorder: !preferences.animation?.starBorder })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.animation?.starBorder ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.animation?.starBorder ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        เปิดใช้งานการแจ้งเตือน (In-App Notifications)
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        แสดงข้อความแจ้งเตือนความคืบหน้าเมื่อทำงานต่างๆ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('notifications', {
                          enabled: preferences.notifications?.enabled === false ? true : false
                        })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.notifications?.enabled !== false ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.notifications?.enabled !== false ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        โหมดเงียบสงบ (Quiet Mode)
                      </h4>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">
                        แจ้งเตือนเฉพาะเหตุการณ์สำคัญ เช่น บันทึกสำเร็จ หรือเกิดข้อผิดพลาด
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection('notifications', {
                          quietMode: preferences.notifications?.quietMode === false ? true : false
                        })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        preferences.notifications?.quietMode !== false ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          preferences.notifications?.quietMode !== false ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/60">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
                    ระยะเวลาแสดงการแจ้งเตือน (Toast Duration)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 3000, label: '3 วินาที (สั้น)' },
                      { val: 4000, label: '4 วินาที (ปกติ)' },
                      { val: 6000, label: '6 วินาที (นาน)' }
                    ].map((d) => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => updateSection('notifications', { duration: d.val })}
                        className={`py-2 rounded-xl border text-xs font-bold transition ${
                          (preferences.notifications?.duration || 4000) === d.val
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
          <button
            type="button"
            onClick={onResetPreferences}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น (Restore Defaults)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition active:scale-95"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
}
