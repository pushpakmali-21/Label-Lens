import React from "react";
import LogoMark from "./LogoMark";
import { UserCircle, Globe, Search } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  onOpenProfile,
  language,
  setLanguage,
  onOpenLogin,
  isLoggedIn,
  currentUser,
  onLogout,
  onSwitchRole,
}) {

  return (
    <header className="border-b border-[#D8D7D2] bg-[#F7F5F0]/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Home Link */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-98 transition-transform py-1 px-1"
            onClick={() => setActiveTab("home")}
            title="Return to Home"
          >
            <LogoMark size={26} />
            <div className="font-mono text-base font-bold text-[#20252B] tracking-wider select-none leading-none">
              LABEL<span className="text-[#183D35]">LENS</span>
            </div>
          </div>

          {activeTab !== "home" && (
            <button
              onClick={() => setActiveTab("home")}
              className="hidden sm:inline-flex items-center gap-1 font-mono text-xs text-[#59636E] hover:text-[#20252B] px-2.5 py-1 transition-colors"
            >
              <span>← Home</span>
            </button>
          )}

        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={15} className="text-[#59636E]" />
          </div>
          <input
            type="text"
            placeholder="Search products, manufacturers, or inspection IDs..."
            className="w-full bg-white border border-[#D8D7D2] text-[#20252B] text-xs font-sans rounded-none py-1.5 pl-9 pr-4 focus:outline-none focus:border-[#183D35] transition-all placeholder:text-[#8C96A0]"
          />
        </div>

        {/* Right Controls: Language Selector, Login Button & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center bg-white border border-[#D8D7D2] rounded-none px-2.5 py-1 hover:border-[#183D35] transition-colors">
            <Globe size={14} className="text-[#183D35] mr-1.5 shrink-0" />
            <select
              value={language || "English"}
              onChange={(e) => setLanguage && setLanguage(e.target.value)}
              className="bg-transparent text-[#20252B] text-xs font-sans focus:outline-none cursor-pointer appearance-none outline-none"
            >
              <option value="English">EN - English</option>
              <option value="Hindi">HI - हिन्दी</option>
              <option value="Marathi">MR - मराठी</option>
              <option value="Gujarati">GU - ગુજરાતી</option>
              <option value="Tamil">TA - தமிழ்</option>
              <option value="Telugu">TE - తెలుగు</option>
              <option value="Kannada">KN - ಕನ್ನಡ</option>
              <option value="Malayalam">ML - മലയാളം</option>
              <option value="Bengali">BN - বাংলা</option>
              <option value="Punjabi">PA - ਪੰਜਾਬੀ</option>
              <option value="Urdu">UR - اردو</option>
              <option value="Odia">OR - ଓଡ଼ିଆ</option>
              <option value="Assamese">AS - অসমীয়া</option>
            </select>
          </div>

          {/* Auth Button */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-mono text-[#59636E]">
                Officer: <strong className="text-[#20252B]">{currentUser?.name || "Official"}</strong>
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 bg-[#F0EEE9] hover:bg-[#D8D7D2] text-[#20252B] text-xs font-sans px-3 py-1.5 border border-[#D8D7D2] transition-all"
                title="Log out"
              >
                <span>Log out</span>
              </button>
            </div>
          ) : (
            onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-[#183D35] hover:bg-[#0f2a23] text-white text-xs font-sans px-3.5 py-1.5 transition-all"
                title="Log in to LabelLens"
              >
                <span>Log in</span>
              </button>
            )
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center justify-center p-1.5 bg-white border border-[#D8D7D2] text-[#59636E] hover:text-[#183D35] hover:border-[#183D35] transition-all"
              title="User Profile & Settings"
            >
              <UserCircle size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
