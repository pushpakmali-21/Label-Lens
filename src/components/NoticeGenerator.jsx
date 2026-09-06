import React, { useState, useEffect } from "react";
import { FileText, Printer, ShieldCheck, Hash, MapPin, Calendar, Building, AlertTriangle, ArrowLeft } from "lucide-react";
import { generateEvidenceSeal } from "../utils/evidenceSealer";

export default function NoticeGenerator({ scenarioForNotice, onBackToScan }) {
  const [sealData, setSealData] = useState(null);
  const [caseNumber] = useState(`DOCA/LM/2026/SCN-${Math.floor(10000 + Math.random() * 90000)}`);

  // Notice details based on active scenario or default
  const [noticeDetails, setNoticeDetails] = useState({
    respondent: scenarioForNotice?.brand || "Freshline Beverages Pvt. Ltd.",
    respondentAddress: "Plot 18, MIDC Bhosari, Pune, Maharashtra - 411026",
    product: scenarioForNotice?.product || "Cold-Pressed Orange Juice, 500 ml",
    platform: scenarioForNotice?.id === "ecommerce" ? "QuickCommerce Platform Listing (App ID: 48213)" : "Physical Retail Shelf (Sector 18 POS)",
    mrp: scenarioForNotice?.mrp || "₹120.00",
    violations: [
      {
        section: "Rule 6(10) r/w Rule 6(1)(d)",
        nature: "Total omission of Month & Year of Manufacture / Best Before Date on digital listing",
        evidence: "Screenshot OCR confirms field absent from digital product carousel",
        severity: "Substantive Violation",
      },
      {
        section: "Rule 6(10) r/w Rule 6(1)(f)",
        nature: "Omission of mandatory Consumer Grievance redressal telephone & email",
        evidence: "No contact details provided prior to sale checkout",
        severity: "Substantive Violation",
      },
    ],
  });

  useEffect(() => {
    generateEvidenceSeal({ caseNumber, noticeDetails }).then(setSealData);
  }, [caseNumber, noticeDetails]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-panel-line pb-4 sm:pb-5 no-print">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
            <FileText size={14} />
            <span>Automated Legal Workflows (Section 39, Legal Metrology Act, 2009)</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-1">
            Statutory Show-Cause Notice Generator
          </h1>
          <p className="text-xs sm:text-sm text-text-2 mt-1 leading-relaxed">
            Instantly compiles Courtroom-grade legal notices with embedded OCR evidence and SHA-256 cryptographic chain-of-custody seal.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {onBackToScan && (
            <button
              onClick={onBackToScan}
              className="bg-panel-raised hover:bg-panel-line border border-panel-line text-text-1 text-xs font-medium px-3 py-2 rounded flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back to Scanner</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="bg-brass hover:bg-brass-strong active:scale-95 text-brass-ink font-semibold text-xs sm:text-sm px-4 py-2 rounded flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer size={15} />
            <span>Print Official Notice (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Legal Notice Document Container */}
      <div className="max-w-4xl mx-auto bg-[#FFFFFF] text-[#111827] rounded shadow-2xl p-5 sm:p-10 md:p-12 font-serif border border-gray-200 print:shadow-none print:border-none print:p-0">
        {/* Government Header */}
        <div className="text-center border-b-2 border-[#111827] pb-4 mb-5 sm:mb-6">
          <div className="font-sans font-bold text-xs sm:text-sm tracking-widest uppercase text-gray-700">
            Government of India
          </div>
          <div className="font-sans font-extrabold text-base sm:text-lg uppercase text-gray-900 tracking-wider mt-0.5">
            Ministry of Consumer Affairs, Food &amp; Public Distribution
          </div>
          <div className="font-sans text-xs uppercase text-gray-600 font-semibold mt-0.5">
            Department of Consumer Affairs • Legal Metrology Division
          </div>
          <div className="font-sans text-[11px] text-gray-500 mt-1">
            Krishi Bhawan, New Delhi - 110001 • enforcement.doca@nic.in
          </div>
        </div>

        {/* Notice Meta Row */}
        <div className="flex justify-between items-start text-xs font-sans border-b border-gray-200 pb-3 mb-5 flex-wrap gap-2">
          <div>
            <div><strong className="text-gray-900">Case Ref:</strong> <span className="font-mono">{caseNumber}</span></div>
            <div><strong className="text-gray-900">Issuing Officer:</strong> LMO राजेश शर्मा (Badge #INS-DL-4029)</div>
          </div>
          <div className="text-left sm:text-right">
            <div><strong className="text-gray-900">Date of Notice:</strong> {sealData?.formattedTime || new Date().toLocaleDateString("en-IN")}</div>
            <div><strong className="text-gray-900">Jurisdiction:</strong> National Capital Territory of Delhi</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-4">
          <h2 className="font-sans font-bold text-base sm:text-lg uppercase underline tracking-wide text-gray-900">
            Show-Cause Notice Under Section 39
          </h2>
          <div className="font-sans text-xs text-gray-700 italic mt-0.5">
            Read with Rule 6, Rule 11 &amp; Rule 13 of the Legal Metrology (Packaged Commodities) Rules, 2011
          </div>
        </div>

        {/* Addressed To */}
        <div className="font-sans text-xs sm:text-sm space-y-1 mb-5 bg-gray-50 p-3.5 rounded border border-gray-200">
          <div className="font-bold text-gray-900">To,</div>
          <div className="font-semibold text-gray-800">{noticeDetails.respondent}</div>
          <div className="text-gray-600">{noticeDetails.respondentAddress}</div>
          <div className="text-gray-600"><strong>Channel / Platform:</strong> {noticeDetails.platform}</div>
        </div>

        {/* Statement of Allegation */}
        <div className="text-xs sm:text-sm leading-relaxed space-y-3 mb-6 text-gray-800">
          <p>
            <strong>WHEREAS</strong>, an automated algorithmic compliance audit and photographic inspection was executed under the statutory supervision of the Department of Consumer Affairs using the <strong>LabelLens Compliance Verification System</strong> on the commodity described below:
          </p>
          <div className="p-2.5 bg-gray-100 rounded text-xs font-sans">
            <strong>Commodity / SKU:</strong> {noticeDetails.product} | <strong>MRP:</strong> {noticeDetails.mrp}
          </div>
          <p>
            <strong>AND WHEREAS</strong>, preliminary digital image extraction and semantic review established prima facie non-compliance with statutory disclosure mandates under the Legal Metrology (Packaged Commodities) Rules, 2011 as itemized hereunder:
          </p>
        </div>

        {/* Violations Table */}
        <div className="mb-6 font-sans overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-300 min-w-[500px]">
            <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-300">
              <tr>
                <th className="p-2.5 border-r border-gray-300">Statutory Citation</th>
                <th className="p-2.5 border-r border-gray-300">Nature of Contravention</th>
                <th className="p-2.5 border-r border-gray-300">Evidentiary Record</th>
                <th className="p-2.5">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 text-gray-800">
              {noticeDetails.violations.map((v, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 border-r border-gray-300 font-mono font-semibold text-red-700">{v.section}</td>
                  <td className="p-2.5 border-r border-gray-300">{v.nature}</td>
                  <td className="p-2.5 border-r border-gray-300 font-mono text-[11px]">{v.evidence}</td>
                  <td className="p-2.5 font-bold text-red-600">{v.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Penalty & 15-Day Directive */}
        <div className="text-xs sm:text-sm leading-relaxed space-y-3 mb-6 text-gray-800">
          <p>
            <strong>NOW THEREFORE</strong>, you are hereby called upon to <strong>SHOW CAUSE within fifteen (15) days</strong> of receipt of this notice as to why penal proceedings under <strong>Section 36(1) of the Legal Metrology Act, 2009</strong> (punishable with compounding fine up to ₹25,000 for the first offence, and subsequent fines up to ₹1,00,000 or imprisonment) should not be initiated against your establishment.
          </p>
          <p>
            Take note that failure to tender written representations within the stipulated 15-day period shall result in ex-parte referral to the Metropolitan Magistrate Court.
          </p>
        </div>

        {/* Cryptographic Chain-of-Custody Seal (Tamper-Proof) */}
        <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-6 font-sans text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 mb-2">
            <ShieldCheck size={16} className="text-brass" />
            <span>Cryptographic Chain-of-Custody &amp; Electronic Seal (Sec 65B Indian Evidence Act)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-[11px] font-mono text-gray-600">
            <div>
              <div><strong>SHA-256 Digest:</strong></div>
              <div className="break-all text-gray-900 font-semibold">{sealData?.sha256 || "Computing..."}</div>
            </div>
            <div>
              <div><strong>GPS Coordinates:</strong> {sealData?.gpsCoordinates.latitude}, {sealData?.gpsCoordinates.longitude}</div>
              <div><strong>Network Timestamp:</strong> {sealData?.timestamp}</div>
              <div><strong>Hardware Terminal ID:</strong> {sealData?.deviceId}</div>
            </div>
          </div>
        </div>

        {/* Signature Block */}
        <div className="flex justify-between items-end pt-8 font-sans">
          <div className="text-[11px] text-gray-500">
            <div>Seal of Legal Metrology Inspectorate</div>
            <div className="w-18 h-18 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-[9px] text-gray-400 mt-2">
              [ OFFICIAL SEAL ]
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-serif italic font-bold text-base text-gray-900">Rajesh Sharma</div>
            <div className="font-semibold text-gray-800">Legal Metrology Officer (Inspector)</div>
            <div className="text-gray-500">Department of Consumer Affairs</div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">Digitally Sealed via LabelLens PKI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
