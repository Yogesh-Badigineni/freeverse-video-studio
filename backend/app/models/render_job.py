import uuid
from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, Field

RenderJobStatus = Literal["queued", "rendering", "completed", "failed", "cancelled"]

class RenderRequest(BaseModel):
    project_id: str
    quality: Literal["draft", "standard", "high"] = "standard"
    burn_subtitles: bool = True
    hardware_accel: Optional[str] = "auto"  # auto, nvenc, amf, qsv, cpu

class RenderStatus(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    status: RenderJobStatus = "queued"
    progress: float = 0.0
    current_step: str = "Initialized"
    output_filename: Optional[str] = None
    output_url: Optional[str] = None
    error_message: Optional[str] = None
    render_time_sec: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None

class AssetMeta(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_filename: str
    stored_filename: str
    file_path: str
    url: str
    mime_type: str
    size_bytes: int
    media_type: Literal["image", "video", "audio", "document"]
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PromptGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=5000)
    style: Literal["natural", "ai_generated", "cartoon", "educational", "social", "visualizer"] = "natural"
    target_duration: float = Field(default=20.0, ge=5.0, le=180.0)
    scene_count: Optional[int] = Field(default=4, ge=1, le=20)
    include_voiceover: bool = True
    child_safe: bool = True
    source_document: Optional[str] = None
