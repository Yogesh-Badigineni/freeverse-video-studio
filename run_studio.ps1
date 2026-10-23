# FreeVerse Video Studio - PowerShell Launcher
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       FREEVERSE VIDEO STUDIO - 100% FREE & OPEN SOURCE " -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting local video creation studio on 127.0.0.1..." -ForegroundColor Gray

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Check Python
try {
    $pyVer = python --version
    Write-Host "[OK] Detected: $pyVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 2. Check Node
try {
    $nodeVer = node -v
    Write-Host "[OK] Detected Node.js: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 3. Start Backend
Write-Host "[1/3] Starting FreeVerse Backend Media Engine on port 8000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --app-dir `"$rootDir\backend`" --host 127.0.0.1 --port 8000" -Environment @{ PYTHONPATH = "$rootDir\backend" } -PassThru -WindowStyle Hidden

# 4. Start Frontend
Write-Host "[2/3] Starting Studio Frontend UI on port 5173..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$rootDir\frontend" -PassThru -WindowStyle Hidden

# 5. Open Browser
Write-Host "[3/3] Opening FreeVerse Studio in default browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:5173"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "FreeVerse Video Studio is running!" -ForegroundColor White
Write-Host "Web Application: http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host "REST API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to terminate both servers." -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Green

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Shutdown complete." -ForegroundColor Green
}
