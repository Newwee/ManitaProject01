import React from 'react';
import { X, Sparkles, Heart, Gift, Camera, MessageSquare, HelpCircle, ShieldCheck, Smartphone, ExternalLink } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a1823] text-stone-900 dark:text-stone-100 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200/80 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Website Logo & Brand Header */}
        <div className="text-center pt-2 pb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 rounded-3xl overflow-hidden shadow-xl ring-4 ring-rose-100 dark:ring-rose-950/60 bg-gradient-to-tr from-rose-50 to-pink-50 p-2 flex items-center justify-center">
            <img
              src="/assets/ManitaLogo.png"
              alt="MANITA Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="font-theme-display text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
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
        <div className="space-y-4 my-4">
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
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
            พัฒนาด้วยความใส่ใจโดย <span className="text-rose-500">MANITA Team</span>
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            © 2026 MANITA. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
