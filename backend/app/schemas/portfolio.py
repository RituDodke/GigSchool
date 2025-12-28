from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class PortfolioItemCreate(BaseModel):
    title: str
    description: str | None = None
    link: str | None = None
    file_url: str | None = None
    file_type: str  # 'image', 'pdf', 'link'

class PortfolioItem(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None
    link: str | None
    file_url: str | None
    file_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True
