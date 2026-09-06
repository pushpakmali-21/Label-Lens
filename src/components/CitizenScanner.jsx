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
    <div className="max-w-md mx-auto bg-[#0B1520] min-h-screen text-[#EDEAE1] font-sans pb-20">
      {/* App Bar */}
      <div className="p-4 bg-[#0E1A26] border-b border-[#26394B] sticky top-0 z-10 flex items-center justify-between">
        <div className="font-serif text-lg text-[#EDEAE1]">
          Label<span className="text-[#C9A15A] font-semibold">Lens</span>
          <span className="ml-2 text-[10px] bg-[#26394B] px-1.5 py-0.5 rounded text-[#99AAB8]">CITIZEN</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#17293B] border border-[#26394B] flex items-center justify-center text-xs">
          👤
        </div>
      </div>

      <div className="p-4 space-y-4">
        {scanState === "idle" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#121F2E] rounded-xl p-5 border border-[#26394B] text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-[#17293B] rounded-full flex items-center justify-center text-[#C9A15A] mb-2">
                <Search size={28} />
              </div>
              <h2 className="text-xl font-serif text-[#EDEAE1]">Verify any packaged product</h2>
              <p className="text-sm text-[#99AAB8] leading-relaxed mb-6">
                Scan the label to instantly check if the MRP, manufacturing date, and weight are printed legally. Protect yourself from fraud.
              </p>

              <button
                onClick={handleScanFailDemo}
                className="w-full bg-[#D06A5A] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              >
                <Camera size={20} />
                <span>Tap to Scan Label</span>
              </button>

              <button
                onClick={handleScanCacheDemo}
                className="w-full bg-[#5AAE83] text-[#241B08] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              >
                <Zap size={20} className="fill-current" />
                <span>Scan Known Product — Cache Demo</span>
              </button>

              <button
                onClick={handleScanPassDemo}
                className="w-full bg-[#17293B] border border-[#26394B] text-[#EDEAE1] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <CheckCircle2 size={18} />
                <span className="text-sm">Simulate Compliant Product</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#63768A] justify-center mt-6">
              <MapPin size={14} />
              <span>Location: Pune, Maharashtra (Auto-detected)</span>
            </div>
          </div>
        )}

        {scanState === "barcode_scan" && (
          <div className="bg-[#121F2E] rounded-xl p-8 border border-[#26394B] text-center space-y-6 animate-pulse mt-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-dashed border-[#C9A15A] rounded-xl opacity-20"></div>
              <div className="absolute inset-0 border-4 border-[#C9A15A] rounded-xl border-t-transparent border-b-transparent animate-spin"></div>
              <Scan size={40} className="absolute inset-0 m-auto text-[#C9A15A]" />
            </div>
            <div>
              <div className="text-lg font-serif text-[#C9A15A] mb-1">Tier 1: Reading Barcode</div>
              <div className="text-xs font-mono text-[#63768A]">Scanning product ID...</div>
            </div>
          </div>
        )}

        {scanState === "cache_check" && (
          <div className="bg-[#121F2E] rounded-xl p-8 border border-[#26394B] text-center space-y-6 animate-pulse mt-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-dashed border-[#5AAE83] rounded-xl opacity-20"></div>
              <div className="absolute inset-0 border-4 border-[#5AAE83] rounded-xl border-t-transparent border-b-transparent animate-spin"></div>
              <Database size={32} className="absolute inset-0 m-auto text-[#5AAE83]" />
            </div>
            <div>
              <div className="text-lg font-serif text-[#5AAE83] mb-1">Checking Registry...</div>
              <div className="text-xs font-mono text-[#63768A]">Comparing against 2.4M verified scan records</div>
            </div>
          </div>
        )}

        {scanState === "ml_scan" && (
          <div className="bg-[#121F2E] rounded-xl p-8 border border-[#26394B] text-center space-y-6 animate-pulse mt-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-dashed border-[#DA9E4E] rounded-xl opacity-20"></div>
              <div className="absolute inset-0 border-4 border-[#DA9E4E] rounded-xl border-t-transparent border-b-transparent animate-spin"></div>
              <Search size={32} className="absolute inset-0 m-auto text-[#DA9E4E]" />
            </div>
            <div>
              <div className="text-lg font-serif text-[#DA9E4E] mb-1">Tier 2: Deep ML Analysis</div>
              <div className="text-xs font-mono text-[#63768A]">YOLOv8 + PaddleOCR active — new product, full pipeline required</div>
            </div>
          </div>
        )}

        {scanState === "cached" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#121F2E] rounded-xl border border-[#5AAE83]/50 overflow-hidden shadow-lg">
              <div className="bg-[#5AAE83]/10 p-4 border-b border-[#5AAE83]/30 flex gap-3">
                <div className="mt-0.5">
                  <Zap size={24} className="text-[#5AAE83] fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#5AAE83]">Cache Hit</h2>
                  <p className="text-xs text-[#5AAE83] mt-1">This product is already verified globally.</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-[#63768A] uppercase tracking-wider mb-1">Product Details</div>
                  <div className="font-semibold text-[#EDEAE1]">{activeProductCached.name}</div>
                  <div className="text-sm text-[#99AAB8]">{activeProductCached.brand}</div>
                  <div className="text-sm text-[#99AAB8] mt-1">Cached since: {activeProductCached.cachedSince}</div>
                  <div className="text-sm text-[#99AAB8]">Global verified scans: 42,910</div>
                </div>

                <div className="p-3 bg-[#5AAE83]/10 border border-[#5AAE83]/30 rounded text-xs space-y-1.5 font-mono text-[#5AAE83]">
                  <strong>ML bypassed.</strong> Cost: ₹0. Server compute saved: 100%.
                </div>
              </div>
            </div>

            <div className="bg-[#121F2E] rounded-xl p-4 border border-[#26394B] text-center space-y-3">
              <button
                onClick={() => setScanState("idle")}
                className="w-full bg-[#17293B] border border-[#26394B] text-[#EDEAE1] text-sm py-3 rounded-lg font-bold"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}

        {scanState === "pass" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#121F2E] rounded-xl border border-[#5AAE83]/50 overflow-hidden shadow-lg">
              <div className="bg-[#5AAE83]/10 p-4 border-b border-[#5AAE83]/30 flex gap-3">
                <div className="mt-0.5">
                  <CheckCircle2 size={24} className="text-[#5AAE83]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#5AAE83]">COMPLIANT</h2>
                  <p className="text-xs text-[#5AAE83] mt-1">All mandatory requirements met.</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-[#63768A] uppercase tracking-wider mb-1">Product Details</div>
                  <div className="font-semibold text-[#EDEAE1]">{activeProductPass.name}</div>
                  <div className="text-sm text-[#99AAB8]">{activeProductPass.brand}</div>
                </div>

                <div className="bg-[#0B1520] rounded-lg p-3 border border-[#26394B]">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-[#EDEAE1]">
                      <CheckCircle2 size={16} className="text-[#5AAE83] mt-0.5 flex-none" />
                      <span>MRP printed correctly.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[#EDEAE1]">
                      <CheckCircle2 size={16} className="text-[#5AAE83] mt-0.5 flex-none" />
                      <span>Net weight matches declaration.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[#EDEAE1]">
                      <CheckCircle2 size={16} className="text-[#5AAE83] mt-0.5 flex-none" />
                      <span>Customer care available.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#121F2E] rounded-xl p-4 border border-[#26394B] text-center space-y-3">
              <button
                onClick={() => setScanState("idle")}
                className="w-full bg-[#17293B] border border-[#26394B] text-[#EDEAE1] text-sm py-3 rounded-lg font-bold"
              >
                Scan Another Product
              </button>
            </div>
          </div>
        )}

        {scanState === "fail" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Plain English Verdict Card */}
            <div className="bg-[#121F2E] rounded-xl border border-[#D06A5A]/50 overflow-hidden shadow-lg">
              <div className="bg-[#D06A5A]/10 p-4 border-b border-[#D06A5A]/30 flex gap-3">
                <div className="mt-0.5">
                  <AlertTriangle size={24} className="text-[#D06A5A]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#D06A5A]">Non-Compliant Product</h2>
                  <p className="text-xs text-[#99AAB8] mt-1">This product is missing mandatory legal information.</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs text-[#63768A] uppercase tracking-wider mb-1">Product Details</div>
                  <div className="font-semibold text-[#EDEAE1]">{activeProduct.name}</div>
                  <div className="text-sm text-[#99AAB8]">{activeProduct.brand}</div>
                </div>

                <div className="bg-[#0B1520] rounded-lg p-3 border border-[#26394B]">
                  <div className="text-xs text-[#D06A5A] font-semibold mb-2">Issues Found:</div>
                  <ul className="space-y-2">
                    {activeProduct.violations.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#EDEAE1]">
                        <span className="text-[#D06A5A] font-bold mt-0.5">×</span>
                        <span><strong>{v.field}:</strong> {v.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {reportState === "idle" && (
              <div className="bg-[#121F2E] rounded-xl p-4 border border-[#26394B] text-center space-y-3">
                <p className="text-sm text-[#EDEAE1]">Help enforce the law and protect other consumers.</p>
                <button
                  onClick={handleReport}
                  className="w-full bg-[#D06A5A] hover:bg-[#b05345] text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={18} />
                  <span>Report Violation to Govt.</span>
                </button>
                <button
                  onClick={() => setScanState("idle")}
                  className="w-full bg-transparent hover:text-white text-[#99AAB8] text-sm py-2 transition-colors"
                >
                  Cancel / Scan Another
                </button>
              </div>
            )}

            {reportState === "reporting" && (
              <div className="bg-[#121F2E] rounded-xl p-6 border border-[#26394B] text-center">
                <div className="w-8 h-8 mx-auto border-2 border-[#C9A15A] border-t-transparent rounded-full animate-spin mb-3"></div>
                <div className="text-sm text-[#C9A15A]">Submitting report securely to DoCA...</div>
              </div>
            )}

            {reportState === "submitted" && (
              <div className="bg-[#5AAE83]/10 rounded-xl p-5 border border-[#5AAE83]/30 text-center space-y-3">
                <CheckCircle2 size={36} className="text-[#5AAE83] mx-auto" />
                <h3 className="text-lg font-bold text-[#5AAE83]">Report Submitted!</h3>
                <p className="text-sm text-[#EDEAE1]">
                  Case Ref: <span className="font-mono">CR-{Math.floor(Math.random() * 10000)}-PN</span>
                </p>
                <p className="text-xs text-[#99AAB8]">
                  Your report has been routed to the local Legal Metrology Inspector for Pune District. Thank you for protecting consumers.
                </p>
                <button
                  onClick={() => {
                    setScanState("idle");
                    setReportState("idle");
                  }}
                  className="mt-2 text-sm text-[#C9A15A] font-semibold flex p-2 mx-auto hover:bg-[#C9A15A]/10 rounded transition-colors"
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
