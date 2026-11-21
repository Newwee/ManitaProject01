import React, { useRef, useEffect } from 'react';

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
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleLoad = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
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
      }
    };

    const frame = iframeRef.current;
    if (frame) {
      frame.addEventListener('load', handleLoad);
      try {
        if (frame.contentWindow) {
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
        }
      } catch (e) {}

      return () => frame.removeEventListener('load', handleLoad);
    }
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
    <div className="w-full h-full relative bg-black overflow-hidden flex-1">
      <iframe
        ref={iframeRef}
        src={`/experiences/ChristmasTree.html?view=${viewMode}&theme=${treeTheme}&v=2.1`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA 3D Christmas Tree Experience"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
