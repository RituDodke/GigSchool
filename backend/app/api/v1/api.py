from fastapi import APIRouter
from app.api.v1.endpoints import auth, jobs

api_router = APIRouter()

@api_router.get("/")
def api_health_check():
    return {"status": "ok", "message": "API v1 is running"}

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
