import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Rule6Engine from "./components/Rule6Engine";
import VisionInspector from "./components/VisionInspector";
import RuleEngineSandbox from "./components/RuleEngineSandbox";
import NoticeGenerator from "./components/NoticeGenerator";
import HeatmapMonitor from "./components/HeatmapMonitor";

export default function App() {
  const [activeTab, setActiveTab] = useState("rule6");
  const [selectedNoticeScenario, setSelectedNoticeScenario] = useState(null);

  const handleGenerateNotice = (scenario) => {
    setSelectedNoticeScenario(scenario);
    setActiveTab("notices");
  };

  return (
    <div className="min-h-screen bg-[#0B1520] text-[#EDEAE1] flex flex-col font-sans selection:bg-[#C9A15A] selection:text-[#241B08]">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "rule6" && (
          <Rule6Engine onGenerateNotice={handleGenerateNotice} />
        )}

        {activeTab === "vision" && (
          <VisionInspector />
        )}

        {activeTab === "rulesandbox" && (
          <RuleEngineSandbox />
        )}

        {activeTab === "notices" && (
          <NoticeGenerator
            scenarioForNotice={selectedNoticeScenario}
            onBackToScan={() => setActiveTab("rule6")}
          />
        )}

        {activeTab === "heatmap" && (
          <HeatmapMonitor />
        )}
      </main>

      {/* Global Regulatory Footer */}
      <footer className="border-t border-[#26394B] bg-[#0E1A26] py-6 text-xs text-[#63768A] mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center sm:text-left leading-relaxed">
            <p>
              Rule citations reference the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong>, as amended by the Second Amendment Rules, 2022 (electronics QR proviso) and e-commerce digital disclosure amendments (Rule 6(10) &amp; Rule 6(10A)).
            </p>
            <p className="mt-1 text-[11px] font-mono text-[#99AAB8]">
              Department of Consumer Affairs (DoCA) • Ministry of Consumer Affairs, Food &amp; Public Distribution • SIH 2026 Problem Statement 26034
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-[11px] font-mono text-center sm:text-right">
            <span className="text-[#C9A15A] font-semibold">LabelLens Compliance Verification System</span>
            <span>Tamper-Proof Chain-of-Custody (SHA-256)</span>
            <span className="text-[#5AAE83]">● All Core Services Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
