import React, { useState, useEffect, useRef } from "react";
import {
  Camera, Cpu, ScanLine, Scale, FileBadge2, ArrowRight,
  Menu, X, ChevronRight, CheckCircle2, AlertCircle,
  XCircle, FileText, Eye, Clock, Database
} from "lucide-react";
import LogoMark from "./LogoMark";
import Login from "./Login";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ivory:      "#F7F5F0",
  charcoal:   "#20252B",
  slate:      "#59636E",
  green:      "#183D35",
  greenLight: "#234F45",
  vermilion:  "#C9572C",
  sage:       "#DCE5DD",
  sageDark:   "#B3C5B5",
  border:     "#D8D7D2",
  borderDark: "#BFC0BC",
  amber:      "#C9572C",
};

const styles = {
  serif:  { fontFamily: "'Instrument Serif', 'IBM Plex Serif', Georgia, serif" },
  sans:   { fontFamily: "'IBM Plex Sans', system-ui, sans-serif" },
  mono:   { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" },
};

// ─── Reusable pieces ──────────────────────────────────────────────────────────
function SectionLabel({ number, text }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span style={{ ...styles.mono, color: T.slate, fontSize: "10px", letterSpacing: "0.15em" }}>
        {number} /
      </span>
      <span className="w-8 h-px" style={{ background: T.border }} />
      <span style={{ ...styles.mono, color: T.slate, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {text}
      </span>
    </div>
  );
}

function Rule({ style, className }) {
  return <div className={`${className || ""} h-px`} style={{ background: T.border, ...style }} />;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function Nav({ onLoginClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(247, 245, 240, 0.97)" : T.ivory,
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: scrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="mx-auto px-6 lg:px-10 h-16 flex items-center justify-between" style={{ maxWidth: 1200 }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          {/* Measurement mark — crosshairs + scale tick */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="1" y="1" width="22" height="22" rx="1" stroke={T.green} strokeWidth="1.5" />
            <line x1="12" y1="5" x2="12" y2="9" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="15" x2="12" y2="19" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="12" x2="9" y2="12" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="12" x2="19" y2="12" stroke={T.green} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2" fill={T.vermilion} />
          </svg>
          <div style={{ lineHeight: 1 }}>
            <div style={{ ...styles.mono, fontSize: "15px", fontWeight: 700, color: T.charcoal, letterSpacing: "0.08em" }}>
              LABEL<span style={{ color: T.green }}>LENS</span>
            </div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {["Product", "How it works", "Rules", "Reports"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{ ...styles.sans, fontSize: "13px", color: T.slate, letterSpacing: "0.01em" }}
              className="hover:text-[#20252B] transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="transition-all duration-200 hover:bg-[#183D35] hover:text-white"
            style={{
              ...styles.sans,
              fontSize: "13px",
              fontWeight: 500,
              color: T.charcoal,
              border: `1px solid ${T.border}`,
              padding: "7px 18px",
              letterSpacing: "0.01em",
            }}
          >
            Open scanner
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} color={T.charcoal} /> : <Menu size={20} color={T.charcoal} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: `1px solid ${T.border}`, background: T.ivory }} className="md:hidden px-6 py-5 space-y-4">
          {["Product", "How it works", "Rules", "Reports"].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="block" style={{ ...styles.sans, fontSize: "14px", color: T.slate }}
              onClick={() => setMobileOpen(false)}>{l}</a>
          ))}
          <button onClick={onLoginClick} className="block" style={{ ...styles.sans, fontSize: "14px", color: T.green, fontWeight: 600 }}>
            Open scanner →
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onLoginClick }) {
  return (
    <section className="pt-24 pb-0" style={{ background: T.ivory, borderBottom: `1px solid ${T.border}` }}>
      <div className="mx-auto px-6 lg:px-10" style={{ maxWidth: 1200 }}>
        <div className="flex flex-col lg:flex-row gap-0 items-stretch">

          {/* Left column */}
          <div className="flex-1 py-16 lg:py-24 lg:pr-16" style={{ borderRight: `1px solid ${T.border}` }}>
            <p style={{ ...styles.mono, fontSize: "10px", color: T.slate, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "28px" }}>
              Legal Metrology • India
            </p>

            <h1 style={{ ...styles.serif, fontSize: "clamp(2.4rem, 4.5vw, 3.5rem)", color: T.charcoal, lineHeight: 1.12, fontWeight: 400, marginBottom: "24px" }}>
              Know what the label says.<br />
              Know whether it complies.
            </h1>

            <p className="max-w-sm" style={{ ...styles.sans, fontSize: "15px", color: T.slate, lineHeight: 1.65, marginBottom: "36px" }}>
              LabelLens uses computer vision and OCR to inspect packaged commodity labels against mandatory declarations under the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={onLoginClick}
                className="transition-all duration-200 hover:bg-[#0f2a23]"
                style={{
                  ...styles.sans,
                  background: T.green,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "11px 22px",
                  letterSpacing: "0.02em",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Scan a label
              </button>
              <a
                href="#how-it-works"
                className="transition-all duration-200 hover:bg-[#F0EEE9]"
                style={{
                  ...styles.sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: T.charcoal,
                  border: `1px solid ${T.border}`,
                  padding: "11px 22px",
                  letterSpacing: "0.01em",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                See how it works
              </a>
            </div>

            <p style={{ ...styles.mono, fontSize: "10px", color: T.slate, letterSpacing: "0.08em" }}>
              8 mandatory declarations checked&nbsp; •&nbsp; OCR + vision&nbsp; •&nbsp; structured compliance report
            </p>
          </div>

          {/* Right column — inspection workstation */}
          <div className="lg:w-[520px] relative bg-white" style={{ borderLeft: `1px solid ${T.border}` }}>
            <InspectionWorkstation />
          </div>

        </div>
      </div>
    </section>
  );
}

// Inspection workstation visual (right side of hero)
function InspectionWorkstation() {
  const fields = [
    { label: "MRP",              value: "₹70",                status: "verified" },
    { label: "Net quantity",     value: "70 g",               status: "verified" },
    { label: "Manufacturer",     value: "Nestlé India Ltd.",   status: "verified" },
    { label: "Consumer helpline",value: "1800-xxx-xxxx",       status: "missing"  },
    { label: "Date of packing",  value: "AUG 2026",           status: "verified" },
    { label: "Country of origin",value: "India",              status: "verified" },
    { label: "FSSAI license",    value: "—",                  status: "review"   },
    { label: "Veg / Non-veg",    value: "VEG",                status: "verified" },
  ];

  return (
    <div className="h-full min-h-[520px] flex flex-col" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
      {/* Toolbar strip */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}`, background: T.ivory }}>
        <span style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          LabelLens · Inspection view
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "#4CAF50" }} />
          <span style={{ ...styles.mono, fontSize: "9px", color: T.slate }}>active</span>
        </div>
      </div>

      {/* Product thumbnail with OCR boxes */}
      <div className="relative" style={{ height: "190px", background: "#F0EDE6", borderBottom: `1px solid ${T.border}`, overflow: "hidden" }}>
        <img
          src="/images/hero_scan.png"
          alt="Packaged product scan"
          className="w-full h-full object-cover"
          style={{ opacity: 0.85, filter: "contrast(1.05)" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {/* OCR annotation boxes */}
        <svg className="absolute inset-0 w-full h-full">
          <rect x="18%" y="18%" width="30%" height="12%" rx="0" fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="3,2" />
          <rect x="55%" y="24%" width="25%" height="9%" rx="0" fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="3,2" />
          <rect x="18%" y="55%" width="45%" height="10%" rx="0" fill="none" stroke={T.vermilion} strokeWidth="1.5" strokeDasharray="3,2" />
          <rect x="18%" y="70%" width="35%" height="9%" rx="0" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3,2" />
          {/* Leader lines */}
          <line x1="48%" y1="24%" x2="60%" y2="15%" stroke={T.border} strokeWidth="1" />
          <line x1="63%" y1="24%" x2="85%" y2="12%" stroke={T.border} strokeWidth="1" />
        </svg>
        {/* Floating annotation */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1.5"
          style={{ background: T.charcoal, border: `1px solid ${T.border}` }}
        >
          <span style={{ ...styles.mono, fontSize: "9px", color: "#fff", letterSpacing: "0.06em" }}>6 / 8 declarations verified</span>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4CAF50" }} />
        </div>
      </div>

      {/* Field list */}
      <div className="flex-1 overflow-auto divide-y" style={{ divideColor: T.border }}>
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div>
              <div style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>{f.label}</div>
              <div style={{ ...styles.sans, fontSize: "12px", color: T.charcoal, fontWeight: 500, marginTop: "1px" }}>{f.value}</div>
            </div>
            <StatusBadge status={f.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    verified: { label: "Verified",  color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
    missing:  { label: "Not found", color: "#9A3412", bg: "#FFF7ED", border: "#FED7AA" },
    review:   { label: "Review",    color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
  };
  const s = map[status] || map.review;
  return (
    <span style={{ ...styles.mono, fontSize: "8.5px", color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: "2px 7px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

// ─── Section 01: The problem ──────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section id="product" className="py-20 px-6 lg:px-10" style={{ background: T.ivory, borderBottom: `1px solid ${T.border}` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <SectionLabel number="01" text="The challenge" />

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Statement */}
          <div className="lg:w-1/2">
            <h2 style={{ ...styles.serif, fontSize: "clamp(1.65rem, 3.2vw, 2.5rem)", color: T.charcoal, lineHeight: 1.2, fontWeight: 400, marginBottom: "20px" }}>
              Compliance information is already on the package. The problem is finding, reading and verifying it consistently.
            </h2>
            <p style={{ ...styles.sans, fontSize: "14px", color: T.slate, lineHeight: 1.7 }}>
              Manual label inspection is slow, inconsistent, and difficult to audit. Officers spend time on legibility and completeness checks that should be automated. LabelLens turns printed label data into a structured, machine-verifiable compliance record.
            </p>
          </div>

          {/* Comparison */}
          <div className="lg:w-1/2 flex flex-col sm:flex-row gap-0">
            {/* Manual */}
            <div className="flex-1 pr-6 sm:pr-8 pb-6 sm:pb-0" style={{ borderRight: `1px solid ${T.border}` }}>
              <div style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
                Manual review
              </div>
              {["Find declaration", "Read label physically", "Compare against rule", "Record finding manually"].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <span style={{ ...styles.mono, fontSize: "10px", color: T.border, minWidth: 16 }}>{i + 1}.</span>
                  <span style={{ ...styles.sans, fontSize: "13px", color: T.slate, lineHeight: 1.45 }}>{step}</span>
                </div>
              ))}
              <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${T.border}` }}>
                <span style={{ ...styles.mono, fontSize: "9px", color: T.vermilion }}>Inconsistent · Not auditable</span>
              </div>
            </div>

            {/* LabelLens */}
            <div className="flex-1 pl-6 sm:pl-8 pt-6 sm:pt-0">
              <div style={{ ...styles.mono, fontSize: "9px", color: T.green, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
                LabelLens
              </div>
              {["Detect label region", "Extract declarations via OCR", "Validate against rules", "Generate report automatically"].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-4">
                  <span style={{ ...styles.mono, fontSize: "10px", color: T.green, minWidth: 16 }}>{i + 1}.</span>
                  <span style={{ ...styles.sans, fontSize: "13px", color: T.charcoal, lineHeight: 1.45 }}>{step}</span>
                </div>
              ))}
              <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${T.border}` }}>
                <span style={{ ...styles.mono, fontSize: "9px", color: T.green }}>Consistent · Auditable · Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 02: Workflow ─────────────────────────────────────────────────────
function WorkflowSection() {
  const steps = [
    { num: "01", title: "Capture",  sub: "Camera or upload",       icon: Camera,    note: "JPEG / PNG / HEIC" },
    { num: "02", title: "Detect",   sub: "Label region isolated",  icon: Eye,       note: "Object segmentation" },
    { num: "03", title: "Extract",  sub: "OCR reads declarations", icon: ScanLine,  note: "8 mandatory fields" },
    { num: "04", title: "Validate", sub: "Rules are checked",      icon: Scale,     note: "LMPC 2011 Rules 6(1)–(10)" },
    { num: "05", title: "Report",   sub: "Evidence-backed result", icon: FileBadge2,note: "SHA-256 sealed" },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 lg:px-10" style={{ background: T.charcoal, borderBottom: `1px solid #2E3540` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <div className="flex items-center gap-3 mb-2">
          <span style={{ ...styles.mono, color: "#59636E", fontSize: "10px", letterSpacing: "0.15em" }}>02 /</span>
          <span className="w-8 h-px" style={{ background: "#2E3540" }} />
          <span style={{ ...styles.mono, color: "#59636E", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>The scan</span>
        </div>

        <div className="flex flex-col lg:flex-row items-end gap-4 mb-14">
          <h2 style={{ ...styles.serif, fontSize: "clamp(1.65rem, 3.2vw, 2.5rem)", color: "#F7F5F0", lineHeight: 1.15, fontWeight: 400 }}>
            From package to finding.
          </h2>
          <p className="lg:ml-auto lg:max-w-xs" style={{ ...styles.sans, fontSize: "13px", color: "#59636E", lineHeight: 1.65 }}>
            Five automated stages turn a photograph of a packaged commodity into a structured compliance verdict.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-0" style={{ border: `1px solid #2E3540` }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="group relative p-6 transition-all duration-300 hover:bg-[#2E3540] cursor-default"
                style={{ borderRight: i < steps.length - 1 ? "1px solid #2E3540" : "none" }}
              >
                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight size={14} color="#2E3540" />
                  </div>
                )}
                <div style={{ ...styles.mono, fontSize: "10px", color: "#59636E", marginBottom: "16px" }}>{s.num}</div>
                <div className="mb-4 w-8 h-8 flex items-center justify-center" style={{ border: `1px solid #2E3540`, background: "#1A2330" }}>
                  <Icon size={15} color={i === 4 ? "#4CAF50" : "#59636E"} />
                </div>
                <div style={{ ...styles.sans, fontSize: "14px", fontWeight: 600, color: "#EDEAE1", marginBottom: "4px" }}>{s.title}</div>
                <div style={{ ...styles.sans, fontSize: "12px", color: "#59636E", marginBottom: "12px" }}>{s.sub}</div>
                <div style={{ ...styles.mono, fontSize: "9px", color: "#3A4550", letterSpacing: "0.05em" }}>{s.note}</div>
              </div>
            );
          })}
        </div>

        {/* Stat strip */}
        <div className="mt-1 grid grid-cols-3" style={{ border: `1px solid #2E3540`, borderTop: "none" }}>
          {[
            { v: "<2s",   l: "End-to-end" },
            { v: "99.4%", l: "OCR accuracy" },
            { v: "8 / 8", l: "Fields checked" },
          ].map(({ v, l }, i) => (
            <div key={l} className="py-5 flex flex-col items-center" style={{ borderRight: i < 2 ? "1px solid #2E3540" : "none" }}>
              <span style={{ ...styles.serif, fontSize: "1.6rem", color: "#F7F5F0", fontWeight: 400 }}>{v}</span>
              <span style={{ ...styles.mono, fontSize: "9px", color: "#59636E", letterSpacing: "0.12em", marginTop: "3px" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 03: Inspection result ───────────────────────────────────────────
function InspectionResultSection() {
  const findings = [
    { field: "MRP",              value: "₹70",              status: "pass",   rule: "Rule 6(1)(d)" },
    { field: "Net quantity",     value: "70 g",             status: "pass",   rule: "Rule 6(1)(b)" },
    { field: "Manufacturer",     value: "Nestlé India Ltd.",status: "pass",   rule: "Rule 6(1)(e)" },
    { field: "Consumer helpline",value: "Not found on label",status: "review",rule: "Rule 6(1)(h)" },
    { field: "Date of packing",  value: "AUG 2026",        status: "pass",   rule: "Rule 6(1)(f)" },
    { field: "Country of origin",value: "India",           status: "pass",   rule: "Rule 6(1)(g)" },
    { field: "FSSAI Lic. No.",   value: "Not legible",     status: "fail",   rule: "Rule 6(1)(j)" },
    { field: "Veg / Non-veg",    value: "Green dot present",status: "pass",  rule: "FSS Rules" },
  ];

  return (
    <section id="reports" className="py-20 px-6 lg:px-10" style={{ background: "#F0EEE9", borderBottom: `1px solid ${T.border}` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <SectionLabel number="03" text="Inspection result" />

        <div className="mb-10 flex flex-col lg:flex-row items-start gap-6">
          <h2 style={{ ...styles.serif, fontSize: "clamp(1.65rem, 3.2vw, 2.5rem)", color: T.charcoal, lineHeight: 1.15, fontWeight: 400 }}>
            A structured inspection record, not a summary.
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-0" style={{ border: `1px solid ${T.border}` }}>
          {/* Product panel */}
          <div className="lg:w-72 flex-shrink-0" style={{ borderRight: `1px solid ${T.border}`, background: "#fff" }}>
            <div className="p-4" style={{ borderBottom: `1px solid ${T.border}` }}>
              <span style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Product image
              </span>
            </div>
            <div className="relative" style={{ height: 220, background: "#F5F3EE" }}>
              <img src="/images/hero_scan.png" alt="product" className="w-full h-full object-cover" style={{ opacity: 0.8 }}
                onError={(e) => e.target.style.display = "none"} />
              {/* Number markers */}
              {[[20, 25], [65, 36], [20, 62], [20, 76]].map(([x, y], i) => (
                <div key={i} className="absolute flex items-center justify-center" style={{
                  left: `${x}%`, top: `${y}%`, width: 18, height: 18,
                  background: T.charcoal, border: `1px solid ${T.border}`,
                  transform: "translate(-50%, -50%)"
                }}>
                  <span style={{ ...styles.mono, fontSize: "8px", color: "#fff" }}>{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="p-4 space-y-2">
              <div style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>Product</div>
              <div style={{ ...styles.sans, fontSize: "13px", color: T.charcoal, fontWeight: 500, lineHeight: 1.4 }}>Maggi 2-Minute Noodles, 70g</div>
              <div style={{ ...styles.mono, fontSize: "9px", color: T.slate }}>Scanned 18 Sep 2026 · REF-2026-0918-001</div>
            </div>
          </div>

          {/* Findings table */}
          <div className="flex-1">
            <div className="flex px-5 py-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.ivory }}>
              <span className="flex-1" style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>Field</span>
              <span className="w-52" style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>Extracted value</span>
              <span className="w-28" style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>Rule ref.</span>
              <span className="w-20 text-right" style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</span>
            </div>
            {findings.map((f, i) => (
              <div key={i} className="flex items-center px-5 py-3 hover:bg-[#F7F5F0] transition-colors" style={{ borderBottom: `1px solid ${T.border}` }}>
                <span className="flex-1" style={{ ...styles.sans, fontSize: "13px", color: T.charcoal }}>{f.field}</span>
                <span className="w-52" style={{ ...styles.sans, fontSize: "12px", color: T.slate }}>{f.value}</span>
                <span className="w-28" style={{ ...styles.mono, fontSize: "9px", color: T.slate }}>{f.rule}</span>
                <span className="w-20 text-right">
                  {f.status === "pass"   && <span style={{ ...styles.mono, fontSize: "9px", color: "#166534", letterSpacing: "0.08em" }}>✓ PASS</span>}
                  {f.status === "fail"   && <span style={{ ...styles.mono, fontSize: "9px", color: T.vermilion, letterSpacing: "0.08em" }}>✗ FAIL</span>}
                  {f.status === "review" && <span style={{ ...styles.mono, fontSize: "9px", color: "#92400E", letterSpacing: "0.08em" }}>⚠ REVIEW</span>}
                </span>
              </div>
            ))}
            {/* Summary row */}
            <div className="flex items-center justify-between px-5 py-4" style={{ background: T.sage }}>
              <span style={{ ...styles.sans, fontSize: "13px", color: T.green, fontWeight: 600 }}>Inspection result</span>
              <div className="flex items-center gap-6">
                <span style={{ ...styles.mono, fontSize: "9px", color: T.slate }}>6 verified</span>
                <span style={{ ...styles.mono, fontSize: "9px", color: "#92400E" }}>1 review</span>
                <span style={{ ...styles.mono, fontSize: "9px", color: T.vermilion }}>1 fail</span>
                <span style={{ ...styles.sans, fontSize: "12px", fontWeight: 700, color: T.vermilion, border: `1px solid ${T.vermilion}`, padding: "2px 10px", letterSpacing: "0.06em" }}>
                  NON-COMPLIANT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 04: Rules ────────────────────────────────────────────────────────
function RulesSection() {
  const rules = [
    { ref: "Rule 6(1)",  title: "Mandatory declarations", desc: "Every package must declare commodity name, net quantity, unit sale price, date of manufacture or packing, name and address of manufacturer, and country of origin." },
    { ref: "Rule 6(2)",  title: "Minimum font size requirements", desc: "Declarations must be printed in font sizes not less than those specified in Schedule II, based on net quantity of the package. Violations are measured against stated minimum dimensions." },
    { ref: "Rule 6(10)", title: "E-commerce display requirements", desc: "Where any packaged commodity is sold through electronic means, the mandatory declarations must be displayed to the buyer before they complete a purchase. No scrolling required." },
  ];

  return (
    <section id="rules" className="py-20 px-6 lg:px-10" style={{ background: T.ivory, borderBottom: `1px solid ${T.border}` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <SectionLabel number="04" text="Regulatory framework" />

        <div className="flex flex-col lg:flex-row gap-16 mb-14">
          <h2 className="lg:w-1/3" style={{ ...styles.serif, fontSize: "clamp(1.65rem, 3vw, 2.4rem)", color: T.charcoal, lineHeight: 1.2, fontWeight: 400 }}>
            Built around the rulebook.
          </h2>
          <p className="lg:w-1/2" style={{ ...styles.sans, fontSize: "14px", color: T.slate, lineHeight: 1.7 }}>
            Every check performed by LabelLens is directly derived from the Legal Metrology (Packaged Commodities) Rules, 2011. Rules are translated into machine-checkable conditions — not approximations.
          </p>
        </div>

        {/* Rule rows */}
        <div style={{ border: `1px solid ${T.border}` }}>
          {rules.map((r, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-0 hover:bg-[#F0EEE9] transition-colors"
              style={{ borderBottom: i < rules.length - 1 ? `1px solid ${T.border}` : "none" }}
            >
              <div className="sm:w-36 px-6 py-5 flex-shrink-0" style={{ borderRight: `1px solid ${T.border}`, background: "#F8F7F3" }}>
                <span style={{ ...styles.mono, fontSize: "10px", color: T.green, letterSpacing: "0.1em", fontWeight: 600 }}>{r.ref}</span>
              </div>
              <div className="sm:w-60 px-6 py-5 flex-shrink-0" style={{ borderRight: `1px solid ${T.border}` }}>
                <span style={{ ...styles.sans, fontSize: "13px", color: T.charcoal, fontWeight: 600 }}>{r.title}</span>
              </div>
              <div className="flex-1 px-6 py-5">
                <p style={{ ...styles.sans, fontSize: "13px", color: T.slate, lineHeight: 1.65 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5" style={{ ...styles.mono, fontSize: "10px", color: T.slate, letterSpacing: "0.06em" }}>
          Source: Legal Metrology (Packaged Commodities) Rules, 2011 · Ministry of Consumer Affairs, India
        </p>
      </div>
    </section>
  );
}

// ─── Section 05: Data ─────────────────────────────────────────────────────────
function DataSection() {
  const feed = [
    { name: "Maggi 2-Minute Noodles 70g",    date: "18 Sep 2026", result: "fail" },
    { name: "Amul Butter 100g",              date: "18 Sep 2026", result: "pass" },
    { name: "Haldiram's Aloo Bhujia 200g",  date: "18 Sep 2026", result: "review" },
    { name: "Tropicana Orange Juice 1L",     date: "17 Sep 2026", result: "pass" },
    { name: "Parle-G Biscuits 100g",         date: "17 Sep 2026", result: "pass" },
  ];

  return (
    <section id="product" className="py-20 px-6 lg:px-10" style={{ background: T.green, borderBottom: `1px solid #0f2a23` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <div className="flex items-center gap-3 mb-12">
          <span style={{ ...styles.mono, color: T.sageDark, fontSize: "10px", letterSpacing: "0.15em" }}>05 /</span>
          <span className="w-8 h-px" style={{ background: "#234F45" }} />
          <span style={{ ...styles.mono, color: T.sageDark, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Inspection data</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 mb-14">
          <h2 style={{ ...styles.serif, fontSize: "clamp(1.65rem, 3.2vw, 2.5rem)", color: T.ivory, lineHeight: 1.15, fontWeight: 400 }}>
            Every scan leaves an auditable trail.
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-0" style={{ border: `1px solid #234F45` }}>
          {/* Stats */}
          <div className="flex flex-row lg:flex-col lg:w-64" style={{ borderRight: `1px solid #234F45` }}>
            {[
              { v: "1,247", l: "Total scans", c: T.ivory },
              { v: "183",   l: "Issues flagged", c: T.vermilion },
              { v: "92%",   l: "Declarations verified", c: T.sage },
            ].map(({ v, l, c }, i) => (
              <div key={l} className="flex-1 p-6" style={{ borderBottom: i < 2 ? `1px solid #234F45` : "none" }}>
                <div style={{ ...styles.serif, fontSize: "2.2rem", color: c, lineHeight: 1, fontWeight: 400 }}>{v}</div>
                <div style={{ ...styles.mono, fontSize: "9px", color: T.sageDark, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "6px" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="flex-1">
            <div className="flex px-5 py-3" style={{ borderBottom: `1px solid #234F45`, background: "#0f2a23" }}>
              <span className="flex-1" style={{ ...styles.mono, fontSize: "9px", color: T.sageDark, letterSpacing: "0.1em", textTransform: "uppercase" }}>Product</span>
              <span className="w-28" style={{ ...styles.mono, fontSize: "9px", color: T.sageDark, letterSpacing: "0.1em", textTransform: "uppercase" }}>Date</span>
              <span className="w-20 text-right" style={{ ...styles.mono, fontSize: "9px", color: T.sageDark, letterSpacing: "0.1em", textTransform: "uppercase" }}>Result</span>
            </div>
            {feed.map((f, i) => (
              <div key={i} className="flex items-center px-5 py-3.5 hover:bg-[#0f2a23] transition-colors" style={{ borderBottom: `1px solid #234F45` }}>
                <span className="flex-1" style={{ ...styles.sans, fontSize: "13px", color: T.ivory }}>{f.name}</span>
                <span className="w-28" style={{ ...styles.mono, fontSize: "10px", color: T.sageDark }}>{f.date}</span>
                <span className="w-20 text-right">
                  {f.result === "pass"   && <span style={{ ...styles.mono, fontSize: "9px", color: "#4CAF50", letterSpacing: "0.08em" }}>PASS</span>}
                  {f.result === "fail"   && <span style={{ ...styles.mono, fontSize: "9px", color: T.vermilion, letterSpacing: "0.08em" }}>FAIL</span>}
                  {f.result === "review" && <span style={{ ...styles.mono, fontSize: "9px", color: "#F59E0B", letterSpacing: "0.08em" }}>REVIEW</span>}
                </span>
              </div>
            ))}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#0f2a23" }}>
              <span style={{ ...styles.mono, fontSize: "9px", color: T.sageDark }}>Showing 5 of 1,247 entries</span>
              <span style={{ ...styles.mono, fontSize: "9px", color: T.sageDark }}>Updated continuously</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 06: Evidence ─────────────────────────────────────────────────────
function EvidenceSection() {
  const chain = [
    { label: "Source image",  desc: "Original label photograph", icon: Camera },
    { label: "OCR output",    desc: "Raw machine-read text",    icon: Eye },
    { label: "Rule check",    desc: "Against LMPC 2011 clause", icon: Scale },
    { label: "Finding",       desc: "Pass / Review / Fail",     icon: FileBadge2 },
    { label: "Report",        desc: "SHA-256 sealed document",  icon: FileText },
  ];

  return (
    <section id="product" className="py-20 px-6 lg:px-10" style={{ background: T.ivory, borderBottom: `1px solid ${T.border}` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <SectionLabel number="06" text="Evidence chain" />

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3">
            <h2 style={{ ...styles.serif, fontSize: "clamp(1.65rem, 3vw, 2.4rem)", color: T.charcoal, lineHeight: 1.2, fontWeight: 400, marginBottom: "16px" }}>
              Every finding should be explainable.
            </h2>
            <p style={{ ...styles.sans, fontSize: "14px", color: T.slate, lineHeight: 1.65 }}>
              Compliance determinations must be traceable back to a source. LabelLens preserves the full chain from image to report — explainable to inspectors, defensible in review.
            </p>
          </div>

          <div className="lg:w-2/3">
            <div className="flex flex-col sm:flex-row gap-0">
              {chain.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="flex-1 flex flex-col" style={{ borderRight: i < chain.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <div className="p-5" style={{ borderBottom: `1px solid ${T.border}`, background: "#F8F7F3" }}>
                      <Icon size={14} color={T.slate} />
                    </div>
                    <div className="p-5 flex-1">
                      <div style={{ ...styles.sans, fontSize: "12px", fontWeight: 600, color: T.charcoal, marginBottom: "4px" }}>{c.label}</div>
                      <div style={{ ...styles.sans, fontSize: "11px", color: T.slate, lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                    {i < chain.length - 1 && (
                      <div className="sm:hidden px-5 py-2 flex items-center" style={{ borderTop: `1px solid ${T.border}` }}>
                        <div className="w-4 h-px mr-2" style={{ background: T.border }} />
                        <span style={{ ...styles.mono, fontSize: "9px", color: T.border }}>→</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-1 p-5" style={{ background: T.sage, border: `1px solid ${T.sageDark}` }}>
              <p style={{ ...styles.mono, fontSize: "10px", color: T.green, letterSpacing: "0.06em" }}>
                All evidence is preserved in the inspection record. Reports are cryptographically sealed (SHA-256) and timestamped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onLoginClick }) {
  return (
    <section className="py-24 px-6 lg:px-10" style={{ background: "#F0EEE9", borderBottom: `1px solid ${T.border}` }}>
      <div className="mx-auto" style={{ maxWidth: 1200 }}>
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/2">
            <Rule className="mb-8 w-16" />
            <h2 style={{ ...styles.serif, fontSize: "clamp(2rem, 4vw, 3rem)", color: T.charcoal, lineHeight: 1.1, fontWeight: 400, marginBottom: "20px" }}>
              Make every label checkable.
            </h2>
            <p style={{ ...styles.sans, fontSize: "15px", color: T.slate, lineHeight: 1.65, marginBottom: "36px", maxWidth: 420 }}>
              Scan a packaged commodity and turn its printed declarations into a structured compliance record — verified against legal requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onLoginClick}
                className="transition-all duration-200 hover:bg-[#0f2a23]"
                style={{
                  ...styles.sans,
                  background: T.green,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "12px 26px",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                Run a scan
              </button>
              <a
                href="#how-it-works"
                className="transition-all duration-200 hover:bg-white"
                style={{
                  ...styles.sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: T.charcoal,
                  border: `1px solid ${T.border}`,
                  padding: "12px 26px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                View methodology
              </a>
            </div>
          </div>

          {/* Right: metadata block */}
          <div className="lg:w-1/2 w-full" style={{ border: `1px solid ${T.border}`, background: "#fff" }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}`, background: T.ivory }}>
              <span style={{ ...styles.mono, fontSize: "9px", color: T.slate, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Platform specifications
              </span>
            </div>
            {[
              ["Regulatory framework",    "Legal Metrology (PC) Rules, 2011"],
              ["Governing authority",     "Min. of Consumer Affairs, DoCA"],
              ["Mandatory fields checked","8 / 8"],
              ["Inspection method",       "Computer vision + OCR"],
              ["Report format",           "Structured record, SHA-256 sealed"],
              ["Platform type",           "Web-based · No app required"],
            ].map(([k, v], i, arr) => (
              <div key={k} className="flex items-center px-6 py-3.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span className="flex-1" style={{ ...styles.sans, fontSize: "12px", color: T.slate }}>{k}</span>
                <span style={{ ...styles.mono, fontSize: "11px", color: T.charcoal }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-6 lg:px-10" style={{ background: T.charcoal, borderTop: `1px solid #2E3540` }}>
      <div className="mx-auto py-12" style={{ maxWidth: 1200 }}>
        <div className="flex flex-col lg:flex-row gap-10 justify-between">
          <div>
            <div style={{ ...styles.mono, fontSize: "14px", fontWeight: 700, color: "#F7F5F0", letterSpacing: "0.08em", marginBottom: "4px" }}>
              LABEL<span style={{ color: T.sage }}>LENS</span>
            </div>
            <div style={{ ...styles.sans, fontSize: "12px", color: "#59636E", marginBottom: "16px" }}>
              Legal Metrology Compliance Platform
            </div>
            <p style={{ ...styles.mono, fontSize: "9px", color: "#3A4550", letterSpacing: "0.06em", maxWidth: 260, lineHeight: 1.6 }}>
              Built for transparent, evidence-based inspection.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <div style={{ ...styles.mono, fontSize: "9px", color: "#59636E", letterSpacing: "0.12em", marginBottom: "12px", textTransform: "uppercase" }}>Platform</div>
              {["Product", "Methodology", "Rules", "Reports"].map((l) => (
                <a key={l} href="#" className="block mb-2" style={{ ...styles.sans, fontSize: "13px", color: "#59636E" }}
                  onMouseEnter={e => e.target.style.color = "#F7F5F0"}
                  onMouseLeave={e => e.target.style.color = "#59636E"}>
                  {l}
                </a>
              ))}
            </div>
            <div>
              <div style={{ ...styles.mono, fontSize: "9px", color: "#59636E", letterSpacing: "0.12em", marginBottom: "12px", textTransform: "uppercase" }}>Info</div>
              {["SIH 2026", "DoCA", "LMPC 2011"].map((l) => (
                <a key={l} href="#" className="block mb-2" style={{ ...styles.sans, fontSize: "13px", color: "#59636E" }}
                  onMouseEnter={e => e.target.style.color = "#F7F5F0"}
                  onMouseLeave={e => e.target.style.color = "#59636E"}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid #2E3540` }}>
          <span style={{ ...styles.mono, fontSize: "9px", color: "#3A4550", letterSpacing: "0.08em" }}>
            SIH 2026 · Ministry of Consumer Affairs · DoCA · India
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4CAF50" }} />
            <span style={{ ...styles.mono, fontSize: "9px", color: "#3A4550", letterSpacing: "0.08em" }}>Systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="relative font-sans h-screen w-full" style={{ background: T.charcoal }}>
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-5 left-5 z-50 flex items-center gap-2 transition-all"
          style={{ ...styles.mono, fontSize: "10px", color: T.sageDark, letterSpacing: "0.1em", border: `1px solid #2E3540`, padding: "6px 14px", background: "none", cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#59636E"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#2E3540"}
        >
          ← Return to portal
        </button>
        <Login
          onLogin={(credentials) =>
            onLoginSuccess({
              email: credentials.email,
              role: "official",
              name: credentials.email.split("@")[0] || "Officer",
            })
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden" style={{ background: T.ivory, ...styles.sans }}>
      <Nav        onLoginClick={() => setShowLogin(true)} />
      <div style={{ paddingTop: "64px" }}>
        <Hero       onLoginClick={() => setShowLogin(true)} />
        <ProblemSection />
        <WorkflowSection />
        <InspectionResultSection />
        <RulesSection />
        <DataSection />
        <EvidenceSection />
        <FinalCTA   onLoginClick={() => setShowLogin(true)} />
        <Footer />
      </div>
    </div>
  );
}
