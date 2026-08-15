import { Clock, FolderOpen, Trash2, CheckCircle2, XCircle, Terminal, Activity, FileVideo2, Loader2 } from 'lucide-react';

export interface HistoryItem {
  id: string;
  fileName: string;
  resolution: string;
  fps: number;
  date: string;
  status: string;
  progress?: number;
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
  renderElapsedVideo = '--:--',
  renderTotalVideo = '--:--',
  renderEncoder = 'Mempersiapkan...',
  exportLogHistory = [],
  logFilter = 'all',
  setLogFilter,
  onCancelExport
}: HistoryViewProps) {
  
  const handleOpenFolder = async (filePath: string) => {
    if (revealFile) {
      try {
        await revealFile(filePath);
      } catch (err) {
        console.error("Failed to open folder using Tauri Opener:", err);
        alert(`Tidak dapat membuka folder. File tersimpan di: ${filePath}`);
      }
    } else {
      alert(`Mode Web: File disimulasikan disimpan di: ${filePath}`);
    }
  };

  const activeJob = history.find(h => h.status === 'Exporting' || h.status.toLowerCase().includes('rendering'));
  const queuedJobs = history.filter(h => h.status === 'Queued');
  const pastJobs = history.filter(h => h.status !== 'Queued' && h.status !== 'Exporting' && !h.status.toLowerCase().includes('rendering'));

  const formatElapsedReal = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#FAF6ED] max-w-6xl mx-auto space-y-8 pb-32">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-[3px] border-black pb-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-black flex items-center gap-2 uppercase tracking-wider">
            <Activity className="w-8 h-8 text-black" />
            <span>Dashboard & Queue</span>
          </h2>
          <p className="text-sm font-bold text-black/60">
            Monitor proses render real-time, antrean video berikutnya, dan riwayat ekspor.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 bg-[#EF4444] text-white border-2 border-black rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {/* 1. Active Render Dashboard */}
      {isExporting && activeJob && (
        <div className="bg-white border-4 border-black rounded-2xl neo-shadow overflow-hidden flex flex-col xl:flex-row">
          {/* Left Panel: Progress Info */}
          <div className="p-6 xl:w-[45%] border-b-4 xl:border-b-0 xl:border-r-4 border-black bg-[#E0E7FF] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-full border-2 border-black neo-shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SEDANG MERENDER</span>
              </div>
              
              <div>
                <h3 className="font-black text-xl text-black break-all line-clamp-2" title={activeJob.fileName}>
                  {activeJob.fileName}
                </h3>
                <p className="font-bold text-sm text-black/70 flex items-center gap-1 mt-1">
                  <FileVideo2 className="w-4 h-4" />
                  {activeJob.resolution} @ {activeJob.fps} FPS
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between font-black text-sm uppercase">
                  <span>Progres Total</span>
                  <span className="text-blue-700">{exportProgress}%</span>
                </div>
                <div className="h-6 w-full bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000] inset-shadow">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 relative"
                    style={{ width: `${exportProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDBMMDAgMEw0MCAwTDQwIDQwWk0xMCAzMEwzMCAxMEgzMFYxMEgxMFYzMFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-50 bg-[length:20px_20px]"></div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-black/50">Waktu Render</p>
                  <p className="text-lg font-black">{formatElapsedReal(renderElapsedReal)}</p>
                </div>
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000]">
                  <p className="text-[10px] font-black uppercase text-black/50">Durasi Video</p>
                  <p className="text-lg font-black">{renderElapsedVideo} <span className="text-xs text-black/50">/ {renderTotalVideo}</span></p>
                </div>
                <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] col-span-2">
                  <p className="text-[10px] font-black uppercase text-black/50">Encoder Target</p>
                  <p className="text-sm font-black truncate text-purple-700">{renderEncoder}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onCancelExport?.()}
              className="w-full py-3 bg-[#EF4444] text-white font-black uppercase tracking-wider text-sm border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>BATALKAN RENDER INI</span>
            </button>
          </div>

          {/* Right Panel: Terminal Logs */}
          <div className="xl:w-[55%] bg-black p-4 flex flex-col min-h-[350px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#047857]/50 pb-3 mb-3 gap-3">
              <div className="flex items-center gap-2 text-[#10B981]">
                <Terminal className="w-5 h-5" />
                <span className="font-mono font-bold text-xs uppercase tracking-widest">Live Log Output</span>
              </div>
              
              <div className="flex gap-1.5 flex-wrap">
                {(['all', 'system', 'ffmpeg', 'warnings'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter && setLogFilter(f)}
                    className={`px-2 py-1 border border-emerald-600 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      logFilter === f ? 'bg-[#10B981] text-black' : 'bg-transparent text-[#10B981] hover:bg-emerald-950'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[300px] xl:max-h-[350px] font-mono text-[10px] text-[#10B981] flex flex-col-reverse">
              {/* Flex-col-reverse with slice().reverse() helps auto-scroll to bottom visually */}
              {exportLogHistory
                .filter(log => {
                  if (logFilter === 'all') return true;
                  if (logFilter === 'ffmpeg') return log.includes('FFMPEG:');
                  if (logFilter === 'system') return !log.includes('FFMPEG:');
                  if (logFilter === 'warnings') return log.toLowerCase().includes('warning') || log.toLowerCase().includes('error') || log.toLowerCase().includes('fail');
                  return true;
                })
                .slice(-100) // Show last 100 lines for performance
                .reverse()
                .map((log, i) => (
                  <div key={i} className="break-all whitespace-pre-wrap leading-tight text-left">
                    {log.includes('error') || log.includes('gagal') || log.includes('fail') || log.includes('Exception') ? (
                      <span className="text-red-400 font-bold">{log}</span>
                    ) : log.includes('warning') || log.includes('Peringatan') ? (
                      <span className="text-yellow-400 font-bold">{log}</span>
                    ) : (
                      <span className="opacity-90">{log}</span>
                    )}
                  </div>
                ))}
              {exportLogHistory.length === 0 && (
                <div className="text-[#10B981]/50 italic text-center py-10">Menunggu log sistem...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Queued Jobs Section */}
      {queuedJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="border-b-4 border-amber-400 pb-1">Antrean Mendatang ({queuedJobs.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queuedJobs.map((item, idx) => (
              <div key={item.id} className="bg-amber-50 border-[3px] border-black rounded-xl p-4 shadow-[3px_3px_0px_#000] flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Clock className="w-24 h-24 text-black" />
                </div>
                <div>
                  <div className="inline-flex items-center justify-center bg-black text-amber-400 font-black text-xs px-2 py-0.5 rounded-full mb-2">
                    #{idx + 1} di antrean
                  </div>
                  <h4 className="font-bold text-sm truncate" title={item.fileName}>{item.fileName}</h4>
                  <p className="text-xs font-bold text-black/60 mt-1">{item.resolution} @ {item.fps} FPS</p>
                </div>
                <button
                  onClick={() => onDeleteHistory(item.id)}
                  className="w-full py-1.5 bg-white hover:bg-red-50 text-red-600 border-2 border-black rounded font-bold text-xs uppercase shadow-[1.5px_1.5px_0px_#000] transition-all hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px]"
                >
                  Batalkan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Completed / Past Jobs Section */}
      <div className="space-y-4">
        <h3 className="font-black text-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="border-b-4 border-green-400 pb-1">Riwayat Selesai & Gagal</span>
        </h3>
        
        {pastJobs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-black/30 p-8 rounded-xl text-center">
            <p className="font-bold text-black/50 text-sm">Belum ada riwayat video yang selesai dirender.</p>
          </div>
        ) : (
          <div className="bg-white border-[3px] border-black rounded-xl neo-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF6ED] border-b-[3px] border-black font-black text-xs uppercase tracking-wider text-black">
                    <th className="p-4 border-r-2 border-black/20 w-[60px]">No</th>
                    <th className="p-4 border-r-2 border-black/20">Informasi File</th>
                    <th className="p-4 border-r-2 border-black/20 w-[180px]">Tanggal</th>
                    <th className="p-4 border-r-2 border-black/20 w-[120px]">Status</th>
                    <th className="p-4 w-[120px] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pastJobs.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className="border-b-2 border-black/10 last:border-b-0 hover:bg-[#FFFDF9] transition-colors"
                    >
                      <td className="p-4 border-r-2 border-black/5 font-bold text-sm text-black/50">
                        {idx + 1}
                      </td>
                      <td className="p-4 border-r-2 border-black/5">
                        <div className="font-bold text-sm text-black truncate max-w-[300px]" title={item.fileName}>
                          {item.fileName}
                        </div>
                        <div className="font-bold text-[10px] text-black/50 mt-0.5 uppercase">
                          {item.resolution} • {item.fps} FPS
                        </div>
                      </td>
                      <td className="p-4 border-r-2 border-black/5 font-medium text-xs text-black/70">
                        {item.date}
                      </td>
                      <td className="p-4 border-r-2 border-black/5">
                        {item.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai</span>
                          </span>
                        )}
                        {item.status === 'Failed' && (
                          <span className="inline-flex items-center gap-1 text-red-700 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-300">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Gagal</span>
                          </span>
                        )}
                        {item.status === 'Cancelled' && (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-bold text-xs bg-slate-50 px-2 py-1 rounded border border-slate-300">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Batal</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenFolder(item.fileName)}
                          disabled={item.status === 'Failed' || item.status === 'Cancelled'}
                          className={`p-2 border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] transition-all bg-amber-200 text-black disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Buka Folder Penyimpanan"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteHistory(item.id)}
                          className="p-2 border-2 border-black bg-white hover:bg-red-50 text-red-500 rounded-lg shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] transition-all"
                          title="Hapus Dari Riwayat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
