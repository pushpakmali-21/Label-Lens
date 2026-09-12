import React from "react";
import LogoMark from "./LogoMark";
import { Shield, Sparkles, Sliders, FileText, MapPin, CheckCircle2, Scan, UserCircle, Globe } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenScanner, userRole, onRoleChange, onOpenProfile, language, setLanguage }) {
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

  const tabs = userRole === "official" ? officialTabs : citizenTabs;

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
                {userRole === "official" && (
                  <span className="text-[10px] uppercase font-bold text-status-fail ml-2 px-2 py-0.5 border border-status-fail/40 bg-status-fail/15 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)] tracking-wider mt-1 not-italic">
                    Official
                  </span>
                )}
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
        <div className="hidden md:flex items-center gap-3 w-full lg:w-auto ml-auto">
          <nav className="flex items-center p-1.5 bg-panel-darker/80 border border-panel-line rounded-2xl shadow-inner gap-1.5 overflow-x-auto scrollbar-none max-w-[60vw]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap group relative ${isActive
                    ? "bg-gradient-to-br from-brass to-brass-strong text-brass-ink shadow-lg shadow-brass/20 scale-100"
                    : "text-text-2 hover:text-text-1 hover:bg-panel scale-95 hover:scale-100"
                    }`}
                >
                  <Icon size={18} className={`${isActive ? "text-brass-ink" : "text-text-3 group-hover:text-brass"} transition-colors`} />
                  <span className="tracking-wide">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md shadow-sm transition-colors ${isActive
                        ? "bg-brass-ink/20 text-brass-ink font-bold"
                        : "bg-panel-line text-text-3 group-hover:text-text-2 group-hover:bg-panel-raised"
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-2">
            <div className="flex items-center bg-panel-raised border border-panel-line rounded-xl px-3 py-1.5 hover:border-brass/40 transition-colors shadow-sm">
              <Globe size={16} className="text-brass mr-2" />
              <select
                value={language || "English"}
                onChange={(e) => setLanguage && setLanguage(e.target.value)}
                className="bg-transparent text-text-1 text-xs font-semibold focus:outline-none cursor-pointer appearance-none outline-none"
                style={{ background: 'transparent' }}
              >
                <option className="bg-panel text-text-1" value="English">EN - English</option>
                <option className="bg-panel text-text-1" value="Hindi">HI - हिन्दी</option>
                <option className="bg-panel text-text-1" value="Marathi">MR - मराठी</option>
                <option className="bg-panel text-text-1" value="Gujarati">GU - ગુજરાતી</option>
                <option className="bg-panel text-text-1" value="Tamil">TA - தமிழ்</option>
                <option className="bg-panel text-text-1" value="Telugu">TE - తెలుగు</option>
                <option className="bg-panel text-text-1" value="Kannada">KN - ಕನ್ನಡ</option>
                <option className="bg-panel text-text-1" value="Malayalam">ML - മലയാളം</option>
                <option className="bg-panel text-text-1" value="Bengali">BN - বাংলা</option>
                <option className="bg-panel text-text-1" value="Punjabi">PA - ਪੰਜਾਬੀ</option>
                <option className="bg-panel text-text-1" value="Urdu">UR - اردو</option>
                <option className="bg-panel text-text-1" value="Odia">OR - ଓଡ଼ିଆ</option>
                <option className="bg-panel text-text-1" value="Assamese">AS - অসমୀয়া</option>
              </select>
            </div>

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="flex items-center justify-center p-2 rounded-xl bg-panel-raised border border-panel-line text-text-2 hover:text-brass hover:border-brass/30 transition-all shadow-sm"
                title="User Profile"
              >
                <UserCircle size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
