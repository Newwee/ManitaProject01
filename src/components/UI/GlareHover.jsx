import React, { useRef, useState } from 'react';

/**
 * React Bits - GlareHover Component
 * Adds dynamic 3D holographic tilt and reflective light sheen on hover.
 */
export default function GlareHover({
  children,
  className = '',
  maxTilt = 7,
  glareOpacity = 0.35,
  borderRadius = '24px'
}) {
  const containerRef = useRef(null);
  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    glareX: 50,
    glareY: 50,
    glareAlpha: 0,
    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
  });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width) * 2 - 1; // -1 to 1
    const normalizedY = (y / rect.height) * 2 - 1; // -1 to 1

    const tiltX = -normalizedY * maxTilt;
    const tiltY = normalizedX * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      glareAlpha: glareOpacity,
      transition: 'none'
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      glareX: 50,
      glareY: 50,
      glareAlpha: 0,
      transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease'
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${className}`}
      style={{
        transform: style.transform,
        transition: style.transition,
        transformStyle: 'preserve-3d',
        borderRadius
      }}
    >
      {children}

      {/* Holographic Glare Sheen Overlay */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300"
        style={{
          borderRadius,
          opacity: style.glareAlpha,
          background: `radial-gradient(circle at ${style.glareX}% ${style.glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 75%)`,
          mixBlendMode: 'overlay'
        }}
        aria-hidden="true"
      />
    </div>
  );
}
