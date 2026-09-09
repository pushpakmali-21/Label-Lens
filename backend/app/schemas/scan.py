from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ScanCreate(BaseModel):
    scan_type: str = Field(..., description="Type of scan: IMAGE or QR")
    image_path: Optional[str] = None
    violations: List[Dict[str, Any]] = Field(default_factory=list)
    metadata_info: Dict[str, Any] = Field(default_factory=dict)
    evidence_seal_id: str

class ScanResponse(ScanCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
