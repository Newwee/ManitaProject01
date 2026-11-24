import React, { useEffect, useState, useMemo } from 'react';
import { THEME_PRESETS } from '../../types/themePresets';

function FloatingParticles({ theme = 'scrapbook' }) {
  const [particles, setParticles] = useState([]);
  const themeData = THEME_PRESETS[theme] || THEME_PRESETS.scrapbook;
  const symbols = useMemo(() => themeData.particles || ['♥', '✨', '🌸'], [themeData]);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    const maxParticles = isMobile ? 5 : 12;
    const spawnInterval = isMobile ? 3200 : 1800;

    const interval = setInterval(() => {
      if (document.hidden) return;

      const id = Date.now() + Math.random();
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const left = Math.random() * 95;
      const duration = 5 + Math.random() * 5;
      const size = isMobile ? 12 + Math.random() * 8 : 12 + Math.random() * 16;

      setParticles((prev) => [
        ...prev.slice(-(maxParticles - 1)),
        { id, symbol, left, duration, size }
      ]);
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [symbols]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-item select-none opacity-60 will-change-transform"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

export default React.memo(FloatingParticles);
