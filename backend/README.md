# LabelLens — Python Backend

FastAPI backend for the LabelLens Legal Metrology Compliance Platform (SIH 2026).

## Sprint 1 — Complete ✅ (Offline Mode)

Delivered in Offline Sprint 1:
- **FastAPI scaffold** — `app/main.py`, router registration, CORS, health check.
- **`POST /api/v1/scan/image`** — accepts `extracted_fields` or falls back to stub mock; runs full LMPC validator; returns stable `ScanResponse` JSON.
- **`POST /api/v1/scan/qr`** — QR payload parser with JSON / key-value / heuristic fallback; no longer fails valid QR inputs due to missing mocked manufacturer.
- **`app/utils/lmpc_validator.py`** — Rule 6(1)(a), Rule 6(1)(c), Rule 7 font-slab checks, Rule 11(1) prohibited expressions, consumer-care validation, confidence-based `review` routing.
- **Pixel/font helpers** — `calculate_pixel_per_mm()`, `convert_px_to_mm()` (parity with frontend JS).
- **Evidence sealer** — SHA-256 tamper-evidence hash.
- **SQLAlchemy models + Alembic** — schema defined; migration deferred pending Docker.
- **pytest** — full offline test suite green.

## ⏳ Sprint 1 Pending Checkpoint — DB Persistence (Deferred)
> **Note for next session**: Database connection and Alembic migrations have been temporarily deferred due to Docker daemon unavailability. When Docker is active, run the following to initialize the database:
> ```bash
> cd backend
> docker compose up -d db redis
> .venv/bin/alembic revision --autogenerate -m "create audits and violations"
> .venv/bin/alembic upgrade head
> ```

## Quick start (Docker — recommended)

```bash
cd backend

# 1. Create your local env file
cp .env.example .env

# 2. Start PostgreSQL, Redis, and the API
docker compose up --build

# API is now live at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
# Health check: http://localhost:8000/health
```

## Quick start (local Python)

```bash
cd backend

# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your local env file (make sure PostgreSQL + Redis are running locally)
cp .env.example .env

# 4. Run the API with hot-reload
uvicorn app.main:app --reload --port 8000
```

## Project structure

```
backend/
├── app/
│   ├── core/          # Config, database engine
│   ├── models/        # SQLAlchemy ORM models (audits, violations)
│   ├── routers/       # FastAPI route handlers
│   ├── schemas/       # Pydantic request/response models
│   ├── services/      # Business logic (vision pipeline, notice generator)
│   │   └── vision/    # YOLOv8 + PaddleOCR pipeline (Sprint 2)
│   ├── utils/         # Shared utilities (lmpc_validator, evidence_sealer)
│   ├── data/          # lmpcRules.json (shared with frontend — do not fork)
│   ├── tests/         # pytest test suite
│   └── main.py        # FastAPI app factory
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Engineer boundaries

| Scope | Engineer 1 (this repo) | Engineer 2 |
|---|---|---|
| Vision pipeline | ✅ | — |
| `lmpc_validator.py` | ✅ | — |
| `audits` + `violations` tables | ✅ | — |
| Auth / JWT | — | ✅ |
| Notice generation | — | ✅ |
| Celery scraping workers | — | ✅ |
| Heatmap / WebSocket feed | — | ✅ |
