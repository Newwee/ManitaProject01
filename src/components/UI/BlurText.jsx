import React, { useEffect, useState } from 'react';

/**
 * React Bits - BlurText Component
 * Renders elegant, staggered letter-by-letter or word-by-word blur-to-focus text reveals.
 */
export default function BlurText({
  text = '',
  delay = 40,
  animateBy = 'words', // 'words' | 'letters'
  className = '',
  onAnimationComplete
}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setInView(false);
    const timer = setTimeout(() => {
      setInView(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [text]);

  const items = animateBy === 'letters' ? Array.from(text) : text.split(' ');

  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      {items.map((segment, index) => {
        const itemDelay = index * delay;
        return (
          <span
            key={index}
            className="inline-block transition-all duration-700 ease-out will-change-[transform,filter,opacity]"
            style={{
              opacity: inView ? 1 : 0,
              filter: inView ? 'blur(0px)' : 'blur(8px)',
              transform: inView ? 'translateY(0px)' : 'translateY(12px)',
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
