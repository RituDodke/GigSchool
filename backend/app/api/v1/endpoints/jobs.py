from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from app.schemas.job import JobCreate, JobUpdate, Job
from app.schemas.application import ApplicationCreate, Application
from app.services.job_service import job_service

router = APIRouter()

@router.post("/", response_model=Job)
def create_job(job_in: JobCreate):
    """
    Create a new job posting.
    """
    try:
        return job_service.create_job(job_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Job])
def read_jobs(
    group_id: Optional[str] = Query(None, description="Group ID to filter by"),
    creator_id: Optional[str] = Query(None, description="Creator ID to filter by")
):
    """
    Get all jobs. Filter by group or creator if provided.
    """
    if creator_id:
        return job_service.get_jobs_by_creator(creator_id)
    if group_id:
        return job_service.get_jobs_by_group(group_id)
    return job_service.get_all_jobs()

@router.get("/{job_id}", response_model=Job)
def read_job(job_id: UUID):
    """
    Get a specific job by ID.
    """
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=Job)
def update_job(job_id: UUID, job_in: JobUpdate):
    """
    Update a job (e.g., close it, change status).
    """
    try:
        job = job_service.update_job(job_id, job_in)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{job_id}")
def delete_job(job_id: UUID):
    """
    Delete a job posting.
    """
    success = job_service.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or already deleted")
    return {"message": "Job deleted successfully"}

@router.post("/{job_id}/apply", response_model=Application)
def apply_to_job(job_id: UUID, application_in: ApplicationCreate):
    """
    Apply to a job.
    """
    if job_id != application_in.job_id:
         raise HTTPException(status_code=400, detail="Job ID mismatch")
    
    try:
        return job_service.apply_to_job(application_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{job_id}/applications", response_model=List[Application])
def read_job_applications(job_id: UUID):
    """
    View all applications for a job (Owner only - Auth TODO).
    """
    return job_service.get_job_applications(job_id)

