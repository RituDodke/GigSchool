from typing import List, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Header
from supabase import Client
from app.api import deps
from app.schemas.review import Review, ReviewCreate
from app.repositories.review_repository import review_repository

router = APIRouter()

# Local dependency for get_current_user since it was missing in deps.py
# In a real refactor, this should be moved to deps.py
def get_current_user(
    authorization: str = Header(...),
    supabase: Client = Depends(deps.get_supabase_client)
):
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        response = supabase.auth.get_user(token)
        if not response or not response.user:
             raise HTTPException(status_code=401, detail="Invalid authentication token")
        return response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


@router.post("/", response_model=Review)
def create_review(
    review_in: ReviewCreate,
    current_user: Any = Depends(get_current_user)
):
    """
    Submit a review for a user.
    """
    # Verify not reviewing self
    if str(review_in.reviewee_id) == current_user.id:
         raise HTTPException(status_code=400, detail="Cannot review yourself")

    try:
        return review_repository.create(review_in, UUID(current_user.id))
    except Exception as e:
        # Handle unique constraint violation (already reviewed this job)
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="You have already reviewed this user for this job.")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users/{user_id}", response_model=List[Review])
def get_user_reviews(user_id: UUID):
    """
    Get all reviews received by a user.
    """
    return review_repository.get_by_reviewee(user_id)

@router.get("/users/{user_id}/stats")
def get_user_stats(user_id: UUID):
    """
    Get aggregated stats for a user (average rating).
    """
    reviews = review_repository.get_by_reviewee(user_id)
    count = len(reviews)
    avg = 0.0
    if count > 0:
        avg = round(sum(r.rating for r in reviews) / count, 1)
    
    return {
        "average_rating": avg,
        "total_reviews": count
    }
