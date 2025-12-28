from typing import List, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Header
from supabase import Client, ClientOptions
from app.api import deps
from app.schemas.portfolio import PortfolioItem, PortfolioItemCreate
from app.repositories.portfolio_repository import PortfolioRepository

router = APIRouter()

def get_current_user(
    authorization: str = Header(...),
    supabase: Client = Depends(deps.get_supabase_client)
):
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        # Verify token and get user from Supabase Auth
        response = supabase.auth.get_user(token)
        if not response or not response.user:
             raise HTTPException(status_code=401, detail="Invalid authentication token")
        return response.user
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@router.get("/users/{user_id}/portfolio", response_model=List[PortfolioItem])
def get_user_portfolio(
    user_id: UUID,
    repo: PortfolioRepository = Depends(PortfolioRepository)
) -> Any:
    """
    Get portfolio items for a specific user.
    """
    return repo.get_by_user(user_id)

@router.post("/portfolio", response_model=PortfolioItem)
def create_portfolio_item(
    item_in: PortfolioItemCreate,
    current_user: Any = Depends(get_current_user),
    repo: PortfolioRepository = Depends(PortfolioRepository)
) -> Any:
    """
    Create a new portfolio item.
    """
    user_id = UUID(current_user.id)
    return repo.create(item_in, user_id)

@router.delete("/portfolio/{item_id}")
def delete_portfolio_item(
    item_id: UUID,
    current_user: Any = Depends(get_current_user),
    repo: PortfolioRepository = Depends(PortfolioRepository)
) -> Any:
    """
    Delete a portfolio item.
    """
    user_id = UUID(current_user.id)
    repo.delete(item_id, user_id)
    return {"status": "success"}
