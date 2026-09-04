import React from "react";
import { Home, BarChart3, Scan, FileText, UserCheck, ShieldCheck } from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab, onOpenScanner }) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    // Center is the prominent Scan Button
    { id: "reports", label: "Reports", icon: FileText },
    { id: "profile", label: "Profile", icon: UserCheck },
  ];

  return (
    <nav 
      className="bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-[#0B0E17]/95 backdrop-blur-xl border-t border-[#232D45] pb-safe shadow-2xl transition-all"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-lg mx-auto px-4 py-1.5 flex items-center justify-around relative">
        {/* Left 2 items */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "home" && (activeTab === "rule6" || activeTab === "vision"));
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[62px] active:scale-95 ${
                isActive
                  ? "text-[#A855F7]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "text-[#A855F7] stroke-[2.4]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                )}
              </div>
              <span className={`text-[10.5px] font-sans mt-1 ${isActive ? "font-semibold text-[#A855F7]" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Prominent Scan Action Button */}
        <div className="flex flex-col items-center -mt-6">
          <button
            onClick={onOpenScanner}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 p-0.5 shadow-purple-glow active:scale-90 transition-transform duration-150 flex items-center justify-center border-2 border-[#0B0E17] animate-pulseGlow"
            title="Scan Product"
            aria-label="Scan Product"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white">
              <Scan size={24} className="stroke-[2.5]" />
            </div>
          </button>
          <span className="text-[10px] font-sans font-bold text-[#C084FC] mt-0.5 tracking-tight">
            Scan
          </span>
        </div>

        {/* Right 2 items */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "profile" && activeTab === "rulesandbox");
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[62px] active:scale-95 ${
                isActive
                  ? "text-[#A855F7]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "text-[#A855F7] stroke-[2.4]" : "stroke-[1.8]"} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                )}
              </div>
              <span className={`text-[10.5px] font-sans mt-1 ${isActive ? "font-semibold text-[#A855F7]" : "font-normal"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
