import React, { useState } from "react";
import LogoMark from "./LogoMark";
import { ArrowRight, UserCircle, ShieldCheck } from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("official"); // "official" or "citizen"
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setError("");
    onLogin({ email: email.trim(), role, password: "password", rememberMe: true });
  };

  return (
    <div className="w-full min-h-screen flex bg-white font-sans text-black">

      {/* Left Area - Branding / Context */}
      <div className="hidden lg:flex w-1/2 bg-slate-50 border-r border-slate-200 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={32} color="#000" />
          <span className="font-bold text-2xl tracking-tight">LabelLens</span>
        </div>

        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
            Regulatory Compliance, <br /> Streamlined.
          </h2>
          <p className="mt-6 text-slate-600 max-w-md text-lg">
            Verify label declarations accurately under the Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <div className="text-sm font-medium text-slate-400">
          © 2026 Department of Consumer Affairs
        </div>
      </div>

      {/* Right Area - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden flex items-center gap-2 mb-12">
            <LogoMark size={28} color="#000" />
            <span className="font-bold text-xl tracking-tight">LabelLens</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight mb-2">Sign In</h1>
          <p className="text-slate-500 mb-10">Access your LabelLens account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Select Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("official")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border text-sm font-semibold transition-all ${role === "official"
                      ? "border-black bg-black text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                >
                  <ShieldCheck size={18} /> Official
                </button>
                <button
                  type="button"
                  onClick={() => setRole("citizen")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border text-sm font-semibold transition-all ${role === "citizen"
                      ? "border-black bg-black text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                >
                  <UserCircle size={18} /> Citizen
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={role === "official" ? "officer@gov.in" : "citizen@example.com"}
                className="w-full bg-white border border-slate-300 rounded-md py-3 px-4 text-sm text-black placeholder:text-slate-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-slate-800 text-white rounded-md py-3.5 text-sm font-semibold transition-colors mt-4"
            >
              Continue <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
