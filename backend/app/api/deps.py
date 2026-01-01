from typing import Any, Optional
from fastapi import Header, Depends, HTTPException
from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

def get_supabase_client(authorization: str = Header(None)) -> Client:
    # Always create a new client to avoid shared state if we modify it
    # Though 'create_client' might be cached, 'postgrest' client state (auth header) is what matters.
    # supabase-py creates a new instance each time create_client is called unless singleton is used.
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        if token:
            client.postgrest.auth(token)
    return client


def get_current_user(
    authorization: str = Header(...),
    supabase: Client = Depends(get_supabase_client)
) -> Any:
    """
    Dependency to get the current authenticated user.
    Raises HTTPException 401 if not authenticated.
    """
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return response.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def get_optional_user(
    authorization: str = Header(None),
    supabase: Client = Depends(get_supabase_client)
) -> Optional[Any]:
    """
    Dependency to optionally get the current user.
    Returns None if not authenticated (no error).
    """
    if not authorization:
        return None
    
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        return None
    
    try:
        response = supabase.auth.get_user(token)
        if response and response.user:
            return response.user
        return None
    except Exception:
        return None
