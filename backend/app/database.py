from supabase import create_client, Client
from app.config import get_settings
from functools import lru_cache

settings = get_settings()


@lru_cache()
def get_supabase() -> Client:
    """
    Returns a cached Supabase client using the anon key.
    Use for normal operations (respects Row Level Security).
    """
    return create_client(settings.supabase_url, settings.supabase_key)


@lru_cache()
def get_supabase_admin() -> Client:
    """
    Returns a cached Supabase client using the service key.
    Use ONLY for admin operations (bypasses Row Level Security).
    """
    return create_client(settings.supabase_url, settings.supabase_service_key)