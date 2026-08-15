import React, { useState } from 'react';
import { Layers, Upload, Check, X } from 'lucide-react';

interface BatchMultiSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueueBatchSongs: (audioFiles: File[]) => void;
}

export const BatchMultiSongModal: React.FC<BatchMultiSongModalProps> = ({
  isOpen,
  onClose,
  onQueueBatchSongs
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitBatch = () => {
    if (selectedFiles.length === 0) return;
    onQueueBatchSongs(selectedFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="bg-[#FEF8EC] border-[4px] border-black rounded-2xl w-full max-w-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-emerald-500 text-white border-b-[3px] border-black flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000]">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">Batch Multi-Song Render Automation</h2>
              <p className="text-[10px] font-bold text-emerald-100">Unggah banyak lagu sekaligus untuk langsung diproses ke antrean render otomatis.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-red-100 text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Upload Dropzone Area */}
          <div className="p-6 bg-white border-3 border-dashed border-black rounded-xl text-center space-y-3 shadow-[3px_3px_0px_#000]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-black mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-black">Pilih Banyak Lagu MP3 / WAV Sekaligus</h3>
              <p className="text-xs font-bold text-black/60">Tarik berkas atau klik tombol di bawah untuk memilih file musik (Multiple Files).</p>
            </div>

            <label className="inline-block px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer">
              <span>Pilih File Lagu (Multi-Select)</span>
              <input 
                type="file" 
                multiple 
                accept="audio/*" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Selected Songs List Table */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-xs uppercase text-black">
                  Daftar Lagu Terpilih ({selectedFiles.length} File):
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Bersihkan Semua
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border-2 border-black rounded-xl bg-white divide-y-2 divide-black/10 shadow-[3px_3px_0px_#000]">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-amber-50">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-7 h-7 bg-amber-200 border border-black rounded flex items-center justify-center font-black text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-black text-xs text-black truncate">{file.name}</p>
                        <p className="text-[10px] font-bold text-black/50">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded border border-black font-bold text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t-[3px] border-black flex justify-between items-center">
          <span className="text-xs font-bold text-black/60">
            {selectedFiles.length > 0 ? `Siap mengirim ${selectedFiles.length} lagu ke antrean render!` : 'Belum ada file yang dipilih'}
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              Batal
            </button>

            <button
              disabled={selectedFiles.length === 0}
              onClick={handleSubmitBatch}
              className={`px-6 py-2 border-2 border-black rounded-lg font-black text-xs uppercase shadow-[3px_3px_0px_#000] transition-all flex items-center gap-2 ${
                selectedFiles.length > 0 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer active:translate-y-[1px]' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Kirim {selectedFiles.length} Lagu ke Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
