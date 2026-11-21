import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, ExternalLink, QrCode as QrIcon, Sparkles, Database, CheckCircle, RefreshCw } from 'lucide-react';
import { createShareableGift } from '../../lib/giftStorage';
import { isSupabaseConfigured, getSupabaseUrl, setStoredSupabaseUrl } from '../../lib/supabase';

export default function ShareModal({
  isOpen,
  onClose,
  config,
  isDarkMode = false
}) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMethod, setSaveMethod] = useState('');
  const [supabaseInput, setSupabaseInput] = useState('');
  const [showDbInput, setShowDbInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateLinkAndQR = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const giftId = 'manita_' + Math.random().toString(36).substring(2, 9);
      const result = await createShareableGift(giftId, config);

      setShareUrl(result.url);
      setSaveMethod(result.method);

      // Generate high-resolution, high-contrast QR Code (Error Correction M, Black on White)
      const qr = await QRCode.toDataURL(result.url, {
        errorCorrectionLevel: 'M',
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(qr);
    } catch (err) {
      console.error('Failed to generate shareable gift:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการสร้างลิงก์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setSupabaseInput(getSupabaseUrl() || '');
    generateLinkAndQR();
  }, [isOpen]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'MANITA-Gift-QRCode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveSupabaseUrl = () => {
    if (supabaseInput && supabaseInput.trim().startsWith('http')) {
      setStoredSupabaseUrl(supabaseInput.trim());
      setShowDbInput(false);
      generateLinkAndQR();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 relative text-center my-auto transition-colors duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
          <QrIcon className="w-6 h-6" />
        </div>
        <h3 className="font-theme-display text-xl font-bold text-stone-900 dark:text-stone-100">
          ของขวัญพร้อมส่งแล้ว!
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 mb-3">
          ส่ง QR Code หรือส่งลิงก์ให้คนพิเศษเปิดดูของขวัญที่ตกแต่งไว้ได้ทันที
        </p>

        {/* QR Code Container */}
        <div className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center min-h-[220px]">
          {isGenerating ? (
            <div className="text-xs text-stone-500 dark:text-stone-400 animate-pulse flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-rose-500 animate-spin" />
              <span>กำลังบันทึกและสร้าง QR Code คมชัด...</span>
            </div>
          ) : qrDataUrl ? (
            <div className="relative group">
              <img
                src={qrDataUrl}
                alt="MANITA Gift QR Code"
                className="w-48 h-48 rounded-2xl shadow-md border-2 border-stone-200 dark:border-stone-600 bg-white p-2 mx-auto"
              />
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-medium flex items-center justify-center gap-1">
                <span>📱</span>
                <span>สแกนด้วยกล้องมือถือเพื่อเปิดของขวัญ</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-400 space-y-2">
              <p>{errorMsg || 'กำลังเตรียมข้อมูล QR Code...'}</p>
              <button
                onClick={generateLinkAndQR}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold flex items-center gap-1 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ลองใหม่อีกครั้ง</span>
              </button>
            </div>
          )}
        </div>

        {/* URL Box & Copy */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300 truncate focus:outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
          </button>
        </div>

        {/* Action Buttons: Download QR & Open Link */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span>ดาวน์โหลด QR</span>
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-300 dark:text-white" />
            <span>ทดสอบเปิดดู</span>
          </a>
        </div>

        {/* Storage Mode Status & Supabase Settings */}
        <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-[10px] text-stone-500 dark:text-stone-400">
          {saveMethod === 'supabase' ? (
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>✓ บันทึกลง Supabase สำเร็จ (ลิงก์สั้น สแกนติดง่าย 100%)</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1 text-stone-600 dark:text-stone-400 font-medium">
                <span>⚡ โหมด Standalone Hash Link</span>
              </div>
              <div>
                <button
                  onClick={() => setShowDbInput(!showDbInput)}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center justify-center gap-1 mx-auto"
                >
                  <Database className="w-3 h-3" />
                  <span>{showDbInput ? 'ซ่อนการตั้งค่า Supabase' : 'เชื่อมต่อ Supabase URL เพื่อสร้างลิงก์สั้น'}</span>
                </button>
              </div>

              {showDbInput && (
                <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 mt-2 text-left space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-700 dark:text-stone-300 block">
                    ใส่ Supabase Project URL ของคุณ:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={supabaseInput}
                      onChange={(e) => setSupabaseInput(e.target.value)}
                      placeholder="https://xxxx.supabase.co"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-none"
                    />
                    <button
                      onClick={handleSaveSupabaseUrl}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      เชื่อมต่อ
                    </button>
                  </div>
                  <p className="text-[9px] text-stone-400 dark:text-stone-500">
                    * เมื่อเชื่อมต่อแล้ว ของขวัญจะบันทึกลงตาราง manita_gifts และได้ลิงก์สั้น ?gift=... ทันที
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
