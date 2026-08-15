use tauri::{AppHandle, Emitter, Manager};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::{CommandEvent, CommandChild};
use std::fs::File;
use std::io::Write;
use std::sync::Mutex;
use serde::Serialize;

#[derive(Clone, Serialize)]
struct ProgressPayload {
    progress: u32,
    status: String,
}

// Tauri command to start the Python exporter process
#[tauri::command]
fn export_video(app: AppHandle, config: String) -> Result<(), String> {
    // 1. Get user temp directory for AudiraStudioMusic
    let backend_dir = std::env::temp_dir().join("AudiraStudioMusic");
    
    // Create backend directory if it does not exist
    std::fs::create_dir_all(&backend_dir).map_err(|e| e.to_string())?;
    
    // Write configuration JSON to a temporary file
    let config_path = backend_dir.join("config.json");
    let mut file = File::create(&config_path).map_err(|e| e.to_string())?;
    file.write_all(config.as_bytes()).map_err(|e| e.to_string())?;
    
    let mut spawned = false;

    // 2. Try spawning python backend process via Tauri Sidecar
    if let Ok(sidecar) = app.shell().sidecar("app") {
        if let Ok((mut rx, _child)) = sidecar
            .args(["--config", config_path.to_str().unwrap()])
            .spawn()
        {
            spawned = true;
            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                            let line_str = String::from_utf8_lossy(&line);
                            let trimmed = line_str.trim();
                            if trimmed.is_empty() { continue; }
                            
                            let _ = app_clone.emit("render-log", trimmed.to_string());
                            
                            if trimmed.starts_with("PROGRESS:") {
                                let parts: Vec<&str> = trimmed.splitn(3, ':').collect();
                                if parts.len() >= 3 {
                                    if let Ok(progress_val) = parts[1].parse::<u32>() {
                                        let status_text = parts[2].to_string();
                                        let _ = app_clone.emit("render-progress", ProgressPayload {
                                            progress: progress_val,
                                            status: status_text,
                                        });
                                    }
                                }
                            }
                        },
                        _ => {}
                    }
                }
            });
        }
    }

    // 3. Direct process execution fallback if Tauri sidecar API fails
    if !spawned {
        println!("Attempting direct execution fallback for export_video...");
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                let candidate_paths = vec![
                    exe_dir.join("app-x86_64-pc-windows-msvc.exe"),
                    exe_dir.join("binaries").join("app-x86_64-pc-windows-msvc.exe"),
                    exe_dir.join("_up_").join("binaries").join("app-x86_64-pc-windows-msvc.exe"),
                ];
                for bin_path in candidate_paths {
                    if bin_path.exists() {
                        println!("Found backend binary for render at: {:?}. Spawning...", bin_path);
                        let config_arg = config_path.to_str().unwrap().to_string();
                        let app_clone = app.clone();
                        std::thread::spawn(move || {
                            use std::io::{BufRead, BufReader};
                            use std::process::Stdio;
                            if let Ok(mut child) = std::process::Command::new(&bin_path)
                                .arg("--config")
                                .arg(&config_arg)
                                .stdout(Stdio::piped())
                                .stderr(Stdio::piped())
                                .spawn()
                            {
                                if let Some(stdout) = child.stdout.take() {
                                    let reader = BufReader::new(stdout);
                                    for line in reader.lines().flatten() {
                                        let trimmed = line.trim();
                                        if trimmed.is_empty() { continue; }
                                        let _ = app_clone.emit("render-log", trimmed.to_string());
                                        if trimmed.starts_with("PROGRESS:") {
                                            let parts: Vec<&str> = trimmed.splitn(3, ':').collect();
                                            if parts.len() >= 3 {
                                                if let Ok(progress_val) = parts[1].parse::<u32>() {
                                                    let status_text = parts[2].to_string();
                                                    let _ = app_clone.emit("render-progress", ProgressPayload {
                                                        progress: progress_val,
                                                        status: status_text,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                                let _ = child.wait();
                            }
                        });
                        spawned = true;
                        break;
                    }
                }
            }
        }
    }

    if spawned {
        Ok(())
    } else {
        Err("Could not spawn Python render backend".to_string())
    }
}

// Tauri command to manually/automatically start/reconnect Python HTTP server
#[tauri::command]
fn start_python_backend(app: AppHandle) -> Result<String, String> {
    println!("Manual trigger: Starting Python HTTP server backend on port 1426...");
    let mut started = false;

    // 1. Try spawning via Tauri Shell Sidecar API
    if let Ok(sidecar) = app.shell().sidecar("app") {
        match sidecar.args(["--server"]).spawn() {
            Ok((mut rx, child)) => {
                let state = app.state::<PythonServerState>();
                let mut lock = state.0.lock().unwrap();
                *lock = Some(child);
                println!("Python server started successfully via Tauri Shell API on port 1426.");
                started = true;
                
                let app_clone = app.clone();
                tauri::async_runtime::spawn(async move {
                    while let Some(event) = rx.recv().await {
                        match event {
                            CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                                let line_str = String::from_utf8_lossy(&line);
                                let trimmed = line_str.trim();
                                if !trimmed.is_empty() {
                                    let _ = app_clone.emit("render-log", format!("SYSTEM: {}", trimmed));
                                }
                            },
                            _ => {}
                        }
                    }
                });
            }
            Err(e) => {
                eprintln!("Tauri Shell sidecar spawn failed: {}", e);
            }
        }
    }

    // 2. Direct Process Fallback if Tauri sidecar API fails in release build
    if !started {
        println!("Attempting direct process execution fallback for Python server backend...");
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                let candidate_paths = vec![
                    exe_dir.join("app-x86_64-pc-windows-msvc.exe"),
                    exe_dir.join("binaries").join("app-x86_64-pc-windows-msvc.exe"),
                    exe_dir.join("_up_").join("binaries").join("app-x86_64-pc-windows-msvc.exe"),
                ];
                for bin_path in candidate_paths {
                    if bin_path.exists() {
                        println!("Found backend binary at: {:?}. Spawning...", bin_path);
                        if let Ok(_child_proc) = std::process::Command::new(&bin_path)
                            .arg("--server")
                            .spawn() {
                            println!("Direct backend process spawned successfully on port 1426!");
                            started = true;
                            break;
                        }
                    }
                }
            }
        }
    }

    if started {
        Ok("Python backend server successfully started on port 1426!".to_string())
    } else {
        Err("Could not locate or start app-x86_64-pc-windows-msvc.exe".to_string())
    }
}

struct PythonServerState(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(PythonServerState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![export_video, start_python_backend])
        .setup(|app| {
            println!("Auto-starting Python HTTP server sidecar from Tauri...");
            // Pre-cleanup any orphaned backend processes from previous runs
            let _ = std::process::Command::new("taskkill")
                .args(["/F", "/IM", "app-x86_64-pc-windows-msvc.exe", "/T"])
                .creation_flags(0x08000000)
                .output();

            let mut started = false;

            // 1. Try spawning via Tauri Shell Sidecar API
            if let Ok(sidecar) = app.shell().sidecar("app") {
                match sidecar.args(["--server"]).spawn() {
                    Ok((mut rx, child)) => {
                        let state = app.state::<PythonServerState>();
                        let mut lock = state.0.lock().unwrap();
                        *lock = Some(child);
                        println!("Python server started successfully via Tauri Shell API on port 1426.");
                        started = true;
                        
                        let app_clone = app.app_handle().clone();
                        tauri::async_runtime::spawn(async move {
                            while let Some(event) = rx.recv().await {
                                match event {
                                    CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                                        let line_str = String::from_utf8_lossy(&line);
                                        let trimmed = line_str.trim();
                                        if !trimmed.is_empty() {
                                            let _ = app_clone.emit("render-log", format!("SYSTEM: {}", trimmed));
                                        }
                                    },
                                    _ => {}
                                }
                            }
                        });
                    }
                    Err(e) => {
                        eprintln!("Tauri Shell sidecar spawn failed: {}", e);
                    }
                }
            }

            // 2. Direct Process Fallback if Tauri sidecar API fails in release build
            if !started {
                println!("Attempting direct process execution fallback for Python server backend...");
                if let Ok(exe_path) = std::env::current_exe() {
                    if let Some(exe_dir) = exe_path.parent() {
                        let candidate_paths = vec![
                            exe_dir.join("app-x86_64-pc-windows-msvc.exe"),
                            exe_dir.join("binaries").join("app-x86_64-pc-windows-msvc.exe"),
                            exe_dir.join("_up_").join("binaries").join("app-x86_64-pc-windows-msvc.exe"),
                        ];
                        for bin_path in candidate_paths {
                            if bin_path.exists() {
                                println!("Found backend binary at: {:?}. Spawning...", bin_path);
                                if let Ok(_child_proc) = std::process::Command::new(&bin_path)
                                    .arg("--server")
                                    .spawn() {
                                    println!("Direct backend process spawned successfully on port 1426!");
                                    started = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if !started {
                eprintln!("WARNING: Could not start Python HTTP server backend on port 1426.");
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle: &tauri::AppHandle, event| {
        match event {
            tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit => {
                // Clean up: terminate Python HTTP server when Tauri window is closed
                println!("Closing application: Terminating all Python backend subprocesses...");
                let state = app_handle.state::<PythonServerState>();
                let mut lock = state.0.lock().unwrap();
                if let Some(child) = lock.take() {
                    let _ = child.kill();
                }
                // Forceful taskkill fallback to ensure zero leftover processes on Windows
                let _ = std::process::Command::new("taskkill")
                    .args(["/F", "/IM", "app-x86_64-pc-windows-msvc.exe", "/T"])
                    .creation_flags(0x08000000)
                    .output();
            },
            _ => {}
        }
    });
}
