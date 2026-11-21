import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, ExternalLink, QrCode as QrIcon, Sparkles } from 'lucide-react';
import { createShareableGift } from '../../lib/giftStorage';

export default function ShareModal({
  isOpen,
  onClose,
  config
}) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMethod, setSaveMethod] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const generate = async () => {
      setIsGenerating(true);
      const giftId = 'manita_' + Math.random().toString(36).substring(2, 9);
      const result = await createShareableGift(giftId, config);

      setShareUrl(result.url);
      setSaveMethod(result.method);

      try {
        const qr = await QRCode.toDataURL(result.url, {
          width: 280,
          margin: 2,
          color: {
            dark: '#1C1917',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(qr);
      } catch (err) {
        console.error('Failed to generate QR:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generate();
  }, [isOpen, config]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
          <QrIcon className="w-6 h-6" />
        </div>
        <h3 className="font-theme-display text-xl font-bold text-stone-900">
          ของขวัญพร้อมส่งแล้ว!
        </h3>
        <p className="text-xs text-stone-500 mt-0.5 mb-4">
          ส่ง QR Code หรือส่งลิงก์นี้ให้คนพิเศษเปิดดูของขวัญที่ตกแต่งไว้ได้ทันที
        </p>

        {/* QR Code Container */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col items-center justify-center min-h-[220px]">
          {isGenerating ? (
            <div className="text-xs text-stone-500 animate-pulse flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 text-rose-500 animate-spin" />
              <span>กำลังสร้าง QR Code ความละเอียดสูง...</span>
            </div>
          ) : qrDataUrl ? (
            <div className="relative group">
              <img
                src={qrDataUrl}
                alt="MANITA Gift QR Code"
                className="w-48 h-48 rounded-xl shadow-sm border border-stone-200 bg-white p-1"
              />
              <div className="text-[10px] text-stone-400 mt-2">
                สแกนด้วยกล้องมือถือเพื่อเปิดของขวัญ
              </div>
            </div>
          ) : null}
        </div>

        {/* URL Box & Copy */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 select-all focus:outline-none"
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
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>ดาวน์โหลด QR</span>
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-300" />
            <span>ทดสอบเปิดดู</span>
          </a>
        </div>

        {/* Cloud Sync indicator */}
        <div className="mt-3 text-[10px] text-stone-400">
          {saveMethod === 'supabase' ? (
            <span className="text-emerald-600 font-medium">
              ☁️ บันทึกลง Supabase Cloud สำเร็จ
            </span>
          ) : (
            <span>⚡ บันทึกและเข้ารหัสข้อมูลของขวัญลงในลิงก์โดยตรง (พร้อมใช้งานทันที)</span>
          )}
        </div>
      </div>
    </div>
  );
}
