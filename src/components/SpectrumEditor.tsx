import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  Type, 
  Music,
  ChevronRight,
  Settings,
  FileText,
  FolderOpen,
  Trash2,
  Volume2,
  Sun,
  ShieldCheck,
  Eye,
  RotateCcw
} from 'lucide-react';

interface SpectrumEditorProps {
  settings: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onResetToDefaults: () => void;
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement> | File) => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAudio?: () => void;
  onClearBg?: () => void;
  onAiBgGenerated?: (url: string, name: string) => void;
  audioName: string | null;
  bgNames: string[];
  activeStep: number | null;
  onActiveStepChange: (step: number | null) => void;
  onLogoUpload: (file: File | null) => void;
  logoName: string | null;
  onVoiceoverUpload: (file: File | null) => void;
  voiceoverName: string | null;
  onCustomFontUpload?: (file: File | null) => void;
  customFontName?: string | null;
  onLrcUpload?: (file: File | null) => void;
  lrcFileName?: string | null;
  onSaveTemplate?: () => void;
  onLoadTemplate?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenDirectDownload?: (type?: 'audio' | 'background') => void;
  onOpenStemSeparator?: () => void;
}

const PRESETS = {
  stealth: {
    antiCopyrightPitchEnabled: true,
    antiCopyrightPitch: 3,
    antiCopyrightTempoEnabled: false,
    antiCopyrightHighCut: true,
    antiCopyrightHighCutFreq: 16000,
    antiCopyrightLowCut: true,
    antiCopyrightLowCutFreq: 40,
    antiCopyrightEnvWarp: false,
    antiCopyrightPhaser: true,
    antiCopyrightPhaserSpeed: 0.2,
    antiCopyrightPhaserDecay: 0.2,
    antiCopyrightDelayEnabled: true,
    antiCopyrightDelayMs: 15,
    antiCopyrightZoomEnabled: true,
    antiCopyrightZoom: 3,
    antiCopyrightRotateEnabled: true,
    antiCopyrightRotate: 0.003,
    antiCopyrightNoiseEnabled: false,
    antiCopyrightVignetteEnabled: true,
    antiCopyrightVignette: 0.2,
    antiCopyrightColorGrading: true,
    antiCopyrightTremoloEnabled: false,
    antiCopyrightTremoloSpeed: 1.0,
    antiCopyrightTremoloDepth: 0.08,
    antiCopyrightGapsEnabled: false,
    antiCopyrightGapsInterval: 15,
    antiCopyrightSaturationEnabled: false,
    antiCopyrightSaturationGain: 3,
    antiCopyrightUltrasonicEnabled: false,
    antiCopyrightUltrasonicLevel: 0.002,
    antiCopyrightJitterEnabled: false,
    antiCopyrightJitterStrength: 1,
    antiCopyrightHashEnabled: false,
    antiCopyrightHashStrength: 2
  },
  medium: {
    antiCopyrightPitchEnabled: true,
    antiCopyrightPitch: 5,
    antiCopyrightTempoEnabled: true,
    antiCopyrightTempo: 101,
    antiCopyrightHighCut: true,
    antiCopyrightHighCutFreq: 15000,
    antiCopyrightLowCut: true,
    antiCopyrightLowCutFreq: 50,
    antiCopyrightEnvWarp: true,
    antiCopyrightEnvFrame: 200,
    antiCopyrightEnvGain: 12,
    antiCopyrightPhaser: true,
    antiCopyrightPhaserSpeed: 0.4,
    antiCopyrightPhaserDecay: 0.3,
    antiCopyrightDelayEnabled: true,
    antiCopyrightDelayMs: 25,
    antiCopyrightZoomEnabled: true,
    antiCopyrightZoom: 5,
    antiCopyrightRotateEnabled: true,
    antiCopyrightRotate: 0.006,
    antiCopyrightNoiseEnabled: true,
    antiCopyrightNoise: 1,
    antiCopyrightVignetteEnabled: true,
    antiCopyrightVignette: 0.35,
    antiCopyrightColorGrading: true,
    antiCopyrightTremoloEnabled: true,
    antiCopyrightTremoloSpeed: 1.0,
    antiCopyrightTremoloDepth: 0.05,
    antiCopyrightGapsEnabled: true,
    antiCopyrightGapsInterval: 20,
    antiCopyrightSaturationEnabled: true,
    antiCopyrightSaturationGain: 2,
    antiCopyrightUltrasonicEnabled: false,
    antiCopyrightUltrasonicLevel: 0.002,
    antiCopyrightJitterEnabled: true,
    antiCopyrightJitterStrength: 1,
    antiCopyrightHashEnabled: true,
    antiCopyrightHashStrength: 1
  },
  heavy: {
    antiCopyrightPitchEnabled: true,
    antiCopyrightPitch: 7,
    antiCopyrightTempoEnabled: true,
    antiCopyrightTempo: 103,
    antiCopyrightHighCut: true,
    antiCopyrightHighCutFreq: 13000,
    antiCopyrightLowCut: true,
    antiCopyrightLowCutFreq: 70,
    antiCopyrightEnvWarp: true,
    antiCopyrightEnvFrame: 300,
    antiCopyrightEnvGain: 18,
    antiCopyrightPhaser: true,
    antiCopyrightPhaserSpeed: 0.8,
    antiCopyrightPhaserDecay: 0.5,
    antiCopyrightDelayEnabled: true,
    antiCopyrightDelayMs: 35,
    antiCopyrightZoomEnabled: true,
    antiCopyrightZoom: 8,
    antiCopyrightRotateEnabled: true,
    antiCopyrightRotate: 0.010,
    antiCopyrightNoiseEnabled: true,
    antiCopyrightNoise: 2,
    antiCopyrightVignetteEnabled: true,
    antiCopyrightVignette: 0.5,
    antiCopyrightColorGrading: true,
    antiCopyrightTremoloEnabled: true,
    antiCopyrightTremoloSpeed: 1.2,
    antiCopyrightTremoloDepth: 0.08,
    antiCopyrightGapsEnabled: true,
    antiCopyrightGapsInterval: 15,
    antiCopyrightSaturationEnabled: true,
    antiCopyrightSaturationGain: 3,
    antiCopyrightUltrasonicEnabled: true,
    antiCopyrightUltrasonicLevel: 0.002,
    antiCopyrightJitterEnabled: true,
    antiCopyrightJitterStrength: 2,
    antiCopyrightHashEnabled: true,
    antiCopyrightHashStrength: 2
  },
  extreme: {
    antiCopyrightPitchEnabled: true,
    antiCopyrightPitch: 9,
    antiCopyrightTempoEnabled: true,
    antiCopyrightTempo: 105,
    antiCopyrightHighCut: true,
    antiCopyrightHighCutFreq: 11000,
    antiCopyrightLowCut: true,
    antiCopyrightLowCutFreq: 90,
    antiCopyrightEnvWarp: true,
    antiCopyrightEnvFrame: 400,
    antiCopyrightEnvGain: 25,
    antiCopyrightPhaser: true,
    antiCopyrightPhaserSpeed: 1.5,
    antiCopyrightPhaserDecay: 0.7,
    antiCopyrightDelayEnabled: true,
    antiCopyrightDelayMs: 50,
    antiCopyrightZoomEnabled: true,
    antiCopyrightZoom: 10,
    antiCopyrightRotateEnabled: true,
    antiCopyrightRotate: 0.015,
    antiCopyrightNoiseEnabled: true,
    antiCopyrightNoise: 4,
    antiCopyrightVignetteEnabled: true,
    antiCopyrightVignette: 0.7,
    antiCopyrightColorGrading: true,
    antiCopyrightTremoloEnabled: true,
    antiCopyrightTremoloSpeed: 1.5,
    antiCopyrightTremoloDepth: 0.12,
    antiCopyrightGapsEnabled: true,
    antiCopyrightGapsInterval: 10,
    antiCopyrightSaturationEnabled: true,
    antiCopyrightSaturationGain: 5,
    antiCopyrightUltrasonicEnabled: true,
    antiCopyrightUltrasonicLevel: 0.005,
    antiCopyrightJitterEnabled: true,
    antiCopyrightJitterStrength: 3,
    antiCopyrightHashEnabled: true,
    antiCopyrightHashStrength: 4
  }
};

export const SpectrumEditor: React.FC<SpectrumEditorProps> = ({
  settings,
  onChange,
  onResetToDefaults,
  onAudioUpload,
  onBgUpload,
  onClearAudio,
  onClearBg,
  onAiBgGenerated,
  audioName,
  bgNames,
  activeStep,
  onActiveStepChange,
  onLogoUpload,
  logoName,
  onVoiceoverUpload,
  voiceoverName,
  onCustomFontUpload,
  customFontName,
  onLrcUpload,
  lrcFileName,
  onSaveTemplate,
  onLoadTemplate,
  onOpenDirectDownload,
  onOpenStemSeparator
}) => {
  const toggleSection = (idx: number) => {
    const nextStep = activeStep === idx ? null : idx;
    onActiveStepChange(nextStep);
  };

  const [activeShieldTab, setActiveShieldTab] = React.useState<'audio' | 'video'>('audio');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onLogoUpload(file);
      const url = ((file as any).path && typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__?.convertFileSrc)
        ? (window as any).__TAURI_INTERNALS__.convertFileSrc((file as any).path)
        : URL.createObjectURL(file);
      onChange('logoPath', url);
    }
  };

  const handleVoiceoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onVoiceoverUpload(file);
    }
  };

  const handleGenerateAiBg = () => {
    const gradients = [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%235b21b6"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23831843"/><stop offset="50%" stop-color="%23581c87"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="50%" stop-color="%230284c7"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/></svg>'
    ];
    const selected = gradients[Math.floor(Math.random() * gradients.length)];
    if (onAiBgGenerated) {
      onAiBgGenerated(selected, 'AI_Abstract_Gradient_' + Math.floor(Math.random() * 1000) + '.svg');
    }
  };


  return (
    <div className="w-full flex flex-col h-full bg-[#FAF6ED] p-6 overflow-y-auto space-y-4 select-none">
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-2 pl-9 pr-1">
        <div className="flex items-center gap-2 min-w-0">
          <Settings className="w-5 h-5 text-black stroke-[2.5] shrink-0" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black truncate">
            Configuration Menus
          </h2>
        </div>
        <button
          type="button"
          onClick={onResetToDefaults}
          className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase bg-red-100 hover:bg-red-200 text-red-700 border border-black rounded shadow-[1px_1px_0px_#000] transition-all cursor-pointer active:translate-y-[0.5px] active:shadow-none select-none shrink-0"
          title="Reset all settings and uploads to factory default values"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Quick Tools Header (Direct Download & Stem Separator) */}
      <div className="grid grid-cols-2 gap-2 pb-2">
        {onOpenDirectDownload && (
          <button
            type="button"
            onClick={() => onOpenDirectDownload('audio')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-black text-[10px] uppercase border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer select-none"
            title="Unduh audio/video langsung dari link URL YouTube, TikTok, dll"
          >
            <span>⚡</span>
            <span>DOWNLOAD URL / YT</span>
          </button>
        )}
        {onOpenStemSeparator && (
          <button
            type="button"
            onClick={onOpenStemSeparator}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-black text-[10px] uppercase border-2 border-black rounded-xl shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer select-none"
            title="Pisahkan lagu menjadi vokal & musik instrumen"
          >
            <span>🎼</span>
            <span>AI STEM SEPARATOR</span>
          </button>
        )}
      </div>

      {/* Template Preset Buttons (Save / Load) */}
      <div className="grid grid-cols-2 gap-2 pb-2 border-b-2 border-black/10">
        <button
          type="button"
          onClick={onSaveTemplate}
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Simpan Templat</span>
        </button>
        <label
          className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition-all cursor-pointer text-center"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Muat Templat</span>
          <input
            type="file"
            accept=".json"
            onChange={onLoadTemplate}
            className="hidden"
          />
        </label>
      </div>

      {/* SECTION 1: Menu Media & Audio (WIZARD STEP 1 - COMPREHENSIVE IMPLEMENTATION) */}
      <div className="flex flex-col">
        <button
          onClick={() => toggleSection(1)}
          className="neo-accordion-header text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1 bg-[#FEF8EC] border border-black rounded shrink-0">
              <Music className="w-4 h-4 text-black" />
            </div>
            <span className="text-xs uppercase font-black tracking-wide flex items-center gap-1.5 flex-wrap">
              <span>1. Menu Media & Audio</span>
              {audioName ? (
                <span className="bg-[#10B981] text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] leading-none uppercase">● AUDIO TERPASANG</span>
              ) : (
                <span className="bg-[#FFDE4D] text-black text-[9px] font-black px-1.5 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000] leading-none uppercase">BARU</span>
              )}
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-black transition-transform duration-200 shrink-0 ${activeStep === 1 ? 'rotate-90' : ''}`} />
        </button>
        
        {activeStep === 1 && (
          <div className="neo-accordion-content space-y-6">
            
            {/* ASPEK RASIO */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Aspek Rasio (Ukuran Layar):
              </label>
              <div className="flex border-2 border-black rounded-lg overflow-hidden shadow-[2.5px_2.5px_0px_#000] bg-white">
                <button
                  onClick={() => onChange('aspectRatio', '16:9')}
                  className={`flex-1 py-2 text-xs font-black transition-all ${
                    settings.aspectRatio === '16:9' ? 'bg-[#3B82F6] text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  16:9
                </button>
                <button
                  onClick={() => onChange('aspectRatio', '9:16')}
                  className={`flex-1 py-2 text-xs font-black border-l-2 border-black transition-all ${
                    settings.aspectRatio === '9:16' ? 'bg-[#3B82F6] text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  9:16
                </button>
              </div>
            </div>

            {/* TEMPLATE PRESET SOSIAL MEDIA */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 block">
                ⚡ Template Preset Sosial Media:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'youtube', label: '📺 YouTube (16:9)', ratio: '16:9' },
                  { id: 'tiktok', label: '📱 TikTok (9:16)', ratio: '9:16' },
                  { id: 'ig', label: '📸 IG Feed (1:1)', ratio: '16:9' } // mapping feed
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onChange('socialPreset', preset.id);
                      onChange('aspectRatio', preset.ratio);
                    }}
                    className={`py-2 px-1 border-2 border-black rounded font-black text-[9px] text-center transition-all ${
                      settings.socialPreset === preset.id
                        ? 'bg-[#E9D5FF] text-black shadow-[1.5px_1.5px_0px_#000]'
                        : 'bg-[#F3E8FF] text-black hover:bg-purple-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EFEK VISUAL UTAMA */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Efek Visual Utama (Base Effect):
              </label>
              <select
                value={settings.baseEffect}
                onChange={(e) => onChange('baseEffect', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs cursor-pointer shadow-[2.5px_2.5px_0px_#000] outline-none"
              >
                <option>Static Cover (Standard)</option>
                <option>Smooth Pulsing (Audio React)</option>
                <option>Camera Shake (Bass React)</option>
              </select>
            </div>

             {/* MODE LATAR BELAKANG */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Mode Latar Belakang:
              </label>
              <div className="flex border-2 border-black rounded-lg overflow-hidden shadow-[2.5px_2.5px_0px_#000] bg-white">
                <button
                  type="button"
                  onClick={() => onChange('bgMode', 'template')}
                  className={`flex-1 py-2 text-xs font-black transition-all ${
                    settings.bgMode === 'template' ? 'bg-[#3B82F6] text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  Warna Gradien Latar
                </button>
                <button
                  type="button"
                  onClick={() => onChange('bgMode', 'upload')}
                  className={`flex-1 py-2 text-xs font-black border-l-2 border-black transition-all ${
                    settings.bgMode === 'upload' ? 'bg-[#3B82F6] text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  Unggah Gambar/Video
                </button>
              </div>
            </div>

            {/* SOLID / GRADIENT BACKGROUND COLOR PICKER */}
            {settings.bgMode === 'template' && (
              <div className="bg-[#FFF8E7] border-2 border-black p-3.5 rounded-lg space-y-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-black">
                  🎨 Kustomisasi Warna Gradien Latar
                </div>
                
                {/* Gradient Type */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-black block">Tipe Gradien:</span>
                  <div className="flex border border-black rounded overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onChange('bgGradientType', 'solid')}
                      className={`flex-1 py-1 text-[10px] font-bold ${settings.bgGradientType === 'solid' ? 'bg-black text-white' : 'bg-white text-black'}`}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange('bgGradientType', 'gradient')}
                      className={`flex-1 py-1 text-[10px] font-bold border-l border-black ${settings.bgGradientType === 'gradient' ? 'bg-black text-white' : 'bg-white text-black'}`}
                    >
                      Gradasi
                    </button>
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-bold text-black block">Warna Utama</span>
                    <input
                      type="color"
                      value={settings.bgGradientColor1 || '#1e1b4b'}
                      onChange={(e) => onChange('bgGradientColor1', e.target.value)}
                      className="w-full h-8 border border-black rounded cursor-pointer bg-transparent"
                    />
                  </div>
                  {settings.bgGradientType === 'gradient' && (
                    <div className="flex-1 space-y-1">
                      <span className="text-[9px] font-bold text-black block">Warna Kedua</span>
                      <input
                        type="color"
                        value={settings.bgGradientColor2 || '#5b21b6'}
                        onChange={(e) => onChange('bgGradientColor2', e.target.value)}
                        className="w-full h-8 border border-black rounded cursor-pointer bg-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Angle Slider */}
                {settings.bgGradientType === 'gradient' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-black">
                      <span>Sudut Kemiringan:</span>
                      <span>{settings.bgGradientAngle || 135}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={settings.bgGradientAngle || 135}
                      onChange={(e) => onChange('bgGradientAngle', parseInt(e.target.value))}
                      className="w-full neo-slider cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* VIDEO / GAMBAR LATAR BOX CONTAINER */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1"><FolderOpen className="w-3.5 h-3.5 text-black" /> Video / Gambar Latar:</span>
                <button 
                  type="button"
                  onClick={() => {
                    onChange('backgroundPath', null);
                    if (onClearBg) onClearBg();
                  }}
                  className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white border border-black rounded text-[9px] font-bold shadow-[1px_1px_0px_#000] active:translate-y-[1px] cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex gap-1.5">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={onBgUpload} 
                  multiple
                  className="hidden" 
                  id="wizard-bg-input" 
                />
                <label 
                  htmlFor="wizard-bg-input"
                  className="py-1.5 px-3 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                >
                  + File
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onBgUpload}
                  multiple
                  className="hidden"
                  id="wizard-bg-folder-input"
                />
                <label
                  htmlFor="wizard-bg-folder-input"
                  className="py-1.5 px-3 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                >
                  + Folder
                </label>
                <button 
                  type="button"
                  onClick={handleGenerateAiBg}
                  className="py-1.5 px-3 bg-[#D1FAE5] hover:bg-emerald-100 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                >
                  🛠️ AI Background
                </button>
                {onOpenDirectDownload && (
                  <button 
                    type="button"
                    onClick={() => onOpenDirectDownload('background')}
                    className="py-1.5 px-3 bg-[#E9D5FF] hover:bg-purple-200 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 cursor-pointer"
                    title="Download Video/Gambar Latar dari URL"
                  >
                    ⚡ Download URL
                  </button>
                )}
              </div>

              {/* ROTASI & PEMBALIKAN GAMBAR / VOLUME AUDIO LATAR */}
              <div className="bg-[#FFF8E7] border-2 border-black p-3.5 rounded-lg space-y-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-black">
                  🔄 Transformasi & Audio Video Latar
                </div>

                {/* Flip Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onChange('bgFlipH', !settings.bgFlipH)}
                    className={`flex-1 py-1.5 border-2 border-black rounded font-black text-[9px] text-center transition-all ${
                      settings.bgFlipH ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'
                    }`}
                  >
                    ↔️ Flip Horisontal
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('bgFlipV', !settings.bgFlipV)}
                    className={`flex-1 py-1.5 border-2 border-black rounded font-black text-[9px] text-center transition-all ${
                      settings.bgFlipV ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'
                    }`}
                  >
                    ↕️ Flip Vertikal
                  </button>
                </div>

                {/* Video Volume Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-black">
                    <span>Volume Suara Video Latar:</span>
                    <span>{settings.bgVideoVolume ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.bgVideoVolume ?? 0}
                    onChange={(e) => onChange('bgVideoVolume', parseInt(e.target.value))}
                    className="w-full neo-slider cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Media List Box */}
              <div className="w-full min-h-[90px] p-4 bg-[#FEF8EC] border-2 border-black rounded-lg flex flex-col justify-center text-xs font-bold text-black/50 text-center select-all">
                {bgNames && bgNames.length > 0 ? (
                  <div className="space-y-1.5 w-full">
                    {bgNames.map((name, idx) => (
                      <div key={idx} className="text-black text-left flex items-center justify-between bg-white border border-black p-1.5 rounded">
                        <span className="truncate max-w-[200px] font-mono text-[10px]">{name}</span>
                        <Trash2 className="w-3.5 h-3.5 text-red-500 cursor-pointer" onClick={() => { if (onClearBg) onClearBg(); }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>No background images or videos added.</span>
                )}
              </div>
            </div>

            {/* MODEL PAS LAYAR FIT MODE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Model Pas Layar (Fit Mode) Latar:
              </label>
              <select
                value={settings.fitMode}
                onChange={(e) => onChange('fitMode', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2.5px_2.5px_0px_#000] outline-none"
              >
                <option>Fit to Screen (Blurred Background)</option>
                <option>Crop to Fill (Proportional)</option>
                <option>Fit to Screen (Letterbox)</option>
                <option>Stretch to Fit</option>
              </select>
            </div>

            {/* EFEK LATAR BELAKANG (KECERAHAN & BLUR) */}
            <div className="bg-[#FFF8E7] border-2 border-orange-200 p-3.5 rounded-lg space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Setelan Visual Latar (Kecerahan & Blur)</span>
              </div>
              
              {/* Brightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Kecerahan Latar Belakang:</span>
                  <span>{settings.backgroundBrightness ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={settings.backgroundBrightness ?? 100}
                  onChange={(e) => onChange('backgroundBrightness', parseInt(e.target.value))}
                  className="w-full neo-slider cursor-pointer"
                />
              </div>

              {/* Blur Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Tingkat Blur (Buram Latar):</span>
                  <span>{settings.backgroundBlur ?? 0} {settings.backgroundBlur === 0 ? '(100% Tajam)' : 'px'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={settings.backgroundBlur ?? 0}
                  onChange={(e) => onChange('backgroundBlur', parseInt(e.target.value))}
                  className="w-full neo-slider cursor-pointer"
                />
              </div>
            </div>

            {/* MUSIK / AUDIO */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5 text-black" /> Musik / Audio:</span>
                <button 
                  onClick={() => {
                    onChange('audioPath', null);
                    if (onClearAudio) onClearAudio();
                  }}
                  className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white border border-black rounded text-[9px] font-bold shadow-[1px_1px_0px_#000] active:translate-y-[1px] cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={onAudioUpload} 
                  className="hidden" 
                  id="wizard-audio-input" 
                />
                <label 
                  htmlFor="wizard-audio-input"
                  className="py-1.5 px-3 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] cursor-pointer flex-1 text-center"
                >
                  Pilih MP3/Audio
                </label>
                {onOpenDirectDownload && (
                  <button
                    type="button"
                    onClick={() => onOpenDirectDownload('audio')}
                    className="py-1.5 px-3 bg-[#E9D5FF] hover:bg-purple-200 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] cursor-pointer flex items-center gap-1"
                    title="Download Audio dari YouTube / URL"
                  >
                    ⚡ Download URL / YouTube
                  </button>
                )}
              </div>

              {onOpenStemSeparator && (
                <button
                  type="button"
                  onClick={onOpenStemSeparator}
                  className="w-full py-2 bg-[#CCFBF1] hover:bg-teal-100 text-teal-900 border-2 border-black rounded-lg font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center justify-center gap-1.5"
                  title="Pisahkan Lagu Menjadi Trek Vokal & Musik Instrumen"
                >
                  <span>🎼</span>
                  <span>PISAHKAN VOKAL & INSTRUMEN (AI STEM SEPARATOR)</span>
                </button>
              )}
              <div className="flex gap-1.5 items-center">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={onAudioUpload} 
                  className="hidden" 
                  id="wizard-audio-folder-input" 
                />
                <label 
                  htmlFor="wizard-audio-folder-input"
                  className="py-1.5 px-3 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                >
                  + Folder
                </label>

                {/* Audio Demo Loader */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('http://localhost:1426/temp_fallback_audio.mp3');
                      if (res.ok) {
                        const blob = await res.blob();
                        const file = new File([blob], "temp_fallback_audio.mp3", { type: "audio/mpeg" });
                        onAudioUpload(file);
                      } else {
                        const dummyFile = new File([new Uint8Array(1000)], "dummy_silent_track.mp3", { type: "audio/mpeg" });
                        onAudioUpload(dummyFile);
                      }
                    } catch (e) {
                      const dummyFile = new File([new Uint8Array(1000)], "dummy_silent_track.mp3", { type: "audio/mpeg" });
                      onAudioUpload(dummyFile);
                    }
                  }}
                  className="py-1.5 px-3 bg-[#10B981] hover:bg-emerald-600 text-white border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] active:translate-y-[0.5px] cursor-pointer"
                  title="Gunakan Audio Fallback Bawaan untuk Uji Coba Cepat"
                >
                  ✨ Audio Demo
                </button>
              </div>
              
              {/* Audio Box */}
              <div className="w-full min-h-[90px] p-4 bg-[#FEF8EC] border-2 border-black rounded-lg flex flex-col justify-center text-xs font-bold text-black/50 text-center select-all">
                {audioName ? (
                  <div className="text-black text-left flex items-center justify-between bg-white border border-black p-1.5 rounded">
                    <span className="truncate max-w-[240px] font-mono text-[10px]">{audioName}</span>
                    <Trash2 className="w-3.5 h-3.5 text-red-500 cursor-pointer" onClick={() => { onChange('audioPath', null); if (onClearAudio) onClearAudio(); }} />
                  </div>
                ) : (
                  <span>No audio or music files added.</span>
                )}
              </div>
            </div>

            {/* JALUR NARRATOR / VOICEOVER (OPSIONAL) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1">🗣️ Jalur Narrator / Voiceover (Opsional):</span>
                <button 
                  onClick={() => { onChange('voiceoverPath', null); onVoiceoverUpload(null); }}
                  className="px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white border border-black rounded text-[9px] font-bold shadow-[1px_1px_0px_#000] active:translate-y-[1px]"
                >
                  Hapus Semua
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleVoiceoverUpload} 
                  className="hidden" 
                  id="voiceover-input" 
                />
                <label 
                  htmlFor="voiceover-input"
                  className="py-1.5 px-3 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                >
                  + File Voiceover
                </label>
                <button className="py-1.5 px-3 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded font-black text-[9px] shadow-[1.5px_1.5px_0px_#000]">
                  + Folder
                </button>
                <div className="flex items-center gap-1.5 ml-2">
                  <input 
                    type="checkbox" 
                    id="auto-duck-check"
                    checked={settings.autoDucking}
                    onChange={(e) => onChange('autoDucking', e.target.checked)}
                    className="w-4 h-4 border-2 border-black bg-white rounded cursor-pointer accent-black"
                  />
                  <label htmlFor="auto-duck-check" className="text-[10px] font-black uppercase text-black cursor-pointer">
                    Auto-Ducking
                  </label>
                </div>
              </div>
              
              {/* Voiceover Box */}
              <div className="w-full min-h-[90px] p-4 bg-[#FEF8EC] border-2 border-black rounded-lg flex flex-col justify-center text-xs font-bold text-black/50 text-center select-all">
                {voiceoverName ? (
                  <div className="text-black text-left flex items-center justify-between bg-white border border-black p-1.5 rounded">
                    <span className="truncate max-w-[240px] font-mono text-[10px]">{voiceoverName}</span>
                    <Trash2 className="w-3.5 h-3.5 text-red-500 cursor-pointer" onClick={() => { onChange('voiceoverPath', null); onVoiceoverUpload(null); }} />
                  </div>
                ) : (
                  <span>No voiceover files added.</span>
                )}
              </div>
            </div>

            {/* Setelan Auto-Ducking Suara (Collapsible box based on checkbox) */}
            {settings.autoDucking && (
              <div className="bg-[#FFF8E7] border-2 border-orange-200 p-4 rounded-lg space-y-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Setelan Auto-Ducking Suara</span>
                </div>
                
                {/* Ducking level */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-black">
                    <span>Ducking Musik:</span>
                    <span>{settings.duckingLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={settings.duckingLevel}
                    onChange={(e) => onChange('duckingLevel', parseInt(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>

                {/* Release time */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-black">
                    <span>Release Time:</span>
                    <span>{settings.releaseTime}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={settings.releaseTime}
                    onChange={(e) => onChange('releaseTime', parseFloat(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>
              </div>
            )}

            {/* Upload Logo Lingkaran */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Upload Logo Lingkaran (Opsional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="No Logo Selected..."
                  value={logoName || ''}
                  className="flex-1 neo-input text-xs truncate"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                  id="logo-input" 
                />
                <label
                  htmlFor="logo-input"
                  className="px-4 py-2 bg-[#E9D5FF] border-2 border-black rounded-lg font-black text-xs text-black cursor-pointer shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] text-center"
                >
                  Pilih Gambar
                </label>
              </div>
              {logoName && (
                <div className="flex items-center gap-2 mt-1.5 select-none">
                  <input 
                    type="checkbox" 
                    id="logo-pulse-sync"
                    checked={settings.logoPulseSync || false}
                    onChange={(e) => onChange('logoPulseSync', e.target.checked)}
                    className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                  />
                  <label htmlFor="logo-pulse-sync" className="text-[10px] font-bold uppercase tracking-wide text-black cursor-pointer">
                    Sinkronkan denyut logo dengan musik (Beat Pulse)
                  </label>
                </div>
              )}
            </div>

            {/* Upload Font Kustom */}
            <div className="space-y-1.5 pt-2 border-t border-black/5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Unggah Font Kustom (.ttf / .otf) (Opsional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Gunakan Font Sistem..."
                  value={customFontName || ''}
                  className="flex-1 neo-input text-xs truncate"
                />
                <input 
                  type="file" 
                  accept=".ttf,.otf" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && onCustomFontUpload) {
                      onCustomFontUpload(e.target.files[0]);
                    }
                  }} 
                  className="hidden" 
                  id="custom-font-input" 
                />
                <label
                  htmlFor="custom-font-input"
                  className="px-4 py-2 bg-[#E9D5FF] border-2 border-black rounded-lg font-black text-xs text-black cursor-pointer shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] text-center"
                >
                  Pilih Font
                </label>
                {customFontName && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onCustomFontUpload) onCustomFontUpload(null);
                    }}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-[1px]"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            {/* SUMBER AUDIO PRIORITAS */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Sumber Audio Prioritas (Mixer):
              </label>
              <select
                value={settings.audioMixer}
                onChange={(e) => onChange('audioMixer', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs cursor-pointer shadow-[2.5px_2.5px_0px_#000] outline-none"
              >
                <option>Gunakan Musik Upload Saja (Playlist)</option>
                <option>Gunakan Voiceover Saja</option>
                <option>Campurkan Musik + Voiceover</option>
              </select>
            </div>

            {/* MODE SINKRONISASI LATAR & MUSIK */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Mode Sinkronisasi Latar & Musik:
              </label>
              <select
                value={settings.syncMode}
                onChange={(e) => onChange('syncMode', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs cursor-pointer shadow-[2.5px_2.5px_0px_#000] outline-none"
              >
                <option>Normal (Latar & Musik jalan masing-masing)</option>
                <option>Sinkronkan Latar dengan Ketukan (Beat Sync)</option>
              </select>
            </div>

            {/* Ganti Latar Tiap */}
            <div className="flex items-center gap-2 text-xs font-bold text-black flex-wrap">
              <span>Ganti Latar Tiap:</span>
              <input
                type="number"
                min={1}
                max={300}
                value={settings.bgInterval}
                onChange={(e) => onChange('bgInterval', parseInt(e.target.value) || 10)}
                className="w-20 bg-white border-2 border-black rounded-lg px-2 py-1 text-center font-black text-xs shadow-[2px_2px_0px_#000] outline-none focus:bg-amber-50"
              />
              <span>detik <span className="text-[9px] font-medium text-black/50">(jika media video habis, otomatis di-loop).</span></span>
            </div>

            {/* Final Checkboxes */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="wizard-fade-check"
                  checked={settings.audioFade}
                  onChange={(e) => onChange('audioFade', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="wizard-fade-check" className="text-[10px] font-black uppercase text-black cursor-pointer">
                  Enable Audio Fade-in/out (2s in, 3s out)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="wizard-bass-check"
                  checked={settings.bassBoost}
                  onChange={(e) => onChange('bassBoost', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="wizard-bass-check" className="text-[10px] font-black uppercase text-black cursor-pointer">
                  Enable Bass Boost (Enriches low frequencies)
                </label>
              </div>

              <div className="flex flex-col gap-2 p-5 border-[3px] border-black rounded-xl bg-white shadow-[4px_4px_0px_#000]">
                {/* Embed custom range input CSS for premium neo-brutalist look */}
                <style dangerouslySetInnerHTML={{__html: `
                  .neo-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 8px;
                    background: #FAF6ED;
                    border: 2px solid #000;
                    border-radius: 4px;
                    outline: none;
                  }
                  .neo-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #FFDE4D;
                    border: 2px solid #000;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 1.5px 1.5px 0px #000;
                    transition: transform 0.1s ease, background-color 0.1s ease;
                  }
                  .neo-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    background: #f5c518;
                  }
                  @keyframes pulse-neon {
                    0%, 100% { box-shadow: 0 0 4px #4ade80, 0 0 10px #4ade80; }
                    50% { box-shadow: 0 0 8px #22c55e, 0 0 20px #22c55e; }
                  }
                  .neon-active-dot {
                    animation: pulse-neon 2s infinite;
                  }
                `}} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="wizard-anticopyright-check"
                      checked={settings.antiCopyright || false}
                      onChange={(e) => onChange('antiCopyright', e.target.checked)}
                      className="w-5 h-5 border-2 border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                    />
                    <label htmlFor="wizard-anticopyright-check" className="text-xs font-black uppercase text-black cursor-pointer flex items-center gap-2 select-none">
                      <ShieldCheck className={`w-4 h-4 ${settings.antiCopyright ? 'text-[#8B5CF6]' : 'text-black'}`} />
                      <span>Enable Anti-Copyright Shield</span>
                    </label>
                  </div>
                  <span className="bg-[#FFDE4D] text-black text-[9px] font-black px-2 py-0.5 rounded border-2 border-black shadow-[1.5px_1.5px_0px_#000] leading-none uppercase animate-pulse">PRO</span>
                </div>

                {settings.antiCopyright && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-black/20 space-y-4 animate-fadeIn">
                    
                    {/* Preset Templates */}
                    <div className="space-y-1.5 p-2 bg-[#FAF6ED] border-2 border-black rounded-lg shadow-[1.5px_1.5px_0px_#000]">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase text-black">
                        <span>Bypass Shield Presets</span>
                        <span className="text-[#8B5CF6] font-extrabold text-[8px] bg-[#FAF6ED] px-1 py-0.2 border border-black/10 rounded">TAP TO APPLY</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { key: 'stealth', name: 'Stealth A', desc: 'Aesthetic / Recommended' },
                          { key: 'medium', name: 'Medium B', desc: 'Slightly changed' },
                          { key: 'heavy', name: 'Heavy C', desc: 'Warped / Protec+' },
                          { key: 'extreme', name: 'Extreme D', desc: 'Max Distortion' }
                        ].map(preset => {
                          const isActive = settings.antiCopyrightPreset === preset.key;
                          return (
                            <button
                              key={preset.key}
                              type="button"
                              onClick={() => {
                                onChange('applyPreset', { 
                                  ...PRESETS[preset.key as keyof typeof PRESETS],
                                  antiCopyrightPreset: preset.key
                                });
                              }}
                              className={`flex flex-col items-center justify-center p-1.5 rounded border border-black transition-all cursor-pointer text-center select-none ${
                                isActive 
                                  ? 'bg-[#FFDE4D] text-black shadow-[1px_1px_0px_#000]' 
                                  : 'bg-white text-black/60 shadow-none hover:bg-black/5 hover:text-black'
                              }`}
                              title={preset.desc}
                            >
                              <span className="text-[8px] font-black leading-none">{preset.name.split(' ')[0]}</span>
                              <span className="text-[7.5px] font-bold mt-0.5 leading-none bg-black/5 px-1 py-0.5 rounded text-black/70">{preset.name.split(' ')[1]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-2 p-1 border-2 border-black rounded-lg bg-[#FAF6ED] shadow-[1.5px_1.5px_0px_#000]">
                      <button
                        type="button"
                        onClick={() => setActiveShieldTab('audio')}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded border-2 border-black transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${
                          activeShieldTab === 'audio'
                            ? 'bg-[#FFDE4D] text-black shadow-[1.5px_1.5px_0px_#000]'
                            : 'bg-white text-black/50 border-transparent hover:text-black shadow-none'
                        }`}
                      >
                        <Music className="w-3 h-3" />
                        <span>Audio Core</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveShieldTab('video')}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded border-2 border-black transition-all flex items-center justify-center gap-1 cursor-pointer select-none ${
                          activeShieldTab === 'video'
                            ? 'bg-[#FFDE4D] text-black shadow-[1.5px_1.5px_0px_#000]'
                            : 'bg-white text-black/50 border-transparent hover:text-black shadow-none'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Video Core</span>
                      </button>
                    </div>

                    <div className="shield-scroll max-h-[300px] overflow-y-auto pr-1 space-y-4">
                      <style dangerouslySetInnerHTML={{__html: `
                        .shield-scroll::-webkit-scrollbar {
                          width: 4px;
                        }
                        .shield-scroll::-webkit-scrollbar-track {
                          background: transparent;
                        }
                        .shield-scroll::-webkit-scrollbar-thumb {
                          background: #000;
                          border-radius: 4px;
                        }
                      `}} />

                      {/* AUDIO DEFENSE SECTION */}
                      {activeShieldTab === 'audio' && (
                        <div className="space-y-3 p-4 bg-[#FEF8EC] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                          <div className="flex items-center justify-between pb-1 border-b border-black/10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                              <Music className="w-3.5 h-3.5" />
                              <span>Audio Defense Core</span>
                            </span>
                            <span className="text-[9px] font-black text-[#8B5CF6]">
                              {[
                                settings.antiCopyrightPitchEnabled !== false,
                                settings.antiCopyrightHighCut !== false,
                                settings.antiCopyrightLowCut !== false,
                                settings.antiCopyrightEnvWarp !== false,
                                settings.antiCopyrightPhaser !== false,
                                settings.antiCopyrightDelayEnabled !== false
                              ].filter(Boolean).length} ACTIVE
                            </span>
                          </div>

                          <div className="space-y-2">
                            {/* L1: Pitch Shift Slider */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightPitchEnabled !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightPitchEnabled !== false}
                                    onChange={(e) => onChange('antiCopyrightPitchEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightPitchEnabled !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold">L1: Pitch Modulation</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightPitchEnabled !== false ? `+${settings.antiCopyrightPitch || 4}%` : 'OFF'}
                                </span>
                              </div>
                              
                              <input 
                                type="range" min="1" max="10" step="1"
                                value={settings.antiCopyrightPitch || 4}
                                onChange={(e) => onChange('antiCopyrightPitch', parseInt(e.target.value))}
                                disabled={settings.antiCopyrightPitchEnabled === false}
                                className="neo-slider"
                              />

                              {/* L1.2: Independent Tempo Stretch Toggle & Slider */}
                              {settings.antiCopyrightPitchEnabled !== false && (
                                <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
                                  <div className="flex justify-between items-center text-[8.5px] font-black text-black">
                                    <div className="flex items-center gap-1.5">
                                      <input 
                                        type="checkbox"
                                        checked={settings.antiCopyrightTempoEnabled || false}
                                        onChange={(e) => onChange('antiCopyrightTempoEnabled', e.target.checked)}
                                        className="w-3 h-3 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                      />
                                      <span className="select-none text-black/70 font-semibold">L1.2: Speed stretching</span>
                                    </div>
                                    <span className="font-bold text-black/80">{settings.antiCopyrightTempoEnabled ? `${settings.antiCopyrightTempo || 100}%` : 'LINKED'}</span>
                                  </div>
                                  {settings.antiCopyrightTempoEnabled && (
                                    <input 
                                      type="range" min="95" max="105" step="1"
                                      value={settings.antiCopyrightTempo || 100}
                                      onChange={(e) => onChange('antiCopyrightTempo', parseInt(e.target.value))}
                                      className="neo-slider"
                                    />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* L2: High-Cut Filter cutoff slider */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightHighCut !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightHighCut !== false}
                                    onChange={(e) => onChange('antiCopyrightHighCut', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightHighCut !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold">L2: High-Cut Cutoff</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightHighCut !== false ? `${settings.antiCopyrightHighCutFreq || 16000} Hz` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="10000" max="18000" step="500"
                                value={settings.antiCopyrightHighCutFreq || 16000}
                                onChange={(e) => onChange('antiCopyrightHighCutFreq', parseInt(e.target.value))}
                                disabled={settings.antiCopyrightHighCut === false}
                                className="neo-slider"
                              />
                            </div>

                            {/* L3: Low-Cut Filter cutoff slider */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightLowCut !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightLowCut !== false}
                                    onChange={(e) => onChange('antiCopyrightLowCut', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightLowCut !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold">L3: Low-Cut Cutoff</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightLowCut !== false ? `${settings.antiCopyrightLowCutFreq || 40} Hz` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="20" max="120" step="5"
                                value={settings.antiCopyrightLowCutFreq || 40}
                                onChange={(e) => onChange('antiCopyrightLowCutFreq', parseInt(e.target.value))}
                                disabled={settings.antiCopyrightLowCut === false}
                                className="neo-slider"
                              />
                            </div>

                            {/* L4: Envelope Warp parameters */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightEnvWarp !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightEnvWarp !== false}
                                    onChange={(e) => onChange('antiCopyrightEnvWarp', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightEnvWarp !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold">L4: Loudness Envelope Warp</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightEnvWarp !== false ? `${settings.antiCopyrightEnvFrame || 150}ms | ${settings.antiCopyrightEnvGain || 15}dB` : 'OFF'}
                                </span>
                              </div>
                              {settings.antiCopyrightEnvWarp !== false && (
                                <div className="space-y-2 mt-1">
                                  <div className="space-y-0.5">
                                    <span className="text-[7.5px] font-bold text-black/60 block">Frame Size (Window)</span>
                                    <input 
                                      type="range" min="50" max="500" step="25"
                                      value={settings.antiCopyrightEnvFrame || 150}
                                      onChange={(e) => onChange('antiCopyrightEnvFrame', parseInt(e.target.value))}
                                      className="neo-slider"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[7.5px] font-bold text-black/60 block">Max Target Gain Limit</span>
                                    <input 
                                      type="range" min="5" max="30" step="1"
                                      value={settings.antiCopyrightEnvGain || 15}
                                      onChange={(e) => onChange('antiCopyrightEnvGain', parseInt(e.target.value))}
                                      className="neo-slider"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* L5: Stereo Phaser Modulation parameters */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightPhaser !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightPhaser !== false}
                                    onChange={(e) => onChange('antiCopyrightPhaser', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightPhaser !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold">L5: Stereo Phaser</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightPhaser !== false ? `${settings.antiCopyrightPhaserSpeed || 0.2}Hz | D:${settings.antiCopyrightPhaserDecay || 0.3}` : 'OFF'}
                                </span>
                              </div>
                              {settings.antiCopyrightPhaser !== false && (
                                <div className="space-y-2 mt-1">
                                  <div className="space-y-0.5">
                                    <span className="text-[7.5px] font-bold text-black/60 block">Phaser Sweep Speed</span>
                                    <input 
                                      type="range" min="0.1" max="2.0" step="0.1"
                                      value={settings.antiCopyrightPhaserSpeed || 0.2}
                                      onChange={(e) => onChange('antiCopyrightPhaserSpeed', parseFloat(e.target.value))}
                                      className="neo-slider"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[7.5px] font-bold text-black/60 block">Decay Level</span>
                                    <input 
                                      type="range" min="0.1" max="0.9" step="0.1"
                                      value={settings.antiCopyrightPhaserDecay || 0.3}
                                      onChange={(e) => onChange('antiCopyrightPhaserDecay', parseFloat(e.target.value))}
                                      className="neo-slider"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* L5.5: Stereo Delay (Phase Correlation Bypass) */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightDelayEnabled !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightDelayEnabled !== false}
                                    onChange={(e) => onChange('antiCopyrightDelayEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightDelayEnabled !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold">L5.5: Stereo Phase Delay</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightDelayEnabled !== false ? `${settings.antiCopyrightDelayMs || 20}ms` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="5" max="50" step="5"
                                value={settings.antiCopyrightDelayMs || 20}
                                onChange={(e) => onChange('antiCopyrightDelayMs', parseInt(e.target.value))}
                                disabled={settings.antiCopyrightDelayEnabled === false}
                                className="neo-slider"
                              />
                            </div>
                            {/* L12: Volume Tremolo LFO */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightTremoloEnabled ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightTremoloEnabled || false}
                                    onChange={(e) => onChange('antiCopyrightTremoloEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightTremoloEnabled ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold flex items-center gap-1">L12: Volume Tremolo (LFO) <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-black uppercase rounded animate-pulse">NEW</span></span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightTremoloEnabled ? `${settings.antiCopyrightTremoloSpeed || 1.0}Hz | D:${Math.round((settings.antiCopyrightTremoloDepth || 0.08) * 100)}%` : 'OFF'}
                                </span>
                              </div>
                              {settings.antiCopyrightTremoloEnabled && (
                                <div className="space-y-2 mt-1">
                                  <div className="space-y-0.5">
                                    <span className="text-[7.5px] font-bold text-black/60 block">Modulation Speed</span>
                                    <input 
                                      type="range" min="0.5" max="3.0" step="0.1"
                                      value={settings.antiCopyrightTremoloSpeed || 1.0}
                                      onChange={(e) => onChange('antiCopyrightTremoloSpeed', parseFloat(e.target.value))}
                                      className="neo-slider"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[7.5px] font-bold text-black/60 block">Modulation Depth</span>
                                    <input 
                                      type="range" min="0.02" max="0.25" step="0.01"
                                      value={settings.antiCopyrightTremoloDepth || 0.08}
                                      onChange={(e) => onChange('antiCopyrightTremoloDepth', parseFloat(e.target.value))}
                                      className="neo-slider"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* L13: Micro-Silence Gaps */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightGapsEnabled ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightGapsEnabled || false}
                                    onChange={(e) => onChange('antiCopyrightGapsEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightGapsEnabled ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold flex items-center gap-1">L13: Micro-Silence Gaps (5ms) <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-black uppercase rounded animate-pulse">NEW</span></span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightGapsEnabled ? `Every ${settings.antiCopyrightGapsInterval || 15}s` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="8" max="30" step="1"
                                value={settings.antiCopyrightGapsInterval || 15}
                                onChange={(e) => onChange('antiCopyrightGapsInterval', parseInt(e.target.value))}
                                disabled={!settings.antiCopyrightGapsEnabled}
                                className="neo-slider"
                              />
                            </div>

                            {/* L14: Tape Saturation (Warm Overdrive) */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightSaturationEnabled ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightSaturationEnabled || false}
                                    onChange={(e) => onChange('antiCopyrightSaturationEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightSaturationEnabled ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold flex items-center gap-1">L14: Tape Saturation (Warm Overdrive) <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-black uppercase rounded animate-pulse">NEW</span></span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightSaturationEnabled ? `+${settings.antiCopyrightSaturationGain || 3} dB` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="1" max="10" step="1"
                                value={settings.antiCopyrightSaturationGain || 3}
                                onChange={(e) => onChange('antiCopyrightSaturationGain', parseInt(e.target.value))}
                                disabled={!settings.antiCopyrightSaturationEnabled}
                                className="neo-slider"
                              />
                            </div>

                            {/* L15: Ultrasonic White Noise Overlay */}
                            <div className={`space-y-1.5 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightUltrasonicEnabled ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightUltrasonicEnabled || false}
                                    onChange={(e) => onChange('antiCopyrightUltrasonicEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightUltrasonicEnabled ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold flex items-center gap-1">L15: Ultrasonic White Noise Overlay <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-black uppercase rounded animate-pulse">NEW</span></span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightUltrasonicEnabled ? `Amp ${settings.antiCopyrightUltrasonicLevel || 0.002}` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="0.001" max="0.010" step="0.001"
                                value={settings.antiCopyrightUltrasonicLevel || 0.002}
                                onChange={(e) => onChange('antiCopyrightUltrasonicLevel', parseFloat(e.target.value))}
                                disabled={!settings.antiCopyrightUltrasonicEnabled}
                                className="neo-slider"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* VIDEO DEFENSE SECTION */}
                      {activeShieldTab === 'video' && (
                        <div className="space-y-3 p-4 bg-[#FEF8EC] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">
                          <div className="flex items-center justify-between pb-1 border-b border-black/10">
                            <span className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Video Defense Core</span>
                            </span>
                            <span className="text-[9px] font-black text-[#8B5CF6]">
                              {[settings.antiCopyrightZoomEnabled !== false, settings.antiCopyrightColorGrading !== false, settings.antiCopyrightNoiseEnabled !== false, settings.antiCopyrightVignetteEnabled !== false, settings.antiCopyrightRotateEnabled !== false].filter(Boolean).length} ACTIVE
                            </span>
                          </div>

                          {/* Sliders Container */}
                          <div className="space-y-2">
                            {/* L6: Zoom Slider */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightZoomEnabled !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightZoomEnabled !== false}
                                    onChange={(e) => onChange('antiCopyrightZoomEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightZoomEnabled !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none">L6: Spatial Zoom & Auto-Crop</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightZoomEnabled !== false ? `+${settings.antiCopyrightZoom || 3}%` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="1" max="10" step="1"
                                value={settings.antiCopyrightZoom || 3}
                                onChange={(e) => onChange('antiCopyrightZoom', parseInt(e.target.value))}
                                disabled={settings.antiCopyrightZoomEnabled === false}
                                className="neo-slider"
                              />
                            </div>

                            {/* L8: Grain Noise Slider */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightNoiseEnabled !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightNoiseEnabled !== false}
                                    onChange={(e) => onChange('antiCopyrightNoiseEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightNoiseEnabled !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none">L8: Dynamic Pixel Grain (Noise)</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightNoiseEnabled !== false ? `Lvl ${settings.antiCopyrightNoise === undefined ? 2 : settings.antiCopyrightNoise}` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="0" max="5" step="1"
                                value={settings.antiCopyrightNoise === undefined ? 2 : settings.antiCopyrightNoise}
                                onChange={(e) => onChange('antiCopyrightNoise', parseInt(e.target.value))}
                                disabled={settings.antiCopyrightNoiseEnabled === false}
                                className="neo-slider"
                              />
                            </div>

                            {/* L9: Vignette Slider */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightVignetteEnabled !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightVignetteEnabled !== false}
                                    onChange={(e) => onChange('antiCopyrightVignetteEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightVignetteEnabled !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none">L9: Vignette Shadow Overlay</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightVignetteEnabled !== false ? (settings.antiCopyrightVignette === undefined ? 0.3 : settings.antiCopyrightVignette) : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="0.0" max="0.8" step="0.1"
                                value={settings.antiCopyrightVignette === undefined ? 0.3 : settings.antiCopyrightVignette}
                                onChange={(e) => onChange('antiCopyrightVignette', parseFloat(e.target.value))}
                                disabled={settings.antiCopyrightVignetteEnabled === false}
                                className="neo-slider"
                              />
                            </div>

                            {/* L10: Micro Rotation Slider */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightRotateEnabled !== false ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightRotateEnabled !== false}
                                    onChange={(e) => onChange('antiCopyrightRotateEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightRotateEnabled !== false ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none">L10: Canvas Micro-Rotation</span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightRotateEnabled !== false ? `${settings.antiCopyrightRotate || 0.005} rad` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="0.001" max="0.015" step="0.001"
                                value={settings.antiCopyrightRotate || 0.005}
                                onChange={(e) => onChange('antiCopyrightRotate', parseFloat(e.target.value))}
                                disabled={settings.antiCopyrightRotateEnabled === false}
                                className="neo-slider"
                              />
                            </div>

                            {/* L16: Frame Rate Timings Jitter */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightJitterEnabled ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightJitterEnabled || false}
                                    onChange={(e) => onChange('antiCopyrightJitterEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightJitterEnabled ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold flex items-center gap-1">L16: Frame Timings Jitter (FPS) <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-black uppercase rounded animate-pulse">NEW</span></span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightJitterEnabled ? `Lvl ${settings.antiCopyrightJitterStrength || 1}` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="1" max="5" step="1"
                                value={settings.antiCopyrightJitterStrength || 1}
                                onChange={(e) => onChange('antiCopyrightJitterStrength', parseInt(e.target.value))}
                                disabled={!settings.antiCopyrightJitterEnabled}
                                className="neo-slider"
                              />
                            </div>

                            {/* L17: Pixel Hash Noise Overlay */}
                            <div className={`space-y-1 p-2 bg-white border border-black rounded shadow-[1px_1px_0px_#000] transition-opacity duration-200 ${settings.antiCopyrightHashEnabled ? '' : 'opacity-50'}`}>
                              <div className="flex justify-between items-center text-[9px] font-black text-black">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox"
                                    checked={settings.antiCopyrightHashEnabled || false}
                                    onChange={(e) => onChange('antiCopyrightHashEnabled', e.target.checked)}
                                    className="w-3.5 h-3.5 border border-black bg-white rounded cursor-pointer accent-[#8B5CF6]"
                                  />
                                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${settings.antiCopyrightHashEnabled ? 'bg-green-400 neon-active-dot' : 'bg-gray-300'}`} />
                                  <span className="select-none font-bold flex items-center gap-1">L17: Pixel Hash Noise Overlay <span className="px-1 py-0.2 bg-emerald-500 text-white text-[7px] font-black uppercase rounded animate-pulse">NEW</span></span>
                                </div>
                                <span className="font-bold text-[#8B5CF6]">
                                  {settings.antiCopyrightHashEnabled ? `Lvl ${settings.antiCopyrightHashStrength || 2}` : 'OFF'}
                                </span>
                              </div>
                              <input 
                                type="range" min="1" max="10" step="1"
                                value={settings.antiCopyrightHashStrength || 2}
                                onChange={(e) => onChange('antiCopyrightHashStrength', parseInt(e.target.value))}
                                disabled={!settings.antiCopyrightHashEnabled}
                                className="neo-slider"
                              />
                            </div>
                          </div>

                          {/* Interactive Color Grading Pill */}
                          <button
                            type="button"
                            onClick={() => onChange('antiCopyrightColorGrading', settings.antiCopyrightColorGrading !== false ? false : true)}
                            className={`w-full flex items-center justify-between p-2.5 border-2 rounded transition-all cursor-pointer mt-1 ${
                              settings.antiCopyrightColorGrading !== false 
                                ? 'bg-[#E8F8F0] border-black shadow-[1.5px_1.5px_0px_#000]' 
                                : 'bg-white/60 border-black/20 text-black/40 shadow-none'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-[8.5px] font-black uppercase text-left">
                              <span className={`w-2.5 h-2.5 rounded-full border ${settings.antiCopyrightColorGrading !== false ? 'bg-green-400 border-black neon-active-dot' : 'bg-gray-300 border-gray-400'}`} />
                              <div>
                                <span className={settings.antiCopyrightColorGrading !== false ? 'text-black' : 'text-black/30'}>L7: Color Grading Shift</span>
                                <span className="block text-[7.5px] leading-tight font-semibold text-black/60 mt-0.5">Alters color histograms to evade pixel matching checks</span>
                              </div>
                            </div>
                            <span className="text-[8px] font-black uppercase bg-white border border-black px-1.5 py-0.5 rounded leading-none text-black">ACTIVE</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION 2: Menu Special Effects (VFX & SFX) */}
      <div className="flex flex-col">
        <button
          onClick={() => toggleSection(2)}
          className="neo-accordion-header text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-[#FEF8EC] border border-black rounded">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="text-xs uppercase font-black tracking-wide">2. Menu Special Effects (VFX & SFX)</span>
          </div>
          <ChevronRight className={`w-4 h-4 text-black transition-transform duration-200 ${activeStep === 2 ? 'rotate-90' : ''}`} />
        </button>
        {activeStep === 2 && (
          <div className="neo-accordion-content space-y-6">
            
            {/* Mode Sambungan Latar Scroll */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Mode Sambungan Latar Scroll
              </label>
              <select
                value={settings.bgTransition}
                onChange={(e) => onChange('bgTransition', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2.5px_2.5px_0px_#000] outline-none"
              >
                <option>Overlap Pudar (Fade Smooth Seamless)</option>
                <option>Slide Horizontal</option>
                <option>Direct Cut</option>
              </select>
            </div>

            {/* VFX OVERLAY */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-black">
                <span>VFX Overlay (Bisa Pilih &gt; 1)</span>
                <span className="text-black/60">Terang/Opacity: {settings.vfxOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.vfxOpacity}
                onChange={(e) => onChange('vfxOpacity', parseInt(e.target.value))}
                className="w-full neo-slider"
              />

              {/* VFX Checkbox grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1.5">
                {[
                  { id: 'vfxCrt', label: 'CRT Screen Flicker (Aman)' },
                  { id: 'vfxFlash', label: 'Bercak Kilat Putih' },
                  { id: 'vfxNeon', label: 'Garis Tepi Berjalan (Neon)' },
                  { id: 'vfxDisco', label: 'Pantulan Kaca Bola Disko' },
                  { id: 'vfxMoon', label: 'Bulan Sabit & Lentera' },
                  { id: 'vfxRain', label: 'Raindrops on Glass' },
                  { id: 'vfxFilm', label: 'Film Jadul (Akar Putih Acak)' },
                  { id: 'vfxSpotlight', label: 'Lampu Sorot Disko (Club Lights)' },
                  { id: 'vfxIslamic', label: 'Pola Islami (Geometris/Bintang)' }
                ].map(item => (
                  <div key={item.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`wizard-vfx-${item.id}`}
                      checked={(settings as any)[item.id]}
                      onChange={(e) => onChange(item.id, e.target.checked)}
                      className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black mt-0.5"
                    />
                    <label htmlFor={`wizard-vfx-${item.id}`} className="text-[10px] font-bold text-black cursor-pointer leading-tight">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Pengaturan Garis Tepi Neon (visible if vfxNeon checked) */}
            {settings.vfxNeon && (
              <div className="bg-[#FFF8E7] border-2 border-orange-200 p-4 rounded-lg space-y-4 text-black">
                <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                  ⚙️ Pengaturan Garis Tepi Neon
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Padding */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold">Jarak dari Tepi (Padding)</span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={settings.neonPadding}
                      onChange={(e) => onChange('neonPadding', parseInt(e.target.value))}
                      className="w-full neo-slider"
                    />
                  </div>
                  {/* Speed */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold">Kecepatan Lari</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.neonSpeed}
                      onChange={(e) => onChange('neonSpeed', parseInt(e.target.value))}
                      className="w-full neo-slider"
                    />
                  </div>
                  {/* Thickness */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold">Ketebalan Garis</span>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={settings.neonThickness}
                      onChange={(e) => onChange('neonThickness', parseInt(e.target.value))}
                      className="w-full neo-slider"
                    />
                  </div>
                  {/* Length */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold">Panjang Cahaya Lari (%)</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={settings.neonLength}
                      onChange={(e) => onChange('neonLength', parseInt(e.target.value))}
                      className="w-full neo-slider"
                    />
                  </div>
                </div>

                {/* Glow Intensity */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold block">Intensitas Pancaran Glow (Shadow)</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.neonGlow}
                    onChange={(e) => onChange('neonGlow', parseInt(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>

                {/* Neon Color Pickers */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black/5">
                  <div className="text-center space-y-1">
                    <span className="text-[8px] font-black uppercase text-black/60 block">Warna Dasar</span>
                    <input
                      type="color"
                      value={settings.neonBaseColor}
                      onChange={(e) => onChange('neonBaseColor', e.target.value)}
                      className="w-10 h-7 rounded border border-black bg-transparent cursor-pointer mx-auto"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[8px] font-black uppercase text-black/60 block">Neon Awal</span>
                    <input
                      type="color"
                      value={settings.neonStartColor}
                      onChange={(e) => onChange('neonStartColor', e.target.value)}
                      className="w-10 h-7 rounded border border-black bg-transparent cursor-pointer mx-auto"
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[8px] font-black uppercase text-black/60 block">Neon Lawan</span>
                    <input
                      type="color"
                      value={settings.neonEndColor}
                      onChange={(e) => onChange('neonEndColor', e.target.value)}
                      className="w-10 h-7 rounded border border-black bg-transparent cursor-pointer mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Efek Denyut Musik (Zoom Irama) */}
            <div className="bg-[#FFFDF9] border-2 border-black p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="music-pulse-check"
                  checked={settings.musicPulse}
                  onChange={(e) => onChange('musicPulse', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="music-pulse-check" className="text-[10px] font-black uppercase text-black cursor-pointer flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-black block" />
                  <span>🎵 Efek Denyut Musik (Zoom Irama)</span>
                </label>
              </div>

              {settings.musicPulse && (
                <div className="space-y-4 pt-1">
                  {/* Zoom saat beat */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-black">
                      <span>Zoom Saat Beat:</span>
                      <span className="px-2 py-0.5 bg-white border border-black font-mono text-[10px] rounded font-bold">
                        {settings.beatZoom.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.5"
                      value={settings.beatZoom}
                      onChange={(e) => onChange('beatZoom', parseFloat(e.target.value))}
                      className="w-full neo-slider"
                    />
                  </div>

                  {/* Getaran (Shake) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-black">
                      <span>Getaran (Shake):</span>
                      <span className="px-2 py-0.5 bg-white border border-black font-mono text-[10px] rounded font-bold">
                        {settings.beatShake.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="5.0"
                      step="0.5"
                      value={settings.beatShake}
                      onChange={(e) => onChange('beatShake', parseFloat(e.target.value))}
                      className="w-full neo-slider"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Choose Cinematic Transition SFX */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Choose Cinematic Transition SFX (Optional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Browse SFX File..."
                  value={settings.transitionSfx || ''}
                  className="flex-1 neo-input text-xs truncate"
                />
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onChange('transitionSfx', e.target.files[0].name);
                    }
                  }} 
                  className="hidden" 
                  id="sfx-transition-input" 
                />
                <label
                  htmlFor="sfx-transition-input"
                  className="px-4 py-2 bg-[#E9D5FF] border-2 border-black rounded-lg font-black text-xs text-black cursor-pointer shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] text-center"
                >
                  Browse
                </label>
              </div>
            </div>

            {/* WARNA LATAR & KECERAHAN */}
            <div className="space-y-4 pt-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-black">
                ⚪ Warna Latar & Kecerahan
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-black">
                    <span>Kecerahan:</span>
                    <span>{settings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={settings.brightness}
                    onChange={(e) => onChange('brightness', parseInt(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>
                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-black">
                    <span>Kontras:</span>
                    <span>{settings.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={settings.contrast}
                    onChange={(e) => onChange('contrast', parseInt(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>
                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-black">
                    <span>Saturasi:</span>
                    <span>{settings.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={settings.saturation}
                    onChange={(e) => onChange('saturation', parseInt(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>
                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-black">
                    <span>Blur:</span>
                    <span>{settings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={settings.blur}
                    onChange={(e) => onChange('blur', parseInt(e.target.value))}
                    className="w-full neo-slider"
                  />
                </div>
              </div>
            </div>

            {/* Lofi Filter Voice check */}
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="wizard-lofi-audio-check"
                checked={settings.lofiFilter}
                onChange={(e) => onChange('lofiFilter', e.target.checked)}
                className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
              />
              <label htmlFor="wizard-lofi-audio-check" className="text-[10px] font-black uppercase text-black cursor-pointer">
                📻 Aktifkan Filter Suara Lofi (Mendem Radio Tape)
              </label>
            </div>

            {/* EFEK PARTIKEL ATMOSFER */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-black">
                ✨ Efek Partikel Atmosfer (Bisa Pilih &gt; 1)
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                {[
                  { id: 'partCosmic', label: 'Debu Kosmik (Cinematic)' },
                  { id: 'partSakura', label: 'Bunga Sakura (Estetik)' },
                  { id: 'partConfetti', label: 'Neon Confetti (EDM)' },
                  { id: 'partSnow', label: 'Hujan Salju' },
                  { id: 'partSparks', label: 'Percikan Api' },
                  { id: 'partRain', label: 'Hujan Deras' },
                  { id: 'partStar', label: 'Bintang Kejora' },
                  { id: 'partBubbles', label: 'Gelembung Air' },
                  { id: 'partLeaves', label: 'Daun Gugur (Autumn)' },
                  { id: 'partMagic', label: 'Percikan Sihir' },
                  { id: 'partOrbs', label: 'Orb Cahaya (Orbs)' },
                  { id: 'partMatrix', label: 'Hujan Kode (Matrix)' }
                ].map(p => (
                  <div key={p.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`wizard-part-${p.id}`}
                      checked={(settings as any)[p.id]}
                      onChange={(e) => onChange(p.id, e.target.checked)}
                      className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black mt-0.5"
                    />
                    <label htmlFor={`wizard-part-${p.id}`} className="text-[10px] font-bold text-black cursor-pointer leading-tight">
                      {p.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION 3: Menu Spektrum Audio */}
      <div className="flex flex-col">
        <button
          onClick={() => toggleSection(3)}
          className="neo-accordion-header text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-[#FEF8EC] border border-black rounded">
              <Sliders className="w-4 h-4 text-black" />
            </div>
            <span className="text-xs uppercase font-black tracking-wide">3. Menu Spektrum Audio</span>
          </div>
          <ChevronRight className={`w-4 h-4 text-black transition-transform duration-200 ${activeStep === 3 ? 'rotate-90' : ''}`} />
        </button>
        {activeStep === 3 && (
          <div className="neo-accordion-content space-y-5">
            
            {/* Lapisan Spektrum Title */}
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-black">
              <span>Lapisan Spektrum ({settings.spectrumLayers?.length || 1})</span>
              <button 
                type="button"
                onClick={() => onChange('addSpectrumLayer', true)}
                className="px-2.5 py-1 bg-[#FBBF24] hover:bg-yellow-500 text-black border border-black rounded text-[9px] font-black shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer"
              >
                + Tambah Baru
              </button>
            </div>

            {/* Spectrum Layers List */}
            <div className="space-y-2">
              {(settings.spectrumLayers || []).map((layer: any) => {
                const isActive = settings.activeLayerId === layer.id;
                return (
                  <div 
                    key={layer.id}
                    onClick={() => {
                      onChange('activeLayerId', layer.id);
                    }}
                    className={`flex justify-between items-center border-2 border-black p-2.5 rounded font-black text-xs cursor-pointer shadow-[2px_2px_0px_#000] transition-all hover:translate-y-[-1px] ${
                      isActive ? 'bg-[#3B82F6] text-white shadow-[1px_1px_0px_#000]' : 'bg-[#FFF8E7] text-black hover:bg-amber-50'
                    }`}
                  >
                    <span>{layer.name} ({
                      layer.visualizerType === 'wave' ? 'Gelombang' : 
                      layer.visualizerType === 'circular' ? 'Circular' : 
                      layer.visualizerType === 'symmetric' ? 'Symmetric' : 
                      layer.visualizerType === 'retro' ? 'Retro' : 
                      layer.visualizerType === 'double-circular' ? 'Double Circular' : 
                      layer.visualizerType === 'radial-star' ? 'Starburst' : 
                      layer.visualizerType === 'wave-fill' ? 'Mountain Fill' : 'Batang'
                    })</span>
                    {settings.spectrumLayers.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange('deleteSpectrumLayer', layer.id);
                        }}
                        className={`p-1 border border-black rounded hover:bg-red-500 hover:text-white transition-colors ${
                          isActive ? 'bg-white text-black' : 'bg-red-100 text-red-700'
                        }`}
                        title="Hapus Lapisan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show Spectrum Checkbox */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="wizard-spec-show"
                checked={settings.specShow}
                onChange={(e) => onChange('specShow', e.target.checked)}
                className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
              />
              <label htmlFor="wizard-spec-show" className="text-[10px] font-black uppercase text-black cursor-pointer">
                Tampilkan Spektrum Ini (Aktif)
              </label>
            </div>

            {/* Bentuk Spektrum Aktif */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Bentuk Spektrum Aktif:
              </label>
              <select
                value={settings.visualizerType}
                onChange={(e) => onChange('visualizerType', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded-lg p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
              >
                <option value="wave">Dynamic Audio Wave (Gelombang)</option>
                <option value="bars">Frequency Spectrum Bars (Batang)</option>
                <option value="circular">Circular Radial Ring</option>
                <option value="symmetric">Symmetric Mirror Bars</option>
                <option value="retro">Retro Stacked Blocks</option>
                <option value="double-circular">Double Concentric Circular</option>
                <option value="radial-star">Radial Starburst (Spikes)</option>
                <option value="wave-fill">Mountain Wave Area Fill</option>
                <option value="liquid-wave">✨ Modern Abstract Liquid Wave (Cairan Estetik)</option>
                <option value="glow-particles">✨ Neon Glowing Pulse Particles (Partikel Spektrum)</option>
                <option value="cyber-grid">✨ Cyberpunk Digital Grid Matrix (Cyber)</option>
                <option value="ambient-glow">✨ Lofi Ambient Circle Glow (Glow Lingkaran)</option>
              </select>
            </div>

            {/* Tipe & Warna Spektrum */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                  Tipe Warna:
                </label>
                <select
                  value={settings.barColorType || 'solid'}
                  onChange={(e) => onChange('barColorType', e.target.value)}
                  className="w-full bg-[#FBBF24] border-2 border-black rounded-lg p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
                >
                  <option value="solid">Satu Warna (Solid)</option>
                  <option value="gradient">Dua Warna (Gradasi)</option>
                </select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="text-[10px] font-black uppercase tracking-wider text-black block truncate">
                  Warna Utama:
                </label>
                <div className="flex items-center gap-1.5 bg-white border-2 border-black rounded-lg p-1.5 shadow-[2px_2px_0px_#000] min-w-0">
                  <input
                    type="color"
                    value={settings.barColor.startsWith('#') ? settings.barColor : '#8B5CF6'}
                    onChange={(e) => onChange('barColor', e.target.value)}
                    className="w-7 h-7 border border-black rounded cursor-pointer bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={settings.barColor}
                    onChange={(e) => onChange('barColor', e.target.value)}
                    className="w-full min-w-0 bg-transparent text-xs font-mono font-bold uppercase outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Warna Kedua (Jika Gradasi) */}
            {settings.barColorType === 'gradient' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFF8E7] border-2 border-black p-3.5 rounded-xl shadow-[2px_2px_0px_#000]">
                <div className="space-y-1.5 min-w-0">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black block truncate">
                    Warna Kedua:
                  </label>
                  <div className="flex items-center gap-1.5 bg-white border-2 border-black rounded-lg p-1.5 shadow-[2px_2px_0px_#000] min-w-0">
                    <input
                      type="color"
                      value={settings.barColor2 || '#A78BFA'}
                      onChange={(e) => onChange('barColor2', e.target.value)}
                      className="w-7 h-7 border border-black rounded cursor-pointer bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={settings.barColor2 || '#A78BFA'}
                      onChange={(e) => onChange('barColor2', e.target.value)}
                      className="w-full min-w-0 bg-transparent text-xs font-mono font-bold uppercase outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-black">
                    <span>Sudut Gradasi:</span>
                    <span>{settings.barGradientAngle || 90}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.barGradientAngle || 90}
                    onChange={(e) => onChange('barGradientAngle', parseInt(e.target.value))}
                    className="w-full neo-slider cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Fokus Frekuensi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Fokus Frekuensi Audio:
              </label>
              <select
                value={settings.specFocus}
                onChange={(e) => onChange('specFocus', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded-lg p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
              >
                <option>Semua Frekuensi (Standard Full Range)</option>
                <option>Low-End (Fokus Nada Bass)</option>
                <option>Mid-Range (Fokus Vokal & Instrumen)</option>
                <option>High-End (Fokus Treble & Cymbal)</option>
              </select>
            </div>

            {/* Checkbox Efek Neon Glow & Beat Pulse Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_#000] hover:bg-amber-50 transition-all select-none">
                <input
                  type="checkbox"
                  id="wizard-spec-glow"
                  checked={settings.specGlow}
                  onChange={(e) => onChange('specGlow', e.target.checked)}
                  className="w-4 h-4 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <span className="text-[10px] font-black uppercase text-black flex items-center gap-1">
                  <span>Glow Neon</span>
                  <span>🌟</span>
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-white border-2 border-black rounded-xl cursor-pointer shadow-[2px_2px_0px_#000] hover:bg-amber-50 transition-all select-none">
                <input
                  type="checkbox"
                  id="wizard-spec-pulse"
                  checked={settings.specPulse}
                  onChange={(e) => onChange('specPulse', e.target.checked)}
                  className="w-4 h-4 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <span className="text-[10px] font-black uppercase text-black flex items-center gap-1">
                  <span>Beat Pulse</span>
                  <span>💓</span>
                </span>
              </label>
            </div>

            {/* Kartu Pengontrol Tinggi & Ukuran Batang Spektrum */}
            <div className="bg-[#FFF8E7] border-2 border-black p-3.5 rounded-xl space-y-3 shadow-[2px_2px_0px_#000]">
              <div className="text-[10px] font-black uppercase tracking-wider text-black flex items-center justify-between">
                <span>📏 Tinggi & Panjang Batang Spektrum</span>
                <span className="bg-[#8B5CF6] text-white text-[9px] px-2 py-0.5 rounded border border-black font-mono">
                  {(settings.specHeight * 100).toFixed(0)}%
                </span>
              </div>

              {/* Instant Height Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '🤏 Pendek', val: 0.25 },
                  { label: '📊 Sedang', val: 0.50 },
                  { label: '🚀 Panjang', val: 1.00 },
                  { label: '⚡ Ekstrem', val: 1.50 }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => onChange('specHeight', p.val)}
                    className={`py-1 px-1 border border-black rounded text-[9px] font-black text-center transition-all cursor-pointer ${
                      Math.abs(settings.specHeight - p.val) < 0.05
                        ? 'bg-[#8B5CF6] text-white shadow-[1px_1px_0px_#000]'
                        : 'bg-white text-black hover:bg-amber-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Slider Tinggi Amplitudo Batang */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-black">
                  <span>Tinggi Amplitudo Batang:</span>
                  <span>{settings.specHeight.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.50"
                  step="0.05"
                  value={settings.specHeight}
                  onChange={(e) => onChange('specHeight', parseFloat(e.target.value))}
                  className="w-full neo-slider cursor-pointer"
                />
              </div>

              {/* Slider Lebar Area Spektrum */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-black">
                  <span>Lebar Bentang Spektrum:</span>
                  <span>{settings.specWidthPct.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="3.00"
                  step="0.05"
                  value={settings.specWidthPct}
                  onChange={(e) => onChange('specWidthPct', parseFloat(e.target.value))}
                  className="w-full neo-slider cursor-pointer"
                />
              </div>
            </div>

            {/* Sliders Grid Block (Sisa Kontrol Tambahan) */}
            <div className="space-y-4 pt-1">
              
              {/* Scale */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Skala Spektrum:</span>
                  <span>{settings.specScale}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={settings.specScale}
                  onChange={(e) => onChange('specScale', parseFloat(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Transparansi (Opacity):</span>
                  <span>{settings.specOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.specOpacity}
                  onChange={(e) => onChange('specOpacity', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Rotasi Spektrum (Derajat):</span>
                  <span>{settings.specRotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.specRotation}
                  onChange={(e) => onChange('specRotation', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>

              {/* Speed */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Kecepatan Putar:</span>
                  <span>{settings.specSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="5.00"
                  step="0.10"
                  value={settings.specSpeed}
                  onChange={(e) => onChange('specSpeed', parseFloat(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>
            </div>

            {/* Reverse Dropdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Balik Arah (Reverse)</span>
              <select
                value={settings.specReverse}
                onChange={(e) => onChange('specReverse', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
              >
                <option>Normal (Tidak Dibalik)</option>
                <option>Reverse (Dibalik)</option>
              </select>
            </div>

            {/* Manual Posisi Text Header */}
            <div className="text-[10px] font-black uppercase tracking-wider text-orange-500 pt-2">
              Manual Posisi (Atau Drag &amp; Scroll Zoom di Layar)
            </div>

            {/* Position Coordinates Sliders */}
            <div className="space-y-4">
              {/* Position X */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Posisi X (Kiri-Kanan)</span>
                  <span className="px-2 py-0.5 bg-white border border-black font-mono text-[10px] rounded font-bold">
                    {settings.specPosX.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1280"
                  value={settings.specPosX}
                  onChange={(e) => onChange('specPosX', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>

              {/* Position Y */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Posisi Y (Atas-Bawah)</span>
                  <span className="px-2 py-0.5 bg-white border border-black font-mono text-[10px] rounded font-bold">
                    {settings.specPosY.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="720"
                  value={settings.specPosY}
                  onChange={(e) => onChange('specPosY', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION 4: Motion Graphics & Teks */}
      <div className="flex flex-col">
        <button
          onClick={() => toggleSection(4)}
          className="neo-accordion-header text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-[#FEF8EC] border border-black rounded">
              <Type className="w-4 h-4 text-black" />
            </div>
            <span className="text-xs uppercase font-black tracking-wide">4. Motion Graphics & Teks</span>
          </div>
          <ChevronRight className={`w-4 h-4 text-black transition-transform duration-200 ${activeStep === 4 ? 'rotate-90' : ''}`} />
        </button>
        {activeStep === 4 && (
          <div className="neo-accordion-content space-y-6">
            
            {/* Tampilkan Judul Utama */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="wizard-show-title"
                  checked={settings.showTitle}
                  onChange={(e) => onChange('showTitle', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="wizard-show-title" className="text-[10px] font-black uppercase text-black cursor-pointer">
                  Tampilkan Judul Utama
                </label>
              </div>

              {settings.showTitle && (
                <div className="pl-6 space-y-4 border-l-2 border-black/10">
                  {/* Premium Outline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="wizard-title-outline"
                        checked={settings.titleOutline}
                        onChange={(e) => onChange('titleOutline', e.target.checked)}
                        className="w-4 h-4 border-2 border-black bg-white rounded cursor-pointer accent-black"
                      />
                      <label htmlFor="wizard-title-outline" className="text-[9px] font-bold text-black cursor-pointer">
                        Premium Outline / Shadow 👤 (Anti-Tenggelam)
                      </label>
                    </div>

                    {settings.titleOutline && (
                      <div className="space-y-3 pl-5">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-black">
                            <span>Jarak Bayangan:</span>
                            <span>{settings.shadowDistance}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={settings.shadowDistance}
                            onChange={(e) => onChange('shadowDistance', parseInt(e.target.value))}
                            className="w-full neo-slider"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-black">
                            <span>Transparansi Bayangan:</span>
                            <span>{settings.shadowOpacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.shadowOpacity}
                            onChange={(e) => onChange('shadowOpacity', parseInt(e.target.value))}
                            className="w-full neo-slider"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Beat Glow */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="wizard-title-glow"
                      checked={settings.titleBeatGlow}
                      onChange={(e) => onChange('titleBeatGlow', e.target.checked)}
                      className="w-4 h-4 border-2 border-black bg-white rounded cursor-pointer accent-black"
                    />
                    <label htmlFor="wizard-title-glow" className="text-[9px] font-bold text-black cursor-pointer flex items-center gap-1">
                      <span>Denyut Cahaya Judul (Beat Glow)</span>
                      <span>🌟</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Judul Utama Textarea */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                Judul Utama (Mendukung 2 Baris &amp; 2 Warna)
              </label>
              <textarea
                value={settings.titleText}
                onChange={(e) => onChange('titleText', e.target.value)}
                rows={3}
                placeholder="Enter title text..."
                className="w-full neo-input text-xs font-mono p-2.5"
              />
              <button className="w-full py-1.5 bg-[#FAF6ED] hover:bg-slate-50 border-2 border-black rounded text-[9px] font-bold text-orange-600 shadow-[1px_1px_0px_#000] active:translate-y-[1px]">
                Blok teks lalu klik untuk Beri Warna ke-2
              </button>
            </div>

            {/* Jenis Font */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-black block">Jenis Font</label>
              <select
                value={settings.fontType}
                onChange={(e) => onChange('fontType', e.target.value)}
                className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
              >
                <option>Playfair (Klasik Mewah)</option>
                <option>Poppins (Modern)</option>
                <option>Inter (Sederhana/Sleek)</option>
              </select>
            </div>

            {/* Font size and Colors Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Ukuran Font:</span>
                  <span>{settings.titleFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={settings.titleFontSize}
                  onChange={(e) => onChange('titleFontSize', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>

              <div className="flex justify-around items-center pt-2">
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black uppercase text-black/60 block">Warna 1 (Utama)</span>
                  <input
                    type="color"
                    value={settings.titleColor1}
                    onChange={(e) => onChange('titleColor1', e.target.value)}
                    className="w-8 h-8 rounded border-2 border-black bg-transparent cursor-pointer mx-auto"
                  />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[8px] font-black uppercase text-black/60 block">Warna 2 (Highlight)</span>
                  <input
                    type="color"
                    value={settings.titleColor2}
                    onChange={(e) => onChange('titleColor2', e.target.value)}
                    className="w-8 h-8 rounded border-2 border-black bg-transparent cursor-pointer mx-auto"
                  />
                </div>
              </div>
            </div>

            {/* Animation and Mode Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Animasi Masuk Judul</span>
                <select
                  value={settings.titleAnimation}
                  onChange={(e) => onChange('titleAnimation', e.target.value)}
                  className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                >
                  <option>Tidak Ada / Statis</option>
                  <option>Fade In</option>
                  <option>Zoom In Beat</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">Mode Tampil</span>
                <select
                  value={settings.titleDisplayMode}
                  onChange={(e) => onChange('titleDisplayMode', e.target.value)}
                  className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                >
                  <option>Selalu Tampil di Video</option>
                  <option>Tampil 10 Detik Awal</option>
                </select>
              </div>
            </div>

            {/* Manual Posisi Text Header */}
            <div className="text-[10px] font-black uppercase tracking-wider text-orange-500 pt-2">
              Manual Posisi Judul Utama (Atau Drag di Layar Preview)
            </div>

            {/* Position Coordinates Sliders */}
            <div className="space-y-4">
              {/* Position X */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Posisi X (Kiri - Kanan)</span>
                  <span className="px-2 py-0.5 bg-white border border-black font-mono text-[10px] rounded font-bold">
                    {settings.titlePosX.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1280"
                  value={settings.titlePosX}
                  onChange={(e) => onChange('titlePosX', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>

              {/* Position Y */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-black">
                  <span>Posisi Y (Atas - Bawah)</span>
                  <span className="px-2 py-0.5 bg-white border border-black font-mono text-[10px] rounded font-bold">
                    {settings.titlePosY.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="720"
                  value={settings.titlePosY}
                  onChange={(e) => onChange('titlePosY', parseInt(e.target.value))}
                  className="w-full neo-slider"
                />
              </div>
            </div>

            {/* Tampilkan Progress Bar Lagu */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="wizard-progress-bar"
                  checked={settings.showProgressBar}
                  onChange={(e) => onChange('showProgressBar', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="wizard-progress-bar" className="text-[10px] font-black uppercase text-black cursor-pointer">
                  Tampilkan Progress Bar Lagu
                </label>
              </div>

              {settings.showProgressBar && (
                <div className="pl-6 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="wizard-timecode"
                    checked={settings.showTimecode}
                    onChange={(e) => onChange('showTimecode', e.target.checked)}
                    className="w-4 h-4 border-2 border-black bg-white rounded cursor-pointer accent-black"
                  />
                  <label htmlFor="wizard-timecode" className="text-[9px] font-bold text-black cursor-pointer flex items-center gap-1">
                    <span>Tampilkan Jam / Waktu Lagu</span>
                    <span>⏱️</span>
                    <span>(Timecode)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Tampilkan Running Text */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="wizard-running-text"
                  checked={settings.showRunningText}
                  onChange={(e) => onChange('showRunningText', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="wizard-running-text" className="text-[10px] font-black uppercase text-black cursor-pointer">
                  Tampilkan Running Text (Teks Berjalan)
                </label>
              </div>

              {settings.showRunningText && (
                <div className="pl-6 space-y-4 border-l-2 border-black/10">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-black/60 block">Isi Running Text</span>
                    <input
                      type="text"
                      value={settings.runningTextContent}
                      onChange={(e) => onChange('runningTextContent', e.target.value)}
                      className="w-full neo-input text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-black">
                        <span>Kecepatan:</span>
                        <span>{settings.runningTextSpeed}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        value={settings.runningTextSpeed}
                        onChange={(e) => onChange('runningTextSpeed', parseInt(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[8px] font-black uppercase text-black/60 block">Warna Teks</span>
                      <input
                        type="color"
                        value={settings.runningTextColor}
                        onChange={(e) => onChange('runningTextColor', e.target.value)}
                        className="w-8 h-8 rounded border-2 border-black bg-transparent cursor-pointer mx-auto"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Detak Irama (Pulse Sync) */}
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="wizard-logo-pulse"
                checked={settings.logoPulseSync}
                onChange={(e) => onChange('logoPulseSync', e.target.checked)}
                className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
              />
              <label htmlFor="wizard-logo-pulse" className="text-[10px] font-black uppercase text-black cursor-pointer flex items-center gap-1">
                <span>Logo Detak Irama (Pulse Sync)</span>
                <span>💓</span>
                <span>(Detak BPM)</span>
              </label>
            </div>

            {/* Tampilkan Lower Third / Sosmed */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="wizard-lower-third"
                  checked={settings.showLowerThird}
                  onChange={(e) => onChange('showLowerThird', e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                />
                <label htmlFor="wizard-lower-third" className="text-[10px] font-black uppercase text-black cursor-pointer">
                  Tampilkan Lower Third / Sosmed
                </label>
              </div>

              {settings.showLowerThird && (
                <div className="pl-6 space-y-3 border-l-2 border-black/10">
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] font-bold text-black/60 block">Teks Lower Third / Sosmed</span>
                      <input
                        type="text"
                        value={settings.lowerThirdText}
                        onChange={(e) => onChange('lowerThirdText', e.target.value)}
                        className="w-full neo-input text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-black/60 block">Posisi Sosmed</span>
                      <select
                        value={settings.lowerThirdPos}
                        onChange={(e) => onChange('lowerThirdPos', e.target.value)}
                        className="w-full bg-[#FBBF24] border-2 border-black rounded p-2 font-bold text-xs outline-none"
                      >
                        <option>Kiri Bawah</option>
                        <option>Kanan Bawah</option>
                        <option>Kiri Atas</option>
                        <option>Kanan Atas</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* SECTION 5: Fitur Lirik (LRC) */}
      <div className="flex flex-col">
        <button
          onClick={() => toggleSection(5)}
          className="neo-accordion-header text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1 bg-[#FEF8EC] border border-black rounded shrink-0">
              <FileText className="w-4 h-4 text-black" />
            </div>
            <span className="text-xs uppercase font-black tracking-wide flex items-center gap-1.5 flex-wrap">
              <span>5. Fitur Lirik (LRC)</span>
              {(lrcFileName || (settings.lyricsContent && settings.lyricsContent.trim().length > 0)) && (
                <span className="bg-[#10B981] text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] leading-none uppercase">● LRC AKTIF</span>
              )}
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-black transition-transform duration-200 shrink-0 ${activeStep === 5 ? 'rotate-90' : ''}`} />
        </button>
        {activeStep === 5 && (
          <div className="neo-accordion-content space-y-6">
            
            {/* Tampilkan Lirik LRC (Karaoke) */}
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="wizard-show-lyrics"
                checked={settings.showLyrics}
                onChange={(e) => onChange('showLyrics', e.target.checked)}
                className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
              />
              <label htmlFor="wizard-show-lyrics" className="text-[10px] font-black uppercase text-black cursor-pointer">
                Tampilkan Lirik LRC (Karaoke)
              </label>
            </div>

            {settings.showLyrics && (
              <div className="space-y-6 pt-2">
                
                {/* PENGATURAN API KEY LIRIK */}
                <div className="bg-[#FFF8E7] border-2 border-orange-200 p-4 rounded-lg space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                    PENGATURAN API KEY LIRIK
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-black block">Metode Pembuatan Lirik</span>
                    <select
                      value={settings.lyricMethod}
                      onChange={(e) => onChange('lyricMethod', e.target.value)}
                      className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                    >
                      <option>Gemini AI Studio (Cloud 1.5 Flash)</option>
                      <option>OpenAI Whisper (Local)</option>
                      <option>LrcLib API (Automatic DB Search)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-black block">Gemini API Key</span>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Masukkan API Key Gemini..."
                        value={settings.geminiApiKey}
                        onChange={(e) => onChange('geminiApiKey', e.target.value)}
                        className="flex-1 neo-input text-xs"
                      />
                      <button className="px-3 bg-white border-2 border-black rounded-lg text-black hover:bg-slate-50 shadow-[2px_2px_0px_#000] active:translate-y-[1px]">
                        👁️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unggah File LRC kustom */}
                <div className="space-y-1.5 p-3.5 bg-amber-50 border-2 border-black rounded-lg">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                    Unggah File Lirik (.lrc) Kustom:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder="Gunakan Teks Lirik Di Bawah..."
                      value={lrcFileName || ''}
                      className="flex-1 neo-input text-xs truncate"
                    />
                    <input 
                      type="file" 
                      accept=".lrc" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0] && onLrcUpload) {
                          onLrcUpload(e.target.files[0]);
                        }
                      }} 
                      className="hidden" 
                      id="lrc-file-input" 
                    />
                    <label
                      htmlFor="lrc-file-input"
                      className="px-4 py-2 bg-[#FBBF24] border-2 border-black rounded-lg font-black text-xs text-black cursor-pointer shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] text-center"
                    >
                      Pilih File LRC
                    </label>
                    {lrcFileName && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onLrcUpload) onLrcUpload(null);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] active:translate-y-[1px]"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* DAFTAR LAGU (PEMBUAT LIRIK) */}
                <div className="bg-[#FFF8E7] border-2 border-orange-200 p-4 rounded-lg space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                    DAFTAR LAGU (PEMBUAT LIRIK)
                  </div>
                  <div className="w-full min-h-[40px] flex items-center justify-center text-xs font-bold text-black/40 italic">
                    No track selected
                  </div>
                </div>

                {/* Lirik LRC Terpilih Textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-black">
                    <span>Lirik LRC Lagu Terpilih:</span>
                    <a 
                      href="https://lrclib.net" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-red-500 hover:text-red-600 underline font-bold flex items-center gap-0.5"
                    >
                      <span>🔗 dapatkan lirik disini</span>
                    </a>
                  </div>
                  <div className="text-[9px] font-bold text-black/60 italic">
                    Lagu saat ini: Tidak ada lagu aktif
                  </div>
                  
                  <textarea
                    value={settings.lyricsContent}
                    onChange={(e) => onChange('lyricsContent', e.target.value)}
                    rows={6}
                    placeholder="Ketik lirik format LRC di sini..."
                    className="w-full neo-input text-xs font-mono p-2.5"
                  />

                  {/* Actions buttons */}
                  <div className="flex gap-2 pt-1">
                    <button className="px-4 py-2 bg-[#FBBF24] hover:bg-yellow-500 text-black border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-[1px] flex items-center gap-1.5">
                      <span>💾 Simpan Lirik</span>
                    </button>
                    <button className="px-4 py-2 bg-white hover:bg-slate-50 text-black border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-[1px] flex items-center gap-1.5">
                      <span>📥 Unduh .LRC</span>
                    </button>
                  </div>
                </div>

                {/* Template Visual Lirik */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black block">🌍 Template Visual Lirik</span>
                  <select
                    value={settings.lyricTemplate}
                    onChange={(e) => onChange('lyricTemplate', e.target.value)}
                    className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                  >
                    <option>Standard: Tengah Mengalir (Klasik)</option>
                    <option>Side by Side</option>
                    <option>Scrolling Upward</option>
                  </select>
                </div>

                {/* T Jenis Font Lirik */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black block">T Jenis Font Lirik</span>
                  <select
                    value={settings.lyricFontType}
                    onChange={(e) => onChange('lyricFontType', e.target.value)}
                    className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                  >
                    <option>Poppins (Estetik Modern)</option>
                    <option>Inter (Sederhana/Sleek)</option>
                    <option>Playfair (Klasik Mewah)</option>
                  </select>
                </div>

                {/* Gaya Animasi Lirik */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black block">Gaya Animasi Lirik</span>
                  <select
                    value={settings.lyricAnimation}
                    onChange={(e) => onChange('lyricAnimation', e.target.value)}
                    className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                  >
                    <option>Scroll: Karaoke (Sapu Warna)</option>
                    <option>Fade In Pop</option>
                    <option>Slide Up Smooth</option>
                  </select>
                </div>

                {/* Sliders and styling coordinates */}
                <div className="space-y-4 pt-2 border-t border-black/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lyric Font Size */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-black">
                        <span>Ukuran Font:</span>
                        <span>{settings.lyricFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={settings.lyricFontSize}
                        onChange={(e) => onChange('lyricFontSize', parseInt(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    {/* Lyric Pos X Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-black">
                        <span>Posisi X Lirik:</span>
                        <span>{settings.lyricPosX ?? 640}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1280"
                        value={settings.lyricPosX ?? 640}
                        onChange={(e) => onChange('lyricPosX', parseInt(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    {/* Lyric Pos Y Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-black">
                        <span>Posisi Y Lirik:</span>
                        <span>{settings.lyricPosY ?? 650}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="720"
                        value={settings.lyricPosY ?? 650}
                        onChange={(e) => onChange('lyricPosY', parseInt(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    {/* Active Brightness */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-black">
                        <span>Terang Font Aktif:</span>
                        <span>{settings.lyricActiveBrightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={settings.lyricActiveBrightness}
                        onChange={(e) => onChange('lyricActiveBrightness', parseInt(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    {/* Other Dimness */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-black">
                        <span>Redup Font Lain:</span>
                        <span>{settings.lyricOtherDimness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.lyricOtherDimness}
                        onChange={(e) => onChange('lyricOtherDimness', parseInt(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    {/* Offset timing */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-black">
                        <span>Geser Waktu Lirik:</span>
                        <span>{settings.lyricTimeOffset >= 0 ? '+' : ''}{settings.lyricTimeOffset.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min="-5.0"
                        max="5.0"
                        step="0.1"
                        value={settings.lyricTimeOffset}
                        onChange={(e) => onChange('lyricTimeOffset', parseFloat(e.target.value))}
                        className="w-full neo-slider"
                      />
                    </div>

                    {/* FontWeight */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black block">Ketebalan Font (Style)</span>
                      <select
                        value={settings.lyricFontWeight}
                        onChange={(e) => onChange('lyricFontWeight', e.target.value)}
                        className="w-full bg-[#FBBF24] border-2 border-black rounded p-2.5 font-bold text-xs outline-none"
                      >
                        <option>Light</option>
                        <option>Regular</option>
                        <option>Bold</option>
                        <option>Black/Extra Bold</option>
                      </select>
                    </div>
                  </div>

                  {/* Colors pickers Row */}
                  <div className="flex justify-around items-center pt-4 border-t border-black/5">
                    <div className="text-center space-y-1">
                      <span className="text-[8px] font-black uppercase text-black/60 block">Warna Normal</span>
                      <input
                        type="color"
                        value={settings.lyricNormalColor}
                        onChange={(e) => onChange('lyricNormalColor', e.target.value)}
                        className="w-10 h-8 rounded border-2 border-black bg-transparent cursor-pointer mx-auto"
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-[8px] font-black uppercase text-black/60 block">Warna Aktif</span>
                      <input
                        type="color"
                        value={settings.lyricActiveColor}
                        onChange={(e) => onChange('lyricActiveColor', e.target.value)}
                        className="w-10 h-8 rounded border-2 border-black bg-transparent cursor-pointer mx-auto"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};

