import React from "react";

export default function LogoMark({
  size = 28,
  primaryColor = "#183D35",
  secondaryColor = "#C9572C",
  className = ""
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
    >
      {/* Outer Package Label Frame / Corners */}
      <path
        d="M4 10V6A2 2 0 016 4H10M22 4H26A2 2 0 0128 6V10M28 22V26A2 2 0 0126 28H22M10 28H6A2 2 0 014 26V22"
        stroke={primaryColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Optical Lens Aperture Ring */}
      <circle
        cx="16"
        cy="16"
        r="7.5"
        stroke={primaryColor}
        strokeWidth="1.5"
        fill={primaryColor}
        fillOpacity="0.08"
      />

      {/* Precision Alignment Crosshair Ticks */}
      <line x1="16" y1="5.5" x2="16" y2="8.5" stroke={primaryColor} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="16" y1="23.5" x2="16" y2="26.5" stroke={primaryColor} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="5.5" y1="16" x2="8.5" y2="16" stroke={primaryColor} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="23.5" y1="16" x2="26.5" y2="16" stroke={primaryColor} strokeWidth="1.25" strokeLinecap="round" />

      {/* Active Scan Laser Focal Dot */}
      <circle cx="16" cy="16" r="2.5" fill={secondaryColor} />
      <circle cx="16" cy="16" r="1" fill="#FFFFFF" />
    </svg>
  );
}
