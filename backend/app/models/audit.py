import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class Audit(Base):
    __tablename__ = "audits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_hash = Column(String(255), index=True, nullable=False)
    
    # Store the full raw OCR/vision result for debugging/history
    result_json = Column(JSONB, nullable=False)
    
    # The final determination: "pass", "review", or "fail"
    verdict = Column(String(50), nullable=False, index=True)
    
    # Nullable because citizens can scan without auth
    inspector_id = Column(String(255), nullable=True, index=True)
    
    gps_lat = Column(Float, nullable=True)
    gps_lon = Column(Float, nullable=True)
    network_timestamp = Column(DateTime, nullable=True)
    device_id = Column(String(255), nullable=True)
    
    evidence_seal_sha256 = Column(String(64), nullable=True, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    violations = relationship("Violation", back_populates="audit", cascade="all, delete-orphan")
