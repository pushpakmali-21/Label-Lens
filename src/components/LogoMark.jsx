import React from "react";

export default function LogoMark({ size = 26, color = "#C9A15A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M2 8V2H8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 8V2H18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 18V24H8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 18V24H18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 13.5L11.5 17L18.5 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
