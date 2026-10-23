import uuid
from typing import List
from fastapi import APIRouter, HTTPException

from ..models.project import Project, ProjectCreate, ProjectUpdate, Scene
from ..core.storage import save_project, load_project, list_projects, delete_project

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[Project])
def get_all_projects():
    return list_projects()

@router.post("", response_model=Project)
def create_new_project(payload: ProjectCreate):
    # Initialize with default sample scene
    default_scene = Scene(
        id=f"scene_{uuid.uuid4().hex[:8]}",
        title="Opening Scene",
        duration=4.0,
        text_overlay="Welcome to FreeVerse Video Studio",
        text_position="bottom",
        transition="fade",
        transition_duration=0.5,
        motion_effect="ken_burns_zoom_in",
        order=0
    )
    
    project = Project(
        title=payload.title,
        description=payload.description or "",
        style=payload.style,
        aspect_ratio=payload.aspect_ratio,
        resolution=payload.resolution,
        fps=payload.fps,
        scenes=[default_scene]
    )
    return save_project(project)

@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str):
    project = load_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=Project)
def update_existing_project(project_id: str, payload: ProjectUpdate):
    project = load_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
        
    return save_project(project)

@router.delete("/{project_id}")
def remove_project(project_id: str):
    success = delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": f"Project {project_id} deleted"}

@router.post("/{project_id}/duplicate", response_model=Project)
def duplicate_project(project_id: str):
    original = load_project(project_id)
    if not original:
        raise HTTPException(status_code=404, detail="Project not found")
        
    new_data = original.model_dump()
    new_data["id"] = str(uuid.uuid4())
    new_data["title"] = f"{original.title} (Copy)"
    new_project = Project(**new_data)
    return save_project(new_project)
