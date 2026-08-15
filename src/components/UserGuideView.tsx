import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  HelpCircle, 
  CheckCircle2, 
  Music,
  Layers,
  Sliders,
  Video,
  Search,
  ArrowRight,
  ExternalLink,
  Cpu
} from 'lucide-react';

interface UserGuideViewProps {
  onNavigateToStudio: () => void;
  onNavigateToQueue: () => void;
  onNavigateToHistory: () => void;
  onApplyRatio?: (ratio: string) => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({
  onNavigateToStudio,
  onNavigateToQueue,
  onNavigateToHistory,
  onApplyRatio
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'anticopyright' | 'ratio' | 'faq'>('tour');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: 'Bagaimana cara mencegah klaim hak cipta di YouTube / TikTok?',
      a: 'Aktifkan fitur "Audio Pelapis Anti-Copyright (Layer 2)" di Step 1. Gunakan preset Hujan/Vinyl atau unggah audio pelapis lokal, lalu aktifkan Pitch Shift (+3%) dan Automatic Sidechain Ducking.'
    },
    {
      q: 'Bagaimana cara membuat video vertikal untuk YouTube Shorts / TikTok?',
      a: 'Di bagian atas Step 1 Studio, klik tombol "9:16 Shorts/TikTok". Kanvas visualizer dan backend render akan dikonversi ke resolusi vertikal 1080x1920 @ 60 FPS.'
    },
    {
      q: 'Bagaimana cara merender banyak lagu sekaligus secara otomatis?',
      a: 'Klik tombol "📁 Batch Multi-Song" di toolbar cepat Step 1. Pilih seluruh berkas lagu MP3 dari folder komputer Anda, lalu klik "Mulai Render Paralel". Studio akan memproses seluruh lagu secara otomatis.'
    },
    {
      q: 'Bagaimana integrasi antara Halaman Queue & Riwayat?',
      a: 'Tugas yang masuk ke Queue secara otomatis tersambung ke halaman Riwayat. Anda dapat memantau progres render dari kedua halaman dan membuka folder hasil ekspor MP4 dengan 1-klik.'
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
    <div className="min-h-full bg-[#FAF6ED] p-6 space-y-6 animate-in fade-in">
      
      {/* Top Banner Header */}
      <div className="bg-[#FBBF24] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_#000] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-amber-400 shadow-[3px_3px_0px_#000] shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-black uppercase tracking-wider">
                Panduan Penggunaan Audira Studio Pro
              </h1>
              <span className="bg-black text-amber-400 text-[10px] px-2.5 py-0.5 rounded font-mono font-black border border-amber-400/30">
                FULL MANUAL V2.0
              </span>
            </div>
            <p className="text-xs font-bold text-black/75 mt-0.5">
              Pusat petunjuk penggunaan studio, strategi penyamaran Anti-Copyright, panduan rasio layar, dan FAQ interaktif.
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onNavigateToStudio}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            <span>BUKA STUDIO WORKSPACE</span>
          </button>

          <button
            onClick={onNavigateToQueue}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>LIHAT QUEUE ANTREAN</span>
          </button>

          <button
            onClick={onNavigateToHistory}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            <span>RIWAYAT EKSPOR</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div className="flex border-b-3 border-black bg-amber-100/60 p-2 gap-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] overflow-x-auto">
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
              className={`px-5 py-2.5 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#8B5CF6] text-white shadow-[3px_3px_0px_#000]'
                  : 'bg-white text-black hover:bg-amber-200 shadow-[1.5px_1.5px_0px_#000]'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Documentation Body */}
      <div className="space-y-6">

        {/* Tab 1: Tur 5-Langkah Cepat */}
        {activeTab === 'tour' && (
          <div className="space-y-6">
            <div className="bg-purple-100 border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000] flex justify-between items-center">
              <div>
                <h3 className="text-base font-black uppercase text-purple-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Alur Kerja Cepat Studio Dalam 5 Langkah Mudah</span>
                </h3>
                <p className="text-xs font-bold text-purple-900 mt-1">
                  Ikuti alur praktis ini untuk memproduksi video visualizer musik berkualitas tinggi:
                </p>
              </div>

              <button
                onClick={onNavigateToStudio}
                className="px-4 py-2 bg-black text-amber-400 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-purple-900 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>Mulai Sekarang di Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  step: 'Langkah 1',
                  title: 'Upload Audio Utama & Latar Belakang',
                  desc: 'Pilih file lagu utama (MP3/WAV/FLAC) dan gambar/video latar belakang. Jika belum memiliki file lokal, gunakan fitur "+ Download URL / YouTube" di Step 1.',
                  icon: Music,
                  color: 'bg-amber-50 border-amber-400'
                },
                {
                  step: 'Langkah 2',
                  title: 'Kustomisasi Gaya Spektrum & VFX Beat Shake',
                  desc: 'Pilih tipe spektrum visualizer (Bars, Waveform, Circular, 3D Bars), efek kedipan neon, dan aktifkan Beat Shake agar kanvas berdenyut sesuai bass lagu.',
                  icon: Sliders,
                  color: 'bg-purple-50 border-purple-400'
                },
                {
                  step: 'Langkah 3',
                  title: 'Impor Lirik LRC & Logo Lingkaran',
                  desc: 'Unggah file lirik berdurasi (.lrc) untuk mengaktifkan animasi teks karaoke Apple Music Dual-Line Blur dan logo lingkaran berdenyut di tengah visualizer.',
                  icon: Layers,
                  color: 'bg-teal-50 border-teal-400'
                },
                {
                  step: 'Langkah 4',
                  title: 'Aktifkan Audio Pelapis Anti-Copyright (Layer 2)',
                  desc: 'Di Step 1, aktifkan Audio Pelapis Layer 2. Pilih preset Hujan/Vinyl Lofi atau unggah file audio pelapis lokal Anda untuk menyamarkan sidik jari Content ID AI.',
                  icon: ShieldCheck,
                  color: 'bg-emerald-50 border-emerald-400'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className={`p-5 border-3 border-black rounded-2xl space-y-3 shadow-[4px_4px_0px_#000] ${item.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                        {item.step}
                      </span>
                      <Icon className="w-6 h-6 text-black/75" />
                    </div>
                    <h4 className="text-sm font-black text-black uppercase">{item.title}</h4>
                    <p className="text-xs font-bold text-black/80 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Step 5 Banner */}
            <div className="p-5 bg-emerald-400 border-3 border-black rounded-2xl flex items-center justify-between shadow-[4px_4px_0px_#000]">
              <div>
                <span className="bg-black text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                  Langkah 5 (Akhir)
                </span>
                <h4 className="text-base font-black text-black uppercase mt-1">Mulai Ekspor Video MP4 @ 60 FPS</h4>
                <p className="text-xs font-bold text-black/85">Tekan tombol "MULAI RENDER MP4" di bagian bawah studio. GPU akan memproses video secara otomatis dan tersimpan di Riwayat & Queue.</p>
              </div>
              <button
                onClick={onNavigateToStudio}
                className="px-5 py-3 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer shrink-0 flex items-center gap-2"
              >
                <Video className="w-5 h-5 text-emerald-400" />
                <span>MULAI RENDER SEKARANG</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Strategi Anti-Copyright */}
        {activeTab === 'anticopyright' && (
          <div className="space-y-5">
            <div className="bg-emerald-100 border-3 border-black p-5 rounded-2xl shadow-[4px_4px_0px_#000]">
              <h3 className="text-base font-black uppercase text-emerald-950 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span>Strategi Penyamaran Sidik Jari Audio (Content ID AI Bypass)</span>
              </h3>
              <p className="text-xs font-bold text-emerald-900 mt-1">
                Gunakan kombinasi fitur penyamar frekuensi berikut agar konten Anda 100% aman dari deteksi otomatis algoritma YouTube/TikTok:
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: '1. Audio Latar Pelapis Anti-Copyright (Layer 2)',
                  desc: 'Mencampurkan frekuensi audio pelapis (seperti derik vinyl, hujan halus, atau lagu pelapis lokal) di bawah lagu utama pada volume 15%. Ini akan mengubah bentuk gelombang frekuensi sidik jari Content ID tanpa mengurangi kejelasan lagu utama.'
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
                <div key={idx} className="p-4 bg-white border-3 border-black rounded-xl space-y-1.5 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-black">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{strat.title}</span>
                  </div>
                  <p className="text-xs font-bold text-black/80 pl-7 leading-relaxed">{strat.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-yellow-100 border-2 border-black rounded-xl text-center">
              <button
                onClick={onNavigateToStudio}
                className="px-6 py-2.5 bg-black text-amber-400 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                🛡️ Aktifkan Layer 2 Anti-Copyright di Studio
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Rasio Layar Video */}
        {activeTab === 'ratio' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  id: '16:9',
                  ratio: '16:9 Widescreen',
                  label: 'YouTube Video & TV',
                  res: '1920 x 1080 (HD / 4K)',
                  desc: 'Format horizontal standar untuk video utama YouTube, TV, dan layar monitor desktop.',
                  color: 'bg-purple-100 border-purple-400'
                },
                {
                  id: '9:16',
                  ratio: '9:16 Vertikal',
                  label: 'Shorts, TikTok & IG Reels',
                  res: '1080 x 1920 (Full HD)',
                  desc: 'Format vertikal ponsel pintar untuk menjangkau pemirsa YouTube Shorts, TikTok, dan Instagram Reels.',
                  color: 'bg-pink-100 border-pink-400'
                },
                {
                  id: '1:1',
                  ratio: '1:1 Persegi',
                  label: 'Instagram Feed & Spotify',
                  res: '1080 x 1080 (Square)',
                  desc: 'Format persegi untuk postingan feed Instagram, Facebook, dan visualizer Spotify Canvas.',
                  color: 'bg-amber-100 border-amber-400'
                }
              ].map((item, idx) => (
                <div key={idx} className={`p-5 border-3 border-black rounded-2xl space-y-3 shadow-[4px_4px_0px_#000] ${item.color} flex flex-col justify-between`}>
                  <div className="space-y-2">
                    <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                      {item.ratio}
                    </span>
                    <h4 className="text-sm font-black text-black uppercase">{item.label}</h4>
                    <p className="text-xs font-mono font-bold text-purple-950 bg-white/80 px-2.5 py-1 rounded border border-black/20">
                      {item.res}
                    </p>
                    <p className="text-xs font-bold text-black/80">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (onApplyRatio) onApplyRatio(item.id);
                      onNavigateToStudio();
                    }}
                    className="w-full py-2 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Pilih Rasio Ini</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: FAQ Interaktif */}
        {activeTab === 'faq' && (
          <div className="space-y-5">
            <div className="relative">
              <Search className="w-5 h-5 text-black/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pertanyaan atau kata kunci (cth: GPU, Content ID, Shorts, Queue, MP4)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-3 border-black rounded-2xl pl-10 pr-4 py-3 font-bold text-xs shadow-[3px_3px_0px_#000] outline-none"
              />
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="p-5 bg-white border-3 border-black rounded-2xl space-y-2 shadow-[3px_3px_0px_#000]">
                    <h4 className="text-xs font-black text-black uppercase flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs font-bold text-black/80 pl-7 leading-relaxed">{faq.a}</p>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center bg-white border-3 border-black rounded-2xl font-bold text-xs text-black/50 shadow-[3px_3px_0px_#000]">
                  Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian Anda.
                </div>
              )}
            </div>

            {/* Hardware & Diagnostics Footer Widget */}
            <div className="p-5 bg-slate-900 border-3 border-black rounded-2xl text-white space-y-2 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>Hardware Acceleration Status</span>
                </span>
                <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded">
                  FFMPEG OK
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Sistem secara otomatis mengaktifkan hardware encoder GPU (NVIDIA NVENC, AMD AMF, QSV) saat merender video MP4 @ 60 FPS.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
