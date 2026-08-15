import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  FileVideo2, 
  Zap,
  Play,
  Cpu,
  Monitor,
  Sparkles,
  Download,
  Sliders,
  Layers,
  X,
  ShieldCheck
} from 'lucide-react';

export interface HistoryItem {
  id: string;
  fileName: string;
  resolution: string;
  fps: number;
  date: string;
  status: string;
  progress?: number;
  outputPath?: string;
}

interface HistoryViewProps {
  history: HistoryItem[];
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onMaximizeConsole?: () => void;
  
  // Live Dashboard Props
  isExporting?: boolean;
  exportProgress?: number;
  exportStatus?: string;
  renderElapsedReal?: number;
  renderRealProgress?: string;
  renderElapsedVideo?: string;
  renderTotalVideo?: string;
  renderEncoder?: string;
  exportLogHistory?: string[];
  logFilter?: 'all' | 'ffmpeg' | 'system' | 'warnings';
  setLogFilter?: (filter: 'all' | 'ffmpeg' | 'system' | 'warnings') => void;
  onCancelExport?: () => void;

  // Quick Launcher Callbacks
  onOpenDirectDownload?: (type?: 'audio' | 'background') => void;
  onOpenStemSeparator?: () => void;
  onOpenPresetModal?: () => void;
  onOpenEqModal?: () => void;
  onOpenBatchModal?: () => void;
  onNavigateToStudio?: () => void;
}

let revealFile: any = null;
try {
  import('@tauri-apps/plugin-opener').then((m: any) => {
    revealFile = m.revealItemInDir || m.open;
  });
} catch (e) {
  // Mock environment fallback
}

export function HistoryView({ 
  history, 
  onDeleteHistory, 
  onClearHistory, 
  isExporting,
  exportProgress = 0,
  renderElapsedReal = 0,
  renderEncoder = 'Mempersiapkan...',
  onOpenDirectDownload,
  onOpenStemSeparator,
  onOpenPresetModal,
  onOpenEqModal,
  onOpenBatchModal,
  onNavigateToStudio
}: HistoryViewProps) {
  
  const [parallelSlots, setParallelSlots] = useState<any[]>([
    { slotId: 0, status: 'idle' },
    { slotId: 1, status: 'idle' },
    { slotId: 2, status: 'idle' }
  ]);
  const [serverActiveCount, setServerActiveCount] = useState(0);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [playingVideoTitle, setPlayingVideoTitle] = useState<string>('');

  useEffect(() => {
    const pollQueue = async () => {
      try {
        const res = await fetch('http://localhost:1426/queue_status');
        if (res.ok) {
          const data = await res.json();
          if (data.parallelSlots) setParallelSlots(data.parallelSlots);
          if (typeof data.activeCount === 'number') setServerActiveCount(data.activeCount);
        }
      } catch (e) {}
    };
    pollQueue();
    const interval = setInterval(pollQueue, 800);
    return () => clearInterval(interval);
  }, []);

  const handleOpenFolder = async (filePath: string) => {
    if (revealFile) {
      try {
        await revealFile(filePath);
      } catch (err) {
        console.error("Failed to open folder using Tauri Opener:", err);
      }
    } else {
      alert(`📁 Lokasi Berkas: ${filePath}`);
    }
  };

  const handlePlayVideoModal = (item: HistoryItem) => {
    const targetPath = item.outputPath || `exports/${item.fileName}`;
    if (targetPath.startsWith('http')) {
      setPlayingVideoUrl(targetPath);
    } else {
      setPlayingVideoUrl(`http://localhost:1426/downloads/${encodeURIComponent(item.fileName)}`);
    }
    setPlayingVideoTitle(item.fileName);
  };

  const activeJob = history.find(h => h.status === 'Exporting' || h.status.toLowerCase().includes('rendering'));
  const pastJobs = history.filter(h => h.status !== 'Queued' && h.status !== 'Exporting' && !h.status.toLowerCase().includes('rendering'));
  const hasBackendActiveSlot = parallelSlots.some(s => s && s.status === 'rendering');

  const formatElapsedReal = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#FAF6ED] max-w-6xl mx-auto space-y-8 pb-32 select-none">
      {/* 1. Header & System Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-[3px] border-black pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-200 border-2 border-black rounded-full text-[10px] font-black uppercase text-amber-950 shadow-[1.5px_1.5px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600 animate-pulse" />
            <span>Ultimate Command Center Studio v2.0</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-black flex items-center gap-2 uppercase tracking-wider">
            <Activity className="w-8 h-8 text-black" />
            <span>Dashboard & Render Telemetry</span>
          </h2>
          <p className="text-xs font-bold text-black/60">
            Pusat kendali ekspor studio, telemetri GPU/RAM, antrean slot render paralel, dan riwayat video.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 bg-[#EF4444] text-white border-2 border-black rounded-lg font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {/* 2. 🚀 Quick Launch Studio Tools Bar */}
      <div className="p-4 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-black block">
          🚀 Pintasan Studio Cepat (Quick Tools Launcher):
        </span>
        <div className="flex flex-wrap gap-2.5">
          {onOpenDirectDownload && (
            <button
              type="button"
              onClick={() => onOpenDirectDownload('audio')}
              className="px-3.5 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Direct Download URL (yt-dlp)</span>
            </button>
          )}

          {onOpenStemSeparator && (
            <button
              type="button"
              onClick={onOpenStemSeparator}
              className="px-3.5 py-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Cpu className="w-4 h-4" />
              <span>AI Stem Separator</span>
            </button>
          )}

          {onOpenPresetModal && (
            <button
              type="button"
              onClick={onOpenPresetModal}
              className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preset Studio (.json)</span>
            </button>
          )}

          {onOpenEqModal && (
            <button
              type="button"
              onClick={onOpenEqModal}
              className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>10-Band EQ</span>
            </button>
          )}

          {onOpenBatchModal && (
            <button
              type="button"
              onClick={onOpenBatchModal}
              className="px-3.5 py-2 bg-blue-400 hover:bg-blue-300 text-black border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Batch Multi-Lagu</span>
            </button>
          )}

          {onNavigateToStudio && (
            <button
              type="button"
              onClick={onNavigateToStudio}
              className="px-3.5 py-2 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <span>Ke Studio Workspace →</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 🖥️ Hardware Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 border-2 border-black flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5 text-purple-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/60">GPU Encoder Engine</div>
            <div className="text-xs font-black text-black truncate">Nvidia NVENC / WebGL GPU</div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-100 border-2 border-black flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-cyan-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/60">Multi-Thread Workers</div>
            <div className="text-xs font-black text-black">3 Parallel Worker Slots</div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 border-2 border-black flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-700 fill-amber-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/60">Target Rendering</div>
            <div className="text-xs font-black text-black">1080p / 4K @ 60 FPS High Bitrate</div>
          </div>
        </div>

        <div className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 border-2 border-black flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="truncate">
            <div className="text-[9px] font-black uppercase text-black/60">Perlindungan Disk</div>
            <div className="text-xs font-black text-emerald-700">Overwrite Guard Active</div>
          </div>
        </div>
      </div>

      {/* 4. Multi-Process 3-Slot Parallel Render Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base flex items-center gap-2 text-black">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="border-b-4 border-amber-400 pb-0.5 uppercase tracking-wide">Sistem Slot Render Paralel (Maksimal 3 Slot Akselerasi)</span>
          </h3>
          <span className="bg-[#8B5CF6] text-white text-xs font-black px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            {serverActiveCount > 0 ? `${serverActiveCount} Slot Aktif Berjalan` : 'Semua Slot Siap'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIdx) => {
            const slotData = parallelSlots[slotIdx] || { slotId: slotIdx, status: 'idle' };
            const isSlotActive = slotData.status === 'rendering' || (!hasBackendActiveSlot && isExporting && slotIdx === 0);
            const slotProgress = slotData.status === 'rendering' ? (slotData.progress ?? 0) : (isExporting && slotIdx === 0 ? exportProgress : 0);
            const slotTitle = slotData.title || (isExporting && slotIdx === 0 && activeJob ? activeJob.fileName : `Slot ${slotIdx + 1}`);

            return (
              <div 
                key={slotIdx} 
                className={`border-[3px] border-black rounded-2xl p-4 shadow-[3.5px_3.5px_0px_#000] flex flex-col justify-between space-y-3 transition-all ${
                  isSlotActive ? 'bg-indigo-50 border-indigo-600' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border-2 border-black shadow-[1px_1px_0px_#000] ${
                    slotIdx === 0 ? 'bg-[#8B5CF6] text-white' : slotIdx === 1 ? 'bg-[#06B6D4] text-white' : 'bg-[#F59E0B] text-black'
                  }`}>
                    SLOT {slotIdx + 1}
                  </span>
                  {isSlotActive ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-800 bg-emerald-100 border border-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                      ● MERENDER ({slotProgress}%)
                    </span>
                  ) : (
                    <span className="text-[9px] font-black text-slate-500 bg-slate-100 border border-black/20 px-2 py-0.5 rounded-full uppercase">
                      IDLE / SIAP
                    </span>
                  )}
                </div>

                {isSlotActive ? (
                  <div className="space-y-2.5">
                    <div>
                      <h4 className="font-extrabold text-xs text-black truncate" title={slotTitle}>
                        {slotTitle}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                        Encoder: {renderEncoder}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="h-3.5 w-full bg-white border-2 border-black rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${slotProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-600">
                        <span>WAKTU: {formatElapsedReal(renderElapsedReal)}</span>
                        <span>{slotProgress}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-1">
                    <Zap className="w-6 h-6 text-amber-400 mx-auto opacity-80" />
                    <p className="font-extrabold text-xs text-slate-700 uppercase">SLOT {slotIdx + 1} KOSONG</p>
                    <p className="text-[9px] font-bold text-slate-400">Siap menerima pekerjaan dari Studio</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Finished & Exported History Section */}
      <div className="space-y-4">
        <h3 className="font-black text-base flex items-center gap-2 text-black uppercase tracking-wide">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Riwayat Video Selesai & Pemutar MP3/MP4</span>
        </h3>

        {pastJobs.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-black/30 rounded-2xl bg-white text-center space-y-2">
            <FileVideo2 className="w-10 h-10 text-black/30 mx-auto" />
            <p className="font-extrabold text-xs text-black/60 uppercase">Belum ada riwayat video yang selesai dirender.</p>
            <p className="text-[10px] font-bold text-black/40">Mulai ekspor video dari Studio Workspace untuk mengisi riwayat di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastJobs.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-white border-[3px] border-black rounded-xl shadow-[3px_3px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 bg-emerald-100 border-2 border-black rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-black text-xs text-black truncate">{item.fileName}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-black/60 mt-0.5">
                      <span>{item.resolution} @ {item.fps} FPS</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handlePlayVideoModal(item)}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>🎬 Putar Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFolder(item.outputPath || item.fileName)}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-black border-2 border-black rounded-lg font-bold text-xs shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Buka Folder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteHistory(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg border-2 border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
                    title="Hapus dari Riwayat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instant Video Player Modal */}
      {playingVideoUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
          <div className="bg-[#FEF8EC] border-[4px] border-black rounded-2xl w-full max-w-4xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
            <div className="p-4 bg-emerald-500 text-white border-b-[3px] border-black flex justify-between items-center">
              <span className="font-black text-sm uppercase truncate max-w-md">🎬 Pemutar Video: {playingVideoTitle}</span>
              <button
                onClick={() => setPlayingVideoUrl(null)}
                className="p-1.5 bg-white text-black hover:bg-red-100 border-2 border-black rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black flex justify-center">
              <video 
                src={playingVideoUrl} 
                controls 
                autoPlay 
                className="max-h-[70vh] rounded border border-white/20"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
