import React from "react";

export default function LogoMark({ size = 32, color = "currentColor", primaryColor = "#FBBF24", secondaryColor = "#34D399" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="group">
      <defs>
        <linearGradient id="llBagGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={primaryColor} />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <style>
          {`
            .star-pulse { animation: starPulse 2.5s ease-in-out infinite; transform-origin: center; }
            @keyframes starPulse { 0% { transform: scale(0.8) rotate(0deg); opacity: 0.7; } 50% { transform: scale(1.2) rotate(45deg); opacity: 1; } 100% { transform: scale(0.8) rotate(0deg); opacity: 0.7; } }
            .ll-bounce { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-origin: center; }
            svg:hover .ll-bounce { transform: scale(1.05) translateY(-2px); }
          `}
        </style>
      </defs>

      <g className="ll-bounce">
        {/* The lens / bag shape (Unique curved continuous rounded polygon) */}
        <path d="M 12 4 
                 C 5.5 4 4 5.5 4 12
                 L 4 36 
                 C 4 42.5 5.5 44 12 44
                 L 36 44 
                 C 42.5 44 44 42.5 44 36
                 L 44 12
                 C 44 5.5 42.5 4 36 4
                 Z" fill="url(#llBagGrad)" filter="url(#glow)" />

        {/* The "LL" Initials in bold, negative space/white, stylized and italicized */}
        <g transform="translate(11, 9)">
          {/* First L */}
          <path d="M 7 6 L 3 23 Q 2.5 25 4 25 L 11 25" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Second L */}
          <path d="M 19 12 L 15 23 Q 14.5 25 16 25 L 23 25" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Dynamic decorative star/sparkle for AI touch */}
        <path className="star-pulse" d="M 34 10 C 34 14 38 14 38 18 C 38 14 42 14 42 10 C 38 14 38 6 34 10" fill="white" />
      </g>
    </svg>
  );
}
