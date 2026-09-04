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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#182032] to-[#111625] border border-[#232D45] rounded-2xl p-4 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-600/40 text-[#C084FC] text-[10.5px] font-mono font-semibold mb-2">
          <MapPin size={12} className="text-[#A855F7]" />
          <span>National Vigilance &amp; Retail Network</span>
        </div>
        <h1 className="text-base font-bold text-[#F8FAFC]">
          District Compliance &amp; Live Market Feed
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
          Automated background crawlers monitor physical retail and quick-commerce product displays across major metropolitan distribution hubs.
        </p>
      </div>

      {/* Compact 2x2 KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-3 space-y-1 shadow-md">
          <div className="text-[10px] font-mono text-[#64748B]">Audited SKUs</div>
          <div className="text-xl font-bold font-mono text-[#F8FAFC]">9,300+</div>
          <div className="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
            <span>+1,420 today</span>
          </div>
        </div>

        <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-3 space-y-1 shadow-md">
          <div className="text-[10px] font-mono text-[#64748B]">Compliance Rate</div>
          <div className="text-xl font-bold font-mono text-[#A855F7]">82.5%</div>
          <div className="text-[10px] text-[#94A3B8]">Across 6 Hubs</div>
        </div>

        <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-3 space-y-1 shadow-md">
          <div className="text-[10px] font-mono text-[#64748B]">Contraventions</div>
          <div className="text-xl font-bold font-mono text-[#EF4444]">1,478</div>
          <div className="text-[10px] text-[#EF4444]">Non-compliant</div>
        </div>

        <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-3 space-y-1 shadow-md">
          <div className="text-[10px] font-mono text-[#64748B]">Sec 39 Notices</div>
          <div className="text-xl font-bold font-mono text-[#10B981]">412</div>
          <div className="text-[10px] text-[#10B981]">100% Sealed</div>
        </div>
      </div>

      {/* District Hotspots - Swipeable Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            District Hotspots
          </h2>
          <span className="text-[10px] font-mono text-purple-400">Swipe cards →</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar snap-x-mandatory pb-1">
          {DISTRICT_METRICS.map((dist) => {
            const isSelected = selectedDistrict.id === dist.id;
            const isHighRisk = dist.riskLevel === "high";
            const isLowRisk = dist.riskLevel === "low";

            return (
              <div
                key={dist.id}
                onClick={() => setSelectedDistrict(dist)}
                className={`snap-start flex-none w-[200px] p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-purple-950/40 border-[#8B5CF6] ring-1 ring-[#8B5CF6]/50 shadow-purple-glow"
                    : "bg-[#111625] border-[#232D45]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">{dist.name}</div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                      isHighRisk
                        ? "bg-[#EF4444]/15 text-[#EF4444]"
                        : isLowRisk
                        ? "bg-[#10B981]/15 text-[#10B981]"
                        : "bg-[#F59E0B]/15 text-[#F59E0B]"
                    }`}
                  >
                    {dist.riskLevel}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] font-mono">{dist.state}</div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#07090F] rounded-full overflow-hidden my-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${dist.complianceRate}%`,
                      backgroundColor: isHighRisk ? "#EF4444" : isLowRisk ? "#10B981" : "#F59E0B",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-[#94A3B8]">
                  <span>Score: <strong className="text-[#F8FAFC]">{dist.complianceRate}%</strong></span>
                  <span>Viol: <strong className="text-[#EF4444]">{dist.violations}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected District Detail Card */}
      {selectedDistrict && (
        <div className="p-3 bg-[#111625] border border-purple-500/30 rounded-2xl text-xs space-y-1 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F8FAFC]">{selectedDistrict.name} Top Infraction</span>
            <span className="text-[10px] font-mono text-[#C084FC]">{selectedDistrict.totalAudited} Audited</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">{selectedDistrict.topViolation}</p>
        </div>
      )}

      {/* Live Market Vigilance Feed */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-[#232D45]">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-[#10B981] animate-pulse" />
            <h2 className="text-xs font-semibold text-[#F8FAFC]">Live Market Vigilance Feed</h2>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1">
            {["all", "violation", "pass"].map((f) => (
              <button
                key={f}
                onClick={() => setFeedFilter(f)}
                className={`text-[9.5px] font-mono uppercase px-2 py-0.5 rounded-lg border transition-all ${
                  feedFilter === f
                    ? "bg-purple-600 text-white font-bold border-purple-500 shadow-purple-glow"
                    : "bg-[#07090F] text-[#94A3B8] border-[#232D45]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar pr-0.5">
          {filteredFeed.map((item) => {
            const isViol = item.status === "violation";
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isViol
                    ? "bg-[#07090F] border-[#EF4444]/30"
                    : "bg-[#07090F] border-[#10B981]/25"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#64748B]">
                    {item.platform}
                  </span>
                  <span className="font-mono text-[9.5px] text-[#94A3B8]">{item.timestamp}</span>
                </div>

                <div className="font-semibold text-[#F8FAFC] flex items-center justify-between">
                  <span className="truncate max-w-[200px]">{item.product}</span>
                  <span
                    className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      isViol ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#10B981]/20 text-[#10B981]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#94A3B8] leading-tight">
                  {item.issue}
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] font-mono border-t border-[#232D45]">
                  <span className="text-[#64748B]">{item.citation}</span>
                  <span className={isViol ? "text-[#EF4444] font-semibold" : "text-[#10B981]"}>
                    {item.action}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#232D45] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
          <span>Crawler: Blinkit / Zepto / Amazon</span>
          <span className="text-[#10B981] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
