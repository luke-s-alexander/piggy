from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="Piggy API", 
    version="0.1.0",
    description="Personal Finance Management API"
)

# CORS middleware for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Use config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Piggy API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}