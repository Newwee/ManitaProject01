import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function ArrowBirthdayExperience({
  title = 'Happy Birthday',
  subtitle = 'WISHING YOU ENDLESS HAPPINESS ✨',
  wishMessage = 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖',
  wishSign = '— จากคนที่หวังดีเสมอ ✨',
  photos = [],
  isRecipient = false
}) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const lastSyncRef = useRef('');

  const sendSyncMessage = () => {
    const frame = iframeRef.current;
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({
          type: 'MANITA_ARROW_SYNC',
          wishMessage,
          wishTitle: title,
          wishSign,
          photos,
          isRecipient
        }, '*');
      } catch (e) {}
    }
  };

  useEffect(() => {
    const payload = JSON.stringify({
      wishMessage,
      wishTitle: title,
      wishSign,
      photos,
      isRecipient
    });

    if (payload === lastSyncRef.current) return;
    lastSyncRef.current = payload;
    sendSyncMessage();
  }, [wishMessage, title, wishSign, photos, isRecipient]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative bg-[#04020a] overflow-hidden flex-1 ${
        isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen' : ''
      }`}
    >
      <iframe
        ref={iframeRef}
        src={`/experiences/arrow_birthday.html?view=clean&v=3${isRecipient ? '&recipient=true' : ''}`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA Arrow Birthday Experience"
        allow="autoplay; fullscreen"
        onLoad={sendSyncMessage}
      />

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute top-3.5 right-4 z-[110] px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xl flex items-center gap-1.5 transition active:scale-95"
        title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ดูแบบเต็มจอ'}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-pink-400" /> : <Maximize2 className="w-3.5 h-3.5 text-pink-400" />}
        <span>{isFullscreen ? 'ออกเต็มจอ' : 'เต็มจอ'}</span>
      </button>
    </div>
  );
}
