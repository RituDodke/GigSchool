from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from app.core.logger import logger

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )
    
def add_exception_handlers(app: FastAPI):
    app.add_exception_handler(Exception, global_exception_handler)
