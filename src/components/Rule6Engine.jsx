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
  Scan
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
    <div className="glass-panel border border-panel-line rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brass/10 blur-3xl rounded-full pointer-events-none transition-all group-hover:bg-brass/20"></div>
      <div className="relative overflow-hidden rounded-xl min-h-[290px] sm:min-h-[320px] flex items-center justify-center bg-panel-darker border border-panel-line">
        {scenario.id !== "ecommerce" ? (
          <div className="bg-paper text-paper-ink w-[94%] sm:w-[92%] my-4 sm:my-5 mx-auto p-4 rounded shadow-md border border-brass/20">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 bg-paper-ink/15 rounded flex items-center justify-center text-paper-ink font-bold text-xs">
                ✓
              </div>
              <div className="text-xs font-semibold tracking-wide text-paper-ink font-sans truncate">
                {scenario.product}
              </div>
            </div>
            <div className="h-1.5 bg-paper-ink/15 rounded mb-2 w-[88%]" />
            <div className="h-1.5 bg-paper-ink/15 rounded mb-2 w-[72%]" />
            <div className="h-1.5 bg-paper-ink/15 rounded mb-2 w-[81%]" />
            <div className="h-1.5 bg-paper-ink/15 rounded mb-2 w-[58%]" />

            {scenario.id === "qr" && (
              <div className="flex items-center gap-3 my-3 p-2.5 bg-paper-ink/05 rounded border border-paper-ink/10">
                <div className="flex flex-col gap-0.5 flex-none" aria-hidden="true">
                  {QR_PATTERN.map((row, r) => (
                    <div key={r} className="flex gap-0.5">
                      {row.map((cell, c) => (
                        <span
                          key={c}
                          className={`w-1.5 h-1.5 block ${cell ? "bg-paper-ink" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-paper-ink/80 leading-snug font-sans">
                  <span className="font-semibold block text-paper-ink">Statutory Electronics QR:</span>
                  Scan for manufacturer address, generic name &amp; physical dimensions
                </div>
              </div>
            )}

            <div className="flex items-end justify-between mt-3.5 pt-3 border-t border-dashed border-paper-ink/25">
              <div className="font-mono font-semibold text-base sm:text-lg text-paper-ink leading-tight">
                {scenario.id === "qr" ? "₹899" : "₹40"}
                <span className="block font-sans font-normal text-[9px] text-paper-ink/60 uppercase tracking-wider">
                  MRP, incl. of all taxes
                </span>
              </div>
              <div className="font-mono font-semibold text-xs sm:text-sm text-paper-ink">
                {scenario.id === "qr" ? "1 N" : "200 g"}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[94%] my-4 bg-[#12202E] border border-panel-line rounded-lg overflow-hidden shadow-md">
            <div className="font-mono text-[10.5px] text-text-3 py-2 px-3 border-b border-panel-line bg-ink/80 flex items-center justify-between">
              <span className="truncate max-w-[200px] sm:max-w-none">quickcommerce.in/product/48213-juice</span>
              <span className="text-[9px] text-status-pass bg-status-pass/10 px-1.5 py-0.5 rounded flex-none">Live Listing</span>
            </div>
            <div className="flex gap-3.5 p-3.5">
              <div className="w-18 sm:w-20 h-22 sm:h-24 flex-none bg-panel-darker rounded-md flex items-center justify-center border border-panel-line" aria-hidden="true">
                <div className="w-7 h-14 rounded-t-sm rounded-b-md bg-gradient-to-b from-status-review to-[#B97B33] shadow-inner" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-2 bg-panel-line rounded w-[75%] mb-2" />
                <div className="font-mono text-sm sm:text-base font-semibold text-text-1 my-1">
                  ₹120 <span className="font-sans font-normal text-xs text-text-3">/ 500 ml</span>
                </div>
                <div className="flex gap-1.5 flex-wrap my-2">
                  <span className="text-[10px] font-mono text-text-2 border border-panel-line rounded-full px-2 py-0.5 bg-panel-raised">
                    Origin: India
                  </span>
                  <span className="text-[10px] font-mono text-status-pass border border-status-pass/30 rounded-full px-2 py-0.5 bg-status-pass/10">
                    Rule 6(10A) Filter
                  </span>
                </div>
                <div className="inline-block bg-brass text-brass-ink text-[11px] font-semibold px-3 py-1 rounded">
                  Add to Cart
                </div>
                <div className="text-[11px] text-text-3 mt-1.5 truncate">
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
              animation: "scanSweep 1.8s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-brass">
        <FileText size={15} className="flex-none drop-shadow-sm" />
        <span className="truncate tracking-wide">{scenario.context}</span>
      </div>
    </div>
  );
}

export default function Rule6Engine({ mode = "qr", setMode, onGenerateNotice, onOpenScanner }) {
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
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Intro Section */}
      <section className="pt-2 pb-6 sm:pb-8 border-b border-panel-line/50 relative">
        <div className="absolute top-0 right-10 w-[300px] h-[300px] bg-brass/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none"></div>
        <div className="max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-brass/15 border border-brass/40 text-brass text-xs font-mono mb-4 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <ShieldCheck size={16} />
            <span className="tracking-widest uppercase">LMPC 2011 — Section 6 Enforcement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-text-1 mb-4 tracking-tight drop-shadow-xl">
            Half a label just moved into a QR code. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brass to-brass-strong bg-clip-text text-transparent">Most checkers haven't caught up.</span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-text-2 leading-relaxed mb-4 max-w-3xl">
            Rule 6 reads a package the way Legal Metrology actually reads it: checking
            what the amended Rule 6 still requires on the pack, decoding what it now
            allows in a QR code, and checking digital marketplace displays against the
            Rule 6(10) &amp; Rule 6(10A) digital duty.
          </p>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <button
              onClick={handleRun}
              disabled={phase === "scanning"}
              className="bg-brass hover:bg-brass-strong active:scale-95 text-brass-ink font-bold text-sm px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-[0_8px_32px_rgba(56,189,248,0.3)] hover:shadow-[0_12px_45px_rgba(56,189,248,0.5)] hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none disabled:shadow-none"
            >
              <Play size={16} className="fill-current" />
              <span className="tracking-wide">Execute Rule 6 Scan</span>
            </button>
            <span className="text-xs font-mono text-text-3">
              Active Scenario: <strong className="text-text-1">{scenario.tabTitle}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Scenario Selection Tabs (Responsive: Scrollable on mobile, Grid on desktop/tablet) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg sm:text-xl text-text-1 font-normal">
            Select Regulatory Scenario Branch
          </h2>
          <span className="text-xs font-mono text-text-3 hidden sm:inline">LMPC 2011 + 2022 Amendment</span>
        </div>

        <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto no-scrollbar snap-x-mandatory pb-1 sm:pb-0" role="tablist">
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
                className={`snap-start flex-none w-[260px] sm:w-auto text-left p-4 sm:p-5 rounded-xl border transition-all active:scale-[0.98] ${isSelected
                  ? "glass-panel-raised border-brass ring-1 ring-brass/50 shadow-[0_4px_30px_rgba(56,189,248,0.15)]"
                  : "glass-panel border-panel-line hover:border-brass/40 text-text-1 opacity-70 hover:opacity-100"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={isSelected ? "text-brass" : "text-text-2"} />
                  <span className="text-[11px] font-mono text-text-3">{s.tag}</span>
                </div>
                <div className="text-sm font-semibold text-text-1 mb-1">{s.tabTitle}</div>
                <div className="text-xs text-text-2 leading-relaxed line-clamp-2">{s.nuance}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Scan Demo Arena (Responsive 12-column grid on desktop, single-column on mobile) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Evidence & Execution */}
        <div className="lg:col-span-5 space-y-3">
          <EvidencePanel scenario={scenario} phase={phase} />

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleRun}
              disabled={phase === "scanning"}
              className="flex-1 bg-brass hover:bg-brass-strong active:scale-95 text-brass-ink font-semibold text-xs sm:text-sm py-2.5 px-4 rounded flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
            >
              {phase === "done" ? <RotateCcw size={15} /> : <Play size={15} />}
              {phase === "idle" && "Run compliance check"}
              {phase === "scanning" && "Reading statutory fields…"}
              {phase === "done" && "Re-run compliance check"}
            </button>

            {scenario.verdict === "fail" && phase === "done" && onGenerateNotice && (
              <button
                onClick={() => onGenerateNotice(scenario)}
                className="bg-status-fail/20 hover:bg-status-fail/30 text-status-fail border border-status-fail/40 text-xs font-semibold py-2.5 px-3.5 rounded flex items-center gap-1.5 transition-all shadow-sm"
                title="Generate Statutory Show-Cause Notice under Sec 39"
              >
                <FileText size={14} />
                <span>Issue Notice</span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-mono text-text-3 bg-panel-darker p-2.5 rounded border border-panel-line leading-relaxed">
            <strong className="text-text-2">Automated Verdict Logic:</strong> Missing mandatory field → FAIL · OCR confidence &lt;85% → NEEDS REVIEW · All present &amp; confident → PASS
          </div>
        </div>

        {/* Right Column: Rule Engine Output */}
        <div className="lg:col-span-7 glass-panel p-5 sm:p-6 flex flex-col min-h-[360px] relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brass/5 blur-[100px] pointer-events-none group-hover:bg-brass/10 transition-colors"></div>

          <div className="relative z-10 flex flex-col flex-1">
            {phase === "idle" && (
              <div className="m-auto text-center text-text-3 max-w-xs py-8">
                <Gauge size={36} className="mx-auto mb-3 opacity-60 text-brass" />
                <p className="text-sm text-text-2 font-sans">
                  Press <strong className="text-text-1">"Run compliance check"</strong> to evaluate this {scenario.tag} against LMPC 2011 clauses.
                </p>
              </div>
            )}

            {phase === "scanning" && (
              <div className="my-auto space-y-3 py-6" key={`log-${mode}-${runId}`}>
                <div className="text-xs font-mono text-brass flex items-center gap-2 mb-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-brass animate-ping" />
                  <span>Executing Two-Stage YOLOv8 + PaddleOCR Pipeline</span>
                </div>
                {scenario.logLines.map((line, i) => (
                  <div
                    key={i}
                    className="font-mono text-xs text-text-2 flex items-center gap-2 animate-fadeIn"
                    style={{ animationDelay: `${i * 300}ms` }}
                  >
                    <span className="text-brass font-bold">›</span>
                    <span className="truncate">{line}</span>
                  </div>
                ))}
              </div>
            )}

            {phase === "done" && (
              <div className="space-y-4 animate-fadeIn" key={`done-${mode}-${runId}`}>
                {/* Detection banner */}
                <div className="text-xs text-text-2 border-l-2 border-brass pl-3 py-1 bg-panel-raised/40 rounded-r">
                  <span className="font-semibold text-text-1">AI Pipeline Classification: </span>
                  {scenario.detection}
                </div>

                {/* Verdict row */}
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-panel-line">
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
                    <span className="text-xs font-mono text-text-2 flex items-center gap-2">
                      <span>Composite OCR Score:</span>
                      <ConfidenceBar value={avgConfidence} color="#C9A15A" width={60} />
                      <strong className="text-text-1">{avgConfidence}%</strong>
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-text-3">
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
                        className="grid grid-cols-12 gap-2 items-start py-2 px-2.5 rounded bg-panel-darker/60 border border-panel-line/60 text-xs"
                      >
                        <div className="col-span-1 pt-0.5">
                          <st.Icon size={14} style={{ color: st.color }} />
                        </div>
                        <div className="col-span-7">
                          <div className="font-medium text-text-1 flex items-center gap-1.5 flex-wrap">
                            <span>{f.label}</span>
                            {f.source !== "pack" && (
                              <span className="font-mono text-[9.5px] text-brass bg-brass/10 border border-brass/30 rounded px-1.5 py-0.2">
                                {f.source === "qr" ? "via 2022 QR Proviso" : "on digital listing"}
                              </span>
                            )}
                          </div>
                          <div className="text-[11.5px] text-text-2 mt-0.5 break-words">
                            {f.value}
                          </div>
                        </div>
                        <div className="col-span-4 text-right">
                          <div className="font-mono text-[10px] text-text-3 truncate">
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
                  <div className="p-3 bg-brass/10 border border-brass/30 rounded text-xs space-y-1.5">
                    <div className="text-text-3 line-through decoration-status-fail">
                      {scenario.callout.naive}
                    </div>
                    <div className="text-text-1 leading-relaxed">
                      <strong className="text-brass">LabelLens Rule 6 Intelligence: </strong>
                      {scenario.callout.rule6}
                    </div>
                  </div>
                )}

                {/* Legal verdict note */}
                <p className="text-xs text-text-2 bg-panel-raised/50 p-3 rounded-lg border border-panel-line leading-relaxed mt-2 shadow-inner">
                  {scenario.verdictNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
