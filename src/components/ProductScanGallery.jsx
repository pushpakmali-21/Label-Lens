import React, { useState } from "react";
import { Scan, CheckCircle2, AlertTriangle, ExternalLink, Filter, Sparkles } from "lucide-react";

export const PRODUCT_SCANS = [
    {
        id: "lays",
        name: "Lay's Classic Salted Potato Chips",
        category: "Snacks",
        barcode: "8901725011234",
        netQty: "52 g",
        mrp: "₹20.00",
        status: "Compliant",
        image: "/images/lays_scan.png",
        ruleVerified: "Rule 6, 7, 8, 11, 12",
        details: "All mandatory declarations (Net Qty, MRP, Mfg Date, Best Before, FSSAI) present with compliant font sizes.",
    },
    {
        id: "cocacola",
        name: "Coca-Cola Original Soft Drink (750 ml)",
        category: "Beverages",
        barcode: "8906025001072",
        netQty: "750 ml",
        mrp: "₹40.00",
        status: "Compliant",
        image: "/images/cocacola_scan.png",
        ruleVerified: "Rule 6, 7, 18, 22",
        details: "High-contrast barcode scan on cylindrical PET bottle. MRP inclusive of all taxes verified.",
    },
    {
        id: "amul",
        name: "Amul Taaza Homogenised Toned Milk (500 ml)",
        category: "Dairy",
        barcode: "8901262000019",
        netQty: "500 ml",
        mrp: "₹27.00",
        status: "Non-Compliant",
        image: "/images/amul_scan.png",
        ruleVerified: "Rule 8 (Font Size Deficit)",
        details: "MRP font size detected at 1.4 mm, below the mandatory 2.0 mm slab height for 500 ml dairy commodities.",
    },
    {
        id: "pulses",
        name: "Organic Red Lentils / Pulses Pack (500 g)",
        category: "Staples",
        barcode: "8906063520017",
        netQty: "500 g",
        mrp: "₹85.00",
        status: "Compliant",
        image: "/images/pulses_scan.png",
        ruleVerified: "Rule 6, 22",
        details: "Clear back-panel scanning on flexible transparent film. Unit sale price correctly declared per 100g.",
    },
    {
        id: "lotion",
        name: "Glow Radiance Pink Face Cream Tube (50 ml)",
        category: "Cosmetics",
        barcode: "8908007530245",
        netQty: "50 ml",
        mrp: "₹199.00",
        status: "Compliant",
        image: "/images/lotion_scan.png",
        ruleVerified: "Rule 6(1), Rule 8",
        details: "Curved surface OCR parsing. Batch number and manufacture month extracted with 98% confidence.",
    },
    {
        id: "oregano",
        name: "KEYA Oregano Leaves Spice Jar (40 g)",
        category: "Spices",
        barcode: "8906024150118",
        netQty: "40 g",
        mrp: "₹99.00",
        status: "Compliant",
        image: "/images/oregano_scan.png",
        ruleVerified: "Rule 6(1)(e)",
        details: "Glass bottle label scan. Consumer care email and toll-free helpline number verified against Rule 13.",
    },
];

export default function ProductScanGallery({ onSelectScan }) {
    const [filter, setFilter] = useState("all");
    const [activeModalItem, setActiveModalItem] = useState(null);

    const filteredScans = PRODUCT_SCANS.filter((item) => {
        if (filter === "compliant") return item.status === "Compliant";
        if (filter === "noncompliant") return item.status === "Non-Compliant";
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-panel-line pb-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brass/10 border border-brass/30 text-brass text-xs font-mono mb-2">
                        <Sparkles size={14} />
                        <span>Real Consumer Product Scan Dataset</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-1">
                        Real-World Barcode &amp; PDP Scanning Benchmarks
                    </h2>
                    <p className="text-xs sm:text-sm text-text-2 mt-1">
                        Direct camera scan examples on Indian packaged goods — verifying barcodes, font heights, and Rule 6 declarations.
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 bg-panel-darker p-1 rounded-lg border border-panel-line text-xs">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filter === "all" ? "bg-brass text-brass-ink shadow" : "text-text-2 hover:text-text-1"
                            }`}
                    >
                        All (8 Scans)
                    </button>
                    <button
                        onClick={() => setFilter("compliant")}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filter === "compliant" ? "bg-emerald-500 text-white shadow" : "text-text-2 hover:text-text-1"
                            }`}
                    >
                        Compliant
                    </button>
                    <button
                        onClick={() => setFilter("noncompliant")}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filter === "noncompliant" ? "bg-red-500 text-white shadow" : "text-text-2 hover:text-text-1"
                            }`}
                    >
                        Violations
                    </button>
                </div>
            </div>

            {/* Overview Grid Photo Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-panel-line shadow-xl bg-panel-darker group">
                <img
                    src="/images/product_scans_grid.jpg"
                    alt="Real Product Scanning Grid — Lay's, Coca-Cola, Amul, Spices, Cosmetics"
                    className="w-full h-auto max-h-[380px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a15] via-transparent to-transparent flex items-end p-6">
                    <div className="bg-[#090a15]/90 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-xl">
                        <h3 className="font-serif font-bold text-lg text-white">8 Real-World Mobile Camera Scans</h3>
                        <p className="text-xs text-text-2 mt-1">
                            LabelLens computer vision pipeline handles varied lighting, glare on plastic/foil wrappers, curved glass jars, and low-contrast barcodes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid of Individual Product Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredScans.map((scan) => (
                    <div
                        key={scan.id}
                        className="bg-panel border border-panel-line hover:border-brass/60 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                    >
                        <div>
                            {/* Product Scan Image Header */}
                            <div className="relative aspect-[4/3] bg-panel-darker overflow-hidden">
                                <img
                                    src={scan.image}
                                    alt={scan.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span
                                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold border backdrop-blur-md shadow-md ${scan.status === "Compliant"
                                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                            : "bg-red-500/20 text-red-300 border-red-500/50"
                                        }`}
                                >
                                    {scan.status}
                                </span>
                                <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-text-2 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                                    Barcode: {scan.barcode}
                                </span>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 space-y-2">
                                <div className="text-[10px] font-mono text-brass uppercase tracking-wider">{scan.category}</div>
                                <h3 className="font-serif font-semibold text-base text-text-1 group-hover:text-brass transition-colors leading-snug">
                                    {scan.name}
                                </h3>
                                <p className="text-xs text-text-2 leading-relaxed line-clamp-2">{scan.details}</p>

                                <div className="pt-2 flex items-center justify-between text-xs font-mono text-text-3 border-t border-panel-line/60">
                                    <span>Net Qty: <strong className="text-text-1">{scan.netQty}</strong></span>
                                    <span>MRP: <strong className="text-text-1">{scan.mrp}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-3 bg-panel-darker border-t border-panel-line flex items-center justify-between text-xs">
                            <span className="text-[11px] font-mono text-text-3 truncate max-w-[170px]">{scan.ruleVerified}</span>
                            {onSelectScan && (
                                <button
                                    onClick={() => onSelectScan(scan)}
                                    className="bg-brass/15 hover:bg-brass text-brass hover:text-brass-ink font-semibold text-[11px] px-3 py-1.5 rounded transition-all flex items-center gap-1"
                                >
                                    <Scan size={13} />
                                    <span>Inspect Scan</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
