from fastapi import APIRouter
from typing import List, Dict, Any

from ..core.local_ai_manager import check_local_model_statuses, get_system_hardware_info

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("", response_model=List[Dict[str, Any]])
def get_supported_models():
    """Returns catalog of supported local AI models, licenses, and installation status."""
    return check_local_model_statuses()

@router.get("/hardware")
def get_hardware_diagnostics():
    """Returns local system diagnostics, CPU/RAM info, and FFmpeg verification."""
    return get_system_hardware_info()
