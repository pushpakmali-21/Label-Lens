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
    <div className="w-full space-y-12 pb-16 font-sans text-black animate-fadeIn">

      {/* Brutalist Header Area */}
      <header className="border-b-4 border-black pb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">Command Center</h1>
        <p className="text-xl font-medium max-w-2xl">
          Real-time Legal Metrology indexing, scanning, and violation generation.
        </p>
      </header>

      {/* Main Intake & Stats Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Drag & Drop Zone (Flat Brutalist design) */}
        <div className="lg:col-span-2 bg-[#F3F4F6] border-4 border-black shadow-[8px_8px_0_0_#000] p-8 flex flex-col justify-center relative overflow-hidden transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-[12px_12px_0_0_#000]">

          <div className="flex justify-between items-start mb-8 z-10">
            <div>
              <h2 className="text-2xl font-black uppercase mb-1 text-black">Data Intake</h2>
              <p className="text-sm font-semibold">Feed images/PDFs into the automated AI engine.</p>
            </div>
            <div className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest border-2 border-black">
              SHA-256 Vault
            </div>
          </div>

          <div
            className={`relative z-10 border-4 border-dashed rounded-none p-12 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? "border-[#FF4500] bg-white" : "border-black bg-white hover:bg-[#FAF9F6]"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FolderOpen size={48} className="mb-4 text-black" strokeWidth={1.5} />
            <h3 className="text-xl font-black uppercase mb-1">Drag Assets Here</h3>
            <p className="text-sm font-semibold text-slate-500 mb-8">Strictly JPEG, PNG, or PDF formats.</p>

            <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
              {/* Primary Action Button defaults to a strong high-contrast color */}
              <button
                onClick={onOpenScanner}
                className="w-full sm:w-auto bg-[#FF4500] hover:bg-[#E03E00] text-white border-2 border-black font-black uppercase tracking-wide text-sm px-8 py-4 shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all flex items-center justify-center gap-3"
              >
                <Scan size={18} strokeWidth={2.5} />
                Live Scan
              </button>

              <label className="w-full sm:w-auto cursor-pointer bg-white hover:bg-slate-100 text-black border-2 border-black font-black uppercase tracking-wide text-sm px-8 py-4 shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all flex items-center justify-center gap-3">
                <FolderOpen size={18} strokeWidth={2.5} />
                Browse
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

        {/* Right: Quick Stats */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-6 flex flex-col">
          <h2 className="text-lg font-black uppercase tracking-wide mb-6">Global Metrics</h2>

          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="bg-[#FAF9F6] border-2 border-black p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-[#FF4500] mb-1">Total Audits</div>
              <div className="text-4xl font-black">1,248</div>
            </div>

            <div className="bg-[#FAF9F6] border-2 border-black p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Compliant</div>
              <div className="text-4xl font-black">892</div>
            </div>

            <div className="bg-[#FAF9F6] border-2 border-black p-4 flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-black mb-1">Pending</div>
              <div className="text-4xl font-black flex items-center gap-3">
                142
                <TrendingUp size={24} className="text-[#FF4500]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid (Role-Based) */}
      <section>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
          <span className="bg-black text-white px-2 py-1">Systems</span> Core Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={onStartOfficial}
            className="cursor-pointer bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 flex-shrink-0 bg-black text-white flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase mb-1">Enforcement Suite</h3>
              <p className="text-sm font-semibold text-slate-600">Full OCR & Rule extraction panel.</p>
            </div>
          </div>

          <div
            className="cursor-pointer bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 flex-shrink-0 bg-black text-white flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg uppercase mb-1">Notice Generator</h3>
              <p className="text-sm font-semibold text-slate-600">Draft legal citations instantly.</p>
            </div>
          </div>

          {userRole !== "official" ? (
            <div
              onClick={onStartCitizen}
              className="cursor-pointer bg-[#FF4500] text-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-white text-black flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase mb-1">Citizen Portal</h3>
                <p className="text-sm font-semibold text-white/80">Launch public reporting tool.</p>
              </div>
            </div>
          ) : (
            <div
              className="cursor-pointer bg-[#FAF9F6] border-2 border-black p-6 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 flex-shrink-0 bg-black text-[#FF4500] flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase mb-1">Active Alerts</h3>
                <p className="text-sm font-semibold text-slate-600">Investigate flagged operations.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Enriched Recent Activity */}
      <section className="bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0_0_#000]">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b-2 border-black pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">Inspection Ledger</h2>
            <p className="text-sm font-semibold mt-1">Authorized access log overview.</p>
          </div>
          <div className="mt-4 sm:mt-0 relative group">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-[#FAF9F6] border-2 border-black font-black uppercase text-xs py-3 pl-4 pr-10 focus:outline-none focus:ring-0 rounded-none cursor-pointer"
            >
              <option value="All">All Records</option>
              <option value="Non-Compliant">Violations</option>
              <option value="Reviewing">In Review</option>
              <option value="Pass">Pass</option>
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-2 border-black bg-white hover:bg-[#FAF9F6] transition-colors gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 border-2 border-black overflow-hidden flex-shrink-0 bg-slate-100">
                  <img src={activity.thumbnail} alt={activity.title} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <div className="font-black text-lg text-black uppercase">{activity.title}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#FF4500]"><Clock size={12} strokeWidth={3} /> {activity.time}</span>
                    <span>LMA-{activity.id}892</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto">
                <div className={`text-xs font-black uppercase px-3 py-1.5 border-2 border-black ${activity.status.includes('Violation') ? 'bg-black text-white' :
                    activity.status === 'Reviewing' ? 'bg-[#FF4500] text-white' :
                      activity.status === 'Sent' ? 'bg-slate-200 text-black' :
                        'bg-white text-black'
                  }`}>
                  {activity.status}
                </div>
                <div className="flex items-center gap-2 border-l-2 border-black pl-5">
                  <button className="p-2 border-2 border-transparent hover:border-black transition-colors" title="Download">
                    <Download size={18} strokeWidth={2.5} />
                  </button>
                  <button className="p-2 border-2 border-transparent hover:border-black transition-colors" title="Edit">
                    <Edit2 size={18} strokeWidth={2.5} />
                  </button>
                  <button className="p-2 border-2 border-transparent hover:border-black transition-colors" title="View">
                    <ArrowRight size={18} strokeWidth={2.5} />
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
