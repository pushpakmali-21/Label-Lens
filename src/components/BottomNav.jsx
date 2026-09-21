import React from "react";
import { Sparkles, Scan, FileText, Sliders, MapPin, Home } from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab, onOpenScanner, userRole }) {
  const officialItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "vision", label: "Vision", icon: Sparkles },
    // Center is the prominent Scan Button
    { id: "rulesandbox", label: "Rules", icon: Sliders },
    { id: "heatmap", label: "Vigilance", icon: MapPin },
  ];

  const citizenItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "citizen", label: "Inspect", icon: Sparkles },
    // Center is the prominent Scan Button
    { id: "heatmap", label: "Vigilance", icon: MapPin },
    { id: "empty4", hidden: true },
  ];

  const navItems = userRole === "official" ? officialItems : citizenItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#F7F5F0]/95 backdrop-blur-md border-t border-[#D8D7D2] pb-safe shadow-lg transition-all"
      aria-label="Primary navigation"
    >
      <div className="max-w-3xl mx-auto px-4 py-1.5 flex items-center justify-around relative">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          if (item.hidden) return <div key={item.id} className="min-w-[58px]" />;
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 transition-all duration-200 min-w-[58px] active:scale-95 ${isActive
                ? "text-[#183D35]"
                : "text-[#59636E] hover:text-[#20252B]"
                }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? "text-[#183D35] stroke-[2.2]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#183D35]" />
                )}
              </div>
              <span className={`text-[10px] font-sans mt-1 ${isActive ? "font-semibold text-[#183D35]" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Prominent Deep Green Scan Action Button */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={onOpenScanner}
            className="w-13 h-13 rounded-full bg-[#183D35] hover:bg-[#0f2a23] active:scale-90 transition-transform duration-150 flex items-center justify-center border-2 border-[#20252B] shadow-md p-3 text-white"
            title="Scan Product"
            aria-label="Scan Product"
          >
            <Scan size={22} className="stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-mono font-bold text-[#183D35] mt-0.5 tracking-tight">
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
              className={`flex flex-col items-center justify-center py-1.5 px-3 transition-all duration-200 min-w-[58px] active:scale-95 ${isActive
                ? "text-[#183D35]"
                : "text-[#59636E] hover:text-[#20252B]"
                }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? "text-[#183D35] stroke-[2.2]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#183D35]" />
                )}
              </div>
              <span className={`text-[10px] font-sans mt-1 ${isActive ? "font-semibold text-[#183D35]" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
