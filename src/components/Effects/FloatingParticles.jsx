import React, { useEffect, useState } from 'react';
import { THEME_PRESETS } from '../../types/themePresets';

export default function FloatingParticles({ theme = 'scrapbook' }) {
  const [particles, setParticles] = useState([]);
  const themeData = THEME_PRESETS[theme] || THEME_PRESETS.scrapbook;
  const symbols = themeData.particles || ['♥', '✨', '🌸'];

  useEffect(() => {
    // Generate gentle background floating particles periodically
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const left = Math.random() * 95; // 0 - 95%
      const duration = 5 + Math.random() * 5; // 5 - 10s
      const size = 12 + Math.random() * 16; // 12 - 28px

      setParticles((prev) => [
        ...prev.slice(-12), // keep at most 12 particles
        { id, symbol, left, duration, size }
      ]);
    }, 1800);

    return () => clearInterval(interval);
  }, [theme, symbols]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-item select-none opacity-60"
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
