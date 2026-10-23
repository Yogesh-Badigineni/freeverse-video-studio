# FreeVerse Video Studio Architecture

## System Overview
FreeVerse Video Studio is designed as a local-first modular desktop & web application. It combines a reactive browser interface with a high-performance Python media engine and static FFmpeg binary.

```
┌─────────────────────────────────────────────────────────────┐
│                   FreeVerse Studio UI                       │
│    (React 19 + TypeScript + Vite + Glassmorphic Design)    │
│  - Video Styles Gallery (6 Workflows)                       │
│  - Smart Prompt Studio & Document Ingestion                 │
│  - Real-Time Preview Canvas & Ken Burns Animator            │
│  - Multi-Track Timeline & Audio Synchronizer                │
│  - Local AI Hub & Hardware Diagnostics                      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (127.0.0.1:8000)
┌──────────────────────────────▼──────────────────────────────┐
│                FastAPI Media Engine Backend                 │
│  - Security Gate: Path Sanitization, Mime Check, No Shell   │
│  - Procedural Storyboard & Scene Card Synthesizer           │
│  - Local Model Hub Adapter (Ollama, ComfyUI, Piper TTS)     │
│  - Project Persistence (JSON / SQLite schema)               │
│  - Background Render Queue & Progress Tracker               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Subprocess (`shell=False`)
┌──────────────────────────────▼──────────────────────────────┐
│                    FFmpeg 7.1 Engine                        │
│  - Multi-resolution scaling & aspect ratio padding          │
│  - Ken Burns motion filtergraphs (`zoompan`, `scale`)       │
│  - Alpha text overlays & burned-in subtitle boxes           │
│  - Multi-stream audio mixing (`amix`, `afade`, `adelay`)    │
│  - Playable H.264 / AAC MP4 file generation                 │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure
```
freeverse-video-studio/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & security middleware
│   │   ├── config.py            # Dynamic FFmpeg resolution & path settings
│   │   ├── models/              # Pydantic schemas (Project, Scene, Asset, Render)
│   │   ├── core/
│   │   │   ├── security.py      # Path traversal shield & MIME validation
│   │   │   ├── ffmpeg_engine.py # Video composition & filtergraph builder
│   │   │   ├── procedural_gen.py# Smart prompt & document storyboard generator
│   │   │   ├── local_ai_manager.py # Local model discovery & hardware check
│   │   │   └── storage.py       # Persistence & starter asset generation
│   │   └── api/                 # API endpoints (projects, assets, render, models)
│   ├── tests/                   # Pytest test suite (Security, FFmpeg, API)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # React UI components (Canvas, Storyboard, Timeline)
│   │   ├── services/            # API client layer
│   │   ├── types/               # TypeScript data definitions
│   │   └── index.css            # Dark glassmorphic design system
│   ├── package.json
│   └── vite.config.ts           # Server proxy configuration
├── showcase_website/            # Public static showcase website
├── run_studio.bat               # Windows batch launcher
├── run_studio.ps1               # Windows PowerShell launcher
├── start_studio.py              # Cross-platform Python launcher
├── README.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
└── TROUBLESHOOTING.md
```

## Media Processing Pipeline
1. **Scene Rasterization**: If an image is provided or generated, an individual MP4 video segment is produced with target FPS and Ken Burns camera movements (`zoompan`).
2. **Text Overlay**: Rendered as crisp alpha PNGs and layered via FFmpeg's `overlay` filter, ensuring 100% platform independence without font missing glitches.
3. **Concatenation**: Segments are stitched seamlessly using FFmpeg concat demuxer.
4. **Audio Mixing**: Background music, voiceover recordings, and sound effects are combined via FFmpeg `amix` filtergraph with volume scaling, smooth fades, and voice ducking.
5. **Final Output**: Playable standard H.264 video with AAC stereo audio in MP4 container.
