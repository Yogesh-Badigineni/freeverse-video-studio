#!/usr/bin/env python3
"""
FreeVerse Video Studio - Cross-Platform One-Click Launcher
Starts the FastAPI backend, Vite dev frontend, and opens the default web browser.
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 60)
    print("      FREEVERSE VIDEO STUDIO - 100% FREE & OPEN SOURCE")
    print("=" * 60)

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    # 1. Start Backend
    print("[1/3] Launching FastAPI Backend on 127.0.0.1:8000...")
    backend_cmd = [
        sys.executable, "-m", "uvicorn", "app.main:app",
        "--app-dir", str(BACKEND_DIR),
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload"
    ]
    backend_proc = subprocess.Popen(backend_cmd, env=env)

    # 2. Start Frontend
    print("[2/3] Launching Vite Frontend on 127.0.0.1:5173...")
    frontend_cmd = ["npm", "run", "dev"]
    shell_flag = sys.platform == "win32"
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=str(FRONTEND_DIR), shell=shell_flag)

    # 3. Wait and Open Browser
    print("[3/3] Opening FreeVerse Studio in your web browser...")
    time.sleep(3)
    webbrowser.open("http://127.0.0.1:5173")

    print("\n" + "=" * 60)
    print("FreeVerse Video Studio is running!")
    print("URL: http://127.0.0.1:5173")
    print("API Docs: http://127.0.0.1:8000/docs")
    print("Press Ctrl+C to terminate.")
    print("=" * 60 + "\n")

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down FreeVerse Studio...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Goodbye!")

if __name__ == "__main__":
    main()
