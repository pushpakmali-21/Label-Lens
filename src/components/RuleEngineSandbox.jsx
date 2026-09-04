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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#26394B] pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#C9A15A]/10 border border-[#C9A15A]/30 text-[#C9A15A] text-xs font-mono mb-2">
          <Sliders size={14} />
          <span>Stage 4 (Relational Config Engine) + Stage 5 (Semantic NLP Analysis)</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#EDEAE1]">
          Config-Driven LMPC Rule Engine &amp; Prohibited Expression Sandbox
        </h1>
        <p className="text-xs sm:text-sm text-[#99AAB8] mt-1 max-w-3xl">
          The Legal Metrology compliance rules are abstracted into versioned JSON data configs (<code className="text-[#C9A15A] font-mono">lmpc_rules_v1.json</code>) rather than hardcoded scripts. Test how the engine dynamically resolves weight slabs, screens for blacklisted expressions, and verifies consumer grievance disclosures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dynamic Weight Slab Resolver */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#EDEAE1]">
                <BookOpen size={16} className="text-[#C9A15A]" />
                <span>Dynamic Weight Slab Resolver (Rule 7)</span>
              </div>
              <span className="text-[10px] font-mono text-[#63768A]">Second Schedule</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#99AAB8] block">
                Enter Net Quantity of Package (grams or milliliters):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={testWeight}
                  onChange={(e) => setTestWeight(Math.max(1, Number(e.target.value)))}
                  className="bg-[#0E1A26] border border-[#26394B] rounded px-3 py-2 text-sm font-mono text-[#EDEAE1] w-36 focus:border-[#C9A15A] focus:outline-none"
                />
                <span className="text-xs font-mono text-[#63768A]">g / ml</span>

                <div className="flex items-center gap-1.5 ml-auto">
                  {[45, 180, 500, 2500].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => setTestWeight(quick)}
                      className={`text-[11px] font-mono px-2 py-1 rounded border transition-all ${
                        testWeight === quick
                          ? "bg-[#C9A15A] text-[#241B08] border-[#C9A15A] font-bold"
                          : "bg-[#17293B] border-[#26394B] text-[#99AAB8] hover:text-[#EDEAE1]"
                      }`}
                    >
                      {quick >= 1000 ? `${quick / 1000}kg` : `${quick}g`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolved Result Card */}
            <div className="p-3.5 bg-[#0E1A26] rounded border border-[#C9A15A]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#C9A15A] font-semibold">
                  Matched Slab: {resolvedSlab.slab_id}
                </span>
                <span className="text-[11px] font-mono bg-[#C9A15A]/15 text-[#C9A15A] px-2 py-0.5 rounded">
                  Active Rule
                </span>
              </div>
              <div className="text-sm font-serif text-[#EDEAE1]">
                Category: <strong>{resolvedSlab.name}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 bg-[#121F2E] rounded border border-[#26394B]">
                  <div className="text-[#63768A] text-[10px]">Min Numeral Height</div>
                  <div className="text-base font-bold text-[#5AAE83] mt-0.5">
                    {resolvedSlab.mandatory_min_font_height_mm.toFixed(1)} mm
                  </div>
                </div>
                <div className="p-2 bg-[#121F2E] rounded border border-[#26394B]">
                  <div className="text-[#63768A] text-[10px]">Min Capital Letter</div>
                  <div className="text-base font-bold text-[#5AAE83] mt-0.5">
                    {resolvedSlab.capital_letters_height_mm.toFixed(1)} mm
                  </div>
                </div>
              </div>
            </div>

            {/* Regulatory Table */}
            <div className="pt-2">
              <div className="text-xs font-mono text-[#63768A] mb-1.5">LMPC Font Height Slabs Table:</div>
              <div className="border border-[#26394B] rounded overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#0E1A26] text-[#99AAB8] font-mono text-[10.5px]">
                    <tr>
                      <th className="py-1.5 px-2.5">Slab</th>
                      <th className="py-1.5 px-2.5">Range</th>
                      <th className="py-1.5 px-2.5 text-right">Min Font Height</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#26394B]">
                    {lmpcRules.weight_slabs_font_mapping.map((slab) => {
                      const isCurrent = slab.slab_id === resolvedSlab.slab_id;
                      return (
                        <tr
                          key={slab.slab_id}
                          className={`font-mono text-[11px] ${
                            isCurrent ? "bg-[#C9A15A]/15 text-[#EDEAE1] font-semibold" : "text-[#99AAB8]"
                          }`}
                        >
                          <td className="py-1.5 px-2.5">{slab.slab_id}</td>
                          <td className="py-1.5 px-2.5">{slab.name}</td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-[#C9A15A]">
                            {slab.mandatory_min_font_height_mm.toFixed(1)} mm
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prohibited Expressions & Consumer Care */}
        <div className="lg:col-span-6 space-y-4">
          {/* Prohibited Expressions Scanner */}
          <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#EDEAE1]">
                <AlertOctagon size={16} className="text-[#D06A5A]" />
                <span>Prohibited Expressions Scanner (Rule 11 &amp; 13)</span>
              </div>
              <span className="text-[10px] font-mono text-[#D06A5A] bg-[#D06A5A]/10 px-2 py-0.5 rounded border border-[#D06A5A]/30">
                {detectedViolations.length} Detected
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#99AAB8]">Enter label description / claims text:</label>
              <textarea
                rows={3}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full bg-[#0E1A26] border border-[#26394B] rounded p-2 text-xs font-mono text-[#EDEAE1] focus:border-[#C9A15A] focus:outline-none"
                placeholder="Type or paste packaging text to screen for prohibited expressions..."
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-[#63768A]">Presets:</span>
              {presetExpressions.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestText(preset)}
                  className="text-[10.5px] font-mono bg-[#17293B] hover:bg-[#26394B] text-[#99AAB8] hover:text-[#EDEAE1] px-2 py-0.5 rounded border border-[#26394B] transition-all"
                >
                  "{preset.length > 25 ? preset.substring(0, 22) + "..." : preset}"
                </button>
              ))}
            </div>

            {/* Violation Alerts */}
            {detectedViolations.length > 0 ? (
              <div className="space-y-2 pt-1">
                {detectedViolations.map((v, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-[#D06A5A]/10 border border-[#D06A5A]/40 rounded text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#D06A5A]">
                        Prohibited Term: "{v.matched}"
                      </span>
                      <span className="font-mono text-[10px] text-[#63768A]">{v.rule}</span>
                    </div>
                    <p className="text-[11.5px] text-[#99AAB8] leading-tight">{v.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 bg-[#5AAE83]/10 border border-[#5AAE83]/30 rounded text-xs flex items-center gap-2 text-[#5AAE83]">
                <CheckCircle2 size={15} />
                <span>No prohibited or deceptive expressions detected under Rule 11 / Rule 13.</span>
              </div>
            )}
          </div>

          {/* Consumer Care Completeness */}
          <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#EDEAE1]">
                <CheckSquare size={16} className="text-[#C9A15A]" />
                <span>Consumer Care Verification (Rule 6(1)(f))</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                  careValidation.isComplete
                    ? "bg-[#5AAE83]/10 text-[#5AAE83] border-[#5AAE83]/30"
                    : "bg-[#DA9E4E]/10 text-[#DA9E4E] border-[#DA9E4E]/30"
                }`}
              >
                {careValidation.score}% Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10.5px] text-[#63768A] block mb-1">Redressal Officer Name</label>
                <input
                  type="text"
                  value={consumerCare.name}
                  onChange={(e) => setConsumerCare({ ...consumerCare, name: e.target.value })}
                  className="w-full bg-[#0E1A26] border border-[#26394B] rounded px-2 py-1 text-xs text-[#EDEAE1] focus:border-[#C9A15A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-[#63768A] block mb-1">Toll-Free Helpline / Phone</label>
                <input
                  type="text"
                  value={consumerCare.telephone}
                  onChange={(e) => setConsumerCare({ ...consumerCare, telephone: e.target.value })}
                  className="w-full bg-[#0E1A26] border border-[#26394B] rounded px-2 py-1 text-xs text-[#EDEAE1] focus:border-[#C9A15A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-[#63768A] block mb-1">Grievance Email</label>
                <input
                  type="text"
                  placeholder="e.g. support@brand.com"
                  value={consumerCare.email}
                  onChange={(e) => setConsumerCare({ ...consumerCare, email: e.target.value })}
                  className={`w-full bg-[#0E1A26] border rounded px-2 py-1 text-xs text-[#EDEAE1] focus:outline-none ${
                    !consumerCare.email ? "border-[#DA9E4E]/60 focus:border-[#DA9E4E]" : "border-[#26394B] focus:border-[#C9A15A]"
                  }`}
                />
              </div>

              <div>
                <label className="text-[10.5px] text-[#63768A] block mb-1">Physical / Postal Address</label>
                <input
                  type="text"
                  value={consumerCare.address}
                  onChange={(e) => setConsumerCare({ ...consumerCare, address: e.target.value })}
                  className="w-full bg-[#0E1A26] border border-[#26394B] rounded px-2 py-1 text-xs text-[#EDEAE1] focus:border-[#C9A15A] focus:outline-none"
                />
              </div>
            </div>

            {!careValidation.isComplete && (
              <div className="p-2 bg-[#DA9E4E]/10 border border-[#DA9E4E]/30 rounded text-xs text-[#DA9E4E] flex items-center gap-2">
                <AlertTriangle size={14} className="flex-none" />
                <span>
                  Missing mandatory redressal declaration: <strong>{careValidation.missingFields.map((f) => f.label).join(", ")}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
