import React, { useState, useEffect } from "react";
import { FileText, Printer, ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle2, XCircle, User, Phone, Mail, MapPin } from "lucide-react";
import { generateEvidenceSeal } from "../utils/evidenceSealer";

// ── Scan result data from the Prohibited Expressions + Consumer Care audit ─────
const SCAN_VIOLATIONS = [
  {
    section: "Rule 11(1)",
    nature: 'Use of prohibited expression "net weight when packed" on label',
    evidence: 'OCR extracted text: "Net weight when packed: 500 gms approx" — manufacturer cannot hedge against transit desiccation; net weight must hold true at point of sale',
    severity: "Substantive Violation",
  },
  {
    section: "Rule 11(1)",
    nature: 'Use of prohibited approximate qualifier "approx" in net quantity declaration',
    evidence: 'OCR extracted text: "500 gms approx" — abbreviated approximate qualification is impermissible under the Second Schedule',
    severity: "Substantive Violation",
  },
  {
    section: "Rule 13 r/w Second Schedule",
    nature: 'Use of non-standard, impermissible unit symbol "gms" in net quantity declaration',
    evidence: 'OCR extracted text: "500 gms" — permissible standard SI symbol is "g" (gram). "gms" is not a recognised unit symbol under the Second Schedule',
    severity: "Substantive Violation",
  },
  {
    section: "Rule 6(1)(f)",
    nature: "Omission of mandatory Consumer Redressal Email from consumer care declaration",
    evidence: "Consumer care panel is 75% complete. Officer name, telephone (1800-111-2233), and postal address are present but the mandatory consumer grievance email address field is absent",
    severity: "Substantive Violation",
  },
];

const CONSUMER_CARE_DATA = {
  score: 75,
  officer: "Customer Redressal Officer",
  telephone: "1800-111-2233",
  email: null, // Missing — primary violation
  address: "Plot 24, Industrial Area, Sector 5, Gurugram, Haryana",
};

export default function NoticeGenerator({ scenarioForNotice, onBackToScan }) {
  const [sealData, setSealData] = useState(null);
  const [caseNumber] = useState(`DOCA/LM/2026/SCN-${Math.floor(10000 + Math.random() * 90000)}`);

  const [noticeDetails] = useState({
    respondent: scenarioForNotice?.brand || "Freshline Beverages Pvt. Ltd.",
    respondentAddress: "Plot 18, MIDC Bhosari, Pune, Maharashtra - 411026",
    product: scenarioForNotice?.product || "Packaged Food Product (Net Qty: 500 g)",
    platform: scenarioForNotice?.id === "ecommerce"
      ? "QuickCommerce Platform Listing (App ID: 48213)"
      : "Physical Retail Shelf (Sector 18 POS)",
    mrp: scenarioForNotice?.mrp || "₹120.00",
    violations: SCAN_VIOLATIONS,
  });

  useEffect(() => {
    generateEvidenceSeal({ caseNumber, noticeDetails }).then(setSealData);
  }, [caseNumber, noticeDetails]);

  const handlePrint = () => window.print();

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
            Instantly compiles courtroom-grade legal notices with embedded OCR evidence and SHA-256 cryptographic chain-of-custody seal.
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

      {/* Printable Legal Notice Document */}
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
            Read with Rule 6(1)(f), Rule 11(1) &amp; Rule 13 / Second Schedule of the Legal Metrology (Packaged Commodities) Rules, 2011
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
            <strong>AND WHEREAS</strong>, LabelLens OCR extraction, prohibited-expression scanning (Rule 11 &amp; 13), and consumer care verification (Rule 6(1)(f)) established <strong>{noticeDetails.violations.length} prima facie contraventions</strong> under the Legal Metrology (Packaged Commodities) Rules, 2011, as itemized hereunder:
          </p>
        </div>

        {/* Violations Table */}
        <div className="mb-6 font-sans overflow-x-auto">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">
            <AlertTriangle size={13} className="text-red-600" />
            <span>Schedule I — Contraventions Detected ({noticeDetails.violations.length} findings)</span>
          </div>
          <table className="w-full text-left text-xs border border-gray-300 min-w-[500px]">
            <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-300">
              <tr>
                <th className="p-2.5 border-r border-gray-300 w-[18%]">Statutory Citation</th>
                <th className="p-2.5 border-r border-gray-300 w-[32%]">Nature of Contravention</th>
                <th className="p-2.5 border-r border-gray-300 w-[38%]">Evidentiary Record (OCR Extract)</th>
                <th className="p-2.5 w-[12%]">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 text-gray-800">
              {noticeDetails.violations.map((v, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-2.5 border-r border-gray-300 font-mono font-semibold text-red-700 align-top">{v.section}</td>
                  <td className="p-2.5 border-r border-gray-300 align-top">{v.nature}</td>
                  <td className="p-2.5 border-r border-gray-300 font-mono text-[10.5px] text-gray-700 align-top leading-relaxed">{v.evidence}</td>
                  <td className="p-2.5 font-bold text-red-600 align-top">{v.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Consumer Care Compliance Panel */}
        <div className="mb-6 font-sans">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide border-b border-gray-200 pb-2">
            <ShieldCheck size={14} className="text-amber-600" />
            <span>Exhibit A — Consumer Care Declaration Audit (Rule 6(1)(f))</span>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Score bar */}
            <div className="bg-amber-50 border-b border-gray-200 p-3 flex items-center justify-between">
              <div className="text-sm font-bold text-gray-900">Compliance Score: {CONSUMER_CARE_DATA.score}%</div>
              <div className="flex-1 mx-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${CONSUMER_CARE_DATA.score}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-amber-700 font-bold uppercase">Incomplete</div>
            </div>
            {/* Fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              <div className="p-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-green-600 mt-0.5 flex-none" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><User size={9} /> Redressal Officer</div>
                    <div className="text-xs text-gray-800 font-medium">{CONSUMER_CARE_DATA.officer}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-green-600 mt-0.5 flex-none" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><Phone size={9} /> Toll-Free Helpline</div>
                    <div className="text-xs font-mono text-gray-800">{CONSUMER_CARE_DATA.telephone}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2.5">
                <div className="flex items-start gap-2">
                  <XCircle size={13} className="text-red-600 mt-0.5 flex-none" />
                  <div>
                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1"><Mail size={9} /> Grievance Email</div>
                    <div className="text-xs text-red-600 font-semibold italic">ABSENT — Mandatory field missing</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-green-600 mt-0.5 flex-none" />
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><MapPin size={9} /> Postal Address</div>
                    <div className="text-xs text-gray-800">{CONSUMER_CARE_DATA.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exhibit B — OCR Evidence of Prohibited Expressions */}
        <div className="mb-6 font-sans">
          <div className="flex items-center gap-2 font-bold text-gray-900 mb-3 text-xs uppercase tracking-wide border-b border-gray-200 pb-2">
            <AlertTriangle size={14} className="text-red-600" />
            <span>Exhibit B — Prohibited Expressions Detected in OCR Extract (Rule 11 &amp; 13)</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-100 leading-relaxed relative overflow-hidden">
            <div className="text-gray-500 mb-2 text-[10px]">// LabelLens OCR raw text extract — scanned label input</div>
            <div>
              Net weight when{" "}
              <mark className="bg-red-500/80 text-white px-0.5 rounded">packed</mark>:{" "}
              500{" "}
              <mark className="bg-red-500/80 text-white px-0.5 rounded">gms</mark>{" "}
              <mark className="bg-red-500/80 text-white px-0.5 rounded">approx</mark>
              , manufactured with premium ingredients.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { term: '"net weight when packed"', rule: "Rule 11(1)" },
                { term: '"approx"', rule: "Rule 11(1)" },
                { term: '"gms"', rule: "Rule 13 / 2nd Sch." },
              ].map((p) => (
                <span key={p.term} className="inline-flex items-center gap-1.5 bg-red-900/60 border border-red-500/40 text-red-200 px-2 py-1 rounded text-[10px]">
                  <span className="font-bold text-red-400">PROHIBITED:</span> {p.term}
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-300">{p.rule}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Penalty & Directive */}
        <div className="text-xs sm:text-sm leading-relaxed space-y-3 mb-6 text-gray-800">
          <p>
            <strong>NOW THEREFORE</strong>, you are hereby called upon to <strong>SHOW CAUSE within fifteen (15) days</strong> of receipt of this notice as to why penal proceedings under <strong>Section 36(1) of the Legal Metrology Act, 2009</strong> (punishable with compounding fine up to ₹25,000 for the first offence, and subsequent fines up to ₹1,00,000 or imprisonment) should not be initiated against your establishment.
          </p>
          <p>
            Take note that failure to tender written representations within the stipulated 15-day period shall result in ex-parte referral to the Metropolitan Magistrate Court.
          </p>
        </div>

        {/* Cryptographic Chain-of-Custody Seal */}
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
              <div><strong>GPS Coordinates:</strong> {sealData?.gpsCoordinates?.latitude}, {sealData?.gpsCoordinates?.longitude}</div>
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
