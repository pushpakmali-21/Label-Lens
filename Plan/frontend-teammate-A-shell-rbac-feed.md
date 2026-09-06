# LabelLens Frontend — Teammate A: App Shell, RBAC & Live Feed

> **You own these files, and only these:** `App.jsx`, `Navbar.jsx`, `BottomNav.jsx`, `RuleEngineSandbox.jsx`, `VisionInspector.jsx`, `districtData.js`, `HeatmapMonitor.jsx`
> **You do NOT touch:** `CitizenScanner.jsx`, `MobileScannerModal.jsx` — that's your teammate's scope. You only consume `CitizenScanner`'s finished output via one prop (see §4).
> **Live app:** https://label-lens-snowy.vercel.app/

---

## 1. What you're building

The role-based shell that makes LabelLens behave as two different apps depending on who's using it (Citizen vs Official), plus the plumbing that makes a citizen's violation report show up live on the official dashboard. Everything here is UI-only — no real backend calls.

---

## 2. Build order

### Step 1 — Bug fixes in your files (~1 hr)

| File | Bug | Fix |
|---|---|---|
| `App.jsx` | `handleSelectScenarioAndScan(mode)` ignores its `mode` argument — `Rule6Engine` never learns which scenario was picked | Add a `selectedScanMode` state, set it in the handler, pass it into `Rule6Engine` as `initialScanMode` |
| `RuleEngineSandbox.jsx` | A JSX expression around line 195 is wrapped in an extra string literal, so the UI shows literal quote characters | Remove the outer string quotes around the ternary |
| `VisionInspector.jsx` | Bounding-box overlay is nested inside the "simulated package" branch of a conditional, so it never renders on top of a user-uploaded image | Move the overlay block outside both branches so it renders regardless of which one is active |

**Verify:** selecting a scenario in the scanner modal opens Rule 6 Engine pre-selected; sandbox preset buttons show clean text with no stray quotes; uploading a JPEG in Vision Calibrator shows boxes on top of it.

---

### Step 2 — Role-based access control (~1 day)

**`App.jsx`**
- Add `userRole` state, default `"citizen"`.
- Add a role-change handler that resets `activeTab` sensibly (`"citizen"` for citizen mode, `"rule6"` for official).
- Guard official-only tabs (`vision`, `rulesandbox`, `notices`) with a `useEffect`: if `userRole` is `"citizen"` and `activeTab` is one of those, redirect to `"citizen"`. Don't rely on the toggle alone to prevent this state.

**`Navbar.jsx`**
- Split tabs into `citizenTabs` (Scan & Report, Vigilance Map) and `officialTabs` (Rule 6 Engine, Vision Calibrator, LMPC Rule Sandbox, Show-Cause Notice, Vigilance Heatmap).
- Add a visible Citizen/Official toggle in the header.
- Show an "Official Access" badge next to the logo only in Official mode.

**`BottomNav.jsx`**
- Same role-based split for mobile nav items.
- In Citizen mode, the center scan button navigates to the `"citizen"` tab (where your teammate's `CitizenScanner` renders) instead of opening the old scanner modal.

**Verify:** app defaults to Citizen mode with 2 tabs; toggling to Official reveals all 5 tabs plus the badge; toggling back hides them; switching roles mid-flow doesn't crash anything.

---

### Step 3 — Backend disclaimer badge (~1 hr)

**`RuleEngineSandbox.jsx`**
- Add a small banner under the page heading (Official mode only): client-side evaluation is for instant UI feedback; final validation and persistence happen on the backend.

**Verify:** banner shows on the Rule Sandbox tab in Official mode.

---

### Step 4 — Live feed plumbing (~1 day)

**`districtData.js`**
- Convert the static `LIVE_AUDIT_FEED` array into a mutable module-level variable with a `getLiveAuditFeed()` getter and a `pushCitizenReport(report)` function that prepends new reports.
- Keep a `LIVE_AUDIT_FEED` export alias for backward compatibility.

**`HeatmapMonitor.jsx`**
- Accept a `refreshKey` prop; call `getLiveAuditFeed()` on render instead of importing the old static array.
- Add a "Citizen Report" badge on feed entries where `isCitizenReport` is true.

**`App.jsx`**
- Add a `handleCitizenReport` function that calls `pushCitizenReport()` and bumps a `feedRefreshKey` counter.
- Pass `feedRefreshKey` into `HeatmapMonitor` as `refreshKey`.

**Verify:** you can't fully verify this step alone — it needs your teammate's `CitizenScanner` to actually produce a report. See §4.

---

## 3. Definition of done (your scope)

1. No console errors in either role, desktop and mobile widths.
2. Citizen mode shows exactly 2 tabs; Official mode shows exactly 5.
3. Vision Calibrator boxes render correctly on uploaded images.
4. Rule Sandbox shows the disclaimer badge and clean preset text.
5. `districtData.js` and `HeatmapMonitor.jsx` are ready to receive pushed reports (test with a hardcoded dummy `pushCitizenReport()` call from the console if your teammate isn't done yet).

---

## 4. The one integration point with your teammate

Your teammate is building `CitizenScanner.jsx`, which expects exactly one prop:

```jsx
<CitizenScanner onReportSubmitted={handleCitizenReport} />
```

You can write this line and wire `handleCitizenReport` into `App.jsx`'s render logic **without waiting for them** — this interface is fixed, so build against it now. When their file lands, this should just work with no further changes on your side. If it doesn't, the mismatch is almost certainly in the exact shape of the report object `onReportSubmitted` receives — check that against `districtData.js`'s expected fields (`id`, `timestamp`, `platform`, `product`, `seller`, `status`, `issue`, `citation`, `action`, `isCitizenReport`).

---

## 5. Out of scope — don't build these

Real backend calls, real barcode/QR decoding, real ML integration, auth/login, anything in the React Native mobile codebase. These are later sprints.

---

## 6. Once both of you are done

Run the full end-to-end test together: Citizen mode → get a fail result → submit report → toggle to Official → open Vigilance Heatmap → confirm the report appears at the top with the correct badge. This is the actual demo "aha moment" — don't consider either of your pieces finished until this full loop works.
