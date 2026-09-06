# LabelLens — Python Backend

FastAPI backend for the LabelLens Legal Metrology Compliance Platform (SIH 2026).

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
