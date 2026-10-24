# FreeVerse Video Studio

<p align="center">
  <img src="https://raw.githubusercontent.com/freeverse-video/freeverse-video-studio/main/showcase_website/assets/banner.png" alt="FreeVerse Video Studio Banner" width="100%" />
</p>

<p align="center">
  <strong>The 100% Free, Open-Source, Private, AI-Powered Video Creation Application</strong><br>
  Create natural and cinematic videos, AI storyboards, kids' cartoons, educational lessons, and social shorts — with real FFmpeg rendering on your own computer.
</p>

<p align="center">
  <a href="#license"><img src="https://img.shields.io/badge/license-Apache_2.0-blue.svg" alt="License"></a>
  <a href="#security"><img src="https://img.shields.io/badge/security-OWASP_Hardened-emerald.svg" alt="Security"></a>
  <a href="#tests"><img src="https://img.shields.io/badge/tests-8%2F8_passing-success.svg" alt="Tests"></a>
  <a href="#cost"><img src="https://img.shields.io/badge/cost-100%25_Free_&_Zero_Cloud_Fees-purple.svg" alt="Cost"></a>
  <a href="#local-ai"><img src="https://img.shields.io/badge/AI-100%25_Local_&_Offline_Ready-cyan.svg" alt="Local AI"></a>
</p>

---

## 🌟 Highlights & Philosophy

- **Zero Mandatory Cost**: No monthly subscriptions, no paid credits, no cloud rendering fees, and no artificial trial expiration.
- **Local-First & Private**: Renders videos entirely on your local machine using a static FFmpeg engine. Media files and prompts never leave your PC.
- **6 Dedicated Video Workflows**:
  1. **Natural & Pro Video Editing**: Multi-clip timeline, trimming, transitions, audio mixing, 16:9 / 9:16 / 1:1 aspect ratios, custom 720p / 1080p / 4K resolution.
  2. **AI Script-to-Video Engine**: Natural language prompt breakdown, procedural scene cards, Ken Burns camera movements (zoom, pan, tilt), and narration timing.
  3. **Kids' Cartoons & Stories**: Bouncy 2D camera animation, storybook titles, character narration, and strict child-safe filtering.
  4. **Educational & Explainer Lessons**: Ingest TXT and Markdown study documents to extract lesson slides, bullet points, and instructional voiceovers.
  5. **Social Media Shorts & Reels (9:16)**: Fast-paced vertical formats with 3-second hook structures and call-to-action badges.
  6. **Music Visualizers & Audio Ducking**: Rhythm-synced video cuts, photo slideshows, and automatic music ducking during voiceover narration.
- **Local AI Model Hub**: Connect optional local runtimes (Ollama, ComfyUI, Piper Neural TTS, Faster-Whisper) with zero cloud fees.
- **Real Playable MP4 Video**: Produces genuine high-definition MP4 video files with H.264 video and AAC audio.

---

## 🚀 Quick Start (One-Click Launch)

### Windows (One-Click)
Double-click `run_studio.bat` or run:
```powershell
.\run_studio.ps1
```

### macOS / Linux / Cross-Platform
```bash
python start_studio.py
```

The studio will start the backend engine on `127.0.0.1:8000`, the frontend on `127.0.0.1:5173`, and automatically open your default browser.

---

## 💻 Manual Installation & Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Yogesh-Badigineni/freeverse-video-studio.git
cd freeverse-video-studio
```

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## 🧪 Testing & Quality Assurance

FreeVerse Studio includes a comprehensive automated test suite covering project CRUD, path traversal defense, upload MIME verification, storyboard generation, and real FFmpeg video rendering.

### Run Backend Tests
```bash
cd backend
python -m pytest tests/
```
*Output: 8 passed in 5.23s (including real MP4 file creation and FFmpeg integrity verification).*

### Run Security Scan (Bandit SAST)
```bash
cd backend
python -m bandit -r app/ -ll
```
*Output: 0 High, 0 Medium issues.*

### Run Frontend Production Build Check
```bash
cd frontend
npm run build
```

---

## 🔒 Security & Privacy Architecture

- **Subprocess Isolation**: Zero shell interpretation (`shell=False`) for all FFmpeg process calls.
- **Path Traversal Defense**: All file paths are validated using canonical resolution (`resolve_safe_path`) preventing directory escape attempts.
- **Strict Network Boundary**: Loopback-only binding (`127.0.0.1`) prevents unauthorized local network exposure.
- **Content-Type Validation**: Multi-layer inspection of magic bytes, extensions, and file sizes.

---

## 📦 System Requirements

| Specification | Minimum | Recommended |
| ------------- | ------- | ----------- |
| **CPU** | 4 Cores (Intel / AMD) | 8+ Cores |
| **RAM** | 4 GB | 16 GB |
| **GPU** | Integrated Graphics | NVIDIA RTX / Apple Silicon |
| **Storage** | 500 MB free space | 10 GB free space (for media cache) |
| **OS** | Windows 10/11, macOS 12+, Linux | Windows 11 or Ubuntu 22.04 LTS |

---

## 📄 License & Attribution

FreeVerse Video Studio is licensed under the [Apache License 2.0](LICENSE).
- FFmpeg is licensed under LGPL / GPL (v7.1 static essentials build).
- Local AI model adapters respect their respective licenses (CreativeML OpenRAIL-M, LLaMA Community License, MIT).

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for guidelines.
