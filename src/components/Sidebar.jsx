import React from "react";
import { Sparkles, Scan, FileText, Sliders, MapPin, Home, FileClock, AlertTriangle } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, onOpenScanner, userRole }) {
  const officialItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "vision", label: "Enforcement Suite", icon: Sparkles },
    { id: "rulesandbox", label: "Rule Engine", icon: Sliders },
    { id: "notices", label: "Generate Notices", icon: FileText },
    { id: "heatmap", label: "Vigilance Map", icon: MapPin },
  ];

  const citizenItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "citizen", label: "Citizen Scanner", icon: Sparkles },
    { id: "heatmap", label: "Vigilance Map", icon: MapPin },
  ];

  const navItems = userRole === "official" ? officialItems : citizenItems;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#20252B] border-r border-[#2E3540] h-screen sticky top-0 shrink-0 text-[#F7F5F0]">
      {/* Prominent Action Button */}
      <div className="p-4 pt-6 border-b border-[#2E3540]">
        <button
          onClick={onOpenScanner}
          className="w-full flex items-center justify-center gap-2 bg-[#183D35] hover:bg-[#0f2a23] text-white font-semibold py-2.5 px-4 rounded-none border border-[#234F45] transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer"
        >
          <Scan size={16} />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-[10px] font-mono font-medium text-[#8C96A0] uppercase tracking-widest mb-3 px-3">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-xs font-sans ${isActive
                  ? "bg-[#183D35] text-white font-medium border-l-2 border-[#C9572C]"
                  : "text-[#B0B7C0] hover:bg-[#2E3540] hover:text-white"
                }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-[#8C96A0]"} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {userRole === "official" && (
          <>
            <div className="mt-8 mb-3 px-3 text-[10px] font-mono font-medium text-[#8C96A0] uppercase tracking-widest">Reports</div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-xs font-sans text-[#B0B7C0] hover:bg-[#2E3540] hover:text-white">
              <FileClock size={16} className="text-[#8C96A0]" />
              <span>Inspection History</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-xs font-sans text-[#B0B7C0] hover:bg-[#2E3540] hover:text-white">
              <AlertTriangle size={16} className="text-[#C9572C]" />
              <span>Pending Violations</span>
            </button>
          </>
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#2E3540] text-[10px] font-mono text-[#8C96A0]">
        <div className="font-semibold text-white mb-0.5">LabelLens Legal Metrology</div>
        <div>SHA-256 Sealed Audit Engine</div>
      </div>
    </aside>
  );
}
