# LabelLens Backend — Engineer 1: Vision Pipeline & Validation

> **You own:** the entire real scan pipeline — image in, compliance verdict out — plus the `lmpc_validator.py` port and the evidence-stamping logic.
> **You own these DB tables:** `audits`, `violations`
> **You own these files/modules:** `app/services/vision/*`, `app/utils/lmpc_validator.py`, `app/routers/scan.py`, `app/routers/audit.py`, `app/models/audit.py`, `app/models/violation.py`
> **You do NOT touch:** auth, notices, heatmap/feed, e-commerce workers — that's Engineer 2's scope.

---

## 1. What you're building

The real version of what the frontend currently mocks: a package image goes in, and a structured PASS / NEEDS REVIEW / FAIL verdict with cited violations comes out. This is the technical core of the whole product — the two-tier caching story, the font-measurement math, and the actual legal-metrology rule checks all live in your pipeline.

---

## 2. Joint Day-1 setup (do this together with Engineer 2, before splitting off)

Don't start your own work until this shared foundation exists — it's the one place your work and theirs touch:

- FastAPI project skeleton (`app/main.py`, app factory, router registration pattern)
- Docker Compose with PostgreSQL 16 + Redis
- SQLAlchemy base config + Alembic initialized (empty, first migration not yet written)
- Agree on Pydantic response conventions — critically, **match the exact JSON field names the frontend already mocks**, not new ones. The frontend's violation objects use `field`, `plain`, `rule`; feed entries use `id`, `timestamp`, `platform`, `product`, `seller`, `status`, `issue`, `citation`, `action`. Reusing these names means Phase 1 wiring is "swap mock for real data," not "renegotiate the API shape with the frontend team."

Once this exists, you work independently in your own files.

---

## 3. Sprint-by-sprint scope

### Sprint 1 (Wk 1–2) — Validator port + endpoint skeletons

- **Port `src/utils/lmpcValidator.js` → `app/utils/lmpc_validator.py`.** Same logic, same `lmpcRules.json` as the single source of truth (don't fork the rules file — import the same JSON both the web app and your backend read). Function should mirror `validatePackageData(extractedFields, pdpAreaCm2)` → `{ isValid, violations[], checkedAt, securitySeal }`.
- Stand up `POST /api/v1/scan/image` and `POST /api/v1/scan/qr` as **stub endpoints**: accept the request, but instead of running real YOLOv8/OCR, accept manually-provided "extracted fields" and run them through your real `lmpc_validator.py`. This lets you prove the validation logic end-to-end before the vision models exist, and gives Engineer 2 something real to point their auth/notice work at.
- Implement evidence stamping: every audit gets GPS + network timestamp + device ID, SHA-256 hashed. This is the tamper-evidence layer — store the hash on the `audits` record.
- `audits` and `violations` tables: create the SQLAlchemy models and the first real Alembic migration for them.

**This is the endpoint your team may consider showing live at the SIH demo** (a stretch goal, not a requirement — the frontend has a fully mocked fallback). If you do build toward that, prioritize getting `/api/v1/scan/image` stable and stress-tested well before demo day, not as a last-minute addition — an unreliable live call on stage is worse than skipping it.

**Verify:** posting a known-bad set of fields to `/scan/image` returns the correct violations with correct rule citations; posting a known-good set returns a clean pass; the audit record and its hash are persisted correctly.

---

### Sprint 2 (Wk 3–4) — Real vision pipeline

This is the meat of the project. Replace the Sprint 1 stub with the real pipeline:

1. **OpenCV preprocessing** — denoise, deskew, contrast normalization on the uploaded image.
2. **YOLOv8 bounding-box detection** — locate the PDP boundary, MRP block, Net Quantity string, Consumer Care panel, the calibration coin (if present), and any QR code.
3. **Coin-based px-to-mm calibration** — using the detected coin's known real-world diameter, compute the pixel-to-millimeter ratio for that image. This feeds the font-height math (package surface area formulas: Box = H×W, Cylinder = 40%×H×circumference).
4. **PaddleOCR text extraction** — run OCR per detected region (not on the whole image — this is why step 2 matters).
5. **Confidence scoring + classification** — combine detection confidence and OCR confidence into a PASS / NEEDS REVIEW / FAIL classification, not just pass/fail — low-confidence extractions should route to manual review rather than a false verdict.
6. Wire all of this into `/api/v1/scan/image`, replacing the Sprint 1 stub.

**Verify:** run the pipeline against real photographed packages (not just clean stock images) — test blur, angle, and partial occlusion, since these are the realistic failure modes an inspector or citizen will actually hit.

---

### Sprint 3 (Wk 5–6) — Mobile-readiness (support role)

The React Native mobile app itself isn't your scope, but the mobile team will integrate against your endpoints. Your job this sprint:
- Stabilize `/api/v1/scan/image` and `/api/v1/scan/qr` response shapes — no breaking changes once mobile starts integrating.
- Confirm both endpoints work correctly behind Engineer 2's auth layer (some calls are anonymous/citizen, some need an inspector JWT — make sure your routes handle both correctly).
- Document expected request/response shapes clearly for the mobile team.

---

### Sprint 4 (Wk 7–8) — Hardening, not new scope

Engineer 2 owns the scraping/real-time work this sprint. Your focus:
- Harden the pipeline against edge cases surfaced by real usage (unusual package shapes, non-standard fonts, low-light photos).
- If a labeled dataset of Indian packaged goods exists, begin a YOLOv8 fine-tuning pass instead of relying on the general pretrained model — this is the single biggest accuracy lever available.
- Performance: profile and reduce per-scan latency, since this is a user-facing wait time, not a background job.

### Sprint 5 (Wk 9–10) — Load testing & deployment prep

- Load-test the scan pipeline specifically (GPU/CPU inference is your bottleneck, not the DB) and confirm Tier 1 cache-hit routing actually bypasses the heavy pipeline in practice, not just in the demo animation.
- Join Engineer 2 for end-to-end testing and deployment.

---

## 4. Integration points with Engineer 2

- Your `audits` table is referenced by their `notices` table (a notice is generated *from* an audit) — agree on the foreign key shape early, don't design it in isolation.
- Their auth layer wraps your endpoints for inspector-only calls — you don't implement auth, you just accept a dependency-injected "current user" that they provide.
- Their heatmap/feed endpoints read aggregated data that ultimately originates from your `audits`/`violations` tables — make sure your schema supports the aggregation queries they'll need (indexed by district, timestamp, status).

---

## 5. Out of scope for you

Auth/JWT, notice PDF generation, heatmap aggregation endpoints, WebSocket feed, Celery workers, e-commerce scraping. All Engineer 2.
