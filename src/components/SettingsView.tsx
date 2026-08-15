import { useState, useEffect } from 'react';
import { 
  Settings, Folder, RefreshCw, Save, CheckCircle,
  FolderOpen, Palette, Bell, Shield, Zap, Search
} from 'lucide-react';

interface SettingsViewProps {
  geminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
  outputPath: string;
  onSaveOutputPath: (path: string) => void;
  onResetAllSettings: () => void;
  
  // Audira Router Settings Props
  useAudiraRouter: boolean;
  audiraRouterUrl: string;
  audiraRouterKey: string;
  audiraRouterModel: string;
  onSaveAudiraRouterSettings: (useRouter: boolean, url: string, key: string, model: string) => void;
  onSelectTheme?: (theme: string) => void;
}

export function SettingsView({
  geminiApiKey,
  onSaveGeminiApiKey,
  outputPath,
  onSaveOutputPath,
  onResetAllSettings,
  useAudiraRouter,
  audiraRouterUrl,
  audiraRouterKey,
  audiraRouterModel,
  onSaveAudiraRouterSettings,
  onSelectTheme
}: SettingsViewProps) {
  const [apiKey, setApiKey] = useState(geminiApiKey);
  const [path, setPath] = useState(outputPath);
  
  // Audira Router local state
  const [useRouter, setUseRouter] = useState(useAudiraRouter);
  const [routerUrl, setRouterUrl] = useState(audiraRouterUrl);
  const [routerKey, setRouterKey] = useState(audiraRouterKey);
  const [routerModel, setRouterModel] = useState(audiraRouterModel);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isScanningPorts, setIsScanningPorts] = useState(false);
  
  // GPU Hardware Info state
  const [gpuInfo, setGpuInfo] = useState<any>(null);
  const [isCheckingGpu, setIsCheckingGpu] = useState(false);

  // New Pro Settings State
  const [appTheme, setAppTheme] = useState<string>(() => localStorage.getItem('audira_app_theme') || 'warm_cream');
  const [renderProfile, setRenderProfile] = useState<string>(() => localStorage.getItem('audira_render_profile') || 'ultra_speed');
  const [enableSoundAlert, setEnableSoundAlert] = useState<boolean>(() => localStorage.getItem('audira_sound_alert') !== 'false');
  const [autoSaveInterval] = useState<string>(() => localStorage.getItem('audira_autosave_interval') || '60');
  const [diskGuardPolicy, setDiskGuardPolicy] = useState<string>(() => localStorage.getItem('audira_disk_guard') || 'auto_suffix');

  // Audio Mastering LUFS State
  const [lufsPreset] = useState<string>(() => {
    return localStorage.getItem('audira_lufs_preset') || '-14 (YouTube Standard)';
  });
  const [sampleRate] = useState<string>(() => {
    return localStorage.getItem('audira_sample_rate') || '44100 Hz (CD Standard)';
  });

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // Check GPU Hardware Info from Python Backend
  const checkGpuHardware = async () => {
    setIsCheckingGpu(true);
    try {
      const res = await fetch('http://localhost:1426/gpu_info');
      if (res.ok) {
        const data = await res.json();
        setGpuInfo(data);
      }
    } catch {
      /* Backend offline or fallback */
    } finally {
      setIsCheckingGpu(false);
    }
  };

  useEffect(() => {
    checkGpuHardware();
  }, []);

  // Interactive Audira Router Connection & Latency Tester
  const testRouterConnection = async () => {
    if (!routerUrl) return;
    setConnectionStatus('testing');
    setLatencyMs(null);
    const startTime = performance.now();
    try {
      const res = await fetch(`${routerUrl}/models`, {
        headers: routerKey ? { 'Authorization': `Bearer ${routerKey}` } : {}
      });
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);
      setLatencyMs(elapsed);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setModelsList(data.data.map((m: any) => m.id));
        } else if (Array.isArray(data)) {
          setModelsList(data.map((m: any) => m.id || m));
        }
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('failed');
      }
    } catch (e) {
      setConnectionStatus('failed');
    }
  };

  useEffect(() => {
    if (routerUrl) {
      testRouterConnection();
    }
  }, [routerUrl]);

  // Port Scanner for Local AI Services
  const handleScanLocalAiPorts = async () => {
    setIsScanningPorts(true);
    const candidatePorts = [
      { port: 20128, name: 'Audira Router' },
      { port: 11434, name: 'Ollama AI' },
      { port: 8080, name: 'Local AI Proxy' },
      { port: 5000, name: 'Flask AI Service' }
    ];

    let foundUrl: string | null = null;
    for (const p of candidatePorts) {
      try {
        const testUrl = `http://localhost:${p.port}/v1`;
        const res = await fetch(`${testUrl}/models`, { method: 'GET' });
        if (res.ok || res.status === 401) {
          foundUrl = testUrl;
          break;
        }
      } catch {}
    }

    setIsScanningPorts(false);
    if (foundUrl) {
      setRouterUrl(foundUrl);
      alert(`🟢 Berhasil Menemukan Server AI Lokal di: ${foundUrl}`);
    } else {
      alert("ℹ️ Tidak ada server AI lokal tambahan yang ditemukan pada port 20128/11434. Menggunakan URL default.");
    }
  };

  // Play test sound chime
  const handleTestSoundAlert = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  };

  // Native File/Folder Selector via Backend API
  const handleBrowseFolder = async () => {
    try {
      const res = await fetch('http://localhost:1426/select_output_file');
      if (res.ok) {
        const data = await res.json();
        if (data.selectedPath) {
          setPath(data.selectedPath);
        }
      }
    } catch (e) {
      alert("Silakan ketik direktori output secara manual atau jalankan backend Tauri.");
    }
  };

  const handleSave = () => {
    onSaveGeminiApiKey(apiKey);
    onSaveOutputPath(path);
    onSaveAudiraRouterSettings(useRouter, routerUrl, routerKey, routerModel);
    localStorage.setItem('audira_lufs_preset', lufsPreset);
    localStorage.setItem('audira_sample_rate', sampleRate);
    localStorage.setItem('audira_app_theme', appTheme);
    localStorage.setItem('audira_render_profile', renderProfile);
    localStorage.setItem('audira_sound_alert', enableSoundAlert ? 'true' : 'false');
    localStorage.setItem('audira_autosave_interval', autoSaveInterval);
    localStorage.setItem('audira_disk_guard', diskGuardPolicy);
    setSavedStatus('Semua pengaturan studio berhasil disimpan!');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#FAF6ED] max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="border-b-[3px] border-black pb-4">
        <h2 className="text-2xl font-black text-black flex items-center gap-2 uppercase tracking-wider">
          <Settings className="w-6 h-6 text-black" />
          <span>Pengaturan Studio Pro v2.0</span>
        </h2>
        <p className="text-xs font-bold text-black/60">
          Pusat Kontrol Produksi: Atur integrasi AI Cloud, akselerasi GPU, preferensi audio, tema studio, dan direktori ekspor.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_#000] p-6 space-y-6">
        
        {/* 1. UI Theme & Custom Accent Color Switcher */}
        <div className="p-4 border-2 border-black rounded-xl bg-purple-50 space-y-3 shadow-[2.5px_2.5px_0px_#000]">
          <div className="flex items-center gap-2">
            <Palette className="w-4.5 h-4.5 text-purple-700" />
            <span className="font-black text-xs uppercase tracking-wider text-black">
              🎨 Tema & Gaya Tampilan Studio
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { id: 'warm_cream', label: '☕ Warm Cream (Default)' },
              { id: 'cyberpunk_dark', label: '🌌 Cyberpunk OLED Dark' },
              { id: 'purple_neon', label: '🔮 Deep Purple Neon' },
              { id: 'retro_pastel', label: '🍃 Retro Vintage' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setAppTheme(t.id);
                  if (onSelectTheme) onSelectTheme(t.id);
                }}
                className={`p-2.5 border-2 border-black rounded-lg text-xs font-black text-center transition-all cursor-pointer ${
                  appTheme === t.id
                    ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-purple-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Audira Router (Local Proxy & RTK Token Saver) */}
        <div className="p-4 border-2 border-black rounded-xl bg-[#FAF6ED] space-y-4 shadow-[2.5px_2.5px_0px_#000]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useRouter} 
                onChange={(e) => setUseRouter(e.target.checked)}
                className="w-4 h-4 accent-[#8B5CF6] border-2 border-black rounded cursor-pointer"
              />
              <span>Integrasi Audira Router (Local Proxy Token Saver)</span>
            </label>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] ${
                connectionStatus === 'connected' 
                  ? 'bg-[#10B981] text-white' 
                  : connectionStatus === 'failed' 
                  ? 'bg-[#EF4444] text-white animate-pulse'
                  : 'bg-amber-300 text-black'
              }`}>
                {connectionStatus === 'connected'
                  ? `● TERHUBUNG ${latencyMs ? '(' + latencyMs + 'ms)' : ''}`
                  : connectionStatus === 'failed'
                  ? '● OFFLINE / DISCONNECTED'
                  : '● MEMERIKSA...'
                }
              </span>
              <button
                type="button"
                onClick={testRouterConnection}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-black border-2 border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
                title="Uji Koneksi Ulang"
              >
                <RefreshCw className={`w-3 h-3 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Uji Koneksi</span>
              </button>

              <button
                type="button"
                onClick={handleScanLocalAiPorts}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white border-2 border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
                title="Memindai Port Server AI Lokal"
              >
                <Search className={`w-3 h-3 ${isScanningPorts ? 'animate-spin' : ''}`} />
                <span>Pindai Port</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
            Semua pemanggilan model AI (Asisten Copilot & Pembuatan Lirik) dialihkan ke <strong>Audira Router Proxy</strong> (`http://localhost:20128/v1`).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t-2 border-black/10">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-black">Host Endpoint Router</span>
              <input
                type="text"
                value={routerUrl}
                onChange={(e) => setRouterUrl(e.target.value)}
                placeholder="e.g. http://localhost:20128/v1"
                className="w-full neo-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-black">Model AI Terhubung</span>
              <input
                type="text"
                value={routerModel}
                onChange={(e) => setRouterModel(e.target.value)}
                placeholder="Pilih atau ketik nama model..."
                className="w-full neo-input text-xs"
                list="router-models"
              />
              <datalist id="router-models">
                {modelsList.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="kr/gemini-1.5-flash" />
                <option value="opencode/gemini-2.5-flash" />
                <option value="gemini-1.5-flash" />
              </datalist>
            </div>
          </div>
        </div>

        {/* 3. GPU Hardware Acceleration Profile */}
        <div className="p-4 border-2 border-black rounded-xl bg-white space-y-3 shadow-[2.5px_2.5px_0px_#000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
              <span className="font-black text-xs uppercase tracking-wider text-black">
                Profil Performa Render & GPU Hardware Profile
              </span>
            </div>
            <button
              type="button"
              onClick={checkGpuHardware}
              className="px-2 py-0.5 bg-[#FAF6ED] hover:bg-amber-100 border border-black rounded font-black text-[9px] uppercase shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isCheckingGpu ? 'animate-spin' : ''}`} />
              <span>Cek GPU</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              { id: 'ultra_speed', label: '🚀 Ultra Speed (Nvidia NVENC / Parallel)', desc: 'Pengodean video tercepat menggunakan akselerasi hardware GPU.' },
              { id: 'balanced', label: '⚖️ Balanced Quality & Speed', desc: 'Keseimbangan ukuran file dan kecepatan render.' },
              { id: 'high_quality', label: '💎 High Quality Master (CRF 18 / 4K)', desc: 'Hasil kualitas gambar paling tajam untuk video master.' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setRenderProfile(p.id)}
                className={`p-3 border-2 border-black rounded-xl text-left space-y-1 transition-all cursor-pointer ${
                  renderProfile === p.id
                    ? 'bg-amber-100 border-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-amber-50'
                }`}
              >
                <span className="font-black text-xs text-black block">{p.label}</span>
                <span className="text-[10px] text-black/60 font-medium block leading-tight">{p.desc}</span>
              </button>
            ))}
          </div>

          {gpuInfo && (
            <div className="p-2 bg-amber-50 border border-black rounded text-[10px] font-bold text-amber-950 flex items-center justify-between">
              <span>Akselerasi GPU Terdeteksi: {gpuInfo.has_nvidia ? 'Nvidia NVENC' : gpuInfo.has_amd ? 'AMD AMF' : gpuInfo.has_intel ? 'Intel QSV' : 'CPU Software'}</span>
              <span>{gpuInfo.cpu_count || 4} Cores</span>
            </div>
          )}
        </div>

        {/* 4. Desktop Completion Sound Alert & Disk Protection Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sound Alert Card */}
          <div className="p-4 border-2 border-black rounded-xl bg-cyan-50 space-y-3 shadow-[2.5px_2.5px_0px_#000]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-cyan-700" />
                <span className="font-black text-xs uppercase text-black">Notifikasi Alarm Suara</span>
              </div>
              <button
                type="button"
                onClick={handleTestSoundAlert}
                className="px-2 py-1 bg-white hover:bg-cyan-100 border border-black rounded font-black text-[9px] uppercase shadow-[1px_1px_0px_#000] cursor-pointer"
              >
                🔊 Tes Suara
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-sound-alert"
                checked={enableSoundAlert}
                onChange={(e) => setEnableSoundAlert(e.target.checked)}
                className="w-4 h-4 border-2 border-black rounded accent-cyan-600 cursor-pointer"
              />
              <label htmlFor="enable-sound-alert" className="text-xs font-black text-black cursor-pointer">
                Bunyikan Alarm Bel saat Video Selesai Dirender
              </label>
            </div>
          </div>

          {/* Auto-Save & Disk Policy */}
          <div className="p-4 border-2 border-black rounded-xl bg-emerald-50 space-y-3 shadow-[2.5px_2.5px_0px_#000]">
            <div className="flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-emerald-700" />
              <span className="font-black text-xs uppercase text-black">Auto-Save & Kebijakan Disk</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-black block">Kebijakan Penamaan Berkas Sama:</span>
              <select
                value={diskGuardPolicy}
                onChange={(e) => setDiskGuardPolicy(e.target.value)}
                className="w-full bg-white border border-black rounded p-1.5 font-bold text-xs shadow-[1.5px_1.5px_0px_#000]"
              >
                <option value="auto_suffix">Auto-Suffix _1, _2 (Aman & Tidak Menimpa File)</option>
                <option value="ask_confirm">Tanyakan Dulu Sebelum Menyimpan</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Default Output Path Setting with Browse Folder Button */}
        <div className="space-y-2">
          <label className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-black" />
            <span>Direktori Output Video (.MP4)</span>
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Contoh: exports/visualizer.mp4"
              className="flex-1 neo-input text-sm"
            />
            <button
              type="button"
              onClick={handleBrowseFolder}
              className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Pilih File/Folder Visual"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Pilih Folder</span>
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {savedStatus && (
          <div className="bg-green-50 border-2 border-green-500 text-green-700 font-bold p-3.5 rounded-lg flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{savedStatus}</span>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-black/10">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin menyetel ulang semua pengaturan ke default?")) {
                onResetAllSettings();
                setApiKey('');
                setPath('exports/visualizer.mp4');
                setUseRouter(true);
                setRouterUrl('http://localhost:20128/v1');
                setRouterModel('kr/gemini-1.5-flash');
                setRouterKey('');
                localStorage.removeItem('audira_lufs_preset');
                localStorage.removeItem('audira_sample_rate');
                localStorage.removeItem('audira_app_theme');
                localStorage.removeItem('audira_render_profile');
                setSavedStatus('Semua pengaturan berhasil disetel ulang.');
                setTimeout(() => setSavedStatus(null), 3000);
              }
            }}
            className="px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <span>Reset Ke Default</span>
          </button>
        </div>

      </div>
    </div>
  );
}
