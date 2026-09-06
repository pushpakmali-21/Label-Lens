# LabelLens Frontend — Teammate B: Citizen Scan Experience

> **You own these files, and only these:** `MobileScannerModal.jsx`, `CitizenScanner.jsx`
> **You do NOT touch:** `App.jsx`, `Navbar.jsx`, `BottomNav.jsx`, `RuleEngineSandbox.jsx`, `VisionInspector.jsx`, `districtData.js`, `HeatmapMonitor.jsx` — that's your teammate's scope.
> **Live app:** https://label-lens-snowy.vercel.app/

---

## 1. What you're building

The entire citizen-facing scan flow: a public user taps to scan a product, watches a two-tier "cache check then ML" animation, gets a plain-English pass/fail verdict, and can report a violation in one tap. This is the demo's centerpiece — give it the most polish time of anything in this project. Everything here is UI-only — no real backend calls, no real barcode decoding.

---

## 2. Build order

### Step 1 — Bug fix (~10 min)

**`MobileScannerModal.jsx`**
- It imports `Flashlight` from `lucide-react`, which doesn't exist in the installed version and crashes the modal on render.
- Replace `Flashlight` with `Zap` everywhere in the file (the import line and wherever the icon is used).

**Verify:** open the scanner modal on mobile. No console error. The flashlight button renders and toggles correctly.

---

### Step 2 — CitizenScanner full rebuild (~2 days)

The component currently exists but only has a hardcoded idle → scanning → fail flow with no pass state, no live feed hookup, and no real prop interface. Rebuild the state machine. **Keep the existing visual design language** — this is a flow rebuild, not a redesign of the visuals.

**State machine to implement:**

```
idle → barcode_scan → cache_check → ┬→ cached (cache hit, skip ML)
                                      └→ ml_scan → pass | fail
```

| State | What to show |
|---|---|
| `barcode_scan` | Barcode icon, pulsing. "Tier 1: Reading Barcode" / "Scanning product ID..." |
| `cache_check` | Database icon, pulsing. "Checking National Product Registry..." / "Comparing against 2.4M verified scan records" |
| `cached` | Green card. "Cache Hit" + lightning icon. Product name, scan count, cached-since. Callout: "ML bypassed. Cost: ₹0." Button to scan again. |
| `ml_scan` | Spinner. "Tier 2: Deep ML Analysis" / "YOLOv8 + PaddleOCR active — new product, full pipeline required" |
| `pass` | Green check icon. "COMPLIANT." Product name/brand, bulleted list of correctly-declared fields. Buttons: share result / scan another. |
| `fail` | Red alert icon. "Non-Compliant Product." Product name/brand, list of violations (field + plain-English explanation). Leads into the report flow below. |

**Report flow (nested inside the `fail` state):**

| Sub-state | What to show |
|---|---|
| `idle` | "Report Violation to Govt." button + a cancel/scan-again option |
| `reporting` | Spinner, "Submitting report securely to DoCA..." |
| `submitted` | Success card with a generated case reference (e.g. `CR-1234-PN`), a district-routing message, and a "scan another" reset link |

**Critical requirement — do not randomize the demo outcome.** The main "Tap to Scan Label" button's result must NOT be a coin flip (avoid patterns like `Math.random() > 0.4 ? "fail" : "pass"` deciding the outcome). Your team needs a deterministic fail case to walk through in the demo, every single time, without hoping the dice land right on stage. Concretely:
- **Primary button ("Tap to Scan Label")** → always resolves to a specific `fail` product after the full `barcode_scan → cache_check → ml_scan` sequence.
- **Second button ("Scan Known Product — Cache Demo")** → always resolves to `cached` directly after `barcode_scan → cache_check`, skipping `ml_scan` entirely. This is what proves the cost-saving story.
- If you want a `pass` case too for realism, add a third explicit button for it rather than leaving any outcome to chance.

**The prop your component must expose:**

```jsx
export default function CitizenScanner({ onReportSubmitted }) {
```

When a report is submitted, call it with an object shaped like this (your teammate's live feed expects these exact fields):

```jsx
onReportSubmitted({
  id: `AUD-${Math.floor(Math.random() * 100) + 9000}`,
  timestamp: "Just now",
  platform: "Citizen Report (Mobile)",
  product: activeProduct.name,
  seller: activeProduct.brand,
  status: "violation",
  issue: activeProduct.violations.map(v => v.field).join(", "),
  citation: activeProduct.violations.map(v => v.rule).join(" & "),
  action: "Citizen Report - Pending Inspector Review",
  isCitizenReport: true,
});
```

This is the one contract point between your work and your teammate's — you can build and test entirely on your own against this shape without needing anything from them. A quick `console.log` in place of the real callback is a fine stand-in until they're ready to wire it in.

**Verify:** both scan paths (new-product / known-product) play their full animation sequence with no dead ends; the fail path lets you submit a report and always produces a case reference; nothing here makes a real network call.

---

## 3. Definition of done (your scope)

1. No console errors, desktop and mobile widths.
2. Scanner modal opens with no crash; flashlight button works.
3. Both scan paths in `CitizenScanner` complete deterministically — no random pass/fail on the primary button.
4. Fail state → report flow → case reference generation all work end-to-end.
5. `onReportSubmitted` fires with the exact field shape shown above (test with a temporary `console.log` if `App.jsx` isn't wired up yet).

---

## 4. Out of scope — don't build these

Real backend calls, real barcode/QR decoding, real ML integration, anything touching role-based access (that's your teammate's file — you don't need `userRole` for anything in this scope).

---

## 5. Once both of you are done

Run the full end-to-end test together: Citizen mode → get a fail result → submit report → toggle to Official → open Vigilance Heatmap → confirm the report appears at the top with the correct badge. Don't consider your piece finished in isolation — it only really works once this full loop is proven live.
