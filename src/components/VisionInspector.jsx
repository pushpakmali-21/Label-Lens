import React, { useState } from "react";
import { Sparkles, Coins, Ruler, Eye, CheckCircle2, AlertTriangle, XCircle, Upload, RotateCcw, ArrowLeft } from "lucide-react";
import { resolveFontSlab, calculatePixelPerMm, convertPxToMm } from "../utils/lmpcValidator";

const SAMPLE_PACKAGES = [
  {
    id: "namkeen",
    name: "Namkeen Pouch (200 g)",
    tag: "Rule 7 Compliant",
    netQtyGrams: 200,
    fontPx: 22,
    coinPixelDiameter: 161, // 161 / 23 = 7.0 px/mm -> font is 22 / 7.0 = 3.14 mm
    boxes: [
      { id: "pdp", name: "PDP Panel", x: 8, y: 10, w: 84, h: 80, color: "#3B82F6", status: "ok", rule: "Rule 8" },
      { id: "brand", name: "Brand Name", x: 14, y: 18, w: 72, h: 18, color: "#10B981", status: "ok", rule: "Rule 6(1)(b)" },
      { id: "qty", name: "Net Qty Block", x: 55, y: 64, w: 32, h: 18, color: "#10B981", status: "ok", rule: "Rule 6(1)(c)" },
      { id: "mrp", name: "MRP Block", x: 14, y: 64, w: 36, h: 18, color: "#8B5CF6", status: "ok", rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Coin (23mm)", x: 74, y: 16, w: 18, h: 22, color: "#A855F7", status: "ok", rule: "Calibration" },
    ],
  },
  {
    id: "biscuit",
    name: "Digestive Biscuits (100 g)",
    tag: "Font Violation (1.48mm)",
    netQtyGrams: 100,
    fontPx: 10, // low font
    coinPixelDiameter: 155, // 155 / 23 = 6.74 px/mm -> font is 10 / 6.74 = 1.48 mm vs 2.0 mm required (VIOLATION)
    boxes: [
      { id: "pdp", name: "PDP Panel", x: 10, y: 12, w: 80, h: 76, color: "#3B82F6", status: "ok", rule: "Rule 8" },
      { id: "qty", name: "Net Qty (Tiny Font)", x: 60, y: 66, w: 26, h: 12, color: "#EF4444", status: "fail", rule: "Rule 7 Violation" },
      { id: "mrp", name: "MRP Block", x: 14, y: 64, w: 38, h: 16, color: "#8B5CF6", status: "ok", rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Coin (23mm)", x: 72, y: 16, w: 18, h: 22, color: "#A855F7", status: "ok", rule: "Calibration" },
    ],
  },
  {
    id: "detergent",
    name: "Washing Powder (2 kg)",
    tag: "Slab D (6.4mm)",
    netQtyGrams: 2000,
    fontPx: 48,
    coinPixelDiameter: 172, // 172 / 23 = 7.48 px/mm -> font is 48 / 7.48 = 6.42 mm vs 6.0 mm required
    boxes: [
      { id: "pdp", name: "PDP Panel", x: 6, y: 8, w: 88, h: 84, color: "#3B82F6", status: "ok", rule: "Rule 8" },
      { id: "brand", name: "Brand Name", x: 12, y: 16, w: 76, h: 22, color: "#10B981", status: "ok", rule: "Rule 6(1)(b)" },
      { id: "qty", name: "Net Qty (6.4mm)", x: 50, y: 62, w: 38, h: 20, color: "#10B981", status: "ok", rule: "Rule 7 (SLAB_D)" },
      { id: "mrp", name: "MRP Block", x: 12, y: 62, w: 34, h: 20, color: "#8B5CF6", status: "ok", rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Coin (23mm)", x: 74, y: 14, w: 18, h: 22, color: "#A855F7", status: "ok", rule: "Calibration" },
    ],
  },
];

export default function VisionInspector({ onBack }) {
  const [selectedPack, setSelectedPack] = useState(SAMPLE_PACKAGES[0]);
  const [showBoxes, setShowBoxes] = useState(true);
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [coinPixels, setCoinPixels] = useState(selectedPack.coinPixelDiameter);
  const [fontPixels, setFontPixels] = useState(selectedPack.fontPx);
  const [customImage, setCustomImage] = useState(null);

  const handleSelectPackage = (pkg) => {
    setSelectedPack(pkg);
    setCoinPixels(pkg.coinPixelDiameter);
    setFontPixels(pkg.fontPx);
    setActiveBoxId(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
    }
  };

  // Calculations
  const pixelPerMm = calculatePixelPerMm(coinPixels);
  const measuredFontMm = convertPxToMm(fontPixels, pixelPerMm);
  const fontSlab = resolveFontSlab(selectedPack.netQtyGrams);
  const isFontCompliant = measuredFontMm >= fontSlab.mandatory_min_font_height_mm;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#182032] to-[#111625] border border-[#232D45] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-600/40 text-[#C084FC] text-[10.5px] font-mono font-semibold">
            <Sparkles size={12} className="text-[#A855F7]" />
            <span>Optical ₹5 Coin Calibrator</span>
          </span>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1 active:scale-95"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          )}
        </div>

        <h1 className="text-base font-bold text-[#F8FAFC]">
          Millimeter Font Calibration (Rule 7)
        </h1>
        <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
          Converts image pixels into courtroom-grade millimeter metrics using a standard Indian 5-Rupee coin (diameter: 23.0 mm) as a fiducial reference.
        </p>
      </div>

      {/* Swipeable Package Preset Selector */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            Packaging Presets
          </h2>
          <span className="text-[10px] font-mono text-purple-400">Swipe →</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x-mandatory pb-1">
          {SAMPLE_PACKAGES.map((pkg) => {
            const isSelected = selectedPack.id === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => handleSelectPackage(pkg)}
                className={`snap-start flex-none w-[170px] text-left p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-purple-950/40 border-[#8B5CF6] text-white ring-1 ring-[#8B5CF6]/50 shadow-purple-glow"
                    : "bg-[#111625] border-[#232D45] text-[#94A3B8]"
                }`}
              >
                <div className={`text-xs font-bold truncate ${isSelected ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                  {pkg.name}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 truncate ${pkg.id === "biscuit" ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                  {pkg.tag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Spatial Detection Canvas */}
      <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#94A3B8]">YOLOv8 Detection Canvas</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] cursor-pointer">
              <input
                type="checkbox"
                checked={showBoxes}
                onChange={(e) => setShowBoxes(e.target.checked)}
                className="rounded border-[#232D45] text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <span>Boxes</span>
            </label>

            <label className="cursor-pointer bg-[#182032] border border-[#232D45] text-[11px] text-[#F8FAFC] px-2 py-1 rounded-lg flex items-center gap-1">
              <Upload size={11} className="text-[#A855F7]" />
              <span>Upload</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Canvas Surface */}
        <div className="relative aspect-[4/3] bg-[#07090F] rounded-xl border border-[#232D45] overflow-hidden flex items-center justify-center p-3">
          {customImage ? (
            <img src={customImage} alt="Uploaded packaging" className="w-full h-full object-contain" />
          ) : (
            <div className="relative w-full h-full max-w-[360px] max-h-[260px] bg-[#F5F3EF] text-[#1C1A12] rounded-xl p-3 shadow-lg border border-purple-500/20 flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1C1A12]/15 pb-1.5">
                <div>
                  <div className="font-bold text-xs text-[#1C1A12] leading-tight">
                    {selectedPack.name}
                  </div>
                  <div className="text-[9px] text-[#1C1A12]/70 font-mono">
                    LMPC Rule 6 Packaged Commodity
                  </div>
                </div>

                {/* Coin Visual */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#A855F7] via-purple-600 to-indigo-600 border border-purple-900 shadow flex flex-col items-center justify-center text-white font-bold text-[8.5px] leading-tight select-none">
                  <span>₹5</span>
                  <span className="text-[6.5px] tracking-tighter">23mm</span>
                </div>
              </div>

              {/* Body lines */}
              <div className="space-y-1 my-1.5">
                <div className="h-1.5 bg-[#1C1A12]/15 rounded w-[85%]" />
                <div className="h-1.5 bg-[#1C1A12]/15 rounded w-[68%]" />
              </div>

              {/* Declarations */}
              <div className="flex items-end justify-between border-t border-dashed border-[#1C1A12]/20 pt-1.5">
                <div>
                  <div className="text-[8px] font-sans text-[#1C1A12]/60 uppercase">MRP Block</div>
                  <div className="font-mono font-bold text-xs text-[#1C1A12]">
                    ₹{selectedPack.netQtyGrams > 500 ? "199.00" : "40.00"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8px] font-sans text-[#1C1A12]/60 uppercase">Net Qty</div>
                  <div
                    className="font-mono font-bold text-[#1C1A12] transition-all"
                    style={{ fontSize: `${Math.max(10, fontPixels)}px` }}
                  >
                    {selectedPack.netQtyGrams >= 1000 ? `${selectedPack.netQtyGrams / 1000} kg` : `${selectedPack.netQtyGrams} g`}
                  </div>
                </div>
              </div>

              {/* Bounding Boxes */}
              {showBoxes &&
                selectedPack.boxes.map((box) => {
                  const isActive = activeBoxId === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setActiveBoxId(box.id === activeBoxId ? null : box.id)}
                      className={`absolute border-2 rounded transition-all cursor-pointer ${
                        isActive ? "ring-2 ring-white shadow-lg z-20" : "z-10"
                      }`}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                        borderColor: box.color,
                        backgroundColor: `${box.color}18`,
                      }}
                    >
                      <span
                        className="absolute -top-3.5 left-0 font-mono text-[8px] text-white px-1 py-0.2 rounded truncate max-w-[110px]"
                        style={{ backgroundColor: box.color }}
                      >
                        {box.name}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Optical Coin Calibration & Millimeter Heuristic Calculator */}
      <div className="space-y-3">
        {/* Fiducial Reference Slider */}
        <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
              <Coins size={15} className="text-[#A855F7]" />
              <span>₹5 Coin Calibration</span>
            </div>
            <span className="text-[10px] font-mono bg-purple-950/80 text-[#C084FC] px-2 py-0.5 rounded-full border border-purple-800/40">
              Ratio: {pixelPerMm.toFixed(2)} px/mm
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span>Coin Diameter in Pixels:</span>
              <strong className="text-[#F8FAFC] font-mono">{coinPixels} px</strong>
            </div>
            <input
              type="range"
              min="90"
              max="250"
              value={coinPixels}
              onChange={(e) => setCoinPixels(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] h-2 bg-[#07090F] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Font Measurement & Compliance Verdict */}
        <div className="bg-[#111625] border border-[#232D45] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F8FAFC]">
              <Ruler size={15} className="text-[#A855F7]" />
              <span>Font Height Measurement</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                isFontCompliant
                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                  : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
              }`}
            >
              {isFontCompliant ? "Compliant" : "Violation"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#94A3B8]">
              <span>Detected Font Pixel Height:</span>
              <strong className="text-[#F8FAFC] font-mono">{fontPixels} px</strong>
            </div>
            <input
              type="range"
              min="8"
              max="60"
              value={fontPixels}
              onChange={(e) => setFontPixels(Number(e.target.value))}
              className="w-full accent-[#8B5CF6] h-2 bg-[#07090F] rounded-lg cursor-pointer"
            />
          </div>

          {/* Metrics comparison */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="p-2.5 bg-[#07090F] rounded-xl border border-[#232D45]">
              <div className="text-[#64748B] text-[10px]">Measured Height</div>
              <div className="text-base font-bold text-[#F8FAFC] mt-0.5">
                {measuredFontMm.toFixed(2)} mm
              </div>
            </div>

            <div className="p-2.5 bg-[#07090F] rounded-xl border border-[#232D45]">
              <div className="text-[#64748B] text-[10px]">Mandatory Min</div>
              <div className="text-base font-bold text-[#A855F7] mt-0.5">
                {fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm
              </div>
            </div>
          </div>

          {/* Rule 7 verdict card */}
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              isFontCompliant
                ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#F8FAFC]"
                : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#F8FAFC]"
            }`}
          >
            {isFontCompliant ? (
              <CheckCircle2 size={16} className="text-[#10B981] flex-none mt-0.5" />
            ) : (
              <XCircle size={16} className="text-[#EF4444] flex-none mt-0.5" />
            )}
            <div>
              <strong className={isFontCompliant ? "text-[#10B981]" : "text-[#EF4444]"}>
                {isFontCompliant ? "Rule 7 Compliant: " : "Rule 7 Violation: "}
              </strong>
              {isFontCompliant
                ? `Measured ${measuredFontMm.toFixed(2)} mm meets or exceeds the required statutory minimum of ${fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm.`
                : `Measured ${measuredFontMm.toFixed(2)} mm is below the mandatory legal threshold of ${fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm for ${fontSlab.name}.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
