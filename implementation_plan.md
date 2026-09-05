# Implementation Plan: LabelLens Citizen-Centric Upgrade (Phase 0)

## Goal Description

Evolve the current LabelLens prototype from an "inspector-only" tool to a unified **Citizen + Official Platform** for the SIH 2026 demo. 

Crucially, this plan integrates solutions to **four massive scaling bottlenecks**: Data Noise (via Barcode Deduplication), Backend Validation Integrity, Role-Based Access Control, and Cloud Cost Traps (via Two-Tier Cascading ML). We will build the UI flows to explicitly demonstrate to the judges how LabelLens handles these production-scale challenges.

## User Review Required

> [!IMPORTANT]  
> This plan focuses purely on the **React frontend (Phase 0)** to get the SIH demo ready. It will *mock* the two-tier barcode/ML architecture so you can present the concept live on stage.

## Proposed Changes

---

### 1. The Two-Tier Cascading Inspection Flow (Solves Gaps 1 & 4)

We will modify the new `CitizenScanner.jsx` to simulate a highly cost-efficient, deduplicated pipeline.

#### [NEW] `src/components/CitizenScanner.jsx`
- **Simulate Tier 1 (Light Edge Pass / Barcode Scan)**: The scanner will first simulate reading a barcode/QR. 
- **Simulate Gateway**: It will display a UI state showing "Checking national registry...".
- **Outcome A (Cached - Zero Cost)**: If a product is already heavily scanned this month (e.g., Maggi packet), it skips ML and instantly shows the known verdict, attaching the citizen's scan as a "+1 upvote".
- **Outcome B (New Product - Cloud Pass)**: Only if the product is unrecognized does it proceed to the simulated YOLOv8 + PaddleOCR deep scan.
- **Why this wins the pitch**: It proves to judges you aren't going to bankrupt the government with AWS bills or crash the DB with redundant data.

---

### 2. Strict Role-Based Screen Architecture (Solves Gap 3)

We will implement a hard boundary between what a public citizen sees and what a logged-in DoCA official sees.

#### [MODIFY] `src/components/Navbar.jsx`
- Add a "Role Toggle" switch in the header: **"👤 Citizen Mode"** vs **"🛡️ Official Mode"**.
- **Citizen Mode**: Navigation is locked to only `CitizenScanner` and `Heatmap` (read-only views).
- **Official Mode**: Unlocks the advanced spatial measurement tool (`VisionInspector`), core bounding box layout, and the server-generated `NoticeGenerator`. A citizen can *never* accidentally access Section 39 draft notices.

#### [MODIFY] `src/App.jsx`
- Introduce `userRole` state.
- Implement conditional rendering routing to strictly isolate the tabs based on the active role.

---

### 3. Backend Source of Truth Acknowledgment (Solves Gap 2)

While this is a frontend prototype, we will visually indicate that client-side logic is just a UI helper.

#### [MODIFY] `src/components/RuleEngineSandbox.jsx` & `src/utils/lmpcValidator.js`
- Add a visual badge/disclaimer in the UI: *"Client-side evaluation active. Final cryptographic sealing and legal validation performed exclusively on secure DoCA Python backend."*
- **Pitch Talking Point**: You can explicitly tell the judges, "Our `lmpcValidator.js` is shared for fast UI feedback, but to prevent reverse-engineering and fake passes, our FastAPI server acts as the final cryptographic source of truth before saving to PostgreSQL."

---

### 4. Bug Fixes & Refactoring

Fix existing UI bugs to ensure a flawless demo.

#### [MODIFY] `src/components/RuleEngineSandbox.jsx`
- **Fix**: Remove string quotes around the JSX interpolation at line 195.

#### [MODIFY] `src/components/MobileScannerModal.jsx`
- **Fix**: Replace the missing `Flashlight` icon import from `lucide-react` with `Zap` to prevent runtime crashes on mobile devices.

#### [MODIFY] `src/components/VisionInspector.jsx`
- **Fix**: Adjust the bounding box positioning container so that they correctly overlay on top of an uploaded `customImage`, not just the simulated CSS package.

#### [MODIFY] `src/App.jsx`
- **Fix**: Update `handleSelectScenarioAndScan(mode)` to correctly lift and pass state to `Rule6Engine`.

---

### 5. Demo Narrative Hook (Connecting the Flows)

To wow the judges, we need to show how a citizen's action affects the government dashboard in real-time.

#### [MODIFY] `src/data/districtData.js`
- **Details**: Add a mock function to push the citizen's newly created report (from `CitizenScanner`) directly into the top of the `LIVE_AUDIT_FEED` array. 
- **Demo effect**: You scan a product as a citizen → report it → switch to Official Mode → the judges see your exact report pop up live on the Vigilance Heatmap.

## Verification Plan

### Manual Verification
1. **The Cost-Saving Loop**: 
   - Open app (Citizen mode). Tap "Scan Label". 
   - Verify the UI first shows "Scanning Barcode..." and "Checking Cache..." before defaulting to a deep ML scan, proving the Two-Tier architecture.
2. **The Security Loop**:
   - Verify that while in Citizen mode, the "Show-Cause Notice" and "Vision Calibrator" tabs are completely hidden from the UI.
3. **The Crowdsourcing Loop**:
   - Report a violation in Citizen Mode.
   - Switch to Official Mode, go to Vigilance Heatmap, and verify the report is live on the feed.
