from typing import List
from uuid import UUID
from app.db.client import supabase
from app.schemas.bookmark import Bookmark, BookmarkCreate

class BookmarkRepository:
    def __init__(self):
        self.table_name = "bookmarks"

    def get_by_user(self, user_id: UUID) -> List[Bookmark]:
        try:
            response = supabase.table(self.table_name).select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
            return [Bookmark(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching bookmarks for user {user_id}: {e}")
            return []

    def create(self, bookmark_in: BookmarkCreate) -> Bookmark:
        try:
            data = {"user_id": str(bookmark_in.user_id), "job_id": str(bookmark_in.job_id)}
            response = supabase.table(self.table_name).insert(data).execute()
            return Bookmark(**response.data[0])
        except Exception as e:
            print(f"Error creating bookmark: {e}")
            raise e

    def delete(self, user_id: UUID, job_id: UUID) -> bool:
        try:
            supabase.table(self.table_name).delete().eq("user_id", str(user_id)).eq("job_id", str(job_id)).execute()
            return True
        except Exception as e:
            print(f"Error deleting bookmark: {e}")
            return False

    def exists(self, user_id: UUID, job_id: UUID) -> bool:
        try:
            response = supabase.table(self.table_name).select("id").eq("user_id", str(user_id)).eq("job_id", str(job_id)).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error checking bookmark: {e}")
            return False

bookmark_repository = BookmarkRepository()
