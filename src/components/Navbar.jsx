import React from "react";
import LogoMark from "./LogoMark";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { Shield, Sparkles, Sliders, FileText, MapPin, CheckCircle2, Scan, UserCircle, Wifi, WifiOff } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenScanner, role, onSelectRole, onSwitchRole, onLogout, onOpenProfile }) {
  const isOnline = useNetworkStatus();
  const citizenTabs = [
    { id: "citizen", label: "Scan & Report", icon: Scan, badge: "Citizen" },
    { id: "heatmap", label: "Vigilance Map", icon: MapPin, badge: "Live Feed" },
  ];

  const officialTabs = [
    { id: "rule6", label: "Rule 6 Engine", icon: Shield, badge: "3 Scenarios" },
    { id: "vision", label: "Vision & Coin Calibrator", icon: Sparkles, badge: "₹5 Coin" },
    { id: "rulesandbox", label: "LMPC Rule Sandbox", icon: Sliders, badge: "Weight Slabs" },
    { id: "notices", label: "Show-Cause Notice", icon: FileText, badge: "Sec 39" },
    { id: "heatmap", label: "Vigilance Heatmap", icon: MapPin, badge: "Live Feed" },
  ];

  const tabs = role === "official" ? officialTabs : citizenTabs;

  return (
    <header className="border-b border-panel-line bg-panel/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            className="flex items-center gap-3.5 cursor-pointer select-none active:scale-95 transition-transform bg-panel-darker/50 hover:bg-panel-darker py-2 px-3.5 rounded-xl border border-panel-line hover:border-text-3/40 relative overflow-hidden group"
            onClick={() => setActiveTab("rule6")}
          >
            {/* Glowing orb behind logo */}
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-brass/30 blur-2xl rounded-full group-hover:bg-brass/50 transition-colors"></div>

            <LogoMark size={32} />
            <div className="relative z-10">
              <div className="flex items-center gap-1 font-sans text-2xl tracking-wide leading-none text-text-1 italic">
                <span className="font-light" style={{ fontFamily: "'Playfair Display', serif" }}>Label</span>
                <span className="bg-gradient-to-r from-brass to-citizen-primary bg-clip-text text-transparent font-bold">Lens</span>
                <span className="text-[10px] font-mono uppercase bg-brass/10 text-brass px-2 py-0.5 rounded-full border border-brass/20 ml-1 shadow-sm mt-1 not-italic">
                  SIH 26
                </span>
                {role === "official" && (
                  <span className="text-[10px] uppercase font-bold text-status-fail ml-2 px-2 py-0.5 border border-status-fail/40 bg-status-fail/15 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)] tracking-wider mt-1 not-italic">
                    Official
                  </span>
                )}
                <span className="px-3 py-1 rounded bg-brass/10 text-brass border border-brass/30 text-xs font-mono uppercase">
                  {role}
                </span>
                <span className={`ml-2 inline-flex items-center gap-1 px-3 py-1 rounded border text-xs font-mono uppercase ${isOnline
                  ? "bg-status-pass/10 text-status-pass border-status-pass/30"
                  : "bg-status-review/10 text-status-review border-status-review/30"
                  }`}>
                  {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                  {isOnline ? "Online" : "Offline"}
                </span>
                <button
                  onClick={onSwitchRole}
                  className="ml-2 px-3 py-1 rounded bg-panel-raised text-text-2 border border-panel-line text-xs font-semibold hover:border-brass hover:text-brass transition-colors"
                >
                  Switch Role
                </button>
                <button
                  onClick={onLogout}
                  className="ml-2 px-3 py-1 rounded bg-status-fail/10 text-status-fail border border-status-fail/30 text-xs font-semibold hover:bg-status-fail/20 transition-colors"
                >
                  Logout
                </button>
              </div>
              <div className="text-[11.5px] text-text-2 font-sans mt-2 hidden sm:block tracking-wide">
                Dept. of Consumer Affairs • Legal Metrology
              </div>
            </div>
          </div>

          {/* Mobile Right Action Bar: Scan Trigger & Ready Badge */}
          <div className="md:hidden flex items-center gap-2">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 bg-brass active:bg-brass-strong text-brass-ink px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm transition-all"
                title="Instant Scanner"
              >
                <Scan size={13} className="text-brass-ink" />
                <span className="text-[11px]">Scan</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-status-pass bg-status-pass/10 px-2 py-1 rounded border border-status-pass/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-pass animate-pulse" />
              <span>Ready</span>
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1.5 w-full md:w-auto">
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 scrollbar-thin flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${isActive
                    ? "bg-brass text-brass-ink font-semibold shadow-sm"
                    : "text-text-2 hover:text-text-1 hover:bg-panel-raised"
                    }`}
                >
                  <Icon size={14} className={isActive ? "text-brass-ink" : "text-brass"} />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded ${isActive
                      ? "bg-brass-ink/20 text-brass-ink"
                      : "bg-panel-line text-text-2"
                      }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex bg-panel-darker p-1.5 rounded-xl border border-panel-line ml-3 shadow-inner">
            <button
              onClick={() => onSelectRole("citizen")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${role === "citizen" ? "bg-citizen-primary text-white shadow-sm" : "text-text-2 hover:text-text-1 hover:bg-panel"}`}
            >
              Citizen
            </button>
            <button
              onClick={() => onSelectRole("official")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${role === "official" ? "bg-brass text-brass-ink shadow-sm" : "text-text-2 hover:text-text-1 hover:bg-panel"}`}
            >
              Official
            </button>
          </div>

          {role === "citizen" && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="ml-3 flex items-center justify-center p-2 rounded-xl bg-panel-raised border border-panel-line text-text-2 hover:text-brass hover:border-brass/30 transition-all shadow-sm"
              title="User Profile"
            >
              <UserCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
