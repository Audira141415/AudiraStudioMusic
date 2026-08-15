import { useState, useEffect, useRef } from 'react';
import { 
  Disc, Music, Layers, Sparkles, Volume2, Video, Sliders, 
  ArrowRight, Play, Pause, LogIn, Image as ImageIcon, Check, X,
  ChevronDown, Activity, Flame
} from 'lucide-react';
import { LoginScreen } from './LoginScreen';

interface LandingPageViewProps {
  onEnterStudio: () => void;
}

export function LandingPageView({ onEnterStudio }: LandingPageViewProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<'neon' | 'retro' | 'lofi' | 'minimal'>('neon');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    onEnterStudio();
  };

  // Preset Color Palettes for Live Canvas Demo
  const presets = {
    neon: { name: '🔥 Neon Cyberpunk', color1: '#8B5CF6', color2: '#06B6D4', particle: '#EC4899', bg: '#0F172A' },
    retro: { name: '🎧 Retro Wave 80s', color1: '#F59E0B', color2: '#EF4444', particle: '#FFDE4D', bg: '#1E1B4B' },
    lofi: { name: '✨ Lo-Fi Chill', color1: '#10B981', color2: '#3B82F6', particle: '#6EE7B7', bg: '#064E3B' },
    minimal: { name: '⚡ Minimalist Studio', color1: '#000000', color2: '#ffffff', particle: '#FFDE4D', bg: '#18181B' }
  };

  // Interactive Live Spectrum Demo Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentConfig = presets[selectedPreset];

      // Draw background fill
      ctx.fillStyle = currentConfig.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const numBars = 48;
      const barWidth = (canvas.width - numBars * 4) / numBars;

      phase += isPlayingDemo ? 0.08 : 0.01;

      // Draw Spectrum Bars
      for (let i = 0; i < numBars; i++) {
        const heightMultiplier = isPlayingDemo 
          ? (Math.sin(phase + i * 0.25) * 0.4 + Math.cos(phase * 1.5 + i * 0.1) * 0.35 + 0.45)
          : (Math.sin(phase + i * 0.1) * 0.1 + 0.15);

        const barHeight = Math.max(10, heightMultiplier * (canvas.height * 0.65));
        const x = i * (barWidth + 4) + 8;
        const y = canvas.height - barHeight - 20;

        // Create Gradient Fill for Bars
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, currentConfig.color1);
        grad.addColorStop(1, currentConfig.color2);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();

        // Top Neon Glow Cap
        ctx.fillStyle = currentConfig.particle;
        ctx.fillRect(x, y - 4, barWidth, 3);
      }

      // Draw Floating Sparkle Particles
      for (let p = 0; p < 12; p++) {
        const px = (Math.sin(phase * 0.5 + p * 1.2) * 0.5 + 0.5) * canvas.width;
        const py = (Math.cos(phase * 0.7 + p * 0.8) * 0.4 + 0.4) * (canvas.height * 0.7);
        const pSize = (Math.sin(phase + p) * 0.5 + 0.5) * 3 + 2;

        ctx.fillStyle = currentConfig.particle;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlayingDemo, selectedPreset]);

  return (
    <div className="min-h-screen bg-[#FAF6ED] text-black font-sans select-none overflow-x-hidden relative flex flex-col">
      {/* Background Retro Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]" />

      {/* Top Navbar */}
      <header className="px-6 py-4 bg-[#FAF6ED] border-b-[3px] border-black flex justify-between items-center sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] rotate-[-3deg]">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase flex items-center gap-2">
              <span>AUDIRA STUDIO</span>
              <span className="text-[10px] bg-[#FFDE4D] text-black px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">v2.0 ULTIMATE</span>
            </h1>
            <p className="text-[10px] font-bold text-black/60">Ultimate Audio Visualizer & Parallel Multi-Worker Renderer</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 font-black text-xs uppercase tracking-wider">
          <a href="#demo" className="hover:text-[#8B5CF6] transition-colors">Pratinjau Live</a>
          <a href="#features" className="hover:text-[#8B5CF6] transition-colors">Fitur Unggulan</a>
          <a href="#comparison" className="hover:text-[#8B5CF6] transition-colors">Perbandingan</a>
          <a href="#faq" className="hover:text-[#8B5CF6] transition-colors">FAQ</a>
        </div>

        <button
          onClick={() => setShowLoginModal(true)}
          className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
        >
          <LogIn className="w-4 h-4 text-white" />
          <span>MASUK KE STUDIO / LOGIN</span>
        </button>
      </header>

      {/* Hero Section with Live Canvas Visualizer Demo */}
      <section className="px-6 py-12 md:py-20 max-w-6xl mx-auto space-y-10 relative z-10">
        
        <div className="text-center space-y-6">
          {/* Floating Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDE4D] border-3 border-black rounded-full shadow-[4px_4px_0px_#000] text-xs font-black uppercase tracking-wider rotate-[-1deg]">
            <Disc className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '6s' }} />
            <span>Platform Spektrum Video Musik & Lirik Otomatis No. 1</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-black leading-none max-w-4xl mx-auto">
            Ubah Lagu Anda Menjadi Video Spektrum & Lirik Berkelas Dunia
          </h1>

          {/* Hero Description */}
          <p className="text-base md:text-lg font-bold text-black/70 max-w-2xl mx-auto leading-relaxed">
            Studio desktop offline tercepat untuk Produser Musik, DJ, & YouTuber. Dilengkapi akselerasi GPU FFmpeg, render 3-slot paralel, transkripsi lirik Gemini AI, dan mastering audio LUFS.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-3 border-black rounded-2xl font-black text-sm uppercase tracking-wider shadow-[5px_5px_0px_#000] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2 text-center"
            >
              <LogIn className="w-5 h-5" />
              <span>BUKA STUDIO SEKARANG (LOGIN ADMIN)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlayingDemo(!isPlayingDemo)}
              className="px-6 py-4 bg-white hover:bg-slate-50 text-black border-3 border-black rounded-2xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-2"
            >
              {isPlayingDemo ? <Pause className="w-4 h-4 text-black fill-black" /> : <Play className="w-4 h-4 text-black fill-black" />}
              <span>{isPlayingDemo ? 'JEDA DEMO SPEKTRUM' : 'PUTAR DEMO SPEKTRUM'}</span>
            </button>
          </div>

          <div className="pt-2">
            <span className="inline-block px-3 py-1.5 bg-[#FFF8E7] border-2 border-black rounded-lg text-xs font-bold text-black shadow-[2px_2px_0px_#000]">
              💡 Kredensial Login: <strong>Username: Admin</strong> | <strong>Password: Audira</strong>
            </span>
          </div>
        </div>

        {/* Live Interactive Canvas Visualizer Showcase Card */}
        <div id="demo" className="bg-white border-[4px] border-black rounded-3xl p-6 shadow-[10px_10px_0px_#000] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b-2 border-black/10">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#8B5CF6]" />
              <span className="font-black text-sm uppercase tracking-wider text-black">
                Pratinjau Live Engine Canvas (60 FPS WebGL Mode)
              </span>
            </div>

            {/* Interactive Preset Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(presets) as Array<keyof typeof presets>).map((pKey) => (
                <button
                  key={pKey}
                  onClick={() => setSelectedPreset(pKey)}
                  className={`px-3 py-1 rounded-lg border-2 border-black font-black text-[10px] uppercase transition-all cursor-pointer ${
                    selectedPreset === pKey 
                      ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]' 
                      : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  {presets[pKey].name}
                </button>
              ))}
            </div>
          </div>

          {/* Live Canvas Element */}
          <div className="relative rounded-2xl overflow-hidden border-3 border-black shadow-[4px_4px_0px_#000]">
            <canvas 
              ref={canvasRef} 
              width={960} 
              height={320} 
              className="w-full h-[260px] md:h-[320px] object-cover block"
            />
            
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white font-black text-[10px] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              <span>LIVE FFT REAL-TIME VISUALIZER</span>
            </div>
          </div>
        </div>

      </section>

      {/* Live Performance Metrics Bar */}
      <section className="bg-[#8B5CF6] border-y-[3px] border-black text-white py-8 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black uppercase">60 FPS</h3>
            <p className="text-xs font-bold uppercase text-white/80">WebGL Canvas Engine</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black uppercase">3 SLOT</h3>
            <p className="text-xs font-bold uppercase text-white/80">Parallel Render Queue</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black uppercase">-14 LUFS</h3>
            <p className="text-xs font-bold uppercase text-white/80">YouTube Audio Normalizer</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black uppercase">100% FREE</h3>
            <p className="text-xs font-bold uppercase text-white/80">Lokal Offline & No Subscriptions</p>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="px-6 py-20 bg-white border-b-[3px] border-black relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFDE4D] border-2 border-black rounded-lg text-xs font-black uppercase">
              <Flame className="w-4 h-4 text-black" />
              <span>POWERFUL FEATURES</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-black">
              Segudang Fitur Kelas Atas Studio
            </h2>
            <p className="text-xs font-bold text-black/60 max-w-xl mx-auto">
              Segala hal yang Anda butuhkan untuk memproduksi video spektrum musik profesional ada di sini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Multi-Worker Parallel Queue */}
            <div className="p-6 bg-[#FAF6ED] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-[#8B5CF6] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-white">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                1. Render Queue 3-Slot Paralel
              </h3>
              <p className="text-xs font-semibold text-black/70 leading-relaxed">
                Render hingga 3 video MP4 sekaligus secara bersamaan menggunakan multi-worker thread terpisah tanpa ada antrean yang tertunda.
              </p>
            </div>

            {/* Card 2: Engine Spektrum Audio 3D & 2D */}
            <div className="p-6 bg-[#FAF6ED] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-[#06B6D4] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-white">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                2. Spektrum Visualizer Dynamic
              </h3>
              <p className="text-xs font-semibold text-black/70 leading-relaxed">
                Model spektrum gelombang responsif (Frequency Bars, Waveform Line, dan Circular Radial) dengan pengaturan efek glow, partikel, & rotasi.
              </p>
            </div>

            {/* Card 3: AI Transkripsi Lirik & Copilot */}
            <div className="p-6 bg-[#FAF6ED] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-[#FFDE4D] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                3. AI Lyric Wizard (LRC)
              </h3>
              <p className="text-xs font-semibold text-black/70 leading-relaxed">
                Transkrip lirik lagu otomatis menjadi berkas karaoke berformat waktu (.LRC) menggunakan integrasi Gemini AI 1.5 Flash & Audira Router.
              </p>
            </div>

            {/* Card 4: Mastering Audio LUFS */}
            <div className="p-6 bg-[#FAF6ED] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-[#10B981] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-white">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                4. Mastering Audio LUFS
              </h3>
              <p className="text-xs font-semibold text-black/70 leading-relaxed">
                Normalisasi otomatis loudness standar industri (-14 LUFS YouTube, -16 LUFS Spotify) untuk hasil audio video yang nyaring & jernih.
              </p>
            </div>

            {/* Card 5: Thumbnail Studio Cover */}
            <div className="p-6 bg-[#FAF6ED] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-[#EC4899] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-white">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                5. Thumbnail Cover Studio
              </h3>
              <p className="text-xs font-semibold text-black/70 leading-relaxed">
                Desain gambar sampul musik persegi (1:1) & landscape (16:9) siap diunggah ke Spotify, YouTube, dan Instagram secara instan.
              </p>
            </div>

            {/* Card 6: YouTube Live Stream Producer */}
            <div className="p-6 bg-[#FAF6ED] border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] space-y-4 hover:translate-y-[-2px] transition-all">
              <div className="w-12 h-12 bg-[#EF4444] border-2 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000] text-white">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">
                6. Direct Live Streaming
              </h3>
              <p className="text-xs font-semibold text-black/70 leading-relaxed">
                Siarkan langsung visualizer musik Anda secara real-time ke YouTube Live menggunakan protokol RTMP dengan latensi rendah.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section id="comparison" className="px-6 py-20 bg-[#FAF6ED] border-b-[3px] border-black relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-black">
              📊 Mengapa Audira Studio Lebih Unggul?
            </h2>
            <p className="text-xs font-bold text-black/60">
              Perbandingan fitur Audira Music Studio v2.0 dibanding editor video konvensional lainnya.
            </p>
          </div>

          <div className="bg-white border-[4px] border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_#000]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#8B5CF6] text-white font-black text-xs uppercase border-b-3 border-black">
                  <th className="p-4 border-r-2 border-black">Fitur Studio</th>
                  <th className="p-4 border-r-2 border-black text-center bg-[#7C3AED]">Audira Studio v2.0</th>
                  <th className="p-4 text-center">Editor Video Biasa</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold text-black divide-y-2 divide-black/10">
                <tr>
                  <td className="p-4 border-r-2 border-black font-black">Render 3-Slot Paralel</td>
                  <td className="p-4 border-r-2 border-black text-center bg-green-50 text-green-700 font-black"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-r-2 border-black font-black">Transkripsi Lirik Otomatis (.LRC)</td>
                  <td className="p-4 border-r-2 border-black text-center bg-green-50 text-green-700 font-black"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-r-2 border-black font-black">Mastering Loudness -14 LUFS</td>
                  <td className="p-4 border-r-2 border-black text-center bg-green-50 text-green-700 font-black"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-r-2 border-black font-black">Akselerasi GPU Hardware FFmpeg</td>
                  <td className="p-4 border-r-2 border-black text-center bg-green-50 text-green-700 font-black"><Check className="w-5 h-5 mx-auto" /></td>
                  <td className="p-4 text-center text-red-500"><X className="w-5 h-5 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 border-r-2 border-black font-black">Biaya Akses Aplikasi</td>
                  <td className="p-4 border-r-2 border-black text-center bg-green-50 text-green-700 font-black">FREE (Lokal)</td>
                  <td className="p-4 text-center text-red-500">Berbayar / Berlangganan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="px-6 py-20 bg-white border-b-[3px] border-black relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-black">
              ❓ Pertanyaan Sering Diajukan (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Bagaimana cara kerja 3-Slot Render Queue Paralel?",
                a: "Aplikasi menjalankan 3 worker thread independen di latar belakang. Setiap kali Anda menekan tombol 'MULAI RENDER MP4', job akan otomatis diproses di Slot 1, 2, atau 3 secara bersamaan tanpa mengganggu satu sama lain."
              },
              {
                q: "Apakah aplikasi ini membutuhkan koneksi internet?",
                a: "Tidak! Proses render video, analisis spektrum audio, dan pembuatan thumbnail berjalan 100% secara offline di komputer Anda. Koneksi internet hanya digunakan jika Anda menggunakan fitur cloud AI untuk transkripsi lirik."
              },
              {
                q: "Berapa kredensial login default untuk masuk ke studio?",
                a: "Kredensial login default adalah Username: Admin dan Password: Audira. Anda bisa menandai opsi 'Ingat Sesi Login' agar tidak perlu memasukkan password berulang kali."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="border-[3px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] bg-[#FAF6ED]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-black text-sm uppercase flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs font-semibold text-black/70 leading-relaxed border-t-2 border-black/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <footer className="mt-auto px-6 py-12 bg-white border-t-[3px] border-black text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] border-2 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000]">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-base uppercase tracking-wider text-black">AUDIRA MUSIC STUDIO v2.0 ULTIMATE</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-black">
            Dikembangkan & Dilisensikan secara Resmi oleh <span className="bg-[#FFDE4D] px-2 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000]">AUDIRA (Agus Dwi R)</span>
          </p>
          <p className="text-[11px] font-semibold text-black/60 leading-relaxed">
            Hak Cipta © 2026 AUDIRA (Agus Dwi R). Seluruh Hak Cipta Dilindungi Undang-Undang. Platform Pembuat Video Musik Spektrum & Render Offline Multithreaded.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[10px] font-black uppercase text-black/70">
          <span className="px-2.5 py-1 bg-[#FAF6ED] border border-black rounded shadow-[1px_1px_0px_#000]">Engine: Python FFmpeg Multi-Worker</span>
          <span>•</span>
          <span className="px-2.5 py-1 bg-[#FAF6ED] border border-black rounded shadow-[1px_1px_0px_#000]">Canvas: PixiJS v8 WebGL</span>
          <span>•</span>
          <span className="px-2.5 py-1 bg-[#FAF6ED] border border-black rounded shadow-[1px_1px_0px_#000]">Shell: Tauri 2.0 Windows Native</span>
        </div>
      </footer>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-6 py-3 bg-[#FAF6ED] border-3 border-black rounded-2xl shadow-[6px_6px_0px_#000] flex items-center gap-4">
        <span className="hidden md:inline font-black text-xs uppercase text-black">
          Siap memproduksi video spektrum musik?
        </span>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-5 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>MASUK STUDIO SEKARANG</span>
        </button>
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
