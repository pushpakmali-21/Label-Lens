import React, { useState } from "react";
import { Camera, AlertTriangle, CheckCircle2, Search, MapPin, Share2 } from "lucide-react";

export default function CitizenScanner() {
  const [scanState, setScanState] = useState("idle"); // idle, scanning, pass, fail
  const [reportState, setReportState] = useState("idle"); // idle, reporting, submitted
  
  const handleScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("fail"); // Hardcoded fail for demo purposes
    }, 2000);
  };
  
  const handleReport = () => {
    setReportState("reporting");
    setTimeout(() => {
      setReportState("submitted");
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
              <p className="text-sm text-[#99AAB8] leading-relaxed">
                Scan the label to instantly check if the MRP, manufacturing date, and weight are printed legally. Protect yourself from fraud.
              </p>
              
              <button 
                onClick={handleScan}
                className="w-full bg-[#C9A15A] text-[#241B08] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
              >
                <Camera size={20} />
                <span>Tap to Scan Label</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-[#63768A] justify-center mt-6">
              <MapPin size={14} />
              <span>Location: Pune, Maharashtra (Auto-detected)</span>
            </div>
          </div>
        )}
        
        {scanState === "scanning" && (
          <div className="bg-[#121F2E] rounded-xl p-8 border border-[#26394B] text-center space-y-6 animate-pulse mt-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-dashed border-[#C9A15A] rounded-xl opacity-20"></div>
              <div className="absolute inset-0 border-4 border-[#C9A15A] rounded-xl border-t-transparent border-b-transparent animate-spin"></div>
              <Camera size={32} className="absolute inset-0 m-auto text-[#C9A15A]" />
            </div>
            <div>
              <div className="text-lg font-serif text-[#C9A15A] mb-1">Analyzing Label...</div>
              <div className="text-xs font-mono text-[#63768A]">Reading OCR & checking Legal Metrology Rules</div>
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
                  <div className="font-semibold text-[#EDEAE1]">Cold-Pressed Orange Juice, 500ml</div>
                  <div className="text-sm text-[#99AAB8]">Freshline Beverages Pvt. Ltd.</div>
                </div>
                
                <div className="bg-[#0B1520] rounded-lg p-3 border border-[#26394B]">
                  <div className="text-xs text-[#D06A5A] font-semibold mb-2">Issues Found:</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-[#EDEAE1]">
                      <span className="text-[#D06A5A] font-bold mt-0.5">×</span>
                      <span><strong>Missing Manufacture Date:</strong> The packaging does not state when it was made or when it expires.</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[#EDEAE1]">
                      <span className="text-[#D06A5A] font-bold mt-0.5">×</span>
                      <span><strong>No Customer Care Info:</strong> No phone number or email is provided for complaints.</span>
                    </li>
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
                  className="w-full bg-[#D06A5A] text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={18} />
                  <span>Report Violation to Govt.</span>
                </button>
                <button 
                  onClick={() => setScanState("idle")}
                  className="w-full bg-transparent text-[#99AAB8] text-sm py-2"
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
                  Case Ref: <span className="font-mono">CR-8921-PN</span>
                </p>
                <p className="text-xs text-[#99AAB8]">
                  Your report has been routed to the local Legal Metrology Inspector for Pune District. Thank you for protecting consumers.
                </p>
                <button 
                  onClick={() => {
                    setScanState("idle");
                    setReportState("idle");
                  }}
                  className="mt-2 text-sm text-[#C9A15A] font-semibold"
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
