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
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Sample data — three scenarios, one per rule branch                 */
/* ------------------------------------------------------------------ */

const SCENARIOS = {
  physical: {
    id: "physical",
    tag: "Physical package",
    tabTitle: "Printed label",
    icon: Package,
    product: "Aloo Bhujia Namkeen, 200 g",
    context: "Printed label, photographed at point of sale",
    nuance:
      "Standard printed label — every mandatory field has to be on the pack itself.",
    detection:
      "Classified as a physical package, non-electronic. Full on-pack declaration set applies — Rule 6(1), no proviso available.",
    logLines: [
      "Classifying image → physical package, non-electronic",
      "Applying Rule 6(1) — full on-pack declaration set",
      "No QR marker detected on the panel",
      "Scoring OCR confidence per field",
    ],
    fields: [
      {
        label: "Manufacturer name & address",
        value: "Shree Anand Snacks Pvt. Ltd., Indore, MP",
        source: "pack",
        status: "ok",
        confidence: 97,
        rule: "Rule 6(1)(a)",
      },
      {
        label: "Common / generic name",
        value: "Aloo Bhujia — namkeen",
        source: "pack",
        status: "ok",
        confidence: 98,
        rule: "Rule 6(1)(b)",
      },
      {
        label: "Net quantity",
        value: "200 g",
        source: "pack",
        status: "ok",
        confidence: 96,
        rule: "Rule 6(1)(c)",
      },
      {
        label: "Month & year of manufacture",
        value: "08 / 2026",
        source: "pack",
        status: "ok",
        confidence: 95,
        rule: "Rule 6(1)(d)",
      },
      {
        label: "MRP",
        value: "₹40, incl. of all taxes",
        source: "pack",
        status: "ok",
        confidence: 97,
        rule: "Rule 6(1)(e)",
      },
      {
        label: "Consumer-care phone",
        value: "partially obscured by a fold crease",
        source: "pack",
        status: "review",
        confidence: 61,
        rule: "Rule 6(1)(f)",
      },
      {
        label: "Unit sale price",
        value: "₹20 / 100 g",
        source: "pack",
        status: "ok",
        confidence: 94,
        rule: "Rule 6(11)",
      },
    ],
    verdict: "review",
    verdictNote:
      "Every field is present. But the consumer-care phone number cleared OCR at 61% confidence — below the 85% auto-pass floor. Rule 6 doesn't guess at a smudged number: it routes this one package to a human reviewer instead of silently passing or failing it.",
    callout: null,
  },

  qr: {
    id: "qr",
    tag: "Physical package — QR-assisted",
    tabTitle: "QR-assisted label",
    icon: Smartphone,
    product: "NovaTech Wi-Fi Smart Plug, 10 A",
    context: "Electronic product, printed label with an on-pack QR code",
    nuance:
      "Electronics only — some fields can legally live in a QR code instead of print, under the 2022 amendment.",
    detection:
      "Classified as a physical package, electronic product. On-pack fields checked against Rule 6(1); the QR payload checked against the Rule 6(1) proviso.",
    logLines: [
      "Classifying image → physical package, electronic product",
      "Applying Rule 6(1) to the on-pack fields",
      "QR marker detected on panel — decoding payload",
      "Cross-checking payload against the 2022 proviso",
    ],
    fields: [
      {
        label: "Manufacturer / importer name",
        value: "NovaTech Electronics Pvt. Ltd.",
        source: "pack",
        status: "ok",
        confidence: 98,
        rule: "Rule 6(1)(a)",
      },
      {
        label: "Net quantity",
        value: "1 N (1 unit)",
        source: "pack",
        status: "ok",
        confidence: 98,
        rule: "Rule 6(1)(c)",
      },
      {
        label: "Month & year of manufacture",
        value: "11 / 2026",
        source: "pack",
        status: "ok",
        confidence: 97,
        rule: "Rule 6(1)(d)",
      },
      {
        label: "MRP",
        value: "₹899, incl. of all taxes",
        source: "pack",
        status: "ok",
        confidence: 99,
        rule: "Rule 6(1)(e)",
      },
      {
        label: "Consumer-care phone & email",
        value: "1800-266-3311 · support@novatech.in",
        source: "pack",
        status: "ok",
        confidence: 96,
        rule: "Rule 6(1)(f)",
      },
      {
        label: "Unit sale price",
        value: "₹899 / unit",
        source: "pack",
        status: "ok",
        confidence: 96,
        rule: "Rule 6(11)",
      },
      {
        label: "Manufacturer / importer address",
        value: "decoded — Plot 14, Electronic City, Bengaluru",
        source: "qr",
        status: "ok",
        confidence: 99,
        rule: "Rule 6(1)(a) proviso",
      },
      {
        label: "Common / generic name",
        value: "decoded — Wi-Fi smart plug, 10 A, 1-way",
        source: "qr",
        status: "ok",
        confidence: 98,
        rule: "Rule 6(1)(b) proviso",
      },
      {
        label: "Dimensions",
        value: "decoded — 6.2 × 6.2 × 3.8 cm",
        source: "qr",
        status: "ok",
        confidence: 97,
        rule: "Rule 6(1)(b) proviso",
      },
    ],
    verdict: "pass",
    verdictNote:
      "Name, net quantity, MRP, manufacture date, and phone/email — the fields the proviso never lets off the pack — are all printed correctly. Address, generic name, and dimensions are declared through the QR code instead, which is exactly what the 2022 amendment allows for an electronic product.",
    callout: {
      naive:
        "A label-only checker: FAIL — manufacturer address is missing from the printed panel.",
      rule6:
        "Rule 6: PASS — address, generic name, and dimensions are declared through the on-pack QR code, permitted for electronic products by the Rule 6(1) proviso inserted under the LM(PC) Second Amendment Rules, 2022.",
    },
  },

  ecommerce: {
    id: "ecommerce",
    tag: "E-commerce listing",
    tabTitle: "Marketplace listing",
    icon: ShoppingBag,
    product: "Cold-Pressed Orange Juice, 500 ml — marketplace listing",
    context: "Product detail page, screenshot",
    nuance:
      "Not a label at all — a listing page, checked against the digital-display duty and the newer origin-filter rule.",
    detection:
      "Classified as a product listing page, no physical package in frame. Switched rule-set from Rule 6(1) directly to Rule 6(10), the digital-display duty, plus Rule 6(10A) for country of origin.",
    logLines: [
      "Classifying image → product listing page, no package in frame",
      "Switching rule-set → Rule 6(10), digital-display duty",
      "Reading listing fields and price block",
      "Checking origin filter against Rule 6(10A)",
    ],
    fields: [
      {
        label: "Manufacturer name & address",
        value: "Freshline Beverages Pvt. Ltd., Pune",
        source: "listing",
        status: "ok",
        confidence: 95,
        rule: "Rule 6(10) → 6(1)(a)",
      },
      {
        label: "Generic name",
        value: "Cold-pressed orange juice",
        source: "listing",
        status: "ok",
        confidence: 97,
        rule: "Rule 6(10) → 6(1)(b)",
      },
      {
        label: "Net quantity (selected variant)",
        value: "500 ml",
        source: "listing",
        status: "ok",
        confidence: 96,
        rule: "Rule 6(10) → 6(1)(c)",
      },
      {
        label: "MRP",
        value: "₹120, incl. of all taxes",
        source: "listing",
        status: "ok",
        confidence: 98,
        rule: "Rule 6(10) → 6(1)(e)",
      },
      {
        label: "Country-of-origin filter",
        value: "India — present, sortable in the listing filter",
        source: "listing",
        status: "ok",
        confidence: 94,
        rule: "Rule 6(10A)",
      },
      {
        label: "Date of manufacture / best-before",
        value: "not shown anywhere on the listing",
        source: "listing",
        status: "fail",
        confidence: 92,
        rule: "Rule 6(10) → 6(1)(d)/(da)",
      },
      {
        label: "Consumer-care phone / email",
        value: "not shown anywhere on the listing",
        source: "listing",
        status: "fail",
        confidence: 90,
        rule: "Rule 6(10) → 6(1)(f)",
      },
    ],
    verdict: "fail",
    verdictNote:
      "Two Rule 6(1) declarations that Rule 6(10) requires on the digital listing are simply absent from the page — not low-confidence, not deferred to a QR code, just missing. A physical-label checklist would never have known to look for a sortable origin filter, or have anything to say about a screenshot with no package in it at all.",
    callout: null,
  },
};

const MODE_ORDER = ["physical", "qr", "ecommerce"];

const VERDICT_META = {
  pass: { word: "Pass", color: "var(--pass)", bg: "var(--pass-bg)" },
  review: {
    word: "Needs human review",
    color: "var(--review)",
    bg: "var(--review-bg)",
  },
  fail: { word: "Fail", color: "var(--fail)", bg: "var(--fail-bg)" },
};

const STATUS_META = {
  ok: { Icon: Check, color: "var(--pass)" },
  review: { Icon: AlertTriangle, color: "var(--review)" },
  fail: { Icon: X, color: "var(--fail)" },
};

/* deterministic little QR-ish grid, purely decorative */
const QR_PATTERN = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [0, 0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 1],
];

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M2 8V2H8" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 8V2H18" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 18V24H8" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 18V24H18" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 13.5L11.5 17L18.5 9.5" stroke="var(--brass)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ConfidenceBar({ value, color }) {
  return (
    <span className="r6-cbar" aria-hidden="true">
      <span className="r6-cbar-fill" style={{ width: `${value}%`, background: color }} />
    </span>
  );
}

function EvidencePanel({ scenario, phase }) {
  return (
    <div className="r6-evidence-frame">
      <div className={`r6-evidence-inner r6-evidence-${scenario.id}`}>
        {scenario.id !== "ecommerce" ? (
          <div className="r6-label-mock">
            <div className="r6-label-brandrow">
              <div className="r6-label-swatch" />
              <div className="r6-label-brandtext">{scenario.product}</div>
            </div>
            <div className="r6-label-line" style={{ width: "88%" }} />
            <div className="r6-label-line" style={{ width: "72%" }} />
            <div className="r6-label-line" style={{ width: "81%" }} />
            <div className="r6-label-line" style={{ width: "58%" }} />

            {scenario.id === "qr" && (
              <div className="r6-label-qrrow">
                <div className="r6-qr-grid" aria-hidden="true">
                  {QR_PATTERN.map((row, r) => (
                    <div key={r} className="r6-qr-row">
                      {row.map((cell, c) => (
                        <span key={c} className={cell ? "r6-qr-on" : "r6-qr-off"} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="r6-qr-caption">
                  Scan for manufacturer address, generic name &amp; dimensions
                </div>
              </div>
            )}

            <div className="r6-label-bottomrow">
              <div className="r6-label-mrp">
                {scenario.id === "qr" ? "₹899" : "₹40"}
                <span className="r6-label-mrp-tag">MRP, incl. of taxes</span>
              </div>
              <div className="r6-label-qty">
                {scenario.id === "qr" ? "1 N" : "200 g"}
              </div>
            </div>
          </div>
        ) : (
          <div className="r6-listing-mock">
            <div className="r6-listing-bar">marketplace.example/product/48213</div>
            <div className="r6-listing-body">
              <div className="r6-listing-media" aria-hidden="true">
                <div className="r6-listing-bottle" />
              </div>
              <div className="r6-listing-info">
                <div className="r6-label-line" style={{ width: "70%", height: 10 }} />
                <div className="r6-listing-price">₹120 <span>/ 500 ml</span></div>
                <div className="r6-listing-chips">
                  <span className="r6-chip">Country of origin: India</span>
                  <span className="r6-chip">In stock</span>
                </div>
                <div className="r6-listing-cta">Add to cart</div>
                <div className="r6-listing-fold">Product details ▾</div>
              </div>
            </div>
          </div>
        )}

        {phase === "scanning" && <div className="r6-sweep" aria-hidden="true" />}
      </div>

      <div className="r6-evidence-caption">
        <FileText size={14} color="var(--text-3)" />
        <span>{scenario.context}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main app                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [mode, setMode] = useState("qr");
  const [phase, setPhase] = useState("idle"); // idle | scanning | done
  const [runId, setRunId] = useState(0);
  const timeoutRef = useRef(null);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

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
    const duration = prefersReducedMotion ? 500 : 1900;
    timeoutRef.current = window.setTimeout(() => setPhase("done"), duration);
  };

  const avgConfidence = useMemo(() => {
    const sum = scenario.fields.reduce((a, f) => a + f.confidence, 0);
    return Math.round(sum / scenario.fields.length);
  }, [scenario]);

  const verdict = VERDICT_META[scenario.verdict];

  return (
    <div className="r6-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .r6-root {
          --ink: #0B1520;
          --panel: #121F2E;
          --panel-raised: #17293B;
          --panel-line: #26394B;
          --paper: #ECE7D9;
          --paper-ink: #1C1A12;
          --brass: #C9A15A;
          --brass-strong: #E0BE7E;
          --brass-ink: #241B08;
          --text-1: #EDEAE1;
          --text-2: #99AAB8;
          --text-3: #63768A;
          --pass: #5AAE83;
          --pass-bg: rgba(90, 174, 131, 0.14);
          --fail: #D06A5A;
          --fail-bg: rgba(208, 106, 90, 0.16);
          --review: #DA9E4E;
          --review-bg: rgba(218, 158, 78, 0.16);
          --serif: 'IBM Plex Serif', Georgia, serif;
          --sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          --mono: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;

          background: var(--ink);
          color: var(--text-1);
          font-family: var(--sans);
          min-height: 100vh;
          line-height: 1.5;
        }
        .r6-root * { box-sizing: border-box; }
        .r6-root *:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }

        .r6-container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

        /* ---------- nav ---------- */
        .r6-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 26px 0 0;
        }
        .r6-brand { display: flex; align-items: center; gap: 10px; }
        .r6-wordmark { font-family: var(--serif); font-size: 19px; letter-spacing: 0.01em; }
        .r6-wordmark b { color: var(--brass); font-weight: 500; }
        .r6-navtag {
          font-family: var(--mono); font-size: 11.5px; color: var(--text-3);
          border: 1px solid var(--panel-line); border-radius: 4px; padding: 5px 10px;
        }

        /* ---------- hero ---------- */
        .r6-hero { padding: 74px 0 40px; }
        .r6-hero h1 {
          font-family: var(--serif); font-weight: 500; font-size: 42px;
          line-height: 1.16; letter-spacing: -0.01em; max-width: 640px; margin: 0 0 22px;
          color: var(--text-1);
        }
        .r6-hero .lede {
          font-size: 16.5px; color: var(--text-2); max-width: 540px; margin: 0 0 34px;
        }
        .r6-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
        .r6-btn {
          font-family: var(--sans); font-size: 14.5px; font-weight: 600;
          padding: 12px 20px; border-radius: 6px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid transparent; transition: transform 120ms ease, background 120ms ease;
        }
        .r6-btn:active { transform: translateY(1px); }
        .r6-btn-primary { background: var(--brass); color: var(--brass-ink); }
        .r6-btn-primary:hover { background: var(--brass-strong); }
        .r6-btn-secondary { background: transparent; color: var(--text-1); border-color: var(--panel-line); }
        .r6-btn-secondary:hover { border-color: var(--brass); color: var(--brass-strong); }
        .r6-btn:disabled { opacity: 0.55; cursor: default; }

        /* ---------- ruler divider ---------- */
        .r6-ruler {
          height: 30px; margin: 10px 0 0;
          background-image: repeating-linear-gradient(
            to right, var(--panel-line) 0, var(--panel-line) 1px,
            transparent 1px, transparent 24px
          );
          background-position: bottom; background-size: 100% 14px; background-repeat: repeat-x;
          border-bottom: 1px solid var(--panel-line);
        }

        /* ---------- gap section ---------- */
        .r6-gap { padding: 52px 0 56px; }
        .r6-gap h2 { font-family: var(--serif); font-weight: 500; font-size: 27px; max-width: 480px; margin: 0 0 14px; }
        .r6-gap p { color: var(--text-2); max-width: 560px; font-size: 15px; margin: 0 0 30px; }
        .r6-gap-row { display: flex; align-items: center; gap: 34px; flex-wrap: wrap; }
        .r6-inspector { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .r6-inspector-label { font-family: var(--mono); font-size: 11.5px; color: var(--text-3); text-align: center; max-width: 100px; }
        .r6-pkg-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; max-width: 320px; }
        .r6-pkg-grid svg { opacity: 0.5; }
        .r6-gap-note { font-family: var(--mono); font-size: 11.5px; color: var(--text-3); margin-top: 18px; }

        /* ---------- modes / tabs ---------- */
        .r6-modes { padding: 10px 0 26px; }
        .r6-modes h2 { font-family: var(--serif); font-weight: 500; font-size: 27px; max-width: 560px; margin: 0 0 14px; }
        .r6-modes p { color: var(--text-2); max-width: 620px; font-size: 15px; margin: 0 0 30px; }

        .r6-tabs { display: flex; gap: 12px; flex-wrap: wrap; }
        .r6-tab {
          flex: 1 1 220px; text-align: left; background: var(--panel);
          border: 1px solid var(--panel-line); border-radius: 8px; padding: 16px 16px 18px;
          cursor: pointer; color: var(--text-1); font-family: var(--sans);
          transition: border-color 140ms ease, background 140ms ease;
        }
        .r6-tab:hover { border-color: var(--text-3); }
        .r6-tab.active { background: var(--panel-raised); border-color: var(--brass); }
        .r6-tab-top { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
        .r6-tab-tag { font-family: var(--mono); font-size: 11px; color: var(--text-3); }
        .r6-tab-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
        .r6-tab-desc { font-size: 13px; color: var(--text-2); line-height: 1.45; }

        /* ---------- demo ---------- */
        .r6-demo { padding: 34px 0 20px; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 26px; }
        @media (max-width: 820px) { .r6-demo { grid-template-columns: 1fr; } }

        .r6-evidence-frame { background: var(--panel); border: 1px solid var(--panel-line); border-radius: 8px; padding: 18px; }
        .r6-evidence-inner {
          position: relative; overflow: hidden; border-radius: 3px;
          min-height: 300px; display: flex; align-items: center; justify-content: center;
          background: #0E1A26;
        }
        .r6-evidence-caption { display: flex; align-items: center; gap: 7px; margin-top: 14px; font-size: 12.5px; color: var(--text-3); }

        .r6-sweep {
          position: absolute; left: 0; right: 0; height: 22%;
          background: linear-gradient(to bottom, transparent, rgba(201,161,90,0.30), transparent);
          animation: r6-sweep-move 1.9s ease-in-out infinite;
        }
        @keyframes r6-sweep-move {
          0% { top: -25%; }
          100% { top: 105%; }
        }

        .r6-label-mock {
          background: var(--paper); color: var(--paper-ink); width: 92%; margin: 20px auto;
          padding: 18px 18px 16px; border-radius: 2px;
        }
        .r6-label-brandrow { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .r6-label-swatch { width: 26px; height: 26px; background: rgba(28,26,18,0.14); border-radius: 3px; flex: none; }
        .r6-label-brandtext { font-size: 13px; font-weight: 600; }
        .r6-label-line { height: 7px; background: rgba(28,26,18,0.16); border-radius: 2px; margin-bottom: 9px; }
        .r6-label-qrrow { display: flex; align-items: center; gap: 12px; margin: 12px 0; padding: 10px; background: rgba(28,26,18,0.05); border-radius: 3px; }
        .r6-qr-grid { display: flex; flex-direction: column; gap: 2px; flex: none; }
        .r6-qr-row { display: flex; gap: 2px; }
        .r6-qr-on, .r6-qr-off { width: 6px; height: 6px; display: block; }
        .r6-qr-on { background: var(--paper-ink); }
        .r6-qr-off { background: transparent; }
        .r6-qr-caption { font-size: 11px; color: rgba(28,26,18,0.7); line-height: 1.4; }
        .r6-label-bottomrow { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(28,26,18,0.2); }
        .r6-label-mrp { font-family: var(--mono); font-weight: 600; font-size: 19px; }
        .r6-label-mrp-tag { display: block; font-family: var(--sans); font-weight: 400; font-size: 9.5px; color: rgba(28,26,18,0.6); }
        .r6-label-qty { font-family: var(--mono); font-weight: 600; font-size: 15px; }

        .r6-listing-mock { width: 94%; margin: 16px auto; background: #12202E; border: 1px solid var(--panel-line); border-radius: 10px; overflow: hidden; }
        .r6-listing-bar { font-family: var(--mono); font-size: 10.5px; color: var(--text-3); padding: 9px 12px; border-bottom: 1px solid var(--panel-line); }
        .r6-listing-body { display: flex; gap: 14px; padding: 14px; }
        .r6-listing-media { width: 84px; height: 96px; flex: none; background: #0E1A26; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .r6-listing-bottle { width: 26px; height: 56px; border-radius: 4px 4px 8px 8px; background: linear-gradient(to bottom, #DA9E4E, #B97B33); }
        .r6-listing-info { flex: 1; min-width: 0; }
        .r6-listing-price { font-family: var(--mono); font-size: 18px; font-weight: 600; color: var(--text-1); margin: 8px 0 10px; }
        .r6-listing-price span { font-family: var(--sans); font-weight: 400; font-size: 12px; color: var(--text-3); }
        .r6-listing-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
        .r6-chip { font-size: 10.5px; font-family: var(--mono); color: var(--text-2); border: 1px solid var(--panel-line); border-radius: 999px; padding: 4px 9px; }
        .r6-listing-cta { display: inline-block; background: var(--brass); color: var(--brass-ink); font-size: 12px; font-weight: 600; padding: 8px 14px; border-radius: 5px; margin-bottom: 10px; }
        .r6-listing-fold { font-size: 11.5px; color: var(--text-3); }

        /* ---------- results panel ---------- */
        .r6-results { background: var(--panel); border: 1px solid var(--panel-line); border-radius: 8px; padding: 22px; min-height: 300px; display: flex; flex-direction: column; }
        .r6-results-idle { margin: auto; text-align: center; color: var(--text-3); max-width: 260px; }
        .r6-results-idle svg { margin-bottom: 12px; opacity: 0.6; }
        .r6-results-idle p { font-size: 13.5px; }

        .r6-runbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
        .r6-legend { font-family: var(--mono); font-size: 10.5px; color: var(--text-3); line-height: 1.5; }

        .r6-log { display: flex; flex-direction: column; gap: 10px; margin: auto 0; }
        .r6-log-line {
          font-family: var(--mono); font-size: 12.5px; color: var(--text-2);
          opacity: 0; animation: r6-log-in 420ms ease forwards;
        }
        .r6-log-line::before { content: "›"; color: var(--brass); margin-right: 8px; }
        @keyframes r6-log-in { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }

        .r6-detect {
          font-size: 13px; color: var(--text-2); border-left: 2px solid var(--brass);
          padding: 4px 0 4px 12px; margin-bottom: 18px;
        }

        .r6-verdict-row { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
        .r6-stamp {
          font-family: var(--mono); font-weight: 600; font-size: 13px; letter-spacing: 0.09em; text-transform: uppercase;
          padding: 9px 16px; border-radius: 5px; border: 1.5px solid currentColor;
          animation: r6-stamp-in 480ms cubic-bezier(.2,1.4,.4,1) forwards;
        }
        @keyframes r6-stamp-in {
          0% { opacity: 0; transform: scale(1.5) rotate(-8deg); }
          60% { opacity: 1; transform: scale(0.94) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .r6-confmeta { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 12px; color: var(--text-2); }
        .r6-cbar { display: inline-block; width: 60px; height: 5px; background: var(--panel-line); border-radius: 3px; overflow: hidden; }
        .r6-cbar-fill { display: block; height: 100%; border-radius: 3px; }

        .r6-fields { display: flex; flex-direction: column; margin-bottom: 6px; }
        .r6-field {
          display: grid; grid-template-columns: 18px 1fr auto; gap: 12px; align-items: start;
          padding: 11px 0; border-bottom: 1px solid var(--panel-line);
          opacity: 0; animation: r6-row-in 380ms ease forwards;
        }
        .r6-field:last-child { border-bottom: none; }
        @keyframes r6-row-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .r6-field-icon { margin-top: 2px; }
        .r6-field-label { font-size: 13.5px; font-weight: 600; color: var(--text-1); margin-bottom: 3px; }
        .r6-field-value { font-size: 12.5px; color: var(--text-2); }
        .r6-field-source { font-family: var(--mono); font-size: 10px; color: var(--brass); border: 1px solid rgba(201,161,90,0.4); border-radius: 3px; padding: 1px 6px; margin-left: 8px; white-space: nowrap; }
        .r6-field-right { text-align: right; }
        .r6-field-rule { font-family: var(--mono); font-size: 11px; color: var(--text-3); margin-bottom: 6px; white-space: nowrap; }
        .r6-field-conf { display: flex; align-items: center; gap: 6px; justify-content: flex-end; font-family: var(--mono); font-size: 11px; color: var(--text-2); }

        .r6-callout {
          margin-top: 16px; padding: 14px 16px; background: rgba(201,161,90,0.07);
          border: 1px solid rgba(201,161,90,0.35); border-radius: 6px;
          opacity: 0; animation: r6-row-in 420ms ease forwards;
        }
        .r6-callout .naive { font-size: 12.5px; color: var(--text-3); text-decoration: line-through; text-decoration-color: var(--fail); margin-bottom: 8px; }
        .r6-callout .rule6 { font-size: 13px; color: var(--text-1); }
        .r6-callout .rule6 b { color: var(--brass-strong); font-weight: 600; }

        .r6-verdictnote { font-size: 13px; color: var(--text-2); margin-top: 16px; line-height: 1.55; }

        /* ---------- footer ---------- */
        .r6-footer { border-top: 1px solid var(--panel-line); padding: 30px 0 60px; margin-top: 30px; }
        .r6-footer p { font-size: 12.5px; color: var(--text-3); max-width: 640px; line-height: 1.6; margin: 0 0 10px; }
        .r6-footer .built { font-family: var(--mono); font-size: 11.5px; color: var(--text-3); }

        @media (prefers-reduced-motion: reduce) {
          .r6-root * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <div className="r6-container">
        <nav className="r6-nav">
          <div className="r6-brand">
            <LogoMark />
            <span className="r6-wordmark">Rule <b>6</b></span>
          </div>
          <span className="r6-navtag">SIH 2026 prototype</span>
        </nav>

        <header className="r6-hero">
          <h1>Half a label just moved into a QR code. Most checkers haven't caught up.</h1>
          <p className="lede">
            Rule 6 reads a package the way Legal Metrology actually reads it — checking
            what the amended Rule 6 still requires on the pack, decoding what it now
            allows in a QR code, and telling the two apart before calling anything a
            violation.
          </p>
          <div className="r6-ctas">
            <a className="r6-btn r6-btn-primary" href="#demo">
              <Play size={15} /> Run the sample scans
            </a>
            <a className="r6-btn r6-btn-secondary" href="#gap">
              See the enforcement gap <ArrowRight size={15} />
            </a>
          </div>
        </header>

        <div className="r6-ruler" />

        <section className="r6-gap" id="gap">
          <h2>One inspector doesn't scale to a country's shelves.</h2>
          <p>
            India's Legal Metrology inspectorate is small relative to how many new
            packaged SKUs reach retail and marketplace shelves every week. A checker
            that can only say pass or fail doesn't help that math — one that can also
            say "we're confident" or "this one needs a person" does.
          </p>
          <div className="r6-gap-row">
            <div className="r6-inspector">
              <ShieldCheck size={34} color="var(--brass)" />
              <span className="r6-inspector-label">a Legal Metrology inspector</span>
            </div>
            <div className="r6-pkg-grid" aria-hidden="true">
              {Array.from({ length: 40 }).map((_, i) => (
                <Package key={i} size={16} color="var(--text-2)" />
              ))}
            </div>
          </div>
          <p className="r6-gap-note">Illustrative order of magnitude, not an official count — the gap is the point.</p>
        </section>

        <section className="r6-modes" id="demo">
          <h2>The same checker, three different rule branches.</h2>
          <p>
            A physical label is checked against Rule 6(1). An electronics label with a
            QR code is checked against the proviso the code unlocks. A marketplace
            listing isn't a label at all — it's checked against the digital-display
            duty instead. Pick a sample and run the check.
          </p>

          <div className="r6-tabs" role="tablist" aria-label="Sample scenario">
            {MODE_ORDER.map((key) => {
              const s = SCENARIOS[key];
              const Icon = s.icon;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={mode === key}
                  className={`r6-tab ${mode === key ? "active" : ""}`}
                  onClick={() => setMode(key)}
                >
                  <div className="r6-tab-top">
                    <Icon size={17} color={mode === key ? "var(--brass)" : "var(--text-2)"} />
                    <span className="r6-tab-tag">{s.tag}</span>
                  </div>
                  <div className="r6-tab-title">{s.tabTitle}</div>
                  <div className="r6-tab-desc">{s.nuance}</div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="r6-demo">
          <div>
            <EvidencePanel scenario={scenario} phase={phase} />
            <div className="r6-runbar" style={{ marginTop: 16 }}>
              <button className="r6-btn r6-btn-primary" onClick={handleRun} disabled={phase === "scanning"}>
                {phase === "done" ? <RotateCcw size={15} /> : <Play size={15} />}
                {phase === "idle" && "Run compliance check"}
                {phase === "scanning" && "Reading fields…"}
                {phase === "done" && "Run again"}
              </button>
            </div>
            <div className="r6-legend" style={{ marginTop: 12 }}>
              verdict rule — confirmed missing field → fail · any read under 85% confidence → needs review · everything present &amp; confident → pass
            </div>
          </div>

          <div className="r6-results">
            {phase === "idle" && (
              <div className="r6-results-idle">
                <Gauge size={30} />
                <p>Press "Run compliance check" to see how Rule 6 reads this sample.</p>
              </div>
            )}

            {phase === "scanning" && (
              <div className="r6-log" key={`log-${mode}-${runId}`}>
                {scenario.logLines.map((line, i) => (
                  <div key={i} className="r6-log-line" style={{ animationDelay: `${i * 380}ms` }}>
                    {line}
                  </div>
                ))}
              </div>
            )}

            {phase === "done" && (
              <div key={`done-${mode}-${runId}`}>
                <div className="r6-detect">
                  <Info size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} color="var(--text-3)" />
                  {scenario.detection}
                </div>

                <div className="r6-verdict-row">
                  <span className="r6-stamp" style={{ color: verdict.color, background: verdict.bg }}>
                    {verdict.word}
                  </span>
                  <span className="r6-confmeta">
                    composite confidence
                    <ConfidenceBar value={avgConfidence} color="var(--brass)" />
                    {avgConfidence}%
                  </span>
                </div>

                <div className="r6-fields">
                  {scenario.fields.map((f, i) => {
                    const st = STATUS_META[f.status];
                    return (
                      <div
                        key={f.label}
                        className="r6-field"
                        style={{ animationDelay: `${i * 65}ms` }}
                      >
                        <span className="r6-field-icon">
                          <st.Icon size={15} color={st.color} />
                        </span>
                        <span>
                          <span className="r6-field-label">
                            {f.label}
                            {f.source !== "pack" && (
                              <span className="r6-field-source">
                                {f.source === "qr" ? "via QR" : "on listing"}
                              </span>
                            )}
                          </span>
                          <span className="r6-field-value">{f.value}</span>
                        </span>
                        <span className="r6-field-right">
                          <div className="r6-field-rule">{f.rule}</div>
                          <div className="r6-field-conf">
                            <ConfidenceBar value={f.confidence} color={st.color} />
                            {f.confidence}%
                          </div>
                        </span>
                      </div>
                    );
                  })}
                </div>

                {scenario.callout && (
                  <div className="r6-callout" style={{ animationDelay: `${scenario.fields.length * 65 + 120}ms` }}>
                    <div className="naive">{scenario.callout.naive}</div>
                    <div className="rule6"><b>Rule 6:</b> {scenario.callout.rule6}</div>
                  </div>
                )}

                <p className="r6-verdictnote">{scenario.verdictNote}</p>
              </div>
            )}
          </div>
        </section>

        <footer className="r6-footer">
          <p>
            Rule citations reference the Legal Metrology (Packaged Commodities)
            Rules, 2011, as amended by the Second Amendment Rules, 2022 (the
            electronics QR proviso) and later e-commerce amendments (Rule 6(10A),
            country-of-origin filter). This is a hackathon prototype: sample data
            and simulated extraction, not a live OCR pipeline or a certified
            inspection tool — citations should be checked against the current
            gazette text before any real deployment.
          </p>
          <p className="built">Built for Smart India Hackathon 2026 — Legal Metrology &amp; Consumer Affairs.</p>
        </footer>
      </div>
    </div>
  );
}
