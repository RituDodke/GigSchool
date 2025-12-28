from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

# Creator info embedded in job responses
class CreatorInfo(BaseModel):
    id: UUID
    email: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None

# Shared properties
class JobBase(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    category: str = "general"  # general, tutoring, design, coding, writing, other
    resume_required: bool = False
    group_id: str = "general"  # e.g., "college-engineering"
    payload: Optional[Dict[str, Any]] = None # For extra data

# Properties to receive on creation
class JobCreate(JobBase):
    creator_id: UUID

# Properties to receive on update
class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    resume_required: Optional[bool] = None
    status: Optional[str] = None # OPEN, CLOSED, COMPLETED
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
    creator: Optional[CreatorInfo] = None

