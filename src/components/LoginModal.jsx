import React, { useState } from "react";
import { X, KeyRound, ShieldCheck, User, Building2 } from "lucide-react";
import LogoMark from "./LogoMark";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("official");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email,
        role: selectedRole,
        name: email.split("@")[0] || "Officer",
      });
      onClose();
    }, 600);
  };

  const handleQuickLogin = (role) => {
    setSelectedRole(role);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email: role === "official" ? "officer@doca.gov.in" : "citizen@labellens.in",
        role,
        name: role === "official" ? "Legal Metrology Inspector" : "Verified Citizen",
      });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Floating Card Modal */}
      <div className="relative w-full max-w-[430px] bg-white rounded-3xl p-7 sm:p-8 shadow-2xl z-10 animate-slideUp border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close modal"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-center gap-3">
          <LogoMark size={32} />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans leading-tight">
              Log in
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Continue to <span className="font-semibold text-slate-800">LabelLens</span>
            </p>
          </div>
        </div>

        {/* Role Segmented Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedRole("official")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${selectedRole === "official"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Building2 size={14} className={selectedRole === "official" ? "text-blue-600" : ""} />
            <span>Enforcement Official</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("citizen")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${selectedRole === "citizen"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <User size={14} className={selectedRole === "citizen" ? "text-blue-600" : ""} />
            <span>Citizen / Consumer</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={selectedRole === "official" ? "officer@doca.gov.in" : "name@example.com"}
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-[#1A1A1A] hover:bg-black active:scale-[0.98] text-white font-medium py-3 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Continue with email</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Passkey Button */}
        <button
          type="button"
          onClick={() => handleQuickLogin(selectedRole)}
          className="w-full bg-slate-100/90 hover:bg-slate-200/80 active:scale-[0.98] text-slate-800 font-medium py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-200"
        >
          <KeyRound size={15} className="text-slate-600" />
          <span>Sign in with passkey</span>
        </button>

        {/* Social / SSO Auth Grid */}
        <div className="grid grid-cols-4 gap-2.5 mt-3">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleQuickLogin(selectedRole)}
            className="flex items-center justify-center py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs group"
            title="Continue with Google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => handleQuickLogin(selectedRole)}
            className="flex items-center justify-center py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs group"
            title="Continue with Apple"
          >
            <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.81 1.1-1.93.97-3.07-.98.04-2.13.67-2.8 1.48-.59.69-1.12 1.83-.98 2.94 1.09.09 2.16-.54 2.81-1.35z" />
            </svg>
          </button>

          {/* DigiLocker / National ID */}
          <button
            type="button"
            onClick={() => handleQuickLogin(selectedRole)}
            className="flex items-center justify-center py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs group"
            title="Continue with DigiLocker / Aadhaar"
          >
            <ShieldCheck size={17} className="text-blue-600" />
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => handleQuickLogin(selectedRole)}
            className="flex items-center justify-center py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs group"
            title="Continue with WhatsApp"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
              <path d="M12.004 0C5.373 0 0 5.373 0 12.004c0 2.122.553 4.116 1.517 5.856L0 24l6.326-1.48c1.677.915 3.593 1.484 5.678 1.484 6.631 0 12.004-5.373 12.004-12.004C24.008 5.373 18.635 0 12.004 0zm6.98 16.963c-.29.815-1.44 1.503-2.348 1.577-.622.05-1.433.09-4.14-1.026-3.46-1.428-5.706-4.945-5.88-5.176-.174-.23-1.408-1.874-1.408-3.574 0-1.788-.888-2.537 1.204-2.887.316-.35.688-.438.917-.438.229 0 .459.002.66.012.213.01.498-.081.78.597.29.698.988 2.41.074 2.585.086.175.143.379.029.608-.114.229-.172.373-.344.575-.172.201-.362.45-.516.604-.173.172-.354.36-.152.707.202.347.898 1.48 1.926 2.396 1.32 1.176 2.43 1.54 2.777 1.713.347.173.551.144.754-.087.203-.23.868-1.01 1.1-1.356.232-.346.464-.288.78-.173.316.115 2.008.948 2.353 1.12.346.173.576.26.66.403.086.144.086.835-.204 1.65z" />
            </svg>
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-600">
            New to LabelLens?{" "}
            <button
              type="button"
              onClick={() => handleQuickLogin("citizen")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Get started →
            </button>
          </p>

          <div>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
            >
              Need Help?
            </button>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-slate-400 text-center mt-5 leading-normal">
          By continuing, you agree to the{" "}
          <span className="text-slate-600 font-medium cursor-pointer hover:underline">Terms</span> and{" "}
          <span className="text-slate-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
