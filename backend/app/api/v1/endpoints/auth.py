from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate, UserUpdate, User
from app.schemas.application import Application, ApplicationWithDetails
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

@router.get("/{user_id}/notifications")
def get_user_notifications(user_id: UUID) -> Dict[str, List[ApplicationWithDetails]]:
    """
    Get notifications for a user:
    - applications_on_your_gigs: applications received on gigs you created
    - your_applications: status of gigs you applied to
    """
    return {
        "applications_on_your_gigs": application_repository.get_for_creator_with_details(user_id),
        "your_applications": application_repository.get_by_applicant_with_details(user_id)
    }

# Bookmark endpoints
from fastapi import Query
from app.schemas.bookmark import Bookmark, BookmarkCreate
from app.repositories.bookmark_repository import bookmark_repository

@router.get("/{user_id}/bookmarks", response_model=List[Bookmark])
def get_user_bookmarks(user_id: UUID):
    """Get all bookmarks for a user."""
    return bookmark_repository.get_by_user(user_id)

@router.post("/{user_id}/bookmarks", response_model=Bookmark)
def create_bookmark(user_id: UUID, job_id: UUID = Query(...)):
    """Add a job to bookmarks."""
    try:
        bookmark_in = BookmarkCreate(user_id=user_id, job_id=job_id)
        return bookmark_repository.create(bookmark_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}/bookmarks/{job_id}")
def delete_bookmark(user_id: UUID, job_id: UUID):
    """Remove a job from bookmarks."""
    if bookmark_repository.delete(user_id, job_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Bookmark not found")
