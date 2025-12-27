from typing import Optional
from uuid import UUID
from app.schemas.user import UserCreate, User
from app.repositories.user_repository import user_repository
from app.core.logger import logger

class AuthService:
    def sync_user(self, user_in: UserCreate) -> User:
        """
        Ensures user exists in our public 'users' table.
        Called after successful login logic.
        """
        existing_user = user_repository.get(user_in.id)
        if existing_user:
            return existing_user
        
        logger.info(f"Creating new user in public table: {user_in.email}")
        return user_repository.create(user_in)

auth_service = AuthService()
