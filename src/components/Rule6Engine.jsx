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
  ChevronRight
} from "lucide-react";
import { SCENARIOS, MODE_ORDER, VERDICT_META } from "../data/scenarios";
import ConfidenceBar from "./ConfidenceBar";

const STATUS_META = {
  ok: { Icon: Check, color: "#5AAE83" },
  review: { Icon: AlertTriangle, color: "#DA9E4E" },
  fail: { Icon: X, color: "#D06A5A" },
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
    <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-4">
      <div className="relative overflow-hidden rounded min-h-[310px] flex items-center justify-center bg-[#0E1A26]">
        {scenario.id !== "ecommerce" ? (
          <div className="bg-[#ECE7D9] text-[#1C1A12] w-[92%] my-5 mx-auto p-4 rounded shadow-md border border-[#C9A15A]/20">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-6 h-6 bg-[#1C1A12]/15 rounded flex-none" />
              <div className="text-xs font-semibold tracking-wide text-[#1C1A12] font-sans">
                {scenario.product}
              </div>
            </div>
            <div className="h-1.5 bg-[#1C1A12]/15 rounded mb-2 w-[88%]" />
            <div className="h-1.5 bg-[#1C1A12]/15 rounded mb-2 w-[72%]" />
            <div className="h-1.5 bg-[#1C1A12]/15 rounded mb-2 w-[81%]" />
            <div className="h-1.5 bg-[#1C1A12]/15 rounded mb-2 w-[58%]" />

            {scenario.id === "qr" && (
              <div className="flex items-center gap-3 my-3 p-2.5 bg-[#1C1A12]/05 rounded border border-[#1C1A12]/10">
                <div className="flex flex-col gap-0.5 flex-none" aria-hidden="true">
                  {QR_PATTERN.map((row, r) => (
                    <div key={r} className="flex gap-0.5">
                      {row.map((cell, c) => (
                        <span
                          key={c}
                          className={`w-1.5 h-1.5 block ${cell ? "bg-[#1C1A12]" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[#1C1A12]/80 leading-snug font-sans">
                  <span className="font-semibold block text-[#1C1A12]">Statutory Electronics QR:</span>
                  Scan for manufacturer address, generic name &amp; physical dimensions
                </div>
              </div>
            )}

            <div className="flex items-end justify-between mt-3.5 pt-3 border-t border-dashed border-[#1C1A12]/25">
              <div className="font-mono font-semibold text-lg text-[#1C1A12] leading-tight">
                {scenario.id === "qr" ? "₹899" : "₹40"}
                <span className="block font-sans font-normal text-[9px] text-[#1C1A12]/60 uppercase tracking-wider">
                  MRP, incl. of all taxes
                </span>
              </div>
              <div className="font-mono font-semibold text-sm text-[#1C1A12]">
                {scenario.id === "qr" ? "1 N" : "200 g"}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[94%] my-4 bg-[#12202E] border border-[#26394B] rounded-lg overflow-hidden shadow-md">
            <div className="font-mono text-[10.5px] text-[#63768A] py-2 px-3 border-b border-[#26394B] bg-[#0B1520]/80 flex items-center justify-between">
              <span>quickcommerce.in/product/48213-juice</span>
              <span className="text-[9px] text-[#5AAE83] bg-[#5AAE83]/10 px-1.5 py-0.5 rounded">Live Listing</span>
            </div>
            <div className="flex gap-3.5 p-3.5">
              <div className="w-20 h-24 flex-none bg-[#0E1A26] rounded-md flex items-center justify-center border border-[#26394B]" aria-hidden="true">
                <div className="w-7 h-14 rounded-t-sm rounded-b-md bg-gradient-to-b from-[#DA9E4E] to-[#B97B33] shadow-inner" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-2 bg-[#26394B] rounded w-[75%] mb-2" />
                <div className="font-mono text-base font-semibold text-[#EDEAE1] my-1">
                  ₹120 <span className="font-sans font-normal text-xs text-[#63768A]">/ 500 ml</span>
                </div>
                <div className="flex gap-1.5 flex-wrap my-2">
                  <span className="text-[10px] font-mono text-[#99AAB8] border border-[#26394B] rounded-full px-2 py-0.5 bg-[#17293B]">
                    Origin: India
                  </span>
                  <span className="text-[10px] font-mono text-[#5AAE83] border border-[#5AAE83]/30 rounded-full px-2 py-0.5 bg-[#5AAE83]/10">
                    Rule 6(10A) Filter
                  </span>
                </div>
                <div className="inline-block bg-[#C9A15A] text-[#241B08] text-[11px] font-semibold px-3 py-1 rounded">
                  Add to Cart
                </div>
                <div className="text-[11px] text-[#63768A] mt-1.5">
                  Product disclosures ▾ (Fold closed)
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "scanning" && (
          <div
            className="absolute left-0 right-0 h-1/4 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(201, 161, 90, 0.35), transparent)",
              animation: "scanSweep 1.9s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-[#63768A]">
        <FileText size={14} className="text-[#63768A] flex-none" />
        <span>{scenario.context}</span>
      </div>
    </div>
  );
}

export default function Rule6Engine({ onGenerateNotice }) {
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
    timeoutRef.current = window.setTimeout(() => setPhase("done"), 1800);
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
    <div className="space-y-8">
      {/* Hero Intro */}
      <section className="pt-2 pb-6 border-b border-[#26394B]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#C9A15A]/10 border border-[#C9A15A]/30 text-[#C9A15A] text-xs font-mono mb-3">
            <ShieldCheck size={14} />
            <span>LM (Packaged Commodities) Rules, 2011 — Section 6 Enforcement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight text-[#EDEAE1] mb-3">
            Half a label just moved into a QR code. <br className="hidden sm:inline" />
            <span className="text-[#C9A15A]">Most checkers haven't caught up.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#99AAB8] leading-relaxed mb-4">
            Rule 6 reads a package the way Legal Metrology actually reads it: checking
            what the amended Rule 6 still requires on the pack, decoding what it now
            allows in a QR code, and checking digital marketplace displays against the
            Rule 6(10) &amp; Rule 6(10A) digital duty.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={phase === "scanning"}
              className="bg-[#C9A15A] hover:bg-[#E0BE7E] text-[#241B08] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded flex items-center gap-2 transition-all shadow"
            >
              <Play size={15} />
              <span>Run Rule 6 Compliance Scan</span>
            </button>
            <span className="text-xs font-mono text-[#63768A]">
              Scenario: <strong className="text-[#EDEAE1]">{scenario.tabTitle}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Scenario Selection Tabs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl text-[#EDEAE1] font-normal">
            Select Regulatory Scenario Branch
          </h2>
          <span className="text-xs font-mono text-[#63768A]">LMPC 2011 + 2022 Amendment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist">
          {MODE_ORDER.map((key) => {
            const s = SCENARIOS[key];
            const Icon = getScenarioIcon(s.iconName);
            const isSelected = mode === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setMode(key)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-[#17293B] border-[#C9A15A] shadow-md ring-1 ring-[#C9A15A]/40"
                    : "bg-[#121F2E] border-[#26394B] hover:border-[#63768A] text-[#EDEAE1]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={isSelected ? "text-[#C9A15A]" : "text-[#99AAB8]"} />
                  <span className="text-[11px] font-mono text-[#63768A]">{s.tag}</span>
                </div>
                <div className="text-sm font-semibold text-[#EDEAE1] mb-1">{s.tabTitle}</div>
                <div className="text-xs text-[#99AAB8] leading-relaxed line-clamp-2">{s.nuance}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Scan Demo Arena */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Evidence & Execution */}
        <div className="lg:col-span-5 space-y-3">
          <EvidencePanel scenario={scenario} phase={phase} />

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleRun}
              disabled={phase === "scanning"}
              className="flex-1 bg-[#C9A15A] hover:bg-[#E0BE7E] text-[#241B08] font-semibold text-xs sm:text-sm py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all shadow disabled:opacity-60"
            >
              {phase === "done" ? <RotateCcw size={15} /> : <Play size={15} />}
              {phase === "idle" && "Run compliance check"}
              {phase === "scanning" && "Reading statutory fields…"}
              {phase === "done" && "Re-run compliance check"}
            </button>

            {scenario.verdict === "fail" && phase === "done" && onGenerateNotice && (
              <button
                onClick={() => onGenerateNotice(scenario)}
                className="bg-[#D06A5A]/20 hover:bg-[#D06A5A]/30 text-[#D06A5A] border border-[#D06A5A]/40 text-xs font-semibold py-2.5 px-3 rounded flex items-center gap-1.5 transition-all"
                title="Generate Statutory Show-Cause Notice under Sec 39"
              >
                <FileText size={14} />
                <span>Issue Notice</span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-mono text-[#63768A] bg-[#0E1A26] p-2.5 rounded border border-[#26394B] leading-relaxed">
            <strong className="text-[#99AAB8]">Automated Verdict Logic:</strong> Missing mandatory field → FAIL · OCR confidence &lt;85% → NEEDS REVIEW · All present &amp; confident → PASS
          </div>
        </div>

        {/* Right Column: Rule Engine Output */}
        <div className="lg:col-span-7 bg-[#121F2E] border border-[#26394B] rounded-lg p-5 flex flex-col min-h-[380px]">
          {phase === "idle" && (
            <div className="m-auto text-center text-[#63768A] max-w-xs py-8">
              <Gauge size={36} className="mx-auto mb-3 opacity-60 text-[#C9A15A]" />
              <p className="text-sm text-[#99AAB8] font-sans">
                Press <strong className="text-[#EDEAE1]">"Run compliance check"</strong> to evaluate this {scenario.tag} against LMPC 2011 clauses.
              </p>
            </div>
          )}

          {phase === "scanning" && (
            <div className="my-auto space-y-3 py-6" key={`log-${mode}-${runId}`}>
              <div className="text-xs font-mono text-[#C9A15A] flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#C9A15A] animate-ping" />
                <span>Executing Two-Stage YOLOv8 + PaddleOCR Pipeline</span>
              </div>
              {scenario.logLines.map((line, i) => (
                <div
                  key={i}
                  className="font-mono text-xs text-[#99AAB8] flex items-center gap-2 animate-fadeIn"
                  style={{ animationDelay: `${i * 340}ms` }}
                >
                  <span className="text-[#C9A15A] font-bold">›</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-4" key={`done-${mode}-${runId}`}>
              {/* Detection banner */}
              <div className="text-xs text-[#99AAB8] border-l-2 border-[#C9A15A] pl-3 py-1 bg-[#17293B]/40 rounded-r">
                <span className="font-semibold text-[#EDEAE1]">AI Pipeline Classification: </span>
                {scenario.detection}
              </div>

              {/* Verdict row */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#26394B]">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded border"
                    style={{
                      color: verdict.color,
                      backgroundColor: verdict.bg,
                      borderColor: verdict.color,
                    }}
                  >
                    {verdict.word}
                  </span>
                  <span className="text-xs font-mono text-[#99AAB8] flex items-center gap-2">
                    <span>Composite OCR Score:</span>
                    <ConfidenceBar value={avgConfidence} color="#C9A15A" width={70} />
                    <strong className="text-[#EDEAE1]">{avgConfidence}%</strong>
                  </span>
                </div>

                <span className="text-[11px] font-mono text-[#63768A]">
                  Product: {scenario.product}
                </span>
              </div>

              {/* Fields Table */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {scenario.fields.map((f, i) => {
                  const st = STATUS_META[f.status];
                  return (
                    <div
                      key={f.label}
                      className="grid grid-cols-12 gap-2 items-start py-2 px-2.5 rounded bg-[#0E1A26]/50 border border-[#26394B]/60 text-xs"
                    >
                      <div className="col-span-1 pt-0.5">
                        <st.Icon size={14} style={{ color: st.color }} />
                      </div>
                      <div className="col-span-7">
                        <div className="font-medium text-[#EDEAE1] flex items-center gap-1.5 flex-wrap">
                          <span>{f.label}</span>
                          {f.source !== "pack" && (
                            <span className="font-mono text-[9.5px] text-[#C9A15A] bg-[#C9A15A]/10 border border-[#C9A15A]/30 rounded px-1.5 py-0.2">
                              {f.source === "qr" ? "via 2022 QR Proviso" : "on digital listing"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11.5px] text-[#99AAB8] mt-0.5 break-words">
                          {f.value}
                        </div>
                      </div>
                      <div className="col-span-4 text-right">
                        <div className="font-mono text-[10px] text-[#63768A] truncate">
                          {f.rule}
                        </div>
                        <div className="font-mono text-[10.5px] flex items-center justify-end gap-1.5 mt-0.5" style={{ color: st.color }}>
                          <ConfidenceBar value={f.confidence} color={st.color} width={40} />
                          <span>{f.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Callout comparing naive checker vs Rule 6 */}
              {scenario.callout && (
                <div className="p-3 bg-[#C9A15A]/10 border border-[#C9A15A]/30 rounded text-xs space-y-1.5">
                  <div className="text-[#63768A] line-through decoration-[#D06A5A]">
                    {scenario.callout.naive}
                  </div>
                  <div className="text-[#EDEAE1] leading-relaxed">
                    <strong className="text-[#C9A15A]">LabelLens Rule 6 Intelligence: </strong>
                    {scenario.callout.rule6}
                  </div>
                </div>
              )}

              {/* Legal verdict note */}
              <p className="text-xs text-[#99AAB8] bg-[#17293B]/30 p-2.5 rounded border border-[#26394B] leading-relaxed">
                {scenario.verdictNote}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
