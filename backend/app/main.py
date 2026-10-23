from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import CORS_ORIGINS, HOST, PORT, FFMPEG_EXE
from .core.storage import init_sample_assets_if_empty
from .api.routes_projects import router as projects_router
from .api.routes_assets import router as assets_router
from .api.routes_generator import router as generator_router
from .api.routes_render import router as render_router
from .api.routes_models import router as models_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure starter procedural sample assets exist
    try:
        init_sample_assets_if_empty()
    except Exception as e:
        print(f"Warning initializing starter assets: {e}")
    yield
    # Shutdown logic if any

app = FastAPI(
    title="FreeVerse Video Studio API",
    description="High-performance, secure, local-first video generation and editing engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Strict loopback CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Register API Routers
app.include_router(projects_router)
app.include_router(assets_router)
app.include_router(generator_router)
app.include_router(render_router)
app.include_router(models_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FreeVerse Video Studio Engine",
        "ffmpeg": "available" if FFMPEG_EXE else "missing",
        "ffmpeg_path": FFMPEG_EXE,
        "mode": "local_first_zero_cost"
    }

@app.get("/api/info")
def studio_info():
    return {
        "name": "FreeVerse Video Studio",
        "version": "1.0.0",
        "license": "Apache 2.0 / MIT (Open Source)",
        "features": [
            "Natural Video Editing",
            "Prompt-to-Storyboard AI",
            "Kids Cartoon & Animated Stories",
            "Educational & Explainer Video Ingestion",
            "Social Media 9:16 Shorts / Reels Presets",
            "Local Model Hub (Ollama, ComfyUI, Piper TTS)",
            "Ken Burns Procedural Motion Engine",
            "Real Playable MP4 Video Export via FFmpeg"
        ]
    }
