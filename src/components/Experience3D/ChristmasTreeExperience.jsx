import React, { useRef, useEffect } from 'react';

export default function ChristmasTreeExperience({
  title = 'Merry Christmas',
  subtitle = 'A SPECIAL WISH FOR YOU',
  wishMessage = 'ขอให้คริสต์มาสนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨',
  photos = [],
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
          photos
        }, '*');
      }
    };

    const frame = iframeRef.current;
    if (frame) {
      frame.addEventListener('load', handleLoad);
      return () => frame.removeEventListener('load', handleLoad);
    }
  }, [wishMessage, title, photos]);

  return (
    <div className="w-full h-full min-h-[640px] relative bg-black overflow-hidden rounded-[30px]">
      <iframe
        ref={iframeRef}
        src={`/experiences/ChristmasTree.html?view=${isRecipient ? 'recipient' : 'creator'}`}
        className="w-full h-full border-0 absolute inset-0"
        title="MANITA 3D Christmas Tree Experience"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
