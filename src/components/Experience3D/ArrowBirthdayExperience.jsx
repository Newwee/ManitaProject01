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
          photos
        }, '*');
      }
    };

    const frame = iframeRef.current;
    if (frame) {
      frame.addEventListener('load', handleLoad);
      return () => frame.removeEventListener('load', handleLoad);
    }
  }, [wishMessage, title, wishSign, photos]);

  return (
    <div className="w-full h-full min-h-[640px] relative bg-[#04020a] overflow-hidden rounded-[30px]">
      <iframe
        ref={iframeRef}
        src={`/experiences/arrow_birthday.html?view=${isRecipient ? 'recipient' : 'creator'}`}
        className="w-full h-full border-0 absolute inset-0"
        title="MANITA Arrow Birthday Experience"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
