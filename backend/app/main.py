from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import scans, scan, audit
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/api/v1")
app.include_router(scans.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "LabelLens API is running"}
