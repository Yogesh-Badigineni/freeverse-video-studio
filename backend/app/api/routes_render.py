import time
import uuid
import threading
import shutil
from pathlib import Path
from typing import Dict, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from ..config import RENDERS_DIR
from ..models.render_job import RenderRequest, RenderStatus
from ..core.storage import load_project
from ..core.ffmpeg_engine import (
    get_dimension_for_aspect_and_res,
    build_scene_video_clip,
    concatenate_scenes_with_transitions,
    combine_video_and_audio
)
from ..core.security import resolve_safe_path

router = APIRouter(prefix="/api/render", tags=["render"])

# In-memory store for render job statuses
RENDER_JOBS: Dict[str, RenderStatus] = {}

def execute_render_job(job_id: str, req: RenderRequest):
    """Executes the end-to-end video rendering pipeline in a background thread."""
    status = RENDER_JOBS[job_id]
    temp_dir = RENDERS_DIR / f"temp_{job_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    start_time = time.time()

    try:
        status.status = "rendering"
        status.progress = 5.0
        status.current_step = "Loading project and assets..."

        project = load_project(req.project_id)
        if not project or not project.scenes:
            raise ValueError("Project not found or contains no scenes")

        # 1. Resolve dimensions
        width, height = get_dimension_for_aspect_and_res(project.aspect_ratio, project.resolution)
        fps = project.fps

        status.progress = 15.0
        status.current_step = f"Configuring target output: {width}x{height} @ {fps}fps..."

        # 2. Render each scene clip
        scene_clips = []
        total_scenes = len(project.scenes)
        
        for idx, scene in enumerate(project.scenes):
            if status.status == "cancelled":
                return
            
            step_pct = 20.0 + (idx / total_scenes) * 50.0
            status.progress = round(step_pct, 1)
            status.current_step = f"Rendering Scene {idx+1}/{total_scenes}: {scene.title}..."

            clip_path = build_scene_video_clip(
                scene=scene,
                width=width,
                height=height,
                fps=fps,
                temp_dir=temp_dir,
                scene_index=idx
            )
            scene_clips.append(clip_path)

        # 3. Concatenate scenes
        status.progress = 75.0
        status.current_step = "Merging scenes and transitions..."
        
        concat_video_path = temp_dir / "scenes_merged.mp4"
        concatenate_scenes_with_transitions(
            scene_clips=scene_clips,
            scenes=project.scenes,
            output_path=concat_video_path,
            fps=fps
        )

        # 4. Mix Audio
        status.progress = 85.0
        status.current_step = "Synthesizing audio tracks and mixing voiceovers..."

        total_video_duration = sum(s.duration for s in project.scenes)
        final_mp4_filename = f"freeverse_{project.id[:8]}_{int(time.time())}.mp4"
        final_mp4_path = RENDERS_DIR / final_mp4_filename

        combine_video_and_audio(
            video_path=concat_video_path,
            audio_tracks=project.audio_tracks,
            total_duration=total_video_duration,
            output_final_mp4=final_mp4_path,
            temp_dir=temp_dir
        )

        # 5. Complete
        status.progress = 100.0
        status.status = "completed"
        status.current_step = "Rendering finished successfully!"
        status.output_filename = final_mp4_filename
        status.output_url = f"/api/render/download/{final_mp4_filename}"
        status.render_time_sec = round(time.time() - start_time, 2)
        status.completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    except Exception as e:
        status.status = "failed"
        status.error_message = str(e)
        status.current_step = f"Rendering error: {str(e)}"
    finally:
        # Cleanup temp directory
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass

@router.post("/start", response_model=RenderStatus)
def start_render(req: RenderRequest, background_tasks: BackgroundTasks):
    project = load_project(req.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project.scenes:
        raise HTTPException(status_code=400, detail="Cannot render a project with zero scenes")

    job_id = str(uuid.uuid4())
    status = RenderStatus(
        job_id=job_id,
        project_id=req.project_id,
        status="queued",
        progress=0.0,
        current_step="Queued for processing"
    )
    RENDER_JOBS[job_id] = status

    # Run in background thread
    thread = threading.Thread(target=execute_render_job, args=(job_id, req), daemon=True)
    thread.start()

    return status

@router.get("/status/{job_id}", response_model=RenderStatus)
def get_render_status(job_id: str):
    if job_id not in RENDER_JOBS:
        raise HTTPException(status_code=404, detail="Render job not found")
    return RENDER_JOBS[job_id]

@router.post("/cancel/{job_id}")
def cancel_render(job_id: str):
    if job_id not in RENDER_JOBS:
        raise HTTPException(status_code=404, detail="Render job not found")
    RENDER_JOBS[job_id].status = "cancelled"
    RENDER_JOBS[job_id].current_step = "Render cancelled by user"
    return {"status": "cancelled", "job_id": job_id}

@router.get("/download/{filename}")
def download_rendered_video(filename: str):
    safe_path = resolve_safe_path(RENDERS_DIR, filename)
    if not safe_path.exists():
        raise HTTPException(status_code=404, detail="Rendered video not found")
    return FileResponse(
        safe_path,
        media_type="video/mp4",
        filename=filename,
        headers={"Accept-Ranges": "bytes"}
    )
