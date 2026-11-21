import React, { useEffect, useState, useRef } from 'react';
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
  Palette,
  Heart,
  Gift,
  Image as ImageIcon
} from 'lucide-react';
import { createShareableGift } from '../../lib/giftStorage';
import {
  MANITA_SQL_SETUP,
  USER_PROJECT_URL
} from '../../lib/supabase';

const QR_PALETTES = [
  { id: 'classic', name: 'Classic Dark', dark: '#18181b', light: '#ffffff', border: '#e4e4e7', accent: '#18181b' },
  { id: 'rose', name: 'Rose Romance', dark: '#be123c', light: '#fff1f2', border: '#fecdd3', accent: '#f43f5e' },
  { id: 'emerald', name: 'Festive Pine', dark: '#065f46', light: '#f0fdf4', border: '#bbf7d0', accent: '#10b981' },
  { id: 'gold', name: 'Royal Gold', dark: '#854d0e', light: '#fefce8', border: '#fef08a', accent: '#eab308' },
  { id: 'midnight', name: 'Midnight Velvet', dark: '#312e81', light: '#f5f3ff', border: '#ddd6fe', accent: '#6366f1' }
];

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

  // QR Customization States
  const [qrTheme, setQrTheme] = useState('classic');
  const [qrCenterBadge, setQrCenterBadge] = useState('logo'); // 'logo' | 'heart' | 'gift' | 'none'
  const canvasRef = useRef(null);

  const generateLinkAndQR = async (chosenUrl) => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      let targetUrl = chosenUrl || shareUrl;
      if (!targetUrl) {
        const giftId = 'manita_' + Math.random().toString(36).substring(2, 9);
        const result = await createShareableGift(giftId, config);
        targetUrl = result.url;
        setShareUrl(result.url);
        setSaveMethod(result.method);
        setIsCloudSaved(result.isCloudSaved);
      }

      await renderStyledQR(targetUrl, qrTheme, qrCenterBadge);
    } catch (err) {
      console.error('Failed to generate shareable gift:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการสร้างลิงก์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStyledQR = async (url, themeId, badge) => {
    if (!url) return;
    const theme = QR_PALETTES.find(t => t.id === themeId) || QR_PALETTES[0];
    const size = 360;

    // Use offscreen canvas to render QR Code with High Error Correction
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    await QRCode.toCanvas(canvas, url, {
      errorCorrectionLevel: 'H', // Tolerates up to 30% center overlay without losing scan accuracy
      width: size,
      margin: 2,
      color: {
        dark: theme.dark,
        light: theme.light
      }
    });

    const ctx = canvas.getContext('2d');

    // Draw center badge if chosen
    if (badge !== 'none') {
      const center = size / 2;
      const badgeSize = size * 0.2; // 20% width (safe under 30% ECC)

      // Circular backing with subtle shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.arc(center, center, badgeSize / 2 + 3, 0, Math.PI * 2);
      ctx.fillStyle = theme.light;
      ctx.fill();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = theme.dark;
      ctx.stroke();
      ctx.restore();

      if (badge === 'logo') {
        // Draw MANITA Logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/assets/ManitaLogo.png';
        await new Promise((resolve) => {
          logoImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(center, center, badgeSize / 2 - 1, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logoImg, center - badgeSize / 2, center - badgeSize / 2, badgeSize, badgeSize);
            ctx.restore();
            resolve();
          };
          logoImg.onerror = () => resolve();
        });
      } else {
        // Draw Emoji Badge
        ctx.font = `${Math.floor(badgeSize * 0.65)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badge === 'heart' ? '💖' : '🎁', center, center + 1);
      }
    }

    setQrDataUrl(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    if (!isOpen) return;
    generateLinkAndQR();
  }, [isOpen]);

  useEffect(() => {
    if (shareUrl) {
      renderStyledQR(shareUrl, qrTheme, qrCenterBadge);
    }
  }, [qrTheme, qrCenterBadge]);

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
    a.download = `MANITA-Gift-QRCode-${qrTheme}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadGiftCard = () => {
    if (!qrDataUrl) return;
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 600;
    cardCanvas.height = 800;
    const ctx = cardCanvas.getContext('2d');
    const theme = QR_PALETTES.find(t => t.id === qrTheme) || QR_PALETTES[0];

    // Card background
    ctx.fillStyle = theme.light;
    ctx.fillRect(0, 0, 600, 800);

    // Decorative border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 560, 760);

    ctx.strokeStyle = theme.dark;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 544, 744);

    // Header
    ctx.fillStyle = theme.dark;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MANITA SPECIAL GIFT', 300, 95);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText('ของขวัญและความทรงจำสำหรับคนพิเศษ 🎁', 300, 130);

    // QR Image
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 125, 170, 350, 350);

      // Bottom Message
      ctx.fillStyle = theme.dark;
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('สแกน QR Code ด้วยกล้องมือถือเพื่อเปิดดู', 300, 580);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '14px monospace';
      ctx.fillText(shareUrl.substring(0, 48) + (shareUrl.length > 48 ? '...' : ''), 300, 620);

      ctx.fillStyle = theme.accent;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('✨ สแกนติดง่าย 100% • เปิดดูได้ทันทีไม่ต้องลงแอป ✨', 300, 690);

      const a = document.createElement('a');
      a.href = cardCanvas.toDataURL('image/png');
      a.download = `MANITA-GiftCard-${qrTheme}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
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

        {/* QR Customization Options */}
        <div className="mt-2.5 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>ปรับแต่งความสวยงาม QR Code (ไม่ทำให้เสีย)</span>
            </span>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QR_PALETTES.map((pal) => (
              <button
                key={pal.id}
                onClick={() => setQrTheme(pal.id)}
                className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition shrink-0 border ${
                  qrTheme === pal.id
                    ? 'border-rose-500 bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                    : 'border-transparent bg-stone-200/70 dark:bg-stone-700/60 text-stone-600 dark:text-stone-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.dark }} />
                <span>{pal.name}</span>
              </button>
            ))}
          </div>

          {/* Center Badge Chooser */}
          <div className="mt-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[10px]">
            <span className="text-stone-500 dark:text-stone-400 font-medium">ตราสัญลักษณ์ตรงกลาง:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'logo', label: 'โลโก้' },
                { id: 'heart', label: '💖 หัวใจ' },
                { id: 'gift', label: '🎁 ของขวัญ' },
                { id: 'none', label: 'เรียบ' }
              ].map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setQrCenterBadge(badge.id)}
                  className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                    qrCenterBadge === badge.id
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>
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

        {/* Action Buttons: Download QR & Gift Card */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            <span>ดาวน์โหลด QR</span>
          </button>
          <button
            onClick={handleDownloadGiftCard}
            disabled={!qrDataUrl}
            className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5 text-rose-500" />
            <span>การ์ดของขวัญ (Card)</span>
          </button>
        </div>

        {/* Test Open Link Button */}
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 dark:shadow-none"
        >
          <ExternalLink className="w-3.5 h-3.5 text-white" />
          <span>ทดสอบเปิดดูของขวัญ (Recipient Mode)</span>
        </a>

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
