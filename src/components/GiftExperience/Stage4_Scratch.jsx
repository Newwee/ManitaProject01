import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Gift, ChevronRight, Eye } from 'lucide-react';
import { playScratchSound, playSuccessFanfare } from '../../lib/soundEngine';
import confetti from 'canvas-confetti';

export default function Stage4_Scratch({
  scratchSecret = 'คูปองตามใจเธอ 1 วันเต็ม! 💖',
  onNextStage
}) {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Fill foil overlay
    const w = canvas.width;
    const h = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#D4AF37');
    grad.addColorStop(0.3, '#FFF3C4');
    grad.addColorStop(0.6, '#B8860B');
    grad.addColorStop(1, '#E6C25B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Add sparkle dots on foil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.beginPath();
      ctx.arc(rx, ry, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered label text
    ctx.fillStyle = '#3E2A0A';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ ใช้นิ้วหรือเมาส์ขูดตรงนี้ ✨', w / 2, h / 2 - 8);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#5A4015';
    ctx.fillText('เพื่อเปิดของรางวัลลับ', w / 2, h / 2 + 12);
  }, []);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const scratch = (pos) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();
    checkPercentScratched();
  };

  const checkPercentScratched = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Sample pixel data (sample every 8th pixel for smooth performance)
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let transparentCount = 0;
    const totalSampled = data.length / 32;

    for (let i = 3; i < data.length; i += 32) {
      if (data[i] === 0) transparentCount++;
    }

    const pct = Math.round((transparentCount / totalSampled) * 100);
    setPercentScratched(pct);

    if (pct > 40 && !isRevealed) {
      revealFullCard();
    }
  };

  const revealFullCard = () => {
    setIsRevealed(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    playSuccessFanfare();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-3 text-center select-none">
      <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
        <Gift className="w-6 h-6" />
      </div>
      <h3 className="font-theme-display text-xl font-bold mb-1">
        การ์ดขูดลุ้นรางวัลพิเศษ
      </h3>
      <p className="text-xs opacity-75 mb-4 max-w-xs mx-auto">
        ใช้นิ้วหรือเมาส์ปาดขูดแถบสีทองเพื่อเปิดเผยความลับที่ซ่อนอยู่
      </p>

      {/* Scratch Card Canvas Container */}
      <div className="relative w-72 h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-300/80 bg-gradient-to-tr from-amber-50 to-rose-50 flex items-center justify-center p-4">
        {/* Secret Content Underneath */}
        <div className="text-center px-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full">
            SECRET REWARD
          </span>
          <h4 className="font-theme-display text-lg font-bold mt-2 text-stone-800 leading-snug">
            {scratchSecret}
          </h4>
          <p className="text-[10px] text-stone-500 mt-1">
            (ใช้สิทธิ์นี้ได้ทันทีนะคนพิเศษ!)
          </p>
        </div>

        {/* Scratch Canvas Overlay */}
        <canvas
          ref={canvasRef}
          width={288}
          height={176}
          onMouseDown={(e) => {
            isDrawing.current = true;
            scratch(getPosition(e));
          }}
          onMouseMove={(e) => {
            if (isDrawing.current) scratch(getPosition(e));
          }}
          onMouseUp={() => {
            isDrawing.current = false;
          }}
          onMouseLeave={() => {
            isDrawing.current = false;
          }}
          onTouchStart={(e) => {
            isDrawing.current = true;
            scratch(getPosition(e));
          }}
          onTouchMove={(e) => {
            if (isDrawing.current) scratch(getPosition(e));
          }}
          onTouchEnd={() => {
            isDrawing.current = false;
          }}
          className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-500 ${
            isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {/* Scratched Progress or Auto-reveal */}
      <div className="mt-4 flex items-center gap-3">
        {!isRevealed ? (
          <button
            onClick={revealFullCard}
            className="text-[11px] text-stone-500 hover:text-stone-800 underline flex items-center gap-1 font-medium"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>กดเพื่อเปิดเฉลยทันที</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>ขูดเปิดรางวัลสำเร็จแล้ว!</span>
          </span>
        )}
      </div>

      {/* Button to Finale */}
      <div className="w-full max-w-xs mt-5">
        <button
          onClick={onNextStage}
          className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          <span>ไปด่านสุดท้าย: อัลบั้มความทรงจำ & แผ่นเสียง</span>
          <ChevronRight className="w-4 h-4 text-rose-300" />
        </button>
      </div>
    </div>
  );
}
