import React from "react";

export default function LogoMark({ size = 32, color = "currentColor", primaryColor = "#38BDF8", secondaryColor = "#10B981" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="group">
      <defs>
        <linearGradient id="lensGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} stopOpacity="0.9" />
          <stop offset="1" stopColor="#C084FC" stopOpacity="0.9" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <style>
          {`
            .scan-line { animation: sweep 2.5s ease-in-out infinite alternate; }
            @keyframes sweep { 0% { transform: translateY(-5px); } 100% { transform: translateY(22px); } }
            .lens-circle { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: center; }
            svg:hover .lens-circle { transform: scale(1.1) rotate(12deg); }
          `}
        </style>
      </defs>

      {/* Outer bounding box / Focus Area */}
      <path d="M6 16V10C6 7.79086 7.79086 6 10 6H16" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M32 6H38C40.2091 6 42 7.79086 42 10V16" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M42 32V38C42 40.2091 40.2091 42 38 42H32" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <path d="M16 42H10C7.79086 42 6 40.2091 6 38V32" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

      {/* Magnifying Lens */}
      <circle className="lens-circle" cx="22" cy="22" r="11" stroke="url(#lensGrad)" strokeWidth="3" filter="url(#glow)" />
      <path className="lens-circle" d="M30 30L37 37" stroke={primaryColor} strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />

      {/* Internal Scan Line */}
      <line className="scan-line" x1="13" y1="13" x2="31" y2="13" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />

      {/* Verification Tick */}
      <path d="M28 36L33 41L44 26" stroke={secondaryColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
    </svg>
  );
}
