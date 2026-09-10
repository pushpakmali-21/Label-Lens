import React, { useState } from "react";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Rule6Engine from "./components/Rule6Engine";
import VisionInspector from "./components/VisionInspector";
import RuleEngineSandbox from "./components/RuleEngineSandbox";
import NoticeGenerator from "./components/NoticeGenerator";
import HeatmapMonitor from "./components/HeatmapMonitor";
import MobileScannerModal from "./components/MobileScannerModal";
import CitizenScanner from "./components/CitizenScanner";
import RoleSelector from "./components/RoleSelector";
import Login from "./components/Login";
import { pushCitizenReport } from "./data/districtData";
import Chatbot from "./components/Chatbot";
import UserProfileModal from "./components/UserProfileModal";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(
    localStorage.getItem("role") || null
  );
  const [activeTab, setActiveTab] = useState("citizen");
  const [selectedNoticeScenario, setSelectedNoticeScenario] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    gender: "",
    preferences: "",
    allergies: [],
    hasDiabetes: false,
  });

  const handleRoleSelect = (selectedRole) => {
    localStorage.setItem("role", selectedRole);
    setRole(selectedRole);
  };

  const handleLogin = () => {
    localStorage.setItem("token", "mock-jwt-token");
    setToken("mock-jwt-token");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  const handleSwitchRole = () => {
    localStorage.removeItem("role");
    setRole(null);
  };

  const handleRoleChange = (selectedRole) => {
    const nextRole = typeof selectedRole === "string"
      ? selectedRole
      : role === "citizen" ? "official" : "citizen";
    handleRoleSelect(nextRole);
    setActiveTab(nextRole === "citizen" ? "citizen" : "rule6");
  };

  const handleCitizenReport = (report) => {
    pushCitizenReport(report);
    setFeedRefreshKey((prev) => prev + 1);
  };

  React.useEffect(() => {
    const officialOnlyTabs = ["rule6", "vision", "rulesandbox", "notices"];
    if (role === "citizen" && officialOnlyTabs.includes(activeTab)) {
      setActiveTab("citizen");
    }
  }, [role, activeTab]);

  const handleGenerateNotice = (scenario) => {
    setSelectedNoticeScenario(scenario);
    setActiveTab("notices");
  };

  const [rule6Mode, setRule6Mode] = useState("qr");

  const handleSelectScenarioAndScan = (mode) => {
    setRule6Mode(mode);
    setActiveTab("rule6");
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (!role) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  return (
    <div className="min-h-screen bg-ink text-text-1 flex flex-col font-sans selection:bg-brass selection:text-brass-ink bg-grid-mesh relative">
      {/* Navigation Header (Responsive: Full tabs on desktop/tablet, compact header on mobile) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        role={role}
        onSelectRole={handleRoleChange}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area (Responsive width: Full on mobile, max-w-7xl multi-column on desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {role === "citizen" && (
          <CitizenScanner onReportSubmitted={handleCitizenReport} />
        )}

        {(role === "inspector" || role === "official") && (
          <>
            <Rule6Engine
              mode={rule6Mode}
              setMode={setRule6Mode}
              onGenerateNotice={handleGenerateNotice}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
            <VisionInspector />
            <HeatmapMonitor refreshKey={feedRefreshKey} />
          </>
        )}

        {role === "admin" && (
          <div className="space-y-4">
            <div className="bg-panel p-6 rounded-lg border border-panel-line">
              <h2 className="text-xl text-text-1 font-serif">
                Admin Dashboard
              </h2>
              <p className="text-text-2 mt-2">
                System overview and analytics.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-panel p-4 rounded-lg border border-panel-line">
                Total Reports
              </div>

              <div className="bg-panel p-4 rounded-lg border border-panel-line">
                Active Violations
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Regulatory Footer */}
      <footer className="border-t border-panel-line bg-panel-darker py-5 sm:py-6 text-xs text-text-3 mt-8 sm:mt-12 mb-16 md:mb-0 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center sm:text-left leading-relaxed">
            <p>
              Rule citations reference the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong>, as amended by the Second Amendment Rules, 2022 (electronics QR proviso) and e-commerce digital disclosure amendments (Rule 6(10) &amp; Rule 6(10A)).
            </p>
            <p className="mt-1 text-[11px] font-mono text-text-2">
              Department of Consumer Affairs (DoCA) • Ministry of Consumer Affairs, Food &amp; Public Distribution • SIH 2026 Problem Statement 26034
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-[11px] font-mono text-center sm:text-right flex-none">
            <span className="text-brass font-semibold">LabelLens Compliance Verification System</span>
            <span>Tamper-Proof Chain-of-Custody (SHA-256)</span>
            <span className="text-status-pass">● All Core Services Operational</span>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation (Only visible on mobile screens < 768px) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        userRole={role}
      />

      {/* Interactive Mobile Camera Scanner Modal */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectScenarioAndScan={handleSelectScenarioAndScan}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        setProfile={setUserProfile}
      />

      {/* Persistent Chatbot Widget */}
      <Chatbot />
    </div>
  );
}
