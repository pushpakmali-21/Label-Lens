import React from "react";
import LogoMark from "./LogoMark";
import { Shield, Sparkles, Sliders, FileText, MapPin, Scan, CheckCircle2 } from "lucide-react";

export default function TopAppBar({ activeTab, setActiveTab, onOpenScanner }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0E17]/95 backdrop-blur-md border-b border-[#232D45] px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer select-none active:opacity-80 transition-opacity" 
          onClick={() => setActiveTab("home")}
        >
          <div className="relative">
            <LogoMark size={28} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#0B0E17]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-sans font-bold text-base tracking-tight leading-none text-[#F8FAFC]">
              <span>Label</span>
              <span className="text-[#8B5CF6]">Lens</span>
              <span className="text-[9px] font-mono font-semibold uppercase bg-purple-950/80 text-[#C084FC] px-1.5 py-0.5 rounded border border-purple-800/40">
                LMPC 2026
              </span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-sans mt-0.5 font-medium truncate max-w-[190px] xs:max-w-[240px]">
              Dept. of Consumer Affairs • Legal Metrology
            </div>
          </div>
        </div>

        {/* Status Indicator & Quick Scan Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 active:scale-95 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-purple-glow transition-all"
            title="Open Instant Scanner"
          >
            <Scan size={13} className="text-white" />
            <span className="text-[11px]">Scan</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full border border-[#10B981]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="hidden xs:inline">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
