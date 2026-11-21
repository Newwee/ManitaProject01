import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Gift, ChevronLeft, ChevronRight, X, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessFanfare, playTone } from '../../lib/soundEngine';

export default function ChristmasTreeExperience({
  title = 'Merry Christmas',
  subtitle = 'A SPECIAL WISH FOR YOU',
  wishMessage = 'ขอให้เทศกาลนี้เต็มไปด้วยความสุข ความอบอุ่น และรอยยิ้ม ขอให้ปีที่กำลังจะมาถึงใจดีกับเธอในทุกๆ วันนะ 🎄✨',
  photos = [],
  treeColor = 'emerald'
}) {
  const canvasRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hoverGift, setHoverGift] = useState(false);

  const displayPhotos = photos && photos.length > 0 && photos.some(p => p.url) ? photos : [
    { url: '/assets/placeholder_photo.svg', caption: 'ความทรงจำส่งท้ายปี 🎄' }
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

    // Particle groups
    let angle = 0;
    const treeParticles = [];
    const snowParticles = [];
    const giftBoxes = [];

    // Create 3D Tree spiral points
    const layers = 180;
    for (let i = 0; i < layers; i++) {
      const progress = i / layers;
      const y = (progress - 0.5) * 360;
      const radius = (1 - progress) * 125 + 8;
      const theta = progress * Math.PI * 16;
      treeParticles.push({
        origX: radius * Math.cos(theta),
        origY: y,
        origZ: radius * Math.sin(theta),
        size: 2.2 + Math.random() * 2.5,
        color: i % 4 === 0 ? '#FFD700' : i % 5 === 0 ? '#FF4D4D' : i % 6 === 0 ? '#FFFFFF' : '#34D399',
        twinkleSpeed: 0.05 + Math.random() * 0.08,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Snow
    for (let s = 0; s < 70; s++) {
      snowParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.6 + Math.random() * 1.4,
        size: 1.5 + Math.random() * 2.5,
        sway: Math.random() * 2
      });
    }

    // 3D Gift Boxes on ground
    giftBoxes.push(
      { x: -55, y: 155, z: 20, size: 28, color: '#C83E3B' },
      { x: 45, y: 160, z: -15, size: 24, color: '#D4AF37' },
      { x: 0, y: 170, z: 50, size: 32, color: '#2563EB' }
    );

    let isDragging = false;
    let startX = 0;
    let rotY = 0;
    let autoRotate = 0.008;

    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const deltaX = clientX - startX;
      rotY += deltaX * 0.01;
      startX = clientX;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background glow
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2 + 50, 10, width / 2, height / 2 + 50, width / 1.4);
      bgGrad.addColorStop(0, '#0E2A1F');
      bgGrad.addColorStop(0.6, '#05110C');
      bgGrad.addColorStop(1, '#020504');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Falling Snow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      snowParticles.forEach((sp) => {
        sp.y += sp.speed;
        sp.x += Math.sin(sp.y * 0.02) * 0.5;
        if (sp.y > height) sp.y = -5;
        if (sp.x > width) sp.x = 0;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      });

      rotY += autoRotate;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const fov = 340;
      const cx = width / 2;
      const cy = height / 2 - 20;

      // Project and sort tree particles
      const projected = treeParticles.map((p) => {
        const x1 = p.origX * cosY - p.origZ * sinY;
        const z1 = p.origX * sinY + p.origZ * cosY;
        const scale = fov / (fov + z1);
        return {
          px: cx + x1 * scale,
          py: cy + p.origY * scale,
          z: z1,
          size: p.size * scale,
          color: p.color,
          twinkle: 0.6 + 0.4 * Math.sin(angle * 3 + p.twinklePhase)
        };
      });

      projected.sort((a, b) => b.z - a.z);

      // Draw Tree Particles
      projected.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = pt.twinkle;
        ctx.fillStyle = pt.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = pt.color;
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Top Tree Star
      const starScale = fov / (fov);
      const starX = cx;
      const starY = cy - 180 * starScale;

      ctx.save();
      ctx.fillStyle = '#FFE600';
      ctx.shadowBlur = 24;
      ctx.shadowColor = '#FFEA79';
      ctx.beginPath();
      ctx.arc(starX, starY, 9 + Math.sin(angle * 4) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render 3D Gift Boxes on ground
      giftBoxes.forEach((gb) => {
        const gx1 = gb.x * cosY - gb.z * sinY;
        const gz1 = gb.x * sinY + gb.z * cosY;
        const gScale = fov / (fov + gz1);
        const gpx = cx + gx1 * gScale;
        const gpy = cy + gb.y * gScale;
        const gSize = gb.size * gScale;

        ctx.save();
        ctx.fillStyle = gb.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = gb.color;
        ctx.fillRect(gpx - gSize / 2, gpy - gSize / 2, gSize, gSize);

        // Ribbon
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(gpx - gSize / 6, gpy - gSize / 2, gSize / 3, gSize);
        ctx.fillRect(gpx - gSize / 2, gpy - gSize / 6, gSize, gSize / 3);
        ctx.restore();
      });

      angle += 0.03;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const handleOpenGiftModal = () => {
    setIsModalOpen(true);
    playSuccessFanfare();
    confetti({
      particleCount: 55,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col items-center justify-between overflow-hidden select-none">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleOpenGiftModal}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Top Title Overlay */}
      <div className="relative z-10 pt-4 px-4 text-center pointer-events-none">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-amber-200 tracking-wider drop-shadow-[0_2px_12px_rgba(255,215,100,0.8)]">
          {title}
        </h2>
        <p className="text-[10px] uppercase tracking-[4px] text-emerald-200/80 font-semibold mt-1">
          {subtitle}
        </p>
      </div>

      {/* Floating Prompt & Action Bar */}
      <div className="relative z-10 pb-4 px-4 w-full flex flex-col items-center gap-2">
        <button
          onClick={handleOpenGiftModal}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 text-white font-bold text-xs shadow-xl shadow-amber-900/40 hover:scale-105 active:scale-95 transition flex items-center gap-2 animate-bounce"
        >
          <Gift className="w-4 h-4 text-amber-200" />
          <span>แตะกล่องของขวัญใต้ต้นไม้เพื่อเปิดดู 🎁</span>
        </button>

        <span className="text-[10px] text-white/60 font-medium">
          (สามารถลากเมาส์ / สไลด์นิ้วเพื่อหมุนดูต้นคริสต์มาสแบบ 3 มิติ)
        </span>
      </div>

      {/* Gift Album & Wishes Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12241C] border-2 border-[#D4AF37] rounded-3xl max-w-sm w-full p-5 text-center text-white relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-300/40">
              <Gift className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-amber-200 mb-1">
              Holiday Wishes & Memory
            </h3>
            <p className="text-xs text-emerald-100/80 mb-4 px-2 leading-relaxed">
              {wishMessage}
            </p>

            {/* Photo Preview inside Modal */}
            <div className="relative bg-white text-stone-900 p-2.5 pb-4 rounded-xl shadow-xl max-w-[240px] mx-auto mb-3">
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
                {displayPhotos[photoIdx]?.caption || 'ความทรงจำของเรา 🎄'}
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
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
