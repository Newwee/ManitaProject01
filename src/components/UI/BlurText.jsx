import React, { useEffect, useState, useMemo } from 'react';

/**
 * React Bits - BlurText Component (Mobile 60fps & GPU-Optimized)
 * Staggered text reveal using GPU-accelerated transform & opacity,
 * with heavy CSS blur filter omitted on mobile devices to prevent GPU thrashing.
 */
export default function BlurText({
  text = '',
  delay = 35,
  animateBy = 'words', // 'words' | 'letters'
  className = '',
  onAnimationComplete
}) {
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  useEffect(() => {
    setInView(false);
    const timer = setTimeout(() => {
      setInView(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [text]);

  const items = useMemo(() => {
    return animateBy === 'letters' ? Array.from(text) : text.split(' ');
  }, [text, animateBy]);

  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      {items.map((segment, index) => {
        const itemDelay = index * delay;
        return (
          <span
            key={index}
            className="inline-block transition-all duration-500 ease-out will-change-[transform,opacity]"
            style={{
              opacity: inView ? 1 : 0,
              filter: isMobile ? 'none' : inView ? 'blur(0px)' : 'blur(6px)',
              transform: inView ? 'translateY(0px)' : 'translateY(10px)',
              transitionDelay: `${itemDelay}ms`,
              marginRight: animateBy === 'words' && index < items.length - 1 ? '0.25em' : '0'
            }}
            onTransitionEnd={
              index === items.length - 1 && onAnimationComplete
                ? onAnimationComplete
                : undefined
            }
          >
            {segment}
          </span>
        );
      })}
    </span>
  );
}
