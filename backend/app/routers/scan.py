"""
app/routers/scan.py
────────────────────
/scan/image and /scan/qr endpoints.

Engineer 3 changes (Rules & Evidence sprint):
  - Unpack 6-tuple from process_scan_stub (new: rule_version)
  - Pass fields, violations, and rule_version into generate_evidence_seal
    so the seal hash is bound to the full LMPC verdict output
  - Include rule_version in ScanResponse
  - QR decode-failure branch reads rule_version from RULE_ENGINE_VERSION
    module constant to keep the seal consistent
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import hashlib

from app.core.database import get_db
from app.schemas.scan import ScanImageRequest, ScanQRRequest, ScanResponse
from app.services.vision.stub_pipeline import process_scan_stub
from app.services.vision.qr_parser import parse_qr_payload
from app.utils.evidence_sealer import generate_evidence_seal
from app.utils.lmpc_validator import RULE_ENGINE_VERSION

router = APIRouter(prefix="/scan", tags=["scan"])


@router.post("/image", response_model=ScanResponse)
async def scan_image(request: ScanImageRequest, db: Session = Depends(get_db)):
    """
    Accepts an image and runs the LMPC compliance vision pipeline.
    Sprint 1: stubbed extraction, real validator.
    """
    image_hash = hashlib.sha256(request.image_base64.encode("utf-8")).hexdigest()

    extracted_data, fields, violations, verdict, verdictNote, rule_version = (
        await process_scan_stub(
            request.image_base64,
            extracted_fields=request.extracted_fields,
        )
    )

    timestamp_iso = datetime.utcnow().isoformat()
    seal = generate_evidence_seal(
        image_hash=image_hash,
        verdict=verdict,
        timestamp_iso=timestamp_iso,
        rule_version=rule_version,
        fields=fields,
        violations=violations,
        gps_lat=request.gps_lat,
        gps_lon=request.gps_lon,
        device_id=request.device_id,
    )

    audit_id = uuid.uuid4()

    # TODO (Phase 2.5): Persist to Database
    # audit_record = Audit(id=audit_id, ...)
    # db.add(audit_record)
    # await db.commit()

    return ScanResponse(
        audit_id=audit_id,
        verdict=verdict,  # type: ignore[arg-type]
        verdictNote=verdictNote,
        fields=fields,
        violations=violations,
        evidence_seal=seal,  # type: ignore[arg-type]
        rule_version=rule_version,
    )


@router.post("/qr", response_model=ScanResponse)
async def scan_qr(request: ScanQRRequest, db: Session = Depends(get_db)):
    """
    Accepts QR content string, parses it into package fields, and runs LMPC validation.

    Parsing tiers (in order):
      1. JSON object
      2. KEY:VALUE line-delimited text
      3. Heuristic free-text token scan

    If no useful fields can be extracted, returns a ``fail`` verdict with an
    explicit violation rather than running a misleading mock through the validator.
    """
    qr_hash = hashlib.sha256(request.qr_content.encode("utf-8")).hexdigest()
    timestamp_iso = datetime.utcnow().isoformat()
    audit_id = uuid.uuid4()

    # Attempt to parse the QR payload into package fields
    try:
        extracted_fields = parse_qr_payload(request.qr_content)
    except ValueError as exc:
        # QR decode failure — use RULE_ENGINE_VERSION directly so the seal is
        # still versioned even without going through the full validator path.
        seal = generate_evidence_seal(
            image_hash=qr_hash,
            verdict="fail",
            timestamp_iso=timestamp_iso,
            rule_version=RULE_ENGINE_VERSION,
            fields=[],
            violations=[{
                "field": "qr_content",
                "plain": str(exc),
                "rule": "Rule 6(1)",
                "severity": "critical",
            }],
            gps_lat=request.gps_lat,
            gps_lon=request.gps_lon,
            device_id=request.device_id,
        )
        return ScanResponse(
            audit_id=audit_id,
            verdict="fail",
            verdictNote="QR code could not be decoded into recognisable package fields.",
            fields=[],
            violations=[{  # type: ignore[list-item]
                "field": "qr_content",
                "plain": str(exc),
                "rule": "Rule 6(1)",
                "severity": "critical",
            }],
            evidence_seal=seal,  # type: ignore[arg-type]
            rule_version=RULE_ENGINE_VERSION,
        )

    # Run parsed fields through the LMPC validator
    extracted_data, fields, violations, verdict, verdictNote, rule_version = (
        await process_scan_stub(
            "qr_content", extracted_fields=extracted_fields
        )
    )

    seal = generate_evidence_seal(
        image_hash=qr_hash,
        verdict=verdict,
        timestamp_iso=timestamp_iso,
        rule_version=rule_version,
        fields=fields,
        violations=violations,
        gps_lat=request.gps_lat,
        gps_lon=request.gps_lon,
        device_id=request.device_id,
    )

    # TODO (Phase 2.5): Persist to Database
    # audit_record = Audit(id=audit_id, ...)
    # db.add(audit_record)
    # await db.commit()

    return ScanResponse(
        audit_id=audit_id,
        verdict=verdict,  # type: ignore[arg-type]
        verdictNote=verdictNote,
        fields=fields,
        violations=violations,
        evidence_seal=seal,  # type: ignore[arg-type]
        rule_version=rule_version,
    )
