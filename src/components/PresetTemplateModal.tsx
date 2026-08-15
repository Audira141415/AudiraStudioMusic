import React, { useState } from 'react';
import { Sparkles, Download, Upload, Check, FolderOpen, X, BookOpen } from 'lucide-react';

interface PresetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: any;
  onApplyPreset: (presetSettings: any) => void;
}

export const builtInPresets = [
  {
    id: 'lofi_chill',
    name: '☕ Lofi Chill Beats',
    category: 'Lofi / Chill',
    desc: 'Warna pastel lembut, efek film grain 4K, spektrum gelombang halus, dan teks Poppins minimalis.',
    settings: {
      bgColor: '#181825',
      specColor: '#F5C2E7',
      barColorType: 'gradient',
      barColor2: '#CBA6F7',
      visualizerType: 'wave-fill',
      partCosmic: true,
      partLeaves: true,
      coverTextureFilter: 'Cinematic Film Grain',
      enableDualLayerCover: true,
      coverBadgeStyle: 'Floating Glassmorphism',
      fontType: 'Poppins (Modern)',
      titleColor1: '#F5C2E7',
      titleColor2: '#CBA6F7'
    }
  },
  {
    id: 'phonk_edm',
    name: '⚡ Phonk / EDM Nightcore',
    category: 'EDM / Bass',
    desc: 'Warna neon cyan & magenta, denyut beat pulse tinggi, spektrum lingkaran ganda, dan filter retro VHS.',
    settings: {
      bgColor: '#05050A',
      specColor: '#06B6D4',
      barColorType: 'gradient',
      barColor2: '#EC4899',
      visualizerType: 'double-circular',
      specGlow: true,
      specPulse: true,
      musicPulse: true,
      beatZoom: 12.0,
      partConfetti: true,
      partSparks: true,
      coverTextureFilter: 'Retro VHS Scanlines',
      enableDualLayerCover: true,
      coverBadgeStyle: 'Vinyl Sleeve (Piringan Hitam Keluar)',
      fontType: 'Inter (Sederhana/Sleek)',
      titleColor1: '#06B6D4',
      titleColor2: '#EC4899'
    }
  },
  {
    id: 'islamic_aesthetic',
    name: '🕌 Sholawat / Islamic Aesthetic',
    category: 'Religi / Islamic',
    desc: 'Warna keemasan elegan, efek pola bintang/bulan sabit, spektrum simetris, dan teks Playfair klasik.',
    settings: {
      bgColor: '#062C1B',
      specColor: '#FBBF24',
      barColorType: 'gradient',
      barColor2: '#F59E0B',
      visualizerType: 'symmetric',
      specGlow: true,
      vfxIslamic: true,
      vfxMoon: true,
      partStar: true,
      coverTextureFilter: 'None',
      enableDualLayerCover: true,
      coverBadgeStyle: 'Rounded Card (3D Soft Shadow)',
      fontType: 'Playfair (Klasik Mewah)',
      titleColor1: '#FBBF24',
      titleColor2: '#F59E0B'
    }
  },
  {
    id: 'acoustic_sunset',
    name: '🎸 Acoustic Sunset Warmth',
    category: 'Acoustic / Indie',
    desc: 'Warna kehangatan jingga sunset, efek daun gugur, spektrum gelombang mountain fill, dan frame kaset pita retro.',
    settings: {
      bgColor: '#2E1065',
      specColor: '#F97316',
      barColorType: 'gradient',
      barColor2: '#FACC15',
      visualizerType: 'wave-fill',
      partLeaves: true,
      enableDualLayerCover: true,
      coverBadgeStyle: 'Vintage Cassette Tape (Retro Frame)',
      enableKenBurns: true,
      fontType: 'Playfair (Klasik Mewah)',
      titleColor1: '#F97316',
      titleColor2: '#FACC15'
    }
  }
];

export const PresetTemplateModal: React.FC<PresetTemplateModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApplyPreset
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('lofi_chill');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSettings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audira_preset_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onApplyPreset(imported);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      } catch (err) {
        alert("❌ File Preset JSON tidak valid!");
      }
    };
    reader.readAsText(file);
  };

  const handleApplySelected = () => {
    const preset = builtInPresets.find(p => p.id === selectedPresetId);
    if (preset) {
      onApplyPreset(preset.settings);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="bg-[#FEF8EC] border-[4px] border-black rounded-2xl w-full max-w-4xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#FBBF24] border-b-[3px] border-black flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase text-black">Preset Template Studio (.json)</h2>
              <p className="text-[10px] font-bold text-black/70">Pilih template desain 1-klik atau impor/ekspor preset kustom Anda.</p>
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
          {/* Action Bar (Export / Import Custom JSON) */}
          <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-purple-600" />
                <span>Impor & Ekspor Preset (.json)</span>
              </h3>
              <p className="text-[10px] font-bold text-black/60">Simpan konfigurasi studio Anda ke file JSON atau muat file preset buatan creator lain.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Preset</span>
              </button>

              <label className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center">
                <Upload className="w-4 h-4" />
                <span>Impor Preset</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Built-in Presets Grid */}
          <div className="space-y-3">
            <h3 className="font-black text-xs uppercase text-black flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Pustaka Template Bawaan Studio (1-Klik Apply)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {builtInPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-4 border-2 border-black rounded-xl cursor-pointer transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between gap-3 ${
                      isSelected ? 'bg-amber-100 ring-4 ring-black/20' : 'bg-white hover:bg-amber-50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm text-black">{preset.name}</span>
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-900 border border-black rounded font-black text-[9px] uppercase">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs text-black/70 font-medium leading-relaxed">{preset.desc}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-black/10 text-[10px] font-bold">
                      <span className="text-black/50">Klik untuk memilih</span>
                      {isSelected && (
                        <span className="text-emerald-700 font-black flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-600" /> Terpilih
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t-[3px] border-black flex justify-between items-center">
          <span className="text-xs font-bold text-black/60">
            {copiedSuccess ? '✨ Preset Berhasil Di-impor & Di-terapkan!' : 'Pilih preset di atas lalu klik Terapan Template'}
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
            >
              Tutup
            </button>
            <button
              onClick={handleApplySelected}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Terapkan Template Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
