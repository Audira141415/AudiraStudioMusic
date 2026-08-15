@echo off
title AudioMix Studio - Startup
echo ==============================================
echo        STARTING AUDIOMIX STUDIO DEV SERVER
echo ==============================================
echo.

cd /d "%~dp0"

echo [1/3] Cleaning up any zombie/previous instances...
taskkill /F /IM tauri-app.exe /T 2>nul

REM Kill port 1425 (Vite Dev Server)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :1425 ^| findstr LISTENING') do (
    echo Killing Vite Dev Server on port 1425, PID: %%a
    taskkill /F /PID %%a 2>nul
)

REM Kill port 1426 (Python Backend Server)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :1426 ^| findstr LISTENING') do (
    echo Killing Python Server on port 1426, PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/3] Checking environment and launching services...
echo [Frontend] Port: 1425
echo [Backend Server] Port: 1426
start /B python backend/app.py --server
echo.
echo [3/3] Starting Tauri Dev App...
echo.

REM Launch Tauri application (Python server is managed automatically by Rust inside the Tauri app)
npm run tauri dev
