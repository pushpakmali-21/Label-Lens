import React, { useState } from "react";
import {
  Eye,
  Scan,
  TrendingUp,
  AlertCircle,
  FileText,
  Filter,
  FolderOpen,
  ArrowRight,
  Download,
  Edit2,
  Clock
} from "lucide-react";

export default function HomePage({ onStartOfficial, onStartCitizen, onOpenScanner, userRole }) {
  const [dragActive, setDragActive] = useState(false);
  const [filter, setFilter] = useState("All");

  // Mock recent activity data
  const allActivity = [
    { id: 1, type: "Scan", title: "Organic Energy Pouch", status: "Pass", time: "2m ago", thumbnail: "https://images.unsplash.com/photo-1599021456807-25e0f54518cc?auto=format&fit=crop&w=150&q=80" },
    { id: 2, type: "Scan", title: "Ayurvedic Shampoo", status: "Rule 8 Violation", time: "15m ago", thumbnail: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=150&q=80" },
    { id: 3, type: "Report", title: "Missing MRP - Local Store", status: "Reviewing", time: "1h ago", thumbnail: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=150&q=80" },
    { id: 4, type: "Notice", title: "Notice #LMA-992 Issued", status: "Sent", time: "3h ago", thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=150&q=80" },
  ];

  const recentActivity = filter === "All" ? allActivity : allActivity.filter(a => a.status.includes(filter) || (filter === "Non-Compliant" && a.status === "Rule 8 Violation"));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onStartOfficial();
    }
  };

  return (
    <div className="w-full space-y-10 pb-16 font-sans text-[#20252B] animate-fadeIn">

      {/* Editorial Section Header */}
      <header className="border-b border-[#D8D7D2] pb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-[10px] text-[#59636E] letter-spacing-[0.15em]">01 /</span>
          <span className="w-8 h-px bg-[#D8D7D2]" />
          <span className="font-mono text-[10px] text-[#59636E] letter-spacing-[0.15em] uppercase">Command Center</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#20252B] font-normal tracking-tight mb-2">
          Inspection &amp; Regulatory Command Center
        </h1>
        <p className="text-sm text-[#59636E] max-w-2xl leading-relaxed">
          Real-time Legal Metrology indexing, mandatory declaration extraction, and automated statutory notice generation.
        </p>
      </header>

      {/* Main Intake & Stats Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Drag & Drop Zone */}
        <div className="lg:col-span-2 bg-[#F8F7F3] border border-[#D8D7D2] p-6 sm:p-8 flex flex-col justify-center relative">
          <div className="flex justify-between items-start mb-6 z-10">
            <div>
              <div className="font-mono text-[10px] text-[#183D35] uppercase tracking-widest mb-1 font-semibold">Stage 01 • Ingestion</div>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#20252B]">Label &amp; Packaging Ingestion</h2>
            </div>
            <span className="font-mono text-[9px] text-[#59636E] bg-white border border-[#D8D7D2] px-2.5 py-1 tracking-wider uppercase">
              SHA-256 Vault
            </span>
          </div>

          <div
            className={`relative z-10 border border-dashed p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? "border-[#183D35] bg-white" : "border-[#D8D7D2] bg-white hover:bg-[#F7F5F0]"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FolderOpen size={36} className="mb-3 text-[#183D35]" strokeWidth={1.5} />
            <h3 className="font-serif text-lg text-[#20252B] mb-1">Drag packaging assets here</h3>
            <p className="text-xs text-[#59636E] mb-6 font-mono">Strictly JPEG, PNG, WEBP or PDF formats</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={onOpenScanner}
                className="w-full sm:w-auto bg-[#183D35] hover:bg-[#0f2a23] text-white font-sans text-xs font-semibold px-6 py-2.5 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
              >
                <Scan size={15} />
                Live Camera Scan
              </button>

              <label className="w-full sm:w-auto cursor-pointer bg-white hover:bg-[#F0EEE9] text-[#20252B] border border-[#D8D7D2] font-sans text-xs font-medium px-6 py-2.5 transition-all flex items-center justify-center gap-2">
                <FolderOpen size={15} />
                Browse File
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onStartOfficial();
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Global Metrics */}
        <div className="bg-white border border-[#D8D7D2] p-6 flex flex-col justify-between">
          <div className="border-b border-[#D8D7D2] pb-3 mb-4">
            <span className="font-mono text-[10px] text-[#59636E] uppercase tracking-wider block">Global Analytics</span>
            <h2 className="font-serif text-xl text-[#20252B] font-normal">Audit Metrics</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#F8F7F3] border border-[#D8D7D2]">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#59636E]">Total Package Audits</div>
              <div className="font-serif text-3xl text-[#20252B] mt-1 font-normal">1,248</div>
            </div>

            <div className="p-4 bg-[#F8F7F3] border border-[#D8D7D2]">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#166534]">Rule 6 Compliant</div>
              <div className="font-serif text-3xl text-[#166534] mt-1 font-normal">892</div>
            </div>

            <div className="p-4 bg-[#F8F7F3] border border-[#D8D7D2]">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#C9572C]">Contraventions Flagged</div>
              <div className="font-serif text-3xl text-[#C9572C] mt-1 font-normal flex items-center justify-between">
                <span>356</span>
                <TrendingUp size={20} className="text-[#C9572C]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Core Modules) */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[10px] text-[#59636E] letter-spacing-[0.15em]">02 /</span>
          <span className="w-8 h-px bg-[#D8D7D2]" />
          <span className="font-mono text-[10px] text-[#59636E] letter-spacing-[0.15em] uppercase">Systems</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={onStartOfficial}
            className="cursor-pointer bg-white border border-[#D8D7D2] p-5 hover:bg-[#F8F7F3] transition-all flex items-start gap-4"
          >
            <div className="w-10 h-10 flex-shrink-0 bg-[#183D35] text-white flex items-center justify-center">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-[#20252B] mb-0.5">Enforcement Suite</h3>
              <p className="text-xs text-[#59636E]">Full OCR &amp; mandatory Rule 6 extraction panel.</p>
            </div>
          </div>

          <div
            className="cursor-pointer bg-white border border-[#D8D7D2] p-5 hover:bg-[#F8F7F3] transition-all flex items-start gap-4"
          >
            <div className="w-10 h-10 flex-shrink-0 bg-[#20252B] text-white flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-[#20252B] mb-0.5">Notice Generator</h3>
              <p className="text-xs text-[#59636E]">Draft Section 39 legal citations instantly.</p>
            </div>
          </div>

          {userRole !== "official" ? (
            <div
              onClick={onStartCitizen}
              className="cursor-pointer bg-[#183D35] text-white border border-[#183D35] p-5 hover:bg-[#0f2a23] transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 flex-shrink-0 bg-white text-[#183D35] flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-white mb-0.5">Citizen Portal</h3>
                <p className="text-xs text-white/80">Launch public violation reporting tool.</p>
              </div>
            </div>
          ) : (
            <div
              className="cursor-pointer bg-white border border-[#D8D7D2] p-5 hover:bg-[#F8F7F3] transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 flex-shrink-0 bg-[#F0EEE9] text-[#C9572C] flex items-center justify-center border border-[#D8D7D2]">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-[#20252B] mb-0.5">Active Alerts</h3>
                <p className="text-xs text-[#59636E]">Investigate flagged marketplace operations.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity Ledger */}
      <section className="bg-white border border-[#D8D7D2] p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 border-b border-[#D8D7D2] pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[10px] text-[#59636E] letter-spacing-[0.15em]">03 /</span>
              <span className="w-8 h-px bg-[#D8D7D2]" />
              <span className="font-mono text-[10px] text-[#59636E] letter-spacing-[0.15em] uppercase">Audit Ledger</span>
            </div>
            <h2 className="font-serif text-2xl text-[#20252B] font-normal">Inspection Ledger</h2>
          </div>
          <div className="mt-4 sm:mt-0 relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#F8F7F3] border border-[#D8D7D2] font-mono text-xs py-2 pl-3 pr-8 focus:outline-none cursor-pointer text-[#20252B]"
            >
              <option value="All">All Records</option>
              <option value="Non-Compliant">Violations</option>
              <option value="Reviewing">In Review</option>
              <option value="Pass">Pass</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-[#D8D7D2] border border-[#D8D7D2]">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-[#F8F7F3] transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-[#D8D7D2] overflow-hidden flex-shrink-0 bg-[#F0EEE9]">
                  <img src={activity.thumbnail} alt={activity.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-sans font-medium text-sm text-[#20252B]">{activity.title}</div>
                  <div className="text-[11px] font-mono text-[#59636E] mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#C9572C]"><Clock size={11} /> {activity.time}</span>
                    <span>Ref: LMA-{activity.id}892</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                <span className={`font-mono text-[9px] uppercase px-2.5 py-1 letter-spacing-[0.08em] border ${activity.status.includes('Violation') ? 'bg-[#FFF7ED] text-[#C9572C] border-[#FED7AA]' :
                    activity.status === 'Reviewing' ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' :
                      'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                  }`}>
                  {activity.status}
                </span>
                <div className="flex items-center gap-2 pl-4 border-l border-[#D8D7D2]">
                  <button className="p-1.5 text-[#59636E] hover:text-[#20252B]" title="Download">
                    <Download size={15} />
                  </button>
                  <button className="p-1.5 text-[#59636E] hover:text-[#20252B]" title="View">
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
