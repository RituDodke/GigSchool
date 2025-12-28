from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.schemas.chat import Conversation, Message, MessageCreate
from app.repositories.chat_repository import chat_repository

router = APIRouter()

@router.post("/conversations/{other_user_id}", response_model=Conversation)
def get_or_create_conversation(other_user_id: UUID, current_user_id: UUID):
    """
    Get or create a conversation between current user and another user.
    """
    try:
        return chat_repository.get_or_create_conversation(current_user_id, other_user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/conversations", response_model=List[dict])
def get_conversations(user_id: UUID):
    """
    Get all conversations for a user.
    """
    return chat_repository.get_user_conversations(user_id)

@router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
def get_messages(conversation_id: UUID):
    """
    Get messages for a conversation.
    """
    return chat_repository.get_messages(conversation_id)

@router.post("/conversations/{conversation_id}/messages", response_model=Message)
def send_message(conversation_id: UUID, sender_id: UUID, content: str):
    """
    Send a message to a conversation.
    """
    try:
        message = MessageCreate(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content
        )
        return chat_repository.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
