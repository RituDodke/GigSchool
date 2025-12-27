from fastapi import APIRouter, HTTPException, Depends
from app.schemas.user import UserCreate, User
from app.services.auth_service import auth_service

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

@router.get("/me", response_model=User)
def read_users_me():
    """
    Get current user.
    """
    # In a real app, we would extract the ID from the JWT token dependencies.
    # For scaffolding, we return a placeholder error implementation or mock.
    raise HTTPException(status_code=501, detail="Not implemented yet. Needs JWT dep.")
