import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, FileText, LayoutDashboard, Download, ShieldCheck, Sparkles, Smartphone, BarChart3, ArrowRight, Grid, MonitorPlay } from "lucide-react";

export const VIDEO_STEPS = [
    {
        id: 1,
        time: "00:00 - 00:02",
        seconds: 0,
        duration: 3,
        title: "1. Scan the product label",
        subtitle: "Position camera over Principal Display Panel",
        type: "scan",
        product: "Lay's Classic Salted Potato Chips",
        image: "/images/lays_scan.png",
        accent: "#3B82F6",
    },
    {
        id: 2,
        time: "00:03 - 00:05",
        seconds: 3,
        duration: 3,
        title: "2. AI detects and extracts label details",
        subtitle: "PaddleOCR + YOLOv8 neural network processing",
        type: "ai_detect",
        product: "Lay's Classic Salted",
        accent: "#6366F1",
    },
    {
        id: 3,
        time: "00:06 - 00:08",
        seconds: 6,
        duration: 3,
        title: "3. Extracted declarations from label",
        subtitle: "7 mandatory declarations parsed from PDP",
        type: "declarations",
        product: "Lay's Classic Salted",
        declarations: [
            { name: "Product Name", ok: true },
            { name: "Net Quantity", ok: true },
            { name: "MRP", ok: true },
            { name: "Mfg. Date", ok: true },
            { name: "Best Before", ok: true },
            { name: "FSSAI License No.", ok: true },
            { name: "Barcode", ok: true },
        ],
        accent: "#10B981",
    },
    {
        id: 4,
        time: "00:09 - 00:12",
        seconds: 9,
        duration: 4,
        title: "4. Validating with 2011 rules",
        subtitle: "Legal Metrology (Packaged Commodities) Rules, 2011",
        type: "validation",
        rules: [
            { code: "Rule 6", label: "Net Quantity" },
            { code: "Rule 7", label: "MRP Declaration" },
            { code: "Rule 10", label: "Manufacture/Pack Date" },
            { code: "Rule 11", label: "Best Before / Expiry" },
            { code: "Rule 12", label: "FSSAI License" },
            { code: "Rule 13", label: "Consumer Care Details" },
            { code: "Rule 8", label: "Font Size & Readability" },
        ],
        accent: "#3B82F6",
    },
    {
        id: 5,
        time: "00:13 - 00:15",
        seconds: 13,
        duration: 3,
        title: "5. Compliance result",
        subtitle: "Passes all statutory requirements under LMPC Rules",
        type: "result_pass",
        product: "Lay's Classic Salted",
        netQty: "52 g",
        mrp: "₹ 20.00",
        mfgDate: "03/2026",
        bestBefore: "09/2026",
        status: "Compliant",
        accent: "#10B981",
    },
    {
        id: 6,
        time: "00:16 - 00:19",
        seconds: 16,
        duration: 4,
        title: "6. Scanning another product",
        subtitle: "Testing dairy commodity packaging",
        type: "scan_second",
        product: "Amul Taaza Milk (200 ml)",
        image: "/images/amul_scan.png",
        accent: "#F59E0B",
    },
    {
        id: 7,
        time: "00:20 - 00:24",
        seconds: 20,
        duration: 5,
        title: "7. Violation detected",
        subtitle: "Non-compliance flagged automatically",
        type: "result_fail",
        product: "Amul Taaza Milk (200 ml)",
        violations: [
            "Font size of MRP is smaller than required (Rule 8)",
            "Missing consumer care details (Rule 13)",
            "Improper placement of FSSAI logo (Rule 12)",
        ],
        status: "Non-Compliant",
        accent: "#EF4444",
    },
    {
        id: 8,
        time: "00:25 - 00:27",
        seconds: 25,
        duration: 3,
        title: "8. Auto-generated notice (if illegal)",
        subtitle: "Statutory Show Cause Notice under Sec 39",
        type: "notice",
        target: "The Manufacturer / Packer / Importer",
        subject: "Non-compliance with Legal Metrology (Packaged Commodities) Rules, 2011",
        product: "Amul Taaza Milk, 200 ml",
        accent: "#DC2626",
    },
    {
        id: 9,
        time: "00:28 - 00:30",
        seconds: 28,
        duration: 3,
        title: "9. Dashboard for monitoring",
        subtitle: "Real-time compliance intelligence & trends",
        type: "dashboard",
        totalScans: 248,
        compliantCount: 193,
        nonCompliantCount: 55,
        accent: "#6366F1",
    },
    {
        id: 10,
        time: "00:31 - 00:33",
        seconds: 31,
        duration: 3,
        title: "10. Access past scans & reports",
        subtitle: "Searchable audit trail & repository",
        type: "repository",
        items: [
            { name: "Lay's Classic Salted", brand: "Lay's", status: "Compliant", date: "18-09-2026" },
            { name: "Amul Taaza Milk", brand: "Amul", status: "Non-Compliant", date: "18-09-2026" },
            { name: "Maggi 2-Minute Noodles", brand: "Nestle", status: "Compliant", date: "16-09-2026" },
            { name: "Dabur Honey", brand: "Dabur", status: "Compliant", date: "07-09-2026" },
        ],
        accent: "#8B5CF6",
    },
    {
        id: 11,
        time: "00:34 - 00:36",
        seconds: 34,
        duration: 3,
        title: "11. Generate digital report (PDF / Excel)",
        subtitle: "Courtroom-grade legally enforceable evidence",
        type: "report",
        reportId: "LMPC-2026-00123",
        product: "Lay's Classic Salted",
        accent: "#3B82F6",
    },
    {
        id: 12,
        time: "00:37 - 00:40",
        seconds: 37,
        duration: 4,
        title: "12. End frame",
        subtitle: "Smart Scanning. Stronger Compliance.",
        type: "end_frame",
        tagline: "Safer Products | Fair Trade | Informed Consumers",
        accent: "#C9A15A",
    },
];

export default function WorkflowVideoPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [viewMode, setViewMode] = useState("video"); // "video" | "grid"
    const [progress, setProgress] = useState(0); // 0 to 40 seconds
    const [isMuted, setIsMuted] = useState(true);
    const intervalRef = useRef(null);

    const currentStep = VIDEO_STEPS[currentStepIdx];
    const totalDuration = 40;

    // Auto-advance video progress
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + 0.2;
                    if (next >= totalDuration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    // Update current step index based on progress seconds
                    const foundIdx = VIDEO_STEPS.findIndex((step, idx) => {
                        const nextStep = VIDEO_STEPS[idx + 1];
                        return prev >= step.seconds && (!nextStep || prev < nextStep.seconds);
                    });
                    if (foundIdx !== -1 && foundIdx !== currentStepIdx) {
                        setCurrentStepIdx(foundIdx);
                    }
                    return next;
                });
            }, 200);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, currentStepIdx]);

    const handleStepSelect = (idx) => {
        setCurrentStepIdx(idx);
        setProgress(VIDEO_STEPS[idx].seconds);
    };

    const handleTogglePlay = () => {
        if (progress >= totalDuration) setProgress(0);
        setIsPlaying(!isPlaying);
    };

    const handleRestart = () => {
        setProgress(0);
        setCurrentStepIdx(0);
        setIsPlaying(true);
    };

    const formatSec = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full bg-[#0a0b16] border border-panel-line rounded-2xl overflow-hidden shadow-2xl text-text-1">
            {/* Top Header Controls */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#121429] border-b border-panel-line flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brass/20 border border-brass/40 flex items-center justify-center text-brass font-bold">
                        <MonitorPlay size={18} />
                    </div>
                    <div>
                        <h3 className="font-serif text-base sm:text-lg font-semibold text-text-1 flex items-center gap-2">
                            <span>LabelLens Automated Inspection Flow</span>
                            <span className="text-[10px] font-mono bg-brass/15 text-brass px-2 py-0.5 rounded border border-brass/30">
                                12-Step Video Storyboard
                            </span>
                        </h3>
                        <p className="text-xs text-text-3 font-mono">00:00 - 00:40 • Legal Metrology (Packaged Commodities) Rules, 2011</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode("video")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "video" ? "bg-brass text-brass-ink shadow" : "bg-panel-darker text-text-2 hover:bg-panel-line"
                            }`}
                    >
                        <Play size={13} />
                        <span>Interactive Video</span>
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "grid" ? "bg-brass text-brass-ink shadow" : "bg-panel-darker text-text-2 hover:bg-panel-line"
                            }`}
                    >
                        <Grid size={13} />
                        <span>12-Frame Grid View</span>
                    </button>
                </div>
            </div>

            {viewMode === "video" ? (
                <div className="flex flex-col">
                    {/* Main Simulated Video Screen */}
                    <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-gradient-to-br from-[#0c0d1e] via-[#151733] to-[#090a15] overflow-hidden flex items-center justify-center p-4 sm:p-8">
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2347_1px,transparent_1px),linear-gradient(to_bottom,#1f2347_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />

                        {/* Time badge on top-left of video screen */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <span className="bg-black/70 backdrop-blur border border-white/10 text-brass text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                                {currentStep.time}
                            </span>
                            <span className="bg-brass/20 text-brass text-[11px] font-mono px-2 py-1 rounded-md border border-brass/40">
                                Step {currentStep.id} of 12
                            </span>
                        </div>

                        {/* Title badge on top-right */}
                        <div className="absolute top-4 right-4 z-20 font-mono text-xs text-text-2 bg-black/60 backdrop-blur px-3 py-1 rounded-md border border-white/10 hidden sm:block">
                            {currentStep.title}
                        </div>

                        {/* DYNAMIC FRAME CONTENT BASED ON CURRENT STEP */}
                        <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center h-full">
                            {/* FRAME 1 & 6: SCANNING PRODUCT */}
                            {(currentStep.type === "scan" || currentStep.type === "scan_second") && (
                                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left animate-fadeIn">
                                    <div className="relative w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-brass/40 group">
                                        <img src={currentStep.image} alt={currentStep.product} className="w-full h-full object-cover" />
                                        {/* Reticle */}
                                        <div className="absolute inset-4 border-2 border-cyan-400/80 rounded-lg pointer-events-none animate-pulse">
                                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                                            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brass/20 border border-brass/40 text-brass text-xs font-mono">
                                            <Smartphone size={14} />
                                            <span>Camera Stream Active</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">{currentStep.product}</h2>
                                        <p className="text-sm text-text-2 max-w-md">{currentStep.subtitle}</p>
                                    </div>
                                </div>
                            )}

                            {/* FRAME 2: AI DETECTS */}
                            {currentStep.type === "ai_detect" && (
                                <div className="text-center space-y-6 animate-fadeIn">
                                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.6)] flex items-center justify-center">
                                            <Sparkles size={40} className="text-white animate-spin" style={{ animationDuration: "8s" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">LabelLens AI Processing</h2>
                                        <p className="text-sm font-mono text-blue-300 mt-2">AI detects and extracts label details from photo...</p>
                                    </div>
                                </div>
                            )}

                            {/* FRAME 3: EXTRACTED DECLARATIONS */}
                            {currentStep.type === "declarations" && (
                                <div className="w-full max-w-md bg-[#12142d] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl animate-fadeIn">
                                    <div className="flex items-center justify-between pb-3 border-b border-panel-line mb-3">
                                        <h3 className="font-semibold text-emerald-400 flex items-center gap-2 text-sm sm:text-base">
                                            <CheckCircle2 size={18} />
                                            <span>Extracted Declarations from Label</span>
                                        </h3>
                                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">7 / 7 Extracted</span>
                                    </div>
                                    <div className="space-y-2">
                                        {currentStep.declarations.map((d, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs bg-[#1a1d3d] p-2 rounded border border-white/5">
                                                <span className="text-text-1 font-medium">{d.name}</span>
                                                <span className="text-emerald-400 font-mono flex items-center gap-1">✓ Detected</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FRAME 4: VALIDATING RULES */}
                            {currentStep.type === "validation" && (
                                <div className="w-full max-w-lg bg-[#11132a] border border-blue-500/40 rounded-2xl p-5 shadow-2xl animate-fadeIn">
                                    <h3 className="font-serif font-bold text-lg text-blue-300 mb-1">Checking with Legal Metrology</h3>
                                    <p className="text-xs text-text-3 font-mono mb-4">(Packaged Commodities) Rules, 2011</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {currentStep.rules.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 rounded bg-[#181a38] border border-blue-500/20">
                                                <CheckCircle2 size={14} className="text-emerald-400 flex-none" />
                                                <span className="text-text-1">{r.label}</span>
                                                <span className="ml-auto text-[10px] font-mono text-blue-400">({r.code})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FRAME 5: COMPLIANT RESULT */}
                            {currentStep.type === "result_pass" && (
                                <div className="w-full max-w-md bg-[#0f231c] border-2 border-emerald-500/60 rounded-2xl p-6 shadow-2xl animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-emerald-400">Compliant</h3>
                                            <p className="text-xs text-emerald-200/80">Meets all Legal Metrology Rules, 2011</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#142e25] p-4 rounded-xl border border-emerald-500/30 text-xs space-y-2">
                                        <div className="font-bold text-sm text-white">{currentStep.product}</div>
                                        <div className="flex justify-between text-text-2"><span>Net Quantity:</span><span className="font-mono text-white">{currentStep.netQty}</span></div>
                                        <div className="flex justify-between text-text-2"><span>MRP:</span><span className="font-mono text-white">{currentStep.mrp}</span></div>
                                        <div className="flex justify-between text-text-2"><span>Mfg. Date:</span><span className="font-mono text-white">{currentStep.mfgDate}</span></div>
                                        <div className="flex justify-between text-text-2"><span>Best Before:</span><span className="font-mono text-white">{currentStep.bestBefore}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* FRAME 7: NON-COMPLIANT VIOLATION */}
                            {currentStep.type === "result_fail" && (
                                <div className="w-full max-w-md bg-[#291012] border-2 border-red-500/60 rounded-2xl p-6 shadow-2xl animate-fadeIn">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400">
                                            <AlertTriangle size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-red-400">Non-Compliant</h3>
                                            <p className="text-xs text-red-200/80">Violations detected under LMPC Rules 2011</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#381518] p-4 rounded-xl border border-red-500/30 text-xs space-y-2">
                                        <div className="font-bold text-sm text-white">{currentStep.product}</div>
                                        {currentStep.violations.map((v, i) => (
                                            <div key={i} className="flex items-start gap-2 text-red-300 text-[11.5px]">
                                                <span className="w-4 h-4 rounded-full bg-red-500/30 text-red-400 flex items-center justify-center font-bold text-[10px] flex-none">✕</span>
                                                <span>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FRAME 8: AUTO-GENERATED NOTICE */}
                            {currentStep.type === "notice" && (
                                <div className="w-full max-w-lg bg-white text-slate-900 rounded-xl p-5 shadow-2xl border-t-4 border-red-600 font-serif animate-fadeIn">
                                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                                        <span className="font-bold text-red-700 uppercase tracking-wider text-xs">Statutory Show Cause Notice</span>
                                        <span className="text-[10px] font-mono text-slate-500">Sec 39 • LMPC Act</span>
                                    </div>
                                    <div className="text-xs space-y-2 leading-relaxed">
                                        <p><strong>To:</strong> {currentStep.target}</p>
                                        <p><strong>Subject:</strong> {currentStep.subject}</p>
                                        <p className="text-slate-600 italic">It has been observed that the commodity package <strong>({currentStep.product})</strong> violates Rule 8, Rule 13, and Rule 12.</p>
                                        <div className="p-2 bg-red-50 text-red-800 rounded border border-red-200 font-sans text-[11px] font-semibold text-center">
                                            Directing show cause within 7 days from the date of this notice.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FRAME 9: DASHBOARD */}
                            {currentStep.type === "dashboard" && (
                                <div className="w-full max-w-xl bg-[#111328] border border-panel-line rounded-2xl p-5 shadow-2xl animate-fadeIn">
                                    <div className="flex items-center justify-between pb-3 border-b border-panel-line mb-4">
                                        <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                                            <LayoutDashboard size={18} className="text-blue-400" />
                                            <span>LabelLens Inspection Dashboard</span>
                                        </h3>
                                        <span className="text-xs font-mono text-blue-400">Live Telemetry</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                                        <div className="bg-[#191c3d] p-3 rounded-xl border border-panel-line">
                                            <div className="text-2xl font-bold font-mono text-white">{currentStep.totalScans}</div>
                                            <div className="text-[10px] text-text-3">Total Scans</div>
                                        </div>
                                        <div className="bg-[#142e25] p-3 rounded-xl border border-emerald-500/30">
                                            <div className="text-2xl font-bold font-mono text-emerald-400">{currentStep.compliantCount}</div>
                                            <div className="text-[10px] text-emerald-300">Compliant (77.8%)</div>
                                        </div>
                                        <div className="bg-[#381518] p-3 rounded-xl border border-red-500/30">
                                            <div className="text-2xl font-bold font-mono text-red-400">{currentStep.nonCompliantCount}</div>
                                            <div className="text-[10px] text-red-300">Violations (22.2%)</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FRAME 10: REPOSITORY */}
                            {currentStep.type === "repository" && (
                                <div className="w-full max-w-lg bg-[#111328] border border-panel-line rounded-2xl p-4 shadow-2xl animate-fadeIn">
                                    <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
                                        <BarChart3 size={16} className="text-purple-400" />
                                        <span>Past Scans &amp; Audit Trail</span>
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        {currentStep.items.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-2.5 rounded bg-[#181b3b] border border-panel-line">
                                                <div>
                                                    <div className="font-semibold text-white">{item.name}</div>
                                                    <div className="text-[10px] text-text-3">{item.brand} • {item.date}</div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${item.status === "Compliant" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FRAME 11: DIGITAL REPORT */}
                            {currentStep.type === "report" && (
                                <div className="w-full max-w-md bg-[#131735] border border-blue-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-fadeIn">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-400">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-white">Compliance Report</h3>
                                        <p className="text-xs font-mono text-blue-300 mt-1">ID: {currentStep.reportId}</p>
                                        <p className="text-xs text-text-2 mt-1">Product: {currentStep.product}</p>
                                    </div>
                                    <div className="flex gap-3 justify-center pt-2">
                                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow">
                                            <Download size={14} /> Download PDF
                                        </button>
                                        <button className="bg-panel-line hover:bg-panel-raised text-text-1 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 border border-white/10">
                                            <Download size={14} /> Download Excel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* FRAME 12: END FRAME */}
                            {currentStep.type === "end_frame" && (
                                <div className="text-center space-y-5 animate-fadeIn">
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-brass via-brass-strong to-[#B97B33] border-2 border-brass-ink/40 shadow-[0_0_50px_rgba(201,161,90,0.5)] flex items-center justify-center text-brass-ink font-bold text-2xl">
                                        <ShieldCheck size={44} />
                                    </div>
                                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">LabelLens</h1>
                                    <p className="text-sm font-mono text-brass max-w-md mx-auto">{currentStep.tagline}</p>
                                    <p className="text-xs text-text-3 font-mono">Smart Scanning. Stronger Compliance.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Timeline & Controls Bar */}
                    <div className="bg-[#0e0f21] border-t border-panel-line p-4 space-y-3">
                        {/* Scrubber Progress Bar */}
                        <div className="space-y-1">
                            <input
                                type="range"
                                min="0"
                                max={totalDuration}
                                step="0.1"
                                value={progress}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setProgress(val);
                                    const foundIdx = VIDEO_STEPS.findIndex((s, i) => {
                                        const next = VIDEO_STEPS[i + 1];
                                        return val >= s.seconds && (!next || val < next.seconds);
                                    });
                                    if (foundIdx !== -1) setCurrentStepIdx(foundIdx);
                                }}
                                className="w-full accent-brass cursor-pointer h-1.5 bg-panel-darker rounded-lg"
                            />
                            <div className="flex justify-between text-[11px] font-mono text-text-3">
                                <span>{formatSec(progress)}</span>
                                <span className="text-brass font-bold">{currentStep.title}</span>
                                <span>{formatSec(totalDuration)}</span>
                            </div>
                        </div>

                        {/* Playback Controls & Step Selector Buttons */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleTogglePlay}
                                    className="w-10 h-10 rounded-full bg-brass hover:bg-brass-strong text-brass-ink flex items-center justify-center shadow transition-all active:scale-95"
                                    title={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="w-8 h-8 rounded-full bg-panel-darker hover:bg-panel-line text-text-2 flex items-center justify-center transition-all"
                                    title="Restart Video"
                                >
                                    <RotateCcw size={14} />
                                </button>
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="w-8 h-8 rounded-full bg-panel-darker hover:bg-panel-line text-text-2 flex items-center justify-center transition-all"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                </button>
                            </div>

                            {/* Step Navigation Dots / Buttons */}
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                                {VIDEO_STEPS.map((s, idx) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleStepSelect(idx)}
                                        className={`px-2 py-1 rounded text-[10px] font-mono transition-all flex-none ${currentStepIdx === idx
                                                ? "bg-brass text-brass-ink font-bold shadow"
                                                : "bg-panel-darker text-text-3 hover:text-text-1 hover:bg-panel-line"
                                            }`}
                                    >
                                        {s.id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* GRID STORYBOARD VIEW (Matching Image 2 Frame Grid Exactly!) */
                <div className="p-4 sm:p-6 bg-[#0a0b16]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {VIDEO_STEPS.map((step, idx) => (
                            <div
                                key={step.id}
                                onClick={() => {
                                    handleStepSelect(idx);
                                    setViewMode("video");
                                }}
                                className="bg-[#12142d] border border-panel-line hover:border-brass rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-md group flex flex-col justify-between"
                            >
                                {/* Frame Header */}
                                <div className="bg-[#181b3d] px-3 py-1.5 border-b border-panel-line flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-brass font-bold">{step.time}</span>
                                    <span className="text-text-3">Frame {step.id}</span>
                                </div>

                                {/* Frame Body */}
                                <div className="p-4 space-y-2 min-h-[140px] flex flex-col justify-center">
                                    <div className="text-xs font-semibold text-white group-hover:text-brass transition-colors line-clamp-2">
                                        {step.title}
                                    </div>
                                    <p className="text-[11px] text-text-3 line-clamp-2">{step.subtitle}</p>

                                    {step.status && (
                                        <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded font-bold w-fit ${step.status === "Compliant" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                            }`}>
                                            {step.status}
                                        </span>
                                    )}
                                </div>

                                {/* Frame Foot */}
                                <div className="bg-[#0d0e21] px-3 py-1.5 border-t border-panel-line/60 flex items-center justify-between text-[10px] font-mono text-text-3">
                                    <span>Click to play</span>
                                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform text-brass" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <img
                            src="/images/workflow_storyboard.jpg"
                            alt="LabelLens 12-Step Inspection Workflow Storyboard"
                            className="max-w-4xl w-full mx-auto rounded-xl border border-panel-line shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
