import React, { useState } from "react";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import LandingPage from "./components/LandingPage";
import LoginModal from "./components/LoginModal";
import UserProfileModal from "./components/UserProfileModal";
import RuleEngineSandbox from "./components/RuleEngineSandbox";
import NoticeGenerator from "./components/NoticeGenerator";
import HeatmapMonitor from "./components/HeatmapMonitor";
import MobileScannerModal from "./components/MobileScannerModal";
import CitizenScanner from "./components/CitizenScanner";
import Chatbot from "./components/Chatbot";
import Rule6Engine from "./components/Rule6Engine";
import { pushCitizenReport } from "./data/districtData";

export default function App() {
  const [userRole, setUserRole] = useState("official");
  const [activeTab, setActiveTab] = useState("home");
  const [language, setLanguage] = useState("English");
  const [selectedNoticeScenario, setSelectedNoticeScenario] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasFilledProfile, setHasFilledProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    gender: "",
    preferences: "",
    allergies: [],
    hasDiabetes: false,
  });
  const [rule6Mode, setRule6Mode] = useState("qr");

  const handleRoleChange = (role) => {
    const newRole = typeof role === "string" ? role : (userRole === "citizen" ? "official" : "citizen");
    setUserRole(newRole);
    setActiveTab(newRole === "citizen" ? "citizen" : "vision");
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    const role = user?.role || "official";
    setUserRole(role);
    setUserProfile((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      email: user?.email || prev.email,
    }));
    setActiveTab(role === "citizen" ? "citizen" : "vision");
  };

  const handleCitizenReport = (report) => {
    pushCitizenReport(report);
    setFeedRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole("official");
    setActiveTab("home");
  };

  React.useEffect(() => {
    const officialOnlyTabs = ["vision", "rulesandbox", "notices", "rule6"];
    if (userRole === "citizen" && officialOnlyTabs.includes(activeTab)) {
      setActiveTab("citizen");
    }
  }, [userRole, activeTab]);

  const handleGenerateNotice = (scenario) => {
    setSelectedNoticeScenario(scenario);
    setActiveTab("notices");
  };

  const handleSelectScenarioAndScan = (mode, frameB64 = null) => {
    if (mode) setRule6Mode(mode);
    if (frameB64) setCapturedFrame(frameB64);
    setActiveTab(userRole === "citizen" ? "citizen" : "vision");
  };

  if (!isLoggedIn) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#20252B] flex font-sans selection:bg-[#183D35]/20 selection:text-[#183D35] bg-grid-mesh relative">
      {/* Sidebar for Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        userRole={userRole}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
          userRole={userRole}
          onSwitchRole={handleRoleChange}
          onRoleChange={handleRoleChange}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          language={language}
          setLanguage={setLanguage}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28">
          {activeTab === "home" && (
            <HomePage
              onStartOfficial={() => {
                setUserRole("official");
                setActiveTab("vision");
              }}
              onStartCitizen={() => {
                setUserRole("citizen");
                setActiveTab("citizen");
              }}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenScanner={() => setIsScannerOpen(true)}
              userRole={userRole}
            />
          )}

          {activeTab === "vision" && (
            <Rule6Engine
              mode={rule6Mode}
              setMode={setRule6Mode}
              capturedFrame={capturedFrame}
              onGenerateNotice={handleGenerateNotice}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === "rule6" && (
            <Rule6Engine
              mode={rule6Mode}
              setMode={setRule6Mode}
              capturedFrame={capturedFrame}
              onGenerateNotice={handleGenerateNotice}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === "rulesandbox" && (
            <RuleEngineSandbox />
          )}

          {activeTab === "notices" && (
            <NoticeGenerator
              scenarioForNotice={selectedNoticeScenario}
              onBackToScan={() => setActiveTab("vision")}
            />
          )}

          {activeTab === "heatmap" && (
            <HeatmapMonitor refreshKey={feedRefreshKey} />
          )}

          {activeTab === "citizen" && (
            <CitizenScanner onReportSubmitted={handleCitizenReport} />
          )}
        </main>

        {/* Global Regulatory Footer */}
        <footer className="border-t border-[#D8D7D2] bg-[#F8F7F3] py-5 sm:py-6 text-xs text-[#59636E] mt-8 sm:mt-12 mb-20 md:mb-0 no-print font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="max-w-2xl text-center sm:text-left leading-relaxed">
              <p>
                Rule citations reference the <strong className="text-[#20252B]">Legal Metrology (Packaged Commodities) Rules, 2011</strong>, as amended by the Second Amendment Rules, 2022 (electronics QR proviso) and e-commerce digital disclosure amendments (Rule 6(10) &amp; Rule 6(10A)).
              </p>
              <p className="mt-1 text-[11px] font-mono text-[#59636E]">
                Department of Consumer Affairs (DoCA) • Ministry of Consumer Affairs, Food &amp; Public Distribution • SIH 2026 Problem Statement 26034
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1 text-[11px] font-mono text-center sm:text-right flex-none">
              <span className="text-[#183D35] font-semibold">LabelLens Compliance Verification System</span>
              <span className="text-[#59636E]">Tamper-Proof Chain-of-Custody (SHA-256)</span>
              <span className="text-[#166534]">● All Core Services Operational</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Fixed Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanner={() => setIsScannerOpen(true)}
          userRole={userRole}
        />
      </div>

      {/* Interactive Mobile Camera Scanner Modal */}
      <MobileScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectScenarioAndScan={handleSelectScenarioAndScan}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          if (hasFilledProfile) setIsProfileOpen(false);
        }}
        profile={userProfile}
        setProfile={setUserProfile}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        isMandatory={!hasFilledProfile}
        onSave={() => {
          setHasFilledProfile(true);
          setIsProfileOpen(false);
        }}
      />

      {/* Shopify-Style Floating Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Persistent Chatbot Widget */}
      <Chatbot />
    </div>
  );
}
