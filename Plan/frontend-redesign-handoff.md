# LabelLens — Frontend Redesign Handoff (Phase 0)

> **Who this is for:** the teammate doing the frontend work, solo.
> **Scope:** implement the Citizen + Official role-based redesign on the existing React codebase. No backend, no real ML, no new libraries beyond what's already installed.
> **Live app:** https://label-lens-snowy.vercel.app/
> **Source of truth doc:** `implementation_plan.md` (this brief is the condensed, ordered version of it — read that file for exact diffs when you get to each step)

---

## 1. What LabelLens is, in one paragraph

LabelLens is a Legal Metrology label-compliance scanner being built for SIH 2026. It's pivoting from an inspector-only tool into a platform with two user modes: **Citizen** (public, scans a product, gets a plain-English compliance verdict, can report a violation) and **Official** (DoCA inspector, sees the full rule engine, vision calibrator, notice generator, and a live violations feed). Your job is the frontend work to make that split real, plus four existing bugs that block everything else.

---

## 2. Ground rules before you touch anything

- **This is a demo build, not production.** Every "ML scan" and "backend check" is a timed UI animation, not a real API call. Don't add real network calls, real OCR, or a real backend — that's explicitly out of scope for this phase (see §6).
- **Evolve, don't rewrite.** Keep the existing visual design language (colors, spacing, component structure) in every file you touch. This is a redesign of *flow and structure*, not a new visual identity.
- **Don't touch anything not listed below.** If you think something outside this list needs to change, flag it — don't just change it.
- **Work in this exact order.** Each phase below depends on the one before it. Don't start Phase 0-C before 0-A and 0-B are done and verified.

---

## 3. Build order

### Phase 0-A — Fix 4 existing bugs first (~2 hrs)

Do this before anything else. All four bugs live in files you're about to extend, so fixing them first gives you a clean base — otherwise you won't know if something broke because of your new code or a bug that was already there.

| File | Bug | Fix |
|---|---|---|
| `src/components/MobileScannerModal.jsx` | Imports `Flashlight` from `lucide-react`, which doesn't exist in the installed version → crashes on scan | Replace `Flashlight` with `Zap` everywhere in the file (import line + usage) |
| `src/components/RuleEngineSandbox.jsx` | Line ~195 wraps a JSX expression in an extra string literal → shows literal quote marks in the UI | Remove the outer string quotes around the ternary expression |
| `src/components/VisionInspector.jsx` | Bounding box overlay is nested inside the "simulated package" branch of a conditional, so it never renders on top of a user-uploaded image | Move the bounding-box overlay block outside both branches of the conditional so it renders regardless of which branch is active |
| `src/App.jsx` | `handleSelectScenarioAndScan(mode)` ignores its `mode` argument, so `Rule6Engine` never learns which scenario was picked | Add a `selectedScanMode` state, set it in the handler, pass it into `Rule6Engine` as `initialScanMode` |

**Verify before moving on:** scanner modal opens with no console error; sandbox preset buttons show clean truncated text; uploading a JPEG in Vision Calibrator shows boxes on top of it; selecting a scenario in the modal opens Rule 6 Engine pre-selected correctly.

---

### Phase 0-B — Role-based access control (~1 day)

Build the hard Citizen/Official boundary.

**`src/App.jsx`**
- Add `userRole` state, default `"citizen"`.
- Add a role-change handler that also resets `activeTab` to a sensible default for that role (`"citizen"` tab for citizen, `"rule6"` for official).
- Guard official-only tabs (`vision`, `rulesandbox`, `notices`): if `userRole` is `"citizen"` and `activeTab` is somehow one of those, redirect back to `"citizen"`. Use a `useEffect` watching both values — don't rely on the toggle alone to prevent this state.

**`src/components/Navbar.jsx`**
- Split the tab list into `citizenTabs` (Scan & Report, Vigilance Map) and `officialTabs` (Rule 6 Engine, Vision Calibrator, LMPC Rule Sandbox, Show-Cause Notice, Vigilance Heatmap).
- Add a visible Citizen/Official toggle in the header.
- Show an "Official Access" badge next to the logo only when in Official mode.

**`src/components/BottomNav.jsx`**
- Same role-based split for mobile nav items.
- In Citizen mode, the center scan button should navigate to the Citizen scan tab, not open the old scanner modal.

**Verify before moving on:** loading the app defaults to Citizen mode showing only 2 tabs; toggling to Official reveals all 5 tabs plus the badge; toggling back hides them again; nothing crashes if you switch roles mid-flow.

---

### Phase 0-C — Two-tier CitizenScanner rebuild (~2 days)

This is the demo centerpiece — give it the most polish time. `CitizenScanner.jsx` already exists but currently only has a hardcoded idle → scanning → fail flow. Rebuild its state machine to show the full two-tier story:

**States to implement, in order:** `idle` → `barcode_scan` → `cache_check` → then either `cached` (cache hit, skip ML, "Cost: ₹0") or `ml_scan` → `pass`/`fail`.

**Critical requirement — do not randomize the demo outcome.** The "new product" scan path must deterministically end in a specific product/result for the main demo button, not a coin flip. If you want a pass and a fail case for realism, use two separate buttons/triggers, not `Math.random()` on the primary path. A random outcome on stage is the single easiest way for this demo to go wrong.

- Add a second button: "Scan Known Product (Cache Demo)" that always goes straight to `cached` state, skipping `ml_scan` entirely — this is what proves the cost-saving story.
- On `fail`, show a "Report Violation to Govt." button. On click, run a short `reporting` → `submitted` sequence and generate a case reference like `CR-1234-PN`.
- When a report is submitted, call an `onReportSubmitted` prop (passed down from `App.jsx`) with the report data — this is what feeds Phase 0-E below.

**Verify before moving on:** both scan paths (new product / known product) play through their full animation sequence with no dead states; the fail path lets you submit a report and get a case reference; nothing here calls a real API.

---

### Phase 0-D — Backend disclaimer badge (~1 hr)

**`src/components/RuleEngineSandbox.jsx`**
- Add a small banner under the page heading, visible only in Official mode: client-side evaluation is for instant UI feedback only; final validation and persistence happen on the backend. This is a trust-boundary signal for judges, not a functional change.

**Verify:** banner is visible in Official mode on the Rule Sandbox tab, doesn't appear in Citizen mode (it's not reachable there anyway, but confirm no rendering error).

---

### Phase 0-E — Live feed injection (~1 day)

This connects the citizen flow to the official dashboard — the "aha moment" of the whole demo.

**`src/data/districtData.js`**
- Convert the existing static `LIVE_AUDIT_FEED` array into a mutable module-level variable with a `getLiveAuditFeed()` getter and a `pushCitizenReport(report)` function that prepends new reports to the front.
- Keep a `LIVE_AUDIT_FEED` export alias for backward compatibility — other files may still import it directly.

**`src/components/HeatmapMonitor.jsx`**
- Accept a `refreshKey` prop and call `getLiveAuditFeed()` on render instead of importing the old static array.
- Add a small "Citizen Report" badge on feed entries where `isCitizenReport` is true.

**`src/App.jsx`**
- Wire a `handleCitizenReport` function that calls `pushCitizenReport()` and bumps a `feedRefreshKey` counter, passed to `HeatmapMonitor`.

**Verify — this is the full end-to-end test:** in Citizen mode, get a fail result, submit a report. Toggle to Official mode, open Vigilance Heatmap. The report you just submitted should be at the top of the feed with a green "Citizen Report" badge. Do this twice — the second report should land above the first.

---

## 4. A practical warning about line numbers

`App.jsx` gets edited in three different phases (0-A, 0-B, 0-E). Any line numbers referenced in `implementation_plan.md` were captured against the file *before* earlier edits landed — once you make the 0-A fix, everything after that point shifts down a few lines. Match edits by the surrounding code shown in the plan, not by trusting a literal line number once you're past the first edit to a file.

---

## 5. Definition of done — full pre-demo checklist

Don't call this finished until all of these pass, in order:

1. No console errors anywhere in either role, on both desktop and mobile widths.
2. Citizen mode shows exactly 2 tabs; Official mode shows exactly 5.
3. Both CitizenScanner paths (new scan / known-product cache demo) complete without random or dead-end states.
4. A submitted citizen report appears live on the Official Vigilance Heatmap with the correct badge, in the correct (newest-first) order.
5. Vision Calibrator shows bounding boxes correctly on an uploaded image.
6. Rule Sandbox shows the backend disclaimer badge and clean preset button text.
7. Full demo script runs start-to-finish with no manual workarounds (ask for the demo script if you don't have it).

---

## 6. Explicitly out of scope — do not build these

If you find yourself tempted to "just quickly" do one of these, stop and check in first — they're planned for later sprints, not this phase:

- Any real backend call, FastAPI endpoint, or database write
- Real QR/barcode decoding (`html5-qrcode` or similar)
- Real YOLOv8 or PaddleOCR integration
- Server-side PDF generation
- Auth/login flows
- Anything touching the React Native / mobile app codebase (this is web-only)

---

## 7. If you're blocked or unsure

Don't guess on anything involving the demo script's flow, the color/design tokens, or whether something counts as in/out of scope — check in rather than diverging, since this is going straight in front of SIH judges and there's no time to unwind a wrong turn late.
