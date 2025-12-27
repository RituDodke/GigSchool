from typing import List, Optional
from app.repositories.user_repository import IBugSchoolRepository
from app.schemas.job import Job, JobCreate, JobUpdate
from app.db.client import supabase

class JobRepository(IBugSchoolRepository[Job, JobCreate, JobUpdate]):
    def get_by_group(self, group_id: str) -> List[Job]:
        try:
            response = supabase.table(self.table_name).select("*").eq("group_id", group_id).execute()
            return [self.model(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching jobs for group {group_id}: {e}")
            return []

    def get_all(self) -> List[Job]:
        try:
            response = supabase.table(self.table_name).select("*").order("created_at", desc=True).limit(50).execute()
            return [self.model(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching all jobs: {e}")
            return []

job_repository = JobRepository(Job, "jobs")
