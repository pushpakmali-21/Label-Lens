# LabelLens Backend — Engineer 2: Platform, Auth, Notices & Real-Time

> **You own:** everything around the scan pipeline — who's allowed to call what, what happens after a violation is found, and how data reaches the live dashboard.
> **You own these DB tables:** `notices`, `districts`, `inspectors`, `ecommerce_jobs`
> **You own these files/modules:** `app/core/security.py`, `app/routers/auth.py`, `app/routers/notice.py`, `app/routers/heatmap.py`, `app/routers/feed.py`, `app/routers/ecommerce.py`, `app/services/notice_generator.py`, `app/services/scraper/*`, `app/workers/celery_app.py`
> **You do NOT touch:** the vision pipeline, `lmpc_validator.py`, `audits`/`violations` tables — that's Engineer 1's scope.

---

## 1. What you're building

Everything that happens around a scan: who's allowed to see what (auth + roles), what happens when a violation is confirmed (Section 39 notice generation), how the official dashboard sees live activity (heatmap + WebSocket feed), and the background system that audits e-commerce listings without a human triggering each check (Celery scrapers).

---

## 2. Joint Day-1 setup (do this together with Engineer 1, before splitting off)

Same shared foundation described in Engineer 1's doc — FastAPI skeleton, Docker Compose (Postgres + Redis), SQLAlchemy/Alembic base, and agreement on response field-naming conventions that match what the frontend already mocks (e.g. feed entries use `id`, `timestamp`, `platform`, `product`, `seller`, `status`, `issue`, `citation`, `action`, `isCitizenReport`). Once that's settled, you work independently.

---

## 3. Sprint-by-sprint scope

### Sprint 1 (Wk 1–2) — Auth foundation + dashboard connection

- **JWT-based inspector auth** (`python-jose`): login endpoint, token issuance, role field distinguishing Field Inspector (mobile-only access) vs. DoCA Admin (full dashboard access).
- `inspectors` table: name, badge ID, jurisdiction, role.
- Build a FastAPI dependency (e.g. `get_current_inspector`) that Engineer 1's routes can plug in for inspector-gated calls — this is the contract point between your work and theirs, so get its shape agreed early.
- Connect at least one read endpoint to the real dashboard so "dashboard talks to backend" is genuinely true by end of sprint — `GET /api/v1/heatmap/districts` returning real (even if sparse) data is a good candidate.

**Verify:** a citizen-facing call works with no token; an inspector-only call correctly rejects missing/invalid tokens and accepts valid ones; role distinction actually gates access (a Field Inspector token can't hit Admin-only routes).

---

### Sprint 2 (Wk 3–4) — Notice generation

- `POST /api/v1/notice/generate`: takes an audit/violation reference (from Engineer 1's tables), generates a Section 39 notice PDF via WeasyPrint, applies a cryptographic signature, and stores it.
- `notices` table: generated notices, PDF blob or storage reference, cryptographic seal, linked audit ID.
- This replaces the frontend's `window.print()` mock with a real downloadable, signed PDF — coordinate with whoever owns the web dashboard so the download button points at your real endpoint once ready.

**Verify:** a generated notice PDF contains the correct rule citations pulled from the linked audit; the cryptographic seal is verifiable; regenerating a notice for the same audit doesn't silently duplicate records.

---

### Sprint 3 (Wk 5–6) — Mobile-readiness (support role)

Not your primary sprint (mobile bootstrap is a separate track), but your job:
- Confirm your auth layer works correctly for the mobile app's login flow, not just the web dashboard.
- Stabilize the notice/heatmap endpoint contracts — no breaking changes once mobile starts integrating.

---

### Sprint 4 (Wk 7–8) — Real-time feed + e-commerce scraping

This is your heaviest sprint — plan for it to take the full two weeks.

- **Celery + Redis workers**: background scraping jobs using Playwright/Selenium with residential proxy rotation, targeting Blinkit, Zepto, Amazon, and Flipkart product listings. Each job checks manufacturer name, net quantity, MRP, date, consumer care info, and origin against the same `lmpcRules.json` thresholds Engineer 1's validator uses — don't duplicate the rule logic, call into their shared validator where possible.
- `ecommerce_jobs` table: job queue state and results.
- `POST /api/v1/ecommerce/check`: submit a URL, queue a scrape + validate job.
- `GET /api/v1/feed/live` as a **WebSocket** endpoint: real-time audit stream, replacing the frontend's mocked "live feed" with an actual push mechanism. This is a different implementation pattern from your other REST endpoints — budget time for connection lifecycle management (client disconnects, reconnects, backpressure), not just the happy path.
- Real heatmap aggregation: `districts` table updated by the scraping workers and by Engineer 1's audit data, feeding real numbers into `GET /api/v1/heatmap/districts`.

**Verify:** a scraper job for a known-noncompliant listing correctly queues a notice; the WebSocket feed pushes a new entry to a connected client within a reasonable delay of it being created; heatmap numbers reflect actual DB state, not stale cached values.

### Sprint 5 (Wk 9–10) — Hardening & deployment

- Auth hardening: token expiry/refresh handling, rate limiting on auth endpoints.
- DB indexing and query performance — particularly for the heatmap aggregation queries and the WebSocket feed's polling/query pattern, since these are read-heavy under load.
- Own the deployment setup: Docker Compose finalization, environment configuration, and the actual GCP/Railway.app deployment.
- Join Engineer 1 for end-to-end testing across both tracks together.

---

## 4. Integration points with Engineer 1

- Your `notices` table references their `audits` table — agree on the foreign key shape with them early rather than guessing at their schema.
- Your auth dependency wraps their scan endpoints for inspector-only paths — you supply the dependency, they inject it, you don't touch their route files directly.
- Your heatmap and feed aggregations ultimately read from their `audits`/`violations` data — flag early if you need specific indexes or denormalized fields from their tables to make your queries performant, rather than discovering it under load in Sprint 5.

---

## 5. Out of scope for you

The vision/ML pipeline, `lmpc_validator.py`, OpenCV/YOLOv8/PaddleOCR integration, `audits`/`violations` tables. All Engineer 1.
