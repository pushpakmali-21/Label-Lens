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
      <div className="border-b border-panel-line pb-4 sm:pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
          <Sliders size={14} />
          <span>Stage 4 (Relational Config Engine) + Stage 5 (Semantic NLP Analysis)</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-1">
          Config-Driven LMPC Rule Engine &amp; Prohibited Expression Sandbox
        </h1>
        <div className="mt-2.5 inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-panel-raised border border-panel-line text-xs text-text-2 rounded-md font-mono">
          <AlertTriangle size={13} className="text-status-review" />
          <span><strong className="text-status-review">Official Mode:</strong> Client-side evaluation is for instant UI feedback. Final validation and persistence happen strictly on the secure backend.</span>
        </div>
        <p className="text-xs sm:text-sm text-text-2 mt-3 max-w-3xl leading-relaxed">
          The Legal Metrology compliance rules are abstracted into versioned JSON data configs (<code className="text-brass font-mono">lmpc_rules_v1.json</code>) rather than hardcoded scripts. Test how the engine dynamically resolves weight slabs, screens for blacklisted expressions, and verifies consumer grievance disclosures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dynamic Weight Slab Resolver */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-panel border border-panel-line rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-1">
                <BookOpen size={16} className="text-brass" />
                <span>Dynamic Weight Slab Resolver (Rule 7)</span>
              </div>
              <span className="text-[10px] font-mono text-text-3">Second Schedule</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-text-2 block">
                Enter Net Quantity of Package (grams or milliliters):
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    value={testWeight}
                    onChange={(e) => setTestWeight(Math.max(1, Number(e.target.value)))}
                    className="bg-panel-darker border border-panel-line rounded px-3 py-2 text-sm font-mono text-text-1 w-32 focus:border-brass focus:outline-none"
                  />
                  <span className="text-xs font-mono text-text-3">g / ml</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                  {[45, 180, 500, 2500].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => setTestWeight(quick)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-all ${testWeight === quick
                        ? "bg-brass text-brass-ink border-brass font-bold"
                        : "bg-panel-raised border-panel-line text-text-2 hover:text-text-1"
                        }`}
                    >
                      {quick >= 1000 ? `${quick / 1000}kg` : `${quick}g`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolved Result Card */}
            <div className="p-3.5 bg-panel-darker rounded border border-brass/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-brass font-semibold">
                  Matched Slab: {resolvedSlab.slab_id}
                </span>
                <span className="text-[11px] font-mono bg-brass/15 text-brass px-2 py-0.5 rounded">
                  Active Rule
                </span>
              </div>
              <div className="text-sm font-serif text-text-1">
                Category: <strong>{resolvedSlab.name}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 bg-panel rounded border border-panel-line">
                  <div className="text-text-3 text-[10px]">Min Numeral Height</div>
                  <div className="text-base font-bold text-status-pass mt-0.5">
                    {resolvedSlab.mandatory_min_font_height_mm.toFixed(1)} mm
                  </div>
                </div>
                <div className="p-2 bg-panel rounded border border-panel-line">
                  <div className="text-text-3 text-[10px]">Min Capital Letter</div>
                  <div className="text-base font-bold text-status-pass mt-0.5">
                    {resolvedSlab.capital_letters_height_mm.toFixed(1)} mm
                  </div>
                </div>
              </div>
            </div>

            {/* Regulatory Table */}
            <div className="pt-2">
              <div className="text-xs font-mono text-text-3 mb-1.5">LMPC Font Height Slabs Table:</div>
              <div className="border border-panel-line rounded overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-panel-darker text-text-2 font-mono text-[10.5px]">
                    <tr>
                      <th className="py-1.5 px-2.5">Slab</th>
                      <th className="py-1.5 px-2.5">Range</th>
                      <th className="py-1.5 px-2.5 text-right">Min Font</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-panel-line">
                    {lmpcRules.weight_slabs_font_mapping.map((slab) => {
                      const isCurrent = slab.slab_id === resolvedSlab.slab_id;
                      return (
                        <tr
                          key={slab.slab_id}
                          className={`font-mono text-[11px] ${isCurrent ? "bg-brass/15 text-text-1 font-semibold" : "text-text-2"
                            }`}
                        >
                          <td className="py-1.5 px-2.5">{slab.slab_id}</td>
                          <td className="py-1.5 px-2.5">{slab.name}</td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-brass">
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
          <div className="bg-panel border border-panel-line rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-1">
                <AlertOctagon size={16} className="text-status-fail" />
                <span>Prohibited Expressions Scanner (Rule 11 &amp; 13)</span>
              </div>
              <span className="text-[10px] font-mono text-status-fail bg-status-fail/10 px-2 py-0.5 rounded border border-status-fail/30">
                {detectedViolations.length} Detected
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-2">Enter label description / claims text:</label>
              <textarea
                rows={3}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full bg-panel-darker border border-panel-line rounded p-2 text-xs font-mono text-text-1 focus:border-brass focus:outline-none"
                placeholder="Type or paste packaging text to screen for prohibited expressions..."
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-text-3">Presets:</span>
              {presetExpressions.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestText(preset)}
                  className="text-[10.5px] font-mono bg-panel-raised hover:bg-panel-line text-text-2 hover:text-text-1 px-2 py-0.5 rounded border border-panel-line transition-all truncate max-w-[200px]"
                >
                  {preset.length > 25 ? preset.substring(0, 22) + "..." : preset}
                </button>
              ))}
            </div>

            {/* Violation Alerts */}
            {detectedViolations.length > 0 ? (
              <div className="space-y-2 pt-1">
                {detectedViolations.map((v, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-status-fail/10 border border-status-fail/40 rounded text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-status-fail">
                        Prohibited Term: "{v.matched}"
                      </span>
                      <span className="font-mono text-[10px] text-text-3">{v.rule}</span>
                    </div>
                    <p className="text-[11.5px] text-text-2 leading-tight">{v.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 bg-status-pass/10 border border-status-pass/30 rounded text-xs flex items-center gap-2 text-status-pass">
                <CheckCircle2 size={15} />
                <span>No prohibited or deceptive expressions detected under Rule 11 / Rule 13.</span>
              </div>
            )}
          </div>

          {/* Consumer Care Completeness */}
          <div className="bg-panel border border-panel-line rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-1">
                <CheckSquare size={16} className="text-brass" />
                <span>Consumer Care Verification (Rule 6(1)(f))</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${careValidation.isComplete
                  ? "bg-status-pass/10 text-status-pass border-status-pass/30"
                  : "bg-status-review/10 text-status-review border-status-review/30"
                  }`}
              >
                {careValidation.score}% Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[10.5px] text-text-3 block mb-1">Redressal Officer Name</label>
                <input
                  type="text"
                  value={consumerCare.name}
                  onChange={(e) => setConsumerCare({ ...consumerCare, name: e.target.value })}
                  className="w-full bg-panel-darker border border-panel-line rounded px-2.5 py-1.5 text-xs text-text-1 focus:border-brass focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-text-3 block mb-1">Toll-Free Helpline / Phone</label>
                <input
                  type="text"
                  value={consumerCare.telephone}
                  onChange={(e) => setConsumerCare({ ...consumerCare, telephone: e.target.value })}
                  className="w-full bg-panel-darker border border-panel-line rounded px-2.5 py-1.5 text-xs text-text-1 focus:border-brass focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-text-3 block mb-1">Grievance Email</label>
                <input
                  type="text"
                  placeholder="e.g. support@brand.com"
                  value={consumerCare.email}
                  onChange={(e) => setConsumerCare({ ...consumerCare, email: e.target.value })}
                  className={`w-full bg-panel-darker border rounded px-2.5 py-1.5 text-xs text-text-1 focus:outline-none ${!consumerCare.email ? "border-status-review/60 focus:border-status-review" : "border-panel-line focus:border-brass"
                    }`}
                />
              </div>

              <div>
                <label className="text-[10.5px] text-text-3 block mb-1">Physical / Postal Address</label>
                <input
                  type="text"
                  value={consumerCare.address}
                  onChange={(e) => setConsumerCare({ ...consumerCare, address: e.target.value })}
                  className="w-full bg-panel-darker border border-panel-line rounded px-2.5 py-1.5 text-xs text-text-1 focus:border-brass focus:outline-none"
                />
              </div>
            </div>

            {!careValidation.isComplete && (
              <div className="p-2 bg-status-review/10 border border-status-review/30 rounded text-xs text-status-review flex items-center gap-2">
                <AlertTriangle size={14} className="flex-none" />
                <span>
                  Missing mandatory redressal field: <strong>{careValidation.missingFields.map((f) => f.label).join(", ")}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
