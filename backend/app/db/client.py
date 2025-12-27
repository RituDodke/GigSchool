from supabase import create_client, Client
from app.core.config import get_settings

settings = get_settings()

try:
    # supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    print("Supabase connection skipped for verification.")
    supabase = None
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    raise e
