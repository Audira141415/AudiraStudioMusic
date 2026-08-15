import os
import sys
import json
import argparse
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from render_service import render_video, terminate_ffmpeg_by_process, check_gpu_encoders

# Global render state for HTTP server mode
current_progress = 0
current_status = "Idle"
is_rendering = False

def get_work_dir():
    import tempfile
    work_dir = os.path.join(tempfile.gettempdir(), "AudiraStudioMusic")
    os.makedirs(work_dir, exist_ok=True)
    return work_dir

# ─────────────────────────────────────────────────────────────────────
# Parallel Render Queue — Thread-safe State
# ─────────────────────────────────────────────────────────────────────
render_queue = []
queue_lock = threading.Lock()

# Max parallel slots — configurable by user (1-3), default 2
MAX_PARALLEL_SLOTS = 2

def get_queue_data():
    with queue_lock:
        return [
            {
                "id": job["id"],
                "title": job["title"],
                "outputPath": job["outputPath"],
                "resolution": job["resolution"],
                "fps": job["fps"],
                "progress": job["progress"],
                "status": job["status"],
                "statusText": job["statusText"],
                "timestamp": job["timestamp"],
                "config": job.get("config"),
                "slotId": job.get("slotId")
            }
            for job in render_queue
        ]

def get_parallel_slots_status():
    """Return 3-slot status array for BatchQueuePanel UI."""
    slots = []
    for slot_id in range(3):
        with queue_lock:
            job_in_slot = next(
                (j for j in render_queue if j.get("slotId") == slot_id and j["status"] == "rendering"),
                None
            )
        if job_in_slot:
            slots.append({
                "slotId": slot_id,
                "jobId": job_in_slot["id"],
                "title": job_in_slot["title"],
                "progress": job_in_slot["progress"],
                "status": "rendering",
                "statusText": job_in_slot["statusText"],
                "outputPath": job_in_slot["outputPath"]
            })
        else:
            slots.append({
                "slotId": slot_id,
                "jobId": None,
                "status": "idle"
            })
    return slots

def auto_suffix_output_path(output_path, existing_paths):
    """
    If output_path already exists on DISK or conflicts with any active/queued job's output path,
    auto-suffix with _1, _2, etc. to guarantee NO file is EVER overwritten!
    E.g.: exports/visualizer.mp4 -> exports/visualizer_1.mp4
    """
    if output_path not in existing_paths and not os.path.exists(output_path):
        return output_path
    base, ext = os.path.splitext(output_path)
    counter = 1
    while True:
        candidate = f"{base}_{counter}{ext}"
        if candidate not in existing_paths and not os.path.exists(candidate):
            return candidate
        counter += 1

def queue_worker(slot_id):
    """
    Worker thread for one render slot.
    Multiple slots run in parallel up to MAX_PARALLEL_SLOTS.
    """
    global is_rendering, current_progress, current_status
    while True:
        try:
            job_to_run = None

            with queue_lock:
                # Count active rendering slots
                active_count = sum(1 for j in render_queue if j["status"] == "rendering")

                # Only pick up a new job if within the allowed parallel limit
                if active_count < MAX_PARALLEL_SLOTS:
                    for job in render_queue:
                        if job["status"] == "queued" and job.get("slotId") is None:
                            job_to_run = job
                            job_to_run["slotId"] = slot_id
                            break

            if job_to_run:
                with queue_lock:
                    job_to_run["status"] = "rendering"
                    job_to_run["start_time"] = time.time()
                    job_to_run["ffmpeg_process"] = None
                    is_rendering = True

                print(f"QUEUE[slot{slot_id}]: Starting job {job_to_run['id']} ({job_to_run['title']})...")
                sys.stdout.flush()

                class ProgressStdout:
                    def write(self, text):
                        global current_progress, current_status
                        if text.startswith("PROGRESS:"):
                            parts = text.strip().split(":", 2)
                            if len(parts) >= 3:
                                try:
                                    prog_val = int(parts[1])
                                    status_msg = parts[2]
                                    current_progress = prog_val
                                    current_status = status_msg
                                    with queue_lock:
                                        if prog_val > job_to_run.get("progress", 0):
                                            job_to_run["progress"] = prog_val
                                        job_to_run["statusText"] = status_msg
                                except Exception:
                                    pass
                        sys.__stdout__.write(text)

                    def flush(self):
                        sys.__stdout__.flush()

                old_stdout = sys.stdout
                sys.stdout = ProgressStdout()
                try:
                    render_video(job_to_run["config"], job_ref=job_to_run)
                    with queue_lock:
                        job_to_run["progress"] = 100
                        job_to_run["status"] = "completed"
                        job_to_run["statusText"] = "Video rendering completed successfully!"
                        job_to_run["slotId"] = None
                        job_to_run["ffmpeg_process"] = None
                except Exception as err:
                    with queue_lock:
                        if job_to_run["status"] == "cancelled":
                            job_to_run["progress"] = 0
                            job_to_run["statusText"] = "Render process terminated by user."
                        else:
                            job_to_run["progress"] = 100
                            job_to_run["status"] = "failed"
                            job_to_run["statusText"] = f"Render failed: {err}"
                        job_to_run["slotId"] = None
                        job_to_run["ffmpeg_process"] = None
                finally:
                    sys.stdout = old_stdout
                    with queue_lock:
                        still_active = any(j["status"] == "rendering" for j in render_queue)
                        is_rendering = still_active

            time.sleep(0.5)
        except Exception as e:
            print(f"Error in queue_worker[slot{slot_id}]: {e}")
            sys.stdout.flush()
            time.sleep(1)

# Start 3 worker threads (slots 0, 1, 2) — only up to MAX_PARALLEL_SLOTS will render at once
for _slot_id in range(3):
    threading.Thread(target=queue_worker, args=(_slot_id,), daemon=True).start()

# Helper functions for system specification inspection
def get_gpus():
    import subprocess
    try:
        cmd = ["wmic", "path", "win32_VideoController", "get", "name"]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if result.returncode == 0:
            lines = [line.strip() for line in result.stdout.split("\n") if line.strip()]
            if len(lines) > 1:
                gpus = [g for g in lines[1:] if g != "Name" and g]
                if gpus:
                    return gpus
    except Exception:
        pass

    # PowerShell fallback if WMIC is missing or disabled in Windows 11
    try:
        ps_cmd = ["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name"]
        result = subprocess.run(ps_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if result.returncode == 0:
            gpus = [line.strip() for line in result.stdout.split("\n") if line.strip()]
            if gpus:
                return gpus
    except Exception:
        pass

    return ["Default Graphic Adapter"]

def get_total_ram():
    import subprocess
    try:
        cmd = ["wmic", "computersystem", "get", "TotalPhysicalMemory"]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if result.returncode == 0:
            lines = [line.strip() for line in result.stdout.split("\n") if line.strip()]
            if len(lines) > 1 and lines[1].isdigit():
                bytes_val = int(lines[1])
                return round(bytes_val / (1024 ** 3))
    except Exception:
        pass

    # PowerShell fallback
    try:
        ps_cmd = ["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"]
        result = subprocess.run(ps_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if result.returncode == 0 and result.stdout.strip().isdigit():
            bytes_val = int(result.stdout.strip())
            return round(bytes_val / (1024 ** 3))
    except Exception:
        pass

    return 8 # Default fallback

def get_ffmpeg_bin():
    import shutil
    path = shutil.which("ffmpeg")
    if path:
        return path
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        candidate = os.path.join(exe_dir, "ffmpeg.exe")
        if os.path.exists(candidate):
            return candidate
    candidate = os.path.join(os.getcwd(), "ffmpeg.exe")
    if os.path.exists(candidate):
        return candidate
    return "ffmpeg"

def get_ffmpeg_encoders():
    import subprocess
    try:
        ffmpeg_bin = get_ffmpeg_bin()
        result = subprocess.run([ffmpeg_bin, "-encoders"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        encoders = []
        for line in result.stdout.split("\n"):
            line_stripped = line.strip()
            if "h264_" in line_stripped or "hevc_" in line_stripped or "av1_" in line_stripped:
                parts = line_stripped.split()
                if len(parts) >= 2:
                    encoders.append(parts[1])
        return encoders
    except Exception:
        return []

def get_recommendation(gpus, ram, encoders):
    gpu_name_lower = "".join(gpus).lower()
    has_nv = any(x in gpu_name_lower for x in ["nvidia", "geforce", "quadro", "tesla"])
    has_amd = any(x in gpu_name_lower for x in ["amd", "radeon", "firepro"])
    has_intel = any(x in gpu_name_lower for x in ["intel", "arc", "iris"])
    
    recommended_encoder = "cpu"
    recommended_codec = "h264"
    explanation = "Sistem menggunakan CPU rendering (libx264) sebagai fallback standar."
    
    if has_nv and "h264_nvenc" in encoders:
        recommended_encoder = "gpu"
        recommended_codec = "h264"
        explanation = "GPU NVIDIA GeForce terdeteksi. Direkomendasikan menggunakan encoder perangkat keras NVIDIA NVENC untuk rendering super cepat."
    elif has_amd and "h264_amf" in encoders:
        recommended_encoder = "gpu"
        recommended_codec = "h264"
        explanation = "GPU AMD Radeon terdeteksi. Direkomendasikan menggunakan encoder perangkat keras AMD AMF untuk rendering cepat."
    elif has_intel and "h264_qsv" in encoders:
        recommended_encoder = "gpu"
        recommended_codec = "h264"
        explanation = "GPU Intel HD/UHD terdeteksi. Direkomendasikan menggunakan Intel QuickSync Video (QSV) hardware encoder."
    elif "h264_mf" in encoders:
        recommended_encoder = "gpu"
        recommended_codec = "h264"
        explanation = "Akselerasi GPU universal (Windows Media Foundation) terdeteksi. Menggunakan GPU rendering agar hemat daya & cepat."
        
    if recommended_encoder == "gpu" and ram >= 16:
        recommended_res = "1080p"
        recommended_fps = 30
        recommended_bitrate = "Ultra High Quality (24 Mbps)"
        perf_class = "EXCELLENT"
    elif recommended_encoder == "gpu" or ram >= 8:
        recommended_res = "1080p"
        recommended_fps = 30
        recommended_bitrate = "High Quality (12 Mbps)"
        perf_class = "GOOD"
    else:
        recommended_res = "720p"
        recommended_fps = 30
        recommended_bitrate = "Medium Quality (6 Mbps)"
        perf_class = "BASIC"
        
    return {
        "encoder": recommended_encoder,
        "codec": recommended_codec,
        "resolution": recommended_res,
        "fps": recommended_fps,
        "videoBitrate": recommended_bitrate,
        "performanceClass": perf_class,
        "explanation": explanation
    }

cached_system_specs = None

def init_system_specs():
    global cached_system_specs
    import platform
    gpus = get_gpus()
    ram = get_total_ram()
    encoders = get_ffmpeg_encoders()
    rec = get_recommendation(gpus, ram, encoders)
    cached_system_specs = {
        "cpu": platform.processor() or "Generic CPU",
        "gpus": gpus,
        "ram": f"{ram} GB",
        "os": f"{platform.system()} {platform.release()}",
        "ffmpeg_encoders": encoders,
        "recommendation": rec
    }

def check_diagnostics():
    import platform
    import shutil
    import subprocess
    
    # 1. Check FFmpeg
    ffmpeg_path = shutil.which("ffmpeg")
    ffmpeg_status = "ONLINE" if ffmpeg_path else "ERROR: FFmpeg tidak ditemukan di SYSTEM PATH. Pastikan FFmpeg terinstall."
    
    # 2. Check OpenCV
    try:
        import cv2
        opencv_status = f"ONLINE (v{cv2.__version__})"
    except Exception as e:
        opencv_status = f"ERROR: OpenCV gagal dimuat: {e}"
        
    # 3. Check GPU & RAM
    gpus = get_gpus()
    ram = get_total_ram()
    encoders = get_ffmpeg_encoders()
    
    # 4. Check Temp Directory Write Access
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    temp_write = "ONLINE"
    try:
        test_file = os.path.join(backend_dir, "temp_write_test.txt")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
    except Exception as e:
        temp_write = f"ERROR: {e}"
        
    # 5. Check Exports Directory Write Access
    exports_dir = os.path.abspath(os.path.join(backend_dir, "..", "exports"))
    exports_write = "ONLINE"
    try:
        if not os.path.exists(exports_dir):
            os.makedirs(exports_dir, exist_ok=True)
        test_file = os.path.join(exports_dir, "temp_write_test.txt")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
    except Exception as e:
        exports_write = f"ERROR: {e}"
        
    return {
        "ffmpeg": ffmpeg_status,
        "opencv": opencv_status,
        "backend": "ONLINE",
        "gpus": gpus,
        "ram": f"{ram} GB",
        "cpu": platform.processor() or "Generic CPU",
        "encoders": encoders,
        "write_temp": temp_write,
        "write_exports": exports_write,
        "os": f"{platform.system()} {platform.release()}"
    }

def select_save_file_dialog():
    import subprocess
    ps_code = (
        "Add-Type -AssemblyName System.Windows.Forms; "
        "$f = New-Object System.Windows.Forms.SaveFileDialog; "
        "$f.Filter = 'MP4 Video (*.mp4)|*.mp4'; "
        "$f.Title = 'Pilih Lokasi Simpan Video'; "
        "$f.InitialDirectory = [System.IO.Directory]::GetCurrentDirectory(); "
        "$f.FileName = 'visualizer.mp4'; "
        "if($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { "
        "  Write-Host $f.FileName "
        "}"
    )
    try:
        cmd = ["powershell", "-NoProfile", "-NonInteractive", "-Command", ps_code]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, creationflags=0x08000000)
        path = result.stdout.strip()
        if path:
            return path.replace("\\", "/")
        return None
    except Exception as e:
        print(f"Error opening file dialog: {e}")
        return None

class RenderHTTPRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        try:
            if hasattr(self, 'path') and ("/progress" in self.path or "/status" in self.path or "/queue_status" in self.path):
                return
        except Exception:
            pass
        BaseHTTPRequestHandler.log_message(self, format, *args)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        global current_progress, current_status, is_rendering, MAX_PARALLEL_SLOTS
        from urllib.parse import urlparse, parse_qs
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        if parsed_url.path == "/progress" or parsed_url.path == "/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            
            job_id_param = query_params.get("jobId", [None])[0]
            
            active_progress = 0
            active_status = "Idle"
            active_id = None
            with queue_lock:
                target_job = None
                if job_id_param:
                    for job in render_queue:
                        if job["id"] == job_id_param:
                            target_job = job
                            break
                
                if target_job:
                    active_id = target_job["id"]
                    if target_job["status"] == "queued":
                        pos_ahead = 0
                        for job in render_queue:
                            if job["id"] == target_job["id"]:
                                break
                            if job["status"] in ["queued", "rendering"]:
                                pos_ahead += 1
                        active_progress = 0
                        active_status = f"[Antrean] Menunggu slot kosong... {pos_ahead} video lain diproses sebelum Anda."
                    else:
                        active_progress = target_job["progress"]
                        active_status = target_job["statusText"]
                else:
                    # Return the most recently started actively rendering job
                    active_jobs = [j for j in render_queue if j["status"] == "rendering"]
                    if active_jobs:
                        most_recent = sorted(active_jobs, key=lambda j: j.get("start_time", 0), reverse=True)[0]
                        active_progress = most_recent["progress"]
                        active_status = most_recent["statusText"]
                        active_id = most_recent["id"]
                    elif render_queue:
                        last_job = render_queue[-1]
                        active_progress = last_job["progress"]
                        active_status = last_job["statusText"]
                        active_id = last_job["id"]
                    
            response_data = {
                "progress": active_progress,
                "status": active_status,
                "isRendering": is_rendering,
                "activeJobId": active_id,
                "queue": get_queue_data()
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        elif parsed_url.path == "/queue_status":
            # New: returns all 3 parallel slot statuses + queued jobs list
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()

            slots = get_parallel_slots_status()
            with queue_lock:
                queued_jobs = [
                    {
                        "id": j["id"],
                        "title": j["title"],
                        "outputPath": j["outputPath"],
                        "timestamp": j["timestamp"]
                    }
                    for j in render_queue if j["status"] == "queued"
                ]
                active_count = sum(1 for j in render_queue if j["status"] == "rendering")
                total_jobs = len(render_queue)

            response_data = {
                "parallelSlots": slots,
                "maxParallelSlots": MAX_PARALLEL_SLOTS,
                "queuedJobs": queued_jobs,
                "queuedCount": len(queued_jobs),
                "activeCount": active_count,
                "totalJobs": total_jobs,
                "isRendering": is_rendering,
                "queue": get_queue_data()
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        elif parsed_url.path == "/diagnostics":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            diag_data = check_diagnostics()
            self.wfile.write(json.dumps(diag_data).encode('utf-8'))
        elif parsed_url.path == "/system_specs":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            if cached_system_specs is None:
                init_system_specs()
            self.wfile.write(json.dumps(cached_system_specs).encode('utf-8'))
        elif parsed_url.path == "/gpu_info":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            gpu_data = check_gpu_encoders()
            self.wfile.write(json.dumps(gpu_data).encode('utf-8'))
        elif self.path == "/select_output_file":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            selected_path = select_save_file_dialog()
            response_data = {
                "selectedPath": selected_path
            }
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        elif self.path.startswith("/downloads/"):
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            filename = os.path.basename(self.path)
            filepath = os.path.join(backend_dir, "downloads", filename)
            if os.path.exists(filepath):
                self.send_response(200)
                content_type = "audio/mpeg" if filename.endswith(".mp3") else "video/mp4"
                self.send_header("Content-Type", content_type)
                self._send_cors_headers()
                self.end_headers()
                with open(filepath, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
        elif self.path == "/temp_fallback_audio.mp3":
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            filepath = os.path.join(backend_dir, "temp_fallback_audio.mp3")
            if os.path.exists(filepath):
                self.send_response(200)
                self.send_header("Content-Type", "audio/mpeg")
                self._send_cors_headers()
                self.end_headers()
                with open(filepath, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        global is_rendering, MAX_PARALLEL_SLOTS
        from urllib.parse import urlparse, parse_qs
        parsed_url = urlparse(self.path)

        if parsed_url.path == "/download_url":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            downloads_dir = os.path.join(backend_dir, "downloads")
            os.makedirs(downloads_dir, exist_ok=True)

            try:
                data = json.loads(post_data.decode('utf-8'))
                target_url = data.get("url", "").strip()
                media_format = data.get("format", "mp3").lower()

                if not target_url:
                    raise ValueError("URL media tidak boleh kosong")

                out_filename = f"dl_{int(time.time())}.{media_format}"
                out_filepath = os.path.join(downloads_dir, out_filename)

                title = "Downloaded Media"

                if target_url.lower().endswith(('.mp3', '.wav', '.flac', '.m4a', '.mp4', '.mov', '.png', '.jpg', '.jpeg')):
                    import urllib.request
                    req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as resp, open(out_filepath, 'wb') as f:
                        f.write(resp.read())
                    title = os.path.basename(target_url)
                else:
                    # Auto-detect cookies.txt for YouTube anti-bot & age-restriction bypass
                    cookies_path = None
                    candidate_paths = [
                        os.path.join(backend_dir, "cookies.txt"),
                        os.path.join(os.path.dirname(backend_dir), "cookies.txt"),
                        "F:\\AUDIRA-CLIP-AI\\cookies.txt"
                    ]
                    for cp in candidate_paths:
                        if os.path.exists(cp):
                            cookies_path = cp
                            break

                    cookie_args = ["--cookies", cookies_path] if cookies_path else []

                    if media_format == 'mp3':
                        cmd = [
                            "yt-dlp",
                            "-x",
                            "--audio-format", "mp3",
                            "--audio-quality", "0",
                            "-o", out_filepath,
                            "--no-playlist",
                            "--no-check-certificates"
                        ] + cookie_args + [target_url]
                    else:
                        cmd = [
                            "yt-dlp",
                            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                            "-o", out_filepath,
                            "--no-playlist",
                            "--no-check-certificates"
                        ] + cookie_args + [target_url]

                    sub_res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)
                    if sub_res.returncode != 0:
                        # Fallback strategy if cookies expired or failed
                        cmd_fallback = [
                            "yt-dlp",
                            "-x" if media_format == 'mp3' else "-f",
                            "mp3" if media_format == 'mp3' else "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                            "-o", out_filepath,
                            "--no-playlist",
                            "--no-check-certificates",
                            target_url
                        ]
                        sub_res = subprocess.run(cmd_fallback, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)
                        if sub_res.returncode != 0:
                            raise ValueError(f"yt-dlp error: {sub_res.stderr[-300:] if sub_res.stderr else 'Gagal mengunduh berkas'}")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "filepath": out_filepath,
                    "filename": out_filename,
                    "title": title,
                    "downloadUrl": f"http://localhost:1426/downloads/{out_filename}"
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        elif parsed_url.path == "/separate_stems":
            content_type = self.headers.get('Content-Type', '')
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            downloads_dir = os.path.join(backend_dir, "downloads")
            os.makedirs(downloads_dir, exist_ok=True)

            src_audio_path = None
            if 'multipart/form-data' in content_type:
                try:
                    content_length = int(self.headers.get('Content-Length', 0))
                    body = self.rfile.read(content_length)
                    from email.parser import BytesParser
                    from email.policy import default
                    msg_bytes = f"Content-Type: {content_type}\r\n\r\n".encode('ascii') + body
                    msg = BytesParser(policy=default).parsebytes(msg_bytes)
                    for part in msg.iter_parts():
                        payload = part.get_payload(decode=True)
                        if payload:
                            src_audio_path = os.path.join(downloads_dir, f"temp_src_{int(time.time())}.mp3")
                            with open(src_audio_path, "wb") as f:
                                f.write(payload)
                            break
                except Exception as e:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
                    return

            if not src_audio_path or not os.path.exists(src_audio_path):
                for fname in os.listdir(backend_dir):
                    if fname.endswith("_audio.mp3") or fname == "temp_test_audio.mp3":
                        src_audio_path = os.path.join(backend_dir, fname)
                        break

            if not src_audio_path or not os.path.exists(src_audio_path):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Berkas audio sumber tidak ditemukan."}).encode('utf-8'))
                return

            timestamp = int(time.time())
            inst_filename = f"stem_inst_{timestamp}.mp3"
            vocals_filename = f"stem_vocals_{timestamp}.mp3"
            inst_path = os.path.join(downloads_dir, inst_filename)
            vocals_path = os.path.join(downloads_dir, vocals_filename)

            try:
                cmd_inst = [
                    "ffmpeg", "-y", "-i", src_audio_path,
                    "-af", "pan=stereo|c0=0.5*c0-0.5*c1|c1=0.5*c1-0.5*c0, volume=1.8",
                    "-b:a", "192k", inst_path
                ]
                subprocess.run(cmd_inst, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

                cmd_voc = [
                    "ffmpeg", "-y", "-i", src_audio_path,
                    "-af", "pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1, highpass=f=220, lowpass=f=4500, volume=1.5",
                    "-b:a", "192k", vocals_path
                ]
                subprocess.run(cmd_voc, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "instrumentalPath": inst_path,
                    "vocalsPath": vocals_path,
                    "instrumentalUrl": f"http://localhost:1426/downloads/{inst_filename}",
                    "vocalsUrl": f"http://localhost:1426/downloads/{vocals_filename}"
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": f"FFmpeg Stem Separator failed: {e}"}).encode('utf-8'))
            return

        if parsed_url.path == "/export":
            content_type = self.headers.get('Content-Type', '')
            config = None
            
            # Generate unique jobId
            job_id = f"job_{int(time.time())}_{len(render_queue) + 1}"
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            
            audio_path = None
            bg_path = None
            logo_path = None
            voiceover_path = None
            font_path = None
            lyric_path = None
            settings_json = None
            
            if 'multipart/form-data' in content_type:
                try:
                    content_length = int(self.headers.get('Content-Length', 0))
                    body = self.rfile.read(content_length)
                    
                    from email.parser import BytesParser
                    from email.policy import default
                    
                    msg_bytes = f"Content-Type: {content_type}\r\n\r\n".encode('ascii') + body
                    msg = BytesParser(policy=default).parsebytes(msg_bytes)
                    
                    work_dir = get_work_dir()
                    
                    for part in msg.iter_parts():
                        name = part.get_param('name', header='content-disposition')
                        filename = part.get_filename()
                        payload = part.get_payload(decode=True)
                        
                        if not payload:
                            continue
                            
                        if name == 'settings':
                            settings_json = json.loads(payload.decode('utf-8'))
                        elif name == 'audioFile':
                            audio_path = os.path.join(work_dir, f"{job_id}_audio.mp3")
                            with open(audio_path, "wb") as f:
                                f.write(payload)
                        elif name == 'backgroundFile':
                            ext = ".png" if filename and filename.lower().endswith(".png") else ".jpg"
                            bg_path = os.path.join(work_dir, f"{job_id}_bg{ext}")
                            with open(bg_path, "wb") as f:
                                f.write(payload)
                        elif name == 'logoFile':
                            logo_path = os.path.join(work_dir, f"{job_id}_logo.png")
                            with open(logo_path, "wb") as f:
                                f.write(payload)
                        elif name == 'voiceoverFile':
                            voiceover_path = os.path.join(work_dir, f"{job_id}_voiceover.mp3")
                            with open(voiceover_path, "wb") as f:
                                f.write(payload)
                        elif name == 'fontFile':
                            ext = ".otf" if filename and filename.lower().endswith(".otf") else ".ttf"
                            font_path = os.path.join(work_dir, f"{job_id}_font{ext}")
                            with open(font_path, "wb") as f:
                                f.write(payload)
                        elif name == 'bgAudioFile':
                            bg_audio_path = os.path.join(work_dir, f"{job_id}_bgaudio.mp3")
                            with open(bg_audio_path, "wb") as f:
                                f.write(payload)
                        elif name == 'lyricFile':
                            lyric_path = os.path.join(work_dir, f"{job_id}_lyrics.lrc")
                            with open(lyric_path, "wb") as f:
                                f.write(payload)
                    
                    if settings_json:
                        config = settings_json
                        if audio_path:
                            config['audioPath'] = audio_path
                        if bg_path:
                            config['backgroundPath'] = bg_path
                        if logo_path:
                            config['logoPath'] = logo_path
                        if voiceover_path:
                            config['voiceoverPath'] = voiceover_path
                        if font_path:
                            config['settings']['customFontPath'] = font_path
                        if lyric_path:
                            config['lyricPath'] = lyric_path
                    else:
                        raise ValueError("Missing 'settings' part in multipart request")
                except Exception as e:
                    self.send_response(400)
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Failed to parse multipart/form-data: {e}"}).encode('utf-8'))
                    return
            else:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                try:
                    config = json.loads(post_data.decode('utf-8'))
                except Exception as e:
                    self.send_response(400)
                    self._send_cors_headers()
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Invalid JSON: {e}"}).encode('utf-8'))
                    return

            # Determine title for display in queue
            title = "Visualizer Video"
            if audio_path:
                title = os.path.basename(audio_path)
            elif config and config.get("textTitle"):
                title = config.get("textTitle")

            # Auto-suffix output path if conflict with active/queued jobs
            raw_output_path = config.get("outputPath", "exports/visualizer.mp4") if config else "exports/visualizer.mp4"
            with queue_lock:
                active_output_paths = set(
                    j["outputPath"] for j in render_queue
                    if j["status"] in ("queued", "rendering")
                )
            final_output_path = auto_suffix_output_path(raw_output_path, active_output_paths)
            if config and final_output_path != raw_output_path:
                config["outputPath"] = final_output_path
                print(f"QUEUE: Output path conflict. Auto-renamed to: {final_output_path}")
                sys.stdout.flush()

            job_item = {
                "id": job_id,
                "title": title,
                "outputPath": final_output_path,
                "resolution": config.get("resolution", "1080p") if config else "1080p",
                "fps": config.get("fps", 30) if config else 30,
                "progress": 0,
                "status": "queued",
                "statusText": "Dalam antrean...",
                "timestamp": time.strftime("%d/%m/%Y, %H.%M.%S"),
                "config": config,
                "slotId": None,
                "ffmpeg_process": None
            }

            with queue_lock:
                render_queue.append(job_item)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "message": "Job queued successfully",
                "jobId": job_id,
                "outputPath": final_output_path
            }).encode('utf-8'))
            
        elif parsed_url.path == "/set_parallel_slots":
            # Allow frontend slider to change MAX_PARALLEL_SLOTS (1-3)
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                slots = int(data.get("slots", 2))
                slots = max(1, min(3, slots))  # Clamp to 1-3
                MAX_PARALLEL_SLOTS = slots
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"message": f"Max parallel slots set to {slots}", "slots": slots}).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        elif parsed_url.path == "/stop" or parsed_url.path == "/cancel":
            query_params = parse_qs(parsed_url.query)
            target_job_id = query_params.get("job_id", [None])[0]

            cancelled_any = False
            with queue_lock:
                if target_job_id:
                    for job in render_queue:
                        if job["id"] == target_job_id:
                            job["status"] = "cancelled"
                            job["statusText"] = "Render process cancelled by user."
                            cancelled_any = True
                            ffmpeg_proc = job.get("ffmpeg_process")
                            if ffmpeg_proc:
                                threading.Thread(
                                    target=terminate_ffmpeg_by_process,
                                    args=(ffmpeg_proc,),
                                    daemon=True
                                ).start()
                            break
                else:
                    # Cancel all active and queued jobs
                    for job in render_queue:
                        if job["status"] in ("rendering", "queued"):
                            job["status"] = "cancelled"
                            job["statusText"] = "Render process cancelled by user."
                            cancelled_any = True
                            ffmpeg_proc = job.get("ffmpeg_process")
                            if ffmpeg_proc:
                                threading.Thread(
                                    target=terminate_ffmpeg_by_process,
                                    args=(ffmpeg_proc,),
                                    daemon=True
                                ).start()
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Process terminated successfully", "cancelled": cancelled_any}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=1426):
    # Pre-initialize system specs asynchronously in a background thread so HTTP server binds IMMEDIATELY
    threading.Thread(target=init_system_specs, daemon=True).start()
    server_address = ('', port)
    httpd = HTTPServer(server_address, RenderHTTPRequestHandler)
    print(f"==================================================")
    print(f" [AudioMix Backend Server] Running on port {port}")
    print(f"==================================================")
    httpd.serve_forever()

def main():
    parser = argparse.ArgumentParser(description="AudioMix Studio Python Video Exporter")
    parser.add_argument("--config", help="Path to config.json file for CLI execution")
    parser.add_argument("--server", action="store_true", help="Start HTTP server on port 1426")
    parser.add_argument("--port", type=int, default=1426, help="Port for HTTP server (default: 1426)")
    args = parser.parse_args()

    if args.server:
        run_server(args.port)
        return

    if not args.config:
        # Default fallback to server mode if no config argument passed
        run_server(args.port)
        return

    if not os.path.exists(args.config):
        print(f"Error: Config file not found at {args.config}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(args.config, 'r') as f:
            config = json.load(f)
    except Exception as e:
        print(f"Error parsing config JSON: {e}", file=sys.stderr)
        sys.exit(1)

    print("PROGRESS:5:Configuration loaded successfully.")
    sys.stdout.flush()
    
    try:
        render_video(config)
    except Exception as e:
        print(f"PROGRESS:100:Error during render: {e}")
        print(f"Error during render: {e}", file=sys.stderr)
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
