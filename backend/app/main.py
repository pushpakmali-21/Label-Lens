"""
app/main.py
───────────
FastAPI application factory for the LabelLens Compliance API.

Registered routers (added incrementally as phases are completed):
  - /api/v1/scan  →  app.routers.scan   (Phase 4)
  - /api/v1/audit →  app.routers.audit  (Phase 4)

Auth routers and Celery workers are owned by Engineer 2 and will be
wired in separately without touching this file's core setup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings

settings = get_settings()


def create_app() -> FastAPI:
    """
    Application factory.
    Returns a configured FastAPI instance. Keeping this as a factory
    (rather than a module-level variable) makes it easy to create
    isolated instances for testing.
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "LabelLens Legal Metrology Compliance API — "
            "Vision pipeline, validation engine, and audit records. "
            "Built for SIH 2026."
        ),
        # Only expose interactive docs in development
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    # In development: allow configured origins (Vite dev server on :5173).
    # In production: lock down to the deployed frontend URL.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    # Routers are imported here, inside the factory, to avoid circular imports
    # as the codebase grows. Each import is guarded so the app starts even if
    # a router module is not yet written (during incremental development).
    _register_routers(app)

    return app


def _register_routers(app: FastAPI) -> None:
    """
    Register all API routers.
    Add new routers here as each phase is completed — do not import them
    at module level to avoid circular dependency issues.
    """
    # Phase 4 — Scan & Audit routers (uncomment when Phase 4 is complete)
    # from app.routers import scan, audit
    # app.include_router(scan.router, prefix="/api/v1", tags=["Scan"])
    # app.include_router(audit.router, prefix="/api/v1", tags=["Audit"])
    pass


# ── Application instance ──────────────────────────────────────────────────────
# Created once at module load; uvicorn imports this directly.
app = create_app()


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """
    Liveness probe.
    Returns 200 with basic service metadata. Does NOT check DB connectivity
    here — a separate /ready endpoint (added in Phase 5) will do that.
    """
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }
