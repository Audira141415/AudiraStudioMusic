@echo off
title AudioMix Studio - Shutdown
echo ==============================================
echo        SHUTTING DOWN AUDIOMIX STUDIO
echo ==============================================
echo.

echo 1. Stopping Tauri Desktop Shell (tauri-app.exe)...
taskkill /F /IM tauri-app.exe /T 2>nul
if %errorlevel% equ 0 (
    echo [OK] Tauri Desktop Shell stopped.
) else (
    echo [INFO] Tauri Desktop Shell was not running.
)
echo.

echo 2. Locating and stopping Vite Dev Server on port 1425...
set "VITE_FOUND="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :1425 ^| findstr LISTENING') do (
    echo [OK] Found Vite Dev Server process with PID: %%a. Killing process...
    taskkill /F /PID %%a 2>nul
    set "VITE_FOUND=1"
)
if not defined VITE_FOUND (
    echo [INFO] Vite Dev Server on port 1425 was not running.
)
echo.

echo 3. Locating and stopping Python Backend Server on port 1426...
set "PY_FOUND="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :1426 ^| findstr LISTENING') do (
    echo [OK] Found Python Server process with PID: %%a. Killing process...
    taskkill /F /PID %%a 2>nul
    set "PY_FOUND=1"
)
if not defined PY_FOUND (
    echo [INFO] Python Server on port 1426 was not running.
)
echo.

echo ==============================================
echo           SHUTDOWN PROCESS COMPLETED
echo ==============================================
echo.
timeout /t 3
