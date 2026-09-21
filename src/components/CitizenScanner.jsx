import React from 'react';
import VisionInspector from './VisionInspector';
import { AlertTriangle, MapPin } from 'lucide-react';

export default function CitizenScanner({ onReportSubmitted }) {
  return (
    <div className="w-full mx-auto font-sans animate-fadeIn pb-20">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#59636E] bg-[#F8F7F3] inline-flex px-3 py-1.5 border border-[#D8D7D2] font-mono">
          <MapPin size={14} className="text-[#183D35]" />
          <span>Location: Maharashtra (Auto-detected)</span>
        </div>
      </div>

      <VisionInspector />

      <div className="bg-white p-5 border border-[#D8D7D2] text-center mt-6">
        <p className="text-xs font-sans text-[#59636E] mb-3">Help enforce Legal Metrology standards and protect fellow consumers.</p>
        <button
          onClick={() => {
            if (onReportSubmitted) {
              onReportSubmitted({
                id: `AUD-${Math.floor(Math.random() * 100) + 9000}`,
                timestamp: "Just now",
                platform: "Citizen Report (Mobile)",
                product: "Citizen Uploaded Package",
                seller: "Unknown Local Seller",
                status: "violation",
                issue: "Missing / Illegible Mandatory Info",
                citation: "Rule 6 & 7",
                action: "Citizen Report - Pending Inspector Review",
                isCitizenReport: true,
              });
            }
          }}
          className="w-full max-w-sm mx-auto bg-[#183D35] hover:bg-[#0f2a23] text-white font-semibold text-xs py-3 px-6 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase font-mono tracking-wider border-none"
        >
          <AlertTriangle size={15} className="text-[#C9572C]" />
          <span>Report Violation to Authority</span>
        </button>
      </div>
    </div>
  );
}
