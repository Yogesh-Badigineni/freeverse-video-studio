import uuid
from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

VideoStyle = Literal["natural", "ai_generated", "cartoon", "educational", "social", "visualizer"]
AspectRatio = Literal["16:9", "9:16", "1:1", "4:5"]
Resolution = Literal["720p", "1080p", "4k"]
TransitionType = Literal["none", "fade", "dissolve", "slideleft", "slideright", "wipeleft", "zoomin", "bounce"]
MotionType = Literal["none", "ken_burns_zoom_in", "ken_burns_zoom_out", "pan_left", "pan_right", "tilt_up", "cartoon_bounce"]
AudioType = Literal["music", "voiceover", "sfx"]

class Scene(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = "Scene"
    duration: float = Field(default=4.0, ge=0.5, le=120.0)
    asset_id: Optional[str] = None
    asset_url: Optional[str] = None
    text_overlay: Optional[str] = None
    text_position: Literal["top", "center", "bottom", "custom"] = "bottom"
    text_color: str = "#FFFFFF"
    text_bg: Optional[str] = "rgba(0,0,0,0.6)"
    font_size: int = 36
    transition: TransitionType = "fade"
    transition_duration: float = Field(default=0.5, ge=0.0, le=3.0)
    motion_effect: MotionType = "ken_burns_zoom_in"
    voiceover_text: Optional[str] = None
    background_color: str = "#1A1A24"
    order: int = 0

class AudioTrack(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = "Audio Track"
    asset_id: Optional[str] = None
    asset_url: Optional[str] = None
    type: AudioType = "music"
    start_time: float = Field(default=0.0, ge=0.0)
    duration: Optional[float] = None
    volume: float = Field(default=1.0, ge=0.0, le=2.0)
    fade_in: float = Field(default=0.5, ge=0.0, le=10.0)
    fade_out: float = Field(default=1.0, ge=0.0, le=10.0)
    ducking: bool = False

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = "Untitled Video Project"
    description: str = ""
    style: VideoStyle = "natural"
    aspect_ratio: AspectRatio = "16:9"
    resolution: Resolution = "1080p"
    fps: int = Field(default=30, ge=15, le=60)
    scenes: List[Scene] = Field(default_factory=list)
    audio_tracks: List[AudioTrack] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    title: str = "New Video Project"
    description: Optional[str] = ""
    style: VideoStyle = "natural"
    aspect_ratio: AspectRatio = "16:9"
    resolution: Resolution = "1080p"
    fps: int = 30

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    style: Optional[VideoStyle] = None
    aspect_ratio: Optional[AspectRatio] = None
    resolution: Optional[Resolution] = None
    fps: Optional[int] = None
    scenes: Optional[List[Scene]] = None
    audio_tracks: Optional[List[AudioTrack]] = None
