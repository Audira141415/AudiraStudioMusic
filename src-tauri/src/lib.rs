use tauri::{AppHandle, Emitter, Manager};
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
    // 1. Get workspace base path and construct backend dir
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    let workspace_root = if current_dir.ends_with("src-tauri") {
        current_dir.parent().unwrap_or(&current_dir).to_path_buf()
    } else {
        current_dir
    };
    let backend_dir = workspace_root.join("backend");
    
    // Create backend directory if it does not exist
    std::fs::create_dir_all(&backend_dir).map_err(|e| e.to_string())?;
    
    // Write configuration JSON to a temporary file
    let config_path = backend_dir.join("config.json");
    let mut file = File::create(&config_path).map_err(|e| e.to_string())?;
    file.write_all(config.as_bytes()).map_err(|e| e.to_string())?;
    
    // 2. Spawn python backend process via Tauri Sidecar
    let sidecar = app.shell().sidecar("app").map_err(|e| e.to_string())?;
    
    let (mut rx, _child) = sidecar
        .args(["--config", config_path.to_str().unwrap()])
        .spawn()
        .map_err(|e| format!("Failed to spawn Python sidecar: {}", e))?;
        
    let app_clone = app.clone();
    
    // 3. Process Python output asynchronously
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                    let line_str = String::from_utf8_lossy(&line);
                    let trimmed = line_str.trim();
                    if trimmed.is_empty() { continue; }
                    
                    // Emit everything to the terminal log
                    let _ = app_clone.emit("render-log", trimmed.to_string());
                    
                    // Check for custom progress output: "PROGRESS:<val>:<msg>"
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

    Ok(())
}

struct PythonServerState(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(PythonServerState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![export_video])
        .setup(|app| {
            // Auto-start Python HTTP server sidecar from Tauri on port 1426
            println!("Auto-starting Python HTTP server sidecar from Tauri...");

            let sidecar = app.shell().sidecar("app").expect("failed to create sidecar");
            match sidecar.args(["--server"]).spawn() {
                Ok((mut rx, child)) => {
                    let state = app.state::<PythonServerState>();
                    let mut lock = state.0.lock().unwrap();
                    *lock = Some(child);
                    println!("Python server started successfully on port 1426.");
                    
                    // Stream sidecar stdout/stderr to frontend
                    let app_clone = app.handle().clone();
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
                    eprintln!("Failed to auto-start Python server: {}. Please run build_backend.bat to build it.", e);
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle: &tauri::AppHandle, event| {
        if let tauri::RunEvent::Exit = event {
            // Clean up: terminate Python HTTP server when Tauri closes
            let state = app_handle.state::<PythonServerState>();
            let mut lock = state.0.lock().unwrap();
            if let Some(child) = lock.take() {
                println!("Stopping Python HTTP server...");
                let _ = child.kill();
            }
        }
    });
}
