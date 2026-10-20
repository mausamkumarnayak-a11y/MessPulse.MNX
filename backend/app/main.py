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
@app.get("/api", tags=["Health"])
@app.get("/api/v1/status", tags=["Health"])
def api_status():
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

# Static Frontend SPA Serving (Single-Container Production on Render)
import os
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from fastapi import HTTPException

dist_candidates = [
    "/app/frontend_dist",
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist"),
]

frontend_dist_dir = None
for candidate in dist_candidates:
    if os.path.isdir(candidate) and os.path.isfile(os.path.join(candidate, "index.html")):
        frontend_dist_dir = candidate
        break

if frontend_dist_dir:
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static_assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
            raise HTTPException(status_code=404, detail="Not Found")
        target_file = os.path.join(frontend_dist_dir, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist_dir, "index.html"))
else:
    @app.get("/", tags=["Health"])
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "status": "operational",
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
            "docs": "/docs"
        }
