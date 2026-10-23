@echo off
setlocal enabledelayedexpansion
title FreeVerse Video Studio - Launcher

echo ========================================================
echo        FREEVERSE VIDEO STUDIO - 100%% FREE & OPEN SOURCE
echo ========================================================
echo Starting local video creation studio on 127.0.0.1...
echo.

cd /d "%~dp0"

:: Check Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ from python.org.
    pause
    exit /b 1
)

:: Check Node
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from nodejs.org.
    pause
    exit /b 1
)

echo [1/3] Starting FreeVerse Backend Media Engine on port 8000...
set PYTHONPATH=%~dp0backend
start "FreeVerse Backend Engine" /min python -m uvicorn app.main:app --app-dir "%~dp0backend" --host 127.0.0.1 --port 8000

echo [2/3] Starting Studio Frontend UI on port 5173...
cd frontend
start "FreeVerse Frontend UI" /min npm run dev

echo [3/3] Opening FreeVerse Studio in your browser...
timeout /t 3 >nul
start http://127.0.0.1:5173

echo.
echo ========================================================
echo FreeVerse Studio is now running!
echo Access URL: http://127.0.0.1:5173
echo Backend API: http://127.0.0.1:8000/docs
echo Close this window or the background windows to stop.
echo ========================================================
echo.
pause
