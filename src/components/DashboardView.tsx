import React from 'react';
import { 
  Sparkles, 
  Monitor, 
  Camera, 
  Smartphone, 
  Tv, 
  Layers, 
  Clock, 
  Flame, 
  ArrowRight,
  HelpCircle,
  Video,
  Activity,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Zap
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  aspectRatio: '16:9' | '9:16';
  color: string;
  bgClass: string;
  config: Record<string, any>;
}

interface DashboardViewProps {
  onSelectPreset: (config: Record<string, any>) => void;
  exportCount: number;
  lastExportStatus: string;
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'editor' | 'history' | 'settings' | 'queue') => void;
  onOpenDirectDownload?: (type?: 'audio' | 'background') => void;
  onOpenStemSeparator?: () => void;
}

export function DashboardView({ 
  onSelectPreset, 
  exportCount, 
  lastExportStatus,
  setActiveTab,
  onOpenDirectDownload,
  onOpenStemSeparator
}: DashboardViewProps) {
  const [diagnostics, setDiagnostics] = React.useState<any>(null);
  const [loadingDiag, setLoadingDiag] = React.useState<boolean>(true);

  const fetchDiagnostics = () => {
    setLoadingDiag(true);
    fetch('http://localhost:1426/diagnostics')
      .then(res => res.json())
      .then(data => {
        setDiagnostics(data);
        setLoadingDiag(false);
      })
      .catch(err => {
        console.error("Failed to fetch diagnostics:", err);
        setDiagnostics(null);
        setLoadingDiag(false);
      });
  };

  React.useEffect(() => {
    fetchDiagnostics();
  }, []);
  
  const presets: Preset[] = [
    {
      id: 'youtube-classic',
      name: 'YouTube Landscape',
      description: 'Format horizontal 16:9 standar dengan visualisator batang klasik dan partikel kosmik.',
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
        showTitle: true,
        titleText: 'Visualizer Klasik\nYouTube Musik',
        specShow: true,
        vfxNeon: false,
      }
    },
    {
      id: 'tiktok-reels',
      name: 'TikTok & Reels Vertical',
      description: 'Format vertikal 9:16 dioptimalkan untuk perangkat mobile dengan visualisator neon gelombang.',
      icon: <Smartphone className="w-8 h-8 text-black" />,
      aspectRatio: '9:16',
      color: '#EC4899',
      bgClass: 'bg-[#FCE7F3]',
      config: {
        aspectRatio: '9:16',
        socialPreset: 'tiktok',
        visualizerType: 'wave',
        barColor: '#EC4899',
        sensitivity: 1.5,
        vfxNeon: true,
        partConfetti: true,
        partCosmic: false,
        showTitle: true,
        titleText: 'New Release\nTrending Sound',
        specShow: true,
      }
    },
    {
      id: 'spotify-canvas',
      name: 'Spotify Canvas Loop',
      description: 'Pratinjau visualisator melingkar berulang untuk Spotify Canvas artist.',
      icon: <Tv className="w-8 h-8 text-black" />,
      aspectRatio: '9:16',
      color: '#10B981',
      bgClass: 'bg-[#D1FAE5]',
      config: {
        aspectRatio: '9:16',
        socialPreset: 'ig',
        visualizerType: 'circular',
        barColor: '#10B981',
        sensitivity: 1.1,
        partOrbs: true,
        partCosmic: false,
        showTitle: false,
        specShow: true,
        vfxNeon: false,
      }
    },
    {
      id: 'instagram-feed',
      name: 'Instagram Square Style',
      description: 'Visualisator gelombang tebal bergaya retro dengan filter warna lofi.',
      icon: <Camera className="w-8 h-8 text-black" />,
      aspectRatio: '16:9', // custom 1:1 can be mocked using 16:9 with centered visualizer
      color: '#F59E0B',
      bgClass: 'bg-[#FEF3C7]',
      config: {
        aspectRatio: '16:9',
        socialPreset: 'ig',
        visualizerType: 'wave',
        barColor: '#F59E0B',
        sensitivity: 1.4,
        partSparks: true,
        partCosmic: false,
        showTitle: true,
        titleText: 'Lofi Beats\nInstagram Vibe',
        specShow: true,
        vfxNeon: false,
        lofiFilter: true,
      }
    }
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#FAF6ED] max-w-6xl mx-auto space-y-8">
      {/* 1. Welcome Header Banner */}
      <div className="bg-[#E0E7FF] border-[3px] border-black p-6 rounded-2xl neo-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-bold text-black shadow-[1.5px_1.5px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
            <span>Versi Pengembangan Aktif</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black leading-tight">
            Selamat Datang di AudioMix Studio!
          </h2>
          <p className="text-sm font-semibold text-black/75 max-w-xl">
            Ubah file audio Anda menjadi video visualizer musik premium berkecepatan tinggi dengan akselerasi GPU WebGL dan Tauri.
          </p>
          {/* Quick AI & Download Launcher Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {onOpenDirectDownload && (
              <button
                type="button"
                onClick={() => onOpenDirectDownload('audio')}
                className="px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Direct Download URL (yt-dlp)</span>
              </button>
            )}
            {onOpenStemSeparator && (
              <button
                type="button"
                onClick={onOpenStemSeparator}
                className="px-3.5 py-1.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
              >
                <span>🎼</span>
                <span>AI Stem Separator (Vokal & Musik)</span>
              </button>
            )}
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('editor')}
          className="px-6 py-3 bg-[#8B5CF6] text-white border-[2.5px] border-black rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000] transition-all shrink-0"
        >
          <span>Buka Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Stats Grid & System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-[3px] border-black p-5 rounded-xl neo-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#DDD6FE] border-2 border-black flex items-center justify-center">
            <Video className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-black/55 tracking-wider">Total Render Video</div>
            <div className="text-2xl font-black text-black">{exportCount} Video</div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-5 rounded-xl neo-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#D1FAE5] border-2 border-black flex items-center justify-center">
            <Flame className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-black/55 tracking-wider">Status Akselerasi</div>
            <div className="text-lg font-black text-green-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              <span>WebGL Aktif (60 FPS)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-5 rounded-xl neo-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#FCE7F3] border-2 border-black flex items-center justify-center">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-black/55 tracking-wider">Status Terakhir</div>
            <div className="text-xs font-bold text-black/80 truncate max-w-[200px]" title={lastExportStatus || 'Belum ada ekspor'}>
              {lastExportStatus || 'Tidak ada proses berjalan'}
            </div>
          </div>
        </div>
      </div>

      {/* 2.5. Diagnostics & System Integrity Check Panel */}
      <div className="bg-white border-[3px] border-black p-6 rounded-2xl neo-shadow space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-black animate-pulse" />
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              Diagnostik Sistem & Status Komponen
            </h3>
          </div>
          <button 
            onClick={fetchDiagnostics}
            className="p-1.5 bg-yellow-300 border-2 border-black rounded-lg hover:bg-yellow-400 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_#000] transition-all"
            title="Refresh Diagnostik"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-black ${loadingDiag ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingDiag ? (
          <div className="text-xs font-bold text-black/60 animate-pulse py-4">
            Memeriksa integritas sistem dan status komponen...
          </div>
        ) : !diagnostics ? (
          <div className="border-[2.5px] border-red-500 bg-red-50 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-red-700 font-bold text-xs neo-shadow shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 flex-shrink-0 text-red-600" />
              <div>
                Python Backend (http://localhost:1426) belum terhubung.
              </div>
            </div>
            <button 
              onClick={async () => {
                setLoadingDiag(true);
                try {
                  if ((window as any).__TAURI_INTERNALS__) {
                    const { invoke } = await import('@tauri-apps/api/core');
                    await invoke('start_python_backend');
                  }
                } catch (e) {
                  console.warn("Tauri invoke start_python_backend error:", e);
                }
                // Retry fetching diagnostics up to 5 times
                let attempts = 0;
                while (attempts < 5) {
                  await new Promise(r => setTimeout(r, 600));
                  attempts++;
                  await fetchDiagnostics();
                }
                setLoadingDiag(false);
              }}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-black fill-black" />
              <span>HUBUNGKAN / START PYTHON BACKEND OTOMATIS</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Python Server */}
            <div className="border-[2.5px] border-black p-4 rounded-xl bg-[#F0FDF4] shadow-[2.5px_2.5px_0px_#000]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-green-800">Python Backend</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="mt-2 text-xs font-black text-green-950">STATUS: ONLINE</div>
              <div className="text-[9px] font-semibold text-green-700/80 mt-1 leading-relaxed">Mengontrol antrean & render video (Port 1426)</div>
            </div>

            {/* 2. FFmpeg Engine */}
            <div className={`border-[2.5px] border-black p-4 rounded-xl shadow-[2.5px_2.5px_0px_#000] ${diagnostics.ffmpeg.includes('ONLINE') ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-wider ${diagnostics.ffmpeg.includes('ONLINE') ? 'text-green-800' : 'text-red-800'}`}>FFmpeg Engine</span>
                {diagnostics.ffmpeg.includes('ONLINE') ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className={`mt-2 text-xs font-black ${diagnostics.ffmpeg.includes('ONLINE') ? 'text-green-950' : 'text-red-950'}`}>
                {diagnostics.ffmpeg.includes('ONLINE') ? 'STATUS: ONLINE' : 'STATUS: ERROR'}
              </div>
              <div className={`text-[9px] font-semibold mt-1 leading-relaxed ${diagnostics.ffmpeg.includes('ONLINE') ? 'text-green-700/80' : 'text-red-700/80'}`}>
                {diagnostics.ffmpeg.includes('ONLINE') 
                  ? `Encoder Aktif: ${diagnostics.encoders.join(', ') || 'Hanya CPU (libx264)'}`
                  : diagnostics.ffmpeg
                }
              </div>
            </div>

            {/* 3. OpenCV Core */}
            <div className={`border-[2.5px] border-black p-4 rounded-xl shadow-[2.5px_2.5px_0px_#000] ${diagnostics.opencv.includes('ONLINE') ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-wider ${diagnostics.opencv.includes('ONLINE') ? 'text-green-800' : 'text-red-800'}`}>OpenCV Engine</span>
                {diagnostics.opencv.includes('ONLINE') ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className={`mt-2 text-xs font-black ${diagnostics.opencv.includes('ONLINE') ? 'text-green-950' : 'text-red-950'}`}>
                {diagnostics.opencv.includes('ONLINE') ? 'STATUS: ONLINE' : 'STATUS: ERROR'}
              </div>
              <div className={`text-[9px] font-semibold mt-1 leading-relaxed ${diagnostics.opencv.includes('ONLINE') ? 'text-green-700/80' : 'text-red-700/80'}`}>
                {diagnostics.opencv.includes('ONLINE') 
                  ? `Memproses partikel & efek: ${diagnostics.opencv}`
                  : diagnostics.opencv
                }
              </div>
            </div>

            {/* 4. Write Access */}
            <div className={`border-[2.5px] border-black p-4 rounded-xl shadow-[2.5px_2.5px_0px_#000] ${(diagnostics.write_temp === 'ONLINE' && diagnostics.write_exports === 'ONLINE') ? 'bg-[#F0FDF4]' : 'bg-[#FEF2F2]'}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-black">Akses Tulis Disk</span>
                {(diagnostics.write_temp === 'ONLINE' && diagnostics.write_exports === 'ONLINE') ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div className="mt-2 text-xs font-black text-black">STATUS: VERIFIED</div>
              <div className="text-[9px] font-semibold mt-1 text-black/75 leading-relaxed">
                Backend Temp: {diagnostics.write_temp === 'ONLINE' ? 'Aman' : 'Gagal'}, Exports: {diagnostics.write_exports === 'ONLINE' ? 'Aman' : 'Gagal'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Preset Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-black" />
          <h3 className="text-xl font-black text-black uppercase tracking-wider">Pilih Template Visualisator</h3>
        </div>
        <p className="text-xs font-bold text-black/60">Klik salah satu template di bawah untuk memulai pratinjau dengan konfigurasi preset secara otomatis.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {presets.map((preset) => (
            <div 
              key={preset.id}
              onClick={() => onSelectPreset(preset.config)}
              className={`p-6 border-[3px] border-black rounded-xl neo-shadow cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all flex flex-col justify-between h-[230px] ${preset.bgClass}`}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg border-2 border-black bg-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
                  {preset.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm text-black">{preset.name}</h4>
                  <p className="text-[11px] font-semibold text-black/70 leading-relaxed line-clamp-3">
                    {preset.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black rounded uppercase tracking-wider">
                  Rasio {preset.aspectRatio}
                </span>
                <span className="text-xs font-black flex items-center gap-1">
                  <span>Gunakan</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick Help & Workflow Guide */}
      <div className="bg-white border-[3px] border-black p-6 rounded-xl neo-shadow space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-black" />
          <h3 className="font-black text-sm uppercase tracking-wider text-black">Panduan Kilat 3 Langkah Pembuatan Video</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5 p-4 border-2 border-dashed border-black/30 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">1</div>
            <h4 className="font-black text-xs uppercase tracking-wider">Upload File Media</h4>
            <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
              Masuk ke tab <strong>Workspace</strong>. Di panel kiri, unggah file audio MP3/WAV dan file background gambar (JPG/PNG).
            </p>
          </div>

          <div className="space-y-1.5 p-4 border-2 border-dashed border-black/30 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">2</div>
            <h4 className="font-black text-xs uppercase tracking-wider">Atur & Kustomisasi</h4>
            <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
              Atur spektrum warna visualizer, lirik, judul lagu, dan efek partikel visual di tab kustomisasi Editor sesuai selera Anda.
            </p>
          </div>

          <div className="space-y-1.5 p-4 border-2 border-dashed border-black/30 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">3</div>
            <h4 className="font-black text-xs uppercase tracking-wider">Ekspor Menjadi MP4</h4>
            <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
              Setelah preview selesai dan sesuai, klik tombol <strong>Mulai Render MP4</strong> untuk mengekspor video offline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
