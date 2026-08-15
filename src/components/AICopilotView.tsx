import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  MessageSquare, 
  RefreshCw, 
  Key, 
  Zap
} from 'lucide-react';

interface AICopilotProps {
  apiKey?: string;
  songTitle?: string;
  artistName?: string;
  useAudiraRouter?: boolean;
  audiraRouterUrl?: string;
  audiraRouterKey?: string;
  audiraRouterModel?: string;
}

export const AICopilotView: React.FC<AICopilotProps> = ({
  apiKey = '',
  songTitle = 'Futuristic Resonance',
  artistName = 'Audira Clip AI Studio',
  useAudiraRouter = false,
  audiraRouterUrl = 'http://localhost:20128/v1',
  audiraRouterKey = '',
  audiraRouterModel = 'kr/gemini-1.5-flash'
}) => {
  const [geminiKey, setGeminiKey] = useState(apiKey || localStorage.getItem('gemini_api_key') || '');
  const [promptInput, setPromptInput] = useState(`Buatkan 5 judul YouTube viral dan deskripsi menarik untuk lagu "${songTitle}" karya "${artistName}".`);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('titles');

  // Prompt Templates
  const templates = [
    {
      id: 'titles',
      title: '🎵 Generator Judul YouTube Viral',
      prompt: `Buatkan 5 rekomendasi Judul Video YouTube yang sangat menarik, berpotensi viral, dan estetik untuk lagu bergenre musik visualizer dengan judul "${songTitle}" karya "${artistName}". Tambahkan emoji yang relevan.`
    },
    {
      id: 'description',
      title: '📝 Deskripsi SEO & Kredit Lagu',
      prompt: `Buatkan deskripsi lengkap video YouTube SEO-friendly untuk lagu "${songTitle}" oleh "${artistName}". Sertakan bagian: 1. Pendahuluan menarik, 2. Stempel Waktu (Timestamps), 3. Kredit Musik & Lisensi Bebas Hak Cipta, 4. Panggilan bertindak (Call to Action Subscribe & Like).`
    },
    {
      id: 'hashtags',
      title: '#️⃣ Hashtag Viral TikTok & Reels',
      prompt: `Buatkan daftar 25 hashtag paling populer dan trending di TikTok, Instagram Reels, dan YouTube Shorts untuk video visualizer musik bergenre EDM / Lofi / Cinematic dengan judul "${songTitle}" oleh "${artistName}". Grouping berdasarkan kategori.`
    },
    {
      id: 'strategy',
      title: '💡 Ide Konten & Strategi Promosi',
      prompt: `Berikan 4 ide kreatif dan strategi promosi konten pendek (TikTok / IG Reels / Shorts) untuk mempromosikan lagu "${songTitle}" oleh "${artistName}" agar mendapatkan jangkauan penonton yang luas.`
    }
  ];

  const handleSelectTemplate = (t: typeof templates[0]) => {
    setSelectedTemplate(t.id);
    setPromptInput(t.prompt);
  };

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;

    setIsLoading(true);
    setAiResponse('');

    if (useAudiraRouter) {
      try {
        const response = await fetch(
          `${audiraRouterUrl}/chat/completions`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${audiraRouterKey || 'dummy-key'}`
            },
            body: JSON.stringify({
              model: audiraRouterModel,
              messages: [{ role: 'user', content: promptInput }],
              stream: false
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Audira Router Error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          setAiResponse(text);
        } else {
          setAiResponse('Gagal mendapatkan balasan dari Audira Router. Periksa konfigurasi model Anda.');
        }
      } catch (err: any) {
        console.error("Audira Router API Call failed:", err);
        setAiResponse(`Error: ${err.message || 'Gagal terhubung ke Audira Router lokal.'}`);
      } finally {
        setIsLoading(false);
      }
    } else if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptInput }] }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          setAiResponse(text);
        } else {
          setAiResponse('Gagal mendapatkan balasan dari Gemini AI. Silakan periksa kembali API Key Anda.');
        }
      } catch (err: any) {
        console.error("Gemini AI API Call failed:", err);
        setAiResponse(`Error: ${err.message || 'Gagal terhubung ke Google Gemini API.'}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock Response Fallback when no API Key is configured yet
      setTimeout(() => {
        if (selectedTemplate === 'titles') {
          setAiResponse(
            `🔥 5 REKOMENDASI JUDUL VIRAL YOUTUBE:\n\n` +
            `1. ${songTitle} - ${artistName} (Official Music Video Visualizer 4K)\n` +
            `2. Dengarkan Ini Saat Kerja/Belajar! 🎧 ${songTitle} by ${artistName}\n` +
            `3. ${songTitle} (Lofi Chill & Synthwave Remix) - ${artistName}\n` +
            `4. Kumpulan Spektrum Musik Terbaik 2026 🌌 ${songTitle}\n` +
            `5. [Bebas Hak Cipta] ${songTitle} - ${artistName} (No Copyright Visualizer)`
          );
        } else if (selectedTemplate === 'hashtags') {
          setAiResponse(
            `#️⃣ BUNDLE HASHTAG TRENDING TIKTOK & SHORTS:\n\n` +
            `#music #visualizer #audirastudio #${songTitle.toLowerCase().replace(/\s+/g, '')} ` +
            `#${artistName.toLowerCase().replace(/\s+/g, '')} #edm #lofi #chillbeats #viral #fyp ` +
            `#musicvideo #aesthetic #spectrum #aveeplayer #kinemaster #dj #remix2026 #topmusic #indonesia`
          );
        } else {
          setAiResponse(
            `✨ HASIL AI GENERATOR (${songTitle} - ${artistName}):\n\n` +
            `Selamat Datang di Official Music Video "${songTitle}" karya "${artistName}".\n` +
            `Jangan lupa untuk klik tombol LIKE, COMMENT, dan SUBSCRIBE agar tidak ketinggalan visualizer musik terbaru!\n\n` +
            `⏱️ TIMESTAMPS:\n` +
            `00:00 Intro & Spektrum Visualizer\n` +
            `01:15 Drop & Bass Boost\n` +
            `02:45 Outro\n\n` +
            `©️ KREDIT & LISENSI:\n` +
            `Music produced by ${artistName}. Visualizer generated via AudiraStudioMusic.`
          );
        }
        setIsLoading(false);
      }, 800);
    }
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGeminiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6ED] overflow-y-auto select-none p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B5CF6] border-2 border-black rounded-xl text-white shadow-[3px_3px_0px_#000]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-black">
              AI Copilot & Metadata Studio
            </h1>
            <p className="text-xs text-black/60 font-extrabold uppercase tracking-wide">
              Asisten AI Pintar Berbasis {useAudiraRouter ? audiraRouterModel : 'Gemini 1.5 Flash'} untuk Judul, Deskripsi & Hashtag Content Video
            </p>
          </div>
        </div>

        {/* API Key Status Badge / Audira Router Indicator */}
        <div className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 rounded-xl shadow-[3px_3px_0px_#000]">
          {useAudiraRouter ? (
            <>
              <Zap className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-xs font-black uppercase text-green-700">
                Router: {audiraRouterModel}
              </span>
            </>
          ) : (
            <>
              <Key className="w-4 h-4 text-[#8B5CF6]" />
              <input
                type="password"
                value={geminiKey}
                onChange={handleSaveKey}
                placeholder="Masukkan Gemini API Key..."
                className="text-xs font-bold bg-transparent border-none focus:outline-none w-48 text-black"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Panel: Templates & Custom Prompt */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Preset Templates */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-black block">
              Pilih Template Prompt AI Instan:
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3.5 border-2 border-black rounded-xl text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedTemplate === t.id
                      ? 'bg-[#8B5CF6] text-white shadow-[3px_3px_0px_#000] translate-y-[-1px]'
                      : 'bg-[#FEF8EC] text-black hover:bg-amber-100 shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <span>{t.title}</span>
                  {selectedTemplate === t.id && <Zap className="w-4 h-4 text-amber-300 fill-current" />}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Editor Form */}
          <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] flex-1 flex flex-col gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-black block">
              Instruksi Prompt AI:
            </label>
            <textarea
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              rows={5}
              className="w-full flex-1 p-3 bg-[#FEF8EC] border-2 border-black rounded-xl font-bold text-xs focus:outline-none shadow-[2px_2px_0px_#000] resize-none"
              placeholder="Tuliskan perintah prompt untuk AI..."
            />

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-3.5 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses dengan {useAudiraRouter ? 'Audira Router' : 'Gemini AI'}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Konten AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output Viewer */}
        <div className="lg:col-span-7 bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
                Hasil Respons Gemini AI
              </span>

              {aiResponse && (
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-[#FEF8EC] hover:bg-amber-200 border-2 border-black rounded-lg font-bold text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Teks</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {aiResponse ? (
              <div className="p-4 bg-[#FEF8EC] border-2 border-black rounded-xl font-medium text-xs text-black whitespace-pre-wrap leading-relaxed shadow-[2px_2px_0px_#000] max-h-[500px] overflow-y-auto">
                {aiResponse}
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-black/30 rounded-xl flex flex-col items-center justify-center text-center gap-3 text-black/50">
                <Sparkles className="w-10 h-10 stroke-[1.5]" />
                <p className="font-bold text-xs max-w-sm">
                  Klik tombol <span className="text-[#8B5CF6] font-black">"Generate Konten AI"</span> di sebelah kiri untuk menghasilkan judul, deskripsi, dan hashtag musik otomatis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
