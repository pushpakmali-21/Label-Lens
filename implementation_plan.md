# Implementation Plan: LabelLens — Citizen + Official Unified Platform

> **Scope:** Phase 0 — SIH 2026 Demo Ready (current sprint)
> **Source of Truth:** combined_architecture_plan.md
> **Codebase:** React 18 + Vite + Tailwind (existing src/ tree)

---

## Goal

Evolve LabelLens from a DoCA-only inspector tool into a **Citizen + Official unified platform** demonstrable live to SIH 2026 judges. The demo must show all three user personas interacting with the same system: a citizen scans a product, reports a violation, and a judge watching the official dashboard sees that report appear live.

This plan integrates solutions to four architectural bottlenecks:
1. **Data Noise** - Two-Tier Cascading ML (barcode dedup → cloud ML only when needed)
2. **Backend Validation Integrity** - Client-side is UI sugar only; backend is the legal source of truth
3. **Role-Based Access Control** - Hard UI boundary between citizen and official surfaces
4. **Cloud Cost Traps** - Tier 1 cache hit skips all ML spend on repeated products

---

## User Review Required

> [!IMPORTANT]
> **This plan is Phase 0 (frontend-only demo).** Every ML/backend step is simulated with realistic UI states and timed delays. No FastAPI, no real OCR, no PostgreSQL in this sprint. The goal is a polished, judge-ready browser demo, not a production system.

> [!IMPORTANT]
> **CitizenScanner.jsx already exists** but is NOT yet wired into App.jsx. It has no role-gating, no Two-Tier animation, and no live feed injection. All of that is built in this plan.

> [!WARNING]
> **MobileScannerModal.jsx imports Flashlight from lucide-react which does not exist** in the installed version. This crashes on every scan attempt. This is Bug 1 and must be fixed first.

---

## Alignment with Architecture Plan

| Architecture Plan Section | Implementation Plan Coverage |
|---|---|
| Three User Personas (Citizen, Inspector, DoCA Admin) | Role toggle in Navbar + App.jsx RBAC routing (Phase 0 simulates Citizen + Inspector) |
| Citizen Scan Flow (idle to scan to pass/fail to report) | Full CitizenScanner.jsx upgrade with Two-Tier animation states |
| Two-Tier Cascading ML Architecture | UI states in CitizenScanner.jsx: Tier 1 cache check then Tier 2 ML pass |
| Demo Narrative: citizen action then inspector dashboard | districtData.js pushCitizenReport() + HeatmapMonitor live feed injection |
| Phase 0 Bug Fixes (4 bugs) | Explicit per-file fixes with exact line numbers |
| Shared Rule Engine (lmpcRules.json) | Backend disclaimer badge in RuleEngineSandbox.jsx |
| Web Dashboard Layer (evolve, don't rewrite) | All changes are additive to existing components |
| Feature Matrix (citizen sees plain English, inspector sees legal detail) | Implemented via userRole conditional rendering |

---

## Proposed Changes

> **Execution Order:** Bugs first (unblocks demo), then RBAC, then CitizenScanner, then Demo Narrative.

---

### Phase 0-A: Bug Fixes (Estimated: ~2 hours)

Fix all four existing bugs before building anything new.

---

#### [MODIFY] src/components/MobileScannerModal.jsx

**Bug:** Flashlight icon on line 2 does not exist in lucide-react. Crashes on some mobile browsers.

**Fix:** Replace Flashlight with Zap throughout the file.

```diff
// Line 2
- import { X, Camera, Upload, Flashlight, RefreshCw, ... } from "lucide-react";
+ import { X, Camera, Upload, Zap, RefreshCw, ... } from "lucide-react";

// Line 59 (inside the flashlight toggle button)
- <Flashlight size={18} />
+ <Zap size={18} />
```

**Verify:** Open the scanner modal on mobile. No console error. Flashlight button renders and toggles state correctly.

---

#### [MODIFY] src/components/RuleEngineSandbox.jsx

**Bug:** Line 195 wraps a JSX expression inside an additional string literal, producing literal quote characters in the output.

**Current (broken) - line 195:**
```jsx
"{preset.length > 25 ? preset.substring(0, 22) + "..." : preset}"
```

**Fixed:**
```jsx
{preset.length > 25 ? preset.substring(0, 22) + "..." : preset}
```

**Verify:** Open the LMPC Rule Sandbox tab. Preset buttons show truncated text without surrounding quote characters.

---

#### [MODIFY] src/components/VisionInspector.jsx

**Bug:** Bounding box overlays (lines 192-222) are inside the simulated-package branch of the conditional. When a user uploads a custom image, the image renders in the OTHER branch, so overlays never appear on top of uploaded images.

**Fix:** Move the bounding box overlay layer OUTSIDE both conditional branches so it renders on top of whichever branch is active.

```diff
<div className="relative aspect-[4/3] ... overflow-hidden ...">

  {customImage ? (
-   <img src={customImage} className="w-full h-full object-contain" />
+   <img src={customImage} className="absolute inset-0 w-full h-full object-contain" />
  ) : (
    <div className="relative w-full h-full ...">
      {/* existing simulated package content - unchanged */}
-     {/* REMOVE bounding box overlay from here */}
-     {showBoxes && selectedPack.boxes.map((box) => { ... })}
    </div>
  )}

+ {/* Bounding box overlays - now OUTSIDE both branches, renders on top of both */}
+ {showBoxes && selectedPack.boxes.map((box) => {
+   const isActive = activeBoxId === box.id;
+   return (
+     <div
+       key={box.id}
+       onMouseEnter={() => setActiveBoxId(box.id)}
+       onMouseLeave={() => setActiveBoxId(null)}
+       onClick={() => setActiveBoxId(box.id === activeBoxId ? null : box.id)}
+       className={`absolute border-2 rounded transition-all cursor-pointer ${
+         isActive ? "ring-2 ring-white shadow-lg z-20" : "z-10"
+       }`}
+       style={{
+         left: `${box.x}%`, top: `${box.y}%`,
+         width: `${box.w}%`, height: `${box.h}%`,
+         borderColor: box.color,
+         backgroundColor: `${box.color}15`,
+       }}
+     >
+       <span
+         className="absolute -top-3.5 left-0 font-mono text-[9px] text-white px-1.5 rounded truncate max-w-[130px]"
+         style={{ backgroundColor: box.color }}
+       >
+         {box.name}
+       </span>
+     </div>
+   );
+ })}

</div>
```

**Verify:** Upload any JPEG in Vision Calibrator tab, enable YOLOv8 Boxes. Colored bounding boxes must appear on top of the uploaded image.

---

#### [MODIFY] src/App.jsx

**Bug:** handleSelectScenarioAndScan(mode) on lines 21-23 ignores the mode argument. Rule6Engine never receives which scenario was selected from the scanner.

**Fix:** Lift mode to state and pass as prop.

```diff
// After line 14 - add new state
+ const [selectedScanMode, setSelectedScanMode] = useState(null);

// Lines 21-23 - fix the handler
  const handleSelectScenarioAndScan = (mode) => {
+   setSelectedScanMode(mode);
    setActiveTab("rule6");
  };

// Lines 36-41 - pass prop to Rule6Engine
  {activeTab === "rule6" && (
    <Rule6Engine
      onGenerateNotice={handleGenerateNotice}
      onOpenScanner={() => setIsScannerOpen(true)}
+     initialScanMode={selectedScanMode}
    />
  )}
```

**Note for Rule6Engine:** Add a useEffect inside Rule6Engine that watches initialScanMode and auto-selects the matching scenario on mount. The selection logic already exists inside Rule6Engine.

**Verify:** Select "Full Label" in MobileScannerModal, trigger capture. Rule 6 Engine tab opens with the correct scenario pre-selected.

---

### Phase 0-B: Role-Based Architecture (Estimated: ~1 day)

Implement a hard UI boundary between Citizen Mode (public) and Official Mode (inspector).

---

#### [MODIFY] src/App.jsx

Add userRole state at the root. All tabs and routing gate on this value.

**New state variables (add after existing useState lines):**
```jsx
const [userRole, setUserRole] = useState("citizen"); // "citizen" | "official"
const [feedRefreshKey, setFeedRefreshKey] = useState(0);
```

**New imports:**
```jsx
import CitizenScanner from "./components/CitizenScanner";
import { pushCitizenReport } from "./data/districtData";
```

**Role change handler:**
```jsx
const handleRoleChange = (newRole) => {
  setUserRole(newRole);
  setActiveTab(newRole === "citizen" ? "citizen" : "rule6");
};
```

**Citizen report handler (fires when citizen submits a violation report):**
```jsx
const handleCitizenReport = (report) => {
  pushCitizenReport(report);        // inject into live feed array
  setFeedRefreshKey(k => k + 1);    // force HeatmapMonitor re-render
};
```

**Updated Navbar JSX:**
```jsx
<Navbar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  onOpenScanner={() => setIsScannerOpen(true)}
  userRole={userRole}
  onRoleChange={handleRoleChange}
/>
```

**Updated BottomNav JSX:**
```jsx
<BottomNav
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  onOpenScanner={() => setIsScannerOpen(true)}
  userRole={userRole}
/>
```

**Main content - add CitizenScanner tab and update HeatmapMonitor:**
```jsx
{activeTab === "citizen" && (
  <CitizenScanner onReportSubmitted={handleCitizenReport} />
)}

{activeTab === "heatmap" && (
  <HeatmapMonitor refreshKey={feedRefreshKey} />
)}
```

**Guard official-only tabs:** Only render vision, rulesandbox, notices when userRole === "official". If userRole is "citizen" and activeTab is somehow set to one of those, redirect to "citizen".

---

#### [MODIFY] src/components/Navbar.jsx

**Updated function signature:**
```jsx
export default function Navbar({ activeTab, setActiveTab, onOpenScanner, userRole, onRoleChange })
```

**Role-gated tab arrays (replace the existing single tabs array):**
```jsx
const citizenTabs = [
  { id: "citizen", label: "Scan & Report", icon: Camera, badge: "Citizen" },
  { id: "heatmap", label: "Vigilance Map", icon: MapPin,  badge: "Live" },
];

const officialTabs = [
  { id: "rule6",       label: "Rule 6 Engine",     icon: Shield,   badge: "3 Scenarios" },
  { id: "vision",      label: "Vision Calibrator", icon: Sparkles, badge: "Rs5 Coin" },
  { id: "rulesandbox", label: "LMPC Rule Sandbox", icon: Sliders,  badge: "Weight Slabs" },
  { id: "notices",     label: "Show-Cause Notice", icon: FileText, badge: "Sec 39" },
  { id: "heatmap",     label: "Vigilance Heatmap", icon: MapPin,   badge: "Live Feed" },
];

const tabs = userRole === "citizen" ? citizenTabs : officialTabs;
```

**Role Toggle UI (add to header right-side area on desktop, below logo on mobile):**
```jsx
<div className="flex items-center gap-1 bg-[#17293B] border border-[#26394B] rounded-lg p-1">
  <button
    onClick={() => onRoleChange("citizen")}
    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
      userRole === "citizen"
        ? "bg-[#5AAE83] text-[#0B1520]"
        : "text-[#63768A] hover:text-[#EDEAE1]"
    }`}
  >
    Citizen
  </button>
  <button
    onClick={() => onRoleChange("official")}
    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
      userRole === "official"
        ? "bg-[#C9A15A] text-[#241B08]"
        : "text-[#63768A] hover:text-[#EDEAE1]"
    }`}
  >
    Official
  </button>
</div>
```

**Official access badge (render next to logo when userRole === "official"):**
```jsx
{userRole === "official" && (
  <span className="text-[10px] font-mono text-[#C9A15A] bg-[#C9A15A]/10 border border-[#C9A15A]/30 px-1.5 py-0.5 rounded ml-2">
    Official Access
  </span>
)}
```

**New lucide-react imports needed:** Camera (for citizen tab icon). Add to existing import line.

---

#### [MODIFY] src/components/BottomNav.jsx

**Updated function signature:**
```jsx
export default function BottomNav({ activeTab, setActiveTab, onOpenScanner, userRole })
```

**Role-gated nav items (replace hardcoded navItems array):**
```jsx
const citizenItems = [
  { id: "citizen", label: "Scan", icon: Camera },
  { id: "heatmap", label: "Map",  icon: MapPin },
];

const officialItems = [
  { id: "rule6",   label: "Rule 6",    icon: Shield },
  { id: "vision",  label: "Vision",    icon: Sparkles },
  // center Scan button unchanged
  { id: "notices", label: "Notices",   icon: FileText },
  { id: "heatmap", label: "Vigilance", icon: MapPin },
];

const navItems = userRole === "citizen" ? citizenItems : officialItems;
```

**Center Scan button in Citizen mode:** Navigate to "citizen" tab instead of opening MobileScannerModal:
```jsx
onClick={userRole === "citizen" ? () => setActiveTab("citizen") : onOpenScanner}
```

---

### Phase 0-C: Two-Tier CitizenScanner Upgrade (Estimated: ~2 days)

Upgrade CitizenScanner.jsx to demonstrate the full Citizen Scan Flow with Two-Tier Cascading ML animation.

Current component state machine: idle → scanning → fail (hardcoded, no pass, no live feed, no prop interface).

---

#### [MODIFY] src/components/CitizenScanner.jsx

**Complete rewrite of state machine and rendering. Keep the existing visual design language.**

**New state variables:**
```jsx
const [scanState, setScanState] = useState("idle");
// Values: "idle" | "barcode_scan" | "cache_check" | "cached" | "ml_scan" | "pass" | "fail"

const [reportState, setReportState] = useState("idle");
// Values: "idle" | "reporting" | "submitted"

const [activeProduct, setActiveProduct] = useState(null);
const [caseRef, setCaseRef] = useState(null);
```

**Mock product data (module-level constant, defined above the component function):**
```jsx
const DEMO_PRODUCTS = {
  cached: {
    name: "Maggi 2-Minute Noodles, 70g",
    brand: "Nestle India Ltd.",
    scanCount: 14283,
    cachedSince: "3 days ago",
  },
  new_fail: {
    name: "Cold-Pressed Orange Juice, 500ml",
    brand: "Freshline Beverages Pvt. Ltd.",
    violations: [
      {
        field: "Manufacture Date",
        plain: "The packaging does not state when it was made or when it expires.",
        rule: "Rule 6(1)(g)",
      },
      {
        field: "Consumer Care Info",
        plain: "No phone number or email is provided for complaints.",
        rule: "Rule 6(1)(f)",
      },
    ],
  },
  new_pass: {
    name: "Tata Salt, 1 kg",
    brand: "Tata Consumer Products Ltd.",
    fields: [
      "MRP printed: Rs28.00",
      "Net Qty: 1 kg (correctly declared)",
      "Consumer Care: 1800-209-8282",
      "Mfg. Date: Jan 2026",
    ],
  },
};
```

**Two-Tier scan handler (replaces current handleScan):**
```jsx
const handleScan = (forceCached = false) => {
  setScanState("barcode_scan");
  setReportState("idle");
  setActiveProduct(null);
  setCaseRef(null);

  // Tier 1, Step 1: Barcode read (~800ms)
  setTimeout(() => {
    setScanState("cache_check");

    // Tier 1, Step 2: Registry check (~700ms)
    setTimeout(() => {
      if (forceCached) {
        // CACHE HIT - skip ML entirely
        setActiveProduct(DEMO_PRODUCTS.cached);
        setScanState("cached");
      } else {
        // CACHE MISS - proceed to Tier 2
        setScanState("ml_scan");

        // Tier 2: Deep ML (~1500ms)
        setTimeout(() => {
          const outcome = Math.random() > 0.4 ? "fail" : "pass";
          setActiveProduct(
            outcome === "fail" ? DEMO_PRODUCTS.new_fail : DEMO_PRODUCTS.new_pass
          );
          setScanState(outcome);
        }, 1500);
      }
    }, 700);
  }, 800);
};
```

**Report handler (replaces current handleReport):**
```jsx
const handleReport = () => {
  setReportState("reporting");
  setTimeout(() => {
    const ref = `CR-${Math.floor(Math.random() * 9000) + 1000}-PN`;
    setCaseRef(ref);
    setReportState("submitted");

    if (onReportSubmitted && activeProduct) {
      onReportSubmitted({
        id: `AUD-${Math.floor(Math.random() * 100) + 9000}`,
        timestamp: "Just now",
        platform: "Citizen Report (Mobile)",
        product: activeProduct.name,
        seller: activeProduct.brand,
        status: "violation",
        issue: activeProduct.violations?.map(v => v.field).join(", ") || "Violation reported",
        citation: activeProduct.violations?.map(v => v.rule).join(" & ") || "LMPC Rules",
        action: "Citizen Report - Pending Inspector Review",
        isCitizenReport: true,
      });
    }
  }, 1500);
};
```

**Updated component signature:**
```jsx
export default function CitizenScanner({ onReportSubmitted }) {
```

**Updated idle state UI - add second CTA button:**
```jsx
// Keep existing "Tap to Scan Label" button, add below it:
<button
  onClick={() => handleScan(true)}
  className="w-full bg-[#17293B] text-[#C9A15A] border border-[#C9A15A]/40 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
>
  <span>Scan Known Product (Cache Demo)</span>
</button>
```

**UI states to render (all inside the main content div):**

| State | What to render |
|---|---|
| `barcode_scan` | Barcode icon + animate-pulse. Header: "Tier 1: Reading Barcode". Subtext: "Scanning product ID..." |
| `cache_check` | Database icon + animate-pulse. Header: "Checking National Product Registry...". Subtext: "Comparing against 2.4M verified scan records" |
| `cached` | Green accent card. Header: "Cache Hit" + lightning bolt icon. Product name, scan count, cachedSince. Yellow info box: "ML bypassed. Cost: Rs0". Button: "Scan Another" that resets to idle. |
| `ml_scan` | Spinner. Header: "Tier 2: Deep ML Analysis". Lines: "YOLOv8 + PaddleOCR active" and "New product - full pipeline required" |
| `pass` | Green CheckCircle2 icon. Header: "COMPLIANT". Product name and brand. Bulleted list of activeProduct.fields. Buttons: "Share Result" and "Scan Another" |
| `fail` | Red AlertTriangle icon. Header: "Non-Compliant Product". Product name and brand. List of violations using .field as title and .plain as explanation. CTA area below (see report states). |

**Report flow states inside the fail state CTA area:**

| reportState | What to render |
|---|---|
| `idle` | Two buttons: "Report Violation to Govt." (red, calls handleReport) and "Cancel / Scan Another" (ghost) |
| `reporting` | Spinner + "Submitting report securely to DoCA..." |
| `submitted` | Green success card: "Report Submitted!" header. "Case Ref: {caseRef}" in monospace. District routing message. "Scan another product" link button that resets scanState and reportState to idle. |

---

### Phase 0-D: Backend Disclaimer Badge (Estimated: ~1 hour)

Add a visual disclaimer to the rule engine so judges understand the client-side vs backend trust boundary.

---

#### [MODIFY] src/components/RuleEngineSandbox.jsx

**1. Add Shield to the lucide-react import on line 2:**
```jsx
import { Sliders, AlertOctagon, CheckSquare, Search, BookOpen, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
```

**2. Add disclaimer banner immediately after the closing h1 tag (after line 42):**
```jsx
{/* Backend Source-of-Truth Disclaimer */}
<div className="mt-3 flex items-start gap-3 p-3 bg-[#17293B] border border-[#C9A15A]/30 rounded-lg">
  <Shield size={16} className="text-[#C9A15A] mt-0.5 flex-none" />
  <p className="text-xs text-[#99AAB8] leading-relaxed">
    <span className="text-[#C9A15A] font-semibold">Client-side evaluation active.</span>{" "}
    This sandbox runs{" "}
    <code className="text-[#C9A15A] font-mono">lmpcValidator.js</code>{" "}
    directly in your browser for instant UI feedback. Final cryptographic sealing,
    legal validation, and database persistence are performed exclusively on the{" "}
    <strong className="text-[#EDEAE1]">DoCA Python backend (FastAPI)</strong>{" "}
    before any audit record is accepted. Client logic cannot generate a legally-valid notice.
  </p>
</div>
```

**Demo pitch line:** "lmpcValidator.js is identical to the server logic. But to prevent reverse-engineering or fake passes, our FastAPI server is the cryptographic source of truth before anything is saved to PostgreSQL. You cannot fake a pass."

---

### Phase 0-E: Live Feed Injection (Estimated: ~1 day)

Connect the citizen's violation report to the official Vigilance Heatmap live feed. This is the "aha moment" for judges.

---

#### [MODIFY] src/data/districtData.js

Convert LIVE_AUDIT_FEED from a static const to a mutable module-level variable with getter and push functions. Keep all existing entries.

```js
// Replace the static "export const LIVE_AUDIT_FEED = [...]" with:

let _liveAuditFeed = [
  // Paste all 4 existing entries here exactly as they currently appear
  {
    id: "AUD-8921",
    timestamp: "2 mins ago",
    platform: "QuickCommerce App #1",
    product: "Organic Honey, 250 g",
    seller: "NaturePure Farms Ltd.",
    status: "violation",
    issue: "Non-standard unit 'gms' used; missing manufacturing date in listing",
    citation: "Rule 13 & Rule 6(10)",
    action: "Show-Cause Notice Queued"
  },
  {
    id: "AUD-8920",
    timestamp: "7 mins ago",
    platform: "Physical POS (Supermarket)",
    product: "Cashew Nuts, 500 g",
    seller: "Royal Agro Packs",
    status: "pass",
    issue: "Full compliance verified (font height 4.2mm >= 4.0mm threshold)",
    citation: "Rule 6(1) & Rule 7",
    action: "Digital Seal Granted"
  },
  {
    id: "AUD-8919",
    timestamp: "14 mins ago",
    platform: "E-Commerce Giant #2",
    product: "Wireless Earbuds with Mic",
    seller: "AudioTech India",
    status: "pass",
    issue: "Electronics QR proviso verified — address in decoded payload",
    citation: "Rule 6(1) Proviso (2022)",
    action: "Proviso Validated"
  },
  {
    id: "AUD-8918",
    timestamp: "21 mins ago",
    platform: "QuickCommerce App #3",
    product: "Atta Whole Wheat, 5 kg",
    seller: "Golden Harvest Mills",
    status: "violation",
    issue: "Prohibited statement 'Net weight when packed' detected in description",
    citation: "Rule 11(1)",
    action: "Notice Sent to Seller"
  }
];

// Getter - returns the current array (called fresh on each render)
export function getLiveAuditFeed() {
  return _liveAuditFeed;
}

// Push - prepends a new citizen report to the front of the feed
export function pushCitizenReport(report) {
  _liveAuditFeed = [report, ..._liveAuditFeed];
}

// Backwards-compatibility alias - do NOT remove, other files may import it
export const LIVE_AUDIT_FEED = _liveAuditFeed;

// Keep DISTRICT_METRICS export unchanged
```

> [!NOTE]
> Vite module instances are singletons within a browser tab. pushCitizenReport() mutates the module-level array. Any component that calls getLiveAuditFeed() on its next render will see the new entry. This gives the "live" effect without Redux or Context.

---

#### [MODIFY] src/components/HeatmapMonitor.jsx

**1. Update the import - replace LIVE_AUDIT_FEED with getLiveAuditFeed:**
```jsx
// Remove: import { LIVE_AUDIT_FEED } from "../data/districtData";
// Add:
import { DISTRICT_METRICS, getLiveAuditFeed } from "../data/districtData";
```

**2. Update function signature to accept refreshKey:**
```jsx
export default function HeatmapMonitor({ refreshKey }) {
```

**3. Call getLiveAuditFeed() at the top of the render function:**
```jsx
// Add this inside the component body, before the return statement:
const feedData = getLiveAuditFeed();
// Then replace all references to LIVE_AUDIT_FEED in the JSX with feedData
```

**4. Citizen report badge - add inside the feed card renderer wherever the status badge is rendered:**
```jsx
{entry.isCitizenReport && (
  <span className="text-[10px] font-mono bg-[#5AAE83]/20 text-[#5AAE83] border border-[#5AAE83]/30 px-1.5 py-0.5 rounded ml-1">
    Citizen Report
  </span>
)}
```

---

## File Change Summary

| File | Phase | Change Summary |
|---|---|---|
| src/components/MobileScannerModal.jsx | 0-A | Replace Flashlight import with Zap (lines 2 and 59) |
| src/components/RuleEngineSandbox.jsx | 0-A + 0-D | Fix JSX string bug line 195; add Shield import; add disclaimer banner |
| src/components/VisionInspector.jsx | 0-A | Move bounding box overlay outside simulated-package conditional branch |
| src/App.jsx | 0-A + 0-B + 0-E | Fix handleSelectScenarioAndScan; add userRole, selectedScanMode, feedRefreshKey states; add CitizenScanner tab; wire onReportSubmitted; pass role props |
| src/components/Navbar.jsx | 0-B | Add userRole/onRoleChange props; add Role Toggle UI; add Official badge; filter tabs by role |
| src/components/BottomNav.jsx | 0-B | Add userRole prop; filter nav items by role; Citizen mode center button navigates to citizen tab |
| src/components/CitizenScanner.jsx | 0-C | Full Two-Tier 7-state machine; DEMO_PRODUCTS mock data; onReportSubmitted callback; 7 render states |
| src/data/districtData.js | 0-E | Convert LIVE_AUDIT_FEED to mutable; add pushCitizenReport() and getLiveAuditFeed() |
| src/components/HeatmapMonitor.jsx | 0-E | Accept refreshKey prop; use getLiveAuditFeed(); render Citizen Report badge |

---

## Verification Plan

### Pre-Demo Checklist (Run in order)

#### Bug Fix Verification

| ID | Test | Pass Condition |
|---|---|---|
| B1 | Open scanner modal on any device | No console error. Zap icon renders in flashlight button. |
| B2 | Open LMPC Rule Sandbox, inspect preset buttons | Buttons show truncated text, NOT text surrounded by quote characters |
| B3 | Vision Calibrator: upload a JPEG, enable YOLOv8 Boxes toggle | Colored bounding boxes appear ON TOP of uploaded image |
| B4 | MobileScannerModal: select Full Label mode, trigger capture | Rule 6 Engine tab opens AND the correct scenario is pre-selected |

#### RBAC Verification

| ID | Test | Pass Condition |
|---|---|---|
| R1 | Load app (default Citizen Mode) | Nav shows ONLY Scan & Report and Vigilance Map. Show-Cause Notice and Vision Calibrator are hidden. |
| R2 | Toggle to Official Mode | Full 5-tab nav appears. Official Access badge appears next to logo. |
| R3 | Toggle back to Citizen Mode | App navigates to Citizen Scanner. Official tabs disappear. |
| R4 | Mobile: check BottomNav in both modes | Citizen: 2 items plus center scan. Official: 4 items plus center scan. |

#### Two-Tier Scan Flow Verification

| ID | Test | Pass Condition |
|---|---|---|
| T1 | Citizen Mode: tap "Tap to Scan Label" | States fire in sequence: barcode_scan (0.8s) then cache_check (0.7s) then ml_scan (1.5s) then pass or fail |
| T2 | Citizen Mode: tap "Scan Known Product (Cache Demo)" | States: barcode_scan then cache_check then cached. No ml_scan state appears. Maggi shown. Cost Rs0 visible. |
| T3 | Fail result: tap "Report Violation to Govt." | Spinner shows, then success card with CR-XXXX-PN case ref |

#### Demo Narrative Verification (The Aha Moment)

| ID | Test | Pass Condition |
|---|---|---|
| D1 | Citizen Mode: get fail result, submit report | CR-XXXX-PN case ref shown. Report submitted. |
| D2 | Toggle Role to Official Mode | App navigates to Rule 6 Engine tab. |
| D3 | Navigate to Vigilance Heatmap | Citizen report from D1 is at the TOP of Live Audit Feed with green Citizen Report badge. |
| D4 | Repeat D1-D3 with a second report | Two citizen reports at top, most recent first. Both have green badges. |

#### Backend Disclaimer Verification

| ID | Test | Pass Condition |
|---|---|---|
| S1 | Official Mode: open LMPC Rule Sandbox tab | Yellow shield banner visible below the h1 with text about client-side evaluation and FastAPI backend. |

---

## Demo Script (Word-for-Word for SIH Judges)

**Step 1 - Start in Citizen Mode (default on load)**
"This is what 1.4 billion Indians see when they open LabelLens. No login. No government portal. Just scan."

**Step 2 - Tap "Scan Known Product (Cache Demo)"**
"Tier 1 activates - we read the barcode first. We check our national product registry of 2.4 million records. Maggi is scanned 14,000 times a month. We already know this product is compliant. Zero ML cost. Zero database write. The result is instant. This is how we avoid bankrupting the government with cloud bills."

**Step 3 - Tap back, then tap "Tap to Scan Label" for a new product**
"For a product we have never seen, Tier 1 fails and Tier 2 activates - YOLOv8 spatial detection plus PaddleOCR runs the full deep scan. This is where compute cost happens. But it only happens once per product per billing period. All subsequent scans of this product are cache hits."

**Step 4 - Get a FAIL result, tap "Report Violation to Govt."**
"The citizen reports the violation in one tap. Anonymous. GPS-stamped to this store. Automatically routed to the Legal Metrology Inspector for this district."

**Step 5 - Toggle Role Toggle to Official Mode, navigate to Vigilance Heatmap**
"I am now a DoCA officer. Watch the live feed. There - at the top - is the citizen report from 10 seconds ago. Citizen action triggers government response. That moment is the entire value proposition of LabelLens: we turn every smartphone into a compliance terminal."

**Step 6 - Go to LMPC Rule Sandbox, point at the disclaimer banner**
"Even our rule engine is architected for security. This client-side evaluation gives instant feedback. But no audit result is legally valid until it is cryptographically sealed by our FastAPI backend. You cannot fake a compliance pass. The government has the final word - always."

---

## What This Plan Does NOT Cover (Future Sprints)

| Feature | Sprint |
|---|---|
| Real QR code decode with html5-qrcode | Sprint 1 |
| FastAPI project skeleton + /api/v1/scan/image real endpoint | Sprint 1 |
| PostgreSQL schema + JWT auth + inspector login | Sprint 1 |
| Port lmpcValidator.js to Python lmpc_validator.py | Sprint 1 |
| YOLOv8 fine-tuned on Indian packaged goods images | Sprint 2 |
| PaddleOCR real OCR pipeline integration | Sprint 2 |
| Server-side PDF notice generation via WeasyPrint | Sprint 2 |
| React Native mobile app citizen mode | Sprint 3 |
| Offline mode plus sync queue for inspector mobile | Sprint 3 |
| Celery e-commerce scraping workers for Blinkit, Zepto, Amazon | Sprint 4 |
| Real crowdsourced heatmap via WebSocket feed | Sprint 4 |
| Push notifications for citizen report status updates | Sprint 3 |

See combined_architecture_plan.md for full Sprint 1-5 detail.
