import React from "react";
import LogoMark from "./LogoMark";
import { Shield, Sparkles, Sliders, FileText, MapPin, CheckCircle2 } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "rule6", label: "Rule 6 Engine", icon: Shield, badge: "3 Scenarios" },
    { id: "vision", label: "Vision & Coin Calibrator", icon: Sparkles, badge: "₹5 Coin" },
    { id: "rulesandbox", label: "LMPC Rule Sandbox", icon: Sliders, badge: "Weight Slabs" },
    { id: "notices", label: "Show-Cause Notice", icon: FileText, badge: "Sec 39" },
    { id: "heatmap", label: "Vigilance Heatmap", icon: MapPin, badge: "Live Feed" },
  ];

  return (
    <header className="border-b border-[#26394B] bg-[#0E1A26]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("rule6")}>
            <LogoMark size={28} />
            <div>
              <div className="flex items-center gap-1.5 font-serif text-lg tracking-tight leading-none text-[#EDEAE1]">
                <span>Label</span>
                <span className="text-[#C9A15A] font-semibold">Lens</span>
                <span className="text-[10px] font-mono uppercase bg-[#C9A15A]/15 text-[#C9A15A] px-1.5 py-0.5 rounded border border-[#C9A15A]/30 ml-1">
                  SIH 2026
                </span>
              </div>
              <div className="text-[11px] text-[#99AAB8] font-sans mt-0.5 hidden sm:block">
                Dept. of Consumer Affairs • Legal Metrology (Packaged Commodities)
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1.5 text-[11px] font-mono text-[#5AAE83] bg-[#5AAE83]/10 px-2 py-1 rounded border border-[#5AAE83]/30">
            <CheckCircle2 size={12} />
            <span>LMPC Engine Ready</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#C9A15A] text-[#241B08] font-semibold shadow-sm"
                    : "text-[#99AAB8] hover:text-[#EDEAE1] hover:bg-[#17293B]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#241B08]" : "text-[#C9A15A]"} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                    isActive
                      ? "bg-[#241B08]/20 text-[#241B08]"
                      : "bg-[#26394B] text-[#99AAB8]"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
