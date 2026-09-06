from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Any
from app.schemas.scan import ScanResponse

class AuditBase(BaseModel):
    id: UUID
    image_hash: str
    verdict: str
    inspector_id: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    network_timestamp: Optional[datetime] = None
    device_id: Optional[str] = None
    evidence_seal_sha256: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AuditResponse(AuditBase):
    # Depending on how the client fetches the audit, they might want the full reconstructed response
    result_json: Any 
