# Troubleshooting & Frequently Answered Questions

## Common Issues & Solutions

### 1. FFmpeg Not Found Error
**Symptom:** Backend reports `FFmpeg executable not found`.  
**Solution:**
- FreeVerse automatically bundles and detects FFmpeg via `imageio-ffmpeg`. If you wish to use an external FFmpeg build, set the environment variable:
  ```powershell
  $env:FREEVERSE_FFMPEG_PATH = "C:\path\to\ffmpeg.exe"
  ```
- Or install FFmpeg via winget:
  ```powershell
  winget install Gyan.FFmpeg
  ```

### 2. Port Already in Use (8000 or 5173)
**Symptom:** Backend fails to start with `Address already in use`.  
**Solution:**
- Check for existing uvicorn or node processes:
  ```powershell
  Get-Process -Name python, node | Where-Object { $_.CommandLine -like "*8000*" } | Stop-Process -Force
  ```
- You can also configure an alternate port in `backend/app/config.py` and `frontend/vite.config.ts`.

### 3. Rendering Takes Long on Older Laptops
**Symptom:** Video export is slow on low-end hardware.  
**Solution:**
- Open **Settings** (gear icon in the studio header) and enable **Low-Resource Laptop Mode**.
- Set the render quality preset to **Draft (Fast)**. This uses `-preset ultrafast` and 720p resolution for swift rendering.

### 4. Microphones & Audio Recording Permissions
**Symptom:** In the Audio Studio, clicking "Record Custom Voiceover" triggers a permission error.  
**Solution:**
- Ensure your browser has permitted microphone access for `http://127.0.0.1:5173`. Check browser site settings and reload.

### 5. Connecting Ollama or ComfyUI
**Symptom:** Local AI Hub displays "Not detected".  
**Solution:**
- **For Ollama:** Download from [ollama.com](https://ollama.com) and run `ollama serve`. It will listen on `http://127.0.0.1:11434`.
- **For ComfyUI:** Launch your ComfyUI portable or desktop folder. By default it listens on `http://127.0.0.1:8188`. FreeVerse will detect it immediately when you click "Refresh" in the Local AI Hub.
