from typing import List
from uuid import UUID
from app.repositories.user_repository import IBugSchoolRepository
from app.schemas.application import Application, ApplicationCreate, ApplicationStatusUpdate
from app.db.client import supabase

class ApplicationRepository(IBugSchoolRepository[Application, ApplicationCreate, ApplicationStatusUpdate]):
    def get_by_job(self, job_id: UUID) -> List[Application]:
        try:
            response = supabase.table(self.table_name).select("*").eq("job_id", str(job_id)).execute()
            return [self.model(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching applications for job {job_id}: {e}")
            return []

application_repository = ApplicationRepository(Application, "applications")
