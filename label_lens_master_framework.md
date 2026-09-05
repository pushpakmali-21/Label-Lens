# LabelLens (L³) — Master Project Overview

> **Theme:** Software solution for the Ministry of Consumer Affairs, Food & Public Distribution
> **Target Forum:** Smart India Hackathon (SIH) 2026
> **Core Value:** Turning top-down regulatory enforcement into a unified, infinite-scale, crowdsourced consumer-protection ecosystem powered by Legal Metrology.

---

## 1. Problem Statement & Institutional Context

Packaged commodities sold across retail and e-commerce in India are governed by the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011**. Every package must carry specific, unambiguous mandatory declarations (MRP, Net Quantity, Manufacturer details, Consumer Care access) in precise formats and font-size thresholds.

### On-Ground Operational Bottlenecks

1. **The Scale Bottleneck** — Manual verification by a limited pool of inspectors leaves over 99% of retail items un-audited.
2. **The Geometry Loophole** — Manufacturers hide declarations using micro-fonts or non-standard placement away from the Principal Display Panel (PDP).
3. **The E-Commerce Explosion** — Dark stores (Blinkit, Zepto, Instamart) and e-retail platforms post dynamic listings that bypass packaging-declaration audits entirely.
4. **The Subjectivity Trap** — Field inspectors lack tooling to precisely measure legally mandated millimeter font heights.
5. **Weak Legal Chain of Custody** — Paper logs and unverified smartphone photos are vulnerable to corporate legal challenges in tribunal disputes.

### The Strategic Paradigm Shift

| Old Framing | New Framing |
|---|---|
| A tool for DoCA inspectors | A platform for every Indian consumer |
| Top-down enforcement only | Top-down enforcement **+** bottom-up crowdsourcing |
| Government-facing | Citizen-first, government-powered |
| ~10,000 inspectors in India | ~1.4 billion potential scanners |

**Key insight:** citizens have more to gain from knowing a product is non-compliant than inspectors do. Empower them to scan and report, and the compliance-monitoring network scales infinitely — making the heatmap real, crowdsourced, and live, instead of merely illustrative.

---

## 2. User Personas

### 👤 Citizen / Consumer (no login required)
Someone standing in a grocery store, suspicious about a product.

- Instant scan → PASS / REVIEW / FAIL verdict, in plain language (no legal jargon)
- Product violation history — has this brand been flagged before?
- One-tap "Report a Violation," feeding directly into the official system
- Optional account creation to track reports and get status updates

### 🔵 Field Inspector / Legal Metrology Officer (authenticated)
A DoCA officer doing a retail audit. Gets everything a citizen gets, plus:

- Full field-by-field audit report with rule citations
- Section 39 notice generation (cryptographically signed)
- Chain-of-custody evidence packaging
- District assignment and audit history
- Offline mode for low-connectivity areas

### 🔴 DoCA Admin (authenticated, higher privilege)

- National compliance heatmap built from real crowdsourced data
- Aggregated, triaged, verified citizen reports
- Inspector performance dashboard
- Case management (notices issued, responses, escalations)
- Ministry-ready report exports
- Rule-engine configuration via UI (updates `lmpcRules.json` without touching code)

### Feature Matrix by Role

| Feature | Citizen (No Login) | Citizen (Logged In) | Inspector | DoCA Admin |
|---|:---:|:---:|:---:|:---:|
| Scan product label | ✅ | ✅ | ✅ | ✅ |
| Compliance verdict | ✅ | ✅ | ✅ | ✅ |
| Plain-language result | ✅ | ✅ | — | — |
| Full legal field breakdown | — | — | ✅ | ✅ |
| Product violation history | ✅ | ✅ | ✅ | ✅ |
| Report a violation | ✅ anonymous | ✅ tracked | ✅ official | ✅ |
| Track my reports | — | ✅ | ✅ | ✅ |
| Section 39 notice generation | — | — | ✅ | ✅ |
| Offline audit mode | — | — | ✅ | — |
| District heatmap | View only | View only | Full + assign | Full |
| Citizen reports dashboard | — | — | Own district | All |
| Case management | — | — | Own cases | All cases |
| Rule engine config | — | — | — | ✅ |
| Export ministry reports | — | — | — | ✅ |

---

## 3. Advanced Unique Features (the pitch edge)

**A. Two-Stage Spatial Layout Intelligence (YOLOv8 + OCR)** — Decouples *localization* from *reading* instead of feeding raw images straight into a text extractor. A custom-trained YOLOv8 model first frames structural regions: the PDP boundary, the MRP block, the Net Quantity string, and the Consumer Care panel — enabling strict evaluation of **Rule 8 placement regulations** (Net Quantity and MRP must appear together in the consumer's primary line of sight).

**B. Math-Driven Font-to-PDP Area Calibration** — Calculates the exact 2D surface area of the package canvas based on its shape (Box = H×W; Cylinder = 40%×H×C). Using an on-screen scaling reference (a coin, or a manual metric input), the vision engine maps pixels-to-millimeters and checks the printed font height against the legally mandated **1mm–6mm slabs**.

**C. Config-Driven "Rules as Data" Engine** — All statutory thresholds live in `lmpcRules.json`. A DoCA amendment to a font threshold can be pushed from the web portal instantly, with zero backend code changes.

**D. Deep Semantic Pass for Misleading Footnotes** — A lightweight local NLP/LLM layer analyzes extracted text context so that, e.g., `"MRP ₹199 (incl. of all taxes)"` next to a micro-footnote reading `"*Local delivery charges extra"` is automatically flagged as a misleading declaration — something a plain keyword matcher would miss.

**E. E-Commerce Dual-Channel Cross-Auditing** — Background scraping workers (Playwright/Selenium + residential proxy rotation) pull product pages from Blinkit, Zepto, Amazon, Flipkart, and cross-check listings against physical packaging data and GS1 barcode registries.

**F. Tamper-Proof Cryptographic Chain of Custody** — Every inspection image is stamped with GPS, network timestamp, and Device ID, then SHA-256 hashed and signed — so evidence holds up to a corporate legal challenge in court.

---

## 4. High-Scale Engineering Strategies

These four items are the core "we thought about production scale, not just a demo" story for judges:

1. **Data Noise Triage — Deduplication Gateway.** The app reads the barcode first. The backend checks a cached product table; if the item was verified within the current month, it skips the heavy ML pipeline entirely and returns the cached verdict, incrementing a "+1 citizen audit" counter instead of writing a duplicate record.
2. **Cloud Budget Protection — Two-Tier Cascading ML.** Heavy GPU inference (YOLOv8 + PaddleOCR) is throttled: common daily items resolve through the free Tier-1 cache; Tier-2 cloud vision is reserved for genuinely new products or authenticated inspectors.
3. **Backend Validation Source of Truth.** The frontend's `lmpcValidator.js` gives snappy UI feedback, but is never trusted for the legal verdict — the FastAPI server (`lmpc_validator.py`) independently recalculates every metric and applies the security seal, so a malicious client can't spoof a PASS.
4. **Strict Role-Based Access Control.** Citizen Mode and Official Mode are hard-isolated in the UI — a citizen can never accidentally reach a Section 39 draft notice or the spatial calibrator.

**Cascading scan flow:**

```
Unified Mobile App Scan
        │
        ▼
Tier 1: Client-Side Edge (Instant Barcode Decode)
        │
        ▼
Deduplication Gateway Check
        │
   ┌────┴────┐
Found      Not Found
in Cache   in Cache
   │            │
   ▼            ▼
Zero-Cost     Tier 2: Full Cloud Pass
Resolution    (YOLOv8 + PaddleOCR + LLM)
+1 Upvote     Deep ML Vision Pipeline
```

---

## 5. System Architecture

```
         CITIZENS                    INSPECTORS              DoCA ADMINS
    (no login required)           (mobile + web)             (web only)
           │                            │                         │
           ▼                            ▼                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    SINGLE REACT NATIVE MOBILE APP                    │
│                    (role-based UX after optional login)              │
│  Public: Scan → Verdict → Report     Official: Full audit suite     │
└─────────────────────────┬────────────────────────────────────────────┘
                          │ HTTPS / WebSocket
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        PYTHON BACKEND (FastAPI)                      │
│   /scan/*   → YOLOv8 + PaddleOCR + lmpc_validator.py                 │
│   /report/* → Citizen report intake + triage                        │
│   /notice/* → PDF generation + cryptographic signing                 │
│   /heatmap/*→ Aggregated stats (official + crowdsourced)             │
│   Background: Celery workers → e-commerce scraping                   │
└────────────────┬─────────────────────────┬───────────────────────────┘
                 │                         │
    ┌────────────▼──────────┐   ┌──────────▼──────────────┐
    │     PostgreSQL        │   │   React Web Dashboard    │
    │  - audit_scans        │   │   (existing codebase)    │
    │  - citizen_reports    │   │   Public: Product lookup │
    │  - violations         │   │   Official: Full admin   │
    │  - notices            │   └──────────────────────────┘
    │  - products (cache)   │
    │  - inspectors         │
    └───────────────────────┘
```

**One rule engine, three surfaces** — mobile scanner, backend processor, and web dashboard are all driven by the same `lmpcRules.json`.

### Layer 1 — Mobile App (React Native)
Replaces the current `MobileScannerModal.jsx`. Chosen over Flutter because it shares JavaScript with the existing codebase — `lmpcValidator.js` can be reused as-is.

- Live camera feed for package capture; real QR decoding (`react-native-vision-camera` + `react-native-mlkit`)
- Uploads image to the Python backend, receives structured JSON
- Offline audit drafts (AsyncStorage/SQLite), synced when back online
- Real GPS via `react-native-geolocation-service`
- Local preview/generation of the Section 39 notice

Packages: `react-native-vision-camera`, `@react-native-async-storage`, `react-native-sqlite-storage`, `react-native-geolocation-service`, `react-native-share`

### Layer 2 — Python Backend (FastAPI) — the real ML pipeline
Core endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/scan/image` | Upload package image → full compliance report |
| POST | `/api/v1/scan/qr` | Decode QR payload → validate proviso fields |
| GET | `/api/v1/audit/{id}` | Retrieve past audit record |
| POST | `/api/v1/notice/generate` | Generate + sign Section 39 notice PDF |
| GET | `/api/v1/heatmap/districts` | Live district compliance stats |
| GET | `/api/v1/feed/live` | Real-time audit stream (WebSocket) |
| POST | `/api/v1/ecommerce/check` | Submit URL → scrape + validate listing |

Real scan pipeline: receive image → OpenCV preprocessing (denoise/deskew/contrast) → YOLOv8 bounding-box detection (PDP, MRP, net qty, consumer care, coin, QR) → coin detection for px/mm ratio → PaddleOCR text extraction per region → `lmpc_validator.py` rule check → confidence scoring → classify PASS / NEEDS REVIEW / FAIL → return JSON → store audit record.

A Celery worker runs continuously in the background scraping Blinkit, Zepto, Amazon, and Flipkart product pages, checking manufacturer name, net qty, MRP, date, consumer care, and origin, auto-queuing show-cause notices on violations.

### Layer 3 — Shared Rule Engine
`src/data/lmpcRules.json` is the single source of truth, consumed by:
- `lmpcValidator.js` (React web)
- `lmpcValidator.js` (React Native mobile — same file)
- `lmpc_validator.py` (Python backend, via JSON import)

Any rule update (e.g., a new LMPC amendment) happens in one file and instantly applies everywhere.

### Layer 4 — Web Dashboard (existing codebase — evolve, don't rewrite)
Transitions from demo to full **DoCA Admin Portal**:

| Current (Mock) | Upgraded (Real) |
|---|---|
| Hardcoded scan results | Live audit records from DB |
| Static district data | Real aggregated stats from backend |
| Static live feed | WebSocket stream from backend |
| `window.print()` notice | Download signed PDF from backend |
| Simulated bounding boxes | Real YOLOv8 output overlaid on actual image |
| Fake confidence scores | Real PaddleOCR confidence values |

Keep as-is: all component UI/UX, `lmpcRules.json` + `lmpcValidator.js`, `evidenceSealer.js`, design system/Tailwind config.

### Layer 5 — Database & Auth

```sql
audits         -- Every scan: image hash, result JSON, inspector_id, timestamp, GPS
violations     -- Extracted violations linked to audits
notices        -- Generated Section 39 notices, PDF blob, cryptographic seal
districts      -- Aggregated regional stats (updated by Celery workers)
inspectors     -- Auth: name, badge ID, jurisdiction, role
ecommerce_jobs -- Scraper job queue + results
```

Auth: JWT-based inspector login, role-based (Field Inspector — mobile only — vs. DoCA Admin — full dashboard).

---

## 6. Tech Stack

**Mobile (React Native):** `react-native-vision-camera`, TanStack Query, `react-native-mmkv`, `react-native-maps`, `@notifee/react-native`, `react-native-biometrics`

**Backend (Python/FastAPI):** FastAPI + Uvicorn, Ultralytics YOLOv8, PaddleOCR, OpenCV, Celery + Redis, SQLAlchemy + Alembic, WeasyPrint, python-jose (JWT), Pydantic v2

**Web Dashboard (existing React):** React 18 + Vite, React Query, Recharts/Nivo, React-Leaflet, backend PDF endpoint

**Infrastructure:** Docker + Docker Compose, PostgreSQL 16, Redis, Firebase Cloud Messaging, GCP/Railway.app

---

## 7. Phase 0 Implementation Plan — "Citizen-Centric Upgrade" (current focus)

**Goal:** evolve the current LabelLens prototype from an inspector-only tool to a unified Citizen + Official demo, ready for the SIH 2026 stage, with the two-tier ML pipeline **mocked** for the live pitch (real ML comes in Phase 1+).

### 7.1 Two-Tier Cascading Inspection Flow (solves the Data-Noise + Cloud-Cost gaps)
`[NEW] src/components/CitizenScanner.jsx`
- Simulates Tier 1: reads a barcode/QR
- Shows a "Checking national registry…" gateway state
- **Outcome A (cached, zero cost):** already-scanned product (e.g., a Maggi packet) instantly returns the known verdict and attaches the citizen's scan as a "+1 upvote"
- **Outcome B (new product, cloud pass):** unrecognized product proceeds to a simulated YOLOv8 + PaddleOCR deep scan
- Pitch point: proves the system won't bankrupt the government in AWS bills or flood the DB with redundant data

### 7.2 Strict Role-Based Screen Architecture (solves the RBAC gap)
`[MODIFY] src/components/Navbar.jsx`
- Adds a "👤 Citizen Mode" vs "🛡️ Official Mode" toggle in the header
- Citizen Mode: navigation locked to `CitizenScanner` and `Heatmap` (read-only)
- Official Mode: unlocks `VisionInspector` (spatial measurement), bounding-box layout, and `NoticeGenerator` — a citizen can never accidentally reach a Section 39 draft notice

`[MODIFY] src/App.jsx`
- Introduces `userRole` state and conditional routing that strictly isolates tabs by role

### 7.3 Backend Source-of-Truth Acknowledgment (solves the validation-integrity gap)
`[MODIFY] src/components/RuleEngineSandbox.jsx` & `src/utils/lmpcValidator.js`
- Adds a UI disclaimer: *"Client-side evaluation active. Final cryptographic sealing and legal validation performed exclusively on secure DoCA Python backend."*
- Pitch line: *"Our `lmpcValidator.js` is shared for fast UI feedback, but our FastAPI server acts as the final cryptographic source of truth before saving to PostgreSQL."*

### 7.4 Bug Fixes & Refactoring (flawless-demo pass)
- `RuleEngineSandbox.jsx` — remove stray string quotes around a JSX interpolation (line 195)
- `MobileScannerModal.jsx` — replace the missing `Flashlight` icon import from `lucide-react` with `Zap` to stop a runtime crash on mobile
- `VisionInspector.jsx` — fix the bounding-box container so boxes correctly overlay an uploaded `customImage`, not just the simulated CSS package
- `App.jsx` — fix `handleSelectScenarioAndScan(mode)` to correctly lift and pass state to `Rule6Engine`

### 7.5 Demo Narrative Hook (connecting citizen action to government response)
`[MODIFY] src/data/districtData.js`
- Adds a mock function that pushes a citizen's newly created report (from `CitizenScanner`) directly to the top of `LIVE_AUDIT_FEED`
- Demo effect: scan as a citizen → report it → switch to Official Mode → the report appears live on the Vigilance Heatmap in front of the judges

### 7.6 Manual Verification Plan
1. **Cost-saving loop:** open Citizen mode → "Scan Label" → verify the UI shows "Scanning Barcode…" then "Checking Cache…" before falling back to a deep ML scan
2. **Security loop:** in Citizen mode, confirm "Show-Cause Notice" and "Vision Calibrator" tabs are fully hidden
3. **Crowdsourcing loop:** report a violation in Citizen Mode, switch to Official Mode → Vigilance Heatmap, confirm the report is live on the feed

---

## 8. Reference Code Modules (Phase 0 proof-of-concept)

**`src/data/lmpcRules.json`** — single source of truth for statutory thresholds:
- `mandatory_declarations`: manufacturer details (Rule 6(1)(a)), net quantity (Rule 6(1)(c), rejects symbols like "gms"/"grm"/"kilos"/"mltr" in favor of "g"/"kg"/"ml"/"l"), MRP (Rule 6(1)(e)), unit sale price (Rule 6(1)(g)), consumer care (Rule 6(1)(f))
- `pdp_font_matrix_mm`: font-height slabs mapped to PDP surface area (e.g., ≤50 cm² → 1.0mm general / 2.0mm MRP; ≤2500 cm² → 4.0mm / 6.0mm, up to a 6.0mm/6.0mm ceiling)

**`src/utils/lmpcValidator.js`** — `validatePackageData(extractedFields, pdpAreaCm2)` checks net-quantity symbols, MRP prefix formatting, and font height against the matching PDP-area slab, returning `{ isValid, violations[], checkedAt, securitySeal }`.

**`src/components/CitizenScanner.jsx`** — drives the mocked two-tier scan UI: `scanStep` state machine (`idle → scanning_barcode → checking_cache → [processing_ml] → result`), a cached-item path (instant verdict, "+1 Citizen Audit Upvote") and a new-item path (simulated YOLOv8 + PaddleOCR delay), plus a "File Consumer Protection Grievance" action that logs a report via `onReportLogged`.

**`src/components/VigilanceHeatmap.jsx`** — renders the live audit feed (merging citizen-submitted reports with default seed logs), scan/alert/notice counters, and a role-aware header (public transparency view vs. authenticated DoCA admin view).

**`src/App.jsx`** — top-level `userRole` (`citizen`/`official`) and `currentTab` state, role-gated tab navigation, and the report-logging bridge between `CitizenScanner` and `VigilanceHeatmap`.

---

## 9. Development Roadmap

### Phase 0 — SIH Demo Ready (2 weeks) — *current phase*
| Task | Effort |
|---|---|
| Fix the 4 existing bugs | 2 hrs |
| Citizen verdict screen (plain English) on the existing web app | 2 days |
| "Report a Violation" UI (local storage for the demo) | 2 days |
| Real QR decode (`html5-qrcode`) | 1 day |
| FastAPI skeleton + 1 real scan endpoint | 3 days |
| Demo narrative: citizen scan → appears on inspector dashboard | 1 day |

### Phase 1 — Core Functional (4–6 weeks post-SIH)
YOLOv8 fine-tuned on real training data; PaddleOCR integrated, full scan pipeline live; citizen report intake live; PostgreSQL schema + JWT auth; React Native app (citizen mode).

### Phase 2 — Inspector Features (6–8 weeks)
Inspector login + offline mode; full audit trail and notice PDF generation; inspector mobile-app features.

### Phase 3 — Scale (8–12 weeks)
E-commerce scraping workers; real crowdsourced heatmap; product intelligence profiles; push notifications; DoCA admin dashboard fully connected.

### Sprint Breakdown (alternate view)
- **Sprint 1 (Wk 1–2):** Fix 4 bugs, FastAPI skeleton, port `lmpcValidator.js` → `lmpc_validator.py`, connect dashboard to backend, real geolocation in `evidenceSealer.js`
- **Sprint 2 (Wk 3–4):** Integrate YOLOv8 + PaddleOCR, build `/api/v1/scan/image`, connect `VisionInspector` to real results
- **Sprint 3 (Wk 5–6):** Bootstrap React Native app, camera + QR scan, offline mode + sync queue
- **Sprint 4 (Wk 7–8):** Celery scraping workers, live WebSocket feed, real heatmap data, real PDF notices
- **Sprint 5 (Wk 9–10):** Auth system, DB indexing/performance, end-to-end testing, deployment

---

## 10. What to Reuse vs. Build New

| | Reuse | Build New |
|---|---|---|
| Rule engine config | `lmpcRules.json` ✅ | — |
| Web UI | All 5 components ✅ | API integration layer |
| Validation logic | `lmpcValidator.js` ✅ | Python port |
| Evidence sealer | `evidenceSealer.js` ✅ | Server-side signing |
| Design system | All Tailwind tokens ✅ | — |
| ML pipeline | — | YOLOv8 + PaddleOCR |
| Backend | — | FastAPI + Celery |
| Mobile app | Logic only | React Native UI |
| Database | — | PostgreSQL schema |
| Auth | — | JWT inspector auth |

**~60% of the existing codebase is directly reusable or needs only minor wiring.** The hard UI/domain-knowledge work is already done.

---

## 11. On-Stage Demonstration Script

**Act 1 — The Citizen Empowerment Scan**
Set the header toggle to Citizen Mode, click "Scan New Item (ML Target)." Narrate: the app decodes the barcode locally against the cache registry; because this item is new, the gateway shifts to Tier 2 and boots the cloud ML pipeline.

**Act 2 — Capturing the Violation**
Let the animation resolve to "Packaging Infractions Flagged." Narrate: YOLOv8 isolated the bounding regions, PaddleOCR extracted the text, and the engine flagged two statutory errors — a non-permissible unit symbol ("gms" instead of "g" under Rule 6) and a measured text height of 1.5mm against the mandated minimum for that package size.

**Act 3 — Closing the Enforcement Loop**
Click "File Consumer Protection Grievance," then switch to Official Mode → Vigilance Operational Map. Narrate: the citizen's report appears live at the top of the regional feed — the system crowdsources daily monitoring, groups reports by brand to guide inspectors to high-violation zones, and drafts a legally cited Section 39 notice in seconds.

---

## 12. Impact & Value Metrics (for the pitch deck)

**Impact Matrix**
- **Exponential Audit Coverage** — scales from localized manual raids to continuous, automated catalog evaluation nationwide
- **E-Commerce Vigilance** — closes the unmonitored dark-store/e-retail listing gap via background scraping matched against physical packaging standards
- **Ironclad Courtroom Evidence** — every violation is anchored with tamper-proof SHA-256 metadata hashes

**Benefit Matrix**
- **Operational Field Velocity** — cuts package measurement/verification time from minutes to seconds per product
- **Automated Legal Workflows** — auto-drafts print-ready, legally cited Show-Cause Notices with embedded evidence
- **Crowdsourced Public Network** — turns ordinary consumers into active field lookouts feeding real-time geolocated heatmaps to HQ

---

## 13. Open Questions

- **SIH demo vs. real deployment?** For judging purposes, Sprints 1–2 (real OCR + fixed bugs) plus a polished mobile mockup are enough; Sprint 4+ is overkill before the demo.
- **Model training data** — is there an existing labelled dataset of Indian packaged goods for YOLOv8, or does training start from a general pretrained model? What annotation format (YOLO `.txt`, COCO JSON, LabelImg XML)?
- **Deployment target** — cloud provider preference (GCP, AWS, Azure, or self-hosted)?
- **Team size** — Sprints 1–3 are solo-achievable; Sprints 4–5 benefit from parallel tracks (ML engineer + web dev + mobile dev).
- **SIH demo date** — sets the hard deadline for Phase 0.
- **Regional language support** — should the citizen verdict screen be localized (Hindi, Marathi, Tamil, etc.)? PaddleOCR already handles multilingual OCR on the backend; the remaining question is just UI text translation.

---

*This document consolidates the combined architecture plan, the Phase 0 implementation plan, and the master framework notes discussed for the LabelLens project into a single reference.*
