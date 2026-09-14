import React from 'react';

export interface UReactLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}

export function UReactLogo({
  size = 32,
  className = '',
  style = {},
  animated = true
}: UReactLogoProps) {
  const id = React.useId().replace(/:/g, '');
  const gradId = `ureact-fav-grad-${id}`;
  const glowId = `ureact-fav-glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ureact-logo ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
      aria-label="uReact Logo"
    >
      <defs>
        {/* Vibrant Cyan to Sky Reactive Gradient */}
        <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Ambient Glow */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Radiant Central Core */}
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        fill="rgba(56, 189, 248, 0.12)"
        filter={`url(#${glowId})`}
      />

      {/* Luminous Core Center Dot */}
      <circle
        cx="12"
        cy="12"
        r="1.6"
        fill="#38bdf8"
      />

      {/* 8 Radiant Rays */}
      <g
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'ureact-rays' : ''}
      >
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </g>
    </svg>
  );
}
