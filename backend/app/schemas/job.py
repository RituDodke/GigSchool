from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

# Shared properties
class JobBase(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    group_id: str  # e.g., "college-engineering"
    payload: Optional[Dict[str, Any]] = None # For extra data

# Properties to receive on creation
class JobCreate(JobBase):
    creator_id: UUID

# Properties to receive on update
class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None # OPEN, COMPLETED
    payload: Optional[Dict[str, Any]] = None

# Properties shared by models stored in DB
class JobInDBBase(JobBase):
    id: UUID
    creator_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Job(JobInDBBase):
    pass
