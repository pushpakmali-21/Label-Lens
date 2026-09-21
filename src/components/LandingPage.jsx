import React, { useState } from "react";
import {
  Scan, FileText, ShieldCheck, BarChart3, CheckCircle2,
  ArrowRight, ChevronRight, Scale, Zap, Eye, AlertTriangle,
  Clock, Database, FileSearch, Settings2, Star, TrendingUp,
  Package, ClipboardList, Search, BookOpen, Building2, User,
  KeyRound, X, Menu, Shield, Globe, Award, Camera, Cpu,
  ScanLine, FileBadge2, BadgeCheck
} from "lucide-react";
import LogoMark from "./LogoMark";
import Login from "./Login";

// ─── Shared Theme: Deep Navy + Warm Amber ────────────────────────────────────
const C = {
  navy: "#0F1B2D",
  navyDark: "#080F1A",
  navyMid: "#162236",
  navyLight: "#1E2F45",
  amber: "#E05A00",
  amberHover: "#C24E00",
  sand: "#F5F6F8",
  sandBorder: "#E4E6EC",
  textLight: "#8BA4BE",
  textMuted: "#64748b",
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
function LandingNav({ onLoginClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F5F6F8]/95 backdrop-blur-lg border-b border-[#E4E6EC] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark size={38} color={C.navy} />
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black tracking-tight leading-none" style={{ color: C.navy }}>
              LabelLens
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase mt-0.5" style={{ color: C.amber }}>
              Gov. Compliance Engine
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10 text-xs font-bold tracking-widest text-slate-600 uppercase">
          <a href="#features" className="hover:text-[#E05A00] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#E05A00] transition-colors">Workflow</a>
          <a href="#dashboard" className="hover:text-[#E05A00] transition-colors">Live Data</a>
          <a href="#rules" className="hover:text-[#E05A00] transition-colors">Regulations</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="hidden sm:inline-flex items-center font-bold text-slate-700 hover:text-[#E05A00] transition-colors uppercase text-xs tracking-widest"
          >
            Sign In
          </button>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold tracking-widest uppercase shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-amber-700/30"
            style={{ background: C.amber }}
          >
            <Scan size={14} />
            <span>Initiate Scan</span>
          </button>
          <button className="md:hidden p-2 text-slate-800" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E4E6EC] bg-[#F5F6F8] px-6 py-6 space-y-5 text-xs font-bold uppercase tracking-widest text-slate-700">
          <a href="#features" className="block hover:text-[#E05A00]" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block hover:text-[#E05A00]" onClick={() => setMobileOpen(false)}>Workflow</a>
          <a href="#dashboard" className="block hover:text-[#E05A00]" onClick={() => setMobileOpen(false)}>Live Data</a>
          <a href="#rules" className="block hover:text-[#E05A00]" onClick={() => setMobileOpen(false)}>Regulations</a>
          <button onClick={onLoginClick} className="block text-[#E05A00]">Sign In →</button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ onLoginClick }) {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-10 relative overflow-hidden" style={{ background: C.sand }}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50 pointer-events-none" style={{ background: "#C8D8E8" }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30 pointer-events-none" style={{ background: "#E05A0020" }} />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Left */}
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E4E6EC] text-xs font-bold uppercase tracking-widest shadow-sm mb-7 rounded-full" style={{ color: C.navy }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.amber }} />
            <Shield size={13} style={{ color: C.amber }} />
            Official LMPC Rules 2011 Standard
          </div>

          <h1 className="text-5xl lg:text-[4.75rem] font-serif font-black leading-[1.05] tracking-tight mb-8" style={{ color: C.navy }}>
            Upholding <br />
            <span style={{ color: C.amber }}>Transparency.</span><br />
            Protecting Consumers.
          </h1>

          <p className="text-base lg:text-lg text-slate-600 leading-relaxed font-medium max-w-xl mb-10 border-l-4 pl-6 py-2" style={{ borderColor: C.amber }}>
            AI-powered scanning &amp; OCR validation of packaged commodity labels. Ensure flawless compliance without the manual overhead.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-white font-bold text-sm uppercase tracking-wider rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-auto"
              style={{ background: C.amber }}
            >
              <Scan size={17} /> Ensure Compliance Now
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 font-bold text-sm uppercase tracking-wider rounded-full transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
              style={{ borderColor: C.navy, color: C.navy }}
              onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.navy; }}
            >
              See Workflow
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-xs font-bold uppercase tracking-widest" style={{ color: C.navy }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: C.amber }} /> 8/8 Declarations
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} style={{ color: C.amber }} /> &lt;2s Analysis
            </div>
            <div className="flex items-center gap-2">
              <Award size={18} style={{ color: C.amber }} /> DoCA Verified
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="absolute inset-0 translate-x-4 translate-y-4 shadow-2xl rounded" style={{ background: C.navy }} />
          <div className="relative bg-white p-4 border border-[#E4E6EC] shadow-xl rounded">
            <img
              src="/images/hero_scan.png"
              alt="LabelLens AI Scan"
              className="w-full h-auto object-cover contrast-110"
              style={{ filter: "grayscale(15%) contrast(1.1)" }}
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 flex justify-between items-center border border-[#E4E6EC] rounded">
              <div className="font-serif" style={{ color: C.navy }}>
                <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Target Result</div>
                <div className="text-lg font-black">AI Validation Complete</div>
              </div>
              <div className="text-white px-4 py-2 font-mono font-bold text-[10px] uppercase tracking-widest shadow-md rounded" style={{ background: C.navy }}>
                Status: Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Partner Strip ────────────────────────────────────────────────────────────
function PartnerStrip() {
  return (
    <div className="py-10 border-y relative overflow-hidden" style={{ background: `linear-gradient(to right, ${C.navyDark}, ${C.navy}, ${C.navyDark})`, borderColor: C.navyMid }}>
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: `linear-gradient(to right, transparent, ${C.amber}99, transparent)` }} />
      <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: `linear-gradient(to right, transparent, ${C.amber}44, transparent)` }} />
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] mb-8" style={{ color: C.textLight }}>Recognized by Leading Consumer Authorities</p>
        <div className="flex flex-wrap justify-center gap-12 lg:gap-24 items-center">
          {[
            { icon: Globe, label: "DoCA", sub: "Consumer Affairs" },
            { icon: Scale, label: "LMPC", sub: "Legal Metrology" },
            { icon: Building2, label: "SIH 2026", sub: "Innovator" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="group flex items-center gap-3 text-white opacity-70 hover:opacity-100 transition-all duration-300 hover:-translate-y-1 cursor-default">
              <div className="w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300" style={{ borderColor: `${C.amber}55` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.background = `${C.amber}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.amber}55`; e.currentTarget.style.background = "transparent"; }}>
                <Icon size={20} style={{ color: C.amber }} />
              </div>
              <span className="font-serif font-bold text-base tracking-wide leading-none">
                {label}<br /><span className="text-[10px] font-sans uppercase tracking-widest" style={{ color: C.textLight }}>{sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Scan, title: "AI-Precision Scanning", desc: "Computer vision instantly isolates label regions via camera streams or batch uploads in under 2 seconds." },
  { icon: FileSearch, title: "Mandatory OCR Detection", desc: "High-accuracy OCR extracts all 8 statutory packaging parameters—from MRP to manufacturing origins." },
  { icon: Eye, title: "Spatio-Typographic Checks", desc: "Font legibility assessed against Schedule II dimensions using coin-fiducial calibration techniques." },
  { icon: FileText, title: "Immutable Reports", desc: "Cryptographically sealed (SHA-256) compliance audits that stand ground in legal and official reviews." },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <div className="inline-block px-3 py-1 bg-[#F5F6F8] border border-[#E4E6EC] text-xs font-bold uppercase tracking-widest mb-6 rounded-full" style={{ color: C.navy }}>
            Core Mechanics
          </div>
          <h2 className="text-4xl font-serif font-black leading-tight mb-5 mt-2" style={{ color: C.navy }}>
            Engineered for <br />
            <span style={{ color: C.amber }}>Absolute Accuracy.</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed text-sm">
            A highly calibrated AI model designed explicitly for the stipulations of Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-7 border border-[#E4E6EC] bg-[#F5F6F8] hover:bg-white hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 rounded-2xl cursor-default"
            >
              <div
                className="w-11 h-11 flex items-center justify-center text-white mb-5 rounded-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                style={{ background: C.navy }}
                onMouseEnter={e => e.currentTarget.style.background = C.amber}
                onMouseLeave={e => e.currentTarget.style.background = C.navy}
              >
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-serif font-bold mb-2.5 transition-colors duration-300 group-hover:text-[#E05A00]" style={{ color: C.navy }}>{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Workflow Steps ───────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    step: "01",
    icon: Camera,
    title: "Capture / Upload",
    desc: "Submit a product image via live camera stream or direct batch upload. Accepts JPEG, PNG, and HEIC formats.",
    tag: "Input Layer",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Region Detection",
    desc: "Computer vision model isolates the label zone using object segmentation, removing noise & background clutter.",
    tag: "Vision Engine",
  },
  {
    step: "03",
    icon: ScanLine,
    title: "OCR Extraction",
    desc: "High-fidelity OCR reads all 8 mandatory declarations — MRP, net qty, date, manufacturer address, and more.",
    tag: "Text Engine",
  },
  {
    step: "04",
    icon: Scale,
    title: "Rule Validation",
    desc: "Each extracted field is verified against LMPC 2011 Rules 6(1), 6(2), and 6(10) — zero manual checks needed.",
    tag: "Compliance Core",
  },
  {
    step: "05",
    icon: FileBadge2,
    title: "Compliance Report",
    desc: "A SHA-256 sealed audit certificate is generated — pass or violation with exact rule citations for legal use.",
    tag: "Output Layer",
  },
];

function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-10 text-white relative overflow-hidden" style={{ background: C.navy }}>
      {/* background grid texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(${C.textLight} 1px, transparent 1px), linear-gradient(to right, ${C.textLight} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      {/* glow orbs */}
      <div className="absolute top-20 left-1/3 w-72 h-72 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: C.amber }} />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none" style={{ background: C.amber }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest mb-6" style={{ color: C.amber, background: `${C.amber}14` }}>
            <BadgeCheck size={13} /> End-to-End Process
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-black mb-5">
            How It <span style={{ color: C.amber }}>Works.</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto font-medium" style={{ color: C.textLight }}>
            Five precise steps from raw image to certified compliance verdict — fully automated, legally defensible.
          </p>
        </div>

        {/* Connector line (desktop) */}
        <div className="hidden lg:block relative mb-4">
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={{ background: `linear-gradient(to right, transparent, ${C.amber}55, ${C.amber}88, ${C.amber}55, transparent)` }} />
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {WORKFLOW_STEPS.map((s, i) => (
            <div
              key={i}
              className="relative flex flex-col items-start p-6 rounded-2xl border cursor-pointer transition-all duration-300"
              style={{
                background: activeStep === i ? `${C.amber}18` : `${C.navyMid}`,
                borderColor: activeStep === i ? C.amber : `${C.textLight}33`,
                transform: activeStep === i ? "translateY(-6px)" : "translateY(0)",
                boxShadow: activeStep === i ? `0 12px 40px ${C.amber}30` : "none",
              }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Step number badge */}
              <div className="text-[10px] font-mono font-black tracking-widest mb-4 px-2 py-0.5 rounded-full border" style={{ color: C.amber, borderColor: `${C.amber}55` }}>
                {s.step}
              </div>

              {/* Icon */}
              <div
                className="w-10 h-10 flex items-center justify-center rounded-lg mb-4 transition-all duration-300"
                style={{ background: activeStep === i ? C.amber : `${C.amber}22`, color: activeStep === i ? "#fff" : C.amber }}
              >
                <s.icon size={20} />
              </div>

              {/* Tag */}
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: C.textLight }}>
                {s.tag}
              </span>

              {/* Title */}
              <h3 className="text-base font-serif font-bold mb-2 leading-snug" style={{ color: activeStep === i ? "#fff" : "#CBD5E1" }}>
                {s.title}
              </h3>

              {/* Desc */}
              <p className="text-xs leading-relaxed" style={{ color: C.textLight }}>
                {s.desc}
              </p>

              {/* Active arrow */}
              {activeStep === i && i < WORKFLOW_STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight size={20} style={{ color: C.amber }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom stat bar */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-px border rounded-2xl overflow-hidden" style={{ borderColor: `${C.textLight}22`, background: `${C.textLight}22` }}>
          {[
            { val: "<2s", label: "End-to-End Processing" },
            { val: "99.4%", label: "OCR Field Accuracy" },
            { val: "8/8", label: "Mandatory Fields Checked" },
          ].map(({ val, label }) => (
            <div key={label} className="flex flex-col items-center justify-center py-8 px-4 text-center" style={{ background: C.navyMid }}>
              <div className="text-3xl font-serif font-black mb-1" style={{ color: C.amber }}>{val}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textLight }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview ────────────────────────────────────────────────────────
const SCANNED_PRODUCTS = [
  { name: "Tropicana Orange Juice 1L", brand: "PepsiCo", status: "COMPLIANT", date: "19 Sep 2026" },
  { name: "Maggi 2-Minute Noodles 70g", brand: "Nestlé", status: "VIOLATION", date: "19 Sep 2026" },
  { name: "Amul Butter 100g", brand: "GCMMF", status: "COMPLIANT", date: "18 Sep 2026" },
  { name: "Haldiram's Aloo Bhujia 200g", brand: "Haldiram's", status: "REVIEW", date: "18 Sep 2026" },
];

function DashboardPreview({ onLoginClick }) {
  return (
    <section id="dashboard" className="py-24 bg-white px-4 sm:px-6 lg:px-10 border-b border-[#E4E6EC]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-block px-3 py-1 bg-[#F5F6F8] border border-[#E4E6EC] text-xs font-bold uppercase tracking-widest mb-6 rounded-full" style={{ color: C.navy }}>
              Live Telemetry
            </div>
            <h2 className="text-4xl font-serif font-black mb-5" style={{ color: C.navy }}>
              Command &amp; Control <br /> <span style={{ color: C.amber }}>At a Glance.</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              Unparalleled oversight of systemic compliance metrics. Track violations, review pending audits, and dissect regional trends in real-time.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div
                className="p-5 border-l-4 rounded-r-xl group cursor-default transition-all duration-300 hover:shadow-lg hover:bg-white"
                style={{ borderColor: C.navy, background: C.sand }}
              >
                <div className="text-3xl font-black font-serif transition-transform duration-300 group-hover:scale-105 inline-block" style={{ color: C.navy }}>1,247</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total Scans</div>
              </div>
              <div
                className="p-5 border-l-4 rounded-r-xl group cursor-default transition-all duration-300 hover:shadow-lg hover:bg-white"
                style={{ borderColor: C.amber, background: "#FFF4EE" }}
              >
                <div className="text-3xl font-black font-serif transition-transform duration-300 group-hover:scale-105 inline-block" style={{ color: C.amber }}>183</div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: C.amber }}>Violations</div>
              </div>
            </div>
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-xs border-b-2 border-transparent hover:border-current transition-all"
              style={{ color: C.navy }}
              onMouseEnter={e => { e.currentTarget.style.color = C.amber; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.navy; }}
            >
              Access Telemetry <ArrowRight size={15} />
            </button>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="border border-[#E4E6EC] p-6 shadow-xl rounded-2xl" style={{ background: C.sand }}>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E4E6EC]">
                <h3 className="font-serif font-bold uppercase tracking-wide text-sm" style={{ color: C.navy }}>Live Inspection Logs</h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.amber }} />
                  <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: C.amber }} />
                </span>
              </div>
              <div className="space-y-2.5">
                {SCANNED_PRODUCTS.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white border border-[#E4E6EC] rounded-xl transition-all duration-200 group cursor-default hover:shadow-md"
                    style={{}}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.background = "#F5F6F8"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E4E6EC"; e.currentTarget.style.background = "white"; }}
                  >
                    <div>
                      <div className="font-bold text-sm transition-colors duration-200" style={{ color: C.navy }}
                        onMouseEnter={e => e.currentTarget.style.color = C.amber}
                        onMouseLeave={e => e.currentTarget.style.color = C.navy}
                      >{p.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.brand} · {p.date}</div>
                    </div>
                    <div>
                      {p.status === "COMPLIANT" && <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full tracking-widest">✓ Pass</span>}
                      {p.status === "VIOLATION" && <span className="text-[10px] font-bold px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full tracking-widest">✗ Fail</span>}
                      {p.status === "REVIEW" && <span className="text-[10px] font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full tracking-widest">⚠ Review</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Rules ────────────────────────────────────────────────────────────────────
const RULES_DATA = [
  { rule: "Rule 6(1)", title: "Mandatory Declarations", desc: "Every package must bear commodity name, net quantity, MRP, date of manufacture, and manufacturer address." },
  { rule: "Rule 6(2)", title: "Minimum Font Height", desc: "Declarations must meet Schedule II font size thresholds based on net quantity of the package." },
  { rule: "Rule 6(10)", title: "E-Commerce Compliance", desc: "Digital listings must display all mandatory declarations without requiring any scrolling by the buyer." },
];

function RuleValidationSection() {
  return (
    <section id="rules" className="py-24 px-4 sm:px-6 lg:px-10" style={{ background: C.sand }}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="inline-block px-3 py-1 bg-white border border-[#E4E6EC] text-xs font-bold uppercase tracking-widest mb-6 rounded-full" style={{ color: C.navy }}>
          Statutory Framework
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-black mb-5 text-center" style={{ color: C.navy }}>
          Strict Adherence to <span style={{ color: C.amber }}>LMPC 2011</span>.
        </h2>
        <p className="text-center text-slate-500 max-w-2xl font-medium mb-16 text-sm leading-relaxed">
          No vague estimations. We digitize the statutory rulebook and evaluate packaging solely on established legal metrics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {RULES_DATA.map((r, i) => (
            <div
              key={i}
              className="bg-white p-8 border-t-4 shadow-sm group cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-b-2xl"
              style={{ borderColor: C.navy }}
            >
              <div className="font-mono font-bold text-xs tracking-widest uppercase mb-4" style={{ color: C.amber }}>{r.rule}</div>
              <h3 className="text-lg font-serif font-bold mb-3 group-hover:text-[#E05A00] transition-colors duration-300" style={{ color: C.navy }}>{r.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onLoginClick }) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-10 relative overflow-hidden" style={{ background: C.navy }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${C.textLight} 0, ${C.textLight} 1px, transparent 0, transparent 50%)`,
        backgroundSize: "20px 20px",
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ background: C.amber }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Scale size={44} className="mx-auto mb-8" style={{ color: C.amber }} />
        <h2 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight mb-5">
          The New Standard in <br /> Legal Metrology.
        </h2>
        <p className="text-sm max-w-xl mx-auto font-medium mb-12" style={{ color: C.textLight }}>
          Purpose-built for DoCA officials and citizen reporters. Start your first scan in under 60 seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <button
            onClick={onLoginClick}
            className="px-10 py-4 rounded-full text-white font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ background: C.amber }}
          >
            Authenticate Portal
          </button>
          <a
            href="#how-it-works"
            className="px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest border transition-all duration-300 hover:scale-105"
            style={{ borderColor: `${C.textLight}55`, color: C.textLight }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "white"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.textLight}55`; e.currentTarget.style.color = C.textLight; }}
          >
            View Workflow
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="py-10 px-4 sm:px-6 lg:px-10" style={{ background: C.navyDark, color: C.textLight }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <LogoMark size={30} color={C.amber} />
          <span className="text-lg font-serif font-bold text-white tracking-wide">LabelLens</span>
        </div>
        <div className="text-[10px] font-mono tracking-widest uppercase text-center leading-relaxed">
          SIH 2026 Initiative <span style={{ color: C.amber }}>|</span> Ministry of Consumer Affairs <span style={{ color: C.amber }}>|</span> DoCA
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.amber }} />
          Systems Online
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
      <div className="relative font-sans h-screen w-full" style={{ background: C.navy }}>
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border text-xs font-bold uppercase tracking-widest transition-all"
          style={{ color: C.textLight, borderColor: C.textLight }}
          onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.textLight; e.currentTarget.style.borderColor = C.textLight; }}
        >
          ← Return to Portal
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
    <div className="w-full font-sans overflow-x-hidden" style={{ background: C.sand, selectionBackground: C.amber }}>
      <LandingNav onLoginClick={() => setShowLogin(true)} />
      <HeroSection onLoginClick={() => setShowLogin(true)} />
      <PartnerStrip />
      <FeaturesSection />
      <WorkflowSection />
      <DashboardPreview onLoginClick={() => setShowLogin(true)} />
      <RuleValidationSection />
      <FinalCTA onLoginClick={() => setShowLogin(true)} />
      <LandingFooter />
    </div>
  );
}
