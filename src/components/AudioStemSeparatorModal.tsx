import { useState } from 'react';
import { Sliders, X, Music, Mic, Sparkles, Loader2, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react';

interface AudioStemSeparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioFile: File | null;
  audioUrl: string | null;
  onSelectInstrumental: (file: File) => void;
  onSelectVocals: (file: File) => void;
}

export function AudioStemSeparatorModal({
  isOpen,
  onClose,
  audioFile,
  audioUrl,
  onSelectInstrumental,
  onSelectVocals
}: AudioStemSeparatorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [instFile, setInstFile] = useState<File | null>(null);
  const [vocalsFile, setVocalsFile] = useState<File | null>(null);
  const [instAudioUrl, setInstAudioUrl] = useState<string | null>(null);
  const [vocalsAudioUrl, setVocalsAudioUrl] = useState<string | null>(null);

  const [playingTrack, setPlayingTrack] = useState<'none' | 'inst' | 'vocals'>('none');
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleStartSeparation = async () => {
    if (!audioFile && !audioUrl) {
      setErrorMsg('Harap pilih berkas musik MP3 terlebih dahulu pada Step 1 Studio.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setProgressMsg('Mengekstrak sinyal vokal dan instrumen via FFmpeg DSP Engine...');

    try {
      const formData = new FormData();
      if (audioFile) {
        formData.append('audioFile', audioFile);
      } else if (audioUrl) {
        formData.append('audioUrl', audioUrl);
      }

      const res = await fetch('http://localhost:1426/separate_stems', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memisahkan stem audio.');
      }

      // Fetch instrumental blob
      const instRes = await fetch(data.instrumentalUrl);
      const instBlob = await instRes.blob();
      const createdInstFile = new File([instBlob], `instrumental_${audioFile ? audioFile.name : 'audio.mp3'}`, { type: 'audio/mp3' });
      setInstFile(createdInstFile);
      setInstAudioUrl(data.instrumentalUrl);

      // Fetch vocals blob
      const vocRes = await fetch(data.vocalsUrl);
      const vocBlob = await vocRes.blob();
      const createdVocFile = new File([vocBlob], `vocals_${audioFile ? audioFile.name : 'audio.mp3'}`, { type: 'audio/mp3' });
      setVocalsFile(createdVocFile);
      setVocalsAudioUrl(data.vocalsUrl);

      setSuccessMsg('Separasi Stem Audio berhasil! Anda dapat memutar dan memasangnya ke Studio.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pemisahan stem audio.');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
    }
  };

  const handleTogglePlay = (track: 'inst' | 'vocals') => {
    const targetUrl = track === 'inst' ? instAudioUrl : vocalsAudioUrl;
    if (!targetUrl) return;

    if (audioObj) {
      audioObj.pause();
    }

    if (playingTrack === track) {
      setPlayingTrack('none');
      setAudioObj(null);
    } else {
      const newAudio = new Audio(targetUrl);
      newAudio.play();
      setAudioObj(newAudio);
      setPlayingTrack(track);
      newAudio.onended = () => setPlayingTrack('none');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF6ED] border-[3px] border-black rounded-2xl w-full max-w-lg overflow-hidden shadow-[8px_8px_0px_#000] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#06B6D4] border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-white" />
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              AI Stem Separator (Vokal & Instrumen)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (audioObj) audioObj.pause();
              onClose();
            }}
            className="p-1 bg-white hover:bg-red-100 text-black rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs font-bold text-black/70 leading-relaxed">
            Pisahkan lagu utama Anda menjadi 2 trek terisolasi: <strong>Musik Instrumen (Bebas Vokal)</strong> dan <strong>Trek Vokal Saja</strong> menggunakan algoritma pengolahan sinyal digital FFmpeg DSP.
          </p>

          {/* Source Audio Card */}
          <div className="p-3 bg-white border-2 border-black rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2 min-w-0">
              <Music className="w-4 h-4 text-black shrink-0" />
              <span className="text-xs font-black text-black truncate">
                {audioFile ? audioFile.name : 'Audio Terpasang di Studio'}
              </span>
            </div>
            <span className="bg-[#FFDE4D] text-black text-[9px] font-black px-2 py-0.5 rounded border border-black uppercase shrink-0">
              Sumber Utama
            </span>
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

          {/* Separation Results Cards */}
          {instFile && vocalsFile ? (
            <div className="space-y-3 pt-1">
              
              {/* Instrumental Stem */}
              <div className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePlay('inst')}
                    className="p-2 bg-[#8B5CF6] text-white border border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer shrink-0"
                  >
                    {playingTrack === 'inst' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <div className="min-w-0">
                    <h5 className="font-black text-xs text-black flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>Musik Instrumen (Bebas Vokal)</span>
                    </h5>
                    <p className="text-[9px] font-semibold text-black/50 truncate">{instFile.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (audioObj) audioObj.pause();
                    onSelectInstrumental(instFile);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0"
                >
                  Pasang
                </button>
              </div>

              {/* Vocals Stem */}
              <div className="p-3.5 bg-white border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleTogglePlay('vocals')}
                    className="p-2 bg-[#06B6D4] text-white border border-black rounded-lg shadow-[1px_1px_0px_#000] cursor-pointer shrink-0"
                  >
                    {playingTrack === 'vocals' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <div className="min-w-0">
                    <h5 className="font-black text-xs text-black flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>Trek Vokal Saja</span>
                    </h5>
                    <p className="text-[9px] font-semibold text-black/50 truncate">{vocalsFile.name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (audioObj) audioObj.pause();
                    onSelectVocals(vocalsFile);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-[#06B6D4] hover:bg-[#0891B2] text-white border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0"
                >
                  Pasang
                </button>
              </div>

            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartSeparation}
              disabled={isLoading}
              className="w-full py-3.5 bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-50 text-white border-[2.5px] border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MEMISAHKAN STEM VIA FFMPEG DSP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>MULAI SEPARASI VOKAL & INSTRUMEN</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF6ED] border-t-2 border-black px-6 py-2.5 text-[9px] font-black uppercase text-black/50 flex justify-between items-center">
          <span>Engine: FFmpeg Center-Channel Cancellation DSP</span>
          <span>Offline Processing</span>
        </div>

      </div>
    </div>
  );
}
