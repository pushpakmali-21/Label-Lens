from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid
import hashlib

from app.core.database import get_db
from app.schemas.scan import ScanImageRequest, ScanResponse
from app.services.vision.stub_pipeline import process_scan_stub
from app.utils.evidence_sealer import generate_evidence_seal

router = APIRouter(prefix="/scan", tags=["scan"])

@router.post("/image", response_model=ScanResponse)
async def scan_image(request: ScanImageRequest, db: AsyncSession = Depends(get_db)):
    """
    Accepts an image and runs the LMPC compliance vision pipeline.
    """
    # 1. Generate image hash
    image_hash = hashlib.sha256(request.image_base64.encode('utf-8')).hexdigest()
    
    # 2. Run vision pipeline (stubbed for Sprint 1)
    extracted_data, fields, violations, verdict, verdictNote = await process_scan_stub(request.image_base64)
    
    # 3. Generate Evidence Seal
    timestamp_iso = datetime.utcnow().isoformat()
    seal = generate_evidence_seal(
        image_hash=image_hash,
        verdict=verdict,
        timestamp_iso=timestamp_iso,
        gps_lat=request.gps_lat,
        gps_lon=request.gps_lon
    )
    
    audit_id = uuid.uuid4()
    
    # TODO (Phase 2.5): Persist to Database
    # audit_record = Audit(id=audit_id, ...)
    # db.add(audit_record)
    # db.commit()
    
    return ScanResponse(
        audit_id=audit_id,
        verdict=verdict,
        verdictNote=verdictNote,
        fields=fields,
        violations=violations,
        evidence_seal=seal
    )
