from typing import List, Optional
from uuid import UUID
from app.schemas.job import JobCreate, JobUpdate, Job
from app.schemas.application import ApplicationCreate, Application
from app.repositories.job_repository import job_repository
from app.repositories.application_repository import application_repository

class JobService:
    def create_job(self, job_in: JobCreate) -> Job:
        return job_repository.create(job_in)

    def get_jobs_by_group(self, group_id: str) -> List[Job]:
        return job_repository.get_by_group(group_id)

    def get_all_jobs(self) -> List[Job]:
        return job_repository.get_all()

    def get_job(self, job_id: UUID) -> Optional[Job]:
        return job_repository.get(job_id)

    def update_job(self, job_id: UUID, job_in: JobUpdate) -> Optional[Job]:
        return job_repository.update(job_id, job_in)

    def delete_job(self, job_id: UUID) -> bool:
        return job_repository.delete(job_id)

    def apply_to_job(self, application_in: ApplicationCreate) -> Application:
        # Business logic: Check if job exists, check if already applied?
        # For now, just create.
        return application_repository.create(application_in)

    def get_job_applications(self, job_id: UUID) -> List[Application]:
        return application_repository.get_by_job(job_id)

job_service = JobService()

