from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    conversation_id: UUID
    sender_id: UUID

class Message(MessageBase):
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    user1_id: UUID
    user2_id: UUID

class ConversationCreate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: UUID
    last_message_at: datetime
    created_at: datetime
    # Optional: include other user's info
    other_user: Optional[dict] = None
    last_message: Optional[str] = None

    class Config:
        from_attributes = True
