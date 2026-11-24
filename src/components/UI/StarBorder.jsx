import React from 'react';

export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#f43f5e',
  speed = '4s',
  thickness = 2,
  children,
  enabled = true,
  ...props
}) {
  if (!enabled) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-2xl p-[1px] group ${className}`}
      {...props}
    >
      <div
        className="absolute inset-0 will-change-transform animate-star-rotate pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 340deg, ${color} 360deg)`,
          animationDuration: speed
        }}
      />
      <div className="relative z-10 w-full h-full rounded-[inherit] bg-inherit flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
}
