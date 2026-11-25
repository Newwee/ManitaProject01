import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import ChristmasMusicPlayer from './ChristmasMusicPlayer';

export default function Santa3DExperience({
  greeting = 'MERRY CHRISTMAS 2026',
  wishTitle = 'Merry Christmas! 🎅✨',
  wishMessage = 'ขอให้ซานต้านำพาความสุข รอยยิ้ม และของขวัญดีๆ มาให้เธอในทุกๆ วันนะ สุขสันต์วันคริสต์มาสและปีใหม่!',
  senderName = 'Secret Santa',
  recipientName = 'Special Person',
  speed = 1,
  layers = {},
  photos = [],
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

    return {
      greeting,
      wishTitle,
      wishMessage,
      senderName,
      recipientName,
      speed: Number(speed) || 1,
      layers,
      photos: cleanPhotos
    };
  }, [greeting, wishTitle, wishMessage, senderName, recipientName, speed, layers, photos]);

  const sendSyncMessage = useCallback(() => {
    const frame = iframeRef.current;
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage(
          {
            type: 'MANITA_SANTA_SYNC',
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
      className={`w-full h-full relative bg-[#03040a] overflow-hidden flex-1 ${
        isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen' : ''
      }`}
    >
      <iframe
        ref={iframeRef}
        src={`/experiences/Santa3D.html?view=${viewMode}&v=1`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA Santa 3D Experience"
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

      <ChristmasMusicPlayer showUI={true} musicTrack={musicTrack} defaultTrack="all_i_want" />
    </div>
  );
}
