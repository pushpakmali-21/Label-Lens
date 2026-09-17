"""
app/schemas/scan.py
────────────────────
Request / response Pydantic models for /scan/image and /scan/qr endpoints.
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ScanCreate(BaseModel):
    scan_type: str
    image_path: Optional[str] = None
    violations: List[Any] = []
    metadata_info: Dict[str, Any] = {}
    evidence_seal_id: str

class ScanDBResponse(BaseModel):
    id: int
    scan_type: str
    image_path: Optional[str] = None
    violations: List[Any] = []
    metadata_info: Dict[str, Any] = {}
    evidence_seal_id: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class FieldResult(BaseModel):
    label: str
    value: str
    source: str
    status: Literal["ok", "review", "missing"]
    confidence: float
    rule: str


class ViolationResult(BaseModel):
    field: str
    plain: str
    rule: str
    severity: Literal["low", "medium", "high", "critical"] = "medium"


class EvidenceSeal(BaseModel):
    sha256: str
    shortHash: str
    timestamp: str
    sealed: bool
    # The rule-engine version that produced the verdict bound to this seal.
    rule_version: str


class ScanResponse(BaseModel):
    audit_id: UUID
    verdict: Literal["pass", "review", "fail"]
    verdictNote: str
    fields: List[FieldResult]
    violations: List[ViolationResult]
    evidence_seal: EvidenceSeal
    # Top-level convenience field so clients don't have to dig into the seal.
    rule_version: str

    model_config = ConfigDict(from_attributes=True)


class ScanImageRequest(BaseModel):
    image_base64: str
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    device_id: Optional[str] = None
    extracted_fields: Optional[dict] = None


class ScanQRRequest(BaseModel):
    qr_content: str
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    device_id: Optional[str] = None
