import { useState, useEffect, useRef } from 'react';
import { 
  Layers, Square, CheckCircle2, Cpu, Zap, ListVideo, RefreshCw, 
  Sparkles
} from 'lucide-react';

export interface ParallelSlot {
  slotId: number;
  jobId: string | null;
  title?: string;
  progress?: number;
  status: 'rendering' | 'idle';
  statusText?: string;
  outputPath?: string;
}

export interface QueuedJob {
  id: string;
  title: string;
  outputPath: string;
  timestamp: string;
}

interface QueueViewProps {
  onCancelJob: (jobId: string) => void;
  maxParallelSlots: number;
  onChangeMaxSlots: (slots: number) => void;
  onNavigateToStudio: () => void;
}

const SLOT_STYLES = [
  {
    label: 'SLOT 1',
    badgeBg: 'bg-[#8B5CF6]',
    badgeText: 'text-white',
    barBg: 'bg-[#8B5CF6]',
    textColor: 'text-[#6D28D9]',
    borderAccent: 'border-[#8B5CF6]'
  },
  {
    label: 'SLOT 2',
    badgeBg: 'bg-[#06B6D4]',
    badgeText: 'text-white',
    barBg: 'bg-[#06B6D4]',
    textColor: 'text-[#0891B2]',
    borderAccent: 'border-[#06B6D4]'
  },
  {
    label: 'SLOT 3',
    badgeBg: 'bg-[#F59E0B]',
    badgeText: 'text-black',
    barBg: 'bg-[#F59E0B]',
    textColor: 'text-[#D97706]',
    borderAccent: 'border-[#F59E0B]'
  },
];

export function QueueView({
  onCancelJob,
  maxParallelSlots,
  onChangeMaxSlots,
  onNavigateToStudio
}: QueueViewProps) {
  const [slots, setSlots] = useState<ParallelSlot[]>([
    { slotId: 0, jobId: null, status: 'idle' },
    { slotId: 1, jobId: null, status: 'idle' },
    { slotId: 2, jobId: null, status: 'idle' },
  ]);
  const [queuedJobs, setQueuedJobs] = useState<QueuedJob[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);
  const [serverStatus, setServerStatus] = useState<'connected' | 'failed'>('connected');
  const intervalRef = useRef<any>(null);

  const pollQueueStatus = async () => {
    try {
      const res = await fetch('http://localhost:1426/queue_status');
      if (res.ok) {
        const data = await res.json();
        setSlots(data.parallelSlots || [
          { slotId: 0, jobId: null, status: 'idle' },
          { slotId: 1, jobId: null, status: 'idle' },
          { slotId: 2, jobId: null, status: 'idle' },
        ]);
        setQueuedJobs(data.queuedJobs || []);
        setActiveCount(data.activeCount || 0);
        setQueuedCount(data.queuedCount || 0);
        setServerStatus('connected');
      } else {
        setServerStatus('failed');
      }
    } catch {
      setServerStatus('failed');
    }
  };

  useEffect(() => {
    pollQueueStatus();
    intervalRef.current = setInterval(pollQueueStatus, 600);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSlotChange = (newCount: number) => {
    onChangeMaxSlots(newCount);
    fetch('http://localhost:1426/set_parallel_slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slots: newCount })
    }).catch(() => {});
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#FAF6ED] space-y-6">
      {/* Header View */}
      <div className="border-b-[3px] border-black pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-black flex items-center gap-2 uppercase tracking-wider">
            <Layers className="w-6 h-6 text-black" />
            <span>Render Queue Paralel</span>
          </h2>
          <p className="text-xs font-bold text-black/60">
            Kelola antrean render multi-worker 3-slot paralel, kapasitas CPU/GPU, serta pantau status ekspor secara real-time.
          </p>
        </div>

        {/* Server Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] ${
            serverStatus === 'connected' 
              ? 'bg-[#10B981] text-white' 
              : 'bg-red-500 text-white animate-pulse'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{serverStatus === 'connected' ? '● BACKEND SERVER SIAP (:1426)' : '● BACKEND DISCONNECTED'}</span>
          </span>
          <button
            type="button"
            onClick={pollQueueStatus}
            className="p-2 bg-white hover:bg-amber-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
            title="Refresh Data Antrean"
          >
            <RefreshCw className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on desktop): Slot Capacity & Active Slots Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Slot Capacity Selector */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  Kapasitas Slot Render Paralel
                </span>
              </div>
              <span className="bg-[#8B5CF6] text-white text-xs font-black px-3 py-1 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] uppercase">
                {maxParallelSlots} Slot Aktif Secara Bersamaan
              </span>
            </div>

            <p className="text-xs font-semibold text-black/60 leading-relaxed">
              Tentukan berapa banyak video yang diizinkan untuk di-render secara bersamaan oleh worker thread independen:
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 1, label: '1 (Aman)', desc: 'Penggunaan CPU/GPU Ringan' },
                { count: 2, label: '2 (Balans)', desc: 'Kecepatan & Performa Seimbang' },
                { count: 3, label: '3 (Maksimal)', desc: 'Kecepatan Render Maksimum' }
              ].map(opt => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => handleSlotChange(opt.count)}
                  className={`p-3 border-2 border-black rounded-xl font-black text-xs uppercase transition-all cursor-pointer text-center space-y-0.5 ${
                    maxParallelSlots === opt.count
                      ? 'bg-[#8B5CF6] text-white shadow-[3px_3px_0px_#000] translate-y-[-1px]'
                      : 'bg-[#FAF6ED] text-black hover:bg-amber-100 shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="text-sm font-black">{opt.label}</div>
                  <div className={`text-[9px] font-semibold tracking-normal ${maxParallelSlots === opt.count ? 'text-white/90' : 'text-black/60'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: 3-Slot Real-Time Status Grid */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#8B5CF6]" />
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  Status Slot Worker Thread Real-time
                </span>
              </div>
              <span className="text-xs font-black uppercase text-black/60">
                {activeCount} / {maxParallelSlots} Sedang Berjalan
              </span>
            </div>

            <div className="space-y-4">
              {slots.slice(0, maxParallelSlots).map((slot) => {
                const style = SLOT_STYLES[slot.slotId] || SLOT_STYLES[0];
                const isRendering = slot.status === 'rendering';
                const progressPct = slot.progress || 0;

                return (
                  <div
                    key={slot.slotId}
                    className={`p-4 border-2 border-black rounded-xl transition-all space-y-3 ${
                      isRendering 
                        ? 'bg-[#FEF8EC] shadow-[4px_4px_0px_#000]' 
                        : 'bg-[#FAF6ED]/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border border-black shadow-[1px_1px_0px_#000] ${style.badgeBg} ${style.badgeText}`}>
                          {style.label}
                        </span>
                        <span className="font-black text-xs uppercase tracking-wider text-black truncate">
                          {isRendering ? (slot.title || 'Merekam Video MP4...') : 'Slot Kosong (Idle)'}
                        </span>
                      </div>

                      {isRendering && slot.jobId && (
                        <button
                          type="button"
                          onClick={() => onCancelJob(slot.jobId!)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1 shrink-0"
                          title="Hentikan Job Di Slot Ini"
                        >
                          <Square className="w-3 h-3 fill-white" />
                          <span>HENTIKAN</span>
                        </button>
                      )}
                    </div>

                    {isRendering ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className={style.textColor}>
                            {slot.statusText || `● MENGEXPORT (${progressPct}%)`}
                          </span>
                          <span className="font-black text-black">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-white border-2 border-black rounded-full h-3.5 p-0.5 overflow-hidden shadow-[1px_1px_0px_#000]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${style.barBg}`}
                            style={{ width: `${Math.min(100, Math.max(2, progressPct))}%` }}
                          />
                        </div>
                        {slot.outputPath && (
                          <p className="text-[9px] font-bold text-black/50 truncate pt-0.5">
                            Target: {slot.outputPath}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-black/40 italic pt-1">
                        Menunggu pekerjaan baru dikirim dari Studio...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty State Banner if no active renders */}
            {activeCount === 0 && (
              <div className="p-6 border-2 border-dashed border-black/30 rounded-xl bg-white text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 border-2 border-black rounded-2xl mx-auto flex items-center justify-center shadow-[3px_3px_0px_#000]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-black">Tidak Ada Render Aktif</h4>
                  <p className="text-xs font-semibold text-black/60 mt-1 max-w-md mx-auto">
                    Klik tombol <strong>MULAI RENDER MP4</strong> pada tab Studio untuk menambahkan antrean ekspor baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToStudio}
                  className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buka Studio Visualizer</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col wide): Waiting Queue List & Info Panel */}
        <div className="space-y-6">
          
          {/* Waiting Queue List Card */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-[#06B6D4]" />
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  Antrean Menunggu ({queuedCount})
                </span>
              </div>
            </div>

            {queuedJobs.length > 0 ? (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {queuedJobs.map((qJob, idx) => (
                  <div
                    key={qJob.id}
                    className="p-3 bg-[#FAF6ED] border-2 border-black rounded-xl space-y-1 shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-600">
                      <span># Antrean {idx + 1}</span>
                      <span className="text-black/50">{qJob.timestamp}</span>
                    </div>
                    <h5 className="font-black text-xs text-black truncate">{qJob.title}</h5>
                    <p className="text-[9px] font-semibold text-black/50 truncate">{qJob.outputPath}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border-2 border-black/10 rounded-xl bg-[#FAF6ED]/50 text-center space-y-1">
                <p className="text-xs font-bold text-black/60">Tidak Ada Antrean Menunggu</p>
                <p className="text-[10px] font-semibold text-black/40">
                  Semua job yang dikirim langsung mendapatkan slot render.
                </p>
              </div>
            )}
          </div>

          {/* Parallel Architecture Info Box */}
          <div className="bg-[#FEF8EC] border-[3px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-3">
            <h4 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Sistem Multi-Worker Architecture</span>
            </h4>
            <p className="text-[11px] font-semibold text-black/70 leading-relaxed">
              Engine offline Audira Studio mengeksekusi subprocess FFmpeg yang terisolasi untuk setiap slot. Anda bebas berpindah halaman studio atau membuat desain baru saat proses ekspor berjalan di latar belakang.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
