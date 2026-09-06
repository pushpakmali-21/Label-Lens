# LabelLens — Citizen + Official Unified Architecture Plan

> SIH 2026 | Built for everyone. Powered by Legal Metrology.

---

## The Shift: From Inspection Tool → Consumer Protection Platform

The judge's suggestion changes the **fundamental narrative** of the product:

| Old Framing | New Framing |
|---|---|
| A tool for DoCA inspectors | A platform for every Indian consumer |
| Top-down enforcement | Top-down enforcement + bottom-up crowdsourcing |
| Government-facing | Citizen-first, government-powered |
| ~10,000 inspectors in India | ~1.4 billion potential scanners |

> **The key insight:** Citizens have more to gain from knowing a product is non-compliant than inspectors do. Empower them to scan and report, and you get a compliance monitoring network that scales infinitely — making the heatmap real, crowdsourced, and live.

---

## Three User Personas

### 👤 Citizen / Consumer (No login required)
Someone standing in a grocery store, suspicious about a product.

**Their questions:**
- "Is this product legally labelled?"
- "Is the MRP printed correctly?"
- "Does this brand have a history of violations?"
- "Can I report this if something's wrong?"

**What they get:**
- Instant scan → PASS / REVIEW / FAIL verdict
- Plain-language explanation (not legal jargon)
- Product violation history (has this brand been flagged before?)
- One-tap "Report a Violation" (feeds into the official system)
- Optional: create account to track their reports and get acknowledgements

---

### 🔵 Field Inspector / Legal Metrology Officer (Authenticated)
A DoCA officer doing a retail audit.

**What they get:**
- Everything citizens get, plus:
- Full field-by-field audit report with rule citations
- Section 39 notice generation (cryptographically signed)
- Chain-of-custody evidence packaging
- District assignment and audit history
- Offline mode for areas with poor connectivity

---

### 🔴 DoCA Admin (Authenticated, Higher Privilege)

**What they get:**
- National compliance heatmap with real crowdsourced data
- Aggregated citizen reports (triaged, verified)
- Inspector performance dashboard
- Case management (notices issued, responses received, escalations)
- Export reports for ministry briefings
- Rule engine configuration management (update lmpcRules.json via UI)

---

## Unified System Architecture

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
│   /scan/*  →  YOLOv8 + PaddleOCR + lmpc_validator.py               │
│   /report/* →  Citizen report intake + triage                       │
│   /notice/* →  PDF generation + cryptographic signing               │
│   /heatmap/*→  Aggregated stats (official + crowdsourced)           │
│   Background: Celery workers → e-commerce scraping                  │
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

---


## Feature Matrix by Role

| Feature | Citizen (No Login) | Citizen (Logged In) | Inspector | DoCA Admin |
|---|:---:|:---:|:---:|:---:|
| Scan product label | ✅ | ✅ | ✅ | ✅ |
| Compliance verdict | ✅ | ✅ | ✅ | ✅ |
| Plain-language result | ✅ | ✅ | — | — |
| Full legal field breakdown | — | — | ✅ | ✅ |
| Product violation history | ✅ | ✅ | ✅ | ✅ |
| Report a violation | ✅ anonymous | ✅ tracked | ✅ official | ✅ |
| Track my reports | — | ✅ | ✅ | ✅ |
| Section 39 Notice generation | — | — | ✅ | ✅ |
| Offline audit mode | — | — | ✅ | — |
| District heatmap | View only | View only | Full + assign | Full |
| Citizen reports dashboard | — | — | Own district | All |
| Case management | — | — | Own cases | All cases |
| Rule engine config | — | — | — | ✅ |
| Export ministry reports | — | — | — | ✅ |

---

## The Citizen Scan Flow

```
Open app → tap "Scan a Product"
       │
       ▼
  Camera → scans label or QR
       │
       ▼
  Backend: YOLOv8 + OCR + rule check (~2-4 seconds)
       │
       ├── PASS ──► "✅ This product's label appears compliant"
       │             Show verified fields. Option: Share result.
       │
       ├── REVIEW ─► "⚠️ One field couldn't be read clearly"
       │              Show which field + why (smudged/faded).
       │              Option: "Flag for review"
       │
       └── FAIL ──► "❌ This product has labelling violations"
                     Plain English: "MRP is missing" /
                     "Manufacturer contact not printed"
                     Option: "Report this violation" (one tap)
                     Option: "See similar reports from others"
```

**The Report Flow:**
```
Citizen taps "Report this violation"
   → Confirm details (store location auto-filled via GPS)
   → Submit (anonymous or with account)
   → Inspector in that district notified if threshold crossed
   → Citizen receives: "Case #XXXX received"
   → If logged in: track status (Received → Under Review → Action Taken)
```

---

## Product Intelligence Layer

Every scan (inspector + citizen) aggregates into a **product profile**:

```
Product: "Aloo Bhujia, Shree Anand Snacks, 200g"
├── Scanned: 142 times across 6 cities
├── Last scan: 2 hours ago (Mumbai)
├── Compliance rate: 78% (over 30 days)
├── Top violations: Font height (38), Consumer care (12)
├── Open notices: 2 (Section 39)
└── Citizen reports: 24 flagged, 3 verified by inspectors
```

This is what makes the heatmap genuinely useful — not just illustrative.

---

## Revised Tech Stack

### Mobile App (React Native)
```
react-native-vision-camera     → Camera + real-time QR decode
TanStack Query                 → API state + caching
react-native-mmkv              → Offline storage
react-native-maps              → Show nearby violation reports
@notifee/react-native          → Push notifications for report status
react-native-biometrics        → Inspector secure login
```

### Backend (Python FastAPI)
```
FastAPI + Uvicorn              → Async API server
Ultralytics YOLOv8             → Spatial layout detection (your training data)
PaddleOCR                      → OCR (Hindi + English)
OpenCV                         → Image preprocessing + coin calibration
Celery + Redis                 → Background e-commerce scraping
SQLAlchemy + Alembic           → DB ORM + migrations
WeasyPrint                     → PDF notice generation
python-jose                    → JWT auth
Pydantic v2                    → Schema validation (maps to lmpcRules.json)
```

### Web Dashboard (Existing React — evolve, don't rewrite)
```
React 18 + Vite (existing)
React Query                    → Replace hardcoded data with real API calls
Recharts / Nivo                → Real compliance charts
React-Leaflet                  → Real interactive India map heatmap
Backend PDF endpoint           → Replace window.print()
```

### Infrastructure
```
Docker + Docker Compose        → Local dev + staging
PostgreSQL 16                  → Primary database
Redis                          → Celery broker + caching
Firebase Cloud Messaging       → Push notifications
Cloud: GCP / Railway.app       → Deployment
```

---

## Roadmap

### Phase 0 — SIH Demo Ready (2 weeks)
**Goal: Judges can interact with it on a real phone.**

| Task | Effort |
|---|---|
| Fix 4 existing bugs | 2 hrs |
| Add citizen verdict screen (plain English) to existing web app | 2 days |
| Add "Report a Violation" UI (local storage for demo) | 2 days |
| Add real QR decode (html5-qrcode) | 1 day |
| FastAPI skeleton + 1 real scan endpoint | 3 days |
| Demo narrative: citizen scans → appears on inspector dashboard | 1 day |

### Phase 1 — Core Functional (4–6 weeks post-SIH)
- YOLOv8 fine-tuned on your training data
- PaddleOCR integrated, full scan pipeline live
- Citizen report intake live
- PostgreSQL schema + JWT auth
- React Native app (citizen mode)

### Phase 2 — Inspector Features (6–8 weeks)
- Inspector login + offline mode
- Full audit trail, notice PDF generation
- Inspector mobile app features

### Phase 3 — Scale (8–12 weeks)
- E-commerce scraping workers
- Real crowdsourced heatmap
- Product intelligence profiles
- Push notifications + DoCA admin dashboard connected

---

## The Pitch Narrative for Judges

> [!TIP]
> **Show citizen flow first.** It's relatable and emotional. Someone in a grocery store scans a product, finds a violation, reports it. Then switch to the inspector dashboard and show that report appearing on the heatmap in real time. That moment — citizen action → government response — is the entire value proposition of the system.

> [!NOTE]
> *"India has ~10,000 Legal Metrology Officers for 8 million retail outlets. LabelLens turns every smartphone into a compliance terminal — citizens protect themselves, and their reports guide inspectors to the highest-violation zones. One scan at a time, we fix the information asymmetry between consumers and manufacturers."*

---

## Open Questions

> [!IMPORTANT]
> **Training Data Format** — What format is your data in? (YOLO annotation `.txt`, COCO JSON, LabelImg XML?) This determines how fast the real scan pipeline can be ready.

> [!IMPORTANT]
> **SIH Demo Date** — When exactly is the presentation? This sets the deadline for Phase 0.

> [!NOTE]
> **Regional Language Support** — Should the citizen verdict screen support Hindi, Marathi, Tamil etc.? PaddleOCR handles multi-language OCR on the backend — the question is just the UI text translation.

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                      FIELD INSPECTOR                        │
│              React Native Mobile App (new)                  │
│   Camera → QR Scan → Upload → Real-time Results            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PYTHON BACKEND (new)                      │
│    FastAPI + YOLOv8 + PaddleOCR + Rule Engine              │
│    Async workers for e-commerce scraping                    │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐          ┌──────────────────────────┐
│   PostgreSQL /   │          │   React Web Dashboard    │
│   Firestore      │◄────────►│   (existing codebase)    │
│   (Audit DB)     │          │   DoCA Admin + Analytics │
└──────────────────┘          └──────────────────────────┘
```

**One rule engine, three surfaces:**  
Mobile scanner → Backend processor → Web dashboard — all driven by the same `lmpcRules.json`.

---

## Layer 1 — Mobile App (React Native)
*New build, replaces `MobileScannerModal.jsx`*

**Why React Native and not Flutter?**  
- Shares JavaScript with the existing codebase
- `lmpcValidator.js` can be reused as-is (it's plain JS)
- Same team, same language, faster development

**What it does:**
- Live camera feed for package capture
- Real QR code decoding (`react-native-vision-camera` + `react-native-mlkit`)
- Uploads image to Python backend, receives structured JSON result
- Displays compliance verdict (reuse the same UI components via React Native Web or port them)
- Works **offline** — stores audit drafts locally (AsyncStorage / SQLite), syncs when online
- Real GPS via `react-native-geolocation-service`
- Generates and previews the Section 39 notice locally

**Packages:**
```
react-native-vision-camera    → Live camera + QR decode
@react-native-async-storage   → Offline audit queue
react-native-sqlite-storage   → Offline DB
react-native-geolocation-service → Real GPS
react-native-share            → Export notice PDF
```

---

## Layer 2 — Python Backend (FastAPI)
*New build — the real ML pipeline*

**Tech Stack:**
```
FastAPI          → REST API (async, fast, auto-docs)
Ultralytics YOLOv8 → Spatial layout detection (PDP, MRP zone, qty zone, coin)
PaddleOCR        → Multi-language OCR (handles Hindi + English labels)
OpenCV           → Image preprocessing, coin detection, px/mm calibration
Pydantic         → Request/response schema validation (matches lmpcRules.json)
Celery + Redis   → Background scraping workers for e-commerce platforms
SQLAlchemy       → ORM for PostgreSQL audit database
WeasyPrint       → Server-side PDF generation for notices
```

**Core Endpoints:**

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/scan/image` | Upload package image → full compliance report |
| `POST` | `/api/v1/scan/qr` | Decode QR payload → validate proviso fields |
| `GET`  | `/api/v1/audit/{id}` | Retrieve past audit record |
| `POST` | `/api/v1/notice/generate` | Generate + sign Section 39 notice PDF |
| `GET`  | `/api/v1/heatmap/districts` | Live district compliance stats |
| `GET`  | `/api/v1/feed/live` | Real-time audit stream (WebSocket) |
| `POST` | `/api/v1/ecommerce/check` | Submit URL → scrape + validate listing |

**The Real Scan Pipeline (replacing the mock):**
```
1. Receive image
2. OpenCV preprocessing (denoise, deskew, contrast enhance)
3. YOLOv8 → detect bounding boxes (PDP, MRP, net qty, consumer care, coin, QR)
4. Coin detection → calculate px/mm ratio
5. PaddleOCR → extract text from each detected region
6. lmpc_validator.py (Python port of lmpcValidator.js) → run rules
7. Confidence scoring per field
8. Classify: PASS / NEEDS REVIEW / FAIL
9. Return structured JSON result
10. Store audit record in DB
```

**E-Commerce Scraper (Celery Worker):**
```python
# Runs continuously in background
# Scrapes Blinkit, Zepto, Amazon, Flipkart product pages
# Checks: manufacturer name, net qty, MRP, date, consumer care, origin filter
# Flags violations → auto-queues show-cause notices
# Feeds real data into the heatmap
```

---

## Layer 3 — Shared Rule Engine
*The bridge that makes this work*

The `lmpcRules.json` becomes the **single source of truth** for all three layers:

```
src/data/lmpcRules.json  (already exists)
     │
     ├── Used by: lmpcValidator.js        (React web)
     ├── Used by: lmpcValidator.js        (React Native mobile, same file)
     └── Used by: lmpc_validator.py       (Python backend — JSON import)
```

Any rule update (e.g., a new LMPC amendment) happens in **one file**, instantly applies everywhere.

---

## Layer 4 — Web Dashboard (Existing Codebase)
*Path A — evolve, don't rewrite*

The existing React app transitions from a demo to a **DoCA Admin Portal**:

| Current (Mock) | Upgraded (Real) |
|---|---|
| Hardcoded scan results | Live audit records from DB |
| Static district data | Real aggregated stats from backend |
| Static live feed | WebSocket stream from backend |
| `window.print()` notice | Download signed PDF from backend |
| Simulated bounding boxes | Real YOLOv8 output overlaid on actual image |
| Fake confidence scores | Real PaddleOCR confidence values |

**Changes needed in the existing code:**
- Replace `SCENARIOS` hardcoded data → API calls
- Replace `DISTRICT_METRICS` / `LIVE_AUDIT_FEED` → API calls
- Add authentication (inspector login)
- VisionInspector: overlay boxes on actual uploaded image (fix the existing bug)
- NoticeGenerator: download real PDF from backend instead of `window.print()`
- Add a new "Audit History" tab

**Keep as-is:**
- All component UI/UX (it's solid)
- `lmpcRules.json` + `lmpcValidator.js` 
- `evidenceSealer.js` (still useful client-side)
- Design system and Tailwind config

---

## Layer 5 — Database & Auth

**PostgreSQL Schema (simplified):**
```sql
audits         -- Every scan: image hash, result JSON, inspector_id, timestamp, GPS
violations     -- Extracted violations linked to audits
notices        -- Generated Section 39 notices, PDF blob, cryptographic seal
districts      -- Aggregated regional stats (updated by Celery workers)
inspectors     -- Auth: name, badge ID, jurisdiction, role
ecommerce_jobs -- Scraper job queue + results
```

**Auth:**
- JWT-based inspector login
- Role-based: Field Inspector (mobile only) vs. DoCA Admin (full dashboard)

---

## Development Roadmap

### Sprint 1 (Weeks 1–2) — Fix + Connect
- Fix 4 existing bugs in the React app
- Set up FastAPI project skeleton
- Port `lmpcValidator.js` → `lmpc_validator.py`
- Connect web dashboard to backend (replace hardcoded data with API calls)
- Real Geolocation in `evidenceSealer.js`

### Sprint 2 (Weeks 3–4) — Real Vision Pipeline
- Integrate YOLOv8 model (pre-trained on COCO, fine-tune on label regions)
- Integrate PaddleOCR
- Build `/api/v1/scan/image` endpoint
- Connect VisionInspector to real backend results

### Sprint 3 (Weeks 5–6) — Mobile App
- Bootstrap React Native app
- Camera capture + QR scan
- Connect to scan API
- Offline mode + sync queue
- Port key UI components

### Sprint 4 (Weeks 7–8) — E-Commerce + Analytics
- Celery scraping workers
- Live WebSocket feed for dashboard
- Real heatmap data
- Real PDF notice generation

### Sprint 5 (Week 9–10) — Hardening
- Auth system
- DB indexing + performance
- End-to-end testing
- Deployment (Docker + cloud)

---

## What You Reuse vs. Build New

| | Reuse | Build New |
|---|---|---|
| **Rule engine config** | `lmpcRules.json` ✅ | — |
| **Web UI** | All 5 components ✅ | API integration layer |
| **Validation logic** | `lmpcValidator.js` ✅ | Python port |
| **Evidence sealer** | `evidenceSealer.js` ✅ | Server-side signing |
| **Design system** | All Tailwind tokens ✅ | — |
| **ML pipeline** | — | YOLOv8 + PaddleOCR |
| **Backend** | — | FastAPI + Celery |
| **Mobile app** | Logic only | React Native UI |
| **Database** | — | PostgreSQL schema |
| **Auth** | — | JWT inspector auth |

> **~60% of the existing codebase is directly reusable or needs only minor wiring changes.  
> The hard UI/domain-knowledge work is already done.**

---

## Open Questions for You

> [!IMPORTANT]
> **SIH Demo vs. Real Deployment?**  
> If this is primarily for SIH judging, the roadmap above is overkill for Sprint 4+. For a demo, Sprints 1–2 (real OCR + fixed bugs) plus a polished mobile mockup would be sufficient and impressive.

> [!IMPORTANT]
> **Model Training Data**  
> YOLOv8 needs labelled training images of Indian packaged goods. Do you have access to a dataset, or would you start with a general pre-trained model?

> [!IMPORTANT]
> **Deployment Target**  
> Cloud provider preference? (GCP, AWS, Azure, or self-hosted?) This affects the backend infrastructure choices.

> [!NOTE]
> **Team Size**  
> How many developers are on the team? Sprints 1–3 are achievable solo; Sprints 4–5 benefit from parallel tracks (ML engineer + web dev + mobile dev).
