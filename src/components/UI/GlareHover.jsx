import React, { useRef, useEffect } from 'react';

/**
 * React Bits - GlareHover Component (GPU-Accelerated & 60fps Mobile-Optimized)
 * Adds dynamic 3D tilt and reflective sheen without triggering React re-renders.
 */
export default function GlareHover({
  children,
  className = '',
  maxTilt = 7,
  glareOpacity = 0.35,
  borderRadius = '24px'
}) {
  const containerRef = useRef(null);
  const glareRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    // Skip on touch/mobile devices with no true hover capability
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none), (max-width: 768px)').matches) {
      return;
    }

    const container = containerRef.current;
    const glare = glareRef.current;
    if (!container || !glare) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafId.current = requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const normalizedX = (x / rect.width) * 2 - 1;
      const normalizedY = (y / rect.height) * 2 - 1;

      const tiltX = (-normalizedY * maxTilt).toFixed(2);
      const tiltY = (normalizedX * maxTilt).toFixed(2);

      container.style.transition = 'none';
      container.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      glare.style.opacity = glareOpacity;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 75%)`;
    });
  };

  const handleMouseLeave = () => {
    const container = containerRef.current;
    const glare = glareRef.current;
    if (!container || !glare) return;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    container.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    glare.style.transition = 'opacity 0.4s ease';
    glare.style.opacity = '0';
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        borderRadius
      }}
    >
      {children}

      {/* Holographic Glare Sheen Overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300"
        style={{
          borderRadius,
          opacity: 0,
          mixBlendMode: 'overlay'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
