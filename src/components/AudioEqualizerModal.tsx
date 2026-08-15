import React, { useState } from 'react';
import { Sliders, Check, X, RefreshCw } from 'lucide-react';

interface AudioEqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEQ: (eqSettings: { gains: number[]; reverbGain: number; spatialWidth: number }) => void;
}

export const eqPresets = [
  { name: 'Flat (Standard)', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Booster ⚡', gains: [8, 6, 4, 2, 0, 0, 1, 2, 3, 4] },
  { name: 'Vocal Crystal 🎤', gains: [-2, -1, 0, 2, 4, 6, 5, 3, 1, 0] },
  { name: 'EDM Electronic 🎧', gains: [6, 5, 2, 0, -2, 2, 4, 6, 5, 4] },
  { name: 'Acoustic Warmth 🎸', gains: [3, 2, 1, 2, 3, 2, 1, 2, 3, 2] }
];

export const bandFreqs = ['31Hz', '62Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const AudioEqualizerModal: React.FC<AudioEqualizerModalProps> = ({
  isOpen,
  onClose,
  onApplyEQ
}) => {
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [reverbGain, setReverbGain] = useState<number>(20);
  const [spatialWidth, setSpatialWidth] = useState<number>(50);
  const [selectedPreset, setSelectedPreset] = useState<string>('Flat (Standard)');

  if (!isOpen) return null;

  const handleGainChange = (index: number, val: number) => {
    const updated = [...gains];
    updated[index] = val;
    setGains(updated);
  };

  const handleSelectPreset = (pName: string) => {
    setSelectedPreset(pName);
    const preset = eqPresets.find(p => p.name === pName);
    if (preset) {
      setGains([...preset.gains]);
    }
  };

  const handleReset = () => {
    setGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setReverbGain(0);
    setSpatialWidth(50);
    setSelectedPreset('Flat (Standard)');
  };

  const handleSaveAndApply = () => {
    onApplyEQ({ gains, reverbGain, spatialWidth });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="bg-[#FEF8EC] border-[4px] border-black rounded-2xl w-full max-w-4xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-purple-600 text-white border-b-[3px] border-black flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_#000]">
              <Sliders className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">10-Band Graphic Equalizer & DSP Enhancer</h2>
              <p className="text-[10px] font-bold text-purple-200">Kustomisasi frekuensi suara bass, mid, treble, serta penambahan reverb & spatial 3D audio.</p>
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
          {/* Preset Buttons Bar */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-black block">Preset Suara Cepat:</span>
            <div className="flex gap-2 flex-wrap">
              {eqPresets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p.name)}
                  className={`px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedPreset === p.name
                      ? 'bg-purple-600 text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-black hover:bg-amber-100 shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 10 Band Sliders Grid */}
          <div className="p-5 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] space-y-4">
            <div className="flex justify-between items-center text-xs font-black text-black">
              <span>📊 10-BAND GRAPHIC EQUALIZER (-12dB s/d +12dB)</span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-black rounded text-[10px] font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Flat
              </button>
            </div>

            <div className="grid grid-cols-10 gap-2 items-end pt-4 pb-2">
              {bandFreqs.map((freq, idx) => (
                <div key={freq} className="flex flex-col items-center gap-2">
                  <span className="font-mono text-[10px] font-black text-purple-700">
                    {gains[idx] > 0 ? `+${gains[idx]}` : gains[idx]}dB
                  </span>
                  
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gains[idx]}
                    onChange={(e) => handleGainChange(idx, parseInt(e.target.value))}
                    className="h-36 neo-slider cursor-pointer accent-purple-600"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />

                  <span className="font-mono text-[9px] font-bold text-black/70">{freq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spatial 3D Audio & Reverb Expander */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spatial 3D Audio Width */}
            <div className="p-4 bg-[#FEF3C7] border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between items-center text-xs font-black uppercase text-amber-950">
                <span>🌐 Spatial 3D Sound Expansion</span>
                <span>{spatialWidth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={spatialWidth}
                onChange={(e) => setSpatialWidth(parseInt(e.target.value))}
                className="w-full neo-slider cursor-pointer"
              />
              <p className="text-[9px] font-bold text-amber-800">Memperluas stereo soundstage untuk menghasilkan efek ruang 3D yang megah.</p>
            </div>

            {/* Reverb Ambience */}
            <div className="p-4 bg-purple-50 border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between items-center text-xs font-black uppercase text-purple-950">
                <span>🏰 Reverb Concert Hall Ambience</span>
                <span>{reverbGain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reverbGain}
                onChange={(e) => setReverbGain(parseInt(e.target.value))}
                className="w-full neo-slider cursor-pointer"
              />
              <p className="text-[9px] font-bold text-purple-800">Menambahkan pantulan gema halus seolah musik dimainkan di aula konser besar.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t-[3px] border-black flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black border-2 border-black rounded-lg font-black text-xs uppercase shadow-[2px_2px_0px_#000]"
          >
            Batal
          </button>
          <button
            onClick={handleSaveAndApply}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white border-2 border-black rounded-lg font-black text-xs uppercase shadow-[3px_3px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Pengaturan EQ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
