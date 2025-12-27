from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class ApplicationBase(BaseModel):
    job_id: UUID
    pitch: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    applicant_id: UUID 

class ApplicationStatusUpdate(BaseModel):
    status: str # PENDING, ACCEPTED, REJECTED

class ApplicationInDBBase(ApplicationBase):
    id: UUID
    applicant_id: UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Application(ApplicationInDBBase):
    pass
