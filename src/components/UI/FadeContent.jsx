import React, { useState, useEffect } from 'react';

export default function FadeContent({
  children,
  blur = false,
  duration = 500,
  delay = 0,
  distance = 12,
  className = '',
  enabled = true
}) {
  const [visible, setVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, enabled]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`will-change-[opacity,transform] transition-all ease-out ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : `translateY(${distance}px)`,
        filter: blur ? (visible ? 'blur(0px)' : 'blur(4px)') : 'none'
      }}
    >
      {children}
    </div>
  );
}
