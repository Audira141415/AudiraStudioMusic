import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Tag, 
  Cpu, 
  Download, 
  Copy, 
  Check, 
  HelpCircle,
  Share2,
  RefreshCw
} from 'lucide-react';

interface OutputMetadataDrawerProps {
  settings: {
    textTitle: string;
    textArtist: string;
  };
  exportConfig: {
    resolution: string;
    fps: number;
    encoder: 'cpu' | 'gpu';
    codec: 'h264' | 'h265' | 'av1';
    format: 'mp4' | 'mkv' | 'mov';
    language: 'id' | 'en';
    segmentRender: boolean;
    videoBitrate: string;
    audioBitrate: string;
    encodingSpeed: string;
    outputPath: string;
    exportMode: 'render' | 'stream';
    streamKey: string;
    videoCRF: number;
    audioNormalize: boolean;
  };
  onChangeExportConfig: (key: string, value: any) => void;
  onExport: () => void;
  isExporting: boolean;
}

export const OutputMetadataDrawer: React.FC<OutputMetadataDrawerProps> = ({
  settings,
  exportConfig,
  onChangeExportConfig,
  onExport,
  isExporting
}) => {
  const {
    resolution,
    fps,
    encoder,
    codec,
    format,
    language,
    videoCRF,
    audioNormalize,
    outputPath
  } = exportConfig;
  
  // Advanced settings panel state
  const [showRenderSettings, setShowRenderSettings] = useState(false);
  
  // Copy states
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedTimestamps, setCopiedTimestamps] = useState(false);
  const [copiedDescription, setCopiedDescription] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  // Thumbnail states
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // System specs states
  const [specs, setSpecs] = useState<any>(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  const fetchSpecs = async () => {
    setLoadingSpecs(true);
    let attempts = 0;
    let success = false;
    
    while (attempts < 6 && !success) {
      try {
        attempts++;
        const res = await fetch('http://localhost:1426/system_specs');
        if (res.ok) {
          const data = await res.json();
          if (data && (data.cpu || data.gpus)) {
            setSpecs(data);
            success = true;
            break;
          }
        }
      } catch (e) {
        console.warn(`Attempt ${attempts} failed to fetch system specs:`, e);
      }
      if (!success && attempts < 6) {
        await new Promise(r => setTimeout(r, 800));
      }
    }
    setLoadingSpecs(false);
  };

  const handleChooseOutputPath = async () => {
    try {
      const res = await fetch('http://localhost:1426/select_output_file');
      if (res.ok) {
        const data = await res.json();
        if (data.selectedPath) {
          onChangeExportConfig('outputPath', data.selectedPath);
        }
      }
    } catch (err) {
      console.warn("Failed to open file save dialog:", err);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const applySpecsRecommendation = () => {
    if (specs?.recommendation) {
      const rec = specs.recommendation;
      onChangeExportConfig('encoder', rec.encoder);
      onChangeExportConfig('codec', rec.codec);
      onChangeExportConfig('resolution', rec.resolution);
      onChangeExportConfig('videoBitrate', rec.videoBitrate);
      onChangeExportConfig('fps', rec.fps);
      alert(isEn ? "Optimal settings applied successfully!" : "Setelan optimal berhasil diterapkan!");
      setShowSpecsModal(false);
    }
  };

  useEffect(() => {
    // Poll thumbnail frame from canvas every 1 second
    const timer = setInterval(() => {
      if ((window as any).captureVisualizerThumbnail) {
        const frame = (window as any).captureVisualizerThumbnail();
        if (frame) {
          setThumbnailUrl(frame);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic strings based on editor inputs & selected language
  const isEn = language === 'en';

  const titleCopyStr = isEn 
    ? `${settings.textTitle || 'Song Title'} - ${settings.textArtist || 'Artist Name'} | Lofi Chill Mix 🎧`
    : `${settings.textTitle || 'Judul Lagu'} - ${settings.textArtist || 'Nama Artis'} | Musik Lofi Mix 🎧`;

  const timestampsStr = `00:00 - ${settings.textTitle || (isEn ? 'Song Title' : 'Judul Lagu')} (Lofi Mix)\n03:15 - Resonance Wave\n06:40 - Retro Pulse\n10:12 - Chill Horizon`;

  const descStr = isEn
    ? `Listen to the best lofi music compilation from ${settings.textArtist || 'Artist Name'}.\n\nDon't forget to LIKE, COMMENT, and SUBSCRIBE to support this channel! 🔔\n\nTracklist:\n${timestampsStr}`
    : `Dengarkan kompilasi musik terbaik dari ${settings.textArtist || 'Nama Artis'}.\n\nJangan lupa untuk LIKE, COMMENT, dan SUBSCRIBE untuk mendukung channel ini! 🔔\n\nTracklist:\n${timestampsStr}`;

  const tagsStr = isEn
    ? `${(settings.textTitle || 'title').toLowerCase().replace(/\s+/g, '')}, lofi, edm, viral, fyp, trending, beat, chill, music, ${settings.textArtist.toLowerCase().replace(/\s+/g, '')}`
    : `${(settings.textTitle || 'judul').toLowerCase().replace(/\s+/g, '')}, lofi, edm, viral, fyp, trending, beat, santai, musik, ${settings.textArtist.toLowerCase().replace(/\s+/g, '')}`;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 select-none">
      
      {/* 1. Left Card: Output & Live Stream */}
      <div className="bg-[#FFFDF9] border-[3px] border-black p-5 rounded-xl shadow-[4px_4px_0px_#000] space-y-5 text-black">
        {/* Header Title */}
        <div className="flex items-center gap-2.5 pb-2 border-b-2 border-black">
          <Settings className="w-5 h-5 text-amber-500 stroke-[2.5]" />
          <h3 className="font-black uppercase tracking-wider text-sm">Output & Live Stream</h3>
        </div>

        {/* Purple Pills Row */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button"
            onClick={() => onChangeExportConfig('exportMode', 'render')}
            className={`py-2.5 px-3 border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all ${
              exportConfig.exportMode === 'render' ? 'bg-[#8B5CF6] text-white' : 'bg-white text-black hover:bg-slate-50'
            }`}
          >
            {isEn ? '🎥 Render MP4' : '🎥 Render MP4'}
          </button>
          <button 
            type="button"
            onClick={() => onChangeExportConfig('exportMode', 'stream')}
            className={`py-2.5 px-3 border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all ${
              exportConfig.exportMode === 'stream' ? 'bg-[#8B5CF6] text-white' : 'bg-white text-black hover:bg-slate-50'
            }`}
          >
            {isEn ? '⚡ Live YouTube' : '⚡ Live YouTube'}
          </button>
          <button 
            type="button" 
            onClick={() => setShowRenderSettings(!showRenderSettings)}
            className={`py-2.5 px-3 border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all ${
              showRenderSettings ? 'bg-[#8B5CF6] text-white' : 'bg-white text-black hover:bg-slate-50'
            }`}
          >
            {isEn ? '⚙️ Render Settings' : '⚙️ Pengaturan Render'}
          </button>
          <button type="button" className="py-2.5 px-3 bg-white hover:bg-slate-50 text-black border-2 border-black rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px]">
            {isEn ? '🔄 Automation & Loop' : '🔄 Automasi & Looping'}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setShowSpecsModal(true); fetchSpecs(); }}
            className="col-span-2 py-2.5 px-3 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black rounded-lg font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <span>💻 {isEn ? 'System Specs & Optimizer' : 'Spesifikasi PC & Optimizer'}</span>
          </button>
        </div>

        {/* Conditional Stream Key Input */}
        {exportConfig.exportMode === 'stream' && (
          <div className="space-y-1.5 border-2 border-black p-3 bg-amber-50 rounded-lg shadow-[2px_2px_0px_#000]">
            <span className="text-[10px] font-black uppercase tracking-wider text-black block">
              {isEn ? 'YouTube Stream Key:' : 'Kunci Streaming YouTube:'}
            </span>
            <input
              type="password"
              placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
              value={exportConfig.streamKey || ''}
              onChange={(e) => onChangeExportConfig('streamKey', e.target.value)}
              className="w-full neo-input text-xs font-mono p-2.5 bg-white border-2 border-black rounded"
            />
            <span className="text-[9px] text-black/55 leading-tight block">
              {isEn 
                ? 'Enter your stream key from YouTube Live Dashboard. Streaming uses RTMP.'
                : 'Masukkan stream key dari YouTube Live Dashboard Anda. Siaran menggunakan rute RTMP langsung.'}
            </span>
          </div>
        )}

        {/* Output File Location & Save Destination Selector */}
        <div className="space-y-1.5 border-2 border-black p-3 bg-[#FAF6ED] rounded-lg shadow-[2px_2px_0px_#000] text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-black block">
            📁 {isEn ? 'Output File Location & Name:' : 'Lokasi & Nama File Output:'}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={outputPath}
              onChange={(e) => onChangeExportConfig('outputPath', e.target.value)}
              className="flex-1 neo-input text-xs font-mono p-2 bg-white border-2 border-black rounded min-w-0"
              placeholder="exports/visualizer.mp4"
            />
            <button
              type="button"
              onClick={handleChooseOutputPath}
              className="px-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white border-2 border-black rounded font-black text-[10px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-0.5px] active:translate-y-[0.5px] cursor-pointer transition-all whitespace-nowrap"
            >
              {isEn ? 'Choose...' : 'Pilih...'}
            </button>
          </div>
          <span className="text-[9px] text-black/55 leading-tight block">
            {isEn 
              ? 'Default path is exports/visualizer.mp4. Click "Choose..." to select folder/file.'
              : 'Lokasi standar adalah exports/visualizer.mp4. Klik "Pilih..." untuk mencari folder/nama file.'}
          </span>
        </div>

        {/* Primary Action Trigger Button */}
        <button 
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white border-3 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <span>{isEn ? '⏳ PROCESS RUNNING...' : '⏳ PROSES BERJALAN...'}</span>
          ) : (
            <span>
              {exportConfig.exportMode === 'stream' 
                ? (isEn ? '⚡ START YOUTUBE LIVE STREAM' : '⚡ MULAI LIVE STREAM YOUTUBE') 
                : (isEn ? '🎥 START OFFLINE VIDEO RENDER' : '🎥 RENDER VIDEO OFFLINE')}
            </span>
          )}
        </button>

        {/* Resolusi Selector Grid */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Resolution:' : 'Resolusi:'}</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '854x480', label: 'SD 854x480' },
              { id: '1280x720', label: 'HD 1280x720' },
              { id: '1920x1080', label: 'Full HD 1920x1080' },
              { id: '2560x1440', label: '2K 2560x1440' },
              { id: '3840x2160', label: '4K 3840x2160' }
            ].map(res => (
              <button
                key={res.id}
                type="button"
                onClick={() => onChangeExportConfig('resolution', res.id)}
                className={`py-2 px-1 border-2 border-black rounded font-black text-[10px] transition-all ${
                  resolution === res.id
                    ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-slate-50'
                }`}
              >
                {res.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Rate Row */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Frame Rate:' : 'Frame Rate:'}</span>
          <div className="grid grid-cols-3 gap-2">
            {[24, 30, 60].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => onChangeExportConfig('fps', f)}
                className={`py-2 border-2 border-black rounded font-black text-xs transition-all ${
                  fps === f
                    ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-slate-50'
                }`}
              >
                {f} fps
              </button>
            ))}
          </div>
        </div>

        {/* Mesin Encoder Selector */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Detected Encoder Engine:' : 'Mesin Encoder & Engine Terdeteksi:'}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeExportConfig('encoder', 'cpu')}
              className={`py-2 border-2 border-black rounded font-black text-xs transition-all ${
                encoder === 'cpu'
                  ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black hover:bg-slate-50'
              }`}
            >
              CPU + HW Encode
            </button>
            <button
              type="button"
              onClick={() => onChangeExportConfig('encoder', 'gpu')}
              className={`py-2 border-2 border-black rounded font-black text-xs transition-all ${
                encoder === 'gpu'
                  ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black hover:bg-slate-50'
              }`}
            >
              Full GPU
            </button>
          </div>
        </div>

        {/* Accel Banner */}
        <div className="bg-[#1A1135] border-2 border-black p-3.5 rounded flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-brandPink animate-pulse" />
            <span>{isEn ? 'Hardware Acceleration:' : 'Hardware Akselerasi:'} <strong className="text-emerald-400">Desktop Engine | GPU Detected</strong></span>
          </div>
          <HelpCircle className="w-3.5 h-3.5 text-white/50 cursor-pointer" />
        </div>

        {/* Segment Checkbox */}
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="render-seg"
            checked={exportConfig.segmentRender}
            onChange={(e) => onChangeExportConfig('segmentRender', e.target.checked)}
            className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
          />
          <label htmlFor="render-seg" className="text-[10px] font-bold uppercase tracking-wide text-black cursor-pointer">
            {isEn ? 'Render by segment (resumeable)' : 'Render per segmen lagu (bisa dilanjutkan)'}
          </label>
        </div>

        {/* Codec Video Row */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Video Codec:' : 'Codec Video:'}</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'h264', label: 'H.264 (AVC)' },
              { id: 'h265', label: 'H.265 (HEVC)' },
              { id: 'av1', label: 'AV1 (Next-Gen)' }
            ].map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChangeExportConfig('codec', c.id)}
                className={`py-2 px-1 border-2 border-black rounded font-black text-[10px] transition-all ${
                  codec === c.id
                    ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Video Row */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Video Format — File Ext:' : 'Format Video — Ekstensi File:'}</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mp4', label: 'MP4 (Standar)' },
              { id: 'mkv', label: 'MKV (Aman dari Corrupt)' },
              { id: 'mov', label: 'MOV (Apple/Mac)' }
            ].map(fmt => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onChangeExportConfig('format', fmt.id)}
                className={`py-2 px-1 border-2 border-black rounded font-black text-[10px] transition-all ${
                  format === fmt.id
                    ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-white text-black hover:bg-slate-50'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="space-y-3">
          {/* Bitrate Select */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Bitrate — main file size controller:' : 'Laju Bit / Bitrate — pengatur utama ukuran file:'}</span>
            <select 
              value={exportConfig.videoBitrate}
              onChange={(e) => onChangeExportConfig('videoBitrate', e.target.value)}
              className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs cursor-pointer shadow-[2px_2px_0px_#000] outline-none"
            >
              <option value="Direkomendasikan (Auto)">Direkomendasikan (Auto)</option>
              <option value="Ultra High Quality (24 Mbps)">Ultra High Quality (24 Mbps)</option>
              <option value="High Quality (12 Mbps)">High Quality (12 Mbps)</option>
              <option value="Medium Quality (6 Mbps)">Medium Quality (6 Mbps)</option>
            </select>
          </div>

          {/* Audio Bitrate Select */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Audio Bitrate (AAC):' : 'Bitrate Audio (AAC):'}</span>
            <select 
              value={exportConfig.audioBitrate}
              onChange={(e) => onChangeExportConfig('audioBitrate', e.target.value)}
              className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs cursor-pointer shadow-[2px_2px_0px_#000] outline-none"
            >
              <option value="192 kbps (Direkomendasikan)">192 kbps (Direkomendasikan)</option>
              <option value="320 kbps (Studio Quality)">320 kbps (Studio Quality)</option>
              <option value="128 kbps (Standard Quality)">128 kbps (Standard Quality)</option>
            </select>
          </div>

          {/* Encoding Speed Select */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Encoding Speed:' : 'Kecepatan Encoding:'}</span>
            <select 
              value={exportConfig.encodingSpeed}
              onChange={(e) => onChangeExportConfig('encodingSpeed', e.target.value)}
              className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs cursor-pointer shadow-[2px_2px_0px_#000] outline-none"
            >
              <option value="Cepat">Cepat</option>
              <option value="Seimbang">Seimbang</option>
              <option value="Lambat (Hasil Lebih Tajam)">Lambat (Hasil Lebih Tajam)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Right Card: Metadata & Thumbnail */}
      <div className="bg-[#FFFDF9] border-[3px] border-black p-5 rounded-xl shadow-[4px_4px_0px_#000] space-y-5 text-black">
        {/* Header Title with Language Toggle */}
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-rose-500 stroke-[2.5]" />
            <h3 className="font-black uppercase tracking-wider text-sm">Metadata & Thumbnail</h3>
          </div>
          {/* Toggle ID / EN */}
          <div className="flex border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_#000]">
            <button
              type="button"
              onClick={() => onChangeExportConfig('language', 'id')}
              className={`px-3 py-1 font-bold text-xs transition-all ${
                language === 'id' ? 'bg-[#FBBF24] text-black' : 'bg-white text-black'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => onChangeExportConfig('language', 'en')}
              className={`px-3 py-1 font-bold text-xs border-l-2 border-black transition-all ${
                language === 'en' ? 'bg-[#FBBF24] text-black' : 'bg-white text-black'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Thumbnail Generator */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Auto Thumbnail Generator' : 'Pembuat Thumbnail Otomatis'}</span>
          <div className="w-full h-44 rounded-lg bg-[#FEF8EC] border-2 border-black border-dashed overflow-hidden flex flex-col items-center justify-center relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt="Thumbnail Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-xs font-bold text-black/40">
                <Share2 className="w-6 h-6 text-black/20 mb-2" />
                <span>{isEn ? 'Start Song Preview to Generate Thumbnail' : 'Mulai Preview Lagu untuk Membuat Gambar Mini'}</span>
              </div>
            )}
          </div>
          <button 
            type="button"
            disabled={!thumbnailUrl}
            onClick={() => {
              if (thumbnailUrl) {
                const link = document.createElement('a');
                link.download = 'thumbnail.png';
                link.href = thumbnailUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className="w-full py-2.5 px-4 neo-btn-primary bg-[#8B5CF6] hover:bg-[#7c3aed] text-white flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>{isEn ? 'Download Thumbnail Image' : 'Download Gambar Thumbnail'}</span>
          </button>
        </div>

        {/* Copy Area 1: Judul Siap Copy */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">{isEn ? 'Ready Title Copy:' : 'Judul Siap Copy:'}</span>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={titleCopyStr}
              className="flex-1 neo-input text-xs truncate select-all"
            />
            <button
              onClick={() => handleCopy(titleCopyStr, setCopiedTitle)}
              className={`px-4 py-2 border-2 border-black rounded-lg font-black text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] ${
                copiedTitle ? 'bg-emerald-400 text-black' : 'bg-[#FBBF24] text-black hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000]'
              }`}
            >
              {copiedTitle ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTitle ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Copy Area 2: SEO YouTube Timestamps */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60">SEO YouTube Timestamps</span>
            <button
              onClick={() => handleCopy(timestampsStr, setCopiedTimestamps)}
              className={`px-3 py-1 border-2 border-black rounded-md font-black text-[10px] flex items-center gap-1 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] ${
                copiedTimestamps ? 'bg-emerald-400 text-black' : 'bg-[#8B5CF6] text-white hover:translate-y-[-1px]'
              }`}
            >
              {copiedTimestamps ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <textarea
            readOnly
            value={timestampsStr}
            rows={3}
            className="w-full neo-input text-xs font-mono resize-none leading-relaxed select-all"
          />
        </div>

        {/* Copy Area 3: Deskripsi Lengkap */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60">{isEn ? 'Full Description' : 'Deskripsi Lengkap'}</span>
            <button
              onClick={() => handleCopy(descStr, setCopiedDescription)}
              className={`px-3 py-1 border-2 border-black rounded-md font-black text-[10px] flex items-center gap-1 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] ${
                copiedDescription ? 'bg-emerald-400 text-black' : 'bg-[#8B5CF6] text-white hover:translate-y-[-1px]'
              }`}
            >
              {copiedDescription ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <textarea
            readOnly
            value={descStr}
            rows={3}
            className="w-full neo-input text-xs leading-relaxed resize-none select-all"
          />
        </div>

        {/* Copy Area 4: Tags / Hashtag */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60">{isEn ? 'Tags / Hashtags' : 'Tags / Hashtag'}</span>
            <button
              onClick={() => handleCopy(tagsStr, setCopiedTags)}
              className={`px-3 py-1 border-2 border-black rounded-md font-black text-[10px] flex items-center gap-1 transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] ${
                copiedTags ? 'bg-emerald-400 text-black' : 'bg-[#8B5CF6] text-white hover:translate-y-[-1px]'
              }`}
            >
              {copiedTags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <textarea
            readOnly
            value={tagsStr}
            rows={3}
            className="w-full neo-input text-xs font-mono leading-relaxed resize-none select-all"
          />
        </div>

      </div>

      {showRenderSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#FFFDF9] border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_#000] max-w-md w-full p-6 text-black relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-3 border-black">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600 stroke-[2.5]" />
                <h3 className="font-black uppercase tracking-wider text-sm">
                  {isEn ? '⚙️ Advanced Render Settings' : '⚙️ Pengaturan Render Lanjut'}
                </h3>
              </div>
              <button 
                onClick={() => setShowRenderSettings(false)}
                className="font-black text-sm hover:text-red-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              
              {/* Output File Path */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                  {isEn ? 'Output File Location & Name:' : 'Lokasi & Nama File Output:'}
                </label>
                <input
                  type="text"
                  value={outputPath}
                  onChange={(e) => onChangeExportConfig('outputPath', e.target.value)}
                  className="w-full neo-input text-xs font-mono p-2.5 bg-white border-2 border-black rounded-lg"
                  placeholder="exports/visualizer.mp4"
                />
                <span className="text-[9px] text-black/45 leading-normal block">
                  {isEn 
                    ? 'Default path is exports/visualizer.mp4. You can enter absolute paths (e.g. C:/Users/ASUS/Desktop/video.mp4).'
                    : 'Lokasi standar adalah exports/visualizer.mp4. Anda dapat menggunakan path absolut (contoh: C:/Users/ASUS/Desktop/video.mp4).'}
                </span>
              </div>

              {/* CRF Quality Slider/Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                  {isEn ? 'Video Quality Factor (CRF - CPU Mode):' : 'Tingkat Kualitas Video (CRF - Mode CPU):'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 18, label: isEn ? 'CRF 18 (Best)' : 'CRF 18 (Tinggi)' },
                    { val: 23, label: isEn ? 'CRF 23 (Balanced)' : 'CRF 23 (Seimbang)' },
                    { val: 28, label: isEn ? 'CRF 28 (Compact)' : 'CRF 28 (Kecil)' }
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => onChangeExportConfig('videoCRF', item.val)}
                      className={`py-2 px-1 border-2 border-black rounded font-black text-[10px] cursor-pointer transition-all ${
                        videoCRF === item.val
                          ? 'bg-[#FBBF24] text-black shadow-[2px_2px_0px_#000]'
                          : 'bg-white text-black hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-black/45 leading-normal block">
                  {isEn
                    ? 'Constant Rate Factor (CRF): Lower values produce higher quality but larger file sizes.'
                    : 'Constant Rate Factor (CRF): Nilai lebih rendah menghasilkan kualitas lebih tajam dengan file lebih besar.'}
                </span>
              </div>

              {/* Audio Normalization (Loudnorm) */}
              <div className="flex items-start gap-2.5 pt-1.5 border-t-2 border-black/10">
                <input
                  type="checkbox"
                  id="audio-norm"
                  checked={audioNormalize}
                  onChange={(e) => onChangeExportConfig('audioNormalize', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black mt-0.5"
                />
                <div className="space-y-0.5">
                  <label htmlFor="audio-norm" className="text-[10px] font-bold uppercase tracking-wide text-black cursor-pointer block">
                    {isEn ? 'Normalize Audio Volume' : 'Normalisasi Kenyaringan Audio'}
                  </label>
                  <span className="text-[9px] text-black/45 leading-normal block">
                    {isEn
                      ? 'Applies FFmpeg loudnorm filter to normalize volume peaks and target dynamic ranges.'
                      : 'Menerapkan filter loudnorm FFmpeg untuk menyeimbangkan kenyaringan volume suara.'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t-3 border-black flex justify-end">
              <button
                type="button"
                onClick={() => setShowRenderSettings(false)}
                className="py-2 px-5 bg-[#FBBF24] hover:bg-[#F59E0B] text-black border-2 border-black rounded-lg font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
              >
                {isEn ? 'Close & Save' : 'Simpan & Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSpecsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn text-black">
          <div className="bg-[#FEF8EC] border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_#000] max-w-lg w-full p-6 text-black relative space-y-5 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-3 border-black">
              <div className="flex items-center gap-2">
                <span className="text-xl">💻</span>
                <h3 className="font-black uppercase tracking-wider text-sm">
                  {isEn ? 'System Specifications & Optimizer' : 'Spesifikasi PC & Optimalisasi'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowSpecsModal(false)}
                className="w-8 h-8 rounded border-2 border-black flex items-center justify-center font-bold bg-white hover:bg-slate-100 shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingSpecs ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#8B5CF6] animate-spin" />
                <span className="text-xs font-bold text-black/50">{isEn ? 'Analyzing system hardware...' : 'Menganalisis spesifikasi hardware...'}</span>
              </div>
            ) : specs ? (
              <div className="space-y-4">
                
                {/* Recommendation Banner */}
                <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-black/40 uppercase tracking-wider">
                      {isEn ? 'System Compatibility' : 'Tingkat Kompatibilitas'}
                    </span>
                    <span className={`px-2.5 py-0.5 border-2 border-black rounded-full text-[9px] font-black text-white ${
                      specs.recommendation.performanceClass === 'EXCELLENT' 
                        ? 'bg-emerald-500 shadow-[1.5px_1.5px_0px_#000]' 
                        : specs.recommendation.performanceClass === 'GOOD'
                        ? 'bg-amber-500 shadow-[1.5px_1.5px_0px_#000]'
                        : 'bg-[#8B5CF6] shadow-[1.5px_1.5px_0px_#000]'
                    }`}>
                      {specs.recommendation.performanceClass}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed text-black/80 text-left">
                    📢 {specs.recommendation.explanation}
                  </p>
                </div>

                {/* Specs Table */}
                <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_#000] text-xs font-bold space-y-2.5 text-left">
                  <span className="text-[9px] font-black text-black/40 uppercase tracking-wider block border-b-2 border-black/10 pb-1 mb-2">Hardware Details</span>
                  
                  <div className="flex justify-between border-b border-black/5 pb-1.5">
                    <span className="text-black/60">Processor (CPU):</span>
                    <span className="font-semibold text-right max-w-[240px] truncate">{specs.cpu}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1.5">
                    <span className="text-black/60">Graphics (GPU):</span>
                    <span className="font-semibold text-right max-w-[240px] truncate">{specs.gpus.join(', ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1.5">
                    <span className="text-black/60">System RAM:</span>
                    <span className="font-semibold">{specs.ram}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-1.5">
                    <span className="text-black/60">OS Platform:</span>
                    <span className="font-semibold">{specs.os}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-black/60">GPU Codecs Terdeteksi:</span>
                    <span className="font-mono text-[10px] text-[#8B5CF6] max-w-[240px] truncate">
                      {specs.ffmpeg_encoders.length > 0 ? specs.ffmpeg_encoders.filter((c: string) => !c.includes('lib')).join(', ') : 'None'}
                    </span>
                  </div>
                </div>

                {/* Recommend Action Card */}
                <div className="p-4 bg-emerald-50 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-left text-xs font-bold space-y-2">
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block border-b border-emerald-950/10 pb-1">
                    {isEn ? 'Recommended Optimization Settings' : 'Rekomendasi Setelan Optimal'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-black/80">
                    <div>• Encoder: <span className="font-bold text-emerald-800 uppercase">{specs.recommendation.encoder}</span></div>
                    <div>• Codec: <span className="font-bold text-emerald-800 uppercase">{specs.recommendation.codec}</span></div>
                    <div>• Resolution: <span className="font-bold text-emerald-800">{specs.recommendation.resolution}</span></div>
                    <div>• Frame Rate: <span className="font-bold text-emerald-800">{specs.recommendation.fps} fps</span></div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={applySpecsRecommendation}
                  className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  🚀 {isEn ? 'Apply Optimal Settings' : 'Terapkan Setelan Rekomendasi'}
                </button>

              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-xs font-bold text-black/40">
                <span>{isEn ? 'Failed to fetch specifications.' : 'Gagal memuat spesifikasi PC.'}</span>
                <button 
                  type="button" 
                  onClick={fetchSpecs} 
                  className="mt-3 px-3 py-1.5 border-2 border-black rounded font-bold hover:bg-slate-100 shadow-[1.5px_1.5px_0px_#000]"
                >
                  🔄 {isEn ? 'Retry' : 'Coba Lagi'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
