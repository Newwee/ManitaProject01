import React, { useMemo, useState, useEffect } from 'react';

/**
 * React Bits - SoftAurora Background Component (Mobile GPU-Optimized)
 * Adds dreamy, gently undulating ambient aurora gradients behind content.
 * Automatically reduces blur radius and disables continuous opacity pulsing on mobile
 * to ensure a solid 60fps frame rate.
 */
function SoftAurora({
  theme = 'scrapbook',
  isDarkMode = false,
  className = ''
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Color presets tailored for MANITA themes
  const auroraPalette = useMemo(() => {
    const map = {
      scrapbook: isDarkMode
        ? ['#4c1d24', '#2d1b2d', '#1e1b4b']
        : ['#fce7f3', '#ffe4e6', '#fef3c7'],
      y2k: isDarkMode
        ? ['#581c87', '#312e81', '#1e1b4b']
        : ['#fbcfe8', '#e0e7ff', '#f5d0fe'],
      cinema: isDarkMode
        ? ['#2e1065', '#1c1917', '#451a03']
        : ['#fed7aa', '#fef3c7', '#fbcfe8'],
      festive: isDarkMode
        ? ['#064e3b', '#1e293b', '#7f1d1d']
        : ['#d1fae5', '#fef3c7', '#fee2e2']
    };
    return map[theme] || map.scrapbook;
  }, [theme, isDarkMode]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-30 transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    >
      <div
        className={`absolute -top-[25%] -left-[15%] w-[60vw] h-[60vw] rounded-full will-change-transform ${
          isMobile ? 'blur-[35px]' : 'blur-[90px] animate-pulse'
        }`}
        style={{
          background: `radial-gradient(circle, ${auroraPalette[0]} 0%, transparent 70%)`,
          animationDuration: '8s'
        }}
      />
      <div
        className={`absolute -bottom-[20%] -right-[15%] w-[55vw] h-[55vw] rounded-full will-change-transform ${
          isMobile ? 'blur-[40px]' : 'blur-[100px] animate-pulse'
        }`}
        style={{
          background: `radial-gradient(circle, ${auroraPalette[1]} 0%, transparent 70%)`,
          animationDuration: '10s',
          animationDelay: '1.5s'
        }}
      />
      <div
        className={`absolute top-[40%] left-[30%] w-[45vw] h-[45vw] rounded-full will-change-transform ${
          isMobile ? 'blur-[40px]' : 'blur-[110px] animate-pulse'
        }`}
        style={{
          background: `radial-gradient(circle, ${auroraPalette[2]} 0%, transparent 70%)`,
          animationDuration: '12s',
          animationDelay: '3s'
        }}
      />
    </div>
  );
}

export default React.memo(SoftAurora);
