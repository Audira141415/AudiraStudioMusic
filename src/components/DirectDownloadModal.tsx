import { useState } from 'react';
import { Download, X, Music, Video, Sparkles, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface DirectDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDownloadedFile: (file: File, type: 'audio' | 'background') => void;
}

export function DirectDownloadModal({
  isOpen,
  onClose,
  onSelectDownloadedFile
}: DirectDownloadModalProps) {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp3');
  const [targetType, setTargetType] = useState<'audio' | 'background'>('audio');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    if (!url.trim()) {
      setErrorMsg('Harap masukkan link URL media (YouTube, TikTok, MP3, MP4, dll).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setProgressMsg('Mengunduh media via yt-dlp & engine backend...');

    try {
      const res = await fetch('http://localhost:1426/download_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          format: format
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunduh media dari URL tersebut.');
      }

      setProgressMsg('Mengonversi berkas ke studio...');
      
      // Fetch the downloaded file blob from http://localhost:1426/downloads/<filename>
      const fileRes = await fetch(data.downloadUrl);
      if (!fileRes.ok) {
        throw new Error('Gagal mengambil berkas hasil unduhan dari backend.');
      }

      const blob = await fileRes.blob();
      const mimeType = format === 'mp3' ? 'audio/mp3' : 'video/mp4';
      const fileName = data.filename || (format === 'mp3' ? 'downloaded_audio.mp3' : 'downloaded_bg.mp4');
      const createdFile = new File([blob], fileName, { type: mimeType });

      // Automatically assign to Studio state
      onSelectDownloadedFile(createdFile, targetType);
      
      setSuccessMsg(`Berhasil mengunduh "${fileName}" dan terpasang ke Studio!`);
      setUrl('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunduh berkas.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF6ED] border-[3px] border-black rounded-2xl w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_#000] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#8B5CF6] border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-white" />
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              Direct Download Media (Audira Clip Engine)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 bg-white hover:bg-red-100 text-black rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold text-black/70 leading-relaxed">
            Masukkan link URL dari YouTube, TikTok, Instagram, Google Drive, atau Tautan Media Langsung (MP3/MP4) untuk diunduh otomatis oleh engine backend.
          </p>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-black block">
              Tautan / Link URL Media:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... atau https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white border-2 border-black rounded-xl p-3 pl-10 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none disabled:opacity-60"
              />
              <LinkIcon className="w-4 h-4 text-black/50 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Format Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Format Hasil Download:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setFormat('mp3'); setTargetType('audio'); }}
                  disabled={isLoading}
                  className={`p-2.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    format === 'mp3'
                      ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-black hover:bg-amber-50 shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>MP3</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setFormat('mp4'); setTargetType('background'); }}
                  disabled={isLoading}
                  className={`p-2.5 rounded-xl border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    format === 'mp4'
                      ? 'bg-[#06B6D4] text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-black hover:bg-amber-50 shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>MP4</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Tujuan Pemasangan:
              </label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                disabled={isLoading}
                className="w-full bg-white border-2 border-black rounded-xl p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
              >
                <option value="audio">🎧 Audio Utama Studio</option>
                <option value="background">🖼️ Background Studio</option>
              </select>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-100 border-2 border-black rounded-xl text-red-700 font-bold text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-100 border-2 border-black rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isLoading && (
            <div className="p-3 bg-amber-100 border-2 border-black rounded-xl text-amber-900 font-bold text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000] animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{progressMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleStartDownload}
            disabled={isLoading || !url.trim()}
            className="w-full py-3.5 bg-[#FFDE4D] hover:bg-[#FACC15] disabled:opacity-50 text-black border-[2.5px] border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>MENGUNDUH DENGAN ENGINE YT-DLP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>DOWNLOAD LANGSUNG SEKARANG</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF6ED] border-t-2 border-black px-6 py-2.5 text-[9px] font-black uppercase text-black/50 flex justify-between items-center">
          <span>Engine: yt-dlp & Audira Clip Integration</span>
          <span>Offline Server :1426</span>
        </div>

      </div>
    </div>
  );
}
