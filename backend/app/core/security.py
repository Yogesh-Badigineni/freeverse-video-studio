import re
from pathlib import Path
from typing import Optional
from fastapi import HTTPException
from PIL import Image

from ..config import ALLOWED_EXTENSIONS, ALLOWED_MIME_PREFIXES, MAX_UPLOAD_SIZE_BYTES

# Strict filename regex: only alphanumeric, dash, underscore, dot
SAFE_FILENAME_RE = re.compile(r'[^a-zA-Z0-9_\-\.]')

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and injection attacks."""
    if not filename:
        return "unnamed_asset"
    
    # Strip path separators
    clean_name = Path(filename).name
    # Remove any null bytes
    clean_name = clean_name.replace('\x00', '')
    # Replace unsafe characters with underscore
    clean_name = SAFE_FILENAME_RE.sub('_', clean_name)
    # Remove leading dots or dashes
    clean_name = clean_name.lstrip('.-')
    
    if not clean_name:
        clean_name = "asset"
    # Truncate length
    if len(clean_name) > 100:
        ext = Path(clean_name).suffix
        clean_name = clean_name[:90] + ext
        
    return clean_name

def resolve_safe_path(base_directory: Path, untrusted_filename: str) -> Path:
    """
    Safely resolve a file path within a trusted base directory.
    Guarantees that the resulting canonical path cannot escape base_directory.
    Raises HTTPException 400 on traversal attempt.
    """
    safe_name = sanitize_filename(untrusted_filename)
    resolved_path = (base_directory / safe_name).resolve()
    base_resolved = base_directory.resolve()
    
    try:
        resolved_path.relative_to(base_resolved)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path: Path traversal attempt detected")
        
    return resolved_path

def validate_uploaded_file(filename: str, content_type: Optional[str], file_size: int) -> str:
    """
    Validates file extension, MIME type, and size.
    Returns media_type: 'image', 'video', 'audio', or 'document'.
    """
    if file_size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB"
        )
        
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
        
    # Check mime prefix if provided
    if content_type:
        has_valid_prefix = any(content_type.startswith(p) for p in ALLOWED_MIME_PREFIXES)
        if not has_valid_prefix:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported media type '{content_type}'"
            )
            
    # Classify media type
    if ext in [".png", ".jpg", ".jpeg", ".webp"]:
        return "image"
    elif ext in [".mp4", ".webm", ".mov"]:
        return "video"
    elif ext in [".mp3", ".wav", ".ogg", ".aac"]:
        return "audio"
    elif ext in [".txt", ".md", ".json"]:
        return "document"
    else:
        return "document"

def verify_image_integrity(file_path: Path) -> bool:
    """Check that an image file can actually be parsed by PIL and is not a disguised payload."""
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False
