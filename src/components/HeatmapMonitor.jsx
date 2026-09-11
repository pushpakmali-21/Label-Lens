import React, { useState } from "react";
import { MapPin, Activity, ShieldAlert, CheckCircle2, TrendingDown, Eye, Filter, RefreshCw, Search, SearchX } from "lucide-react";
import { DISTRICT_METRICS, LIVE_AUDIT_FEED, getLiveAuditFeed } from "../data/districtData";

export default function HeatmapMonitor({ refreshKey }) {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_METRICS[0]);
  const [feedFilter, setFeedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const feed = getLiveAuditFeed();

  const filteredFeed = feed.filter((item) => {
    const matchesStatus = feedFilter === "all" || item.status === feedFilter;
    const query = searchQuery.trim().toLowerCase();
    const searchableFields = [
      item.product,
      item.seller,
      item.brand,
      item.id,
      item.district,
      item.location,
      item.platform,
    ];
    const matchesSearch = !query || searchableFields.some((field) =>
      String(field || "").toLowerCase().includes(query)
    );

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-panel-line pb-4 sm:pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
          <MapPin size={14} />
          <span>E-Commerce Vigilance &amp; National Retail Auditing Network</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-1">
          District Compliance Heatmap &amp; Live E-Commerce Monitor
        </h1>
        <p className="text-xs sm:text-sm text-text-2 mt-1 max-w-3xl leading-relaxed">
          Monitors physical retail and quick-commerce platforms at scale. Background workers audit live product carousels against registered LMPC parameters and aggregate regional enforcement hotspots for inspector deployment.
        </p>
      </div>

      {/* Aggregate KPI Stats (Responsive 2x2 on mobile, 4-col on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-text-3">Total SKUs Audited</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-text-1">9,300+</div>
          <div className="text-[10.5px] text-status-pass flex items-center gap-1">
            <span>+1,420 physical + digital today</span>
          </div>
        </div>

        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-text-3">Avg Compliance Rate</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-brass">82.5%</div>
          <div className="text-[10.5px] text-text-2">Across 6 Major Retail Hubs</div>
        </div>

        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-text-3">Flagged Contraventions</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-status-fail">1,478</div>
          <div className="text-[10.5px] text-status-fail">Non-compliant packages</div>
        </div>

        <div className="bg-panel border border-panel-line rounded-lg p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-text-3">Sec 39 Notices Issued</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-status-pass">412</div>
          <div className="text-[10.5px] text-text-2">100% Cryptographically Sealed</div>
        </div>
      </div>

      {/* Main Grid: District Hotspots vs Live Stream (Responsive 12-column grid on desktop, single-column on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: District Level Hotspots */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-1 flex items-center gap-2">
              <ShieldAlert size={16} className="text-brass" />
              <span>Metropolitan District Compliance Hotspots</span>
            </h2>
            <span className="text-[10px] font-mono text-text-3">DoCA Field Offices</span>
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
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${isSelected
                      ? "bg-panel-raised border-brass ring-1 ring-brass/30"
                      : "bg-panel border-panel-line hover:border-text-3"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-text-1">{dist.name}</div>
                      <div className="text-[11px] text-text-3 font-mono">{dist.state}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-text-1">
                        {dist.complianceRate}%
                      </div>
                      <span
                        className={`text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded border ${isHighRisk
                            ? "bg-status-fail/10 text-status-fail border-status-fail/30"
                            : isLowRisk
                              ? "bg-status-pass/10 text-status-pass border-status-pass/30"
                              : "bg-status-review/10 text-status-review border-status-review/30"
                          }`}
                      >
                        {dist.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-panel-darker rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${dist.complianceRate}%`,
                        backgroundColor: isHighRisk ? "#D06A5A" : isLowRisk ? "#5AAE83" : "#DA9E4E",
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-text-2 flex items-center justify-between">
                    <span>Audited: <strong className="text-text-1">{dist.totalAudited}</strong></span>
                    <span>Violations: <strong className="text-status-fail">{dist.violations}</strong></span>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-panel-line text-xs text-brass font-mono">
                      Top Violation Pattern: <span className="text-text-1">{dist.topViolation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live E-Commerce & Retail Vigilance Stream */}
        <div className="lg:col-span-6 bg-panel border border-panel-line rounded-lg p-4 flex flex-col min-h-[380px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-panel-line">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-status-pass animate-pulse" />
              <h2 className="text-sm font-semibold text-text-1">Live Market Vigilance Feed</h2>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 text-xs">
              {["all", "violation", "pass"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFeedFilter(f)}
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border transition-all ${feedFilter === f
                      ? "bg-brass text-brass-ink font-bold border-brass"
                      : "bg-panel-darker text-text-2 border-panel-line hover:text-text-1"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search product, seller, ID, or district"
              aria-label="Search audit reports"
              className="w-full rounded border border-panel-line bg-panel-darker py-2 pl-9 pr-3 text-xs text-text-1 placeholder:text-text-3 outline-none transition-colors focus:border-brass"
            />
          </div>

          {/* Feed List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin">
            {filteredFeed.length === 0 ? (
              <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded border border-dashed border-panel-line px-4 text-center text-xs text-text-3">
                <SearchX size={24} className="text-text-3" />
                {feed.length === 0 ? (
                  <>
                    <div className="text-text-2">No inspection data available.</div>
                  </>
                ) : (
                  <>
                    <div className="text-text-2">No results found</div>
                    <div>Try a different search term or clear your search.</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setFeedFilter("all");
                      }}
                      className="mt-1 rounded border border-panel-line bg-panel-darker px-3 py-1.5 text-[10px] font-mono uppercase text-text-2 hover:border-brass hover:text-brass transition-colors"
                    >
                      Clear Search
                    </button>
                  </>
                )}
              </div>
            ) : filteredFeed.map((item) => {
              const isViol = item.status === "violation";
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded border text-xs space-y-1.5 ${isViol
                      ? "bg-panel-darker border-status-fail/40"
                      : "bg-panel-darker border-status-pass/30"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-text-3">
                      {item.id} • {item.platform}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.isCitizenReport && (
                        <span className="text-[9px] font-mono bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded border border-[#3B82F6]/40 uppercase">
                          Citizen Report
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-text-2">{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="font-medium text-text-1 flex items-center justify-between">
                    <span className="truncate max-w-[200px] sm:max-w-none">{item.product}</span>
                    <span
                      className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded flex-none ${isViol ? "bg-status-fail/20 text-status-fail" : "bg-status-pass/20 text-status-pass"
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11.5px] text-text-2 leading-tight">
                    {item.issue}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10.5px] font-mono border-t border-panel-line/60">
                    <span className="text-text-3 truncate">{item.citation}</span>
                    <span className={isViol ? "text-status-fail font-semibold" : "text-status-pass"}>
                      {item.action}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-panel-line flex items-center justify-between text-[11px] font-mono text-text-3">
            <span>Automated Web Scraper: Active</span>
            <span className="text-status-pass flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-status-pass animate-pulse" />
              Checking Blinkit / Zepto / Amazon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
