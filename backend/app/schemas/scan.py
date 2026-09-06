from typing import List, Optional, Literal
from pydantic import BaseModel, ConfigDict
from uuid import UUID

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

class ScanResponse(BaseModel):
    audit_id: UUID
    verdict: Literal["pass", "review", "fail"]
    verdictNote: str
    fields: List[FieldResult]
    violations: List[ViolationResult]
    evidence_seal: EvidenceSeal

    model_config = ConfigDict(from_attributes=True)

class ScanImageRequest(BaseModel):
    image_base64: str
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    device_id: Optional[str] = None
