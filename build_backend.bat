@echo off
echo Menginstal PyInstaller jika belum ada...
cd backend
pip install pyinstaller

echo Mengkompilasi app.py menjadi executable mandiri...
pyinstaller --name app-x86_64-pc-windows-msvc --onefile --noconfirm app.py

echo Membuat folder binaries di src-tauri...
if not exist ..\src-tauri\binaries mkdir ..\src-tauri\binaries

echo Menyalin executable ke folder src-tauri\binaries...
copy dist\app-x86_64-pc-windows-msvc.exe ..\src-tauri\binaries\app-x86_64-pc-windows-msvc.exe /Y

echo Selesai!
cd ..
