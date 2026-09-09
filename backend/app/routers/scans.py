from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.scan import Scan
from app.schemas.scan import ScanCreate, ScanResponse

router = APIRouter(prefix="/scans", tags=["scans"])

@router.post("/", response_model=ScanResponse)
def create_scan(scan_in: ScanCreate, db: Session = Depends(get_db)):
    db_scan = Scan(
        scan_type=scan_in.scan_type,
        image_path=scan_in.image_path,
        violations=scan_in.violations,
        metadata_info=scan_in.metadata_info,
        evidence_seal_id=scan_in.evidence_seal_id
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

@router.get("/audit", response_model=List[ScanResponse])
def get_audit_trail(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    scans = db.query(Scan).order_by(Scan.timestamp.desc()).offset(skip).limit(limit).all()
    return scans

@router.get("/{evidence_seal_id}", response_model=ScanResponse)
def get_scan_by_seal(evidence_seal_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.evidence_seal_id == evidence_seal_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan
