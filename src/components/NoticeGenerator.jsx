import React, { useState, useEffect } from "react";
import { FileText, Printer, ShieldCheck, Hash, MapPin, Calendar, Building, AlertTriangle, ArrowLeft, Copy, Check, Eye } from "lucide-react";
import { generateEvidenceSeal } from "../utils/evidenceSealer";

export default function NoticeGenerator({ scenarioForNotice, onBackToScan }) {
  const [sealData, setSealData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [viewFullDoc, setViewFullDoc] = useState(false);
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

  const handleCopyHash = () => {
    if (sealData?.sha256) {
      navigator.clipboard.writeText(sealData.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Action Header Card */}
      <div className="bg-gradient-to-br from-[#182032] to-[#111625] border border-[#232D45] rounded-2xl p-4 shadow-lg no-print">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-600/40 text-[#C084FC] text-[10.5px] font-mono font-semibold">
            <FileText size={12} className="text-[#A855F7]" />
            <span>Section 39 Legal Notice</span>
          </span>

          {onBackToScan && (
            <button
              onClick={onBackToScan}
              className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1 active:scale-95 transition-all"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          )}
        </div>

        <h1 className="text-base font-bold text-[#F8FAFC]">
          Statutory Show-Cause Notice
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
          Courtroom-grade legal notice with embedded OCR evidence and SHA-256 cryptographic chain-of-custody seal.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#232D45]">
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-purple-glow"
          >
            <Printer size={14} />
            <span>Print PDF Notice</span>
          </button>

          <button
            onClick={handleCopyHash}
            className="bg-[#111625] hover:bg-[#182032] border border-[#232D45] active:scale-95 text-[#F8FAFC] font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} className="text-[#A855F7]" />}
            <span>{copied ? "Hash Copied!" : "Copy SHA-256"}</span>
          </button>
        </div>
      </div>

      {/* Case Summary Card */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3 no-print shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-[#232D45]">
          <div>
            <div className="text-[10px] font-mono text-[#64748B]">Case File Number</div>
            <div className="font-mono text-xs font-bold text-[#F8FAFC]">{caseNumber}</div>
          </div>
          <span className="text-[10px] font-mono bg-[#EF4444]/15 text-[#EF4444] px-2 py-0.5 rounded-full border border-[#EF4444]/30 font-semibold">
            15-Day Directive
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="text-[#94A3B8]">
            <strong>Respondent:</strong> <span className="text-[#F8FAFC]">{noticeDetails.respondent}</span>
          </div>
          <div className="text-[#94A3B8]">
            <strong>Commodity:</strong> <span className="text-[#F8FAFC]">{noticeDetails.product}</span>
          </div>
          <div className="text-[#94A3B8]">
            <strong>Channel:</strong> <span className="text-[#F8FAFC]">{noticeDetails.platform}</span>
          </div>
        </div>

        {/* Violations Chips */}
        <div className="pt-2 space-y-2">
          <div className="text-[11px] font-mono text-[#94A3B8]">Itemized Contraventions:</div>
          {noticeDetails.violations.map((v, i) => (
            <div key={i} className="p-2.5 bg-[#07090F] rounded-xl border border-[#EF4444]/30 text-xs space-y-0.5">
              <div className="font-mono text-[#EF4444] font-semibold text-[11px]">{v.section}</div>
              <div className="text-[#94A3B8] text-[11px]">{v.nature}</div>
            </div>
          ))}
        </div>

        {/* Cryptographic Seal Preview */}
        <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-800/30 text-[10.5px] font-mono space-y-1">
          <div className="flex items-center gap-1.5 text-[#C084FC] font-bold">
            <ShieldCheck size={13} />
            <span>Sec 65B Electronic Seal Verified</span>
          </div>
          <div className="break-all text-[#94A3B8]">
            SHA-256: <span className="text-[#F8FAFC]">{sealData?.sha256 || "Computing..."}</span>
          </div>
        </div>

        <button
          onClick={() => setViewFullDoc(!viewFullDoc)}
          className="w-full bg-[#182032] hover:bg-[#232D45] text-[#A855F7] text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
        >
          <Eye size={13} />
          <span>{viewFullDoc ? "Hide Document Preview" : "View Full Formal Gazette Notice"}</span>
        </button>
      </div>

      {/* Printable Formal Legal Notice */}
      <div className={`${viewFullDoc ? "block" : "hidden print:block"} bg-[#FFFFFF] text-[#111827] rounded-2xl shadow-xl p-5 sm:p-8 font-serif border border-gray-200 print:shadow-none print:border-none print:p-0`}>
        {/* Government Header */}
        <div className="text-center border-b-2 border-[#111827] pb-3 mb-4">
          <div className="font-sans font-bold text-xs tracking-widest uppercase text-gray-700">
            Government of India
          </div>
          <div className="font-sans font-extrabold text-sm uppercase text-gray-900 tracking-wider mt-0.5">
            Ministry of Consumer Affairs, Food &amp; Public Distribution
          </div>
          <div className="font-sans text-[11px] uppercase text-gray-600 font-semibold">
            Department of Consumer Affairs • Legal Metrology Division
          </div>
        </div>

        {/* Notice Meta Row */}
        <div className="flex justify-between items-start text-[11px] font-sans border-b border-gray-200 pb-2 mb-3">
          <div>
            <div><strong>Case Ref:</strong> <span className="font-mono">{caseNumber}</span></div>
            <div><strong>Officer:</strong> LMO राजेश शर्मा (#INS-DL-4029)</div>
          </div>
          <div className="text-right">
            <div><strong>Date:</strong> {sealData?.formattedTime || new Date().toLocaleDateString("en-IN")}</div>
            <div><strong>Jurisdiction:</strong> NCT of Delhi</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-3">
          <h2 className="font-sans font-bold text-sm uppercase underline tracking-wide text-gray-900">
            Show-Cause Notice Under Section 39
          </h2>
          <div className="font-sans text-[10.5px] text-gray-700 italic">
            Read with Rule 6, 11 &amp; 13 of Legal Metrology (Packaged Commodities) Rules, 2011
          </div>
        </div>

        {/* Addressed To */}
        <div className="font-sans text-xs space-y-0.5 mb-3 bg-gray-50 p-2.5 rounded border border-gray-200">
          <div className="font-bold text-gray-900">To,</div>
          <div className="font-semibold text-gray-800">{noticeDetails.respondent}</div>
          <div className="text-gray-600">{noticeDetails.respondentAddress}</div>
        </div>

        {/* Statement */}
        <div className="text-xs leading-relaxed space-y-2 mb-4 text-gray-800 font-sans">
          <p>
            <strong>WHEREAS</strong>, an algorithmic compliance inspection was executed using the <strong>LabelLens Verification Engine</strong> on commodity: <strong>{noticeDetails.product}</strong> (MRP: {noticeDetails.mrp}).
          </p>
          <p>
            <strong>AND WHEREAS</strong>, preliminary digital image extraction and semantic review established prima facie non-compliance with statutory disclosure mandates:
          </p>
        </div>

        {/* Violations Table */}
        <div className="mb-4 font-sans overflow-x-auto">
          <table className="w-full text-left text-[11px] border border-gray-300">
            <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-300">
              <tr>
                <th className="p-2 border-r border-gray-300">Section</th>
                <th className="p-2 border-r border-gray-300">Contravention</th>
                <th className="p-2">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 text-gray-800">
              {noticeDetails.violations.map((v, idx) => (
                <tr key={idx}>
                  <td className="p-2 border-r border-gray-300 font-mono font-semibold text-red-700">{v.section}</td>
                  <td className="p-2 border-r border-gray-300">{v.nature}</td>
                  <td className="p-2 font-bold text-red-600">{v.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Directive */}
        <div className="text-xs leading-relaxed mb-4 text-gray-800 font-sans">
          <p>
            <strong>NOW THEREFORE</strong>, you are hereby called upon to <strong>SHOW CAUSE within 15 days</strong> as to why penal proceedings under <strong>Section 36(1) of Legal Metrology Act, 2009</strong> should not be initiated against your establishment.
          </p>
        </div>

        {/* Digital Signature */}
        <div className="flex justify-between items-end pt-4 font-sans border-t border-gray-200 text-xs">
          <div className="text-[10px] text-gray-500">
            [ OFFICIAL SEAL ]
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">Rajesh Sharma</div>
            <div className="text-gray-600">Legal Metrology Inspector</div>
            <div className="text-[9.5px] text-gray-400 font-mono">Digitally Sealed via LabelLens PKI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
