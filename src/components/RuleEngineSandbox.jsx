import React, { useState, useMemo } from "react";
import { Sliders, AlertOctagon, CheckSquare, Search, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";
import lmpcRules from "../data/lmpcRules.json";
import { resolveFontSlab, detectProhibitedExpressions, validateConsumerCare } from "../utils/lmpcValidator";

export default function RuleEngineSandbox() {
  // Slab resolver state
  const [testWeight, setTestWeight] = useState(250);

  // Prohibited words state
  const [testText, setTestText] = useState("Net weight when packed: 500 gms approx, manufactured with premium ingredients.");

  // Consumer care state
  const [consumerCare, setConsumerCare] = useState({
    name: "Customer Redressal Officer",
    telephone: "1800-111-2233",
    email: "",
    address: "Plot 24, Industrial Area, Sector 5, Gurugram, Haryana",
  });

  const resolvedSlab = useMemo(() => resolveFontSlab(testWeight), [testWeight]);
  const detectedViolations = useMemo(() => detectProhibitedExpressions(testText), [testText]);
  const careValidation = useMemo(() => validateConsumerCare(consumerCare), [consumerCare]);

  const presetExpressions = [
    "Net weight when packed 1000 g",
    "Net Quantity: 250 gms",
    "Approximate weight 500 g",
    "Net Quantity: 200 g (Standard SI unit)",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#182032] to-[#111625] border border-[#232D45] rounded-2xl p-4 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-600/40 text-[#C084FC] text-[10.5px] font-mono font-semibold mb-2">
          <Sliders size={12} className="text-[#A855F7]" />
          <span>Config-Driven Rule Engine</span>
        </div>
        <h1 className="text-base font-bold text-[#F8FAFC]">
          LMPC Rules &amp; Prohibited Words Sandbox
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
          Test how the rule engine dynamically resolves weight slabs under Rule 7, screens for blacklisted expressions under Rule 11/13, and validates consumer grievance disclosures.
        </p>
      </div>

      {/* Dynamic Weight Slab Resolver */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
            <BookOpen size={15} className="text-[#A855F7]" />
            <span>Weight Slab Resolver (Rule 7)</span>
          </div>
          <span className="text-[10px] font-mono bg-purple-950/80 text-[#C084FC] px-2 py-0.5 rounded-full border border-purple-800/40">
            Second Schedule
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] text-[#94A3B8] block">
            Enter Package Net Quantity (g or ml):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="50000"
              value={testWeight}
              onChange={(e) => setTestWeight(Math.max(1, Number(e.target.value)))}
              className="bg-[#07090F] border border-[#232D45] rounded-xl px-3 py-2 text-sm font-mono text-[#F8FAFC] w-28 focus:border-[#8B5CF6] focus:outline-none"
            />
            <span className="text-xs font-mono text-[#64748B]">g / ml</span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[45, 180, 500, 2500].map((quick) => (
              <button
                key={quick}
                onClick={() => setTestWeight(quick)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                  testWeight === quick
                    ? "bg-purple-600 text-white border-purple-500 font-bold shadow-purple-glow"
                    : "bg-[#182032] border-[#232D45] text-[#94A3B8]"
                }`}
              >
                {quick >= 1000 ? `${quick / 1000}kg` : `${quick}g`}
              </button>
            ))}
          </div>
        </div>

        {/* Resolved Slab Card */}
        <div className="p-3.5 bg-[#07090F] rounded-xl border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#C084FC] font-semibold">
              Matched Slab: {resolvedSlab.slab_id}
            </span>
            <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-md font-semibold">
              Active Rule
            </span>
          </div>
          <div className="text-xs font-semibold text-[#F8FAFC]">
            Category: {resolvedSlab.name}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2 bg-[#111625] rounded-lg border border-[#232D45]">
              <div className="text-[#64748B] text-[10px]">Min Numeral</div>
              <div className="text-base font-bold text-[#10B981] mt-0.5">
                {resolvedSlab.mandatory_min_font_height_mm.toFixed(1)} mm
              </div>
            </div>
            <div className="p-2 bg-[#111625] rounded-lg border border-[#232D45]">
              <div className="text-[#64748B] text-[10px]">Min Capital Letter</div>
              <div className="text-base font-bold text-[#10B981] mt-0.5">
                {resolvedSlab.capital_letters_height_mm.toFixed(1)} mm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prohibited Expressions Scanner */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
            <AlertOctagon size={15} className="text-[#EF4444]" />
            <span>Prohibited Expressions Scanner</span>
          </div>
          <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-2 py-0.5 rounded-full border border-[#EF4444]/30 font-semibold">
            {detectedViolations.length} Detected
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] text-[#94A3B8]">Packaging text / label claims:</label>
          <textarea
            rows={2}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-[#07090F] border border-[#232D45] rounded-xl p-2.5 text-xs font-mono text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            placeholder="Type or paste packaging text to screen..."
          />
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {presetExpressions.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setTestText(preset)}
              className="flex-none text-[10.5px] font-mono bg-[#182032] text-[#94A3B8] hover:text-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#232D45] active:scale-95 transition-all truncate max-w-[180px]"
            >
              "{preset}"
            </button>
          ))}
        </div>

        {/* Violations */}
        {detectedViolations.length > 0 ? (
          <div className="space-y-2 pt-1">
            {detectedViolations.map((v, i) => (
              <div
                key={i}
                className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#EF4444]">
                    Prohibited Term: "{v.matched}"
                  </span>
                  <span className="font-mono text-[10px] text-[#64748B]">{v.rule}</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-tight">{v.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs flex items-center gap-2 text-[#10B981]">
            <CheckCircle2 size={14} />
            <span>No prohibited expressions detected under Rule 11 / 13.</span>
          </div>
        )}
      </div>

      {/* Consumer Care Verification */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
            <CheckSquare size={15} className="text-[#A855F7]" />
            <span>Consumer Care (Rule 6(1)(f))</span>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
              careValidation.isComplete
                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
            }`}
          >
            {careValidation.score}% Complete
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-[10px] text-[#64748B] block mb-0.5">Officer Name</label>
            <input
              type="text"
              value={consumerCare.name}
              onChange={(e) => setConsumerCare({ ...consumerCare, name: e.target.value })}
              className="w-full bg-[#07090F] border border-[#232D45] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#64748B] block mb-0.5">Helpline Phone</label>
            <input
              type="text"
              value={consumerCare.telephone}
              onChange={(e) => setConsumerCare({ ...consumerCare, telephone: e.target.value })}
              className="w-full bg-[#07090F] border border-[#232D45] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#64748B] block mb-0.5">Grievance Email</label>
            <input
              type="text"
              placeholder="e.g. support@brand.com"
              value={consumerCare.email}
              onChange={(e) => setConsumerCare({ ...consumerCare, email: e.target.value })}
              className={`w-full bg-[#07090F] border rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none ${
                !consumerCare.email ? "border-[#F59E0B]/60 focus:border-[#F59E0B]" : "border-[#232D45] focus:border-[#8B5CF6]"
              }`}
            />
          </div>
        </div>

        {!careValidation.isComplete && (
          <div className="p-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl text-xs text-[#F59E0B] flex items-center gap-1.5">
            <AlertTriangle size={13} className="flex-none" />
            <span className="text-[11px]">
              Missing: <strong>{careValidation.missingFields.map((f) => f.label).join(", ")}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
