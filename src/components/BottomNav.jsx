import React from "react";
import { Shield, Sparkles, Scan, FileText, Sliders, MapPin, History } from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab, onOpenScanner, userRole }) {
  const officialItems = [
    { id: "rule6", label: "Rule 6", icon: Shield },
    { id: "vision", label: "Vision", icon: Sparkles },
    // Center is the prominent Scan Button
    { id: "notices", label: "Notices", icon: FileText },
    { id: "heatmap", label: "Vigilance", icon: MapPin },
  ];

  const citizenItems = [
    { id: "history", label: "History", icon: History },
    { id: "empty2", hidden: true },
    // Center is the prominent Scan Button
    { id: "heatmap", label: "Vigilance", icon: MapPin },
    { id: "empty4", hidden: true },
  ];

  const navItems = userRole === "official" || userRole === "inspector" ? officialItems : citizenItems;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-panel-darker/95 backdrop-blur-xl border-t border-panel-line pb-safe shadow-2xl transition-all"
      aria-label="Mobile Navigation"
    >
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around relative">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          if (item.hidden) return <div key={item.id} className="min-w-[58px]" />;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-200 min-w-[58px] active:scale-95 ${isActive
                  ? "text-brass"
                  : "text-text-2 hover:text-text-1"
                }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? "text-brass stroke-[2.2]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brass" />
                )}
              </div>
              <span className={`text-[10px] font-sans mt-1 ${isActive ? "font-semibold text-brass" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Prominent Brass Scan Action Button */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={userRole === "citizen" ? () => setActiveTab("citizen") : onOpenScanner}
            className="w-13 h-13 rounded-full bg-brass hover:bg-brass-strong active:scale-90 transition-transform duration-150 flex items-center justify-center border-2 border-ink shadow-brass-glow animate-pulseGlow p-3 text-brass-ink"
            title="Scan Product"
            aria-label="Scan Product"
          >
            <Scan size={22} className="stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-mono font-bold text-brass mt-0.5 tracking-tight">
            Scan
          </span>
        </div>

        {/* Right 2 items */}
        {navItems.slice(2, 4).map((item) => {
          if (item.hidden) return <div key={item.id} className="min-w-[58px]" />;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all duration-200 min-w-[58px] active:scale-95 ${isActive
                  ? "text-brass"
                  : "text-text-2 hover:text-text-1"
                }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? "text-brass stroke-[2.2]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brass" />
                )}
              </div>
              <span className={`text-[10px] font-sans mt-1 ${isActive ? "font-semibold text-brass" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
