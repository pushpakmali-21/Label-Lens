import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ClipboardList, Clock3, FileWarning } from "lucide-react";
import { getLiveAuditFeed } from "../data/districtData";

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

function normalizeReports() {
  const liveReports = getLiveAuditFeed().map((report) => ({
    id: report.id,
    product: report.product || "Unnamed product",
    status: report.status,
    issue: report.issue,
    timestamp: report.timestamp,
    source: report.isCitizenReport ? "Citizen report" : report.platform,
  }));

  const offlineReports = readOfflineReports().map((report, index) => ({
    id: report.inspectionId || `offline-${index}`,
    product: report.productName || "Unnamed product",
    status: report.scanStatus === "pass" ? "pass" : report.scanStatus === "fail" ? "violation" : report.scanStatus,
    issue: report.issue,
    timestamp: report.timestamp,
    source: "Offline scan",
  }));

  return [...liveReports, ...offlineReports];
}

function StatusBadge({ status }) {
  const isPass = status === "pass";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono uppercase ${isPass
        ? "bg-status-pass/10 text-status-pass border-status-pass/30"
        : "bg-status-fail/10 text-status-fail border-status-fail/30"
        }`}
    >
      {isPass ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
      {isPass ? "Pass" : status || "Unknown"}
    </span>
  );
}

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(normalizeReports());
  }, []);

  const passedReports = reports.filter((report) => report.status === "pass");
  const violationReports = reports.filter((report) => report.status === "violation");
  const pendingCitizenReports = reports.filter((report) => report.source === "Citizen report");
  const recentReports = reports.slice(0, 8);
  const statusTotal = passedReports.length + violationReports.length;
  const passPercentage = statusTotal ? Math.round((passedReports.length / statusTotal) * 100) : 0;
  const violationPercentage = statusTotal ? Math.round((violationReports.length / statusTotal) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-panel-line pb-4 sm:pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
          <Activity size={14} />
          <span>System Administration</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-1">Admin Dashboard</h1>
        <p className="text-xs sm:text-sm text-text-2 mt-1 max-w-3xl leading-relaxed">
          Review current inspection activity, citizen submissions, and compliance outcomes stored by LabelLens.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-3"><ClipboardList size={14} className="text-brass" />Total Reports</div>
          <div className="text-2xl font-bold font-mono text-text-1">{reports.length}</div>
          <div className="text-[10.5px] text-text-2">Live feed and offline scans</div>
        </div>
        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-3"><FileWarning size={14} className="text-status-fail" />Active Violations</div>
          <div className="text-2xl font-bold font-mono text-status-fail">{violationReports.length}</div>
          <div className="text-[10.5px] text-text-2">Reports marked violation</div>
        </div>
        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-3"><CheckCircle2 size={14} className="text-status-pass" />Passed Inspections</div>
          <div className="text-2xl font-bold font-mono text-status-pass">{passedReports.length}</div>
          <div className="text-[10.5px] text-text-2">Reports marked pass</div>
        </div>
        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-3"><Clock3 size={14} className="text-brass" />Citizen Reports</div>
          <div className="text-2xl font-bold font-mono text-brass">{pendingCitizenReports.length}</div>
          <div className="text-[10.5px] text-text-2">Stored citizen submissions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 bg-panel border border-panel-line rounded-lg p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-panel-line">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-brass" />
              <h2 className="text-sm font-semibold text-text-1">Recent Reports</h2>
            </div>
            <span className="text-[10px] font-mono text-text-3">{recentReports.length} shown</span>
          </div>

          {recentReports.length === 0 ? (
            <div className="min-h-28 flex items-center justify-center rounded border border-dashed border-panel-line px-4 text-center text-xs text-text-3">
              No reports available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="text-[10px] font-mono uppercase text-text-3 border-b border-panel-line">
                  <tr>
                    <th className="pb-2 pr-3 font-normal">Product</th>
                    <th className="pb-2 pr-3 font-normal">Status</th>
                    <th className="pb-2 pr-3 font-normal">Issue</th>
                    <th className="pb-2 font-normal">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr key={report.id} className="border-b border-panel-line/70 last:border-0 align-top">
                      <td className="py-3 pr-3 font-medium text-text-1 max-w-[150px]">{report.product}</td>
                      <td className="py-3 pr-3"><StatusBadge status={report.status} /></td>
                      <td className="py-3 pr-3 text-text-2 max-w-[220px]">{report.issue || "No issue details stored"}</td>
                      <td className="py-3 text-text-3 whitespace-nowrap">{formatTimestamp(report.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="lg:col-span-2 bg-panel border border-panel-line rounded-lg p-4 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-panel-line">
            <FileWarning size={16} className="text-status-fail" />
            <h2 className="text-sm font-semibold text-text-1">Violations &amp; Status</h2>
          </div>

          {statusTotal === 0 ? (
            <div className="min-h-28 flex items-center justify-center rounded border border-dashed border-panel-line px-4 text-center text-xs text-text-3">
              No status data available yet.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-2">Passed inspections</span>
                  <strong className="font-mono text-status-pass">{passedReports.length} ({passPercentage}%)</strong>
                </div>
                <div className="h-2 rounded-full bg-panel-darker overflow-hidden">
                  <div className="h-full rounded-full bg-status-pass" style={{ width: `${passPercentage}%` }} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-2">Violations</span>
                  <strong className="font-mono text-status-fail">{violationReports.length} ({violationPercentage}%)</strong>
                </div>
                <div className="h-2 rounded-full bg-panel-darker overflow-hidden">
                  <div className="h-full rounded-full bg-status-fail" style={{ width: `${violationPercentage}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-panel-line text-xs text-text-2">
                Status totals are calculated from the current live audit feed and locally stored offline scan results.
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
