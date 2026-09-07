from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.schemas.audit import AuditResponse

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(audit_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Retrieve a specific audit by ID.
    Currently stubbed out since DB persistence is deferred.
    """
    # TODO (Phase 2.5): Fetch from database
    # result = await db.execute(select(Audit).where(Audit.id == audit_id))
    # audit = result.scalars().first()
    # if not audit:
    #     raise HTTPException(status_code=404, detail="Audit not found")
    # return audit
    
    raise HTTPException(status_code=501, detail="Database persistence deferred. Cannot fetch audits yet.")
