import React from "react";
import { ShieldCheck, Scan, Sparkles, Sliders, FileText, MapPin, ArrowRight, CheckCircle2, AlertTriangle, Play, ChevronRight } from "lucide-react";
import Rule6Engine from "./Rule6Engine";

export default function HomeOverview({ 
  onOpenScanner, 
  onNavigateToTab, 
  onGenerateNotice 
}) {
  const quickFeatures = [
    {
      id: "vision",
      title: "Vision & Coin Calibrator",
      subtitle: "Convert pixels to mm with ₹5 coin",
      badge: "Stage 1 + 3",
      icon: Sparkles,
      color: "#C084FC",
      bg: "bg-purple-950/40",
      border: "border-purple-600/30",
    },
    {
      id: "rulesandbox",
      title: "LMPC Rule Sandbox",
      subtitle: "Rule 7 slabs & prohibited words",
      badge: "Stage 4 + 5",
      icon: Sliders,
      color: "#10B981",
      bg: "bg-emerald-950/40",
      border: "border-emerald-600/30",
    },
    {
      id: "dashboard",
      title: "District Vigilance Heatmap",
      subtitle: "Track 9,300+ live audits & hotspots",
      badge: "Live Feed",
      icon: MapPin,
      color: "#38BDF8",
      bg: "bg-sky-950/40",
      border: "border-sky-600/30",
    },
    {
      id: "reports",
      title: "Show-Cause Notice Generator",
      subtitle: "Section 39 notices with SHA-256 seal",
      badge: "Legal",
      icon: FileText,
      color: "#F59E0B",
      bg: "bg-amber-950/40",
      border: "border-amber-600/30",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Interactive Rule 6 Engine as the main active workflow on Home */}
      <Rule6Engine 
        onGenerateNotice={onGenerateNotice} 
        onNavigateToVision={() => onNavigateToTab("vision")}
      />

      {/* Horizontally Scrollable Quick Tool Launcher Cards */}
      <div className="pt-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Enforcement &amp; Audit Modules
          </h2>
          <span className="text-[10px] font-mono text-purple-400">Swipe →</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar snap-x-mandatory pb-1">
          {quickFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigateToTab(feat.id)}
                className={`snap-start flex-none w-[220px] p-3.5 rounded-2xl border ${feat.border} ${feat.bg} cursor-pointer active:scale-[0.98] transition-all shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center" style={{ color: feat.color }}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-md bg-black/30 text-[#94A3B8] border border-white/5">
                      {feat.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#F8FAFC]">
                    {feat.title}
                  </div>
                  <div className="text-[10.5px] text-[#94A3B8] mt-0.5 leading-tight">
                    {feat.subtitle}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-[10.5px] font-semibold" style={{ color: feat.color }}>
                  <span>Open Tool</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
