import React from "react";

export default function ConfidenceBar({ value, color = "#C9A15A", width = 60 }) {
  return (
    <span
      className="inline-block h-1.5 bg-[#26394B] rounded-full overflow-hidden align-middle"
      style={{ width: `${width}px` }}
      aria-hidden="true"
    >
      <span
        className="block h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </span>
  );
}
