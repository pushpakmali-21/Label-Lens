import React, { useState } from "react";
import {
  Scan, FileText, ShieldCheck, BarChart3, CheckCircle2,
  ArrowRight, ChevronRight, Scale, Zap, Eye, AlertTriangle,
  Clock, Database, FileSearch, Settings2, Star, TrendingUp,
  Package, ClipboardList, Search, BookOpen, Building2, User,
  KeyRound, X, Menu, Shield, Globe, Award
} from "lucide-react";
import LogoMark from "./LogoMark";
import Login from "./Login";
import WorkflowVideoPlayer from "./WorkflowVideoPlayer";

// ─── Shared Theme Colors ────────────────────────────────────────────────────
// Using an editorial, official government aesthetic (Emerald, Sand, Terracotta)
const THEME = {
  primary: "bg-[#112F25]", // Deep Emerald
  primaryText: "text-[#112F25]",
  accent: "bg-[#C44900]", // Terracotta 
  accentHover: "hover:bg-[#A33B00]",
  accentText: "text-[#C44900]",
  sand: "bg-[#F7F6F2]",
  sandBorder: "border-[#E8E6DF]",
};

// ─── Nav ────────────────────────────────────────────────────────────────────
function LandingNav({ onLoginClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F6F2]/90 backdrop-blur-lg border-b border-[#E8E6DF] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark size={38} color="#112F25" />
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black tracking-tight text-[#112F25] leading-none">
              LabelLens
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#C44900] uppercase mt-0.5">
              Gov. Compliance Engine
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold tracking-wide text-slate-700 uppercase">
          <a href="#features" className={`hover:${THEME.accentText} transition-colors`}>Features</a>
          <a href="#how-it-works" className={`hover:${THEME.accentText} transition-colors`}>Workflow</a>
          <a href="#dashboard" className={`hover:${THEME.accentText} transition-colors`}>Live Data</a>
          <a href="#rules" className={`hover:${THEME.accentText} transition-colors`}>Regulations</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="hidden sm:inline-flex items-center font-bold text-slate-800 hover:text-[#C44900] transition-colors uppercase text-sm tracking-wide"
          >
            Sign In
          </button>
          <button
            onClick={onLoginClick}
            className={`inline-flex items-center gap-2 px-6 py-3 ${THEME.accent} ${THEME.accentHover} text-white text-sm font-bold tracking-wide uppercase shadow-lg shadow-[#C44900]/30 transition-all`}
          >
            <Scan size={16} />
            <span>Initiate Scan</span>
          </button>
          <button
            className="md:hidden p-2 text-slate-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E6DF] bg-[#F7F6F2] px-6 py-6 space-y-5 text-sm font-bold uppercase tracking-wide text-slate-800">
          <a href="#features" className="block hover:text-[#C44900]" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block hover:text-[#C44900]" onClick={() => setMobileOpen(false)}>Workflow</a>
          <a href="#dashboard" className="block hover:text-[#C44900]" onClick={() => setMobileOpen(false)}>Live Data</a>
          <a href="#rules" className="block hover:text-[#C44900]" onClick={() => setMobileOpen(false)}>Regulations</a>
          <button onClick={onLoginClick} className="block text-[#C44900]">Sign In →</button>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function HeroSection({ onLoginClick }) {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-10 bg-[#F7F6F2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E5E0D5] rounded-full blur-[100px] opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">

        {/* Left Content */}
        <div className="flex-1 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E6DF] text-[#112F25] text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
            <Shield size={14} className="text-[#C44900]" />
            Official LMPC Rules 2011 Standard
          </div>

          <h1 className="text-5xl lg:text-[4.5rem] font-serif font-black text-[#112F25] leading-[1.05] tracking-tight mb-8">
            Upholding <br />
            <span className="text-[#C44900]">Transparency.</span><br />
            Protecting Consumers.
          </h1>

          <p className="text-lg lg:text-xl text-slate-700 leading-relaxed font-medium max-w-xl mb-10 border-l-4 border-[#C44900] pl-6 py-2">
            AI-powered scanning & OCR validation of packaged commodity labels. Ensure flawless compliance without the manual overhead. Integrity in Every Package.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button
              onClick={onLoginClick}
              className={`inline-flex items-center justify-center gap-3 px-8 py-4 ${THEME.accent} ${THEME.accentHover} text-white font-bold text-sm uppercase tracking-wider rounded-none shadow-xl transition-all w-full sm:w-auto`}
            >
              <Scan size={18} /> Ensure Compliance Now
            </button>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-[#112F25] text-[#112F25] hover:bg-[#112F25] hover:text-white font-bold text-sm uppercase tracking-wider transition-all w-full sm:w-auto justify-center">
              Watch Demo
            </a>
          </div>

          <div className="mt-12 flex items-center gap-8 text-sm font-bold text-[#112F25] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-[#C44900]" /> 8/8 Declarations
            </div>
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-[#C44900]" /> &lt;2s Analysis
            </div>
            <div className="flex items-center gap-2">
              <Award size={20} className="text-[#C44900]" /> DoCA Verified
            </div>
          </div>
        </div>

        {/* Right Image/Visual */}
        <div className="flex-1 w-full max-w-2xl relative">
          <div className="absolute inset-0 bg-[#112F25] translate-x-4 translate-y-4 shadow-2xl"></div>
          <div className="relative bg-white p-4 border border-[#E8E6DF] shadow-xl">
            <img
              src="/images/hero_scan.png"
              alt="Professional scanning product with LabelLens AI"
              className="w-full h-auto object-cover grayscale-[20%] contrast-125"
            />
            {/* Overlay stats on image */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 flex justify-between items-center border border-[#E8E6DF]">
              <div className="font-serif text-[#112F25]">
                <div className="text-sm font-bold tracking-widest uppercase">Target Result</div>
                <div className="text-xl font-black">AI Validation Complete</div>
              </div>
              <div className="bg-[#112F25] text-white px-4 py-2 font-mono font-bold text-xs uppercase tracking-widest shadow-md">
                Status: Verified
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Partner Logos / Authorities ────────────────────────────────────────────
function PartnerStrip() {
  return (
    <div className="bg-[#112F25] py-8 border-y border-[#184234]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <p className="text-center text-[#7DA192] text-xs font-bold uppercase tracking-[0.2em] mb-6">Recognized by Leading Consumer Authorities</p>
        <div className="flex flex-wrap justify-center gap-12 lg:gap-24 items-center opacity-80">
          <div className="flex items-center gap-3 text-white">
            <Globe size={28} className="text-[#C44900]" />
            <span className="font-serif font-bold text-lg tracking-wide leading-none">DoCA<br /><span className="text-[10px] font-sans uppercase tracking-widest text-[#7DA192]">Consumer Affairs</span></span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <Scale size={28} className="text-[#C44900]" />
            <span className="font-serif font-bold text-lg tracking-wide leading-none">LMPC<br /><span className="text-[10px] font-sans uppercase tracking-widest text-[#7DA192]">Legal Metrology</span></span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <Building2 size={28} className="text-[#C44900]" />
            <span className="font-serif font-bold text-lg tracking-wide leading-none">SIH 2026<br /><span className="text-[10px] font-sans uppercase tracking-widest text-[#7DA192]">Innovator</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Features section ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Scan,
    title: "AI-Precision Scanning",
    desc: "Computer vision instantly isolates label regions, functioning effortlessly via camera streams or batch uploads in under 2 seconds.",
  },
  {
    icon: FileSearch,
    title: "Mandatory Detection",
    desc: "High-accuracy OCR extracts all 8 statutory packaging parameters—from MRP to manufacturing origins.",
  },
  {
    icon: Eye,
    title: "Spatio-Typographic Checks",
    desc: "We rigorously assess font legibility based on Schedule II dimensions utilizing coin-fiducial calibration techniques.",
  },
  {
    icon: FileText,
    title: "Immutable Reports",
    desc: "Produce cryptographically sealed (SHA-256) compliance audits that stand ground in legal and official reviews.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
        <div className="md:w-1/3">
          <div className="inline-block px-3 py-1 bg-[#F7F6F2] border border-[#E8E6DF] text-[#112F25] text-xs font-bold uppercase tracking-widest mb-6">
            Core Mechanics
          </div>
          <h2 className="text-4xl font-serif font-black text-[#112F25] leading-tight mb-6 mt-2">
            Engineered for <br /><span className="text-[#C44900]">Absolute Accuracy.</span>
          </h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            The foundation of LabelLens is a highly calibrated artificial intelligence model designed explicitly for the stipulations of Legal Metrology.
          </p>
        </div>

        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-8 border border-[#E8E6DF] bg-[#F7F6F2] hover:bg-white transition-colors group">
              <div className="w-12 h-12 flex items-center justify-center bg-[#112F25] text-white mb-6 group-hover:bg-[#C44900] transition-colors">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#112F25] mb-3">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Workflow Video Section ─────────────────────────────────────────────────
function VideoDemoSection() {
  return (
    <section id="how-it-works" className="py-24 bg-[#112F25] px-4 sm:px-6 lg:px-10 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-[#C44900] text-xs font-bold uppercase tracking-widest mb-6">
            Live Demonstration
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-black mb-6">
            The Platform <span className="text-[#C44900]">In Action.</span>
          </h2>
          <p className="text-lg text-[#7DA192] max-w-2xl mx-auto font-medium">
            Witness our AI seamlessly extract label parameters, enforce the 2011 mandates, and generate official violation notices autonomously.
          </p>
        </div>

        {/* Encase the video in a stylized frame */}
        <div className="relative p-2 bg-[#184234] border border-[#275948] mx-auto shadow-2xl">
          <WorkflowVideoPlayer />
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview ───────────────────────────────────────────────────────
const SCANNED_PRODUCTS = [
  { name: "Tropicana Orange Juice 1L", brand: "PepsiCo", status: "COMPLIANT", violations: 0, date: "19 Sep 2026" },
  { name: "Maggi 2-Minute Noodles 70g", brand: "Nestlé", status: "VIOLATION", violations: 2, date: "19 Sep 2026" },
  { name: "Amul Butter 100g", brand: "GCMMF", status: "COMPLIANT", violations: 0, date: "18 Sep 2026" },
  { name: "Haldiram's Aloo Bhujia 200g", brand: "Haldiram's", status: "REVIEW", violations: 1, date: "18 Sep 2026" },
];

function DashboardPreview({ onLoginClick }) {
  return (
    <section id="dashboard" className="py-24 bg-white px-4 sm:px-6 lg:px-10 border-b border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          <div className="lg:w-1/2">
            <h2 className="text-4xl font-serif font-black text-[#112F25] mb-6">
              Command & Control <br /> <span className="text-[#C44900]">At a Glance.</span>
            </h2>
            <p className="text-lg text-slate-600 font-medium mb-8">
              Gain unparalleled oversight over systemic compliance metrics. Track violations, review pending audits, and dissect regional compliance trends in real-time.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-[#F7F6F2] border-l-4 border-[#112F25]">
                <div className="text-3xl font-black text-[#112F25] font-serif">1,247</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Total Scans</div>
              </div>
              <div className="p-4 bg-[#F7F6F2] border-l-4 border-[#C44900]">
                <div className="text-3xl font-black text-[#C44900] font-serif">183</div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#C44900] mt-1">Violations</div>
              </div>
            </div>
            <button
              onClick={onLoginClick}
              className="inline-flex items-center gap-2 font-bold text-[#112F25] hover:text-[#C44900] transition-colors border-b-2 border-transparent hover:border-[#C44900] uppercase tracking-widest"
            >
              Access Telemetry <ArrowRight size={16} />
            </button>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-[#F7F6F2] border border-[#E8E6DF] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E6DF]">
                <h3 className="font-serif font-bold text-[#112F25] uppercase tracking-wide">Live Inspection Logs</h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C44900] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C44900]"></span>
                </span>
              </div>

              <div className="space-y-3">
                {SCANNED_PRODUCTS.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-white border border-[#E8E6DF] hover:border-[#112F25] transition-colors">
                    <div>
                      <div className="font-bold text-[#112F25] text-sm">{p.name}</div>
                      <div className="text-xs font-mono text-slate-500 mt-1">{p.brand} · {p.date}</div>
                    </div>
                    <div>
                      {p.status === "COMPLIANT" && <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-800 uppercase tracking-widest border border-green-200">Pass</span>}
                      {p.status === "VIOLATION" && <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-800 uppercase tracking-widest border border-red-200">Fail</span>}
                      {p.status === "REVIEW" && <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 uppercase tracking-widest border border-amber-200">Review</span>}
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

// ─── Rule Validation Section ─────────────────────────────────────────────────
const RULES_DATA = [
  { rule: "Rule 6(1)", title: "Mandatory Declarations", desc: "Every package shall bear the name of the commodity, net quantity, MRP, DO manufacture, and address." },
  { rule: "Rule 6(2)", title: "Minimum Font Height", desc: "Declarations printed in size not less than specified in Schedule II based on net quantity." },
  { rule: "Rule 6(10)", title: "E-Commerce Rules", desc: "Digital listings must display mandatory declarations visible without scrolling." },
];

function RuleValidationSection() {
  return (
    <section id="rules" className="py-24 bg-[#F7F6F2] px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-serif font-black text-[#112F25] mb-6 text-center">
          Strict Adherence to <span className="text-[#C44900]">LMPC 2011</span>.
        </h2>
        <p className="text-center text-slate-700 max-w-2xl font-medium mb-16 text-lg">
          No vague estimations. We digitize the statutory rulebook and evaluate packaging solely on established legal metrics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {RULES_DATA.map((r, i) => (
            <div key={i} className="bg-white p-8 border-t-4 border-[#112F25] shadow-sm hover:shadow-xl transition-shadow">
              <div className="text-[#C44900] font-mono font-bold text-sm tracking-widest uppercase mb-4">{r.rule}</div>
              <h3 className="text-xl font-serif font-bold text-[#112F25] mb-3">{r.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────
function FinalCTA({ onLoginClick }) {
  return (
    <section className="py-24 bg-[#112F25] px-4 sm:px-6 lg:px-10 relative">
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzExMkYyNSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')]"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Scale size={48} className="text-[#C44900] mx-auto mb-8" />
        <h2 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight mb-8">
          The New Standard in <br /> Legal Metrology.
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
          <button
            onClick={onLoginClick}
            className={`px-10 py-5 ${THEME.accent} ${THEME.accentHover} text-white font-bold text-sm uppercase tracking-widest transition-all`}
          >
            Authenticate Portal
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="bg-[#0A1A14] text-[#7DA192] py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <LogoMark size={32} color="#C44900" />
          <span className="text-xl font-serif font-bold text-white tracking-wide">
            LabelLens
          </span>
        </div>
        <div className="text-xs font-mono tracking-widest uppercase text-center md:text-left leading-relaxed">
          SIH 2026 Initiative <span className="text-[#C44900]">|</span> Ministry of Consumer Affairs <span className="text-[#C44900]">|</span> DoCA
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <span className="w-2 h-2 bg-[#C44900] animate-pulse rounded-full" /> Systems Online
        </div>
      </div>
    </footer>
  );
}

// ─── Root Export ─────────────────────────────────────────────────────────────
export default function LandingPage({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="relative font-sans h-screen w-full bg-[#112F25]">
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2 bg-transparent text-[#7DA192] hover:text-white border border-[#7DA192] hover:border-white text-xs font-bold uppercase tracking-widest transition-colors"
        >
          ← Return to Official Portal
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
    <div className="w-full bg-[#F7F6F2] font-sans overflow-x-hidden selection:bg-[#C44900] selection:text-white">
      <LandingNav onLoginClick={() => setShowLogin(true)} />
      <HeroSection onLoginClick={() => setShowLogin(true)} />
      <PartnerStrip />
      <FeaturesSection />
      <VideoDemoSection />
      <DashboardPreview onLoginClick={() => setShowLogin(true)} />
      <RuleValidationSection />
      <FinalCTA onLoginClick={() => setShowLogin(true)} />
      <LandingFooter />
    </div>
  );
}
