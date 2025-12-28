from typing import List
from uuid import UUID
from app.repositories.user_repository import IBugSchoolRepository
from app.schemas.application import Application, ApplicationCreate, ApplicationStatusUpdate, ApplicationWithDetails
from app.db.client import supabase

class ApplicationRepository(IBugSchoolRepository[Application, ApplicationCreate, ApplicationStatusUpdate]):
    def get_by_job(self, job_id: UUID) -> List[Application]:
        try:
            response = supabase.table(self.table_name).select("*").eq("job_id", str(job_id)).execute()
            return [self.model(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching applications for job {job_id}: {e}")
            return []

    def get_by_applicant(self, applicant_id: UUID) -> List[Application]:
        try:
            response = supabase.table(self.table_name).select("*").eq("applicant_id", str(applicant_id)).order("created_at", desc=True).execute()
            return [self.model(**item) for item in response.data]
        except Exception as e:
            print(f"Error fetching applications for applicant {applicant_id}: {e}")
            return []

    def get_by_applicant_with_details(self, applicant_id: UUID) -> List[ApplicationWithDetails]:
        """Get applications by user with job details"""
        try:
            response = supabase.table(self.table_name).select(
                "*, jobs(title, creator_id)"
            ).eq("applicant_id", str(applicant_id)).order("created_at", desc=True).execute()
            
            results = []
            for item in response.data:
                job_data = item.pop("jobs", {}) or {}
                results.append(ApplicationWithDetails(
                    **item,
                    job_title=job_data.get("title"),
                    job_creator_id=job_data.get("creator_id")
                ))
            return results
        except Exception as e:
            print(f"Error fetching applications with details for applicant {applicant_id}: {e}")
            return []

    def get_for_creator_with_details(self, creator_id: UUID) -> List[ApplicationWithDetails]:
        """Get applications to jobs owned by creator, with applicant details"""
        try:
            # First get all jobs by this creator
            jobs_response = supabase.table("jobs").select("id, title").eq("creator_id", str(creator_id)).execute()
            job_ids = [job["id"] for job in jobs_response.data]
            
            if not job_ids:
                return []
            
            # Get applications for these jobs with user details
            response = supabase.table(self.table_name).select(
                "*, users!applications_applicant_id_fkey(username, email)"
            ).in_("job_id", job_ids).order("created_at", desc=True).execute()
            
            # Build job title lookup
            job_titles = {job["id"]: job["title"] for job in jobs_response.data}
            
            results = []
            for item in response.data:
                user_data = item.pop("users", {}) or {}
                results.append(ApplicationWithDetails(
                    **item,
                    job_title=job_titles.get(item["job_id"]),
                    job_creator_id=creator_id,
                    applicant_username=user_data.get("username"),
                    applicant_email=user_data.get("email")
                ))
            return results
        except Exception as e:
            print(f"Error fetching applications for creator {creator_id}: {e}")
            return []

    def update_status(self, application_id: UUID, status: str) -> Application:
        try:
            response = supabase.table(self.table_name).update({"status": status}).eq("id", str(application_id)).execute()
            if response.data:
                return self.model(**response.data[0])
            raise Exception("Application not found")
        except Exception as e:
            print(f"Error updating application {application_id}: {e}")
            raise e

application_repository = ApplicationRepository(Application, "applications")


