import React, { useState } from "react";
import { Camera, Search, MapPin, AlertTriangle, CheckCircle2, Scan, Database, Zap, SearchCode } from "lucide-react";

export default function CitizenScanner({ onReportSubmitted }) {
  const [scanState, setScanState] = useState("idle");
  const [reportState, setReportState] = useState("idle");

  const activeProduct = {
    name: "Cold-Pressed Orange Juice, 500ml",
    brand: "Freshline Beverages Pvt. Ltd.",
    violations: [
      { field: "Missing Manufacture Date", rule: "Rule 6(1)(a)", desc: "The packaging does not state when it was made or when it expires." },
      { field: "No Customer Care Info", rule: "Rule 6(1)(f)", desc: "No phone number or email is provided for complaints." }
    ]
  };

  const activeProductPass = {
    name: "Amul Taaza Milk, 1L",
    brand: "Gujarat Cooperative Milk Factory"
  };

  const activeProductCached = {
    name: "Britannia Good Day Cookies, 250g",
    brand: "Britannia Industries Ltd",
    cachedSince: "12 Oct 2025"
  };

  const handleScanFailDemo = () => {
    setScanState("barcode_scan");
    setTimeout(() => {
      setScanState("cache_check");
      setTimeout(() => {
        setScanState("ml_scan");
        setTimeout(() => {
          setScanState("fail");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleScanCacheDemo = () => {
    setScanState("barcode_scan");
    setTimeout(() => {
      setScanState("cache_check");
      setTimeout(() => {
        setScanState("cached");
      }, 1500);
    }, 1500);
  };

  const handleScanPassDemo = () => {
    setScanState("barcode_scan");
    setTimeout(() => {
      setScanState("cache_check");
      setTimeout(() => {
        setScanState("ml_scan");
        setTimeout(() => {
          setScanState("pass");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleReport = () => {
    setReportState("reporting");
    setTimeout(() => {
      setReportState("submitted");
      if (onReportSubmitted) {
        onReportSubmitted({
          id: `AUD-${Math.floor(Math.random() * 100) + 9000}`,
          timestamp: "Just now",
          platform: "Citizen Report (Mobile)",
          product: activeProduct.name,
          seller: activeProduct.brand,
          status: "violation",
          issue: activeProduct.violations.map(v => v.field).join(", "),
          citation: activeProduct.violations.map(v => v.rule).join(" & "),
          action: "Citizen Report - Pending Inspector Review",
          isCitizenReport: true,
        });
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans pb-20 animate-fadeIn">
      {/* App Bar removed as App.jsx manages header */}
      <div className="p-2 sm:p-4 space-y-6">
        {scanState === "idle" && (
          <div className="space-y-6 animate-slideUp">
            <div className="glass-panel text-center space-y-5 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brass/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-status-fail/20 rounded-full blur-3xl"></div>

              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-panel-raised to-panel-darker rounded-2xl flex items-center justify-center text-brass shadow-glass border border-panel-line animate-float mb-4 relative z-10">
                <Search size={32} className="drop-shadow-md" />
              </div>
              <h2 className="text-2xl font-serif text-text-1 font-semibold tracking-tight relative z-10">Verify any product</h2>
              <p className="text-sm text-text-2 leading-relaxed mb-8 relative z-10 opacity-90 font-light">
                Scan the label to instantly check if the MRP, manufacturing date, and weight are printed legally.
              </p>

              <button
                onClick={handleScanFailDemo}
                className="w-full relative z-10 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                <Camera size={22} />
                <span className="tracking-wide">Tap to Scan Label</span>
              </button>

              <button
                onClick={handleScanCacheDemo}
                className="w-full relative z-10 bg-gradient-to-r from-emerald-400 to-teal-500 text-brass-ink font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
              >
                <Zap size={22} className="fill-current" />
                <span className="tracking-wide">Scan Known Product</span>
              </button>

              <button
                onClick={handleScanPassDemo}
                className="w-full relative z-10 glass-panel-raised text-text-1 font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all duration-300"
              >
                <CheckCircle2 size={20} className="text-status-pass" />
                <span className="text-sm tracking-wide">Simulate Compliant Product</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-3 justify-center mt-6">
              <MapPin size={14} />
              <span>Location: Pune, Maharashtra (Auto-detected)</span>
            </div>
          </div>
        )}

        {scanState === "barcode_scan" && (
          <div className="glass-panel text-center space-y-6 p-10 animate-slideUp mt-8 relative overflow-hidden">
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-brass to-transparent top-0 left-0 animate-scanSweep"></div>
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 border-[3px] border-dashed border-brass rounded-2xl opacity-20"></div>
              <div className="absolute inset-0 border-[3px] border-brass rounded-2xl border-t-transparent border-b-transparent animate-spin-slow"></div>
              <Scan size={44} className="absolute inset-0 m-auto text-brass drop-shadow-[0_0_15px_rgba(229,184,105,0.6)]" />
            </div>
            <div className="space-y-2">
              <div className="text-xl font-serif text-brass tracking-wide drop-shadow-sm">Tier 1: Reading Barcode</div>
              <div className="text-sm font-mono text-text-2 opacity-80">Scanning product ID...</div>
            </div>
          </div>
        )}

        {scanState === "cache_check" && (
          <div className="glass-panel text-center space-y-6 p-10 animate-slideUp mt-8">
            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 border-[3px] border-dashed border-status-pass rounded-2xl opacity-20"></div>
              <div className="absolute inset-0 border-[3px] border-status-pass rounded-2xl border-l-transparent animate-spin-slow"></div>
              <Database size={40} className="absolute inset-0 m-auto text-status-pass drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="space-y-2">
              <div className="text-xl font-serif text-status-pass tracking-wide">Checking National Registry...</div>
              <div className="text-sm font-mono text-text-2 opacity-80">Comparing against 2.4M verified scans</div>
            </div>
          </div>
        )}

        {scanState === "ml_scan" && (
          <div className="glass-panel text-center space-y-6 p-10 animate-slideUp mt-8 relative overflow-hidden">
            <div className="absolute w-[150%] h-[150%] left-[-25%] top-[-25%] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,rgba(0,0,0,0)_50%)] animate-pulseGlow"></div>
            <div className="relative w-28 h-28 mx-auto z-10">
              <div className="absolute inset-0 border-[3px] border-dashed border-status-review rounded-2xl opacity-20"></div>
              <div className="absolute inset-0 border-[3px] border-status-review rounded-2xl border-t-transparent border-r-transparent animate-spin"></div>
              <Search size={40} className="absolute inset-0 m-auto text-status-review drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="text-xl font-serif text-status-review tracking-wide">Tier 2: Deep ML Analysis</div>
              <div className="text-sm font-mono text-text-2 opacity-80">YOLOv8 + PaddleOCR active — parsing label</div>
            </div>
          </div>
        )}

        {scanState === "cached" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-panel rounded-xl border border-status-pass/50 overflow-hidden shadow-lg">
              <div className="bg-status-pass/10 p-4 border-b border-status-pass/30 flex gap-3">
                <div className="mt-0.5">
                  <Zap size={24} className="text-status-pass fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-status-pass">Cache Hit</h2>
                  <p className="text-xs text-status-pass mt-1">This product is already verified globally.</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-text-3 uppercase tracking-wider mb-1">Product Details</div>
                  <div className="font-semibold text-text-1">{activeProductCached.name}</div>
                  <div className="text-sm text-text-2">{activeProductCached.brand}</div>
                  <div className="text-sm text-text-2 mt-1">Cached since: {activeProductCached.cachedSince}</div>
                  <div className="text-sm text-text-2">Global verified scans: 42,910</div>
                </div>

                <div className="p-3 bg-status-pass/10 border border-status-pass/30 rounded text-xs space-y-1.5 font-mono text-status-pass">
                  <strong>ML bypassed.</strong> Cost: ₹0. Server compute saved: 100%.
                </div>
              </div>
            </div>

            <div className="bg-panel rounded-xl p-4 border border-panel-line text-center space-y-3">
              <button
                onClick={() => setScanState("idle")}
                className="w-full bg-panel-raised border border-panel-line text-text-1 text-sm py-3 rounded-lg font-bold"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}

        {scanState === "pass" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-panel rounded-xl border border-status-pass/50 overflow-hidden shadow-lg">
              <div className="bg-status-pass/10 p-4 border-b border-status-pass/30 flex gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 size={24} className="text-status-pass" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-status-pass">COMPLIANT</h2>
                  <p className="text-xs text-status-pass mt-1">All mandatory requirements met.</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-text-3 uppercase tracking-wider mb-1">Product Details</div>
                  <div className="font-semibold text-text-1">{activeProductPass.name}</div>
                  <div className="text-sm text-text-2">{activeProductPass.brand}</div>
                </div>

                <div className="bg-ink rounded-lg p-3 border border-panel-line">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-text-1">
                      <CheckCircle2 size={16} className="text-status-pass mt-0.5 flex-none" />
                      <span>MRP printed correctly.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-text-1">
                      <CheckCircle2 size={16} className="text-status-pass mt-0.5 flex-none" />
                      <span>Net weight matches declaration.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-text-1">
                      <CheckCircle2 size={16} className="text-status-pass mt-0.5 flex-none" />
                      <span>Customer care available.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-panel rounded-xl p-4 border border-panel-line text-center space-y-3">
              <button
                onClick={() => setScanState("idle")}
                className="w-full bg-status-pass text-brass-ink text-sm py-3 rounded-lg font-bold"
              >
                Share Result
              </button>
              <button
                onClick={() => setScanState("idle")}
                className="w-full bg-panel-raised border border-panel-line text-text-1 text-sm py-3 rounded-lg font-bold"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}

        {scanState === "fail" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Plain English Verdict Card */}
            <div className="glass-panel overflow-hidden border border-status-fail/40 bg-status-fail/5">
              <div className="bg-status-fail/10 p-4 border-b border-status-fail/30 flex gap-3">
                <div className="mt-0.5">
                  <AlertTriangle size={24} className="text-status-fail" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-status-fail">Non-Compliant Product</h2>
                  <p className="text-xs text-text-2 mt-1">This product is missing mandatory legal information.</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-text-3 uppercase tracking-wider mb-1">Product Details</div>
                  <div className="font-semibold text-text-1">{activeProduct.name}</div>
                  <div className="text-sm text-text-2">{activeProduct.brand}</div>
                </div>

                <div className="bg-ink rounded-lg p-3 border border-panel-line">
                  <div className="text-xs text-status-fail font-semibold mb-2">Issues Found:</div>
                  <ul className="space-y-2">
                    {activeProduct.violations.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-1">
                        <span className="text-status-fail font-bold mt-0.5">×</span>
                        <span><strong>{v.field}:</strong> {v.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {reportState === "idle" && (
              <div className="bg-panel rounded-xl p-4 border border-panel-line text-center space-y-3">
                <p className="text-sm text-text-1">Help enforce the law and protect other consumers.</p>
                <button
                  onClick={handleReport}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold py-4 rounded-xl shadow-[0_8px_32px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_40px_rgba(239,68,68,0.6)] active:scale-95 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={20} />
                  <span className="tracking-wide">Report Violation</span>
                </button>
                <button
                  onClick={() => setScanState("idle")}
                  className="w-full bg-transparent hover:text-white text-text-2 text-sm py-2 transition-colors"
                >
                  Cancel / Scan Another
                </button>
              </div>
            )}

            {reportState === "reporting" && (
              <div className="bg-panel rounded-xl p-6 border border-panel-line text-center">
                <div className="w-8 h-8 mx-auto border-2 border-brass border-t-transparent rounded-full animate-spin mb-3"></div>
                <div className="text-sm text-brass">Submitting report securely to DoCA...</div>
              </div>
            )}

            {reportState === "submitted" && (
              <div className="bg-status-pass/10 rounded-xl p-5 border border-status-pass/30 text-center space-y-3">
                <CheckCircle2 size={36} className="text-status-pass mx-auto" />
                <h3 className="text-lg font-bold text-status-pass">Report Submitted!</h3>
                <p className="text-sm text-text-1">
                  Case Ref: <span className="font-mono">CR-{Math.floor(Math.random() * 10000)}-PN</span>
                </p>
                <p className="text-xs text-text-2">
                  Your report has been routed to the local Legal Metrology Inspector for Pune District. Thank you for protecting consumers.
                </p>
                <button
                  onClick={() => {
                    setScanState("idle");
                    setReportState("idle");
                  }}
                  className="mt-2 text-sm text-brass font-semibold flex p-2 mx-auto hover:bg-brass/10 rounded transition-colors"
                >
                  Scan another product
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
