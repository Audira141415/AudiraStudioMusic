import os
import sys
import json
import subprocess
import re
import math
import cv2
import random
import numpy as np

def parse_lrc_lyrics(lrc_path_or_content):
    lyrics_list = []
    if not lrc_path_or_content:
        return lyrics_list
        
    content = ""
    if os.path.exists(str(lrc_path_or_content)):
        try:
            with open(lrc_path_or_content, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            pass
    else:
        content = str(lrc_path_or_content)
        
    if not content:
        return lyrics_list
        
    lines = content.split('\n')
    time_regex = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\]")
    for line in lines:
        match = time_regex.search(line)
        if match:
            minutes = int(match.group(1))
            seconds = float(match.group(2))
            lyric_time = minutes * 60 + seconds
            text = time_regex.sub('', line).strip()
            lyrics_list.append({"time": lyric_time, "text": text})
            
    lyrics_list.sort(key=lambda x: x["time"])
    return lyrics_list

def extract_audio_peaks(audio_path, fps):
    cmd = [
        "ffmpeg", "-y",
        "-i", audio_path,
        "-ac", "1",
        "-ar", str(fps),
        "-"
    ]
    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        raw_data, _ = process.communicate()
        if process.returncode == 0 and raw_data:
            samples = np.frombuffer(raw_data, dtype=np.uint8)
            peaks = np.abs(samples.astype(np.float32) - 128.0) / 128.0
            return peaks.tolist()
    except Exception as e:
        print(f"WARNING: extract_audio_peaks failed: {e}")
def check_gpu_encoders():
    """Detect hardware GPU video encoders available on this system via FFmpeg."""
    codecs = {"h264_nvenc": False, "hevc_nvenc": False, "h264_amf": False, "hevc_amf": False, "h264_qsv": False, "hevc_qsv": False}
    try:
        cmd = ["ffmpeg", "-encoders"]
        output = subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True, errors="ignore")
        for codec in codecs:
            if codec in output:
                codecs[codec] = True
    except Exception as e:
        print(f"check_gpu_encoders warning: {e}")
    
    has_nvidia = codecs["h264_nvenc"] or codecs["hevc_nvenc"]
    has_amd = codecs["h264_amf"] or codecs["hevc_amf"]
    has_intel = codecs["h264_qsv"] or codecs["hevc_qsv"]
    
    return {
        "codecs": codecs,
        "has_nvidia": has_nvidia,
        "has_amd": has_amd,
        "has_intel": has_intel,
        "cpu_count": os.cpu_count() or 4
    }

# Thread-local storage for per-job FFmpeg subprocess tracking
# Each parallel worker thread has its own ffmpeg_process reference
_thread_local = threading.local()
CACHED_WORKING_CODEC = None

def get_active_ffmpeg_process():
    """Get the active FFmpeg process for the current worker thread."""
    return getattr(_thread_local, 'ffmpeg_process', None)

def set_active_ffmpeg_process(proc):
    """Set the active FFmpeg process for the current worker thread."""
    _thread_local.ffmpeg_process = proc

def terminate_ffmpeg():
    """Terminate the FFmpeg process for the current worker thread (legacy API)."""
    proc = get_active_ffmpeg_process()
    if proc:
        try:
            print("Terminating running FFmpeg subprocess...")
            sys.stdout.flush()
            proc.terminate()
            try:
                proc.wait(timeout=1.0)
            except Exception:
                proc.kill()
            print("FFmpeg process terminated.")
            sys.stdout.flush()
        except Exception as e:
            print(f"Error terminating FFmpeg: {e}")
            sys.stdout.flush()
        set_active_ffmpeg_process(None)

def terminate_ffmpeg_by_process(proc):
    """Terminate a specific FFmpeg subprocess (for per-job cancel in parallel rendering)."""
    if proc:
        try:
            print("Terminating FFmpeg subprocess for specific job...")
            sys.stdout.flush()
            proc.terminate()
            try:
                proc.wait(timeout=1.0)
            except Exception:
                proc.kill()
            print("FFmpeg process for job terminated.")
            sys.stdout.flush()
        except Exception as e:
            print(f"Error terminating FFmpeg for job: {e}")
            sys.stdout.flush()
def get_audio_duration(audio_path):
    """
    Runs ffprobe to extract audio duration in seconds.
    Falls back to 10.0 if not extractable.
    """
    try:
        cmd = [
            "ffprobe", 
            "-v", "error", 
            "-show_entries", "format=duration", 
            "-of", "default=noprint_wrappers=1:nokey=1", 
            audio_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(result.stdout.strip())
    except Exception as e:
        print(f"Warning: Could not get audio duration: {e}. Defaulting to 15.0 seconds.")
        return 15.0

def get_font_arg():
    if os.name == 'nt': # Windows
        paths = [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
            "C:/Windows/Fonts/msyh.ttc"
        ]
        for p in paths:
            if os.path.exists(p):
                return p.replace(":", "\\:")
    else: # Unix
        paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
            "/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc"
        ]
        for p in paths:
            if os.path.exists(p):
                return p
    return None

def create_gradient_bmp(width, height, color1_hex, color2_hex, grad_type, angle, path):
    # Standardize hex string formats
    c1_str = color1_hex.replace("#", "")
    c2_str = color2_hex.replace("#", "")
    
    # Fill defaults if invalid hex
    if len(c1_str) != 6: c1_str = "1e1b4b"
    if len(c2_str) != 6: c2_str = "5b21b6"
    
    c1 = [int(c1_str[i:i+2], 16) for i in (0, 2, 4)]
    c2 = [int(c2_str[i:i+2], 16) for i in (0, 2, 4)]
    
    row_size = (width * 3 + 3) & ~3
    pixel_data_size = row_size * height
    file_size = 54 + pixel_data_size
    
    header = bytearray(54)
    header[0:2] = b'BM'
    header[2:6] = file_size.to_bytes(4, 'little')
    header[10:14] = (54).to_bytes(4, 'little')
    header[14:18] = (40).to_bytes(4, 'little')
    header[18:22] = width.to_bytes(4, 'little')
    header[22:26] = height.to_bytes(4, 'little')
    header[26:28] = (1).to_bytes(2, 'little')
    header[28:30] = (24).to_bytes(2, 'little')
    header[34:38] = pixel_data_size.to_bytes(4, 'little')
    
    angle_rad = (angle * math.pi) / 180.0
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    
    # Calculate gradient vector span
    max_proj = abs(width * cos_a) + abs(height * sin_a)
    if max_proj == 0: max_proj = 1.0
    
    with open(path, 'wb') as f:
        f.write(header)
        for y in range(height):
            row = bytearray(row_size)
            for x in range(width):
                if grad_type == 'solid':
                    r, g, b = c1
                else:
                    # Projection mapping
                    proj = (x - width/2.0) * cos_a + (y - height/2.0) * sin_a
                    factor = (proj / max_proj) + 0.5
                    factor = max(0.0, min(1.0, factor))
                    
                    r = int(c1[0] * (1.0 - factor) + c2[0] * factor)
                    g = int(c1[1] * (1.0 - factor) + c2[1] * factor)
                    b = int(c1[2] * (1.0 - factor) + c2[2] * factor)
                
                idx = x * 3
                row[idx] = b
                row[idx+1] = g
                row[idx+2] = r
            f.write(row)

def get_audio_frequencies(audio_path, total_frames, fps, num_bins=128):
    cmd = [
        "ffmpeg", "-y",
        "-i", audio_path,
        "-ac", "1",
        "-ar", "44100",
        "-f", "f32le",
        "-"
    ]
    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        raw_data, _ = process.communicate()
        if process.returncode == 0 and raw_data:
            samples = np.frombuffer(raw_data, dtype=np.float32)
        else:
            samples = np.zeros(int(total_frames * 44100 / fps) + 44100, dtype=np.float32)
    except Exception:
        samples = np.zeros(int(total_frames * 44100 / fps) + 44100, dtype=np.float32)
        
    frame_frequencies = []
    fft_size = 256
    hanning_window = np.hanning(fft_size)
    samples_per_frame = 44100.0 / fps
    
    for frame_idx in range(total_frames):
        center_sample = int(frame_idx * samples_per_frame)
        start = max(0, center_sample - fft_size // 2)
        end = start + fft_size
        
        if start >= len(samples):
            chunk = np.zeros(fft_size, dtype=np.float32)
        else:
            chunk = samples[start:end]
            if len(chunk) < fft_size:
                chunk = np.pad(chunk, (0, fft_size - len(chunk)), 'constant')
            
        windowed = chunk * hanning_window
        fft_complex = np.fft.rfft(windowed, n=fft_size)
        magnitude = np.abs(fft_complex)
        
        eps = 1e-10
        norm_mag = magnitude / fft_size
        db = 20 * np.log10(norm_mag + eps)
        
        scaled = 255.0 * (db - (-100)) / (-30 - (-100))
        scaled = np.clip(scaled, 0, 255)
        
        bins = scaled[:num_bins]
        if len(bins) < num_bins:
            bins = np.pad(bins, (0, num_bins - len(bins)), 'constant')
            
        frame_frequencies.append(bins)
        
    return frame_frequencies

def get_focus_sliced_data(dataArray, focus):
    if focus == 'Low-End (Bass)':
        sliced = dataArray[0:25]
    elif focus == 'Mid-Range (Vocals)':
        sliced = dataArray[25:83]
    elif focus == 'High-End (Treble)':
        sliced = dataArray[83:128]
    else:
        sliced = dataArray[:]
    return sliced

def get_bar_value(sliced_data, i, num_bars, reverse=False):
    freq_span = len(sliced_data)
    if freq_span == 0:
        return 0.0
    idx = int((i / num_bars) * freq_span)
    if reverse:
        idx = freq_span - 1 - idx
    idx = max(0, min(freq_span - 1, idx))
    return float(sliced_data[idx])

def generate_linear_gradient_mask(width, height, c1, c2, angle):
    angle_rad = (angle * math.pi) / 180.0
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    
    y_indices, x_indices = np.indices((height, width))
    
    max_proj = abs(width * cos_a) + abs(height * sin_a)
    if max_proj == 0:
        max_proj = 1.0
    
    proj = (x_indices - width/2.0) * cos_a + (y_indices - height/2.0) * sin_a
    factor = (proj / max_proj) + 0.5
    factor = np.clip(factor, 0.0, 1.0)
    
    grad = np.zeros((height, width, 4), dtype=np.uint8)
    for c in range(3):
        grad[:, :, c] = (c1[c] * (1.0 - factor) + c2[c] * factor).astype(np.uint8)
    grad[:, :, 3] = int(c1[3] if len(c1) > 3 else 255)
    return grad

def draw_spectrum_layers(frame, dataArray, settings, t, width, height, vis_layer_normal=None, vis_layer_antialiased=None):
    spectrum_layers = settings.get("spectrumLayers", [])
    if not spectrum_layers:
        if settings.get("specShow", True):
            spectrum_layers = [{
                "specShow": True,
                "visualizerType": settings.get("visualizerType", "bars"),
                "barColor": settings.get("barColor", "#8B5CF6"),
                "specFocus": settings.get("specFocus", "Semua Frekuensi (Standard)"),
                "specGlow": settings.get("specGlow", False),
                "specPulse": settings.get("specPulse", False),
                "specWidthPct": settings.get("specWidthPct", 1.0),
                "specScale": settings.get("specScale", 1.0),
                "specHeight": settings.get("specHeight", 1.0),
                "specOpacity": settings.get("specOpacity", 100),
                "specRotation": settings.get("specRotation", 0),
                "specSpeed": settings.get("specSpeed", 1.0),
                "specReverse": settings.get("specReverse", "Normal (Tidak Dibalik)"),
                "specPosX": settings.get("specPosX", 640),
                "specPosY": settings.get("specPosY", 560),
            }]
            
    sensitivity = float(settings.get("sensitivity", 1.2))
    scale_x = width / 1280.0
    scale_y = height / 720.0
    volume_factor = np.mean(dataArray) / 255.0
    
    def hex_to_bgr(hex_str):
        if not hex_str:
            return (246, 92, 139)
        hex_str = hex_str.replace("#", "")
        if len(hex_str) == 6:
            return (int(hex_str[4:6], 16), int(hex_str[2:4], 16), int(hex_str[0:2], 16))
        return (246, 92, 139)
        
    for layer in spectrum_layers:
        if not layer.get("specShow", True):
            continue
            
        vis_type = layer.get("visualizerType", "bars")
        bar_color_bgr = hex_to_bgr(layer.get("barColor", "#8B5CF6"))
        opacity = float(layer.get("specOpacity", 100)) / 100.0
        
        is_gradient = layer.get("barColorType") == "gradient"
        color2_hex = layer.get("barColor2", "#A78BFA")
        grad_angle = layer.get("barGradientAngle", 90)
        
        color_bgra1 = (bar_color_bgr[0], bar_color_bgr[1], bar_color_bgr[2], int(255 * opacity))
        color_bgra2 = hex_to_bgr(color2_hex)
        color_bgra2 = (color_bgra2[0], color_bgra2[1], color_bgra2[2], int(255 * opacity))
        
        pos_x = float(layer.get("specPosX", 640)) * scale_x
        pos_y = float(layer.get("specPosY", 560)) * scale_y
        rot_deg = float(layer.get("specRotation", 0))
        rot_speed = float(layer.get("specSpeed", 1.0))
        reverse_rot = layer.get("specReverse") == "Reverse (Dibalik)"
        
        if vis_type in ["circular", "double-circular", "radial-star", "ambient-glow"]:
            direction = -1.0 if reverse_rot else 1.0
            rot_deg += (t * rot_speed * 0.25 * (180.0 / math.pi)) * direction
            
        rot_rad = rot_deg * math.pi / 180.0
        scale_w = float(layer.get("specWidthPct", 1.0))
        scale_h = float(layer.get("specScale", 1.0))
        amp_height = float(layer.get("specHeight", 1.0))
        
        spec_pulse_amp = (1.0 + volume_factor * 0.45) if layer.get("specPulse", False) else 1.0
        
        focus = layer.get("specFocus", "Semua Frekuensi (Standard)")
        sliced_data = get_focus_sliced_data(dataArray, focus)
        
        bar_w = float(settings.get("barWidth", 4))
        bar_gap = float(settings.get("barSpacing", 3))
        
        num_bars = int(1000 / max(1, bar_w + bar_gap)) or 142
        total_width = num_bars * (bar_w + bar_gap) - bar_gap
        start_x = -total_width / 2.0
        
        pos_x_orig = pos_x
        pos_y_orig = pos_y
        
        # Calculate mathematical bounding box coordinates
        max_h = 300 * scale_y * amp_height * spec_pulse_amp
        max_r = (130 + 110 + 25) * scale_y * spec_pulse_amp
        
        if vis_type in ['bars', 'symmetric', 'retro', 'line', 'liquid-wave']:
            y1_box = max(0, int(pos_y_orig - max_h - 10))
            y2_box = min(height, int(pos_y_orig + max_h + 10))
            x1_box = max(0, int(pos_x_orig - (total_width * scale_w * scale_x) / 2.0 - 10))
            x2_box = min(width, int(pos_x_orig + (total_width * scale_w * scale_x) / 2.0 + 10))
        else:
            y1_box = max(0, int(pos_y_orig - max_r - 10))
            y2_box = min(height, int(pos_y_orig + max_r + 10))
            x1_box = max(0, int(pos_x_orig - max_r - 10))
            x2_box = min(width, int(pos_x_orig - max_r + 10))
            
        # Supersampling Antialiasing (SSAA) - only needed for polygon-fill visualizer types to smooth curves/slopes
        is_antialiased = settings.get("specAntialiasing", True) and (vis_type in ['bars', 'symmetric', 'wave-fill', 'liquid-wave'])
        is_direct_draw = (not layer.get("specGlow", False)) and (opacity == 1.0) and (not is_antialiased) and (not is_gradient)
        supersample_factor = 1.5 if is_antialiased else 1.0
        
        scale_x_orig = scale_x
        scale_y_orig = scale_y
        
        scale_x = scale_x_orig * supersample_factor
        scale_y = scale_y_orig * supersample_factor
        pos_x = pos_x_orig * supersample_factor
        pos_y = pos_y_orig * supersample_factor
        
        cos_rot = math.cos(rot_rad)
        sin_rot = math.sin(rot_rad)
        
        def transform_point(lx, ly):
            xs = lx * scale_w * scale_x
            ys = ly * scale_h * scale_y
            xr = xs * cos_rot - ys * sin_rot
            yr = xs * sin_rot + ys * cos_rot
            return int(xr + pos_x), int(yr + pos_y)

        if is_direct_draw:
            vis_layer = frame
        else:
            if is_antialiased:
                if vis_layer_antialiased is not None:
                    vis_layer = vis_layer_antialiased
                    vis_layer.fill(0)
                else:
                    vis_layer = np.zeros((int(height * supersample_factor), int(width * supersample_factor), 4), dtype=np.uint8)
            else:
                if vis_layer_normal is not None:
                    vis_layer = vis_layer_normal
                    vis_layer.fill(0)
                else:
                    vis_layer = np.zeros_like(frame)
            
        color_bgra = (255, 255, 255, 255) if is_gradient else color_bgra1
        
        if vis_type == 'bars':
            for i in range(num_bars):
                raw_val = get_bar_value(sliced_data, i, num_bars, layer.get("specReverse") == "Reverse (Dibalik)")
                val = (raw_val / 255.0) * 350.0 * sensitivity * amp_height * spec_pulse_amp
                x = start_x + i * (bar_w + bar_gap)
                p1 = transform_point(x, 0)
                p2 = transform_point(x + bar_w, 0)
                p3 = transform_point(x + bar_w, -val)
                p4 = transform_point(x, -val)
                cv2.fillPoly(vis_layer, [np.array([p1, p2, p3, p4], dtype=np.int32)], color_bgra)
                
        elif vis_type == 'symmetric':
            half_bars = num_bars // 2
            for i in range(half_bars):
                raw_val = get_bar_value(sliced_data, i, half_bars, layer.get("specReverse") == "Reverse (Dibalik)")
                val = (raw_val / 255.0) * 350.0 * sensitivity * amp_height * spec_pulse_amp
                
                x_r = i * (bar_w + bar_gap)
                p1_r = transform_point(x_r, 0)
                p2_r = transform_point(x_r + bar_w, 0)
                p3_r = transform_point(x_r + bar_w, -val)
                p4_r = transform_point(x_r, -val)
                cv2.fillPoly(vis_layer, [np.array([p1_r, p2_r, p3_r, p4_r], dtype=np.int32)], color_bgra)
                
                x_l = -i * (bar_w + bar_gap) - bar_w
                p1_l = transform_point(x_l, 0)
                p2_l = transform_point(x_l + bar_w, 0)
                p3_l = transform_point(x_l + bar_w, -val)
                p4_l = transform_point(x_l, -val)
                cv2.fillPoly(vis_layer, [np.array([p1_l, p2_l, p3_l, p4_l], dtype=np.int32)], color_bgra)
                
        elif vis_type == 'retro':
            block_size = 6.0
            block_gap = 2.0
            for i in range(num_bars):
                raw_val = get_bar_value(sliced_data, i, num_bars, layer.get("specReverse") == "Reverse (Dibalik)")
                val = (raw_val / 255.0) * 350.0 * sensitivity * amp_height * spec_pulse_amp
                x = start_x + i * (bar_w + bar_gap)
                
                num_blocks = int(val / (block_size + block_gap))
                for j in range(max(1, num_blocks)):
                    y = -j * (block_size + block_gap)
                    p1 = transform_point(x, y)
                    p2 = transform_point(x + bar_w, y)
                    p3 = transform_point(x + bar_w, y - block_size)
                    p4 = transform_point(x, y - block_size)
                    cv2.fillPoly(vis_layer, [np.array([p1, p2, p3, p4], dtype=np.int32)], color_bgra)
                    
        elif vis_type == 'wave':
            pts = []
            for i in range(num_bars):
                raw_val = get_bar_value(sliced_data, i, num_bars, layer.get("specReverse") == "Reverse (Dibalik)")
                val = ((raw_val - 128.0) / 128.0) * 160.0 * sensitivity * amp_height * spec_pulse_amp
                x = start_x + i * (bar_w + bar_gap)
                pts.append(transform_point(x, val))
            if len(pts) > 1:
                cv2.polylines(vis_layer, [np.array(pts, dtype=np.int32)], False, color_bgra, int(settings.get("barWidth", 4) * scale_y), cv2.LINE_AA)
                
        elif vis_type == 'wave-fill':
            pts = []
            for i in range(num_bars):
                raw_val = get_bar_value(sliced_data, i, num_bars, layer.get("specReverse") == "Reverse (Dibalik)")
                val = ((raw_val - 128.0) / 128.0) * 160.0 * sensitivity * amp_height * spec_pulse_amp
                x = start_x + i * (bar_w + bar_gap)
                pts.append(transform_point(x, val))
                
            if len(pts) > 1:
                p_end = transform_point(start_x + (num_bars - 1) * (bar_w + bar_gap), 0)
                p_start = transform_point(start_x, 0)
                poly_pts = pts + [p_end, p_start]
                fill_color = (bar_color_bgr[0], bar_color_bgr[1], bar_color_bgr[2], int(255 * 0.25 * opacity))
                cv2.fillPoly(vis_layer, [np.array(poly_pts, dtype=np.int32)], fill_color)
                cv2.polylines(vis_layer, [np.array(pts, dtype=np.int32)], False, color_bgra, int(settings.get("barWidth", 4) * scale_y), cv2.LINE_AA)
                
        elif vis_type == 'circular':
            base_radius = (130.0 + volume_factor * 25.0)
            num_circles = min(100, num_bars)
            for i in range(num_circles):
                raw_val = get_bar_value(sliced_data, i, num_circles, layer.get("specReverse") == "Reverse (Dibalik)")
                val = (raw_val / 255.0) * 110.0 * sensitivity * amp_height * spec_pulse_amp
                angle = (i / num_circles) * math.pi * 2.0
                
                x1 = math.cos(angle) * base_radius
                y1 = math.sin(angle) * base_radius
                x2 = math.cos(angle) * (base_radius + val)
                y2 = math.sin(angle) * (base_radius + val)
                
                p1 = transform_point(x1, y1)
                p2 = transform_point(x2, y2)
                cv2.line(vis_layer, p1, p2, color_bgra, int(settings.get("barWidth", 4) * scale_y), cv2.LINE_AA)
                
        elif vis_type == 'double-circular':
            base_radius = (130.0 + volume_factor * 25.0)
            num_circles = min(100, num_bars)
            for i in range(num_circles):
                raw_val = get_bar_value(sliced_data, i, num_circles, layer.get("specReverse") == "Reverse (Dibalik)")
                val = (raw_val / 255.0) * 110.0 * sensitivity * amp_height * spec_pulse_amp
                angle = (i / num_circles) * math.pi * 2.0
                
                x1 = math.cos(angle) * base_radius
                y1 = math.sin(angle) * base_radius
                x2 = math.cos(angle) * (base_radius + val)
                y2 = math.sin(angle) * (base_radius + val)
                
                p1 = transform_point(x1, y1)
                p2 = transform_point(x2, y2)
                cv2.line(vis_layer, p1, p2, color_bgra, int(settings.get("barWidth", 4) * scale_y), cv2.LINE_AA)
                
                inner_val = val * 0.45
                x3 = math.cos(angle) * (base_radius - inner_val)
                y3 = math.sin(angle) * (base_radius - inner_val)
                p3 = transform_point(x3, y3)
                cv2.line(vis_layer, p1, p3, color_bgra, int(settings.get("barWidth", 4) * scale_y), cv2.LINE_AA)
                
        elif vis_type == 'radial-star':
            num_circles = min(120, num_bars)
            for i in range(num_circles):
                raw_val = get_bar_value(sliced_data, i, num_circles, layer.get("specReverse") == "Reverse (Dibalik)")
                val = (raw_val / 255.0) * 150.0 * sensitivity * amp_height * spec_pulse_amp
                angle = (i / num_circles) * math.pi * 2.0
                
                base_rad_star = 50.0 + volume_factor * 12.0
                x1 = math.cos(angle) * base_rad_star
                y1 = math.sin(angle) * base_rad_star
                x2 = math.cos(angle) * (base_rad_star + val)
                y2 = math.sin(angle) * (base_rad_star + val)
                
                p1 = transform_point(x1, y1)
                p2 = transform_point(x2, y2)
                cv2.line(vis_layer, p1, p2, color_bgra, int(2.0 * scale_y), cv2.LINE_AA)
                
        elif vis_type == 'liquid-wave':
            pts = []
            for i in range(num_bars):
                raw_val = get_bar_value(sliced_data, i, num_bars, False)
                val = (raw_val / 255.0) * 160.0 * sensitivity * amp_height * spec_pulse_amp
                x = start_x + i * (bar_w + bar_gap)
                y = -val + math.sin(i * 0.15 + t * 4.0) * 8.0
                pts.append(transform_point(x, y))
                
            if len(pts) > 1:
                p_end = transform_point(start_x + (num_bars - 1) * (bar_w + bar_gap), 0)
                p_start = transform_point(start_x, 0)
                poly_pts = pts + [p_end, p_start]
                fill_color = (bar_color_bgr[0], bar_color_bgr[1], bar_color_bgr[2], int(255 * 0.25 * opacity))
                cv2.fillPoly(vis_layer, [np.array(poly_pts, dtype=np.int32)], fill_color)
                cv2.polylines(vis_layer, [np.array(pts, dtype=np.int32)], False, color_bgra, int(settings.get("barWidth", 4) * scale_y), cv2.LINE_AA)
                
        elif vis_type == 'glow-particles':
            num_particles = min(45, num_bars)
            for i in range(num_particles):
                raw_val = get_bar_value(sliced_data, i, num_particles, False)
                val = (raw_val / 255.0) * sensitivity * spec_pulse_amp
                
                x = start_x + (i / float(num_particles)) * (num_bars * (bar_w + bar_gap))
                y = -val * 280.0 - abs(math.sin(t * 1.5 + i) * 60.0)
                r = int(max(3.0, val * 16.0) * scale_y)
                
                pt = transform_point(x, y)
                cv2.circle(vis_layer, pt, r, color_bgra, -1, cv2.LINE_AA)
                
        elif vis_type == 'cyber-grid':
            segment_h = 8.0
            segment_gap = 3.0
            for i in range(num_bars):
                raw_val = get_bar_value(sliced_data, i, num_bars, False)
                val = (raw_val / 255.0) * 280.0 * sensitivity * amp_height * spec_pulse_amp
                x = start_x + i * (bar_w + bar_gap)
                
                segments = int(val / (segment_h + segment_gap))
                for j in range(max(1, segments)):
                    y = -j * (segment_h + segment_gap)
                    p1 = transform_point(x, y)
                    p2 = transform_point(x + bar_w, y)
                    p3 = transform_point(x + bar_w, y - segment_h)
                    p4 = transform_point(x, y - segment_h)
                    cv2.fillPoly(vis_layer, [np.array([p1, p2, p3, p4], dtype=np.int32)], color_bgra)
                    
        elif vis_type == 'ambient-glow':
            base_radius = (80.0 + volume_factor * 45.0)
            for r_offset in [0, 10, 20]:
                r = int((base_radius + r_offset) * scale_y)
                pt = transform_point(0, 0)
                cv2.circle(vis_layer, pt, r, color_bgra, int(3 * scale_y), cv2.LINE_AA)

        if not is_direct_draw:
            if is_gradient:
                h_layer, w_layer = vis_layer.shape[:2]
                grad_tex = generate_linear_gradient_mask(w_layer, h_layer, color_bgra1, color_bgra2, grad_angle)
                vis_layer = ((vis_layer.astype(np.float32) / 255.0) * grad_tex.astype(np.float32)).astype(np.uint8)
                
            if is_antialiased:
                vis_layer = cv2.resize(vis_layer, (width, height), interpolation=cv2.INTER_AREA)
                
            y1, y2 = y1_box, y2_box
            x1, x2 = x1_box, x2_box
            
            if y2 > y1 and x2 > x1:
                if layer.get("specGlow", False):
                    blur_size = max(3, int(15 * scale_y_orig / 4)) | 1
                    pad_val = blur_size * 2
                    y1_p, y2_p = max(0, y1 - pad_val), min(height, y2 + pad_val)
                    x1_p, x2_p = max(0, x1 - pad_val), min(width, x2 + pad_val)
                    
                    crop_vis = vis_layer[y1_p:y2_p, x1_p:x2_p]
                    small_w = max(4, int((x2_p - x1_p) / 4))
                    small_h = max(4, int((y2_p - y1_p) / 4))
                    small_vis = cv2.resize(crop_vis, (small_w, small_h), interpolation=cv2.INTER_AREA)
                    small_blur = cv2.GaussianBlur(small_vis, (max(3, blur_size // 4 | 1), max(3, blur_size // 4 | 1)), 0)
                    local_glow = cv2.resize(small_blur, (x2_p - x1_p, y2_p - y1_p), interpolation=cv2.INTER_CUBIC)
                    
                    # Subtraction-based integer blend for local glow
                    roi_glow = frame[y1_p:y2_p, x1_p:x2_p, :3]
                    local_glow_rgb = local_glow[:, :, :3]
                    alpha_glow = local_glow[:, :, 3:4]
                    diff_glow = local_glow_rgb.astype(np.int16) - roi_glow
                    frame[y1_p:y2_p, x1_p:x2_p, :3] = (roi_glow + ((diff_glow * alpha_glow) >> 8)).astype(np.uint8)
                    
                vis_crop = vis_layer[y1:y2, x1:x2]
                roi_vis = frame[y1:y2, x1:x2, :3]
                vis_crop_rgb = vis_crop[:, :, :3]
                alpha_crop = vis_crop[:, :, 3:4]
                diff_vis = vis_crop_rgb.astype(np.int16) - roi_vis
                frame[y1:y2, x1:x2, :3] = (roi_vis + ((diff_vis * alpha_crop) >> 8)).astype(np.uint8)

def draw_text_overlays(frame, settings, t, volumeFactor, width, height, draw_title=True):
    from PIL import Image, ImageDraw, ImageFont
    
    show_title = settings.get("showTitle", True) and draw_title
    show_lyrics = settings.get("showLyrics", True) and (settings.get("lyricsContent") or settings.get("lyricPath"))
    
    if not show_title and not show_lyrics:
        return
        
    title_text = settings.get("titleText", settings.get("textTitle", "Futuristic Resonance"))
    artist_text = settings.get("textArtist", "Audira Clip AI Studio")
    
    scale_x = width / 1280.0
    scale_y = height / 720.0
    
    pos_x = float(settings.get("titlePosX", 640)) * scale_x
    pos_y = float(settings.get("titlePosY", (float(settings.get("textPosition", 50)) / 100.0) * 720)) * scale_y
    title_font_size = int(float(settings.get("titleFontSize", settings.get("textSize", 36))) * scale_y)
    
    color1 = settings.get("titleColor1", settings.get("textColor", "#FFFFFF"))
    color2 = settings.get("titleColor2", "#EC4899")
    
    font_type = settings.get("fontType", "Outfit (Standard)")
    
    selected_path = "arialbd.ttf"
    custom_font_path = settings.get("customFontPath")
    if custom_font_path and os.path.exists(custom_font_path):
        selected_path = custom_font_path
    else:
        font_paths = {
            "Poppins (Modern)": ["Poppins-Bold.ttf", "poppins.ttf", "arialbd.ttf"],
            "Playfair (Klasik Mewah)": ["PlayfairDisplay-Bold.ttf", "playfair.ttf", "georgiab.ttf"],
            "Inter (Sederhana/Sleek)": ["Inter-Bold.ttf", "inter.ttf", "segoeuib.ttf"],
            "Outfit (Standard)": ["Outfit-Bold.ttf", "outfit.ttf", "arialbd.ttf"]
        }
        candidates = font_paths.get(font_type, ["arialbd.ttf"])
        for cand in candidates:
            full_path = os.path.join("C:\\Windows\\Fonts", cand)
            if os.path.exists(full_path):
                selected_path = full_path
                break
                
    try:
        title_font = ImageFont.truetype(selected_path, title_font_size)
        artist_font_size = max(16, int(title_font_size * 0.6))
        artist_font = ImageFont.truetype(selected_path, artist_font_size)
    except Exception:
        title_font = ImageFont.load_default()
        artist_font = ImageFont.load_default()
        
    text_alpha = 1.0
    if settings.get("titleDisplayMode") == "Tampil 10 Detik Awal":
        elapsed_sec = t
        if elapsed_sec > 10:
            text_alpha = max(0.0, 1.0 - (elapsed_sec - 10.0) * 0.8)
            
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2RGBA)
    pil_img = Image.fromarray(rgb_frame)
    draw = ImageDraw.Draw(pil_img)
    
    def parse_hex_rgba(hex_str, alpha_pct):
        hex_str = hex_str.replace("#", "")
        r, g, b = 255, 255, 255
        if len(hex_str) == 6:
            r = int(hex_str[0:2], 16)
            g = int(hex_str[2:4], 16)
            b = int(hex_str[4:6], 16)
        return (r, g, b, int(255 * alpha_pct * text_alpha))
        
    if show_title and text_alpha > 0:
        c1_rgba = parse_hex_rgba(color1, 1.0)
        c2_rgba = parse_hex_rgba(color2, 1.0)
        artist_rgba = parse_hex_rgba(settings.get("textColor", "#FFFFFF"), 1.0)
        
        lines = title_text.split('\n')
        has_outline = settings.get("titleOutline", False)
        has_beat_glow = settings.get("titleBeatGlow", False)
        
        for idx, line_text in enumerate(lines):
            line_color = c1_rgba if idx == 0 else c2_rgba
            y_pos = pos_y + idx * (title_font_size * 1.1)
            
            try:
                bbox = draw.textbbox((0, 0), line_text, font=title_font)
                text_w = bbox[2] - bbox[0]
            except Exception:
                text_w = len(line_text) * (title_font_size * 0.6)
                
            x_pos = pos_x - text_w / 2
            
            if has_beat_glow:
                glow_radius = int(5 + volumeFactor * 12)
                glow_color = (line_color[0], line_color[1], line_color[2], int(line_color[3] * 0.4))
                for ox in range(-glow_radius, glow_radius + 1, 2):
                    for oy in range(-glow_radius, glow_radius + 1, 2):
                        if ox*ox + oy*oy <= glow_radius*glow_radius:
                            draw.text((x_pos + ox, y_pos + oy), line_text, font=title_font, fill=glow_color)
            else:
                shadow_opacity = float(settings.get("shadowOpacity", 60)) / 100.0
                shadow_color = (0, 0, 0, int(255 * shadow_opacity * text_alpha))
                shadow_dist = int(settings.get("shadowDistance", 6) * scale_y)
                draw.text((x_pos + 2, y_pos + shadow_dist), line_text, font=title_font, fill=shadow_color)
                
            if has_outline:
                stroke_w = max(2, int(title_font_size * 0.08))
                draw.text((x_pos, y_pos), line_text, font=title_font, fill=line_color, stroke_width=stroke_w, stroke_fill=(0, 0, 0, int(255 * text_alpha)))
            else:
                draw.text((x_pos, y_pos), line_text, font=title_font, fill=line_color)
                
        try:
            bbox_art = draw.textbbox((0, 0), artist_text, font=artist_font)
            art_w = bbox_art[2] - bbox_art[0]
        except Exception:
            art_w = len(artist_text) * (artist_font_size * 0.6)
            
        x_art = pos_x - art_w / 2
        y_art = pos_y + len(lines) * (title_font_size * 1.05) + 12 * scale_y
        
        draw.text((x_art + 1, y_art + 2), artist_text, font=artist_font, fill=(0, 0, 0, int(255 * 0.5 * text_alpha)))
        draw.text((x_art, y_art), artist_text, font=artist_font, fill=artist_rgba)

    if show_lyrics:
        lrc_source = settings.get("lyricsContent") or settings.get("lyricPath")
        lyrics_list = parse_lrc_lyrics(lrc_source)
        lyric_offset = float(settings.get("lyricTimeOffset", 0.0))
        adjusted_time = t + lyric_offset
        
        active_lyric_text = ""
        for item in lyrics_list:
            if adjusted_time >= item["time"]:
                active_lyric_text = item["text"]
            else:
                break
                
        if active_lyric_text:
            l_pos_x = float(settings.get("lyricPosX", 640)) * scale_x
            l_pos_y = float(settings.get("lyricPosY", 650)) * scale_y
            l_font_size = int(float(settings.get("lyricFontSize", 40)) * scale_y)
            
            try:
                lyric_font = ImageFont.truetype(selected_path, l_font_size)
            except Exception:
                lyric_font = ImageFont.load_default()
                
            lyric_active_color_hex = settings.get("lyricActiveColor", "#00ffff")
            lyric_rgba = parse_hex_rgba(lyric_active_color_hex, 1.0)
            
            try:
                bbox_lyr = draw.textbbox((0, 0), active_lyric_text, font=lyric_font)
                lyr_w = bbox_lyr[2] - bbox_lyr[0]
                lyr_h = bbox_lyr[3] - bbox_lyr[1]
            except Exception:
                lyr_w = len(active_lyric_text) * (l_font_size * 0.6)
                lyr_h = l_font_size
                
            lx_pos = l_pos_x - lyr_w / 2
            ly_pos = l_pos_y - lyr_h / 2
            
            if settings.get("lyricShowShadow", True):
                sh_color_hex = settings.get("lyricShadowColor", "#000000")
                sh_dist = int(settings.get("lyricShadowDistance", 3) * scale_y)
                sh_rgba = parse_hex_rgba(sh_color_hex, 0.8)
                draw.text((lx_pos + sh_dist, ly_pos + sh_dist), active_lyric_text, font=lyric_font, fill=sh_rgba)
                
            if settings.get("lyricShowGlow", False):
                gl_color_hex = settings.get("lyricGlowColor", "#00ffff")
                gl_radius = int(settings.get("lyricGlowRadius", 10) * scale_y)
                gl_rgba = parse_hex_rgba(gl_color_hex, 0.4)
                for ox in range(-gl_radius, gl_radius + 1, 2):
                    for oy in range(-gl_radius, gl_radius + 1, 2):
                        if ox*ox + oy*oy <= gl_radius*gl_radius:
                            draw.text((lx_pos + ox, ly_pos + oy), active_lyric_text, font=lyric_font, fill=gl_rgba)
                            
            if settings.get("lyricShowOutline", True):
                out_color_hex = settings.get("lyricOutlineColor", "#000000")
                out_w = int(settings.get("lyricOutlineWidth", 3))
                out_rgba = parse_hex_rgba(out_color_hex, 1.0)
                draw.text((lx_pos, ly_pos), active_lyric_text, font=lyric_font, fill=lyric_rgba, stroke_width=out_w, stroke_fill=out_rgba)
            else:
                draw.text((lx_pos, ly_pos), active_lyric_text, font=lyric_font, fill=lyric_rgba)

    rgba_np = np.array(pil_img)
    cv2.cvtColor(rgba_np, cv2.COLOR_RGBA2BGRA, dst=frame)

def draw_logo_overlay(frame, logo_input, settings, volume_factor, width, height):
    if logo_input is None:
        return
        
    scale_x = width / 1280.0
    scale_y = height / 720.0
    
    if isinstance(logo_input, str):
        if not os.path.exists(logo_input):
            return
        logo_img = cv2.imread(logo_input, cv2.IMREAD_UNCHANGED)
    else:
        logo_img = logo_input
        
    if logo_img is None:
        return
        
    if logo_img.shape[2] == 3:
        logo_img = cv2.cvtColor(logo_img, cv2.COLOR_BGR2BGRA)
        
    logo_scale = 1.0
    if settings.get("logoPulseSync", False):
        logo_scale = 1.0 + volume_factor * 0.15
        
    center_x = int(100 * scale_x)
    center_y = int(100 * scale_y)
    base_radius = int(45 * scale_y * logo_scale)
    
    sz = int(90 * scale_y * logo_scale)
    if sz <= 0:
        return
    logo_resized = cv2.resize(logo_img, (sz, sz), interpolation=cv2.INTER_AREA)
    
    mask = np.zeros((sz, sz), dtype=np.uint8)
    cv2.circle(mask, (sz // 2, sz // 2), base_radius, 255, -1)
    
    tx = center_x - sz // 2
    ty = center_y - sz // 2
    
    x1 = max(0, tx)
    y1 = max(0, ty)
    x2 = min(width, tx + sz)
    y2 = min(height, ty + sz)
    
    w_crop = x2 - x1
    h_crop = y2 - y1
    if w_crop <= 0 or h_crop <= 0:
        return
        
    lx1 = x1 - tx
    ly1 = y1 - ty
    logo_crop = logo_resized[ly1:ly1+h_crop, lx1:lx1+w_crop]
    mask_crop = mask[ly1:ly1+h_crop, lx1:lx1+w_crop]
    
    alpha_logo = (logo_crop[:, :, 3] / 255.0) * (mask_crop / 255.0)
    mask_3d = np.expand_dims(alpha_logo, axis=2)
    frame[y1:y2, x1:x2, :3] = (frame[y1:y2, x1:x2, :3] * (1.0 - mask_3d) + logo_crop[:, :, :3] * mask_3d).astype(np.uint8)
        
    cv2.circle(frame, (center_x, center_y), base_radius, (0, 0, 0, 255), int(3 * scale_y), cv2.LINE_AA)

def process_background_frame(bg_src, settings, t, volume_factor, width, height):
    if settings.get("bgFlipH", False):
        bg_src = cv2.flip(bg_src, 1)
    if settings.get("bgFlipV", False):
        bg_src = cv2.flip(bg_src, 0)
        
    fit_mode = settings.get("fitMode", "Fit to Screen (Blurred Background)")
    bg_blur = settings.get("backgroundBlur", 0)
    extra_blur = settings.get("blur", 0)
    total_blur = bg_blur + extra_blur
    
    h_src, w_src = bg_src.shape[:2]
    
    beat_zoom = 1.0
    if settings.get("syncMode") == "Sinkronkan Latar dengan Ketukan (Beat Sync)":
        beat_zoom = 1.0 + volume_factor * 0.04
        
    if fit_mode == "Stretch to Fit":
        bg_frame = cv2.resize(bg_src, (width, height))
        
    elif fit_mode == "Crop to Fill (Proportional)":
        scale = max(width / w_src, height / h_src) * beat_zoom
        new_w = int(w_src * scale)
        new_h = int(h_src * scale)
        resized = cv2.resize(bg_src, (new_w, new_h))
        dx = (new_w - width) // 2
        dy = (new_h - height) // 2
        dx = max(0, min(new_w - width, dx))
        dy = max(0, min(new_h - height, dy))
        bg_frame = resized[dy:dy+height, dx:dx+width]
        
    elif fit_mode == "Fit to Screen (Letterbox)":
        scale = min(width / w_src, height / h_src) * beat_zoom
        new_w = int(w_src * scale)
        new_h = int(h_src * scale)
        resized = cv2.resize(bg_src, (new_w, new_h))
        bg_frame = np.zeros((height, width, 3), dtype=np.uint8)
        dx = (width - new_w) // 2
        dy = (height - new_h) // 2
        x1, y1 = max(0, dx), max(0, dy)
        x2, y2 = min(width, dx + new_w), min(height, dy + new_h)
        rx1, ry1 = max(0, -dx), max(0, -dy)
        rx2, ry2 = rx1 + (x2 - x1), ry1 + (y2 - y1)
        bg_frame[y1:y2, x1:x2] = resized[ry1:ry2, rx1:rx2]
        
    else: # Fit to Screen (Blurred Background)
        scale_bg = max(width / w_src, height / h_src) * beat_zoom
        new_w_bg = int(w_src * scale_bg)
        new_h_bg = int(h_src * scale_bg)
        resized_bg = cv2.resize(bg_src, (new_w_bg, new_h_bg))
        dx_bg = (new_w_bg - width) // 2
        dy_bg = (new_h_bg - height) // 2
        dx_bg = max(0, min(new_w_bg - width, dx_bg))
        dy_bg = max(0, min(new_h_bg - height, dy_bg))
        bg_blur_layer = resized_bg[dy_bg:dy_bg+height, dx_bg:dx_bg+width]
        
        base_blur = max(15, total_blur + 15) | 1
        base_blur = max(15, total_blur + 15) | 1
        h_b, w_b = bg_blur_layer.shape[:2]
        small_bg = cv2.resize(bg_blur_layer, (w_b // 4, h_b // 4), interpolation=cv2.INTER_LINEAR)
        small_blur = cv2.GaussianBlur(small_bg, (max(3, base_blur // 4 | 1), max(3, base_blur // 4 | 1)), 0)
        bg_blur_layer = cv2.resize(small_blur, (w_b, h_b), interpolation=cv2.INTER_LINEAR)
        
        scale_fg = min(width / w_src, height / h_src) * beat_zoom
        new_w_fg = int(w_src * scale_fg)
        new_h_fg = int(h_src * scale_fg)
        resized_fg = cv2.resize(bg_src, (new_w_fg, new_h_fg))
        
        dx_fg = (width - new_w_fg) // 2
        dy_fg = (height - new_h_fg) // 2
        
        bg_frame = bg_blur_layer.copy()
        x1, y1 = max(0, dx_fg), max(0, dy_fg)
        x2, y2 = min(width, dx_fg + new_w_fg), min(height, dy_fg + new_h_fg)
        rx1, ry1 = max(0, -dx_fg), max(0, -dy_fg)
        rx2, ry2 = rx1 + (x2 - x1), ry1 + (y2 - y1)
        bg_frame[y1:y2, x1:x2] = resized_fg[ry1:ry2, rx1:rx2]

    if total_blur > 0 and fit_mode != "Fit to Screen (Blurred Background)":
        blur_k = total_blur | 1
        if blur_k >= 7:
            h_f, w_f = bg_frame.shape[:2]
            small_bg_f = cv2.resize(bg_frame, (w_f // 2, h_f // 2), interpolation=cv2.INTER_LINEAR)
            small_blur_f = cv2.GaussianBlur(small_bg_f, (max(3, blur_k // 2 | 1), max(3, blur_k // 2 | 1)), 0)
            bg_frame = cv2.resize(small_blur_f, (w_f, h_f), interpolation=cv2.INTER_LINEAR)
        else:
            bg_frame = cv2.GaussianBlur(bg_frame, (blur_k, blur_k), 0)
        
    br_ff = (settings.get("brightness", 100) - 100) / 200.0
    co_ff = settings.get("contrast", 100) / 100.0
    sa_ff = settings.get("saturation", 100) / 100.0
    bg_brightness = settings.get("backgroundBrightness", 100)
    
    if bg_brightness < 100:
        shadow_opacity = (100 - bg_brightness) / 100.0
        bg_frame = (bg_frame.astype(np.float32) * (1.0 - shadow_opacity)).astype(np.uint8)
        
    bg_frame = cv2.convertScaleAbs(bg_frame, alpha=co_ff, beta=br_ff * 255.0)
    
    if sa_ff != 1.0:
        hsv = cv2.cvtColor(bg_frame, cv2.COLOR_BGR2HSV).astype(np.float32)
        hsv[:, :, 1] = np.clip(hsv[:, :, 1] * sa_ff, 0, 255)
        bg_frame = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
        
    return bg_frame

def apply_camera_shake(frame, t, intensity, width, height):
    offset_x = int(20 + 15 * math.sin(2.0 * math.pi * t * 14.0) * intensity)
    offset_y = int(20 + 15 * math.cos(2.0 * math.pi * t * 14.0) * intensity)
    
    offset_x = max(0, min(40, offset_x))
    offset_y = max(0, min(40, offset_y))
    
    cropped = frame[offset_y:offset_y + height - 40, offset_x:offset_x + width - 40]
    return cv2.resize(cropped, (width, height))

def render_video(config, job_ref=None):
    # Set Windows Process Priority to HIGH to avoid OS Power Throttling and run on P-Cores
    import sys
    if sys.platform == 'win32':
        import ctypes
        try:
            ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(), 0x00000080)
            ctypes.windll.kernel32.SetThreadExecutionState(0x80000003)
            print("INFO: Windows Process Priority set to HIGH and Power Throttling disabled.")
            sys.stdout.flush()
        except Exception as e:
            print(f"WARNING: Failed to set process priority class: {e}")
            sys.stdout.flush()

    # Extract config
    settings = config.get("settings", {})
    output_path = config.get("outputPath", "exports/visualizer.mp4")
    
    # Ensure export directory exists
    out_dir = os.path.dirname(output_path)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir)

    # 1. Setup fallback assets if paths are dummy or non-existent
    audio_path = config.get("audioPath")
    bg_path = config.get("backgroundPath")
    backend_dir = os.path.dirname(os.path.abspath(__file__))

    # Decode base64 payloads if passed
    import base64
    audio_data = config.get("audioData")
    if audio_data and isinstance(audio_data, str) and audio_data.startswith("data:"):
        try:
            print("PROGRESS:8:Decoding uploaded audio track data...")
            sys.stdout.flush()
            header, encoded = audio_data.split(",", 1)
            audio_bytes = base64.b64decode(encoded)
            audio_path = os.path.join(backend_dir, "temp_uploaded_audio.mp3")
            with open(audio_path, "wb") as f:
                f.write(audio_bytes)
        except Exception as e:
            print(f"Warning: Failed to decode base64 audio: {e}")

    bg_data = config.get("backgroundData")
    if bg_data and isinstance(bg_data, str) and bg_data.startswith("data:"):
        try:
            print("PROGRESS:12:Decoding uploaded background image data...")
            sys.stdout.flush()
            header, encoded = bg_data.split(",", 1)
            bg_bytes = base64.b64decode(encoded)
            bg_path = os.path.join(backend_dir, "temp_uploaded_bg.jpg")
            with open(bg_path, "wb") as f:
                f.write(bg_bytes)
        except Exception as e:
            print(f"Warning: Failed to decode base64 background image: {e}")

    logo_path = config.get("logoPath")
    logo_data = config.get("logoData")
    if logo_data and isinstance(logo_data, str) and logo_data.startswith("data:"):
        try:
            print("PROGRESS:13:Decoding uploaded logo image data...")
            sys.stdout.flush()
            header, encoded = logo_data.split(",", 1)
            logo_bytes = base64.b64decode(encoded)
            logo_path = os.path.join(backend_dir, "temp_uploaded_logo.png")
            with open(logo_path, "wb") as f:
                f.write(logo_bytes)
        except Exception as e:
            print(f"Warning: Failed to decode base64 logo: {e}")

    voiceover_path = config.get("voiceoverPath")
    voiceover_data = config.get("voiceoverData")
    if voiceover_data and isinstance(voiceover_data, str) and voiceover_data.startswith("data:"):
        try:
            print("PROGRESS:14:Decoding uploaded voiceover audio data...")
            sys.stdout.flush()
            header, encoded = voiceover_data.split(",", 1)
            voiceover_bytes = base64.b64decode(encoded)
            voiceover_path = os.path.join(backend_dir, "temp_uploaded_voiceover.mp3")
            with open(voiceover_path, "wb") as f:
                f.write(voiceover_bytes)
        except Exception as e:
            print(f"Warning: Failed to decode base64 voiceover: {e}")

    font_data = config.get("fontData")
    if font_data and isinstance(font_data, str) and font_data.startswith("data:"):
        try:
            print("PROGRESS:14:Decoding uploaded custom font data...")
            sys.stdout.flush()
            header, encoded = font_data.split(",", 1)
            font_bytes = base64.b64decode(encoded)
            custom_font_path = os.path.join(backend_dir, "temp_uploaded_font.ttf")
            with open(custom_font_path, "wb") as f:
                f.write(font_bytes)
            settings['customFontPath'] = custom_font_path
        except Exception as e:
            print(f"Warning: Failed to decode base64 custom font: {e}")

    lyric_data = config.get("lyricData")
    lyric_path = config.get("lyricPath")
    if lyric_data and isinstance(lyric_data, str) and lyric_data.startswith("data:"):
        try:
            print("PROGRESS:14:Decoding uploaded LRC lyric data...")
            sys.stdout.flush()
            header, encoded = lyric_data.split(",", 1)
            lyric_bytes = base64.b64decode(encoded)
            lyric_path = os.path.join(backend_dir, "temp_uploaded_lyrics.lrc")
            with open(lyric_path, "wb") as f:
                f.write(lyric_bytes)
            config['lyricPath'] = lyric_path
        except Exception as e:
            print(f"Warning: Failed to decode base64 LRC lyrics: {e}")

    duration = get_audio_duration(audio_path)
    if settings.get("segmentRender", False):
        duration = min(15.0, duration)
        print(f"PROGRESS:14:Segment render active: Capping duration to {duration} seconds for fast verification.")
    else:
        print(f"PROGRESS:14:Audio track duration resolved: {duration} seconds.")
    sys.stdout.flush()

    fps = settings.get("fps", 60)
    
    # Extract audio amplitude envelope peaks for beat-sync effects and particles
    audio_data = []
    has_beat_data = False
    try:
        print("PROGRESS:5:Extracting audio amplitude peaks for beat-sync visual effects...")
        sys.stdout.flush()
        audio_data = extract_audio_peaks(audio_path, fps)
        if audio_data:
            has_beat_data = True
            print(f"PROGRESS:8:Extracted {len(audio_data)} amplitude peaks successfully.")
            sys.stdout.flush()
    except Exception as e:
        print(f"WARNING: Audio peaks extraction failed: {e}")
        sys.stdout.flush()
    res_str = settings.get("resolution", "1080p")
    if res_str == "720p":
        width, height = 1280, 720
    elif res_str == "4k":
        width, height = 3840, 2160
    else: # 1080p
        width, height = 1920, 1080

    # Print detailed configuration and file sizes for user history console
    try:
        audio_size_mb = os.path.getsize(audio_path) / (1024 * 1024) if (audio_path and os.path.exists(audio_path)) else 0
        print(f"PROGRESS:14:Audio track loaded: {os.path.basename(audio_path)} ({audio_size_mb:.1f} MB)")
        sys.stdout.flush()
        
        bg_size_mb = os.path.getsize(bg_path) / (1024 * 1024) if (bg_path and os.path.exists(bg_path)) else 0
        print(f"PROGRESS:14:Background image loaded: {os.path.basename(bg_path)} ({bg_size_mb:.1f} MB)")
        sys.stdout.flush()
        
        print(f"PROGRESS:14:Output resolution: {res_str} ({width}x{height} @ {fps} fps)")
        sys.stdout.flush()
        
        if logo_path and os.path.exists(logo_path):
            logo_size_kb = os.path.getsize(logo_path) / 1024
            print(f"PROGRESS:14:Circular logo loaded: {os.path.basename(logo_path)} ({logo_size_kb:.1f} KB)")
            sys.stdout.flush()
            
        if voiceover_path and os.path.exists(voiceover_path):
            vo_size_mb = os.path.getsize(voiceover_path) / (1024 * 1024)
            print(f"PROGRESS:14:Voiceover track loaded: {os.path.basename(voiceover_path)} ({vo_size_mb:.1f} MB)")
    except Exception:
        pass

    # Pre-process logo into a transparent circular PNG with a white border matching the preview style
    if logo_path and os.path.exists(logo_path):
        try:
            logo_img = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
            if logo_img is not None:
                h_l, w_l = logo_img.shape[:2]
                sz_l = min(h_l, w_l)
                crop_x = (w_l - sz_l) // 2
                crop_y = (h_l - sz_l) // 2
                logo_square = logo_img[crop_y:crop_y+sz_l, crop_x:crop_x+sz_l]
                logo_square = cv2.resize(logo_square, (280, 280), interpolation=cv2.INTER_AREA)
                
                if logo_square.shape[2] == 3:
                    logo_square = cv2.cvtColor(logo_square, cv2.COLOR_BGR2BGRA)
                    
                mask_logo = np.zeros((280, 280), dtype=np.uint8)
                cv2.circle(mask_logo, (140, 140), 138, 255, -1)
                logo_square[:, :, 3] = cv2.bitwise_and(logo_square[:, :, 3], mask_logo)
                
                # White outline border (thickness 7, scales down to 3.5 outline at size 140)
                cv2.circle(logo_square, (140, 140), 136, (255, 255, 255, 255), 7)
                
                logo_out_path = os.path.join(backend_dir, "temp_circular_logo.png")
                cv2.imwrite(logo_out_path, logo_square)
                logo_path = logo_out_path
        except Exception as e:
            print(f"Warning: Failed to process circular logo: {e}")
            sys.stdout.flush()

    # Custom Solid/Gradient image generation if in template mode
    bg_mode = settings.get("bgMode", "upload")
    if bg_mode == "template" or not bg_path or bg_path == "DUMMY_BG_PATH":
        bg_path = os.path.join(backend_dir, "temp_generated_gradient.bmp")
        color1 = settings.get("bgGradientColor1", "#1e1b4b")
        color2 = settings.get("bgGradientColor2", "#5b21b6")
        grad_type = settings.get("bgGradientType", "gradient")
        angle = settings.get("bgGradientAngle", 135)
        print("PROGRESS:16:Generating gradient background template...")
        sys.stdout.flush()
        create_gradient_bmp(width, height, color1, color2, grad_type, angle, bg_path)

    # Detect if background is video
    is_bg_video = bg_path.lower().endswith(('.mp4', '.webm', '.avi', '.mkv', '.mov'))
    has_bg_audio = False
    if is_bg_video:
        try:
            probe_cmd = ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=codec_type", "-of", "csv=p=0", bg_path]
            probe_res = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            if "audio" in probe_res.stdout:
                has_bg_audio = True
        except Exception:
            pass

    # 2.5 Pre-process static background image to save CPU/GPU overhead during main encoding loop
    preprocessed_bg_path = bg_path
    is_preprocessed = False
    
    bg_blur = settings.get("backgroundBlur", 0)
    bg_brightness = settings.get("backgroundBrightness", 100)
    extra_blur = settings.get("blur", 0)
    total_blur = bg_blur + extra_blur
    
    # Calculate color correction filters (eq)
    br_ff = (settings.get("brightness", 100) - 100) / 200.0
    co_ff = settings.get("contrast", 100) / 100.0
    sa_ff = settings.get("saturation", 100) / 100.0
    eq_str = f",eq=contrast={co_ff}:brightness={br_ff}:saturation={sa_ff}"
    blur_str = f",boxblur=luma_radius={total_blur}" if total_blur > 0 else ""
    
    bg_flips = []
    if settings.get("bgFlipH", False):
        bg_flips.append("hflip")
    if settings.get("bgFlipV", False):
        bg_flips.append("vflip")
    flip_str = "," + ",".join(bg_flips) if bg_flips else ""

    fit_mode = settings.get("fitMode", "Fit to Screen (Blurred Background)")
    has_beat_sync = settings.get("syncMode") == "Sinkronkan Latar dengan Ketukan (Beat Sync)"

    if not is_bg_video and not has_beat_sync:
        try:
            print("PROGRESS:15:Pre-processing static background image (applying blur, scale, aspect correction)...")
            sys.stdout.flush()
            
            preprocessed_bg_path = os.path.join(backend_dir, "temp_preprocessed_bg.png")
            
            # Build the same background filter graph but outputting to a single image frame
            bg_filt = ""
            if fit_mode == "Fit to Screen (Blurred Background)":
                base_blur = max(15, total_blur + 15)
                bg_filt += f"[0:v]split[bg_src][fg_src]; "
                bg_filt += f"[bg_src]scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height},boxblur={base_blur}{eq_str}{flip_str}[bg_blur]; "
                shadow_opacity = 0.35
                if bg_brightness < 100:
                    shadow_opacity = max(0.35, (100 - bg_brightness) / 100.0)
                bg_filt += f"color=c=black@{shadow_opacity}:s={width}x{height}[shadow]; [bg_blur][shadow]overlay=0:0[bg_dark]; "
                bg_filt += f"[fg_src]scale={width}:{height}:force_original_aspect_ratio=decrease{eq_str}{flip_str}[fg_fit]; "
                bg_filt += f"[bg_dark][fg_fit]overlay=(W-w)/2:(H-h)/2[v_out]"
            elif fit_mode == "Fit to Screen (Letterbox)":
                bg_filt += f"[0:v]scale={width}:{height}:force_original_aspect_ratio=decrease{eq_str}{flip_str}[fg_fit]; "
                bg_filt += f"color=c=black:s={width}x{height}[black]; "
                bg_filt += f"[black][fg_fit]overlay=(W-w)/2:(H-h)/2"
                if bg_brightness < 100:
                    shadow_opacity = (100 - bg_brightness) / 100.0
                    bg_filt += f"[bg_scaled]; color=c=black@{shadow_opacity}:s={width}x{height}[shadow]; [bg_scaled][shadow]overlay=0:0"
                bg_filt += "[v_out]"
            elif fit_mode == "Stretch to Fit":
                bg_filt += f"[0:v]scale={width}:{height}{eq_str}{blur_str}{flip_str}"
                if bg_brightness < 100:
                    shadow_opacity = (100 - bg_brightness) / 100.0
                    bg_filt += f"[bg_scaled]; color=c=black@{shadow_opacity}:s={width}x{height}[shadow]; [bg_scaled][shadow]overlay=0:0"
                bg_filt += "[v_out]"
            else: # Crop to Fill
                bg_filt += f"[0:v]scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}{eq_str}{blur_str}{flip_str}"
                if bg_brightness < 100:
                    shadow_opacity = (100 - bg_brightness) / 100.0
                    bg_filt += f"[bg_scaled]; color=c=black@{shadow_opacity}:s={width}x{height}[shadow]; [bg_scaled][shadow]overlay=0:0"
                bg_filt += "[v_out]"
                
            prep_cmd = [
                "ffmpeg", "-y",
                "-i", bg_path,
                "-filter_complex", bg_filt,
                "-map", "[v_out]",
                "-vframes", "1",
                preprocessed_bg_path
            ]
            
            process_prep = subprocess.Popen(prep_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            process_prep.wait()
            if process_prep.returncode == 0:
                is_preprocessed = True
                print("PROGRESS:18:Background pre-processed successfully! Running optimized loop.")
                sys.stdout.flush()
            else:
                preprocessed_bg_path = bg_path
                print("WARNING: Background pre-processing failed, falling back to dynamic rendering.")
                sys.stdout.flush()
        except Exception as e:
            preprocessed_bg_path = bg_path
            print(f"WARNING: Background pre-processing error: {e}")
            sys.stdout.flush()

    # Inputs setup
    inputs_list = []
    # Input 0: Main Audio Track
    audio_offset = float(settings.get("audioOffset", 0.0))
    if audio_offset != 0.0:
        inputs_list.append(("-itsoffset", str(audio_offset), "-i", audio_path))
    else:
        inputs_list.append(("-i", audio_path))

    # Optional Input 3: Voiceover Audio
    voiceover_idx = None
    if voiceover_path and os.path.exists(voiceover_path):
        inputs_list.append(("-i", voiceover_path))
        voiceover_idx = len(inputs_list) - 1

    particles_idx = None
    has_particles = False
    p_width = width
    p_height = height
    
    try:
        # We append the rawvideo stdin pipe description to the inputs list using bgra for native alpha channel support
        inputs_list.append(("-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{p_width}x{p_height}", "-r", str(fps), "-i", "-"))
        particles_idx = len(inputs_list) - 1
        has_particles = True
        print("PROGRESS:12:In-memory particles overlay stream initialized.")
        sys.stdout.flush()
    except Exception as e:
        print(f"WARNING: Particles stream initialization failed: {e}")
        sys.stdout.flush()
    # Assemble cmd_inputs
    cmd_inputs = []
    for inp in inputs_list:
        if settings.get("exportMode") == "stream":
            cmd_inputs.extend(["-re"] + list(inp))
        else:
            cmd_inputs.extend(list(inp))

    # fps is already defined early
    visualizer_type = settings.get("visualizerType", "bars")
    bar_color_raw = settings.get("barColor", "#8b5cf6")
    bar_color_ff = bar_color_raw if bar_color_raw in ["cyan", "white", "black"] else bar_color_raw.replace("#", "0x")
    bg_blur = settings.get("backgroundBlur", 0)
    bg_brightness = settings.get("backgroundBrightness", 100)
    
    text_title = settings.get("textTitle", "Resonance")
    text_artist = settings.get("textArtist", "Audira Studio")
    text_size = settings.get("textSize", 36)
    text_color = settings.get("textColor", "#ffffff")
    text_color_ff = text_color.replace("#", "0x")
    text_pos_y = settings.get("textPosition", 50) # percentage
    
    font_arg = get_font_arg()
    active_layers_count = 0
    if settings.get("antiCopyright", False):
        zoom_pct = settings.get("antiCopyrightZoom", 3)
        zoom_factor = 1.0 + (zoom_pct / 100.0)
        inv_zoom = 1.0 / zoom_factor
        
        noise_level = settings.get("antiCopyrightNoise", 2)
        vignette_val = settings.get("antiCopyrightVignette", 0.3)
        rotate_val = settings.get("antiCopyrightRotate", 0.005)
        color_grading = settings.get("antiCopyrightColorGrading", True)
        
        zoom_enabled = settings.get("antiCopyrightZoomEnabled", True)
        noise_enabled = settings.get("antiCopyrightNoiseEnabled", True)
        vignette_enabled = settings.get("antiCopyrightVignetteEnabled", True)
        rotate_enabled = settings.get("antiCopyrightRotateEnabled", True)
        
        v_filters = []
        # Layer 6 & 10: Combined Zoom, Rotate, and Crop to prevent black borders/corners
        zoom_rotate_filters = []
        if zoom_enabled:
            zoom_rotate_filters.append(f"scale=trunc(iw*{zoom_factor}/2)*2:trunc(ih*{zoom_factor}/2)*2")
        if rotate_enabled and rotate_val > 0:
            zoom_rotate_filters.append(f"rotate={rotate_val}")
        if zoom_enabled:
            zoom_rotate_filters.append(f"crop=trunc(in_w/{zoom_factor}/2)*2:trunc(in_h/{zoom_factor}/2)*2")
            
        if zoom_rotate_filters:
            v_filters.append(",".join(zoom_rotate_filters))
            
        # Layer 7: Color Grading Shift
        if color_grading:
            v_filters.append("eq=brightness=0.01:contrast=1.02:saturation=1.03")
        # Layer 8: Pixel Noise (Grain)
        if noise_enabled and noise_level > 0:
            v_filters.append(f"noise=alls={noise_level}:allf=t+u")
        # Layer 9: Vignette
        if vignette_enabled and vignette_val > 0:
            v_filters.append(f"vignette={vignette_val}")
            
        # Layer 16: Frame Rate Timings Jitter
        if settings.get("antiCopyrightJitterEnabled", False):
            jitter_strength = settings.get("antiCopyrightJitterStrength", 1)
            jitter_sec = jitter_strength / 1000.0
            v_filters.append(f"setpts='PTS+(random(0)-0.5)*({jitter_sec})/TB'")
            
        # Layer 17: Pixel Hash Noise Overlay
        if settings.get("antiCopyrightHashEnabled", False):
            hash_strength = settings.get("antiCopyrightHashStrength", 2)
            v_filters.append(f"noise=alls={hash_strength}:allf=t")
            
        if v_filters:
            filter_graph = f"[{particles_idx}:v]" + ",".join(v_filters) + "[v_composed]"
        else:
            filter_graph = f"[{particles_idx}:v]null[v_composed]"
    else:
        filter_graph = f"[{particles_idx}:v]null[v_composed]"
    video_map_label = "[v_composed]"



    # Setup Audio Filters
    audio_filters = []
    if settings.get("audioFade", True):
        fade_out_start = max(0, duration - 3)
        audio_filters.append(f"afade=t=in:ss=0:d=2,afade=t=out:st={fade_out_start}:d=3")
    if settings.get("bassBoost", False):
        audio_filters.append("equalizer=f=60:width_type=h:width=50:g=6")
    if settings.get("lofiFilter", False):
        audio_filters.append("bandpass=f=1500:width_type=h:width=1000")
    if settings.get("audioNormalize", False):
        audio_filters.append("loudnorm")
    if settings.get("antiCopyright", False):
        pitch_enabled = settings.get("antiCopyrightPitchEnabled", True)
        if pitch_enabled:
            pitch_pct = settings.get("antiCopyrightPitch", 4)
            pitch_factor = 1.0 + (pitch_pct / 100.0)
            
            tempo_enabled = settings.get("antiCopyrightTempoEnabled", False)
            if tempo_enabled:
                tempo_pct = settings.get("antiCopyrightTempo", 100)
                tempo_factor = tempo_pct / 100.0
            else:
                tempo_factor = 1.0 / pitch_factor
            
            # Layer 1: Pitch shift (forces stereo to allow safe phase delay)
            audio_filters.append(f"asetrate=44100*{pitch_factor},aresample=44100,aformat=channel_layouts=stereo,atempo={tempo_factor}")
            
        # Layer 2: High frequency cut
        if settings.get("antiCopyrightHighCut", True):
            highcut_freq = settings.get("antiCopyrightHighCutFreq", 16000)
            audio_filters.append(f"equalizer=f={highcut_freq}:width_type=q:width=1:g=-12")
            
        # Layer 3: Subsonic low cut
        if settings.get("antiCopyrightLowCut", True):
            lowcut_freq = settings.get("antiCopyrightLowCutFreq", 40)
            audio_filters.append(f"equalizer=f={lowcut_freq}:width_type=q:width=1:g=-12")
            
        # Layer 4: Dynamic volume normalization warp
        if settings.get("antiCopyrightEnvWarp", True):
            env_frame = settings.get("antiCopyrightEnvFrame", 150)
            env_gain = settings.get("antiCopyrightEnvGain", 15)
            audio_filters.append(f"dynaudnorm=f={env_frame}:g={env_gain}")
            
        # Layer 5: Stereo phaser modulation
        if settings.get("antiCopyrightPhaser", True):
            phaser_speed = settings.get("antiCopyrightPhaserSpeed", 0.2)
            phaser_decay = settings.get("antiCopyrightPhaserDecay", 0.3)
            audio_filters.append(f"aphaser=speed={phaser_speed}:decay={phaser_decay}")
            
        # Layer 5.5: Stereo Phase Channel Delay
        if settings.get("antiCopyrightDelayEnabled", True):
            delay_ms = settings.get("antiCopyrightDelayMs", 20)
            audio_filters.append(f"adelay=0|{delay_ms}")
            
        # Layer 12: Volume Tremolo LFO
        if settings.get("antiCopyrightTremoloEnabled", False):
            trem_speed = settings.get("antiCopyrightTremoloSpeed", 1.0)
            trem_depth = settings.get("antiCopyrightTremoloDepth", 0.08)
            audio_filters.append(f"apulsator=hz={trem_speed}:amount={trem_depth}")
            
        # Layer 13: Micro-Silence Gaps (5ms)
        if settings.get("antiCopyrightGapsEnabled", False):
            gap_interval = settings.get("antiCopyrightGapsInterval", 15)
            audio_filters.append(f"volume='if(lt(mod(t,{gap_interval}),0.005),0,1)':eval=frame")
            
        # Layer 14: Tape Saturation (Warm Overdrive)
        if settings.get("antiCopyrightSaturationEnabled", False):
            sat_gain = settings.get("antiCopyrightSaturationGain", 3)
            audio_filters.append(f"acrusher=level_in={sat_gain}:level_out=1:bits=16:mode=log")

    audio_in_source = "[a_main_split]" if active_layers_count > 0 else "[0:a]"
    if audio_filters:
        filter_graph += f"; {audio_in_source}" + ",".join(audio_filters) + "[a_filtered]"
        main_audio_label = "[a_filtered]"
    else:
        filter_graph += f"; {audio_in_source}anull[a_filtered]"
        main_audio_label = "[a_filtered]"

    # Layer 15: Ultrasonic White Noise Overlay (Mixer)
    if settings.get("antiCopyright", False) and settings.get("antiCopyrightUltrasonicEnabled", False):
        noise_level = settings.get("antiCopyrightUltrasonicLevel", 0.002)
        filter_graph += f"; anoisesrc=color=white:amplitude={noise_level},highpass=f=16000[ultrasonic_noise]; {main_audio_label}[ultrasonic_noise]amix=inputs=2:duration=first:dropout_transition=0[a_ultrasonic_mixed]"
        main_audio_label = "[a_ultrasonic_mixed]"

    if voiceover_idx is not None:
        mixer_mode = settings.get("audioMixer", "Gunakan Musik Upload Saja (Playlist)")
        if mixer_mode == "Gunakan Voiceover Saja":
            filter_graph += f"; [{voiceover_idx}:a]volume=1.0[vo_only]"
            main_audio_label = "[vo_only]"
        elif mixer_mode == "Campurkan Musik + Voiceover":
            release_ms = int(settings.get("releaseTime", 0.5) * 1000)
            if settings.get("autoDucking", True):
                # Apply sidechain compressor using voiceover as sidechain
                filter_graph += f"; {main_audio_label}[{voiceover_idx}:a]sidechaincompress=threshold=-30dB:ratio=6:release={release_ms}[ducked]"
                filter_graph += f"; [ducked][{voiceover_idx}:a]amix=inputs=2:duration=first[mixed_vo]"
            else:
                filter_graph += f"; {main_audio_label}[{voiceover_idx}:a]amix=inputs=2:duration=first[mixed_vo]"
            main_audio_label = "[mixed_vo]"

    # Mix background video audio if configured
    bg_video_vol = settings.get("bgVideoVolume", 0)
    if is_bg_video and has_bg_audio and bg_video_vol > 0:
        vol_factor = bg_video_vol / 100.0
        filter_graph += f"; [1:a]volume={vol_factor}[bg_a_vol]; {main_audio_label}[bg_a_vol]amix=inputs=2:duration=first[a_mixed]"
        audio_map_label = "[a_mixed]"
    else:
        audio_map_label = main_audio_label

    # Apply LUFS Audio Normalization if requested (e.g. -14 LUFS for YouTube, -16 LUFS for Spotify)
    if settings.get("audioNormalize", False) or settings.get("targetLUFS"):
        lufs_val = settings.get("targetLUFS", -14)
        filter_graph += f"; {audio_map_label}loudnorm=I={lufs_val}:LRA=11:TP=-1.5[a_normalized]"
        audio_map_label = "[a_normalized]"

    # Determine video codecs cascade
    encoder_sel = settings.get("encoder", "gpu")
    codec_sel = settings.get("codec", "h264")
    
    codecs_to_try = []
    if encoder_sel == "gpu":
        if codec_sel == "h264":
            codecs_to_try = ["h264_nvenc", "h264_amf", "h264_qsv", "h264_mf", "libx264"]
        elif codec_sel == "h265":
            codecs_to_try = ["hevc_nvenc", "hevc_amf", "hevc_qsv", "hevc_mf", "libx265"]
        elif codec_sel == "av1":
            codecs_to_try = ["av1_nvenc", "av1_amf", "av1_qsv", "libsvtav1"]
    else:
        if codec_sel == "h264":
            codecs_to_try = ["libx264"]
        elif codec_sel == "h265":
            codecs_to_try = ["libx265"]
        elif codec_sel == "av1":
            codecs_to_try = ["libsvtav1"]
            
    global CACHED_WORKING_CODEC
    if CACHED_WORKING_CODEC and CACHED_WORKING_CODEC in codecs_to_try:
        codecs_to_try.remove(CACHED_WORKING_CODEC)
        codecs_to_try.insert(0, CACHED_WORKING_CODEC)
            
    speed_sel = settings.get("encodingSpeed", "Cepat")
    preset_val = "fast"
    if speed_sel == "Seimbang":
        preset_val = "medium"
    elif speed_sel == "Lambat (Hasil Lebih Tajam)":
        preset_val = "slow"
        
    # Bitrate configuration
    v_bitrate_str = settings.get("videoBitrate", "Direkomendasikan (Auto)")
    a_bitrate_str = settings.get("audioBitrate", "192 kbps")
    a_bitrate = "192k"
    if "320 kbps" in a_bitrate_str:
        a_bitrate = "320k"
    elif "128 kbps" in a_bitrate_str:
        a_bitrate = "128k"

    is_stream = settings.get("exportMode") == "stream"
    stream_key = settings.get("streamKey", "")
    output_target = f"rtmp://a.rtmp.youtube.com/live2/{stream_key}" if is_stream else output_path
    
    # GOP size is 2 seconds (mandatory for YouTube Live streams)
    gop_val = str(fps * 2)

    # 4. Start FFmpeg process and monitor progress (with GPU to CPU Fallback Cascade)
    import re
    time_regex = re.compile(r"time=(\d+):(\d+):(\d+\.\d+)")

    def run_ffmpeg_process(ffmpeg_cmd, desc, job_ref=None):
        cmd_str = ' '.join(ffmpeg_cmd)
        try:
            print(f"DEBUG COMMAND ({desc}): {cmd_str}")
        except UnicodeEncodeError:
            safe_cmd_str = cmd_str.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8')
            print(f"DEBUG COMMAND ({desc}): {safe_cmd_str}")
        print(f"PROGRESS:25:Launching FFmpeg {desc} pipeline...")
        sys.stdout.flush()
        
        creation_flags = 0
        if sys.platform == 'win32':
            # HIGH_PRIORITY_CLASS = 0x00000080
            creation_flags = 0x00000080

        # Zero-disk-write: we run in-memory streaming using standard pipe:0 (stdin)
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdin=subprocess.PIPE if has_particles else None,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            creationflags=creation_flags
        )
        # Store process in thread-local AND in the job_ref dict (for per-job cancel)
        set_active_ffmpeg_process(process)
        if job_ref is not None:
            job_ref['ffmpeg_process'] = process

        # Start a daemon thread to read progress updates asynchronously without blocking
        import threading
        def progress_reader():
            while True:
                line = process.stderr.readline()
                if not line:
                    break
                line_str = line.decode('utf-8', errors='ignore')
                print(f"FFMPEG: {line_str.strip()}")
                sys.stdout.flush()
                match = time_regex.search(line_str)
                if match:
                    hours = int(match.group(1))
                    minutes = int(match.group(2))
                    seconds = float(match.group(3))
                    
                    elapsed = hours * 3600 + minutes * 60 + seconds
                    progress_pct = min(98, int((elapsed / duration) * 73) + 25) # Map 25% -> 98%
                    
                    real_progress = min(100.0, (elapsed / duration) * 100.0)
                    status_desc = "Streaming to YouTube Live" if is_stream else "Encoding visualizer frame"
                    status_msg = f"{status_desc}... [{real_progress:.1f}%] time {format_time_str(elapsed)} / {format_time_str(duration)} ({desc})"
                    print(f"PROGRESS:{progress_pct}:{status_msg}")
                    sys.stdout.flush()
                    
        reader_thread = threading.Thread(target=progress_reader, daemon=True)
        reader_thread.start()

        if has_particles:
            try:
                # Setup background source
                is_bg_video_file = is_bg_video
                cap = None
                bg_src = None
                if is_bg_video_file:
                    cap = cv2.VideoCapture(bg_path)
                else:
                    bg_src = cv2.imread(preprocessed_bg_path if os.path.exists(preprocessed_bg_path) else bg_path)
                    if bg_src is None:
                        bg_src = np.zeros((p_height, p_width, 3), dtype=np.uint8)
                
                if is_bg_video_file and (cap is None or not cap.isOpened()):
                    is_bg_video_file = False
                    bg_src = np.zeros((p_height, p_width, 3), dtype=np.uint8)

                # Setup particle pool
                particle_count = 70
                random.seed(42)
                
                # Active particle types
                active_types = []
                if settings.get("partCosmic", False): active_types.append("cosmic")
                if settings.get("partStars", False) or settings.get("partStar", False): active_types.append("star")
                if settings.get("partMagic", False): active_types.append("magic")
                if settings.get("partSnow", False): active_types.append("snow")
                if settings.get("partSparks", False): active_types.append("sparks")
                if settings.get("partRain", False) or settings.get("partHeavyRain", False): active_types.append("rain")
                if settings.get("partBubbles", False): active_types.append("bubbles")
                if settings.get("partLeaves", False): active_types.append("leaves")
                if settings.get("partConfetti", False): active_types.append("confetti")
                if settings.get("partOrbs", False): active_types.append("orbs")
                if settings.get("partMatrix", False): active_types.append("matrix")
                if settings.get("partSakura", False): active_types.append("sakura")
                
                if not active_types:
                    active_types.append("default")
                    
                particles = []
                for idx in range(particle_count):
                    particles.append({
                        "x": random.random() * p_width,
                        "y": random.random() * p_height,
                        "speedX": (random.random() - 0.5) * 0.7 * (p_width / 1280.0),
                        "speedY": -(random.random() * 1.3 + 0.4) * (p_height / 720.0),
                        "radius": (random.random() * 4 + 2) * (p_height / 720.0),
                        "alpha": random.random() * 0.5 + 0.2,
                        "angle": random.random() * math.pi * 2,
                        "rotSpeed": (random.random() - 0.5) * 0.05,
                        "hue": (idx * 15) % 180
                    })
                    
                total_frames = int(duration * fps)
                intensity = float(settings.get("particleIntensity", 1.5))
                
                print("PROGRESS:9:Analyzing audio spectrum and generating frequencies...")
                sys.stdout.flush()
                frame_frequencies = get_audio_frequencies(audio_path, total_frames, fps, num_bins=128)
                
                # 1. Cache Logo image in memory (eliminates per-frame disk read I/O)
                logo_img_cache = None
                if logo_path and os.path.exists(logo_path):
                    logo_img_cache = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
                    if logo_img_cache is not None and logo_img_cache.shape[2] == 3:
                        logo_img_cache = cv2.cvtColor(logo_img_cache, cv2.COLOR_BGR2BGRA)

                # 2. Cache Static Background if not video and no beat-sync zoom (saves ~15-20ms per frame)
                is_static_bg = (not is_bg_video_file) and (settings.get("syncMode") != "Sinkronkan Latar dengan Ketukan (Beat Sync)")
                if is_static_bg:
                    static_bg_frame = process_background_frame(bg_src, settings, 0.0, 0.0, p_width, p_height)

                # 3. Cache Static Text Overlays if beat glow is disabled (saves ~15-20ms per frame of PIL conversion)
                has_beat_glow = settings.get("titleBeatGlow", False)
                text_layer_cache = None
                if settings.get("showTitle", True) and not has_beat_glow:
                    text_layer_cache = np.zeros((p_height, p_width, 4), dtype=np.uint8)
                    draw_text_overlays(text_layer_cache, settings, 0.0, 0.0, p_width, p_height)

                # Helper to convert Hex color to BGR
                def hex_to_bgr(hex_str):
                    if not hex_str:
                        return (246, 92, 139)
                    hex_str = hex_str.replace("#", "")
                    if len(hex_str) == 6:
                        return (int(hex_str[4:6], 16), int(hex_str[2:4], 16), int(hex_str[0:2], 16))
                    return (246, 92, 139)

                import queue
                frame_queue = queue.Queue(maxsize=30)
                
                def stdin_writer():
                    try:
                        while True:
                            item = frame_queue.get()
                            if item is None:
                                break
                            process.stdin.write(item)
                            frame_queue.task_done()
                    except Exception as e:
                        print(f"WARNING: Async stdin writer failed: {e}")
                        sys.stdout.flush()
                
                writer_thread = threading.Thread(target=stdin_writer, daemon=True)
                writer_thread.start()

                # Pre-allocate background overlay, visualizer, and glow layers to optimize rendering performance (eliminating heap churn & GC pauses)
                overlay = np.zeros((p_height, p_width, 4), dtype=np.uint8)
                vis_layer_normal = np.zeros((p_height, p_width, 4), dtype=np.uint8)
                vis_layer_antialiased = np.zeros((int(p_height * 1.5), int(p_width * 1.5), 4), dtype=np.uint8)
                glow_layer = np.zeros((p_height, p_width, 4), dtype=np.uint8)
                
                # Pre-allocate 4x downscaled glow layer for VFX Neon to optimize blur speed
                glow_ds = 4
                glow_w = max(4, p_width // glow_ds)
                glow_h = max(4, p_height // glow_ds)
                glow_layer_small = np.zeros((glow_h, glow_w, 4), dtype=np.uint8)

                for frame_idx in range(total_frames):
                    # Progress update (25% to 98%) printed directly to terminal
                    if frame_idx % 200 == 0 or frame_idx == total_frames - 1:
                        pct = 25 + int((frame_idx / max(1, total_frames - 1)) * 73)
                        print(f"PROGRESS:{pct}:Generating visualizer frame ({frame_idx}/{total_frames} frames)...")
                        sys.stdout.flush()
                        
                    t = frame_idx / float(fps)
                    if frame_idx < len(frame_frequencies):
                        dataArray = frame_frequencies[frame_idx]
                    else:
                        dataArray = np.zeros(128, dtype=np.float32)
                    vol_factor = np.mean(dataArray) / 255.0
                    
                    # 1. Retrieve background frame
                    if is_static_bg:
                        bg_frame = static_bg_frame
                    elif is_bg_video_file:
                        ret, bg_vframe = cap.read()
                        if not ret:
                            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                            ret, bg_vframe = cap.read()
                        if not ret or bg_vframe is None:
                            bg_vframe = np.zeros((p_height, p_width, 3), dtype=np.uint8)
                        bg_frame = process_background_frame(bg_vframe, settings, t, vol_factor, p_width, p_height)
                    else:
                        bg_frame = process_background_frame(bg_src, settings, t, vol_factor, p_width, p_height)
                    # 2. Convert background BGR to BGRA
                    frame = cv2.cvtColor(bg_frame, cv2.COLOR_BGR2BGRA)
                    
                    # 3. Reset pre-allocated transparent overlay layer for particles and VFX
                    overlay.fill(0)
                    
                    speed_mult = 1.0 + vol_factor * intensity * 4.0
                    
                    for idx, p in enumerate(particles):
                        p_type = active_types[idx % len(active_types)]
                        
                        # Physics motion
                        if p_type in ["sparks", "magic"]:
                            p["x"] += p["speedX"] * speed_mult * 0.8
                            p["y"] += p["speedY"] * speed_mult * 0.95
                        elif p_type == "leaves":
                            p["x"] += p["speedX"] * speed_mult + math.sin(t * 1.5 + idx) * 0.4
                            p["y"] += p["speedY"] * speed_mult * 0.7
                        elif p_type == "bubbles":
                            p["x"] += p["speedX"] * speed_mult + math.cos(t * 1.2 + idx) * 0.25
                            p["y"] += p["speedY"] * speed_mult * 0.8
                        else: # cosmic / snow / default
                            p["x"] += p["speedX"] * speed_mult
                            p["y"] += p["speedY"] * speed_mult
                            
                        # Boundary reset
                        if p["y"] < -20 or p["x"] < -20 or p["x"] > p_width + 20:
                            p["y"] = p_height + random.random() * 20
                            p["x"] = random.random() * p_width
                            
                        x_c = int(p["x"])
                        y_c = int(p["y"])
                        rad = int(p["radius"])
                        alpha = p["alpha"]
                        
                        # Draw shapes BGRA on overlay
                        if p_type == "sakura":
                            # Soft pink petal
                            ang_p = p["angle"] + t * p["rotSpeed"]
                            cos_a, sin_a = math.cos(ang_p), math.sin(ang_p)
                            pts = [
                                (0, -rad * 2),
                                (rad * 0.5, -rad * 0.5),
                                (rad * 2, 0),
                                (rad * 0.5, rad * 0.5),
                                (0, rad * 2),
                                (-rad * 0.5, rad * 0.5),
                                (-rad * 2, 0),
                                (-rad * 0.5, -rad * 0.5)
                            ]
                            rotated_pts = []
                            for px, py in pts:
                                rx = int(x_c + (px * cos_a - py * sin_a))
                                ry = int(y_c + (px * sin_a + py * cos_a))
                                rotated_pts.append([rx, ry])
                            # BGRA pink color with alpha channel
                            cv2.fillPoly(overlay, [np.array(rotated_pts, dtype=np.int32)], (180, 180, 255, int(255 * alpha)))
                            cv2.polylines(overlay, [np.array(rotated_pts, dtype=np.int32)], True, (0, 0, 0, int(255 * alpha)), 1)
                        elif p_type == "rain":
                            cv2.line(overlay, (x_c, y_c - 12), (x_c - 3, y_c + 12), (253, 197, 147, int(255 * alpha)), 2)
                        elif p_type == "orbs":
                            # Nested fading rings
                            for r_ring in range(int(rad * 6.5), 0, -2):
                                ring_alpha = alpha * 0.3 * (1.0 - (r_ring / (rad * 6.5)))
                                ring_val = int(255 * ring_alpha)
                                if ring_val > 0:
                                    cv2.circle(overlay, (x_c, y_c), r_ring, (255, 255, 255, ring_val), -1)
                        elif p_type == "matrix":
                            cv2.circle(overlay, (x_c, y_c), rad, (0, 255, 0, int(255 * alpha)), -1)
                        elif p_type == "bubbles":
                            cv2.circle(overlay, (x_c, y_c), rad, (255, 255, 255, int(255 * alpha)), 2)
                            # Shiny reflection dot
                            if rad > 3:
                                cv2.circle(overlay, (x_c - int(rad * 0.3), y_c - int(rad * 0.3)), int(rad * 0.2), (255, 255, 255, int(255 * alpha)), -1)
                        elif p_type == "leaves":
                            ang_l = p["angle"] + t * 0.5
                            cos_a, sin_a = math.cos(ang_l), math.sin(ang_l)
                            pts = [(0, -rad * 1.8), (rad, 0), (0, rad * 1.8), (-rad, 0)]
                            rotated_pts = []
                            for px, py in pts:
                                rx = int(x_c + (px * cos_a - py * sin_a))
                                ry = int(y_c + (px * sin_a + py * cos_a))
                                rotated_pts.append([rx, ry])
                            color_val = (19, 69, 139, int(255 * alpha)) # Brownish BGRA
                            cv2.fillPoly(overlay, [np.array(rotated_pts, dtype=np.int32)], color_val)
                        elif p_type == "confetti":
                            ang_c = p["angle"] + t * 2.0
                            cos_a, sin_a = math.cos(ang_c), math.sin(ang_c)
                            pts = [(-rad, -rad), (rad, -rad), (rad, rad), (-rad, rad)]
                            rotated_pts = []
                            for px, py in pts:
                                rx = int(x_c + (px * cos_a - py * sin_a))
                                ry = int(y_c + (px * sin_a + py * cos_a))
                                rotated_pts.append([rx, ry])
                            # Deterministic color based on hue
                            hue_rad = p["hue"] / 180.0 * math.pi
                            r_c = int((math.sin(hue_rad) * 0.5 + 0.5) * 255)
                            g_c = int((math.cos(hue_rad) * 0.5 + 0.5) * 255)
                            b_c = int((math.sin(hue_rad + 2.0) * 0.5 + 0.5) * 255)
                            cv2.fillPoly(overlay, [np.array(rotated_pts, dtype=np.int32)], (b_c, g_c, r_c, int(255 * alpha)))
                        elif p_type == "sparks":
                            # Orange fire sparks
                            pts = [(0, -rad * 1.5), (rad * 0.5, 0), (0, rad * 1.5), (-rad * 0.5, 0)]
                            rotated_pts = []
                            cos_a, sin_a = math.cos(p["angle"]), math.sin(p["angle"])
                            for px, py in pts:
                                rx = int(x_c + (px * cos_a - py * sin_a))
                                ry = int(y_c + (px * sin_a + py * cos_a))
                                rotated_pts.append([rx, ry])
                            cv2.fillPoly(overlay, [np.array(rotated_pts, dtype=np.int32)], (0, 140, 255, int(255 * alpha)))
                        elif p_type == "star":
                            # Star shape
                            pts = []
                            for k in range(8):
                                r_s = rad if k % 2 == 0 else rad * 0.4
                                angle_s = k * math.pi / 4.0
                                pts.append((int(r_s * math.cos(angle_s)), int(r_s * math.sin(angle_s))))
                            rotated_pts = []
                            cos_a, sin_a = math.cos(p["angle"]), math.sin(p["angle"])
                            for px, py in pts:
                                rx = int(x_c + (px * cos_a - py * sin_a))
                                ry = int(y_c + (px * sin_a + py * cos_a))
                                rotated_pts.append([rx, ry])
                            cv2.fillPoly(overlay, [np.array(rotated_pts, dtype=np.int32)], (255, 255, 255, int(255 * alpha)))
                        else: # cosmic / default
                            cv2.circle(overlay, (x_c, y_c), rad, (255, 255, 255, int(255 * alpha)), -1)
                            
                    # Draw VFX Overlays directly on overlay
                    vfx_opacity = float(settings.get("vfxOpacity", 30)) / 100.0
                    scale_x = p_width / 1280.0
                    scale_y = p_height / 720.0
                    
                    # A. Spotlight Effect
                    if settings.get("vfxSpotlight", False):
                        angle_l = math.sin(t * 1.2) * 0.35 - 0.15
                        angle_r = math.cos(t * 1.2) * 0.35 + 0.15
                        
                        def draw_cone(start_x, angle, base_color_bgr):
                            pts = [(0, 0), (-180, 800), (180, 800)]
                            rotated_pts = []
                            cos_a, sin_a = math.cos(angle), math.sin(angle)
                            for px, py in pts:
                                rx = int(start_x * scale_x + (px * cos_a - py * sin_a) * scale_x)
                                ry = int(py * scale_y)
                                rotated_pts.append([rx, ry])
                                
                            # Create a binary mask of the triangle
                            mask = np.zeros((p_height, p_width), dtype=np.uint8)
                            cv2.fillPoly(mask, [np.array(rotated_pts, dtype=np.int32)], 255)
                            
                            # Create a vertical linear gradient alpha channel matching the HTML5 canvas gradient
                            max_y = max(1, int(800 * scale_y))
                            y_indices = np.arange(p_height).reshape(p_height, 1)
                            grad_y = np.clip(1.0 - (y_indices / float(max_y)), 0, 1)
                            
                            # Combine with maximum opacity
                            alpha_vals = (grad_y * (255 * 0.4 * vfx_opacity)).astype(np.uint8)
                            alpha_mask = np.broadcast_to(alpha_vals, (p_height, p_width))
                            
                            # Fill overlay pixels inside the mask using BGR color and gradient Alpha
                            idx = (mask == 255)
                            overlay[idx, 0] = base_color_bgr[0]
                            overlay[idx, 1] = base_color_bgr[1]
                            overlay[idx, 2] = base_color_bgr[2]
                            overlay[idx, 3] = alpha_mask[idx]
                            
                        draw_cone(250, angle_l, (247, 85, 168)) # BGR purple
                        draw_cone(1030, angle_r, (246, 130, 59)) # BGR blue
                        
                    # B. Disco Ball Glare
                    if settings.get("vfxDisco", False):
                        beams = 10
                        center_x = int(p_width / 2)
                        rot_angle = t * 0.1
                        for i in range(beams):
                            angle = rot_angle + (i * math.pi * 2 / beams)
                            cos_a, sin_a = math.cos(angle), math.sin(angle)
                            pts = [(0, 0), (-30, 1000), (30, 1000)]
                            rotated_pts = []
                            for px, py in pts:
                                rx = int(center_x + (px * cos_a - py * sin_a) * scale_x)
                                ry = int((px * sin_a + py * cos_a) * scale_y)
                                rotated_pts.append([rx, ry])
                            cv2.fillPoly(overlay, [np.array(rotated_pts, dtype=np.int32)], (255, 255, 255, int(255 * 0.25 * vfx_opacity)))
                        
                    # C. Crescent Moon
                    if settings.get("vfxMoon", False):
                        cv2.circle(overlay, (int(1140 * scale_x), int(110 * scale_y)), int(42 * scale_y), (138, 240, 254, int(255 * 0.9 * vfx_opacity)), -1)
                        # Slice crescent shape by writing fully transparent pixels (alpha = 0)
                        cv2.circle(overlay, (int(1120 * scale_x), int(105 * scale_y)), int(42 * scale_y), (0, 0, 0, 0), -1)
                        
                    # D. Islamic Pattern Grid
                    if settings.get("vfxIslamic", False):
                        step_size = int(140 * scale_x)
                        color_bgra = (36, 191, 251, int(255 * 0.28 * vfx_opacity))
                        for x in range(0, p_width + step_size, step_size):
                            for y in range(0, p_height + step_size, step_size):
                                sz = int(25 * scale_y)
                                cv2.rectangle(overlay, (x - sz, y - sz), (x + sz, y + sz), color_bgra, 2)
                                d = int(sz * 1.414)
                                rot_pts = [(x, y - d), (x + d, y), (x, y + d), (x - d, y)]
                                cv2.polylines(overlay, [np.array(rot_pts, dtype=np.int32)], True, color_bgra, 2)
                        
                    # E. Film Scratches & Dust
                    if settings.get("vfxFilm", False):
                        if random.random() < 0.35:
                            x_pos = int(random.random() * p_width)
                            cv2.line(overlay, (x_pos, 0), (x_pos + int((random.random() - 0.5) * 15 * scale_x), p_height), (220, 220, 220, int(255 * 0.45 * vfx_opacity)), 1)
                        if random.random() < 0.25:
                            dx = int(random.random() * p_width)
                            dy = int(random.random() * p_height)
                            d_rad = int((random.random() * 3 + 1) * scale_y)
                            cv2.circle(overlay, (dx, dy), d_rad, (0, 0, 0, int(255 * 0.45 * vfx_opacity)), -1)
                        
                    # F. Raindrops on Glass
                    if settings.get("vfxRain", False):
                        for i in range(22):
                            drop_y = int((((t * 180 + i * 140) % 760) - 20) * scale_y)
                            drop_x = int(((i * 71) % 1260 + 10) * scale_x)
                            cv2.ellipse(overlay, (drop_x, drop_y), (int(3 * scale_x), int(9 * scale_y)), 0, 0, 360, (156, 163, 175, int(255 * 0.5 * vfx_opacity)), -1)
                        
                    # G. White Flash Beat
                    if settings.get("vfxFlash", False) and vol_factor > 0.38:
                        flash_val = int((vol_factor - 0.38) * 0.7 * 255 * vfx_opacity)
                        if flash_val > 0:
                            cv2.rectangle(overlay, (0, 0), (p_width, p_height), (255, 255, 255, flash_val), -1)
                            
                    # H. Running Glowing Neon Border
                    if settings.get("vfxNeon", False):
                        pad = int(settings.get("neonPadding", 10) * scale_y)
                        thick = int(settings.get("neonThickness", 4) * scale_y)
                        neon_spd = float(settings.get("neonSpeed", 30))
                        len_pct = float(settings.get("neonLength", 75))
                        glow = float(settings.get("neonGlow", 60))
                        
                        def hex_to_bgr(hex_str, default_bgr):
                            if not hex_str: return default_bgr
                            hex_str = hex_str.replace("#", "")
                            if len(hex_str) == 6:
                                return (int(hex_str[4:6], 16), int(hex_str[2:4], 16), int(hex_str[0:2], 16))
                            return default_bgr
                            
                        start_color = hex_to_bgr(settings.get("neonStartColor"), (255, 255, 0)) # BGR cyan
                        end_color = hex_to_bgr(settings.get("neonEndColor"), (255, 0, 255)) # BGR magenta
                        
                        cycle_len = 450.0 * scale_y
                        dash_len = (len_pct / 100.0) * cycle_len
                        offset = (-t * neon_spd * 2.2 * scale_y) % cycle_len
                        
                        w_s = p_width - 2 * pad
                        h_s = p_height - 2 * pad
                        
                        points = [
                            (pad, pad),
                            (p_width - pad, pad),
                            (p_width - pad, p_height - pad),
                            (pad, p_height - pad),
                            (pad, pad)
                        ]
                        
                        dists = [0.0, w_s, w_s + h_s, 2 * w_s + h_s, 2 * (w_s + h_s)]
                        total_p = dists[-1]
                        
                        def get_coord(dist):
                            for j in range(4):
                                if dists[j] <= dist <= dists[j+1]:
                                    pct = (dist - dists[j]) / (dists[j+1] - dists[j])
                                    x1, y1 = points[j]
                                    x2, y2 = points[j+1]
                                    return int(x1 + (x2 - x1) * pct), int(y1 + (y2 - y1) * pct)
                            return points[0]
                            
                        # Use pre-allocated glow layers and downscaled drawing to speed up Gaussian Blur by 64x
                        glow_layer.fill(0)
                        glow_layer_small.fill(0)
                        glow_thickness_small = max(1, int((thick + (glow / 4.5) * scale_y) / glow_ds))
                        blur_k_small = max(3, int((glow / 4.5 * 2 * scale_y) / glow_ds)) | 1
                        
                        # Generate active intervals along the perimeter
                        intervals = []
                        num_cycles = int(math.ceil((total_p + offset) / cycle_len))
                        for c in range(-1, num_cycles + 1):
                            c_start = c * cycle_len + offset
                            c_end = c_start + dash_len
                            i_start = max(0.0, c_start)
                            i_end = min(total_p, c_end)
                            if i_start < i_end:
                                intervals.append((i_start, i_end))
                                
                        def get_interval_points(start_d, end_d):
                            pts = [get_coord(start_d)]
                            for j in range(1, 4):
                                if start_d < dists[j] < end_d:
                                    pts.append(points[j])
                            pts.append(get_coord(end_d))
                            return np.array(pts, dtype=np.int32)
                            
                        # Draw glow paths on downscaled layer
                        for start_d, end_d in intervals:
                            pts = get_interval_points(start_d, end_d)
                            pts_small = (pts / glow_ds).astype(np.int32)
                            color_pct = ((start_d + end_d) / 2.0) / total_p
                            color = (
                                int(start_color[0] + (end_color[0] - start_color[0]) * color_pct),
                                int(start_color[1] + (end_color[1] - start_color[1]) * color_pct),
                                int(start_color[2] + (end_color[2] - start_color[2]) * color_pct),
                                int(255 * 0.5)
                            )
                            cv2.polylines(glow_layer_small, [pts_small], False, color, glow_thickness_small)
                            
                        # Perform blur on downscaled layer and upscale back to full size
                        glow_layer_small = cv2.GaussianBlur(glow_layer_small, (blur_k_small, blur_k_small), 0)
                        cv2.resize(glow_layer_small, (p_width, p_height), dst=glow_layer, interpolation=cv2.INTER_LINEAR)
                        
                        # Draw sharp foreground paths
                        for start_d, end_d in intervals:
                            pts = get_interval_points(start_d, end_d)
                            color_pct = ((start_d + end_d) / 2.0) / total_p
                            color = (
                                int(start_color[0] + (end_color[0] - start_color[0]) * color_pct),
                                int(start_color[1] + (end_color[1] - start_color[1]) * color_pct),
                                int(start_color[2] + (end_color[2] - start_color[2]) * color_pct),
                                255
                            )
                            cv2.polylines(glow_layer, [pts], False, color, thick)
                            
                        glow_mask = glow_layer[:, :, 3] > 0
                        overlay[glow_mask] = glow_layer[glow_mask]

                    # Blend particles/VFX overlay onto main frame using optimized alpha blending
                    alpha_vfx = overlay[:, :, 3:4]
                    mask = alpha_vfx[:, :, 0] > 0
                    if np.any(mask):
                        roi_vfx = frame[mask, :3]
                        fg_vfx = overlay[mask, :3]
                        alpha_vals = alpha_vfx[mask]
                        diff_vfx = fg_vfx.astype(np.int16) - roi_vfx
                        frame[mask, :3] = (roi_vfx + ((diff_vfx * alpha_vals) >> 8)).astype(np.uint8)
                    
                    # 4. Draw Visualizers
                    draw_spectrum_layers(frame, dataArray, settings, t, p_width, p_height, vis_layer_normal, vis_layer_antialiased)
                    
                    # 5. Draw Title and Artist Text Overlays
                    if text_layer_cache is not None:
                        # Draw static text with alpha fading support
                        text_alpha = 1.0
                        if settings.get("titleDisplayMode") == "Tampil 10 Detik Awal":
                            elapsed_sec = t
                            if elapsed_sec > 10:
                                text_alpha = max(0.0, 1.0 - (elapsed_sec - 10.0) * 0.8)
                                
                        if text_alpha > 0.0:
                            if text_alpha == 1.0:
                                mask = text_layer_cache[:, :, 3] > 10
                                frame[mask] = text_layer_cache[mask]
                            else:
                                alpha_val = (text_layer_cache[:, :, 3:4].astype(np.uint16) * int(text_alpha * 256)) >> 8
                                alpha_val = alpha_val.astype(np.uint8)
                                roi_text = frame[:, :, :3]
                                text_rgb = text_layer_cache[:, :, :3]
                                diff_text = text_rgb.astype(np.int16) - roi_text
                                frame[:, :, :3] = (roi_text + ((diff_text * alpha_val) >> 8)).astype(np.uint8)
                        
                        # Dynamically draw lyrics ONLY on top
                        draw_text_overlays(frame, settings, t, vol_factor, p_width, p_height, draw_title=False)
                    else:
                        # Fallback to dynamic draw (if beatGlow is True or showTitle is dynamic)
                        draw_text_overlays(frame, settings, t, vol_factor, p_width, p_height)
                    
                    # 6. Draw Circular Logo Overlay
                    draw_logo_overlay(frame, logo_img_cache if logo_img_cache is not None else logo_path, settings, vol_factor, p_width, p_height)
                    
                    # 7. Draw Progress Bar
                    if settings.get("showProgressBar", False):
                        bar_width = int(1100 * (p_width / 1280.0))
                        bar_height = int(8 * (p_height / 720.0))
                        bar_x = int((p_width - bar_width) / 2)
                        bar_y = int(675 * (p_height / 720.0))
                        
                        # Background bar: semi-transparent white (alpha = 0.25)
                        bg_bar_layer = frame[bar_y:bar_y+bar_height, bar_x:bar_x+bar_width].copy()
                        cv2.rectangle(bg_bar_layer, (0, 0), (bar_width, bar_height), (255, 255, 255, 255), -1)
                        frame[bar_y:bar_y+bar_height, bar_x:bar_x+bar_width, :3] = cv2.addWeighted(frame[bar_y:bar_y+bar_height, bar_x:bar_x+bar_width, :3], 0.75, bg_bar_layer[:, :, :3], 0.25, 0.0)
                        
                        # Progress bar fill (using barColor)
                        fill_width = int(bar_width * (t / duration))
                        if fill_width > 0:
                            bar_color_bgr = hex_to_bgr(settings.get("barColor", "#8B5CF6"))
                            cv2.rectangle(frame, (bar_x, bar_y), (bar_x + fill_width, bar_y + bar_height), (bar_color_bgr[0], bar_color_bgr[1], bar_color_bgr[2], 255), -1)

                    # 8. Apply Camera Shake
                    base_effect = settings.get("baseEffect", "Static Cover (Standard)")
                    shake_intensity = float(settings.get("beatShake", 0))
                    if base_effect == "Camera Shake (Bass React)" or (settings.get("musicPulse", False) and shake_intensity > 0):
                        intensity_val = shake_intensity if shake_intensity > 0 else 1.0
                        frame = apply_camera_shake(frame, t, intensity_val, p_width, p_height)
                    # Stream raw frame bytes to FFmpeg stdin via Queue buffer
                    frame_queue.put(frame.tobytes())
                    
                frame_queue.put(None)
                writer_thread.join()
                process.stdin.close()
                if cap is not None:
                    cap.release()
            except BrokenPipeError:
                pass
            except Exception as e:
                print(f"WARNING: Stdin pipe writing failed: {e}")
                sys.stdout.flush()
                try:
                    frame_queue.put(None)
                    writer_thread.join()
                except:
                    pass
                
        process.wait()
        set_active_ffmpeg_process(None)
        if job_ref is not None:
            job_ref['ffmpeg_process'] = None
        return process.returncode

    success = False
    last_error_code = 0
    for i, codec_candidate in enumerate(codecs_to_try):
        is_gpu_candidate = any(x in codec_candidate for x in ["nvenc", "amf", "qsv", "mf"])
        
        cand_bitrate_args = []
        if "24 Mbps" in v_bitrate_str:
            cand_bitrate_args = ["-b:v", "24M"]
        elif "12 Mbps" in v_bitrate_str:
            cand_bitrate_args = ["-b:v", "12M"]
        elif "6 Mbps" in v_bitrate_str:
            cand_bitrate_args = ["-b:v", "6M"]
        else:
            if not is_gpu_candidate:
                cand_bitrate_args = ["-crf", str(settings.get("videoCRF", 23))]
            else:
                if "nvenc" in codec_candidate:
                    cand_bitrate_args = ["-rc", "constqp", "-qp", "23"]
                elif "amf" in codec_candidate:
                    cand_bitrate_args = ["-rc", "cqp", "-qp_i", "23", "-qp_p", "23"]
                elif "qsv" in codec_candidate:
                    cand_bitrate_args = ["-global_quality", "23"]
                else: # mf
                    cand_bitrate_args = ["-b:v", "12M"]
                    
        cmd = [
            "ffmpeg", "-y"
        ] + cmd_inputs + [
            "-filter_complex", filter_graph,
            "-map", video_map_label,
            "-map", audio_map_label,
            "-c:v", codec_candidate,
            "-preset", preset_val if not is_gpu_candidate else "fast",
            "-pix_fmt", "yuv420p",
            "-r", str(fps),
            "-g", gop_val,
            "-t", str(duration)
        ] + cand_bitrate_args + [
            "-c:a", "aac",
            "-b:a", a_bitrate
        ]
        
        if is_stream:
            cmd += ["-f", "flv", output_target]
        else:
            cmd += [output_target]
            
        desc = f"GPU ({codec_candidate})" if is_gpu_candidate else f"CPU ({codec_candidate})"
        if i > 0:
            prev_codec = codecs_to_try[i-1]
            prev_is_gpu = any(x in prev_codec for x in ["nvenc", "amf", "qsv", "mf"])
            prev_desc = f"GPU ({prev_codec})" if prev_is_gpu else f"CPU ({prev_codec})"
            print(f"PROGRESS:25:[Peringatan] Encoder {prev_desc} gagal/tidak didukung. Mencoba alternatif: {desc} (Proses diulang)...")
            sys.stdout.flush()
            
        try:
            with open(os.path.join(backend_dir, "last_ffmpeg_cmd.txt"), "w") as f:
                f.write(f"Desc: {desc}\nCommand:\n" + " ".join(cmd) + "\n")
        except Exception:
            pass
            
        ret_code = run_ffmpeg_process(cmd, desc, job_ref=job_ref)
        if ret_code == 0:
            CACHED_WORKING_CODEC = codec_candidate
            success = True
            break
        else:
            last_error_code = ret_code
            
    # Cleanup temp preprocessed background file
    try:
        if is_preprocessed and preprocessed_bg_path and os.path.exists(preprocessed_bg_path):
            os.remove(preprocessed_bg_path)
    except Exception:
        pass

    if not success:
        raise Exception(f"FFmpeg pipeline failed. All encoders exhausted. Last return code was {last_error_code}")

def format_time_str(seconds):
    hours = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hours > 0:
        return f"{hours:02d}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}"
