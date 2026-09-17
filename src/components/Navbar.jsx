import React, { useEffect, useRef, useState } from "react";
import LogoMark from "./LogoMark";
import useNetworkStatus from "../hooks/useNetworkStatus";
import { Shield, Sparkles, Sliders, FileText, MapPin, Scan, UserCircle, Wifi, WifiOff, ChevronDown } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenScanner, role, onLogout, onOpenProfile }) {
  const isOnline = useNetworkStatus();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
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

  const tabs = role === "inspector" || role === "official" ? officialTabs : citizenTabs;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    onLogout();
  };

  const handleOpenProfile = () => {
    setIsAccountMenuOpen(false);
    onOpenProfile();
  };

  return (
    <header className="border-b border-panel-line bg-panel/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto h-auto min-h-0 px-4 sm:px-6 py-2 md:py-2.5 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0 justify-between md:justify-start">
          <div
            className="flex min-w-0 items-center gap-3.5 cursor-pointer select-none active:scale-95 transition-transform bg-panel-darker/50 hover:bg-panel-darker py-2 px-3.5 rounded-xl border border-panel-line hover:border-text-3/40 relative overflow-hidden group"
            onClick={() => setActiveTab(role === "citizen" ? "citizen" : "rule6")}
          >
            {/* Glowing orb behind logo */}
            <div className="absolute -left-4 -top-4 w-12 h-12 bg-brass/30 blur-2xl rounded-full group-hover:bg-brass/50 transition-colors"></div>

            <LogoMark size={32} />
            <div className="relative z-10 min-w-0">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-1 font-sans text-2xl tracking-wide leading-none text-text-1 italic">
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
                <span className="px-2 sm:px-3 py-1 rounded bg-brass/10 text-brass border border-brass/30 text-xs font-mono uppercase">
                  {role}
                </span>
                <span className={`ml-1 sm:ml-2 inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded border text-xs font-mono uppercase ${isOnline
                  ? "bg-status-pass/10 text-status-pass border-status-pass/30"
                  : "bg-status-review/10 text-status-review border-status-review/30"
                  }`}>
                  {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <div className="text-[11.5px] text-text-2 font-sans mt-2 hidden sm:block tracking-wide">
                Dept. of Consumer Affairs • Legal Metrology
              </div>
            </div>
          </div>

          <div ref={accountMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-panel-line bg-panel-raised px-2 py-2 text-text-2 hover:border-brass/50 hover:text-brass transition-colors"
              aria-label="Account menu"
              aria-expanded={isAccountMenuOpen}
              title="Account menu"
            >
              <UserCircle size={18} />
              <span className="hidden lg:inline text-xs font-mono uppercase">{role}</span>
              <ChevronDown size={14} className={isAccountMenuOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-[60] w-44 rounded-lg border border-panel-line bg-panel-raised p-1.5 shadow-2xl">
                <div className="px-2.5 py-2 text-[10px] font-mono uppercase text-text-3 border-b border-panel-line">
                  Current role: <span className="text-brass">{role}</span>
                </div>
                {role === "citizen" && onOpenProfile && (
                  <button
                    type="button"
                    onClick={handleOpenProfile}
                    className="w-full text-left px-2.5 py-2 rounded text-xs text-text-2 hover:bg-panel hover:text-brass transition-colors"
                  >
                    Open Profile
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-2 rounded text-xs text-status-fail hover:bg-status-fail/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
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
        <div className="hidden md:flex items-center gap-1.5 w-full md:w-auto min-w-0">
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 scrollbar-thin flex-1 min-w-0">
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

        </div>
      </div>
    </header>
  );
}
