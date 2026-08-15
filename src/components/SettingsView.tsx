import { useState, useEffect } from 'react';
import { 
  Settings, Key, Folder, RefreshCw, Eye, EyeOff, Save, CheckCircle,
  Cpu, Volume2, FolderOpen
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
  onSaveAudiraRouterSettings
}: SettingsViewProps) {
  const [apiKey, setApiKey] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [path, setPath] = useState(outputPath);
  
  // Audira Router local state
  const [useRouter, setUseRouter] = useState(useAudiraRouter);
  const [routerUrl, setRouterUrl] = useState(audiraRouterUrl);
  const [routerKey, setRouterKey] = useState(audiraRouterKey);
  const [routerModel, setRouterModel] = useState(audiraRouterModel);
  const [showRouterKey, setShowRouterKey] = useState(false);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  
  // GPU Hardware Info state
  const [gpuInfo, setGpuInfo] = useState<{
    has_nvidia: boolean;
    has_amd: boolean;
    has_intel: boolean;
    cpu_count: number;
    codecs: Record<string, boolean>;
  } | null>(null);
  const [isCheckingGpu, setIsCheckingGpu] = useState(false);

  // Audio Mastering LUFS State
  const [lufsPreset, setLufsPreset] = useState<string>(() => {
    return localStorage.getItem('audira_lufs_preset') || '-14 (YouTube Standard)';
  });
  const [sampleRate, setSampleRate] = useState<string>(() => {
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
    setSavedStatus('Semua pengaturan studio berhasil disimpan!');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#FAF6ED] max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b-[3px] border-black pb-4">
        <h2 className="text-2xl font-black text-black flex items-center gap-2 uppercase tracking-wider">
          <Settings className="w-6 h-6 text-black" />
          <span>Pengaturan Studio</span>
        </h2>
        <p className="text-xs font-bold text-black/60">
          Pusat Kontrol Produksi: Atur integrasi AI Cloud, akselerasi GPU, preferensi audio, dan direktori ekspor.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border-[3px] border-black rounded-xl shadow-[6px_6px_0px_#000] p-6 space-y-6">
        
        {/* 1. Gemini AI API Key */}
        <div className="space-y-2">
          <label className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
            <Key className="w-4 h-4 text-black" />
            <span>Gemini AI API Key (Cloud Transkripsi)</span>
          </label>
          <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
            Digunakan oleh fitur <strong>Ekstraksi Lirik Otomatis (Lyric Wizard)</strong> untuk mentranskripsikan audio menjadi teks lirik berformat sinkronisasi waktu (.LRC) menggunakan model Gemini 1.5 Flash.
          </p>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Masukkan API Key dari Google AI Studio..."
              className="w-full neo-input pr-12 text-sm"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 text-black hover:text-[#8B5CF6] p-1 cursor-pointer"
              type="button"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
            </div>
          </div>

          <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
            Jika diaktifkan, semua pemanggilan model AI (Asisten Copilot & Pembuatan Lirik) akan dialihkan secara lokal ke <strong>Audira Router</strong> (Port 20128). Menghemat kuota token dengan <strong>RTK Token Saver</strong> & multi-provider failover.
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

            <div className="space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-black uppercase text-black">API Key Router (Opsional)</span>
              <div className="relative flex items-center">
                <input
                  type={showRouterKey ? 'text' : 'password'}
                  value={routerKey}
                  onChange={(e) => setRouterKey(e.target.value)}
                  placeholder="Kosongkan jika Audira Router tidak memerlukan autentikasi..."
                  className="w-full neo-input pr-12 text-xs"
                />
                <button
                  onClick={() => setShowRouterKey(!showRouterKey)}
                  className="absolute right-3.5 text-black hover:text-[#8B5CF6] p-1 cursor-pointer"
                  type="button"
                >
                  {showRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. GPU Hardware Acceleration Detection Card */}
        <div className="p-4 border-2 border-black rounded-xl bg-white space-y-3 shadow-[2.5px_2.5px_0px_#000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-[#8B5CF6]" />
              <span className="font-black text-xs uppercase tracking-wider text-black">
                Akselerasi GPU & Hardware Encoder
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <div className={`p-2.5 border-2 border-black rounded-lg text-center space-y-0.5 ${
              gpuInfo?.has_nvidia ? 'bg-green-100' : 'bg-gray-100 opacity-60'
            }`}>
              <span className="font-black text-[10px] uppercase text-black block">NVIDIA NVENC</span>
              <span className="text-[9px] font-bold text-gray-700 block">
                {gpuInfo?.has_nvidia ? '✓ AKTIF (h264_nvenc)' : 'Tidak Terdeteksi'}
              </span>
            </div>

            <div className={`p-2.5 border-2 border-black rounded-lg text-center space-y-0.5 ${
              gpuInfo?.has_amd ? 'bg-cyan-100' : 'bg-gray-100 opacity-60'
            }`}>
              <span className="font-black text-[10px] uppercase text-black block">AMD AMF</span>
              <span className="text-[9px] font-bold text-gray-700 block">
                {gpuInfo?.has_amd ? '✓ AKTIF (h264_amf)' : 'Tidak Terdeteksi'}
              </span>
            </div>

            <div className={`p-2.5 border-2 border-black rounded-lg text-center space-y-0.5 ${
              gpuInfo?.has_intel ? 'bg-amber-100' : 'bg-gray-100 opacity-60'
            }`}>
              <span className="font-black text-[10px] uppercase text-black block">INTEL QSV</span>
              <span className="text-[9px] font-bold text-gray-700 block">
                {gpuInfo?.has_intel ? '✓ AKTIF (h264_qsv)' : 'Tidak Terdeteksi'}
              </span>
            </div>

            <div className="p-2.5 border-2 border-black rounded-lg text-center space-y-0.5 bg-violet-100">
              <span className="font-black text-[10px] uppercase text-black block">CPU SOFTWARE</span>
              <span className="text-[9px] font-bold text-gray-700 block">
                ✓ Ready ({gpuInfo?.cpu_count || 4} Cores)
              </span>
            </div>
          </div>
        </div>

        {/* 4. Audio Mastering & LUFS Loudness Standards */}
        <div className="p-4 border-2 border-black rounded-xl bg-white space-y-3 shadow-[2.5px_2.5px_0px_#000]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4.5 h-4.5 text-[#06B6D4]" />
            <span className="font-black text-xs uppercase tracking-wider text-black">
              Standar Audio Mastering (LUFS & Sample Rate)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-black">Target Normalisasi Loudness (LUFS)</span>
              <select
                value={lufsPreset}
                onChange={(e) => setLufsPreset(e.target.value)}
                className="w-full bg-[#FAF6ED] border-2 border-black rounded-lg p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000] outline-none cursor-pointer"
              >
                <option>-14 (YouTube & Online Video Standard)</option>
                <option>-16 (Spotify & Streaming Standard)</option>
                <option>-24 (EBU R128 Broadcast Standard)</option>
                <option>Mati (Tanpa Normalisasi LUFS)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-black">Audio Sample Rate Default</span>
              <select
                value={sampleRate}
                onChange={(e) => setSampleRate(e.target.value)}
                className="w-full bg-[#FAF6ED] border-2 border-black rounded-lg p-2 font-bold text-xs shadow-[1.5px_1.5px_0px_#000] outline-none cursor-pointer"
              >
                <option>44100 Hz (CD Music Standard)</option>
                <option>48000 Hz (Video Broadcast Standard)</option>
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
          <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
            Lokasi penyimpanan lokal untuk menyimpan file video hasil ekspor akhir dari offline Python renderer.
          </p>
          
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
                setUseRouter(false);
                setRouterUrl('http://localhost:20128/v1');
                setRouterModel('kr/gemini-1.5-flash');
                setRouterKey('');
                localStorage.removeItem('audira_lufs_preset');
                localStorage.removeItem('audira_sample_rate');
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
