import React, { useMemo } from 'react';

export default function Aurora({
  theme = 'scrapbook',
  isDarkMode = false,
  intensity = 70,
  speed = 1,
  opacity = 75,
  className = ''
}) {
  const colors = useMemo(() => {
    if (isDarkMode) {
      return {
        c1: '#ff2a85',
        c2: '#a855f7',
        c3: '#06b6d4',
        c4: '#10b981',
        c5: '#fbbf24'
      };
    }
    return {
      c1: '#f43f5e',
      c2: '#c084fc',
      c3: '#38bdf8',
      c4: '#34d399',
      c5: '#fbbf24'
    };
  }, [isDarkMode]);

  const duration1 = `${Math.max(4, 12 / (speed || 1))}s`;
  const duration2 = `${Math.max(6, 16 / (speed || 1))}s`;
  const computedOpacity = Math.min(1, Math.max(0.2, (opacity || 75) / 100));
  const blurPx = Math.round(30 + (intensity || 70) * 0.4);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700 ${className}`}
      style={{ opacity: computedOpacity }}
      aria-hidden="true"
    >
      <div
        className="absolute -top-[25%] -left-[20%] w-[150vw] h-[80vh] rounded-[100%] will-change-transform animate-aurora-wave"
        style={{
          filter: `blur(${blurPx}px)`,
          animationDuration: duration1,
          background: isDarkMode
            ? `radial-gradient(ellipse at 25% 35%, ${colors.c1} 0%, transparent 60%),
               radial-gradient(ellipse at 70% 25%, ${colors.c2} 0%, transparent 65%),
               radial-gradient(ellipse at 45% 65%, ${colors.c3} 0%, transparent 60%),
               radial-gradient(ellipse at 15% 75%, ${colors.c4} 0%, transparent 55%),
               radial-gradient(ellipse at 85% 65%, ${colors.c5} 0%, transparent 60%)`
            : `radial-gradient(ellipse at 25% 35%, rgba(244, 63, 94, 0.45) 0%, transparent 60%),
               radial-gradient(ellipse at 70% 25%, rgba(192, 132, 252, 0.5) 0%, transparent 65%),
               radial-gradient(ellipse at 45% 65%, rgba(56, 189, 248, 0.45) 0%, transparent 60%),
               radial-gradient(ellipse at 15% 75%, rgba(52, 211, 153, 0.45) 0%, transparent 55%),
               radial-gradient(ellipse at 85% 65%, rgba(251, 191, 36, 0.45) 0%, transparent 60%)`,
          mixBlendMode: isDarkMode ? 'screen' : 'normal'
        }}
      />

      <div
        className="absolute top-[15%] -right-[20%] w-[140vw] h-[75vh] rounded-[100%] will-change-transform animate-aurora-wave"
        style={{
          filter: `blur(${blurPx + 10}px)`,
          animationDuration: duration2,
          animationDirection: 'reverse',
          background: isDarkMode
            ? `radial-gradient(ellipse at 60% 40%, ${colors.c2} 0%, transparent 65%),
               radial-gradient(ellipse at 30% 60%, ${colors.c3} 0%, transparent 60%),
               radial-gradient(ellipse at 80% 70%, ${colors.c1} 0%, transparent 55%)`
            : `radial-gradient(ellipse at 60% 40%, rgba(192, 132, 252, 0.4) 0%, transparent 65%),
               radial-gradient(ellipse at 30% 60%, rgba(56, 189, 248, 0.4) 0%, transparent 60%),
               radial-gradient(ellipse at 80% 70%, rgba(244, 63, 94, 0.35) 0%, transparent 55%)`,
          mixBlendMode: isDarkMode ? 'screen' : 'normal'
        }}
      />

      <div
        className="absolute bottom-[0%] left-[5%] w-[100vw] h-[55vh] rounded-[100%] will-change-transform animate-aurora-pulse"
        style={{
          filter: `blur(${blurPx + 15}px)`,
          animationDuration: `${Math.max(6, 18 / (speed || 1))}s`,
          background: isDarkMode
            ? `radial-gradient(circle at 40% 50%, ${colors.c4} 0%, transparent 70%),
               radial-gradient(circle at 70% 40%, ${colors.c2} 0%, transparent 70%)`
            : `radial-gradient(circle at 40% 50%, rgba(52, 211, 153, 0.35) 0%, transparent 70%),
               radial-gradient(circle at 70% 40%, rgba(192, 132, 252, 0.35) 0%, transparent 70%)`,
          mixBlendMode: isDarkMode ? 'screen' : 'normal'
        }}
      />
    </div>
  );
}
