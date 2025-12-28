from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate, UserUpdate, User
from app.schemas.application import Application
from app.services.auth_service import auth_service
from app.repositories.user_repository import user_repository
from app.repositories.application_repository import application_repository

router = APIRouter()

@router.post("/sync", response_model=User)
def sync_user(user_in: UserCreate):
    """
    Syncs the authenticated user to the public 'users' table.
    """
    try:
        return auth_service.sync_user(user_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=User)
def get_user(user_id: UUID):
    """
    Get a user by ID.
    """
    user = user_repository.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}", response_model=User)
def update_user(user_id: UUID, user_in: UserUpdate):
    """
    Update user profile (username, avatar_url).
    """
    try:
        user = user_repository.update(user_id, user_in)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}/applications", response_model=List[Application])
def get_user_applications(user_id: UUID):
    """
    Get all applications submitted by a user.
    """
    return application_repository.get_by_applicant(user_id)


