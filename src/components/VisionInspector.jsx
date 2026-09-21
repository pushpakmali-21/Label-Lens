import React, { useState, useRef, useCallback } from "react";
import {
  Sparkles, Coins, Ruler, CheckCircle2, XCircle, AlertTriangle,
  Upload, Loader2, FileImage, ShieldCheck, ShieldAlert, ShieldQuestion,
  Info, ChevronDown, ChevronUp, RefreshCw, Zap,
} from "lucide-react";
import { resolveFontSlab, calculatePixelPerMm, convertPxToMm } from "../utils/lmpcValidator";

// ─── helpers ────────────────────────────────────────────────────────────────

const SAMPLE_PACKAGES = [
  {
    id: "namkeen", name: "Namkeen Pouch (200 g)", netQtyGrams: 200, fontPx: 22,
    coinPixelDiameter: 161,
    boxes: [
      { id: "pdp",   name: "Principal Display Panel (PDP)",   x: 8,  y: 10, w: 84, h: 80, color: "#3B82F6", status: "ok",   rule: "Rule 8" },
      { id: "brand", name: "Brand & Generic Declaration",      x: 14, y: 18, w: 72, h: 18, color: "#10B981", status: "ok",   rule: "Rule 6(1)(b)" },
      { id: "qty",   name: "Net Quantity Block",               x: 55, y: 64, w: 32, h: 18, color: "#10B981", status: "ok",   rule: "Rule 6(1)(c)" },
      { id: "mrp",   name: "MRP Block",                        x: 14, y: 64, w: 36, h: 18, color: "#8B5CF6", status: "ok",   rule: "Rule 6(1)(e)" },
      { id: "coin",  name: "₹5 Reference Coin (23mm)",         x: 74, y: 16, w: 18, h: 22, color: "#C9A15A", status: "ok",   rule: "Calibration" },
    ],
  },
  {
    id: "biscuit", name: "Digestive Biscuits (100 g)", netQtyGrams: 100, fontPx: 10,
    coinPixelDiameter: 155,
    boxes: [
      { id: "pdp",  name: "Principal Display Panel (PDP)",        x: 10, y: 12, w: 80, h: 76, color: "#3B82F6", status: "ok",   rule: "Rule 8" },
      { id: "qty",  name: "Net Quantity Block (Tiny Font)",        x: 60, y: 66, w: 26, h: 12, color: "#D06A5A", status: "fail", rule: "Rule 7 Font Violation" },
      { id: "mrp",  name: "MRP Block",                            x: 14, y: 64, w: 38, h: 16, color: "#8B5CF6", status: "ok",   rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Reference Coin (23mm)",             x: 72, y: 16, w: 18, h: 22, color: "#C9A15A", status: "ok",   rule: "Calibration" },
    ],
  },
  {
    id: "detergent", name: "Washing Powder (2 kg / 2000 g)", netQtyGrams: 2000, fontPx: 48,
    coinPixelDiameter: 172,
    boxes: [
      { id: "pdp",   name: "Principal Display Panel (PDP)",   x: 6,  y: 8,  w: 88, h: 84, color: "#3B82F6", status: "ok",   rule: "Rule 8" },
      { id: "brand", name: "Brand & Generic Declaration",      x: 12, y: 16, w: 76, h: 22, color: "#10B981", status: "ok",   rule: "Rule 6(1)(b)" },
      { id: "qty",   name: "Net Quantity Block (6.4mm)",       x: 50, y: 62, w: 38, h: 20, color: "#10B981", status: "ok",   rule: "Rule 7 (SLAB_D)" },
      { id: "mrp",   name: "MRP Block",                        x: 12, y: 62, w: 34, h: 20, color: "#8B5CF6", status: "ok",   rule: "Rule 6(1)(e)" },
      { id: "coin",  name: "₹5 Reference Coin (23mm)",         x: 74, y: 14, w: 18, h: 22, color: "#C9A15A", status: "ok",   rule: "Calibration" },
    ],
  },
];

const VERDICT_CONFIG = {
  pass:   { color: "#5AAE83", bg: "rgba(90,174,131,0.12)", border: "rgba(90,174,131,0.35)", label: "COMPLIANT",      Icon: ShieldCheck    },
  review: { color: "#DA9E4E", bg: "rgba(218,158,78,0.12)",  border: "rgba(218,158,78,0.35)",  label: "NEEDS REVIEW",   Icon: ShieldQuestion },
  fail:   { color: "#D06A5A", bg: "rgba(208,106,90,0.12)",  border: "rgba(208,106,90,0.35)",  label: "NON-COMPLIANT",  Icon: ShieldAlert    },
};

const FIELD_LABELS = {
  product_name:              "Product Name",
  net_quantity:              "Net Quantity",
  mrp:                       "MRP",
  manufacturer_name:         "Manufacturer Name",
  manufacturer_address:      "Manufacturer Address",
  country_of_origin:         "Country of Origin",
  month_year_of_manufacture: "Month / Year of Mfg.",
  best_before:               "Best Before / Expiry",
  customer_care_details:     "Consumer Care Details",
  fssai_license:             "FSSAI License No.",
  batch_lot_number:          "Batch / Lot Number",
};

// ─── GeminiScanPanel ────────────────────────────────────────────────────────

function GeminiScanPanel() {
  const [phase, setPhase] = useState("idle"); // idle | loading | done | error
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOcrText, setShowOcrText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setPhase("loading");
    setResult(null);
    setErrorMsg("");
    setShowOcrText(false);

    try {
      // Convert to base64 (strip data-URI prefix)
      const b64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          const dataUrl = r.result;
          resolve(dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl);
        };
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const res = await fetch("/api/v1/scan/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: b64 }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Backend error ${res.status}: ${detail}`);
      }

      const data = await res.json();
      setResult(data);
      setPhase("done");
    } catch (err) {
      console.error("Gemini scan failed:", err);
      setErrorMsg(err.message || "Scan failed. Make sure the backend is running.");
      setPhase("error");
    }
  }, []);

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleReset = () => {
    setPhase("idle");
    setPreview(null);
    setResult(null);
    setErrorMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const verdict = result ? VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.review : null;

  // Build a clean field list from extracted data embedded in result.fields
  const fieldRows = result?.fields ?? [];
  // Also pull raw extracted fields from result for the detail table
  const rawFields = result ? Object.entries(FIELD_LABELS).map(([key, label]) => {
    // Find matching field from backend fields array
    const match = fieldRows.find(f => f.label?.toLowerCase().includes(label.toLowerCase()) ||
      f.field?.toLowerCase().includes(key.toLowerCase()));
    return { key, label, value: match?.value ?? "—", status: match?.status ?? "review" };
  }) : [];

  return (
    <div className="border border-panel-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-panel border-b border-panel-line">
        <div className="w-8 h-8 rounded-lg bg-brass/15 border border-brass/30 flex items-center justify-center">
          <Zap size={16} className="text-brass" />
        </div>
        <div>
          <div className="text-sm font-semibold text-text-1">Live Gemini Compliance Scanner</div>
          <div className="text-xs text-text-3 font-mono">LMPC Rule 6 · Powered by Gemini 2.0 Flash Vision</div>
        </div>
        {phase !== "idle" && (
          <button
            onClick={handleReset}
            className="ml-auto flex items-center gap-1.5 text-xs text-text-2 hover:text-text-1 bg-panel-raised border border-panel-line px-2.5 py-1.5 rounded transition-all"
          >
            <RefreshCw size={12} /> New Scan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-panel-line">

        {/* ── Left: Upload zone ── */}
        <div className="lg:col-span-5 p-4 bg-panel-darker flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onClick={() => phase !== "loading" && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative min-h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
              ${isDragging ? "border-brass bg-brass/10 scale-[1.01]" : "border-panel-line hover:border-brass/50 hover:bg-panel-raised/30"}
              ${phase === "loading" ? "pointer-events-none" : ""}`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Label preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                {phase === "loading" && (
                  <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="text-brass animate-spin" />
                    <div className="text-sm text-brass font-mono animate-pulse">Gemini is reading the label…</div>
                    <div className="text-xs text-text-3 font-mono">Checking 14 LMPC Rule 6 fields</div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center select-none">
                <div className="w-14 h-14 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center">
                  <FileImage size={28} className="text-brass" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-1">Drop a label image here</div>
                  <div className="text-xs text-text-3 mt-1">or click to browse · JPG, PNG, WEBP</div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-text-3 bg-panel-raised border border-panel-line rounded-lg px-3 py-1.5">
                  <Upload size={11} className="text-brass" />
                  Upload product label / packaging photo
                </div>
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {/* Gemini fields legend */}
          <div className="text-[11px] font-mono text-text-3 bg-panel border border-panel-line rounded-lg p-3 space-y-1 leading-relaxed">
            <div className="text-text-2 font-semibold mb-1.5">Fields Gemini checks:</div>
            {["Product name · Net quantity · MRP", "Mfg. name & address · Country of origin", "Mfg. date · Best before · Batch no.", "Consumer care · FSSAI license", "Ingredients · Nutritional info"].map(t => (
              <div key={t} className="flex items-center gap-1.5"><span className="text-brass">›</span> {t}</div>
            ))}
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-7 p-5 bg-panel flex flex-col min-h-[360px]">
          {phase === "idle" && (
            <div className="m-auto text-center text-text-3 max-w-xs py-8">
              <Upload size={36} className="mx-auto mb-3 opacity-40 text-brass" />
              <p className="text-sm text-text-2">Upload a product label to run a live LMPC compliance check with Gemini Vision.</p>
              <p className="text-xs text-text-3 mt-2 font-mono">No mock data — real AI extraction.</p>
            </div>
          )}

          {phase === "loading" && (
            <div className="m-auto text-center py-8 space-y-3">
              <Loader2 size={36} className="text-brass animate-spin mx-auto" />
              <div className="text-sm font-mono text-brass animate-pulse">Gemini Vision is reading the label…</div>
              <div className="space-y-1 text-xs font-mono text-text-3">
                {["Sending image to Gemini 2.0 Flash…", "Extracting 14 mandatory LMPC fields…", "Running LMPC Rule 6 validator…", "Generating evidence seal (SHA-256)…"].map((l, i) => (
                  <div key={i} className="flex items-center justify-center gap-2 animate-fadeIn" style={{ animationDelay: `${i * 400}ms` }}>
                    <span className="text-brass">›</span> {l}
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="m-auto max-w-md text-center py-8">
              <AlertTriangle size={36} className="mx-auto mb-3 text-status-fail" />
              <p className="text-sm font-semibold text-text-1">Scan failed</p>
              <p className="mt-2 text-xs text-text-2 leading-relaxed">{errorMsg}</p>
              <p className="mt-3 text-xs text-text-3 font-mono">
                Make sure the backend is running:<br />
                <code className="text-brass">uvicorn app.main:app --reload</code>
              </p>
            </div>
          )}

          {phase === "done" && result && verdict && (
            <div className="space-y-4 animate-fadeIn w-full">

              {/* Verdict Banner */}
              <div
                className="flex items-center gap-3 p-4 rounded-xl border"
                style={{ background: verdict.bg, borderColor: verdict.border }}
              >
                <verdict.Icon size={28} style={{ color: verdict.color }} className="flex-none" />
                <div>
                  <div className="text-sm font-bold font-mono uppercase tracking-wider" style={{ color: verdict.color }}>
                    {verdict.label}
                  </div>
                  <div className="text-xs text-text-2 mt-0.5 leading-snug">{result.verdictNote}</div>
                </div>
                <div className="ml-auto text-right flex-none">
                  <div className="text-[10px] font-mono text-text-3">Rule Engine</div>
                  <div className="text-[11px] font-mono text-text-2">{result.rule_version}</div>
                </div>
              </div>

              {/* Violations */}
              {result.violations?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-status-fail font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <XCircle size={13} /> {result.violations.length} Violation{result.violations.length > 1 ? "s" : ""} Found
                  </div>
                  {result.violations.map((v, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-status-fail/10 border border-status-fail/25 rounded-lg px-3 py-2.5 text-xs">
                      <AlertTriangle size={13} className="text-status-fail flex-none mt-0.5" />
                      <div>
                        <span className="font-semibold text-status-fail">{v.rule}: </span>
                        <span className="text-text-2">{v.plain || v.message}</span>
                        {v.severity && <span className="ml-2 font-mono text-[10px] text-text-3 uppercase">[{v.severity}]</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fields Table */}
              <div>
                <div className="text-xs font-semibold text-text-2 font-mono uppercase tracking-wider mb-2">
                  Extracted LMPC Fields
                </div>
                <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                  {result.fields?.length > 0 ? result.fields.map((f, i) => {
                    const statusColor = f.status === "ok" ? "#5AAE83" : f.status === "fail" ? "#D06A5A" : "#DA9E4E";
                    const StatusIcon = f.status === "ok" ? CheckCircle2 : f.status === "fail" ? XCircle : AlertTriangle;
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 items-start py-2 px-2.5 rounded bg-panel-darker border border-panel-line/60 text-xs">
                        <div className="col-span-1 pt-0.5">
                          <StatusIcon size={13} style={{ color: statusColor }} />
                        </div>
                        <div className="col-span-7">
                          <div className="font-medium text-text-1">{f.label}</div>
                          <div className="text-[11.5px] text-text-2 mt-0.5 break-words">{f.value || "—"}</div>
                        </div>
                        <div className="col-span-4 text-right">
                          <div className="font-mono text-[10px] text-text-3">{f.rule}</div>
                          <div className="font-mono text-[10.5px] mt-0.5" style={{ color: statusColor }}>
                            {f.confidence}%
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-xs text-text-3 italic p-3">No structured fields returned by backend.</div>
                  )}
                </div>
              </div>

              {/* Gemini Observations + OCR toggle */}
              {result.fields && (() => {
                // Try to find gemini_observations from backend (may not be in fields array)
                const obs = result?.gemini_observations;
                return obs ? (
                  <div className="p-3 bg-brass/10 border border-brass/30 rounded-lg text-xs leading-relaxed">
                    <div className="font-semibold text-brass mb-1 flex items-center gap-1.5">
                      <Info size={12} /> Gemini Observations
                    </div>
                    <p className="text-text-2">{obs}</p>
                  </div>
                ) : null;
              })()}

              {/* Evidence Seal */}
              {result.evidence_seal && (
                <div className="p-2.5 bg-panel-darker border border-panel-line rounded-lg font-mono text-[10px] text-text-3 flex items-start gap-2">
                  <ShieldCheck size={12} className="text-status-pass flex-none mt-0.5" />
                  <div>
                    <span className="text-text-2 font-semibold">Evidence Seal (SHA-256): </span>
                    <span className="break-all">{result.evidence_seal?.hash ?? JSON.stringify(result.evidence_seal).slice(0, 64) + "…"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── VisionInspector (main export) ──────────────────────────────────────────

export default function VisionInspector() {
  const [selectedPack, setSelectedPack] = useState(SAMPLE_PACKAGES[0]);
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [coinPixels, setCoinPixels] = useState(selectedPack.coinPixelDiameter);
  const [fontPixels, setFontPixels] = useState(selectedPack.fontPx);
  const [customImage, setCustomImage] = useState(null);

  const handleSelectPackage = (pkg) => {
    setSelectedPack(pkg);
    setCoinPixels(pkg.coinPixelDiameter);
    setFontPixels(pkg.fontPx);
    setActiveBoxId(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
    }
  };

  const pixelPerMm = calculatePixelPerMm(coinPixels);
  const measuredFontMm = convertPxToMm(fontPixels, pixelPerMm);
  const fontSlab = resolveFontSlab(selectedPack.netQtyGrams);
  const isFontCompliant = measuredFontMm >= fontSlab.mandatory_min_font_height_mm;

  return (
    <div className="space-y-8">
      {/* ── Section 1: Live Gemini Scanner ── */}
      <section>
        <div className="border-b border-panel-line pb-4 mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
            <Zap size={14} />
            <span>Live AI Compliance Check · Gemini 2.0 Flash Vision</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-1">
            LMPC Rule 6 Compliance Scanner
          </h1>
          <p className="text-xs sm:text-sm text-text-2 mt-1 max-w-3xl leading-relaxed">
            Upload any product label photo. Gemini Vision will extract all 14 mandatory fields
            under the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong> and
            instantly generate a structured compliance report.
          </p>
        </div>
        <GeminiScanPanel />
      </section>

      {/* ── Section 2: Coin Calibration Demo ── */}
      <section>
        <div className="border-b border-panel-line pb-4 mb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
            <Sparkles size={14} />
            <span>Stage 1 (YOLOv8 Spatial Detection) + Stage 3 (PaddleOCR &amp; Geometry)</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-text-1">
            Spatial Layout Localization &amp; Pixel-to-mm Coin Calibration
          </h2>
          <p className="text-xs sm:text-sm text-text-2 mt-1 max-w-3xl leading-relaxed">
            Solves the <strong>Millimeter Heuristic Deficit</strong>: LabelLens uses a standard Indian
            5-Rupee coin (diameter: exactly 23 mm) as an optical fiducial reference to convert pixel
            measurements into courtroom-grade millimeter metrics.
          </p>
        </div>

        {/* Preset Selector & Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-panel p-3 rounded-lg border border-panel-line mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-text-3 flex-none">Presets:</span>
            {SAMPLE_PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`text-xs px-3 py-1.5 rounded transition-all flex-none ${selectedPack.id === pkg.id
                  ? "bg-brass text-brass-ink font-semibold shadow"
                  : "bg-panel-raised text-text-1 hover:border-text-3 border border-transparent"
                  }`}
              >
                {pkg.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-panel-line/60">
            <label className="flex items-center gap-1.5 text-xs text-text-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showBoxes}
                onChange={(e) => setShowBoxes(e.target.checked)}
                className="rounded border-panel-line text-brass focus:ring-brass"
              />
              <span>YOLOv8 Boxes</span>
            </label>

            <label className="cursor-pointer bg-panel-raised hover:bg-panel-line border border-panel-line text-xs text-text-1 px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all">
              <Upload size={13} className="text-brass" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Main Calibration Stage */}
        <div data-inspection-evidence className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Canvas Simulator */}
          <div className="lg:col-span-7 bg-panel border border-panel-line rounded-lg p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-xs text-text-3 font-mono mb-2">
              <span>Spatial Detection Canvas</span>
              <span>Ratio: {pixelPerMm.toFixed(2)} px/mm</span>
            </div>

            <div className="relative aspect-[4/3] bg-panel-darker rounded border border-panel-line overflow-hidden flex items-center justify-center p-3 sm:p-4">
              <div className="relative w-full h-full max-w-[420px] max-h-[320px] flex items-center justify-center">
                {customImage ? (
                  <img src={customImage} alt="Uploaded packaging" className="w-full h-full object-contain" />
                ) : (
                  <div className="relative w-full h-full bg-paper text-paper-ink rounded p-3 sm:p-4 shadow-lg border border-brass/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-paper-ink/15 pb-2 mb-2 sm:mb-3">
                      <div>
                        <div className="font-serif font-bold text-sm sm:text-base text-paper-ink leading-tight truncate max-w-[200px] sm:max-w-none">
                          {selectedPack.name}
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] text-paper-ink/70 font-mono">
                          Packaged Commodity • LMPC Rule 6 Design
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-brass via-brass-strong to-[#B97B33] border-2 border-brass-ink/40 shadow flex flex-col items-center justify-center text-brass-ink font-bold text-[8.5px] sm:text-[9px] leading-tight select-none flex-none">
                        <span>₹5</span>
                        <span className="text-[6.5px] sm:text-[7px] tracking-tighter">23 mm</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 my-2 sm:my-3">
                      <div className="h-1.5 sm:h-2 bg-paper-ink/15 rounded w-[85%]" />
                      <div className="h-1.5 sm:h-2 bg-paper-ink/15 rounded w-[70%]" />
                      <div className="h-1.5 sm:h-2 bg-paper-ink/15 rounded w-[60%]" />
                    </div>

                    <div className="flex items-end justify-between border-t border-dashed border-paper-ink/20 pt-2">
                      <div>
                        <div className="text-[8.5px] sm:text-[9px] font-sans text-paper-ink/60 uppercase">Max Retail Price</div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-paper-ink">
                          ₹{selectedPack.netQtyGrams > 500 ? "199.00" : "40.00"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[8.5px] sm:text-[9px] font-sans text-paper-ink/60 uppercase">Net Quantity</div>
                        <div
                          className="font-mono font-bold text-paper-ink transition-all"
                          style={{ fontSize: `${Math.max(10, fontPixels)}px` }}
                        >
                          {selectedPack.netQtyGrams >= 1000 ? `${selectedPack.netQtyGrams / 1000} kg` : `${selectedPack.netQtyGrams} g`}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bounding Box Overlays */}
                {showBoxes && selectedPack.boxes.map((box) => {
                  const isActive = activeBoxId === box.id;
                  return (
                    <div
                      key={box.id}
                      onMouseEnter={() => setActiveBoxId(box.id)}
                      onMouseLeave={() => setActiveBoxId(null)}
                      onClick={() => setActiveBoxId(box.id === activeBoxId ? null : box.id)}
                      className={`absolute border-2 rounded transition-all cursor-pointer ${isActive ? "ring-2 ring-white shadow-lg z-20" : "z-10"}`}
                      style={{
                        left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%`,
                        borderColor: box.color, backgroundColor: `${box.color}15`,
                      }}
                    >
                      <span
                        className="absolute -top-3.5 sm:-top-4 left-0 font-mono text-[8px] sm:text-[9px] text-white px-1.5 py-0.2 rounded truncate max-w-[130px]"
                        style={{ backgroundColor: box.color }}
                      >
                        {box.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bounding Box Legend */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedPack.boxes.map((box) => (
                <div
                  key={box.id}
                  onMouseEnter={() => setActiveBoxId(box.id)}
                  onMouseLeave={() => setActiveBoxId(null)}
                  onClick={() => setActiveBoxId(box.id === activeBoxId ? null : box.id)}
                  className={`flex items-center gap-2 p-1.5 rounded text-[11px] font-mono cursor-pointer transition-all border ${activeBoxId === box.id ? "bg-panel-raised border-brass" : "bg-panel-darker border-panel-line text-text-2"}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: box.color }} />
                  <span className="truncate text-text-1">{box.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Calibration & Font Calculator */}
          <div className="lg:col-span-5 space-y-4">
            {/* Fiducial Reference Calibration */}
            <div className="bg-panel border border-panel-line rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-1">
                  <Coins size={16} className="text-brass" />
                  <span>₹5 Coin Reference Calibration</span>
                </div>
                <span className="text-[10px] font-mono bg-brass/10 text-brass px-2 py-0.5 rounded border border-brass/30">
                  Known: 23.0 mm
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-text-2">
                  <span>Detected Coin Diameter:</span>
                  <span className="font-mono font-bold text-text-1">{coinPixels} px</span>
                </div>
                <input
                  type="range" min="90" max="250" value={coinPixels}
                  onChange={(e) => setCoinPixels(Number(e.target.value))}
                  className="w-full accent-brass cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-text-3">
                  <span>90 px (Distant)</span>
                  <span>{pixelPerMm.toFixed(2)} px/mm</span>
                  <span>250 px (Close)</span>
                </div>
              </div>

              <div className="p-2.5 bg-panel-darker rounded border border-panel-line text-[11px] font-mono text-text-2">
                Calibration Formula: <code className="text-brass">Ratio = {coinPixels}px ÷ 23mm = {pixelPerMm.toFixed(2)} px/mm</code>
              </div>
            </div>

            {/* Measured Font vs Mandatory Slab */}
            <div className="bg-panel border border-panel-line rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-1">
                  <Ruler size={16} className="text-brass" />
                  <span>Millimeter Font Measurement</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${isFontCompliant ? "bg-status-pass/10 text-status-pass border-status-pass/30" : "bg-status-fail/10 text-status-fail border-status-fail/30"}`}>
                  {isFontCompliant ? "Compliant" : "Violation"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-text-2">
                  <span>Detected Font Pixel Height:</span>
                  <span className="font-mono font-bold text-text-1">{fontPixels} px</span>
                </div>
                <input
                  type="range" min="8" max="60" value={fontPixels}
                  onChange={(e) => setFontPixels(Number(e.target.value))}
                  className="w-full accent-brass cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2.5 bg-panel-darker rounded border border-panel-line">
                  <div className="text-text-3 text-[10px]">Measured Height</div>
                  <div className="text-base font-bold text-text-1 mt-0.5">{measuredFontMm.toFixed(2)} mm</div>
                  <div className="text-[10px] text-text-2">({fontPixels}px ÷ {pixelPerMm.toFixed(1)})</div>
                </div>
                <div className="p-2.5 bg-panel-darker rounded border border-panel-line">
                  <div className="text-text-3 text-[10px]">Mandatory Min</div>
                  <div className="text-base font-bold text-brass mt-0.5">{fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm</div>
                  <div className="text-[10px] text-text-2 truncate">{fontSlab.name}</div>
                </div>
              </div>

              <div className={`p-3 rounded border text-xs leading-relaxed flex items-start gap-2.5 ${isFontCompliant ? "bg-status-pass/10 border-status-pass/30 text-text-1" : "bg-status-fail/10 border-status-fail/30 text-text-1"}`}>
                {isFontCompliant
                  ? <CheckCircle2 size={16} className="text-status-pass flex-none mt-0.5" />
                  : <XCircle size={16} className="text-status-fail flex-none mt-0.5" />}
                <div>
                  <strong className={isFontCompliant ? "text-status-pass" : "text-status-fail"}>
                    {isFontCompliant ? "LMPC Rule 7 Compliant: " : "LMPC Rule 7 Violation: "}
                  </strong>
                  {isFontCompliant
                    ? `Measured font height of ${measuredFontMm.toFixed(2)} mm meets or exceeds the required statutory minimum of ${fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm for packages under ${fontSlab.name}.`
                    : `Measured font height of ${measuredFontMm.toFixed(2)} mm is below the mandatory legal threshold of ${fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm for ${fontSlab.name}. Subject to statutory show-cause notice.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
