import React from "react";

export default function ConfidenceBar({ value, color = "#8B5CF6", width = 60, height = 6 }) {
  return (
    <span
      className="inline-block bg-[#182032] rounded-full overflow-hidden align-middle border border-[#232D45]"
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-hidden="true"
    >
      <span
        className="block h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </span>
  );
}
