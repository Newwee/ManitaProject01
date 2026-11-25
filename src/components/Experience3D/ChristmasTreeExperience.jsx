import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import ChristmasMusicPlayer from './ChristmasMusicPlayer';
import ChristmasCountdownCard from './ChristmasCountdownCard';

export default function ChristmasTreeExperience({
  title = 'Merry Christmas',
  subtitle = 'A SPECIAL WISH FOR YOU',
  wishMessage = 'ขอให้คริสต์มาสนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨',
  photos = [],
  treeTheme = 'classic',
  lockMode = 'immediate',
  unlockDate = '2026-12-25T00:00',
  boxUnlockDates = [],
  lockMessage = '',
  showCountdown = true,
  countdownTitle = '',
  decorations = {},
  isRecipient = false
}) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
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

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsIntroComplete(true);
    }, 6200);

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'MANITA_TREE_ANIMATION_COMPLETE') {
        setIsIntroComplete(true);
      } else if (e.data && e.data.type === 'MANITA_TREE_ANIMATION_RESET') {
        setIsIntroComplete(false);
        clearTimeout(timer);
        timer = setTimeout(() => {
          setIsIntroComplete(true);
        }, 6200);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const lastSyncRef = useRef('');

  const sendSyncMessage = () => {
    const frame = iframeRef.current;
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({
          type: 'MANITA_TREE_SYNC',
          wishMessage,
          wishTitle: title,
          treeTheme,
          photos,
          lockMode,
          unlockDate,
          boxUnlockDates,
          lockMessage,
          showCountdown,
          countdownTitle,
          decorations,
          isRecipient
        }, '*');
      } catch (e) {}
    }
  };

  useEffect(() => {
    const payload = JSON.stringify({
      wishMessage,
      wishTitle: title,
      treeTheme,
      photos,
      lockMode,
      unlockDate,
      boxUnlockDates,
      lockMessage,
      showCountdown,
      countdownTitle,
      decorations,
      isRecipient
    });

    if (payload === lastSyncRef.current) return;
    lastSyncRef.current = payload;
    sendSyncMessage();
  }, [
    wishMessage,
    title,
    treeTheme,
    photos,
    lockMode,
    unlockDate,
    boxUnlockDates,
    lockMessage,
    showCountdown,
    countdownTitle,
    decorations,
    isRecipient
  ]);

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
        src={`/experiences/ChristmasTree.html?view=${viewMode}&theme=${treeTheme}&v=2.6`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA 3D Christmas Tree Experience"
        allow="autoplay; fullscreen"
        onLoad={sendSyncMessage}
      />

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute top-3.5 right-4 z-[110] px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xl flex items-center gap-1.5 transition active:scale-95"
        title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ดูแบบเต็มจอ'}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-rose-400" /> : <Maximize2 className="w-3.5 h-3.5 text-rose-400" />}
        <span>{isFullscreen ? 'ออกเต็มจอ' : 'เต็มจอ'}</span>
      </button>

      {showCountdown && lockMode !== 'immediate' && (
        <ChristmasCountdownCard
          unlockDate={unlockDate}
          countdownTitle={countdownTitle}
          lockMode={lockMode}
        />
      )}

      <ChristmasMusicPlayer showUI={true} />
    </div>
  );
}
