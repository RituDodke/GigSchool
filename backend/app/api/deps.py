from fastapi import Header
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
