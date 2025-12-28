from typing import Optional, Any, Dict, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class UserCreate(UserBase):
    id: UUID # We receive the ID from Supabase Auth
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

