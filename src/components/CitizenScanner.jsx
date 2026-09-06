import React from "react";
export default function CitizenScanner({ onReportSubmitted }) {
  return (
    <div className="p-4 text-white">
      <h2 className="text-xl">Citizen Scanner (Teammate B Scope)</h2>
      <button 
        onClick={() => onReportSubmitted({
          id: "CIT-" + Math.floor(Math.random()*1000),
          timestamp: "Just now",
          platform: "Dummy Market",
          product: "Dummy Product",
          seller: "Dummy Seller",
          status: "violation",
          issue: "Reported by citizen",
          citation: "Rule XY",
          action: "Under Review",
          isCitizenReport: true
        })}
        className="mt-4 p-2 bg-blue-500 rounded"
      >
        Submit Dummy Report
      </button>
    </div>
  );
}
