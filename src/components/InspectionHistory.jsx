import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Download, History, XCircle } from "lucide-react";
import { generateComplianceReport } from "../utils/pdfReport";

function readOfflineReports() {
  try {
    const storedReports = JSON.parse(localStorage.getItem("offlineReports") || "[]");
    return Array.isArray(storedReports)
      ? storedReports.filter((report) => report && typeof report === "object")
      : [];
  } catch {
    return [];
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "Unknown time";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function canRedownload(report) {
  const hasProductData = typeof report.productName === "string" && report.productName.trim();
  const isPass = report.scanStatus === "pass";
  const hasFailureDetails = report.scanStatus === "fail" && Array.isArray(report.violations);
  return Boolean(hasProductData && (isPass || hasFailureDetails));
}

export default function InspectionHistory() {
  const [reports, setReports] = useState([]);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    setReports(readOfflineReports());
  }, []);

  const handleRedownload = (report, reportIndex) => {
    setDownloadError(null);

    try {
      generateComplianceReport(
        {
          name: report.productName,
          brand: report.brand,
          ...(Array.isArray(report.violations) ? { violations: report.violations } : {}),
        },
        report.scanStatus,
      );
    } catch {
      setDownloadError(reportIndex);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto space-y-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brass/10 border border-brass/30 flex items-center justify-center text-brass">
          <History size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-1">Inspection History</h1>
          <p className="text-sm text-text-2">Your saved offline scans and inspection results.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="glass-panel text-center p-8 sm:p-12 space-y-3">
          <Clock3 size={34} className="mx-auto text-text-3" />
          <h2 className="text-lg font-semibold text-text-1">No inspection history yet.</h2>
          <p className="text-sm text-text-2">Your previous scans will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report, reportIndex) => {
            const isPass = report.scanStatus === "pass";
            const downloadable = canRedownload(report);

            return (
              <article
                key={report.inspectionId || `${report.timestamp}-${reportIndex}`}
                className="bg-panel rounded-xl border border-panel-line p-4 sm:p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-text-1 truncate">
                      {report.productName || "Unnamed product"}
                    </h2>
                    {report.brand && <p className="text-sm text-text-2 mt-1">{report.brand}</p>}
                  </div>
                  <span
                    className={`flex-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${isPass
                      ? "bg-status-pass/10 text-status-pass border-status-pass/30"
                      : "bg-status-fail/10 text-status-fail border-status-fail/30"
                      }`}
                  >
                    {isPass ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {isPass ? "Pass" : "Fail"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-text-3 font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {formatTimestamp(report.timestamp)}
                  </span>
                  {downloadable && (
                    <button
                      type="button"
                      onClick={() => handleRedownload(report, reportIndex)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-panel-raised border border-panel-line text-text-1 hover:text-brass hover:border-brass/40 transition-colors"
                    >
                      <Download size={14} />
                      Re-download PDF
                    </button>
                  )}
                </div>

                {downloadError === reportIndex && (
                  <p className="mt-3 text-xs text-status-fail">Unable to generate this PDF. Please try again.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
