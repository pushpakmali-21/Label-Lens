import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  Package,
  Smartphone,
  ShoppingBag,
  Gauge,
  Info,
  ShieldCheck,
  FileText,
  RotateCcw,
  Play,
  ExternalLink,
  ChevronRight,
  Scan,
  Sparkles,
  Layers,
  ChevronDown
} from "lucide-react";
import { SCENARIOS, MODE_ORDER, VERDICT_META } from "../data/scenarios";
import ConfidenceBar from "./ConfidenceBar";

const STATUS_META = {
  ok: { Icon: Check, color: "#10B981", bg: "rgba(16, 185, 129, 0.14)" },
  review: { Icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.16)" },
  fail: { Icon: X, color: "#EF4444", bg: "rgba(239, 68, 68, 0.16)" },
};

const QR_PATTERN = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [0, 0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 1],
];

function EvidencePanel({ scenario, phase }) {
  return (
    <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-3.5 shadow-md">
      <div className="relative overflow-hidden rounded-xl min-h-[260px] flex items-center justify-center bg-[#07090F] border border-[#232D45]/60">
        {scenario.id !== "ecommerce" ? (
          <div className="bg-[#F5F3EF] text-[#1C1A12] w-[94%] my-3 p-3.5 rounded-xl shadow-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1C1A12]/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-700/20 rounded flex items-center justify-center text-purple-800 font-bold text-[10px]">
                  ✓
                </div>
                <div className="text-xs font-bold tracking-tight text-[#1C1A12] font-sans truncate max-w-[170px]">
                  {scenario.product}
                </div>
              </div>
              <span className="text-[9px] font-mono font-semibold bg-[#1C1A12]/10 text-[#1C1A12] px-1.5 py-0.5 rounded">
                LMPC 2011
              </span>
            </div>

            <div className="space-y-1.5 my-2">
              <div className="h-1.5 bg-[#1C1A12]/15 rounded w-[88%]" />
              <div className="h-1.5 bg-[#1C1A12]/15 rounded w-[72%]" />
              <div className="h-1.5 bg-[#1C1A12]/15 rounded w-[80%]" />
            </div>

            {scenario.id === "qr" && (
              <div className="flex items-center gap-2.5 my-2.5 p-2 bg-[#1C1A12]/05 rounded-lg border border-[#1C1A12]/10">
                <div className="flex flex-col gap-0.5 flex-none" aria-hidden="true">
                  {QR_PATTERN.map((row, r) => (
                    <div key={r} className="flex gap-0.5">
                      {row.map((cell, c) => (
                        <span
                          key={c}
                          className={`w-1.5 h-1.5 block rounded-[0.5px] ${cell ? "bg-[#1C1A12]" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-[10.5px] text-[#1C1A12]/80 leading-snug font-sans">
                  <span className="font-bold block text-purple-900">Electronics QR Proviso:</span>
                  Discloses mfg address, generic name &amp; size
                </div>
              </div>
            )}

            <div className="flex items-end justify-between mt-2.5 pt-2 border-t border-dashed border-[#1C1A12]/20">
              <div className="font-mono font-bold text-base text-[#1C1A12] leading-tight">
                {scenario.id === "qr" ? "₹899" : "₹40"}
                <span className="block font-sans font-medium text-[8.5px] text-[#1C1A12]/60 uppercase tracking-wider">
                  MRP, incl. all taxes
                </span>
              </div>
              <div className="font-mono font-bold text-xs text-[#1C1A12] bg-[#1C1A12]/10 px-2 py-0.5 rounded">
                {scenario.id === "qr" ? "1 N" : "200 g"}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[94%] my-3 bg-[#111625] border border-[#232D45] rounded-xl overflow-hidden shadow-lg">
            <div className="font-mono text-[10px] text-[#94A3B8] py-1.5 px-3 border-b border-[#232D45] bg-[#0A0D15] flex items-center justify-between">
              <span className="truncate max-w-[180px]">quickcommerce.in/sku-48213</span>
              <span className="text-[9px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded font-semibold">Live App</span>
            </div>
            <div className="flex gap-3 p-3">
              <div className="w-16 h-20 flex-none bg-[#07090F] rounded-lg flex items-center justify-center border border-[#232D45]" aria-hidden="true">
                <div className="w-6 h-12 rounded-t-sm rounded-b-md bg-gradient-to-b from-amber-500 to-amber-700 shadow-inner" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans font-bold text-xs text-[#F8FAFC] truncate">
                  Cold-Pressed Orange Juice
                </div>
                <div className="font-mono text-sm font-bold text-[#F8FAFC] my-1">
                  ₹120 <span className="font-sans font-normal text-[10px] text-[#94A3B8]">/ 500 ml</span>
                </div>
                <div className="flex gap-1 flex-wrap my-1.5">
                  <span className="text-[9px] font-mono text-[#94A3B8] border border-[#232D45] rounded px-1.5 py-0.5 bg-[#182032]">
                    Origin: India
                  </span>
                  <span className="text-[9px] font-mono text-[#10B981] border border-[#10B981]/30 rounded px-1.5 py-0.5 bg-[#10B981]/10 font-semibold">
                    Rule 6(10A) Filter
                  </span>
                </div>
                <div className="text-[10px] text-[#EF4444] font-mono mt-1">
                  ⚠ Missing Mfd &amp; Redressal Data
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "scanning" && (
          <div
            className="absolute left-0 right-0 h-1/4 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.45), transparent)",
              animation: "scanSweep 1.6s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex items-center gap-2 mt-2.5 text-[11px] text-[#94A3B8]">
        <FileText size={13} className="text-[#A855F7] flex-none" />
        <span className="truncate">{scenario.context}</span>
      </div>
    </div>
  );
}

export default function Rule6Engine({ onGenerateNotice, onNavigateToVision }) {
  const [mode, setMode] = useState("qr");
  const [phase, setPhase] = useState("idle");
  const [runId, setRunId] = useState(0);
  const timeoutRef = useRef(null);

  const scenario = SCENARIOS[mode];

  useEffect(() => {
    setPhase("idle");
    window.clearTimeout(timeoutRef.current);
  }, [mode]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const handleRun = () => {
    if (phase === "scanning") return;
    setPhase("scanning");
    setRunId((id) => id + 1);
    timeoutRef.current = window.setTimeout(() => setPhase("done"), 1600);
  };

  const avgConfidence = useMemo(() => {
    const sum = scenario.fields.reduce((a, f) => a + f.confidence, 0);
    return Math.round(sum / scenario.fields.length);
  }, [scenario]);

  const verdict = VERDICT_META[scenario.verdict];

  const getScenarioIcon = (iconName) => {
    switch (iconName) {
      case "Package": return Package;
      case "Smartphone": return Smartphone;
      case "ShoppingBag": return ShoppingBag;
      default: return Package;
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Mobile Hero */}
      <div className="bg-gradient-to-br from-[#182032] to-[#111625] border border-[#232D45] rounded-2xl p-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-600/40 text-[#C084FC] text-[10.5px] font-mono font-semibold">
            <ShieldCheck size={12} className="text-[#A855F7]" />
            <span>Rule 6 Compliance Engine</span>
          </span>
          <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full border border-[#10B981]/30">
            2022 Proviso Ready
          </span>
        </div>

        <h1 className="text-lg font-bold text-[#F8FAFC] leading-snug font-sans">
          Statutory Label &amp; QR Proviso Verification
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
          Checks what amended Rule 6 still requires on physical packs, validates electronic QR disclosures, and audits digital e-commerce listings.
        </p>

        {/* Quick Launch Action Bar */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#232D45]">
          <button
            onClick={handleRun}
            disabled={phase === "scanning"}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-purple-glow disabled:opacity-50"
          >
            {phase === "done" ? <RotateCcw size={14} /> : <Play size={14} />}
            <span>{phase === "idle" ? "Run Compliance Scan" : phase === "scanning" ? "Scanning Fields..." : "Re-Scan Pack"}</span>
          </button>

          {onNavigateToVision && (
            <button
              onClick={onNavigateToVision}
              className="bg-[#111625] hover:bg-[#182032] border border-purple-500/30 text-[#C084FC] text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center gap-1 active:scale-95 transition-all"
              title="Open Optical ₹5 Coin Calibrator"
            >
              <Sparkles size={13} />
              <span>Coin Calibrator</span>
            </button>
          )}
        </div>
      </div>

      {/* Horizontally Scrollable Scenario Selector Cards */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Select Regulatory Scenario
          </h2>
          <span className="text-[10px] font-mono text-purple-400">Swipe cards →</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar snap-x-mandatory pb-1">
          {MODE_ORDER.map((key) => {
            const s = SCENARIOS[key];
            const Icon = getScenarioIcon(s.iconName);
            const isSelected = mode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`snap-start flex-none w-[220px] text-left p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-gradient-to-br from-[#1c1a35] to-[#121626] border-[#8B5CF6] shadow-purple-glow ring-1 ring-[#8B5CF6]/50"
                    : "bg-[#111625] border-[#232D45] text-[#94A3B8]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon size={15} className={isSelected ? "text-[#C084FC]" : "text-[#94A3B8]"} />
                    <span className="text-[10px] font-mono text-[#64748B]">{s.tag}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                  )}
                </div>
                <div className={`text-xs font-bold truncate ${isSelected ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                  {s.tabTitle}
                </div>
                <div className="text-[10.5px] text-[#94A3B8] mt-1 line-clamp-2 leading-tight">
                  {s.nuance}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Evidence Card */}
      <EvidencePanel scenario={scenario} phase={phase} />

      {/* Rule Engine Output & Field Results */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3.5 shadow-md">
        {phase === "idle" && (
          <div className="py-6 text-center text-[#94A3B8] space-y-2">
            <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-[#C084FC] mx-auto">
              <Gauge size={24} />
            </div>
            <p className="text-xs font-sans max-w-xs mx-auto text-[#94A3B8]">
              Tap <strong className="text-[#F8FAFC]">"Run Compliance Scan"</strong> to evaluate this {scenario.tag} against LMPC 2011 mandates.
            </p>
          </div>
        )}

        {phase === "scanning" && (
          <div className="py-4 space-y-2.5" key={`log-${mode}-${runId}`}>
            <div className="text-xs font-mono text-[#C084FC] flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />
              <span>Running Stage 1 YOLOv8 + Stage 2 PaddleOCR</span>
            </div>
            {scenario.logLines.map((line, i) => (
              <div
                key={i}
                className="font-mono text-[11px] text-[#94A3B8] flex items-center gap-2 animate-fadeIn"
                style={{ animationDelay: `${i * 300}ms` }}
              >
                <span className="text-[#8B5CF6] font-bold">›</span>
                <span className="truncate">{line}</span>
              </div>
            ))}
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-3 animate-fadeIn" key={`done-${mode}-${runId}`}>
            {/* AI Classification Tag */}
            <div className="text-[11.5px] text-[#94A3B8] border-l-2 border-purple-500 pl-2.5 py-1 bg-purple-950/20 rounded-r-lg">
              <span className="font-semibold text-[#F8FAFC]">Classification: </span>
              {scenario.detection}
            </div>

            {/* Verdict Header Row */}
            <div className="p-3 rounded-xl border flex items-center justify-between flex-wrap gap-2"
              style={{
                backgroundColor: verdict.bg,
                borderColor: verdict.border,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded-md"
                  style={{ color: verdict.color }}
                >
                  {verdict.word}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[#94A3B8] text-[10.5px]">OCR Score:</span>
                <ConfidenceBar value={avgConfidence} color="#8B5CF6" width={50} />
                <strong className="text-[#F8FAFC]">{avgConfidence}%</strong>
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
              {scenario.fields.map((f, i) => {
                const st = STATUS_META[f.status];
                return (
                  <div
                    key={f.label}
                    className="p-3 rounded-xl bg-[#0B0E17] border border-[#232D45] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-none" style={{ backgroundColor: st.bg }}>
                          <st.Icon size={12} style={{ color: st.color }} className="stroke-[2.5]" />
                        </div>
                        <span className="font-semibold text-[#F8FAFC]">{f.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                        <span className="text-[#64748B]">{f.confidence}%</span>
                        <ConfidenceBar value={f.confidence} color={st.color} width={30} height={4} />
                      </div>
                    </div>

                    <div className="text-[11.5px] text-[#94A3B8] pl-7 break-words">
                      {f.value}
                    </div>

                    <div className="flex items-center justify-between pl-7 pt-1 text-[10px] font-mono text-[#64748B]">
                      <span>{f.rule}</span>
                      {f.source !== "pack" && (
                        <span className="text-purple-400 bg-purple-950/70 border border-purple-800/40 px-1.5 py-0.2 rounded">
                          {f.source === "qr" ? "QR Proviso" : "Digital Listing"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Callout comparison */}
            {scenario.callout && (
              <div className="p-3 bg-purple-950/30 border border-purple-600/30 rounded-xl text-xs space-y-1">
                <div className="text-[#64748B] line-through text-[11px]">
                  {scenario.callout.naive}
                </div>
                <div className="text-[#F8FAFC] text-[11.5px] leading-relaxed">
                  <strong className="text-[#C084FC]">LabelLens Intelligence: </strong>
                  {scenario.callout.rule6}
                </div>
              </div>
            )}

            {/* Verdict Note */}
            <p className="text-[11px] text-[#94A3B8] bg-[#182032]/40 p-2.5 rounded-xl border border-[#232D45] leading-relaxed">
              {scenario.verdictNote}
            </p>

            {/* Direct Show-Cause Notice Button if Fail */}
            {scenario.verdict === "fail" && onGenerateNotice && (
              <button
                onClick={() => onGenerateNotice(scenario)}
                className="w-full bg-[#EF4444]/20 hover:bg-[#EF4444]/30 active:scale-[0.98] text-[#EF4444] border border-[#EF4444]/40 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <FileText size={15} />
                <span>Issue Show-Cause Notice (Sec 39)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
