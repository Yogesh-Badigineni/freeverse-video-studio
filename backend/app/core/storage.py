import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from PIL import Image, ImageDraw, ImageFont

from ..config import PROJECTS_DIR, UPLOADS_DIR, SAMPLE_ASSETS_DIR, STORAGE_DIR
from ..models.project import Project
from ..models.render_job import AssetMeta
from .security import resolve_safe_path

ASSET_INDEX_FILE = STORAGE_DIR / "assets_index.json"

def _load_asset_index() -> dict:
    if ASSET_INDEX_FILE.exists():
        try:
            with open(ASSET_INDEX_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_asset_index(index: dict):
    with open(ASSET_INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)

def save_asset_meta(meta: AssetMeta):
    index = _load_asset_index()
    index[meta.id] = meta.model_dump()
    _save_asset_index(index)

def get_asset_meta(asset_id: str) -> Optional[AssetMeta]:
    index = _load_asset_index()
    data = index.get(asset_id)
    if data:
        return AssetMeta(**data)
    return None

def list_all_assets() -> List[AssetMeta]:
    index = _load_asset_index()
    return [AssetMeta(**d) for d in index.values()]

def delete_asset(asset_id: str) -> bool:
    index = _load_asset_index()
    if asset_id in index:
        data = index.pop(asset_id)
        _save_asset_index(index)
        file_path = Path(data["file_path"])
        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass
        return True
    return False

# Project persistence
def save_project(project: Project) -> Project:
    project.updated_at = datetime.now(timezone.utc).isoformat()
    file_path = resolve_safe_path(PROJECTS_DIR, f"{project.id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(project.model_dump(), f, indent=2)
    return project

def load_project(project_id: str) -> Optional[Project]:
    try:
        file_path = resolve_safe_path(PROJECTS_DIR, f"{project_id}.json")
        if not file_path.exists():
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return Project(**data)
    except Exception:
        return None

def list_projects() -> List[Project]:
    projects = []
    for file_path in PROJECTS_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                projects.append(Project(**data))
        except Exception:
            continue
    projects.sort(key=lambda p: p.updated_at, reverse=True)
    return projects

def delete_project(project_id: str) -> bool:
    try:
        file_path = resolve_safe_path(PROJECTS_DIR, f"{project_id}.json")
        if file_path.exists():
            file_path.unlink()
            return True
    except Exception:
        pass
    return False

# Initializer for sample demonstration assets (100% copyright-free procedural images)
def init_sample_assets_if_empty():
    """Create starter sample graphics and assets if none exist."""
    sample_images = [
        ("sample_nature.png", "Scenic Mountain Horizon", "#1E3C72", "#2A5298", "EXPLORE NATURE"),
        ("sample_tech.png", "Future AI Tech Lab", "#0F2027", "#2C5364", "ARTIFICIAL INTELLIGENCE"),
        ("sample_cartoon.png", "Sunny Meadow Adventure", "#FF7043", "#FFCA28", "SUNNY DAY ADVENTURE"),
        ("sample_promo.png", "Special Product Showcase", "#4A00E0", "#8E2DE2", "SPECIAL LAUNCH 2026"),
        ("sample_edu.png", "Science & Discovery", "#11998E", "#38EF7D", "SCIENCE EXPLAINER")
    ]
    
    for filename, title, col1, col2, text in sample_images:
        dest = SAMPLE_ASSETS_DIR / filename
        if not dest.exists():
            try:
                # Generate clean 1920x1080 gradient image with title badge
                img = Image.new("RGB", (1920, 1080), color=col1)
                draw = ImageDraw.Draw(img)
                # Linear gradient
                for y in range(1080):
                    ratio = y / 1080.0
                    r1, g1, b1 = int(col1[1:3], 16), int(col1[3:5], 16), int(col1[5:7], 16)
                    r2, g2, b2 = int(col2[1:3], 16), int(col2[3:5], 16), int(col2[5:7], 16)
                    r = int(r1 + (r2 - r1) * ratio)
                    g = int(g1 + (g2 - g1) * ratio)
                    b = int(b1 + (b2 - b1) * ratio)
                    draw.line([(0, y), (1920, y)], fill=(r, g, b))
                
                # Decorative geometric elements
                draw.rectangle([100, 100, 1820, 980], outline=(255, 255, 255, 60), width=4)
                draw.rectangle([140, 140, 400, 200], fill=(0, 0, 0, 120))
                
                # Big central badge
                draw.rounded_rectangle([460, 440, 1460, 640], radius=24, fill=(0, 0, 0, 140), outline=(255, 255, 255, 100), width=3)
                
                # Center text
                draw.text((960, 520), text, fill=(255, 255, 255), anchor="mm")
                draw.text((960, 580), title, fill=(200, 220, 255), anchor="mm")
                
                img.save(dest, "PNG")
                
                # Index in asset library
                meta_id = f"sample_{dest.stem}"
                save_asset_meta(AssetMeta(
                    id=meta_id,
                    original_filename=filename,
                    stored_filename=filename,
                    file_path=str(dest),
                    url=f"/api/assets/raw/{filename}?sample=true",
                    mime_type="image/png",
                    size_bytes=dest.stat().st_size,
                    media_type="image",
                    width=1920,
                    height=1080
                ))
            except Exception as e:
                print(f"Sample generation error: {e}")
