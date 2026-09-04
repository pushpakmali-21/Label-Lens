import React, { useState } from "react";
import { UserCheck, ShieldCheck, Key, MapPin, Database, Award, Sliders, ChevronRight, FileCheck, CheckCircle2, Lock } from "lucide-react";
import RuleEngineSandbox from "./RuleEngineSandbox";

export default function InspectorProfile({ onNavigateToSandbox }) {
  const [activeSection, setActiveSection] = useState("profile"); // 'profile' | 'sandbox'

  if (activeSection === "sandbox") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveSection("profile")}
          className="text-xs font-semibold text-[#A855F7] flex items-center gap-1 mb-2 bg-[#182032] border border-[#232D45] px-3 py-1.5 rounded-full w-fit active:scale-95 transition-all"
        >
          ← Back to Inspector Profile
        </button>
        <RuleEngineSandbox />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-[#182032] to-[#111625] border border-[#232D45] rounded-2xl p-5 relative overflow-hidden shadow-lg">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-500 p-0.5 shadow-purple-glow flex items-center justify-center text-white">
              <UserCheck size={32} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#111625] flex items-center justify-center">
              <CheckCircle2 size={10} className="text-black stroke-[3]" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#F8FAFC] truncate">
                LMO Rajesh Sharma
              </h1>
            </div>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Badge #INS-DL-4029
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-mono bg-purple-950/80 text-[#C084FC] border border-purple-800/40 px-2 py-0.5 rounded-md font-semibold">
                Class-I Inspector
              </span>
              <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded-md">
                NCT of Delhi
              </span>
            </div>
          </div>
        </div>

        {/* Quick Inspector Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[#232D45]">
          <div className="text-center p-2 rounded-xl bg-[#0B0E17]/60 border border-[#232D45]/60">
            <div className="text-[10px] font-mono text-[#64748B]">Audits</div>
            <div className="text-base font-bold font-mono text-[#F8FAFC]">1,420</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-[#0B0E17]/60 border border-[#232D45]/60">
            <div className="text-[10px] font-mono text-[#64748B]">Notices</div>
            <div className="text-base font-bold font-mono text-[#10B981]">412</div>
          </div>
          <div className="text-center p-2 rounded-xl bg-[#0B0E17]/60 border border-[#232D45]/60">
            <div className="text-[10px] font-mono text-[#64748B]">Accuracy</div>
            <div className="text-base font-bold font-mono text-[#A855F7]">99.4%</div>
          </div>
        </div>
      </div>

      {/* Enforcement & Rules Tool Launcher */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] px-1">
          LMPC Regulatory Tools
        </h2>

        {/* Interactive Sandbox Button */}
        <div
          onClick={() => setActiveSection("sandbox")}
          className="bg-[#111625] hover:bg-[#182032] border border-[#232D45] active:scale-[0.99] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-600/30 flex items-center justify-center text-[#C084FC]">
              <Sliders size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#A855F7] transition-colors">
                LMPC Rule Engine Sandbox
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                Dynamic weight slabs, Rule 11 prohibited words &amp; redressal validator
              </div>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#64748B] group-hover:text-[#A855F7] transition-colors" />
        </div>
      </div>

      {/* Security & Cryptographic Hardware */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
            <Lock size={15} className="text-[#A855F7]" />
            <span>Digital Custody &amp; PKI Credentials</span>
          </div>
          <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
            Active
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 bg-[#0B0E17] rounded-xl border border-[#232D45]">
            <span className="text-[#64748B]">Terminal ID:</span>
            <span className="text-[#F8FAFC]">LENS-INSP-DL-09948</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[#0B0E17] rounded-xl border border-[#232D45]">
            <span className="text-[#64748B]">SHA-256 Key Status:</span>
            <span className="text-[#10B981]">Sec 65B Certified</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[#0B0E17] rounded-xl border border-[#232D45]">
            <span className="text-[#64748B]">DoCA Central Sync:</span>
            <span className="text-[#A855F7]">Real-time (0 ms lag)</span>
          </div>
        </div>
      </div>

      {/* Official Government Disclaimer Footer */}
      <div className="p-4 rounded-2xl bg-[#111625]/60 border border-[#232D45] text-center space-y-1">
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          Department of Consumer Affairs (DoCA) • Ministry of Consumer Affairs, Food &amp; Public Distribution
        </p>
        <p className="text-[10px] font-mono text-[#64748B]">
          SIH 2026 Problem Statement 26034 • v2.4.0-mobile
        </p>
      </div>
    </div>
  );
}
