import React, { useEffect, useState } from 'react';

/**
 * React Bits - AnimatedContent Component
 * Provides smooth staggered entrance for sections, cards, and modal components.
 */
export default function AnimatedContent({
  children,
  distance = 16,
  direction = 'vertical', // 'vertical' | 'horizontal'
  delay = 0,
  duration = 500,
  className = ''
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 20 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const transformInitial =
    direction === 'vertical'
      ? `translateY(${distance}px)`
      : `translateX(${distance}px)`;

  return (
    <div
      className={`will-change-[opacity,transform] ${className}`}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : transformInitial,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`
      }}
    >
      {children}
    </div>
  );
}
