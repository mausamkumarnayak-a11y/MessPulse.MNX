from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
# Import all models to ensure metadata registration
import app.models.entities

from app.api import (
    auth, slots, ratings, skips, waste, insights, actions, public, tour, help
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize schema tables if they do not exist
    Base.metadata.create_all(bind=engine)
    # Auto-seed initial demo data if empty (e.g. for Render fresh deploy)
    try:
        from seed import seed_database
        seed_database()
    except Exception as e:
        print(f"Database seed notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="MessPulse: student-first web platform turning mess feedback, skipped meals and measured leftovers into less food waste and better meals.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

# CORS configuration
origins = settings.cors_origin_list
allow_all = "*" in origins or settings.ENVIRONMENT == "production"

if allow_all:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Root & Health Check
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "operational",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": settings.PROJECT_NAME
    }

# Register API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(slots.router, prefix=api_v1_prefix)
app.include_router(ratings.router, prefix=api_v1_prefix)
app.include_router(skips.router, prefix=api_v1_prefix)
app.include_router(waste.router, prefix=api_v1_prefix)
app.include_router(insights.router, prefix=api_v1_prefix)
app.include_router(actions.router, prefix=api_v1_prefix)
app.include_router(public.router, prefix=api_v1_prefix)
app.include_router(tour.router, prefix=api_v1_prefix)
app.include_router(help.router, prefix=api_v1_prefix)
