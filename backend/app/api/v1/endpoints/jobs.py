from typing import List, Optional, Any
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query, Depends
from supabase import Client
from app.api.deps import get_supabase_client, get_current_user
from app.schemas.job import JobCreate, JobUpdate, Job
from app.schemas.application import ApplicationCreate, Application
from app.services.job_service import job_service

router = APIRouter()

@router.post("/", response_model=Job)
def create_job(
    job_in: JobCreate,
    current_user: Any = Depends(get_current_user)
):
    """
    Create a new job posting.
    Requires authentication. Validates that creator_id matches logged-in user.
    """
    # Ensure the creator_id matches the authenticated user
    if str(job_in.creator_id) != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create job for another user"
        )
    
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
    Public endpoint - no auth required.
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
    Public endpoint - no auth required.
    """
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/{job_id}", response_model=Job)
def update_job(
    job_id: UUID,
    job_in: JobUpdate,
    current_user: Any = Depends(get_current_user),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Update a job (e.g., close it, change status).
    Requires authentication. Only job owner can update.
    """
    # Verify ownership
    existing_job = job_service.get_job(job_id)
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(existing_job.creator_id) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    
    try:
        job = job_service.update_job(job_id, job_in, client=supabase_client)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{job_id}")
def delete_job(
    job_id: UUID,
    current_user: Any = Depends(get_current_user),
    supabase_client: Client = Depends(get_supabase_client)
):
    """
    Delete a job posting.
    Requires authentication. Only job owner can delete.
    """
    # Verify ownership
    existing_job = job_service.get_job(job_id)
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(existing_job.creator_id) != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")
    
    success = job_service.delete_job(job_id, client=supabase_client)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or already deleted")
    return {"message": "Job deleted successfully"}

@router.post("/{job_id}/apply", response_model=Application)
def apply_to_job(
    job_id: UUID,
    application_in: ApplicationCreate,
    current_user: Any = Depends(get_current_user)
):
    """
    Apply to a job.
    Requires authentication. Validates applicant_id matches logged-in user.
    """
    if job_id != application_in.job_id:
        raise HTTPException(status_code=400, detail="Job ID mismatch")
    
    # Ensure applicant_id matches authenticated user
    if str(application_in.applicant_id) != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot apply on behalf of another user"
        )
    
    # Ensure user is not applying to their own job
    job = job_service.get_job(job_id)
    if job and str(job.creator_id) == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot apply to your own job"
        )
    
    try:
        return job_service.apply_to_job(application_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{job_id}/applications", response_model=List[Application])
def read_job_applications(
    job_id: UUID,
    current_user: Any = Depends(get_current_user)
):
    """
    View all applications for a job.
    Requires authentication. Only job owner can view applications.
    """
    # Verify the user owns this job
    job = job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if str(job.creator_id) != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view applications for this job"
        )
    
    return job_service.get_job_applications(job_id)

@router.patch("/applications/{application_id}", response_model=Application)
def update_application_status(
    application_id: UUID,
    status_update: dict,
    current_user: Any = Depends(get_current_user)
):
    """
    Update application status (ACCEPTED/REJECTED).
    Requires authentication. Only job owner can update application status.
    """
    try:
        status = status_update.get("status")
        if status not in ["ACCEPTED", "REJECTED"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        # Get the application to find the job
        application = job_service.get_application(application_id)
        
        # Get the job to verify ownership
        job = job_service.get_job(application.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if str(job.creator_id) != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update applications for this job"
            )
        
        return job_service.update_application_status(application_id, status)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
