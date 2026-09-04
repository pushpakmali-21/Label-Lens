import React, { useState } from "react";
import { Sparkles, Coins, Ruler, Eye, CheckCircle, AlertTriangle, XCircle, Info, Upload } from "lucide-react";
import { resolveFontSlab, calculatePixelPerMm, convertPxToMm } from "../utils/lmpcValidator";

const SAMPLE_PACKAGES = [
  {
    id: "namkeen",
    name: "Namkeen Pouch (200 g)",
    netQtyGrams: 200,
    fontPx: 22,
    coinPixelDiameter: 161, // 161 / 23 = 7.0 px/mm -> font is 22 / 7.0 = 3.14 mm
    boxes: [
      { id: "pdp", name: "Principal Display Panel (PDP)", x: 8, y: 10, w: 84, h: 80, color: "#3B82F6", status: "ok", rule: "Rule 8" },
      { id: "brand", name: "Brand & Generic Declaration", x: 14, y: 18, w: 72, h: 18, color: "#10B981", status: "ok", rule: "Rule 6(1)(b)" },
      { id: "qty", name: "Net Quantity Block", x: 55, y: 64, w: 32, h: 18, color: "#10B981", status: "ok", rule: "Rule 6(1)(c)" },
      { id: "mrp", name: "MRP Block", x: 14, y: 64, w: 36, h: 18, color: "#8B5CF6", status: "ok", rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Reference Coin (23mm)", x: 74, y: 16, w: 18, h: 22, color: "#C9A15A", status: "ok", rule: "Calibration" },
    ],
  },
  {
    id: "biscuit",
    name: "Digestive Biscuits (100 g)",
    netQtyGrams: 100,
    fontPx: 10, // low font
    coinPixelDiameter: 155, // 155 / 23 = 6.74 px/mm -> font is 10 / 6.74 = 1.48 mm vs 2.0 mm required (VIOLATION)
    boxes: [
      { id: "pdp", name: "Principal Display Panel (PDP)", x: 10, y: 12, w: 80, h: 76, color: "#3B82F6", status: "ok", rule: "Rule 8" },
      { id: "qty", name: "Net Quantity Block (Tiny Font)", x: 60, y: 66, w: 26, h: 12, color: "#D06A5A", status: "fail", rule: "Rule 7 Font Violation" },
      { id: "mrp", name: "MRP Block", x: 14, y: 64, w: 38, h: 16, color: "#8B5CF6", status: "ok", rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Reference Coin (23mm)", x: 72, y: 16, w: 18, h: 22, color: "#C9A15A", status: "ok", rule: "Calibration" },
    ],
  },
  {
    id: "detergent",
    name: "Washing Powder (2 kg / 2000 g)",
    netQtyGrams: 2000,
    fontPx: 48,
    coinPixelDiameter: 172, // 172 / 23 = 7.48 px/mm -> font is 48 / 7.48 = 6.42 mm vs 6.0 mm required
    boxes: [
      { id: "pdp", name: "Principal Display Panel (PDP)", x: 6, y: 8, w: 88, h: 84, color: "#3B82F6", status: "ok", rule: "Rule 8" },
      { id: "brand", name: "Brand & Generic Declaration", x: 12, y: 16, w: 76, h: 22, color: "#10B981", status: "ok", rule: "Rule 6(1)(b)" },
      { id: "qty", name: "Net Quantity Block (6.4mm)", x: 50, y: 62, w: 38, h: 20, color: "#10B981", status: "ok", rule: "Rule 7 (SLAB_D)" },
      { id: "mrp", name: "MRP Block", x: 12, y: 62, w: 34, h: 20, color: "#8B5CF6", status: "ok", rule: "Rule 6(1)(e)" },
      { id: "coin", name: "₹5 Reference Coin (23mm)", x: 74, y: 14, w: 18, h: 22, color: "#C9A15A", status: "ok", rule: "Calibration" },
    ],
  },
];

export default function VisionInspector() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#26394B] pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#C9A15A]/10 border border-[#C9A15A]/30 text-[#C9A15A] text-xs font-mono mb-2">
          <Sparkles size={14} />
          <span>Stage 1 (YOLOv8 Spatial Detection) + Stage 3 (PaddleOCR &amp; Geometry)</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#EDEAE1]">
          Spatial Layout Localization &amp; Pixel-to-mm Coin Calibration
        </h1>
        <p className="text-xs sm:text-sm text-[#99AAB8] mt-1 max-w-3xl">
          Solves the <strong>Millimeter Heuristic Deficit</strong>: standard packaging rules require exact minimum font heights (1mm, 2mm, 4mm, 6mm). LabelLens uses a standard Indian 5-Rupee coin (diameter: exactly 23 mm) as an optical fiducial reference to convert pixel measurements into millimeter courtroom evidence.
        </p>
      </div>

      {/* Preset Selector & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#121F2E] p-3 rounded-lg border border-[#26394B]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-[#63768A]">Packaging Presets:</span>
          {SAMPLE_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className={`text-xs px-3 py-1.5 rounded transition-all ${
                selectedPack.id === pkg.id
                  ? "bg-[#C9A15A] text-[#241B08] font-semibold shadow"
                  : "bg-[#17293B] text-[#EDEAE1] hover:border-[#63768A] border border-transparent"
              }`}
            >
              {pkg.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[#99AAB8] cursor-pointer">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="rounded border-[#26394B] text-[#C9A15A] focus:ring-[#C9A15A]"
            />
            <span>YOLOv8 Bounding Boxes</span>
          </label>

          <label className="cursor-pointer bg-[#17293B] hover:bg-[#26394B] border border-[#26394B] text-xs text-[#EDEAE1] px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all">
            <Upload size={13} className="text-[#C9A15A]" />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Simulator */}
        <div className="lg:col-span-7 bg-[#121F2E] border border-[#26394B] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-[#63768A] font-mono mb-2">
            <span>Spatial Detection Canvas</span>
            <span>Ratio: {pixelPerMm.toFixed(2)} px/mm</span>
          </div>

          {/* Visual Container */}
          <div className="relative aspect-[4/3] bg-[#0E1A26] rounded border border-[#26394B] overflow-hidden flex items-center justify-center p-4">
            {customImage ? (
              <img src={customImage} alt="Uploaded packaging" className="w-full h-full object-contain" />
            ) : (
              /* Simulated Package Face */
              <div className="relative w-full h-full max-w-[420px] max-h-[320px] bg-[#ECE7D9] text-[#1C1A12] rounded p-4 shadow-lg border border-[#C9A15A]/30">
                {/* Brand row */}
                <div className="flex items-center justify-between border-b border-[#1C1A12]/15 pb-2 mb-3">
                  <div>
                    <div className="font-serif font-bold text-base text-[#1C1A12] leading-tight">
                      {selectedPack.name}
                    </div>
                    <div className="text-[10px] text-[#1C1A12]/70 font-mono">
                      Packaged Commodity • LMPC Rule 6 Compliant Design
                    </div>
                  </div>
                  {/* Visual Coin Graphic */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C9A15A] via-[#E0BE7E] to-[#B97B33] border-2 border-[#241B08]/40 shadow flex flex-col items-center justify-center text-[#241B08] font-bold text-[9px] leading-tight select-none">
                    <span>₹5</span>
                    <span className="text-[7px] tracking-tighter">23 mm</span>
                  </div>
                </div>

                {/* Decorative product lines */}
                <div className="space-y-1.5 my-3">
                  <div className="h-2 bg-[#1C1A12]/15 rounded w-[85%]" />
                  <div className="h-2 bg-[#1C1A12]/15 rounded w-[70%]" />
                  <div className="h-2 bg-[#1C1A12]/15 rounded w-[60%]" />
                </div>

                {/* Simulated Mandatory Declarations */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between border-t border-dashed border-[#1C1A12]/20 pt-2">
                  <div>
                    <div className="text-[9px] font-sans text-[#1C1A12]/60 uppercase">Max Retail Price</div>
                    <div className="font-mono font-bold text-sm text-[#1C1A12]">
                      ₹{selectedPack.netQtyGrams > 500 ? "199.00" : "40.00"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] font-sans text-[#1C1A12]/60 uppercase">Net Quantity</div>
                    <div
                      className="font-mono font-bold text-[#1C1A12] transition-all"
                      style={{ fontSize: `${Math.max(10, fontPixels)}px` }}
                    >
                      {selectedPack.netQtyGrams >= 1000 ? `${selectedPack.netQtyGrams / 1000} kg` : `${selectedPack.netQtyGrams} g`}
                    </div>
                  </div>
                </div>

                {/* Bounding Box Overlays */}
                {showBoxes &&
                  selectedPack.boxes.map((box) => {
                    const isActive = activeBoxId === box.id;
                    return (
                      <div
                        key={box.id}
                        onMouseEnter={() => setActiveBoxId(box.id)}
                        onMouseLeave={() => setActiveBoxId(null)}
                        className={`absolute border-2 rounded transition-all cursor-pointer ${
                          isActive ? "ring-2 ring-white shadow-lg z-20" : "z-10"
                        }`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.w}%`,
                          height: `${box.h}%`,
                          borderColor: box.color,
                          backgroundColor: `${box.color}15`,
                        }}
                      >
                        <span
                          className="absolute -top-4 left-0 font-mono text-[9px] text-white px-1.5 py-0.2 rounded truncate max-w-[140px]"
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

          {/* Bounding Box Legend */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedPack.boxes.map((box) => (
              <div
                key={box.id}
                onMouseEnter={() => setActiveBoxId(box.id)}
                onMouseLeave={() => setActiveBoxId(null)}
                className={`flex items-center gap-2 p-1.5 rounded text-[11px] font-mono cursor-pointer transition-all border ${
                  activeBoxId === box.id
                    ? "bg-[#17293B] border-[#C9A15A]"
                    : "bg-[#0E1A26] border-[#26394B] text-[#99AAB8]"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: box.color }} />
                <span className="truncate text-[#EDEAE1]">{box.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Optical Coin Calibration & Millimeter Heuristic Calculator */}
        <div className="lg:col-span-5 space-y-4">
          {/* Fiducial Reference Calibration */}
          <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#EDEAE1]">
                <Coins size={16} className="text-[#C9A15A]" />
                <span>₹5 Coin Reference Calibration</span>
              </div>
              <span className="text-[10px] font-mono bg-[#C9A15A]/10 text-[#C9A15A] px-2 py-0.5 rounded border border-[#C9A15A]/30">
                Known: 23.0 mm
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#99AAB8]">
                <span>Detected Coin Diameter (pixels):</span>
                <span className="font-mono font-bold text-[#EDEAE1]">{coinPixels} px</span>
              </div>
              <input
                type="range"
                min="90"
                max="250"
                value={coinPixels}
                onChange={(e) => setCoinPixels(Number(e.target.value))}
                className="w-full accent-[#C9A15A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#63768A]">
                <span>90 px (Distant)</span>
                <span>Calculated: {pixelPerMm.toFixed(2)} px/mm</span>
                <span>250 px (Close)</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#0E1A26] rounded border border-[#26394B] text-[11px] font-mono text-[#99AAB8]">
              Calibration Formula: <code className="text-[#C9A15A]">Ratio = {coinPixels} px ÷ 23.0 mm = {pixelPerMm.toFixed(2)} px/mm</code>
            </div>
          </div>

          {/* Measured Font vs Mandatory Slab */}
          <div className="bg-[#121F2E] border border-[#26394B] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#EDEAE1]">
                <Ruler size={16} className="text-[#C9A15A]" />
                <span>Millimeter Font Measurement</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase ${
                  isFontCompliant
                    ? "bg-[#5AAE83]/10 text-[#5AAE83] border-[#5AAE83]/30"
                    : "bg-[#D06A5A]/10 text-[#D06A5A] border-[#D06A5A]/30"
                }`}
              >
                {isFontCompliant ? "Compliant" : "Violation"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#99AAB8]">
                <span>Adjust Detected Font Pixel Height:</span>
                <span className="font-mono font-bold text-[#EDEAE1]">{fontPixels} px</span>
              </div>
              <input
                type="range"
                min="8"
                max="60"
                value={fontPixels}
                onChange={(e) => setFontPixels(Number(e.target.value))}
                className="w-full accent-[#C9A15A] cursor-pointer"
              />
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-[#0E1A26] rounded border border-[#26394B]">
                <div className="text-[#63768A] text-[10px]">Measured Height</div>
                <div className="text-base font-bold text-[#EDEAE1] mt-0.5">
                  {measuredFontMm.toFixed(2)} mm
                </div>
                <div className="text-[10px] text-[#99AAB8]">({fontPixels} px ÷ {pixelPerMm.toFixed(1)})</div>
              </div>

              <div className="p-2.5 bg-[#0E1A26] rounded border border-[#26394B]">
                <div className="text-[#63768A] text-[10px]">Mandatory Minimum</div>
                <div className="text-base font-bold text-[#C9A15A] mt-0.5">
                  {fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm
                </div>
                <div className="text-[10px] text-[#99AAB8]">{fontSlab.slab_id} ({fontSlab.name})</div>
              </div>
            </div>

            {/* Rule 7 verdict explanation */}
            <div
              className={`p-3 rounded border text-xs leading-relaxed flex items-start gap-2.5 ${
                isFontCompliant
                  ? "bg-[#5AAE83]/10 border-[#5AAE83]/30 text-[#EDEAE1]"
                  : "bg-[#D06A5A]/10 border-[#D06A5A]/30 text-[#EDEAE1]"
              }`}
            >
              {isFontCompliant ? (
                <CheckCircle size={16} className="text-[#5AAE83] flex-none mt-0.5" />
              ) : (
                <XCircle size={16} className="text-[#D06A5A] flex-none mt-0.5" />
              )}
              <div>
                <strong className={isFontCompliant ? "text-[#5AAE83]" : "text-[#D06A5A]"}>
                  {isFontCompliant ? "LMPC Rule 7 Compliant: " : "LMPC Rule 7 Violation: "}
                </strong>
                {isFontCompliant
                  ? `Measured font height of ${measuredFontMm.toFixed(2)} mm meets or exceeds the required statutory minimum of ${fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm for packages under ${fontSlab.name}.`
                  : `Measured font height of ${measuredFontMm.toFixed(2)} mm is below the mandatory legal threshold of ${fontSlab.mandatory_min_font_height_mm.toFixed(1)} mm for ${fontSlab.name}. Subject to statutory show-cause notice.`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
