import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Heart } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a1823] text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 relative my-auto max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button (Always visible inside card frame) */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white bg-white/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 backdrop-blur-sm shadow-sm transition active:scale-95 border border-stone-200/50 dark:border-stone-700/50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-4">
          {/* Big Website Logo & Brand Header */}
          <div className="text-center pt-1 pb-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl overflow-hidden shadow-xl ring-4 ring-rose-100 dark:ring-rose-950/60 bg-gradient-to-tr from-rose-50 to-pink-50 p-2 flex items-center justify-center">
              <img
                src="/assets/ManitaLogo.png"
                alt="MANITA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2
              id="about-modal-title"
              className="font-theme-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight"
            >
              MANITA
            </h2>
            <p className="text-xs uppercase font-bold tracking-widest text-rose-500 mt-0.5">
              Create Something Meaningful
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
              แพลตฟอร์มสร้างสรรค์ของขวัญดิจิทัลและบันทึกความทรงจำแบบ Interactive สำหรับคนพิเศษในทุกเทศกาลและโอกาสสำคัญ
            </p>
          </div>

          {/* Feature Capabilities */}
          <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/60 dark:border-stone-700/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>MANITA ทำอะไรได้บ้าง?</span>
            </h3>
            <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-sm">💌</span>
                <span><strong>ซองจดหมายเปิดใจ & Time Capsule:</strong> ตั้งเวลานับถอยหลังเปิดจดหมายหรือเปิดทันที พร้อมเพลงเพราะๆ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🔐</span>
                <span><strong>ระบบรหัสผ่าน 6 หลัก:</strong> ป้องกันของขวัญด้วยรหัสผ่านความทรงจำ (รองรับคีย์บอร์ด PC และ Numpad)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">💬</span>
                <span><strong>แชทจำลองความรู้สึก:</strong> บทสนทนาที่ค่อยๆ พิมพ์ออกมาเสมือนคุยกันแบบเรียลไทม์</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🎯</span>
                <span><strong>แบบทดสอบ Mini Quiz:</strong> คำถามน่ารักๆ วัดความจำเรื่องราวระหว่างเรา</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">📸</span>
                <span><strong>กล้องโพลารอยด์ & การ์ดขูดลุ้นรางวัล:</strong> ปริ้นท์รูปถ่ายความทรงจำ หรือขูดการ์ดรับของรางวัลลับ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🎄</span>
                <span><strong>ต้นคริสต์มาส 3D Cinematic:</strong> ฉากทัศน์หิมะ ซานต้า ลูกบอลแก้ว และกล่องของขวัญ 3D ปลดล็อกตามเวลา</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🏹</span>
                <span><strong>ยิงธนูอวยพรวันเกิด:</strong> ยิงธนูเปิดกล่องเค้กไฟ ASCII พร้อมรูปภาพลอย 3D</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🎟️</span>
                <span><strong>คูปองสิทธิพิเศษ:</strong> คูปองกดใช้สิทธิ์ได้จริง เช่น ไปกินชาบู, กอดฟรี, ยกโทษให้ 1 ครั้ง</span>
              </li>
            </ul>
          </div>

          {/* Why MANITA */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>ทำไมต้องเป็น MANITA?</span>
            </h3>
            <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 leading-relaxed">
              <p>
                <strong>มากกว่าแค่ส่งข้อความ:</strong> ในยุคดิจิทัลที่ทุกอย่างเกิดขึ้นอย่างรวดเร็ว MANITA ถูกออกแบบมาเพื่อเปลี่ยนของขวัญธรรมดาให้กลายเป็นการเดินทางผ่านความรู้สึก (Interactive Journey) ที่ผู้รับจะได้สัมผัส คลิก เล่น และยิ้มไปกับทุกด่าน
              </p>
              <p>
                <strong>สะดวก สแกนง่าย ไม่ต้องลงแอป:</strong> ผู้รับเปิดผ่าน Browser ได้ทันทีบนมือถือทุกรุ่น หรือคอมพิวเตอร์ผ่าน QR Code และ Short Link
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-center">
            <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
              พัฒนาด้วยความใส่ใจโดย <span className="text-rose-500">MANITA Team</span>
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">
              © 2026 MANITA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
