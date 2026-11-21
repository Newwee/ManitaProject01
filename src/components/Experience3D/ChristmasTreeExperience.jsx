import React, { useRef, useEffect } from 'react';

export default function ChristmasTreeExperience({
  title = 'Merry Christmas',
  subtitle = 'A SPECIAL WISH FOR YOU',
  wishMessage = 'ขอให้คริสต์มาสนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨',
  photos = [],
  treeTheme = 'classic',
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
          photos
        }, '*');
      }
    };

    const frame = iframeRef.current;
    if (frame) {
      frame.addEventListener('load', handleLoad);
      // Also post immediately if already loaded
      try {
        if (frame.contentWindow) {
          frame.contentWindow.postMessage({
            type: 'MANITA_TREE_SYNC',
            wishMessage,
            wishTitle: title,
            treeTheme,
            photos
          }, '*');
        }
      } catch (e) {}

      return () => frame.removeEventListener('load', handleLoad);
    }
  }, [wishMessage, title, treeTheme, photos]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex-1">
      <iframe
        ref={iframeRef}
        src={`/experiences/ChristmasTree.html?view=clean&theme=${treeTheme}&v=2`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA 3D Christmas Tree Experience"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
