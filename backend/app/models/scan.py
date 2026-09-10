from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.core.database import Base
from datetime import datetime, timezone

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_type = Column(String, index=True) # "IMAGE" or "QR"
    image_path = Column(String, nullable=True) # Can be null if QR scan only, or base64? Usually store path or URL
    violations = Column(JSON, default=list) # List of violation dictionaries
    metadata_info = Column(JSON, default=dict) # Metadata from the scan (product name, brand, etc.)
    evidence_seal_id = Column(String, unique=True, index=True) # Evidence seal ID
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
