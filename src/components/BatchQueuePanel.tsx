import React, { useState, useEffect, useRef } from 'react';
import {
  Layers, X, Square, CheckCircle2, Minus, Maximize2,
  ChevronDown, ChevronUp, Cpu, Zap, ListVideo
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

interface BatchQueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelJob: (jobId: string) => void;
  maxParallelSlots: number;
  onChangeMaxSlots: (slots: number) => void;
}

const SLOT_STYLES = [
  {
    label: 'SLOT 1',
    badgeBg: 'bg-[#8B5CF6]',
    badgeText: 'text-white',
    barBg: 'bg-[#8B5CF6]',
    textColor: 'text-[#6D28D9]'
  },
  {
    label: 'SLOT 2',
    badgeBg: 'bg-[#06B6D4]',
    badgeText: 'text-white',
    barBg: 'bg-[#06B6D4]',
    textColor: 'text-[#0891B2]'
  },
  {
    label: 'SLOT 3',
    badgeBg: 'bg-[#F59E0B]',
    badgeText: 'text-black',
    barBg: 'bg-[#F59E0B]',
    textColor: 'text-[#D97706]'
  },
];

export const BatchQueuePanel: React.FC<BatchQueuePanelProps> = ({
  isOpen, onClose, onCancelJob, maxParallelSlots, onChangeMaxSlots
}) => {
  const [slots, setSlots] = useState<ParallelSlot[]>([
    { slotId: 0, jobId: null, status: 'idle' },
    { slotId: 1, jobId: null, status: 'idle' },
    { slotId: 2, jobId: null, status: 'idle' },
  ]);
  const [queuedJobs, setQueuedJobs] = useState<QueuedJob[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);
  const [showQueue, setShowQueue] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const poll = async () => {
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
        }
      } catch {
        /* Backend offline */
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 600);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Floating Minimized Widget Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#FAF6ED] border-3 border-black p-3 rounded-2xl shadow-[6px_6px_0px_#000] transition-all">
        <div
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90"
          onClick={() => setIsMinimized(false)}
        >
          <div className="w-8 h-8 rounded-xl bg-[#8B5CF6] text-white border-2 border-black flex items-center justify-center font-black shadow-[1.5px_1.5px_0px_#000]">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-black uppercase tracking-wider">RENDER QUEUE</span>
              <span className={"border border-black font-black text-[9px] uppercase px-1.5 py-0.2 rounded-md " + (activeCount > 0 ? 'bg-[#10B981] text-white animate-pulse' : 'bg-gray-200 text-gray-700')}>
                {activeCount > 0 ? (activeCount + ' AKTIF') : 'IDLE'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              {slots.map((slot) => {
                if (slot.slotId >= maxParallelSlots) return null;
                const style = SLOT_STYLES[slot.slotId];
                const isActive = slot.status === 'rendering' && slot.jobId !== null;
                return (
                  <div key={slot.slotId} className="flex items-center gap-1 text-[10px]">
                    <span className={"font-black " + style.textColor}>{style.label}:</span>
                    <span className="text-black font-black">{isActive ? ((slot.progress ?? 0) + '%') : 'Kosong'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-l-2 border-black pl-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1.5 bg-white hover:bg-[#8B5CF6] hover:text-white border-2 border-black rounded-lg text-black font-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-all"
            title="Perbesar (Maximize)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 bg-white hover:bg-[#EF4444] hover:text-white border-2 border-black rounded-lg text-black font-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-all"
            title="Tutup Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full Neo-Brutalist Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Neo-Brutalist Modal Container */}
      <div className="relative z-10 w-full max-w-[540px] max-h-[85vh] flex flex-col bg-[#FAF6ED] border-3 border-black rounded-2xl shadow-[8px_8px_0px_#000] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#8B5CF6] border-b-3 border-black text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Layers className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-black text-base uppercase tracking-wider text-white">
                RENDER QUEUE PARALEL
              </h2>
              <p className="text-white/90 text-xs font-bold uppercase tracking-wider">
                {activeCount} Rendering · {queuedCount} Menunggu
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="w-8 h-8 rounded-xl bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000] hover:bg-[#F59E0B] hover:text-black transition-all cursor-pointer"
              title="Kecilkan (Minimize)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-xl bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000] hover:bg-[#EF4444] hover:text-white transition-all cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Controls: Parallel Slots Slider */}
          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-black font-black text-xs uppercase tracking-wider">
                  Kapasitas Slot Paralel
                </span>
              </div>
              <span className="bg-[#8B5CF6] text-white border-2 border-black font-black text-xs px-2.5 py-0.5 rounded-lg shadow-[2px_2px_0px_#000]">
                {maxParallelSlots} Slot Aktif
              </span>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-black text-xs text-black">1</span>
              <input
                type="range"
                min={1}
                max={3}
                step={1}
                value={maxParallelSlots}
                onChange={(e) => onChangeMaxSlots(parseInt(e.target.value))}
                className="flex-1 accent-[#8B5CF6] h-2 bg-gray-200 border-2 border-black rounded-lg cursor-pointer"
              />
              <span className="font-black text-xs text-black">3</span>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { num: 1, label: '1 (Aman)' },
                { num: 2, label: '2 (Balans)' },
                { num: 3, label: '3 (Maksimal)' }
              ].map(opt => (
                <button
                  key={opt.num}
                  type="button"
                  onClick={() => onChangeMaxSlots(opt.num)}
                  className={"py-1.5 px-2 border-2 border-black font-black text-xs rounded-xl shadow-[2px_2px_0px_#000] transition-all cursor-pointer " + (maxParallelSlots === opt.num ? 'bg-[#8B5CF6] text-white translate-y-[1px] shadow-[1px_1px_0px_#000]' : 'bg-white text-black hover:bg-[#FAF6ED]')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Slots Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-black" />
              <span className="font-black text-xs text-black uppercase tracking-wider">
                Status Slot Render
              </span>
            </div>

            {slots.map((slot) => {
              const style = SLOT_STYLES[slot.slotId] || SLOT_STYLES[0];
              const isActive = slot.status === 'rendering' && slot.jobId !== null;
              const isEnabled = slot.slotId < maxParallelSlots;

              if (!isEnabled) {
                return (
                  <div
                    key={slot.slotId}
                    className="bg-gray-200/50 border-2 border-gray-300 border-dashed rounded-xl p-3 flex items-center justify-between opacity-50"
                  >
                    <span className="font-black text-xs text-gray-500 uppercase">
                      {style.label} (Nonaktif)
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      Naikkan kapasitas ke {slot.slotId + 1} slot untuk mengaktifkan
                    </span>
                  </div>
                );
              }

              if (!isActive) {
                return (
                  <div
                    key={slot.slotId}
                    className="bg-white border-2 border-black border-dashed rounded-xl p-3.5 flex items-center justify-between shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={style.badgeBg + ' ' + style.badgeText + ' border-2 border-black font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#000]'}>
                        {style.label}
                      </span>
                      <span className="font-bold text-xs text-gray-600">
                        Slot Kosong
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400 italic">
                      Menunggu job...
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={slot.slotId}
                  className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={style.badgeBg + ' ' + style.badgeText + ' border-2 border-black font-black text-xs uppercase px-2.5 py-0.5 rounded-lg shadow-[1.5px_1.5px_0px_#000]'}>
                        {style.label}
                      </span>
                      <span className="bg-[#10B981] text-white border-2 border-black font-black text-[10px] uppercase px-2 py-0.5 rounded-lg animate-pulse">
                        ● RENDERING
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-black">
                        {slot.progress ?? 0}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slot.jobId) onCancelJob(slot.jobId);
                        }}
                        className="p-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white border-2 border-black rounded-lg font-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] transition-all cursor-pointer"
                        title="Batalkan Render Job Ini"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-xs text-black truncate">
                      {slot.title || 'Visualizer Video'}
                    </h4>
                    {slot.outputPath && (
                      <p className="text-[10px] font-mono text-gray-500 truncate">
                        → {slot.outputPath}
                      </p>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 border-2 border-black rounded-full h-3.5 overflow-hidden p-0.5 shadow-[1.5px_1.5px_0px_#000]">
                    <div
                      className={style.barBg + ' h-full border-r-2 border-black rounded-full transition-all duration-300'}
                      style={{ width: (slot.progress ?? 0) + '%' }}
                    />
                  </div>

                  {slot.statusText && (
                    <p className="text-[10px] font-bold text-gray-600 truncate">
                      {slot.statusText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {queuedJobs.length > 0 && (
            <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000]">
              <button
                type="button"
                className="flex items-center justify-between w-full font-black text-xs text-black uppercase cursor-pointer"
                onClick={() => setShowQueue(p => !p)}
              >
                <div className="flex items-center gap-2">
                  <ListVideo className="w-4 h-4 text-black" />
                  <span>Antrean Menunggu</span>
                  <span className="bg-[#8B5CF6] text-white border border-black font-black text-[10px] px-2 py-0.5 rounded-md">
                    {queuedJobs.length}
                  </span>
                </div>
                {showQueue ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showQueue && (
                <div className="mt-3 space-y-2">
                  {queuedJobs.map((job, idx) => (
                    <div
                      key={job.id}
                      className="bg-[#FAF6ED] border-2 border-black rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-[1.5px_1.5px_0px_#000]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-5 h-5 bg-black text-white font-black text-[10px] rounded-md flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-xs text-black truncate">{job.title}</p>
                          <p className="text-[9px] font-mono text-gray-500 truncate">{job.outputPath}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelJob(job.id);
                        }}
                        className="p-1 bg-[#EF4444] hover:bg-[#DC2626] text-white border border-black rounded-md font-black shadow-[1px_1px_0px_#000] cursor-pointer"
                        title="Hapus dari antrean"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeCount === 0 && queuedJobs.length === 0 && (
            <div className="bg-white border-2 border-black rounded-xl p-6 text-center shadow-[3px_3px_0px_#000] flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-[#FAF6ED] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="font-black text-sm text-black uppercase">
                Tidak Ada Job Aktif
              </h3>
              <p className="text-gray-600 font-bold text-xs max-w-xs">
                Klik tombol <span className="bg-[#8B5CF6] text-white px-1.5 py-0.5 rounded border border-black font-black">EXPORT VIDEO</span> pada tab Studio untuk menambahkan antrean render.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-[#F3EEDC] border-t-2 border-black px-5 py-3 flex items-center justify-between font-bold text-xs text-black">
          <div className="flex items-center gap-2">
            <span className={'w-2.5 h-2.5 rounded-full border border-black ' + (activeCount > 0 ? 'bg-[#10B981] animate-pulse' : 'bg-gray-400')} />
            <span>
              {activeCount > 0
                ? (activeCount + ' render berjalan · ' + queuedJobs.length + ' menunggu')
                : 'Backend Server siap menerima job (:1426)'
              }
            </span>
          </div>
          <span className="font-mono text-[10px] text-gray-500">
            AUDIRA PARALLEL QUEUE v1.0
          </span>
        </div>

      </div>
    </div>
  );
};
