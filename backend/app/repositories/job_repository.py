from typing import List, Optional
from uuid import UUID
from fastapi.encoders import jsonable_encoder
from app.repositories.user_repository import IBugSchoolRepository
from app.schemas.job import Job, JobCreate, JobUpdate, CreatorInfo
from app.db.client import supabase

class JobRepository(IBugSchoolRepository[Job, JobCreate, JobUpdate]):
    def _enrich_with_creator(self, job_data: dict) -> dict:
        """Add creator info to job data"""
        if 'users' in job_data and job_data['users']:
            job_data['creator'] = CreatorInfo(**job_data['users'])
            del job_data['users']
        return job_data

    def get_by_group(self, group_id: str) -> List[Job]:
        try:
            response = supabase.table(self.table_name).select(
                "*, users(id, email, username, avatar_url)"
            ).eq("group_id", group_id).order("created_at", desc=True).execute()
            return [self.model(**self._enrich_with_creator(item)) for item in response.data]
        except Exception as e:
            print(f"Error fetching jobs for group {group_id}: {e}")
            return []

    def get_all(self) -> List[Job]:
        try:
            response = supabase.table(self.table_name).select(
                "*, users(id, email, username, avatar_url)"
            ).order("created_at", desc=True).limit(50).execute()
            return [self.model(**self._enrich_with_creator(item)) for item in response.data]
        except Exception as e:
            print(f"Error fetching all jobs: {e}")
            return []

    def get_by_creator(self, creator_id: str) -> List[Job]:
        try:
            response = supabase.table(self.table_name).select(
                "*, users(id, email, username, avatar_url)"
            ).eq("creator_id", creator_id).order("created_at", desc=True).execute()
            return [self.model(**self._enrich_with_creator(item)) for item in response.data]
        except Exception as e:
            print(f"Error fetching jobs for creator {creator_id}: {e}")
            return []

    def get(self, id: UUID) -> Optional[Job]:
        try:
            response = supabase.table(self.table_name).select(
                "*, users(id, email, username, avatar_url)"
            ).eq("id", str(id)).single().execute()
            if response.data:
                return self.model(**self._enrich_with_creator(response.data))
            return None
        except Exception as e:
            print(f"Error fetching job {id}: {e}")
            return None

    def update(self, id: UUID, obj_in: JobUpdate, client=None) -> Optional[Job]:
        db = client or supabase
        obj_data = jsonable_encoder(obj_in, exclude_unset=True)
        obj_data = {k: v for k, v in obj_data.items() if v is not None}
        try:
            response = db.table(self.table_name).update(obj_data).eq("id", str(id)).execute()
            if response.data:
                return self.get(id)  # Re-fetch with creator
            return None
        except Exception as e:
            print(f"Error updating job: {e}")
            raise e

    def delete(self, id: UUID, client=None) -> bool:
        db = client or supabase
        try:
            response = db.table(self.table_name).delete().eq("id", str(id)).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error deleting job: {e}")
            return False

job_repository = JobRepository(Job, "jobs")

