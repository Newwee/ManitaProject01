import React, { useRef, useEffect } from 'react';

export default function ArrowBirthdayExperience({
  title = 'Happy Birthday',
  subtitle = 'WISHING YOU ENDLESS HAPPINESS ✨',
  wishMessage = 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖',
  wishSign = '— จากคนที่หวังดีเสมอ ✨',
  photos = [],
  isRecipient = false
}) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleLoad = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'MANITA_ARROW_SYNC',
          wishMessage,
          wishTitle: title,
          wishSign,
          photos,
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
            type: 'MANITA_ARROW_SYNC',
            wishMessage,
            wishTitle: title,
            wishSign,
            photos,
            isRecipient
          }, '*');
        }
      } catch (e) {}

      return () => frame.removeEventListener('load', handleLoad);
    }
  }, [wishMessage, title, wishSign, photos, isRecipient]);

  return (
    <div className="w-full h-full relative bg-[#04020a] overflow-hidden flex-1">
      <iframe
        ref={iframeRef}
        src={`/experiences/arrow_birthday.html?view=clean&v=3${isRecipient ? '&recipient=true' : ''}`}
        className="w-full h-full border-0 absolute inset-0 block"
        title="MANITA Arrow Birthday Experience"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
