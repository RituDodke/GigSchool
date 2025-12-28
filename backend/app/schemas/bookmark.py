from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class BookmarkCreate(BaseModel):
    user_id: UUID
    job_id: UUID

class Bookmark(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
