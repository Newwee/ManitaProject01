import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import ChristmasMusicPlayer from './ChristmasMusicPlayer';

export default function AsciiChristmasExperience({
  wishTitle = 'MERRY CHRISTMAS & HAPPY NEW YEAR',
  wishMessage = 'ขอให้ช่วงเวลาแห่งความสุขนี้อบอวลไปด้วยรอยยิ้ม ความอบอุ่น และความทรงจำดีๆ ตลอดทั้งปีนะครับ\nไม่ว่าปีหน้าจะเจอเรื่องท้าทายแค่ไหน ขอให้มีแต่พลังบวกและคนดีๆ อยู่รอบตัวเสมอ ✨',
  senderName = 'Secret Santa',
  recipientName = 'Special Person',
  theme = 'classic',
  photos = [],
  ornamentNotes = [],
  customCharset = '',
  musicTrack = 'auto',
  isRecipient = false
}) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastSyncRef = useRef('');

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const el = containerRef.current || document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const buildPayload = useCallback(() => {
    const cleanPhotos = Array.isArray(photos)
      ? photos
          .filter((p) => p && p.url)
          .map((p) => ({
            url: p.url,
            caption: p.caption || ''
          }))
      : [];

    const cleanNotes = Array.isArray(ornamentNotes)
      ? ornamentNotes.map((n) => (typeof n === 'string' ? n.trim() : '')).filter(Boolean)
      : [];

    return {
      wishTitle,
      wishMessage,
      senderName,
      recipientName,
      theme,
      photos: cleanPhotos,
      ornamentNotes: cleanNotes.length > 0 ? cleanNotes : undefined,
      customCharset
    };
  }, [wishTitle, wishMessage, senderName, recipientName, theme, photos, ornamentNotes, customCharset]);

  const sendSyncMessage = useCallback(() => {
    const frame = iframeRef.current;
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage(
          {
            type: 'MANITA_SYNC',
            payload: buildPayload()
          },
          '*'
        );
      } catch (e) {}
    }
  }, [buildPayload]);

  useEffect(() => {
    const serialized = JSON.stringify(buildPayload());
    if (serialized === lastSyncRef.current) return;
    lastSyncRef.current = serialized;
    sendSyncMessage();
  }, [buildPayload, sendSyncMessage]);

  const viewMode = isRecipient ? 'recipient' : 'preview';

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative bg-black overflow-hidden flex-1 ${
        isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen' : ''
      }`}
    >
      <iframe
        ref={iframeRef}
        src={`/experiences/AsciiChristmasTree.html?view=${viewMode}&v=1`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA ASCII 3D Christmas Tree"
        allow="autoplay; fullscreen"
        onLoad={sendSyncMessage}
      />

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute top-3.5 right-4 z-[110] px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xl flex items-center gap-1.5 transition active:scale-95"
        title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ดูแบบเต็มจอ'}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
        <span>{isFullscreen ? 'ออกเต็มจอ' : 'เต็มจอ'}</span>
      </button>

      <ChristmasMusicPlayer showUI={true} musicTrack={musicTrack} defaultTrack="we_wish" />
    </div>
  );
}
