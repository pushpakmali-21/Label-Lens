import uuid
from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Violation(Base):
    __tablename__ = "violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id", ondelete="CASCADE"), nullable=False, index=True)
    
    field = Column(String(255), nullable=False)
    plain = Column(String(1000), nullable=False)
    rule = Column(String(255), nullable=False, index=True)
    severity = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)

    # Relationships
    audit = relationship("Audit", back_populates="violations")
