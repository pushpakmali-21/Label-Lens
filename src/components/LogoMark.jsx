import React from "react";

export default function LogoMark({ size = 26, strokeWidth = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {/* Corner crosshairs */}
      <path d="M2 8V2H8" stroke="url(#purpleGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M24 8V2H18" stroke="url(#purpleGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M2 18V24H8" stroke="url(#purpleGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M24 18V24H18" stroke="url(#purpleGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Centered compliance tick */}
      <path d="M8 13.5L11.5 17L18.5 9.5" stroke="#10B981" strokeWidth={strokeWidth + 0.3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
