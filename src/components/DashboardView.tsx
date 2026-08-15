import React from 'react';
import { 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Layers, 
  Clock, 
  ArrowRight, 
  Activity, 
  Zap,
  Music,
  Cpu,
  Key,
  BookOpen
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  aspectRatio: '16:9' | '9:16' | '1:1';
  color: string;
  bgClass: string;
  config: Record<string, any>;
}

interface DashboardViewProps {
  onSelectPreset: (config: Record<string, any>) => void;
  exportCount: number;
  lastExportStatus: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenDirectDownload?: (type?: 'audio' | 'background') => void;
  onOpenStemSeparator?: () => void;
  onOpenPresetModal?: () => void;
  onOpenBatchModal?: () => void;
  onOpenLicenseManager?: () => void;
  userRole?: string;
  licenseKey?: string;
}

export function DashboardView({ 
  onSelectPreset, 
  exportCount, 
  lastExportStatus,
  setActiveTab,
  onOpenDirectDownload,
  onOpenStemSeparator,
  onOpenPresetModal,
  onOpenBatchModal,
  onOpenLicenseManager,
  userRole = 'SuperAdmin',
  licenseKey = 'AUDIRA-2026-VIP-FULL-ACCESS'
}: DashboardViewProps) {
  const [diagnostics, setDiagnostics] = React.useState<any>(null);

  const fetchDiagnostics = async () => {
    let attempts = 0;
    let success = false;

    while (attempts < 6 && !success) {
      try {
        attempts++;
        const res = await fetch('http://localhost:1426/diagnostics');
        if (res.ok) {
          const data = await res.json();
          setDiagnostics(data);
          success = true;
          break;
        }
      } catch (err) {
        if (attempts === 1 && (window as any).__TAURI_INTERNALS__) {
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            await invoke('start_python_backend');
          } catch (e) {}
        }
      }
      if (!success && attempts < 6) {
        await new Promise(r => setTimeout(r, 800));
      }
    }
    if (!success) {
      setDiagnostics(null);
    }
  };

  React.useEffect(() => {
    fetchDiagnostics();
  }, []);
  
  const presets: Preset[] = [
    {
      id: 'youtube-classic',
      name: 'YouTube Widescreen 16:9',
      description: 'Format horizontal 1920x1080 standar dengan spektrum batang 3D & partikel kosmik.',
      icon: <Monitor className="w-8 h-8 text-black" />,
      aspectRatio: '16:9',
      color: '#EF4444',
      bgClass: 'bg-[#FEE2E2]',
      config: {
        aspectRatio: '16:9',
        socialPreset: 'youtube',
        visualizerType: 'bars',
        barColor: '#EF4444',
        barWidth: 6,
        barSpacing: 4,
        sensitivity: 1.3,
        partCosmic: true,
        partConfetti: false,
        partSparks: false,
        partSnow: false
      }
    },
    {
      id: 'tiktok-shorts',
      name: 'Shorts & TikTok 9:16',
      description: 'Format vertikal 1080x1920 untuk ponsel pintar lengkap dengan lirik karaoke & Beat Shake.',
      icon: <Smartphone className="w-8 h-8 text-black" />,
      aspectRatio: '9:16',
      color: '#8B5CF6',
      bgClass: 'bg-[#F3E8FF]',
      config: {
        aspectRatio: '9:16',
        socialPreset: 'tiktok',
        visualizerType: 'circular',
        barColor: '#8B5CF6',
        barWidth: 5,
        barSpacing: 3,
        sensitivity: 1.5,
        partCosmic: false,
        partConfetti: true,
        partSparks: true,
        vfxScreenShake: true
      }
    },
    {
      id: 'spotify-canvas',
      name: 'Spotify & IG Feed 1:1',
      description: 'Format persegi 1080x1080 dengan Spotify 3D Glass Card dan efek denyut bass.',
      icon: <Music className="w-8 h-8 text-black" />,
      aspectRatio: '1:1',
      color: '#10B981',
      bgClass: 'bg-[#D1FAE5]',
      config: {
        aspectRatio: '1:1',
        socialPreset: 'instagram',
        visualizerType: 'double-circular',
        barColor: '#10B981',
        barWidth: 4,
        barSpacing: 2,
        sensitivity: 1.4,
        partOrbs: true,
        showCoverCard: true
      }
    },
    {
      id: 'retro-lofi',
      name: 'Lofi Vintage Tape',
      description: 'Filter audio mendem radio tape lofi dengan efek derik vinyl & film grain jadul.',
      icon: <Sparkles className="w-8 h-8 text-black" />,
      aspectRatio: '16:9',
      color: '#F59E0B',
      bgClass: 'bg-[#FEF3C7]',
      config: {
        aspectRatio: '16:9',
        visualizerType: 'wave',
        barColor: '#F59E0B',
        lofiFilter: true,
        vfxFilm: true,
        vfxScreenFlicker: true,
        bgAudioPreset: 'crackle'
      }
    }
  ];

  return (
    <div className="min-h-full bg-[#FAF6ED] p-6 space-y-6 animate-in fade-in">
      
      {/* Executive Welcome Hero Header */}
      <div className="bg-[#8B5CF6] text-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] flex flex-wrap gap-4 items-center justify-between">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-black font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
              {userRole} VIP ACCESS
            </span>
            <span className="text-purple-200 text-xs font-mono font-bold">LICENSE: {licenseKey}</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Selamat Datang di Executive Studio Dashboard
          </h1>
          <p className="text-xs text-purple-100 font-bold">
            Studio pembuatan video visualizer musik otomatis dilengkapi akselerasi GPU hardware, penyamar Anti-Copyright, dan otomatisasi batch render.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveTab('editor')}
            className="px-5 py-3 bg-[#FBBF24] hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-black" />
            <span>BUKA STUDIO WORKSPACE</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Hardware Telemetry & System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: GPU Encoder Engine */}
        <div className="bg-white border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 border-2 border-black flex items-center justify-center shrink-0">
            <Monitor className="w-6 h-6 text-purple-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/50">Hardware Acceleration</div>
            <div className="text-xs font-black text-black truncate">
              {diagnostics?.gpu?.name || 'Nvidia NVENC / Hardware Active'}
            </div>
            <div className="text-[9px] font-bold text-emerald-600 font-mono mt-0.5">FFmpeg CUDA / WebGL 60 FPS</div>
          </div>
        </div>

        {/* Card 2: Worker Slots Status */}
        <div className="bg-white border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 border-2 border-black flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6 text-cyan-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/50">Parallel Slots Quota</div>
            <div className="text-xs font-black text-black">3 Parallel Worker Slots</div>
            <div className="text-[9px] font-bold text-cyan-700 font-mono mt-0.5">Multi-Thread CPU Auto-Balance</div>
          </div>
        </div>

        {/* Card 3: Export Statistics */}
        <div className="bg-white border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-amber-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/50">Total Projects Rendered</div>
            <div className="text-sm font-black text-black font-mono">{exportCount} Video MP4</div>
            <div className="text-[9px] font-bold text-amber-800 font-mono mt-0.5">Status: {lastExportStatus || 'Ready'}</div>
          </div>
        </div>

        {/* Card 4: SuperAdmin License Manager Access */}
        <div className="bg-emerald-50 border-3 border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-between gap-2">
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-emerald-950 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-emerald-700" />
              <span>License Suite</span>
            </div>
            <div className="text-xs font-black text-emerald-950 truncate">{userRole} VIP</div>
          </div>

          {onOpenLicenseManager && (
            <button
              onClick={onOpenLicenseManager}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider rounded-lg border border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0"
            >
              🔑 Manage
            </button>
          )}
        </div>

      </div>

      {/* Quick Launchers Toolbar */}
      <div className="p-4 bg-amber-100 border-3 border-black rounded-2xl shadow-[3.5px_3.5px_0px_#000] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase text-black flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span>Pintasan Peluncur Workflow Cepat</span>
          </h3>
          <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded uppercase">QUICK ACTIONS</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {onOpenPresetModal && (
            <button
              onClick={onOpenPresetModal}
              className="p-3 bg-white hover:bg-yellow-100 border-2 border-black rounded-xl font-black text-xs text-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🎨 Gallery Presets</span>
            </button>
          )}

          {onOpenBatchModal && (
            <button
              onClick={onOpenBatchModal}
              className="p-3 bg-white hover:bg-sky-100 border-2 border-black rounded-xl font-black text-xs text-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📁 Batch Multi-Song</span>
            </button>
          )}

          {onOpenStemSeparator && (
            <button
              onClick={onOpenStemSeparator}
              className="p-3 bg-white hover:bg-teal-100 border-2 border-black rounded-xl font-black text-xs text-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🎼 Split Stems Vokal</span>
            </button>
          )}

          {onOpenDirectDownload && (
            <button
              onClick={() => onOpenDirectDownload('audio')}
              className="p-3 bg-white hover:bg-purple-100 border-2 border-black rounded-xl font-black text-xs text-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⚡ Download URL</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('guide')}
            className="p-3 bg-white hover:bg-emerald-100 border-2 border-black rounded-xl font-black text-xs text-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📖 Manual Panduan</span>
          </button>
        </div>
      </div>

      {/* Preset Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black uppercase text-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Pilih Preset Templat Visualizer Siap Pakai</span>
          </h2>
          <span className="text-xs font-bold text-black/60">Klik untuk langsung menerapkan ke Studio</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {presets.map((preset) => (
            <div 
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset.config);
                setActiveTab('editor');
              }}
              className={`p-5 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] cursor-pointer ${preset.bgClass} flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000]">
                    {preset.icon}
                  </div>
                  <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    {preset.aspectRatio}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-sm text-black">{preset.name}</h3>
                  <p className="text-xs font-bold text-black/75 mt-1 leading-relaxed">{preset.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/10 flex items-center justify-between text-xs font-black text-black">
                <span>Terapkan Preset</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <div 
          onClick={() => setActiveTab('queue')}
          className="p-5 bg-sky-100 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] cursor-pointer hover:translate-y-[-1px] transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">PARALLEL QUEUE</span>
            <h4 className="font-black text-sm text-black">Halaman Queue Worker</h4>
            <p className="text-xs font-bold text-black/70">Pantau proses render paralel 3 slot</p>
          </div>
          <Layers className="w-8 h-8 text-sky-700 shrink-0" />
        </div>

        <div 
          onClick={() => setActiveTab('history')}
          className="p-5 bg-emerald-100 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] cursor-pointer hover:translate-y-[-1px] transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">EXPORT LOGS</span>
            <h4 className="font-black text-sm text-black">Riwayat Ekspor Video</h4>
            <p className="text-xs font-bold text-black/70">Putar video & buka folder hasil</p>
          </div>
          <Clock className="w-8 h-8 text-emerald-700 shrink-0" />
        </div>

        <div 
          onClick={() => setActiveTab('guide')}
          className="p-5 bg-purple-100 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] cursor-pointer hover:translate-y-[-1px] transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">DOCUMENTATION</span>
            <h4 className="font-black text-sm text-black">Panduan & Manual Hub</h4>
            <p className="text-xs font-bold text-black/70">Tur 5-langkah & strategi Anti-Copyright</p>
          </div>
          <BookOpen className="w-8 h-8 text-purple-700 shrink-0" />
        </div>
      </div>

    </div>
  );
}
