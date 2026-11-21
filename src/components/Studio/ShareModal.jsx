import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  QrCode as QrIcon,
  Sparkles,
  Database,
  CheckCircle,
  RefreshCw,
  Terminal,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { createShareableGift } from '../../lib/giftStorage';
import {
  getSupabaseUrl,
  setStoredSupabaseUrl,
  MANITA_SQL_SETUP,
  USER_PROJECT_URL
} from '../../lib/supabase';

export default function ShareModal({
  isOpen,
  onClose,
  config,
  isDarkMode = false
}) {
  const [shareUrl, setShareUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMethod, setSaveMethod] = useState('');
  const [isCloudSaved, setIsCloudSaved] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateLinkAndQR = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const giftId = 'manita_' + Math.random().toString(36).substring(2, 9);
      const result = await createShareableGift(giftId, config);

      setShareUrl(result.url);
      setSaveMethod(result.method);
      setIsCloudSaved(result.isCloudSaved);

      // Generate high-resolution, low-density QR Code (Short URL = Easy Scanning 100%)
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
    generateLinkAndQR();
  }, [isOpen]);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(MANITA_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 relative text-center my-auto transition-colors duration-300 max-h-[94vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with ManitaLogo.png */}
        <img
          src="/assets/ManitaLogo.png"
          alt="MANITA Logo"
          className="w-12 h-12 mx-auto mb-2 rounded-2xl shadow-sm object-contain"
        />
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
              <span>กำลังบันทึกของขวัญและสร้าง QR Code คมชัด...</span>
            </div>
          ) : qrDataUrl ? (
            <div className="relative group">
              <img
                src={qrDataUrl}
                alt="MANITA Gift QR Code"
                className="w-48 h-48 rounded-2xl shadow-md border-2 border-stone-200 dark:border-stone-600 bg-white p-2 mx-auto"
              />
              <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 font-medium flex items-center justify-center gap-1">
                <span>📱</span>
                <span>สแกนด้วยกล้องมือถือได้ทันที (สแกนติดง่าย 100%)</span>
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

        {/* Short URL Box & Copy Button */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] font-mono text-stone-700 dark:text-stone-300 truncate focus:outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              copiedLink
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
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
            className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 dark:shadow-none"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
            <span>ทดสอบเปิดดู</span>
          </a>
        </div>

        {/* Cloud Status Indicator */}
        <div className="mt-3 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 text-[11px]">
          {isCloudSaved ? (
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>✓ บันทึกลง Cloud สำเร็จ (รูปภาพ & ข้อมูลครบ 100%)</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 text-stone-500">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>บันทึกในเครื่องเรียบร้อยแล้ว</span>
            </div>
          )}

          {/* Supabase Personal Setup Assistant */}
          <div className="mt-2 text-left">
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-[10px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium flex items-center justify-center gap-1 mx-auto transition"
            >
              <Database className="w-3 h-3 text-rose-500" />
              <span>{showSqlGuide ? 'ซ่อนคำแนะนำ Supabase' : 'วิธีเปิดใช้ตารางใน Supabase ส่วนตัวของคุณ'}</span>
            </button>

            {showSqlGuide && (
              <div className="mt-2 p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-[10px] text-stone-600 dark:text-stone-300 space-y-2">
                <div className="flex items-start gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                  <Terminal className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>วิธีสร้างตาราง manita_gifts ใน Supabase ส่วนตัว (3 ขั้นตอน):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[10px] text-stone-600 dark:text-stone-400 pl-1">
                  <li>กดปุ่ม <b>"คัดลอกคำสั่ง SQL"</b> ด้านล่างนี้</li>
                  <li>กดปุ่ม <b>"เปิด Supabase SQL Editor"</b> เพื่อไปที่หน้าแดชบอร์ดของคุณ</li>
                  <li>วางโค้ดลงในช่องแล้วกดปุ่มสีเขียว <b>Run</b> เป็นอันเสร็จสิ้น!</li>
                </ol>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={handleCopySql}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                      copiedSql
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 dark:bg-stone-700 text-white hover:bg-stone-800'
                    }`}
                  >
                    {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'คัดลอก SQL แล้ว!' : 'คัดลอกคำสั่ง SQL'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/xaazsuwbkzplovdwanmm/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>เปิด SQL Editor</span>
                  </a>
                </div>

                <p className="text-[9px] text-stone-400 dark:text-stone-500 text-center">
                  * ตอนนี้ระบบมี Cloud สำรองให้แล้ว ของขวัญสามารถส่งและสแกนใช้งานได้ทันที แม้ยังไม่ได้รัน SQL
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
