from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional

from ..models.render_job import PromptGenerateRequest
from ..models.project import Project
from ..core.procedural_gen import generate_storyboard_from_prompt
from ..core.storage import save_project

router = APIRouter(prefix="/api/generator", tags=["generator"])

@router.post("/storyboard", response_model=Project)
def generate_project_storyboard(req: PromptGenerateRequest):
    """
    Creates a full multi-scene project from a natural language prompt,
    customized for the selected video style (Kids, Educational, Social, Natural, AI).
    """
    try:
        project = generate_storyboard_from_prompt(req)
        saved = save_project(project)
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate storyboard: {str(e)}")

@router.post("/document-storyboard", response_model=Project)
async def generate_from_document(
    file: UploadFile = File(...),
    style: str = Form("educational"),
    target_duration: float = Form(30.0)
):
    """
    Parses an uploaded text or markdown document to create an educational explainer video.
    """
    content = await file.read()
    try:
        text = content.decode("utf-8", errors="replace")
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot decode text document")

    # Generate prompt from first few sentences or filename
    title = file.filename or "Document Explainer"
    prompt_text = f"Explainer video based on {title}"

    req = PromptGenerateRequest(
        prompt=prompt_text,
        style=style if style in ["educational", "cartoon", "social", "natural", "ai_generated", "visualizer"] else "educational",
        target_duration=target_duration,
        scene_count=5,
        include_voiceover=True,
        source_document=text[:4000]
    )

    project = generate_storyboard_from_prompt(req)
    saved = save_project(project)
    return saved
