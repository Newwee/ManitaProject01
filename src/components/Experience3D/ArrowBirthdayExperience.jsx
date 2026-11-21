import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Heart, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessFanfare, playTone } from '../../lib/soundEngine';

export default function ArrowBirthdayExperience({
  title = 'Happy Birthday',
  subtitle = 'WISHING YOU ENDLESS HAPPINESS ✨',
  wishMessage = 'สุขสันต์วันเกิดนะ! 🎂✨ ขอให้ปีนี้เป็นปีที่ใจดีกับเธอมากๆ เต็มไปด้วยรอยยิ้ม เสียงหัวเราะ และความสุขในทุกๆ วัน เติบโตอย่างสดใสที่สุดเลยนะ 💖',
  wishSign = '— จากคนที่หวังดีเสมอ ✨',
  photos = []
}) {
  const canvasRef = useRef(null);
  const [stage, setStage] = useState('aiming'); // 'aiming' | 'flying' | 'cake' | 'wishes'
  const [photoIdx, setPhotoIdx] = useState(0);

  const displayPhotos = photos && photos.length > 0 && photos.some(p => p.url) ? photos : [
    { url: '/assets/placeholder_photo.svg', caption: 'วันเกิดปีนี้ขอให้มีความสุขที่สุด! 🎂' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = canvas.parentElement.clientWidth || 380;
    let height = canvas.parentElement.clientHeight || 640;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let arrowX = 60;
    let arrowY = height - 120;
    let targetX = width / 2;
    let targetY = height / 2 - 30;
    let arrowSpeed = 0;
    let cakeRot = 0;
    let sparks = [];

    // Synthesize Happy Birthday melody notes
    const playHbdMelody = () => {
      const hbdNotes = [261.63, 261.63, 293.66, 261.63, 349.23, 329.63, 261.63, 261.63, 293.66, 261.63, 392.00, 349.23];
      hbdNotes.forEach((n, idx) => {
        setTimeout(() => {
          playTone(n, 0.45, 'triangle', 0.12);
        }, idx * 400);
      });
    };

    const shootArrow = () => {
      setStage('flying');
      arrowSpeed = 16;
      playTone(550, 0.2, 'sine', 0.15);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space radial background
      const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width);
      grad.addColorStop(0, '#220B38');
      grad.addColorStop(0.5, '#0F051D');
      grad.addColorStop(1, '#05020A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw background twinkling stars
      ctx.fillStyle = 'rgba(255, 235, 180, 0.6)';
      for (let i = 0; i < 30; i++) {
        const sx = (Math.sin(i * 99 + cakeRot) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + cakeRot) * 0.5 + 0.5) * height;
        ctx.fillRect(sx, sy, 1.8, 1.8);
      }

      if (stage === 'aiming') {
        // Draw Bow & Arrow ready to release
        ctx.save();
        ctx.strokeStyle = '#F6AD55';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#F6AD55';
        ctx.beginPath();
        ctx.arc(80, height - 100, 40, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();

        // Arrow line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, height - 100);
        ctx.lineTo(130, height - 150);
        ctx.stroke();
        ctx.restore();

        // Target at center
        ctx.save();
        ctx.strokeStyle = '#ED64A6';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ED64A6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(targetX, targetY, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (stage === 'flying') {
        arrowX += (targetX - arrowX) * 0.18;
        arrowY += (targetY - arrowY) * 0.18;

        // Draw arrow flying
        ctx.save();
        ctx.strokeStyle = '#FFF';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(arrowX - 25, arrowY + 15);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();
        ctx.restore();

        if (Math.hypot(targetX - arrowX, targetY - arrowY) < 12) {
          setStage('cake');
          playSuccessFanfare();
          playHbdMelody();
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });

          // Explode sparks
          for (let s = 0; s < 40; s++) {
            const spTheta = Math.random() * Math.PI * 2;
            const spSpd = 2 + Math.random() * 5;
            sparks.push({
              x: targetX,
              y: targetY,
              vx: Math.cos(spTheta) * spSpd,
              vy: Math.sin(spTheta) * spSpd,
              color: s % 3 === 0 ? '#FFD700' : s % 2 === 0 ? '#FF69B4' : '#00FFFF',
              life: 1
            });
          }

          // Advance to wishes overlay after cake rotation
          setTimeout(() => {
            setStage('wishes');
          }, 3600);
        }
      } else if (stage === 'cake' || stage === 'wishes') {
        cakeRot += 0.025;

        // Render 3D ASCII Rotating Birthday Cake
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#FF9ED2';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FF69B4';

        const cx = width / 2;
        const cy = height / 2 - 40;

        // Cake 3D layers
        const cakeLines = [
          '   (  )   (  )   (  )   ',
          '    ||     ||     ||    ',
          '  [~~~~~~~~~~~~~~~~~]   ',
          '  | * * * H B D * * |   ',
          ' [~~~~~~~~~~~~~~~~~~~]  ',
          ' |   HAPPY BIRTHDAY! |  ',
          ' [===================]  '
        ];

        cakeLines.forEach((line, idx) => {
          const sway = Math.sin(cakeRot + idx * 0.2) * 8;
          ctx.fillText(line, cx + sway, cy + idx * 18);
        });

        // Glowing Candle Flames
        ctx.fillStyle = '#FFE600';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFA500';
        ctx.fillText('🔥     🔥     🔥', cx, cy - 8);
        ctx.restore();
      }

      // Render sparks
      sparks.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.life -= 0.02;
        if (sp.life > 0) {
          ctx.save();
          ctx.globalAlpha = sp.life;
          ctx.fillStyle = sp.color;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      sparks = sparks.filter((sp) => sp.life > 0);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [stage]);

  const handleShoot = () => {
    if (stage === 'aiming') {
      setStage('flying');
    }
  };

  const handleReset = () => {
    setStage('aiming');
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Title */}
      <div className="relative z-10 pt-4 px-4 text-center pointer-events-none">
        <h2 className="font-theme-display text-3xl font-extrabold text-amber-200 tracking-wide drop-shadow-[0_2px_12px_rgba(255,215,100,0.8)]">
          {title}
        </h2>
        <p className="text-[10px] uppercase tracking-[3px] text-pink-300 font-bold mt-1">
          {subtitle}
        </p>
      </div>

      {/* Aiming Stage Trigger Button */}
      {stage === 'aiming' && (
        <div className="relative z-10 pb-6 px-4 w-full flex flex-col items-center gap-2">
          <button
            onClick={handleShoot}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-white font-extrabold text-sm shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2 animate-bounce"
          >
            <span>ยิงธนูอวยพรวันเกิด 🏹✨</span>
          </button>
          <span className="text-[11px] text-pink-200 font-medium">
            (แตะเพื่อยิงธนูระเบิดความสุขและเปิดเค้ก 3 มิติ)
          </span>
        </div>
      )}

      {/* Birthday Wishes Overlay Card */}
      {stage === 'wishes' && (
        <div className="relative z-20 m-4 my-auto bg-stone-950/85 backdrop-blur-md border-2 border-pink-400/80 rounded-3xl p-5 text-center text-white max-w-sm w-full shadow-2xl animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center text-2xl border border-pink-400/40">
            🎂
          </div>

          <h3 className="font-theme-display text-xl font-bold text-pink-200 mb-1">
            Happy Birthday! ✨
          </h3>
          <p className="text-xs text-stone-200 leading-relaxed px-1 my-3">
            {wishMessage}
          </p>
          <p className="text-xs font-semibold text-pink-300 text-right mb-4">
            {wishSign}
          </p>

          {/* Photo Gallery inside Wishes */}
          <div className="bg-white text-stone-900 p-2.5 pb-4 rounded-xl shadow-xl max-w-[240px] mx-auto mb-3">
            <div className="w-full aspect-square bg-stone-100 rounded-sm overflow-hidden mb-2">
              <img
                src={displayPhotos[photoIdx]?.url}
                alt="Memory"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/placeholder_photo.svg';
                }}
              />
            </div>
            <p className="text-[11px] font-bold text-stone-700 truncate px-1">
              {displayPhotos[photoIdx]?.caption || 'ความทรงจำวันเกิด 🎂'}
            </p>

            {displayPhotos.length > 1 && (
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200 text-[9px] text-stone-500">
                <button
                  onClick={() => setPhotoIdx((p) => (p > 0 ? p - 1 : displayPhotos.length - 1))}
                  className="px-2 py-0.5 rounded bg-stone-100 font-bold"
                >
                  ← ก่อนหน้า
                </button>
                <span>{photoIdx + 1} / {displayPhotos.length}</span>
                <button
                  onClick={() => setPhotoIdx((p) => (p < displayPhotos.length - 1 ? p + 1 : 0))}
                  className="px-2 py-0.5 rounded bg-stone-100 font-bold"
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ยิงธนูใหม่อีกครั้ง</span>
          </button>
        </div>
      )}
    </div>
  );
}
