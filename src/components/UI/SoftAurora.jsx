import React, { useMemo, useState, useEffect } from 'react';

function SoftAurora({
  theme = 'scrapbook',
  isDarkMode = false,
  intensity = 60,
  speed = 1,
  opacity = 60,
  className = ''
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  const palette = useMemo(() => {
    if (isDarkMode) {
      return ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981'];
    }
    return ['#fda4af', '#c084fc', '#93c5fd', '#86efac'];
  }, [isDarkMode]);

  const computedOpacity = Math.min(1, Math.max(0.15, (opacity || 60) / 100));
  const blurBase = Math.round(isMobile ? 35 : 45 + (intensity || 60) * 0.4);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${className}`}
      style={{ opacity: computedOpacity }}
      aria-hidden="true"
    >
      <div
        className={`absolute -top-[20%] -left-[15%] w-[65vw] h-[65vw] rounded-full will-change-transform ${
          isMobile ? '' : 'animate-pulse'
        }`}
        style={{
          filter: `blur(${blurBase}px)`,
          background: isDarkMode
            ? `radial-gradient(circle, ${palette[0]} 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(253, 164, 175, 0.5) 0%, transparent 70%)`,
          animationDuration: `${Math.max(4, 9 / (speed || 1))}s`,
          mixBlendMode: isDarkMode ? 'screen' : 'normal'
        }}
      />
      <div
        className={`absolute -bottom-[15%] -right-[15%] w-[60vw] h-[60vw] rounded-full will-change-transform ${
          isMobile ? '' : 'animate-pulse'
        }`}
        style={{
          filter: `blur(${blurBase + 10}px)`,
          background: isDarkMode
            ? `radial-gradient(circle, ${palette[1]} 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(192, 132, 252, 0.45) 0%, transparent 70%)`,
          animationDuration: `${Math.max(5, 11 / (speed || 1))}s`,
          animationDelay: '1.5s',
          mixBlendMode: isDarkMode ? 'screen' : 'normal'
        }}
      />
      <div
        className={`absolute top-[35%] left-[25%] w-[50vw] h-[50vw] rounded-full will-change-transform ${
          isMobile ? '' : 'animate-pulse'
        }`}
        style={{
          filter: `blur(${blurBase + 15}px)`,
          background: isDarkMode
            ? `radial-gradient(circle, ${palette[2]} 0%, transparent 70%)`
            : `radial-gradient(circle, rgba(147, 197, 253, 0.45) 0%, transparent 70%)`,
          animationDuration: `${Math.max(6, 13 / (speed || 1))}s`,
          animationDelay: '3s',
          mixBlendMode: isDarkMode ? 'screen' : 'normal'
        }}
      />
    </div>
  );
}

export default React.memo(SoftAurora);
