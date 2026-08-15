import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  HelpCircle, 
  CheckCircle2, 
  Music,
  Layers,
  Sliders,
  Video,
  Search
} from 'lucide-react';

interface AppUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppUserGuideModal: React.FC<AppUserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'anticopyright' | 'ratio' | 'faq'>('tour');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Bagaimana cara mencegah klaim hak cipta di YouTube / TikTok?',
      a: 'Aktifkan fitur "Audio Pelapis Anti-Copyright (Layer 2)" di Menu Step 1. Gunakan preset Hujan/Vinyl atau unggah audio pelapis lokal dari komputer Anda, lalu aktifkan Pitch Shift (+3%) dan Automatic Sidechain Ducking.'
    },
    {
      q: 'Bagaimana cara membuat video vertikal untuk YouTube Shorts / TikTok?',
      a: 'Di bagian atas Menu Step 1, klik tombol "9:16 Shorts/TikTok". Kanvas visualizer dan backend render akan secara otomatis dikonversi ke resolusi vertikal 1080x1920 @ 60 FPS.'
    },
    {
      q: 'Bagaimana cara merender banyak lagu sekaligus secara otomatis?',
      a: 'Klik tombol "📁 Batch Multi-Song" di toolbar cepat Step 1. Pilih seluruh berkas lagu MP3 dari folder komputer Anda, lalu klik "Mulai Render Paralel". Studio akan memproses seluruh lagu secara otomatis.'
    },
    {
      q: 'Apa fungsi dari 10-Band EQ & Reverb?',
      a: '10-Band EQ digunakan untuk mengatur karakteristik frekuensi suara (Bass, Mid, Treble) secara presisi, sedangkan efek Reverb memberikan kehangatan akustik ruang pada audio hasil ekspor.'
    },
    {
      q: 'Apakah aplikasi menggunakan akselerasi GPU hardware?',
      a: 'Ya! Audira Studio secara otomatis mendeteksi encoder GPU fisik pada komputer Anda (NVIDIA NVENC, AMD AMF, atau Intel QSV) untuk mempercepat proses render video MP4 hingga 5x lebih cepat.'
    }
  ];

  const filteredFaqs = faqs.filter(
    item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) || item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#FAF6ED] border-4 border-black rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#000] overflow-hidden">
        
        {/* Header Modal */}
        <div className="p-4 bg-[#FBBF24] border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-amber-400 shadow-[2px_2px_0px_#000]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-black flex items-center gap-2">
                <span>Panduan Penggunaan Audira Studio Pro</span>
                <span className="bg-black text-amber-400 text-[9px] px-2 py-0.5 rounded font-mono">V2.0 MANUAL</span>
              </h2>
              <p className="text-xs font-bold text-black/70">
                Petunjuk praktis penggunaan studio, strategi Anti-Copyright, dan pengoperasian fitur.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black bg-amber-100/50 p-2 gap-2 overflow-x-auto">
          {[
            { id: 'tour', label: '🚀 Tur 5-Langkah Cepat', icon: Sparkles },
            { id: 'anticopyright', label: '🛡️ Strategi Anti-Copyright', icon: ShieldCheck },
            { id: 'ratio', label: '📱 Rasio Layar Video', icon: Smartphone },
            { id: 'faq', label: '❓ FAQ & Solusi Masalah', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#8B5CF6] text-white shadow-[3px_3px_0px_#000]'
                    : 'bg-white text-black hover:bg-amber-200 shadow-[1.5px_1.5px_0px_#000]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Tab 1: Tur 5-Langkah Cepat */}
          {activeTab === 'tour' && (
            <div className="space-y-4">
              <div className="bg-purple-100 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_#000]">
                <h3 className="text-sm font-black uppercase text-purple-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Alur Kerja Cepat Studio Dalam 5 Langkah</span>
                </h3>
                <p className="text-xs font-bold text-purple-900 mt-1">
                  Ikuti 5 langkah sederhana berikut untuk menghasilkan video musik spektakuler siap upload:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: 'Langkah 1',
                    title: 'Pilih Audio & Latar Belakang',
                    desc: 'Unggah file lagu utama (MP3/WAV) dan gambar/video latar belakang. Gunakan tombol download YouTube jika belum memiliki file audio lokal.',
                    icon: Music,
                    color: 'bg-amber-100 border-amber-400'
                  },
                  {
                    step: 'Langkah 2',
                    title: 'Pilih Gaya Spektrum & VFX',
                    desc: 'Buka Step 2 & Step 3 untuk memilih bentuk spektrum (Bars, Waveform, Circular, Bars 3D) serta aktifkan efek Beat Shake & Glitch.',
                    icon: Sliders,
                    color: 'bg-purple-100 border-purple-400'
                  },
                  {
                    step: 'Langkah 3',
                    title: 'Impor Lirik LRC & Logo',
                    desc: 'Unggah file lirik berdurasi (.lrc) untuk mengaktifkan teks karaoke Apple Music Dual-Line Blur dan logo lingkaran berdenyut.',
                    icon: Layers,
                    color: 'bg-teal-100 border-teal-400'
                  },
                  {
                    step: 'Langkah 4',
                    title: 'Aktifkan Pelapis Anti-Copyright',
                    desc: 'Di Step 1, aktifkan Audio Pelapis Layer 2. Pilih preset Hujan/Vinyl Lofi atau unggah file audio pelapis lokal dari komputer.',
                    icon: ShieldCheck,
                    color: 'bg-emerald-100 border-emerald-400'
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className={`p-4 border-2 border-black rounded-xl space-y-2 shadow-[3px_3px_0px_#000] ${item.color}`}>
                      <div className="flex items-center justify-between">
                        <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          {item.step}
                        </span>
                        <Icon className="w-5 h-5 text-black/70" />
                      </div>
                      <h4 className="text-xs font-black text-black uppercase">{item.title}</h4>
                      <p className="text-[11px] font-bold text-black/75 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Step 5 Banner */}
              <div className="p-4 bg-emerald-400 border-2 border-black rounded-xl flex items-center justify-between shadow-[3px_3px_0px_#000]">
                <div>
                  <span className="bg-black text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    Langkah 5 (Akhir)
                  </span>
                  <h4 className="text-sm font-black text-black uppercase mt-1">Mulai Ekspor Render MP4 @ 60 FPS</h4>
                  <p className="text-xs font-bold text-black/80">Tekan tombol "MULAI RENDER MP4" di bagian bawah studio. GPU akan memproses video otomatis.</p>
                </div>
                <Video className="w-8 h-8 text-black shrink-0" />
              </div>
            </div>
          )}

          {/* Tab 2: Strategi Anti-Copyright */}
          {activeTab === 'anticopyright' && (
            <div className="space-y-4">
              <div className="bg-emerald-100 border-2 border-black p-4 rounded-xl shadow-[2px_2px_0px_#000]">
                <h3 className="text-sm font-black uppercase text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Strategi Penyamaran Sidik Jari Audio (Content ID AI Bypass)</span>
                </h3>
                <p className="text-xs font-bold text-emerald-900 mt-1">
                  Kombinasi fitur rahasia di Audira Studio untuk membuat konten Anda 100% aman dari deteksi otomatis AI:
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: '1. Suara Pelapis Anti-Copyright (Layer 2)',
                    desc: 'Mencampurkan frekuensi audio pelapis (seperti derik vinyl, hujan halus, atau lagu pelapis lokal) di bawah lagu utama pada volume 15%. Ini akan mengubah bentuk gelombang frekuensi sidik jari Content ID tanpa mengurangi keindahan lagu utama.'
                  },
                  {
                    title: '2. Automatic Sidechain Ducking',
                    desc: 'Kompresor sidechain secara otomatis menipiskan volume audio pelapis saat vokal lagu utama terdengar terang, dan membesarkannya saat lagu hening.'
                  },
                  {
                    title: '3. Pitch Shift +3% & Micro-Equalizer',
                    desc: 'Menggeser nada lagu utama sebesar +3% dan memotong frekuensi ekstrem di atas 16kHz & di bawah 40Hz agar sidik jari algoritma tidak dapat mencocokkan lagu sampel.'
                  }
                ].map((strat, idx) => (
                  <div key={idx} className="p-3.5 bg-white border-2 border-black rounded-xl space-y-1 shadow-[2px_2px_0px_#000]">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{strat.title}</span>
                    </div>
                    <p className="text-xs font-bold text-black/75 pl-6">{strat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Rasio Layar Video */}
          {activeTab === 'ratio' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    ratio: '16:9 Widescreen',
                    label: 'YouTube Video & TV',
                    res: '1920 x 1080 (HD / 4K)',
                    desc: 'Format horizontal standar untuk video utama YouTube, TV, dan layar monitor desktop.',
                    color: 'bg-purple-100 border-purple-400'
                  },
                  {
                    ratio: '9:16 Vertikal',
                    label: 'Shorts, TikTok & IG Reels',
                    res: '1080 x 1920 (Full HD)',
                    desc: 'Format vertikal ponsel pintar untuk menjangkau pemirsa YouTube Shorts, TikTok, dan Instagram Reels.',
                    color: 'bg-pink-100 border-pink-400'
                  },
                  {
                    ratio: '1:1 Persegi',
                    label: 'Instagram Feed & Spotify',
                    res: '1080 x 1080 (Square)',
                    desc: 'Format persegi untuk postingan feed Instagram, Facebook, dan visualizer Spotify Canvas.',
                    color: 'bg-amber-100 border-amber-400'
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 border-2 border-black rounded-xl space-y-2 shadow-[3px_3px_0px_#000] ${item.color}`}>
                    <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                      {item.ratio}
                    </span>
                    <h4 className="text-xs font-black text-black uppercase">{item.label}</h4>
                    <p className="text-[10px] font-mono font-bold text-purple-900 bg-white/70 px-2 py-1 rounded border border-black/20">
                      {item.res}
                    </p>
                    <p className="text-[11px] font-bold text-black/75">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: FAQ Interaktif */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-black/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari pertanyaan atau kata kunci (cth: GPU, Content ID, Shorts)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-xl pl-9 pr-4 py-2.5 font-bold text-xs shadow-[2px_2px_0px_#000] outline-none"
                />
              </div>

              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-black rounded-xl space-y-1.5 shadow-[2px_2px_0px_#000]">
                      <h4 className="text-xs font-black text-black uppercase flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-xs font-bold text-black/75 pl-6 leading-relaxed">{faq.a}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white border-2 border-black rounded-xl font-bold text-xs text-black/50">
                    Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian Anda.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-amber-100 border-t-2 border-black flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-black/70">
            Audira Studio Pro © 2026 by AUDIRA (Agus Dwi R)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-black shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
