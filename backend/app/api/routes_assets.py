import uuid
import mimetypes
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from PIL import Image

from ..config import UPLOADS_DIR, SAMPLE_ASSETS_DIR
from ..models.render_job import AssetMeta
from ..core.security import sanitize_filename, validate_uploaded_file, resolve_safe_path
from ..core.storage import save_asset_meta, get_asset_meta, list_all_assets, delete_asset

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("", response_model=List[AssetMeta])
def get_assets():
    return list_all_assets()

@router.post("/upload", response_model=AssetMeta)
async def upload_asset(file: UploadFile = File(...)):
    raw_filename = file.filename or "uploaded_media"
    content_type = file.content_type
    
    # Read chunk to check size
    contents = await file.read()
    file_size = len(contents)
    
    media_type = validate_uploaded_file(raw_filename, content_type, file_size)
    clean_name = sanitize_filename(raw_filename)
    
    # Generate unique stored filename to avoid collision
    unique_prefix = uuid.uuid4().hex[:8]
    stored_filename = f"{unique_prefix}_{clean_name}"
    dest_path = resolve_safe_path(UPLOADS_DIR, stored_filename)
    
    # Save file
    with open(dest_path, "wb") as f:
        f.write(contents)
        
    # Inspect dimensions if image
    width, height = None, None
    if media_type == "image":
        try:
            with Image.open(dest_path) as img:
                width, height = img.size
        except Exception:
            pass
            
    asset_meta = AssetMeta(
        id=f"asset_{unique_prefix}",
        original_filename=raw_filename,
        stored_filename=stored_filename,
        file_path=str(dest_path),
        url=f"/api/assets/raw/{stored_filename}",
        mime_type=content_type or mimetypes.guess_type(dest_path)[0] or "application/octet-stream",
        size_bytes=file_size,
        media_type=media_type,
        width=width,
        height=height
    )
    
    save_asset_meta(asset_meta)
    return asset_meta

@router.get("/raw/{filename}")
def serve_raw_asset(filename: str, sample: bool = Query(default=False)):
    base_folder = SAMPLE_ASSETS_DIR if sample else UPLOADS_DIR
    try:
        safe_path = resolve_safe_path(base_folder, filename)
    except HTTPException:
        # Check other folder as fallback
        alt_folder = UPLOADS_DIR if sample else SAMPLE_ASSETS_DIR
        safe_path = resolve_safe_path(alt_folder, filename)

    if not safe_path.exists():
        raise HTTPException(status_code=404, detail="Asset file not found")
        
    mime, _ = mimetypes.guess_type(safe_path)
    return FileResponse(safe_path, media_type=mime or "application/octet-stream")

@router.delete("/{asset_id}")
def remove_asset(asset_id: str):
    success = delete_asset(asset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"status": "success", "message": f"Asset {asset_id} deleted"}
