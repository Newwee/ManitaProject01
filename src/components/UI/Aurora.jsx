import React, { useMemo } from 'react';

export default function Aurora({
  theme = 'scrapbook',
  isDarkMode = false,
  intensity = 70,
  speed = 1,
  opacity = 60,
  className = ''
}) {
  const colors = useMemo(() => {
    if (isDarkMode) {
      return ['#881337', '#581c87', '#312e81', '#4c0519', '#1e1b4b'];
    }
    return ['#fecdd3', '#fed7aa', '#f5d0fe', '#fbcfe8', '#e0e7ff'];
  }, [isDarkMode]);

  const animationDuration = `${Math.max(4, 14 / (speed || 1))}s`;
  const computedOpacity = Math.min(1, Math.max(0.1, (opacity || 60) / 100));
  const blurAmount = `${Math.round(40 + (intensity || 70) * 0.4)}px`;

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700 ${className}`}
      style={{ opacity: computedOpacity }}
      aria-hidden="true"
    >
      <div
        className="absolute -top-[30%] -left-[20%] w-[140vw] h-[65vh] rounded-[100%] will-change-transform animate-aurora-wave mix-blend-screen dark:mix-blend-lighten"
        style={{
          filter: `blur(${blurAmount})`,
          animationDuration,
          background: `radial-gradient(ellipse at 30% 40%, ${colors[0]} 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 30%, ${colors[1]} 0%, transparent 65%),
                       radial-gradient(ellipse at 50% 60%, ${colors[2]} 0%, transparent 60%),
                       radial-gradient(ellipse at 20% 80%, ${colors[3]} 0%, transparent 55%),
                       radial-gradient(ellipse at 85% 70%, ${colors[4]} 0%, transparent 60%)`
        }}
      />
      <div
        className="absolute -top-[10%] left-[10%] w-[90vw] h-[45vh] rounded-[100%] will-change-transform animate-aurora-pulse"
        style={{
          filter: `blur(${blurAmount})`,
          animationDuration: `${Math.max(6, 18 / (speed || 1))}s`,
          background: `radial-gradient(circle at 45% 50%, ${colors[0]} 0%, transparent 70%),
                       radial-gradient(circle at 75% 40%, ${colors[2]} 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
