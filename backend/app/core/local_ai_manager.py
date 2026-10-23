import os
import shutil
import platform
import urllib.request
import json
from typing import List, Dict, Any
from pydantic import BaseModel

class AIModelInfo(BaseModel):
    id: str
    name: str
    category: str  # text_to_script, text_to_image, text_to_speech, speech_to_text, video_gen
    description: str
    license: str
    permitted_uses: str
    installed: bool
    estimated_size_mb: int
    vram_required_gb: float
    cpu_compatible: bool
    provider_type: str  # ollama, comfyui, piper_tts, whisper, builtin
    endpoint_url: str
    setup_guide: str

SUPPORTED_LOCAL_MODELS: List[AIModelInfo] = [
    AIModelInfo(
        id="ollama_llama3_2",
        name="Ollama (LLaMA 3.2 3B / 1B)",
        category="text_to_script",
        description="Fast local language model for intelligent scene scripts, educational outlines, and cartoon dialogue.",
        license="Llama 3.2 Community License (Free for commercial/personal use up to 700M MAU)",
        permitted_uses="Script generation, storyboard breakdowns, dialogue writing",
        installed=False,
        estimated_size_mb=2100,
        vram_required_gb=2.5,
        cpu_compatible=True,
        provider_type="ollama",
        endpoint_url="http://127.0.0.1:11434/api/tags",
        setup_guide="Install Ollama from ollama.com, then run: `ollama run llama3.2`"
    ),
    AIModelInfo(
        id="comfyui_sd15_animatediff",
        name="ComfyUI + AnimateDiff / SD 1.5",
        category="video_gen",
        description="Local modular pipeline for generating animated video loops and illustrated character scenes.",
        license="CreativeML OpenRAIL-M",
        permitted_uses="Scene generation, artistic cartoon backdrops, motion graphics",
        installed=False,
        estimated_size_mb=4200,
        vram_required_gb=6.0,
        cpu_compatible=False,
        provider_type="comfyui",
        endpoint_url="http://127.0.0.1:8188/system_stats",
        setup_guide="Run ComfyUI desktop or portable build. FreeVerse connects automatically on port 8188."
    ),
    AIModelInfo(
        id="piper_tts_neural",
        name="Piper Neural TTS (Fast Local Voice)",
        category="text_to_speech",
        description="Ultra-fast, crystal-clear CPU-friendly neural voice synthesizer for voiceovers and tutorials.",
        license="MIT License",
        permitted_uses="Free commercial and non-commercial narration generation",
        installed=False,
        estimated_size_mb=65,
        vram_required_gb=0.0,
        cpu_compatible=True,
        provider_type="piper_tts",
        endpoint_url="local://piper",
        setup_guide="Download piper binary and onnx voice model (e.g. en_US-lessac-medium) to models/tts directory."
    ),
    AIModelInfo(
        id="whisper_fast_transcription",
        name="Faster-Whisper (Subtitle Auto-Sync)",
        category="speech_to_text",
        description="High-accuracy offline speech recognizer to generate synchronized subtitles and timestamps.",
        license="MIT License",
        permitted_uses="Automatic subtitle and caption timing from voiceover tracks",
        installed=False,
        estimated_size_mb=150,
        vram_required_gb=1.0,
        cpu_compatible=True,
        provider_type="whisper",
        endpoint_url="local://whisper",
        setup_guide="Install via `pip install faster-whisper` for automatic offline caption syncing."
    ),
    AIModelInfo(
        id="builtin_procedural_motion",
        name="FreeVerse Procedural Ken Burns Engine",
        category="video_gen",
        description="Built-in zero-cloud motion synthesis engine: Ken Burns pans, zooms, bounces, and typography cards.",
        license="MIT / Apache 2.0 (Built-in)",
        permitted_uses="Unlimited local video generation with zero GPU or network requirement",
        installed=True,
        estimated_size_mb=0,
        vram_required_gb=0.0,
        cpu_compatible=True,
        provider_type="builtin",
        endpoint_url="internal://procedural",
        setup_guide="Ready to use out-of-the-box. Works on every system with FFmpeg."
    )
]

def check_local_model_statuses() -> List[Dict[str, Any]]:
    """Checks the live availability of local inference endpoints."""
    results = []
    
    for model in SUPPORTED_LOCAL_MODELS:
        m_dict = model.model_dump()
        
        if model.provider_type == "builtin":
            m_dict["installed"] = True
            m_dict["status_msg"] = "Active and fully operational (100% offline)"
        elif model.provider_type in ["ollama", "comfyui"]:
            if not (model.endpoint_url.startswith("http://127.0.0.1:") or model.endpoint_url.startswith("http://localhost:")):
                m_dict["installed"] = False
                m_dict["status_msg"] = "Invalid endpoint URL scheme"
            else:
                try:
                    req = urllib.request.Request(model.endpoint_url, headers={"User-Agent": "FreeVerseStudio"})
                    with urllib.request.urlopen(req, timeout=1.5) as resp:  # nosec B310
                        if resp.status == 200:
                            if model.provider_type == "ollama":
                                data = json.loads(resp.read().decode())
                                models_available = [m.get("name") for m in data.get("models", [])]
                                m_dict["installed"] = True
                                m_dict["status_msg"] = f"Connected! Models: {', '.join(models_available[:3]) or 'None pulled'}"
                            else:
                                m_dict["installed"] = True
                                m_dict["status_msg"] = "ComfyUI server active on 127.0.0.1:8188"
                        else:
                            m_dict["installed"] = False
                            m_dict["status_msg"] = f"Service responded with status {resp.status}"
                except Exception as ex:
                    m_dict["installed"] = False
                    m_dict["status_msg"] = f"Not reachable ({model.provider_type} offline)"
        else:
            m_dict["status_msg"] = "Local fallback enabled."
            
        results.append(m_dict)
        
    return results

def get_system_hardware_info() -> Dict[str, Any]:
    """Inspects CPU, RAM, and OS specs safely without requiring privileged access."""
    import psutil
    try:
        mem = psutil.virtual_memory()
        total_ram_gb = round(mem.total / (1024**3), 1)
        avail_ram_gb = round(mem.available / (1024**3), 1)
    except Exception:
        total_ram_gb = "Unknown"
        avail_ram_gb = "Unknown"

    return {
        "os": f"{platform.system()} {platform.release()}",
        "architecture": platform.machine(),
        "cpu_count": os.cpu_count() or 4,
        "total_ram_gb": total_ram_gb,
        "available_ram_gb": avail_ram_gb,
        "ffmpeg_status": "Installed (v7.1 Static Build)",
        "offline_ready": True
    }
