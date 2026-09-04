import React, { useState } from "react";
import TopAppBar from "./components/TopAppBar";
import BottomNav from "./components/BottomNav";
import HomeOverview from "./components/HomeOverview";
import VisionInspector from "./components/VisionInspector";
import RuleEngineSandbox from "./components/RuleEngineSandbox";
import NoticeGenerator from "./components/NoticeGenerator";
import HeatmapMonitor from "./components/HeatmapMonitor";
import InspectorProfile from "./components/InspectorProfile";
import MobileScannerModal from "./components/MobileScannerModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedNoticeScenario, setSelectedNoticeScenario] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleGenerateNotice = (scenario) => {
    setSelectedNoticeScenario(scenario);
    setActiveTab("reports");
  };

  const handleSelectScenarioAndScan = (mode) => {
    setActiveTab("home");
    // Handled by Rule6Engine
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-[#F8FAFC] flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Mobile Shell Wrapper (Centered on tablet/desktop for native mobile app feel) */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col min-h-screen bg-[#0B0E17] shadow-2xl relative border-x border-[#182032]/80">
        
        {/* Sticky Mobile Top App Bar */}
        <TopAppBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* Main Content Area (Single Column, Mobile Touch Friendly) */}
        <main className="flex-1 px-3.5 py-3.5 pb-28">
          {(activeTab === "home" || activeTab === "rule6") && (
            <HomeOverview
              onOpenScanner={() => setIsScannerOpen(true)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onGenerateNotice={handleGenerateNotice}
            />
          )}

          {activeTab === "vision" && (
            <VisionInspector onBack={() => setActiveTab("home")} />
          )}

          {activeTab === "dashboard" && (
            <HeatmapMonitor />
          )}

          {activeTab === "reports" && (
            <NoticeGenerator
              scenarioForNotice={selectedNoticeScenario}
              onBackToScan={() => setActiveTab("home")}
            />
          )}

          {activeTab === "profile" && (
            <InspectorProfile 
              onNavigateToSandbox={() => setActiveTab("rulesandbox")}
            />
          )}

          {activeTab === "rulesandbox" && (
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab("profile")}
                className="text-xs font-semibold text-[#A855F7] flex items-center gap-1 bg-[#182032] border border-[#232D45] px-3 py-1.5 rounded-full w-fit active:scale-95 transition-all"
              >
                ← Back to Profile
              </button>
              <RuleEngineSandbox />
            </div>
          )}
        </main>

        {/* Mobile Global Regulatory Footer */}
        <footer className="border-t border-[#182032] bg-[#0A0D15] py-4 px-4 text-[10.5px] text-[#64748B] mb-16 no-print">
          <div className="text-center space-y-1">
            <p>
              Rule citations reference the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong> &amp; 2022 QR Proviso.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 font-mono text-[10px]">
              <span className="text-[#A855F7]">LabelLens Mobile AI</span>
              <span>•</span>
              <span className="text-[#10B981]">● SHA-256 Custody Operational</span>
            </div>
          </div>
        </footer>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
        />
      </div>

      {/* Interactive Mobile Camera Scanner Modal */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectScenarioAndScan={handleSelectScenarioAndScan}
      />
    </div>
  );
}
