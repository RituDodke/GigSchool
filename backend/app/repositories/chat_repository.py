from typing import List, Optional
from uuid import UUID
from app.db.client import supabase
from app.schemas.chat import Conversation, ConversationCreate, Message, MessageCreate
from fastapi.encoders import jsonable_encoder

class ChatRepository:
    def get_or_create_conversation(self, user1_id: UUID, user2_id: UUID) -> Conversation:
        """Get existing conversation or create new one between two users"""
        # Ensure consistent ordering
        uid1, uid2 = sorted([str(user1_id), str(user2_id)])
        
        try:
            # Try to find existing conversation
            response = supabase.table("conversations").select("*").or_(
                f"and(user1_id.eq.{uid1},user2_id.eq.{uid2}),and(user1_id.eq.{uid2},user2_id.eq.{uid1})"
            ).single().execute()
            
            if response.data:
                return Conversation(**response.data)
        except:
            pass
        
        # Create new conversation
        data = {"user1_id": uid1, "user2_id": uid2}
        response = supabase.table("conversations").insert(data).execute()
        if response.data:
            return Conversation(**response.data[0])
        raise Exception("Failed to create conversation")

    def get_user_conversations(self, user_id: UUID) -> List[dict]:
        """Get all conversations for a user with other user info"""
        try:
            response = supabase.table("conversations").select(
                "*, user1:users!conversations_user1_id_fkey(id, email, username, avatar_url), "
                "user2:users!conversations_user2_id_fkey(id, email, username, avatar_url)"
            ).or_(
                f"user1_id.eq.{str(user_id)},user2_id.eq.{str(user_id)}"
            ).order("last_message_at", desc=True).execute()
            
            conversations = []
            for conv in response.data:
                # Determine which user is the "other" user
                other_user = conv['user1'] if str(conv['user2']['id']) == str(user_id) else conv['user2']
                conv['other_user'] = other_user
                del conv['user1']
                del conv['user2']
                conversations.append(conv)
            
            return conversations
        except Exception as e:
            print(f"Error fetching conversations: {e}")
            return []

    def get_messages(self, conversation_id: UUID, limit: int = 50) -> List[Message]:
        """Get messages for a conversation"""
        try:
            response = supabase.table("messages").select("*").eq(
                "conversation_id", str(conversation_id)
            ).order("created_at", desc=False).limit(limit).execute()
            
            return [Message(**msg) for msg in response.data]
        except Exception as e:
            print(f"Error fetching messages: {e}")
            return []

    def send_message(self, message_in: MessageCreate) -> Message:
        """Send a message"""
        data = jsonable_encoder(message_in)
        response = supabase.table("messages").insert(data).execute()
        
        if response.data:
            # Update conversation last_message_at
            supabase.table("conversations").update(
                {"last_message_at": response.data[0]['created_at']}
            ).eq("id", str(message_in.conversation_id)).execute()
            
            return Message(**response.data[0])
        raise Exception("Failed to send message")

chat_repository = ChatRepository()
