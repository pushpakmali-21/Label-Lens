import React, { useState } from "react";
import { MapPin, Activity, ShieldAlert, CheckCircle2, TrendingDown, Eye, Filter, RefreshCw } from "lucide-react";
import { DISTRICT_METRICS, LIVE_AUDIT_FEED } from "../data/districtData";

export default function HeatmapMonitor() {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_METRICS[0]);
  const [feedFilter, setFeedFilter] = useState("all");

  const filteredFeed = LIVE_AUDIT_FEED.filter((item) => {
    if (feedFilter === "violation") return item.status === "violation";
    if (feedFilter === "pass") return item.status === "pass";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#26394B] pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#C9A15A]/10 border border-[#C9A15A]/30 text-[#C9A15A] text-xs font-mono mb-2">
          <MapPin size={14} />
          <span>E-Commerce Vigilance &amp; National Retail Auditing Network</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#EDEAE1]">
          District Compliance Heatmap &amp; Live E-Commerce Monitor
        </h1>
        <p className="text-xs sm:text-sm text-[#99AAB8] mt-1 max-w-3xl">
          Monitors physical retail and quick-commerce platforms at scale. Background workers audit live product carousels against registered LMPC parameters and aggregate regional enforcement hotspots for inspector deployment.
        </p>
      </div>

      {/* Aggregate KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-[#63768A]">Total SKUs Audited</div>
          <div className="text-2xl font-bold font-mono text-[#EDEAE1]">9,300+</div>
          <div className="text-[10.5px] text-[#5AAE83] flex items-center gap-1">
            <span>+1,420 physical + digital today</span>
          </div>
        </div>

        <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-[#63768A]">Avg Compliance Rate</div>
          <div className="text-2xl font-bold font-mono text-[#C9A15A]">82.5%</div>
          <div className="text-[10.5px] text-[#99AAB8]">Across 6 Major Retail Hubs</div>
        </div>

        <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-[#63768A]">Flagged Contraventions</div>
          <div className="text-2xl font-bold font-mono text-[#D06A5A]">1,478</div>
          <div className="text-[10.5px] text-[#D06A5A]">Non-compliant packages</div>
        </div>

        <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-[#63768A]">Sec 39 Notices Issued</div>
          <div className="text-2xl font-bold font-mono text-[#5AAE83]">412</div>
          <div className="text-[10.5px] text-[#99AAB8]">100% Cryptographically Sealed</div>
        </div>
      </div>

      {/* Main Grid: District Hotspots vs Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: District Level Hotspots */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#EDEAE1] flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#C9A15A]" />
              <span>Metropolitan District Compliance Hotspots</span>
            </h2>
            <span className="text-[10px] font-mono text-[#63768A]">DoCA Regional Field Offices</span>
          </div>

          <div className="space-y-2.5">
            {DISTRICT_METRICS.map((dist) => {
              const isSelected = selectedDistrict.id === dist.id;
              const isHighRisk = dist.riskLevel === "high";
              const isLowRisk = dist.riskLevel === "low";

              return (
                <div
                  key={dist.id}
                  onClick={() => setSelectedDistrict(dist)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#17293B] border-[#C9A15A] ring-1 ring-[#C9A15A]/30"
                      : "bg-[#121F2E] border-[#26394B] hover:border-[#63768A]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-[#EDEAE1]">{dist.name}</div>
                      <div className="text-[11px] text-[#63768A] font-mono">{dist.state}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-[#EDEAE1]">
                        {dist.complianceRate}%
                      </div>
                      <span
                        className={`text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                          isHighRisk
                            ? "bg-[#D06A5A]/10 text-[#D06A5A] border-[#D06A5A]/30"
                            : isLowRisk
                            ? "bg-[#5AAE83]/10 text-[#5AAE83] border-[#5AAE83]/30"
                            : "bg-[#DA9E4E]/10 text-[#DA9E4E] border-[#DA9E4E]/30"
                        }`}
                      >
                        {dist.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#0E1A26] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${dist.complianceRate}%`,
                        backgroundColor: isHighRisk ? "#D06A5A" : isLowRisk ? "#5AAE83" : "#DA9E4E",
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-[#99AAB8] flex items-center justify-between">
                    <span>Audited: <strong className="text-[#EDEAE1]">{dist.totalAudited}</strong></span>
                    <span>Violations: <strong className="text-[#D06A5A]">{dist.violations}</strong></span>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-[#26394B] text-xs text-[#C9A15A] font-mono">
                      Top Violation Pattern: <span className="text-[#EDEAE1]">{dist.topViolation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live E-Commerce & Retail Vigilance Stream */}
        <div className="lg:col-span-6 bg-[#121F2E] border border-[#26394B] rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#26394B]">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#5AAE83] animate-pulse" />
              <h2 className="text-sm font-semibold text-[#EDEAE1]">Live Market Vigilance Feed</h2>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              {["all", "violation", "pass"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFeedFilter(f)}
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border transition-all ${
                    feedFilter === f
                      ? "bg-[#C9A15A] text-[#241B08] font-bold border-[#C9A15A]"
                      : "bg-[#0E1A26] text-[#99AAB8] border-[#26394B] hover:text-[#EDEAE1]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Feed List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
            {filteredFeed.map((item) => {
              const isViol = item.status === "violation";
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded border text-xs space-y-1.5 ${
                    isViol
                      ? "bg-[#0E1A26] border-[#D06A5A]/40"
                      : "bg-[#0E1A26] border-[#5AAE83]/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-[#63768A]">
                      {item.id} • {item.platform}
                    </span>
                    <span className="font-mono text-[10px] text-[#99AAB8]">{item.timestamp}</span>
                  </div>

                  <div className="font-medium text-[#EDEAE1] flex items-center justify-between">
                    <span>{item.product}</span>
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        isViol ? "bg-[#D06A5A]/20 text-[#D06A5A]" : "bg-[#5AAE83]/20 text-[#5AAE83]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11.5px] text-[#99AAB8] leading-tight">
                    {item.issue}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10.5px] font-mono border-t border-[#26394B]/60">
                    <span className="text-[#63768A]">{item.citation}</span>
                    <span className={isViol ? "text-[#D06A5A] font-semibold" : "text-[#5AAE83]"}>
                      {item.action}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-[#26394B] flex items-center justify-between text-[11px] font-mono text-[#63768A]">
            <span>Automated Web Scraper: Active</span>
            <span className="text-[#5AAE83] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5AAE83] animate-pulse" />
              Checking Blinkit / Zepto / Amazon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
