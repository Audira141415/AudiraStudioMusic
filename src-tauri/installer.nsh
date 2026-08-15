!macro customInit
  ; Search Registry for previous installation of AudiraStudioMusic or com.audira.studiomusic
  StrCpy $R0 ""
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.audira.studiomusic" "UninstallString"
  StrCmp $R0 "" check_hkcu found_old_ver

check_hkcu:
  ReadRegStr $R0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\com.audira.studiomusic" "UninstallString"
  StrCmp $R0 "" check_old_folder found_old_ver

check_old_folder:
  ; Check default Program Files folder for previous binary
  IfFileExists "$PROGRAMFILES64\AudiraStudioMusic\AudiraStudioMusic.exe" found_manual_exe end_custom_init

found_manual_exe:
  StrCpy $R0 '"$PROGRAMFILES64\AudiraStudioMusic\uninstall.exe"'

found_old_ver:
  MessageBox MB_YESNO|MB_ICONQUESTION \
    "Versi lama AudiraStudioMusic terdeteksi terpasang di komputer Anda.$\r$\n$\r$\nUntuk menjaga performa dan hasil instalasi yang paling optimal, disarankan untuk meng-uninstall versi lama terlebih dahulu secara bersih.$\r$\n$\r$\nApakah Anda ingin meng-uninstall versi lama sekarang secara otomatis?" \
    IDYES do_uninstall IDNO end_custom_init

do_uninstall:
  ; Execute previous uninstaller
  ExecWait '$R0 /S _?=$INSTDIR'
  Sleep 1000

end_custom_init:
!macroend
