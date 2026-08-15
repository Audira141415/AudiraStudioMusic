@echo off
title AUDIRA STUDIO MUSIC - AUTOMATIC GITHUB COMMIT AND PUSH
echo =======================================================================
echo          AUDIRA STUDIO MUSIC v2.0 - GITHUB AUTO SAVE AND PUSH
echo                     By: AUDIRA (Agus Dwi R)
echo =======================================================================
echo.

set REPO_URL=https://github.com/Audira141415/AudiraStudioMusic.git

REM 1. Inisialisasi Git lokal jika belum ada
if not exist ".git" (
    echo [INFO] Menginisialisasi repositori Git lokal...
    git init
)

REM 2. Set branch ke main
git branch -M main

REM 3. Konfigurasi Remote Origin
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Menambahkan remote origin: %REPO_URL%
    git remote add origin %REPO_URL%
) else (
    echo [INFO] Memperbarui remote origin URL: %REPO_URL%
    git remote set-url origin %REPO_URL%
)

REM 4. Stage seluruh berkas project
echo [INFO] Menambahkan seluruh berkas project (git add .)...
git add .

REM 5. Commit perubahan
if "%~1"=="" (
    set COMMIT_MSG=feat: update Audira Studio Music v2.0 Ultimate by AUDIRA (Agus Dwi R)
) else (
    set COMMIT_MSG=%~1
)

echo [INFO] Melakukan commit dengan pesan: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

REM 6. Push ke GitHub
echo [INFO] Mendorong berkas ke GitHub (git push -u origin main)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================================
    echo [BERHASIL] Seluruh berkas berhasil tersimpan dan ter-push ke GitHub!
    echo URL Repositori: %REPO_URL%
    echo =======================================================================
) else (
    echo.
    echo =======================================================================
    echo [CATATAN] Jika ini pertama kali push atau memerlukan autentikasi,
    echo silakan jalankan 'git push -u origin main' di terminal Anda.
    echo =======================================================================
)

if "%~2"=="--no-pause" goto end
echo.
pause

:end
