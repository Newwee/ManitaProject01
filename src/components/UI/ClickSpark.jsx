import React, { useEffect, useRef } from 'react';

/**
 * React Bits - ClickSpark Component
 * Renders magical, cute particle sparks on pointerdown/click interactions.
 */
export default function ClickSpark({
  sparkColor = '#f43f5e',
  sparkSize = 10,
  sparkRadius = 24,
  sparkCount = 9,
  duration = 450,
  extraColors = ['#fb7185', '#fbbf24', '#c084fc', '#38bdf8', '#ffffff']
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = now - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentDistance = spark.distance * easeOut;
        const currentX = spark.x + Math.cos(spark.angle) * currentDistance;
        const currentY = spark.y + Math.sin(spark.angle) * currentDistance + progress * 8; // gentle gravity
        const currentLength = spark.length * (1 - easeOut);
        const currentAlpha = 1 - easeOut;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = spark.size * (1 - progress * 0.6);
        ctx.lineCap = 'round';
        ctx.globalAlpha = currentAlpha;

        ctx.moveTo(currentX, currentY);
        ctx.lineTo(
          currentX + Math.cos(spark.angle) * currentLength,
          currentY + Math.sin(spark.angle) * currentLength
        );
        ctx.stroke();

        // Optional tiny star center sparkle
        if (progress < 0.4) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, spark.size * 0.8 * (1 - progress * 2.5), 0, Math.PI * 2);
          ctx.fillStyle = spark.color;
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      if (sparksRef.current.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    const handlePointerDown = (e) => {
      // Ignore right clicks
      if (e.button && e.button !== 0) return;

      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      const allColors = [sparkColor, ...extraColors];

      for (let i = 0; i < sparkCount; i++) {
        const angle = (i * 2 * Math.PI) / sparkCount + (Math.random() - 0.5) * 0.4;
        const distance = sparkRadius + Math.random() * 20;
        const color = allColors[Math.floor(Math.random() * allColors.length)];
        const length = 5 + Math.random() * 8;
        const size = 1.8 + Math.random() * 1.5;

        sparksRef.current.push({
          x,
          y,
          angle,
          distance,
          length,
          size,
          color,
          startTime: now
        });
      }

      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, extraColors]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}
