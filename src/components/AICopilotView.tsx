import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Key, 
  Send,
  Pin,
  FileText,
  Hash,
  FileCode,
  ArrowRight,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

interface AICopilotProps {
  apiKey?: string;
  songTitle?: string;
  artistName?: string;
  useAudiraRouter?: boolean;
  audiraRouterUrl?: string;
  audiraRouterKey?: string;
  audiraRouterModel?: string;
  onApplyTitle?: (title: string) => void;
  onApplyDescription?: (desc: string) => void;
  onApplyTags?: (tags: string) => void;
  onApplyLyrics?: (lyrics: string) => void;
  onNavigateToStudio?: () => void;
}

export const AICopilotView: React.FC<AICopilotProps> = ({
  apiKey = '',
  songTitle = 'Futuristic Resonance',
  artistName = 'Audira Clip AI Studio',
  useAudiraRouter = false,
  audiraRouterUrl = 'http://localhost:20128/v1',
  audiraRouterKey = '',
  audiraRouterModel = 'kr/gemini-1.5-flash',
  onApplyTitle,
  onApplyDescription,
  onApplyTags,
  onApplyLyrics,
  onNavigateToStudio
}) => {
  const [geminiKey, setGeminiKey] = useState(apiKey || localStorage.getItem('gemini_api_key') || '');
  const [promptInput, setPromptInput] = useState(`Buatkan 5 judul YouTube viral dan deskripsi menarik untuk lagu "${songTitle}" karya "${artistName}".`);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('titles');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [routerStatus, setRouterStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  React.useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch(`${audiraRouterUrl}/models`, {
          headers: audiraRouterKey ? { 'Authorization': `Bearer ${audiraRouterKey}` } : {}
        });
        if (isMounted) {
          if (res.ok || res.status === 401 || res.status === 200) {
            setRouterStatus('connected');
          } else {
            setRouterStatus('error');
          }
        }
      } catch {
        if (isMounted) setRouterStatus('error');
      }
    };
    checkHealth();
    return () => { isMounted = false; };
  }, [audiraRouterUrl, audiraRouterKey]);

  // Prompt Templates
  const templates = [
    {
      id: 'titles',
      title: '🎵 Judul YouTube Viral',
      icon: '🔥',
      prompt: `Buatkan 5 rekomendasi Judul Video YouTube yang sangat menarik, berpotensi viral, dan estetik untuk lagu bergenre musik visualizer dengan judul "${songTitle}" karya "${artistName}". Tambahkan emoji yang relevan.`
    },
    {
      id: 'description',
      title: '📝 Deskripsi SEO & Timestamps',
      icon: '📝',
      prompt: `Buatkan deskripsi lengkap video YouTube SEO-friendly untuk lagu "${songTitle}" oleh "${artistName}". Sertakan bagian: 1. Pendahuluan menarik, 2. Stempel Waktu (Timestamps), 3. Kredit Musik & Lisensi Bebas Hak Cipta, 4. Panggilan bertindak (Call to Action Subscribe & Like).`
    },
    {
      id: 'hashtags',
      title: '#️⃣ Hashtag Trending TikTok & Shorts',
      icon: '#️⃣',
      prompt: `Buatkan daftar 25 hashtag paling populer dan trending di TikTok, Instagram Reels, dan YouTube Shorts untuk video visualizer musik bergenre EDM / Lofi / Cinematic dengan judul "${songTitle}" oleh "${artistName}". Grouping berdasarkan kategori.`
    },
    {
      id: 'lyrics',
      title: '📜 Generator Lirik & Transkrip LRC',
      icon: '📜',
      prompt: `Buatkan lirik format LRC bertanda waktu [mm:ss.xx] yang emosional dan puitis untuk lagu "${songTitle}" karya "${artistName}".`
    },
    {
      id: 'strategy',
      title: '💡 Ide Konten & Promosi Video',
      icon: '💡',
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
          setAiResponse(`${songTitle} - ${artistName} (Official Music Video Visualizer 4K)`);
        } else if (selectedTemplate === 'hashtags') {
          setAiResponse(`#music #visualizer #audirastudio #${songTitle.toLowerCase().replace(/\s+/g, '')} #${artistName.toLowerCase().replace(/\s+/g, '')} #edm #lofi #chillbeats #viral #fyp`);
        } else if (selectedTemplate === 'lyrics') {
          setAiResponse(`[00:05.10] ${songTitle} - ${artistName}\n[00:12.30] Menatap indahnya cahaya di malam hari...\n[00:20.45] Merasakan getaran nada yang memanggil jiwa...\n[00:28.90] Ini adalah karya dari ${artistName}...`);
        } else {
          setAiResponse(
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
      }, 700);
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleApplyTitleToStudio = () => {
    if (!aiResponse || !onApplyTitle) return;
    // Extract first title line if multi-line
    const lines = aiResponse.split('\n').filter(l => l.trim().length > 0);
    const cleanTitle = lines[0].replace(/^[0-9\.\-\*\s]+/, '').trim();
    onApplyTitle(cleanTitle || aiResponse);
    showToast(`📌 Judul Utama "${cleanTitle || aiResponse}" Berhasil Dipasang ke Video Studio!`);
  };

  const handleApplyDescriptionToMetadata = () => {
    if (!aiResponse || !onApplyDescription) return;
    onApplyDescription(aiResponse);
    showToast('📝 Deskripsi SEO Berhasil Dipasang ke Metadata Ekspor!');
  };

  const handleApplyTagsToMetadata = () => {
    if (!aiResponse || !onApplyTags) return;
    onApplyTags(aiResponse);
    showToast('#️⃣ Hashtag Berhasil Dipasang ke Metadata Ekspor!');
  };

  const handleApplyLyricsToStep5 = () => {
    if (!aiResponse || !onApplyLyrics) return;
    onApplyLyrics(aiResponse);
    showToast('📜 Lirik Karaoke Berhasil Dipasang ke Step 5 (LRC Studio)!');
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
    <div className="flex-1 flex flex-col h-full bg-[#FAF6ED] overflow-y-auto select-none p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b-[3px] border-black gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#8B5CF6] border-[2.5px] border-black rounded-2xl text-white shadow-[3.5px_3.5px_0px_#000]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-black">
              AI Copilot 2.0 & Studio Metadata Integrator
            </h1>
            <p className="text-xs text-black/60 font-black uppercase tracking-wide">
              Generasi Judul Viral, Deskripsi SEO, Hashtags, & Lirik Karaoke dengan Penerapan 1-Klik ke Studio
            </p>
          </div>
        </div>

        {/* Live Song Context Card */}
        <div className="px-4 py-2.5 bg-[#FEF3C7] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs font-black text-amber-950 flex items-center gap-2">
          <span>🎵 Lagu Aktif:</span>
          <span className="font-bold bg-white px-2 py-0.5 rounded border border-black truncate max-w-[200px]">
            {songTitle} - {artistName}
          </span>
        </div>
      </div>

      {/* Action Success Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-400 border-[2.5px] border-black rounded-xl text-black font-black text-xs shadow-[4px_4px_0px_#000] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-black" />
            <span>{actionSuccessMsg}</span>
          </div>
          {onNavigateToStudio && (
            <button
              onClick={onNavigateToStudio}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-black border border-black rounded font-black text-[10px] uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat di Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* API Key Banner / Config */}
      <div className="p-4 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-black">
          <Key className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Gemini 1.5 Flash API Key:</span>
        </div>

        <input
          type="password"
          value={geminiKey}
          onChange={handleSaveKey}
          placeholder="Masukkan Google Gemini API Key Anda..."
          className="flex-1 neo-input text-xs font-mono p-2.5 w-full md:w-auto"
        />

        {useAudiraRouter ? (
          <span className={`px-3 py-1 rounded border-2 border-black font-black text-[10px] uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000] ${
            routerStatus === 'connected' 
              ? 'bg-emerald-400 text-black' 
              : routerStatus === 'error' 
              ? 'bg-amber-300 text-black' 
              : 'bg-purple-300 text-black'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full border border-black ${routerStatus === 'connected' ? 'bg-emerald-700 animate-ping' : 'bg-amber-700'}`} />
            <span>
              {routerStatus === 'connected' 
                ? `🟢 Audira Router Proxy Aktif (${audiraRouterModel})` 
                : `🟡 Audira Router Proxy (${audiraRouterUrl})`}
            </span>
          </span>
        ) : (
          <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2.5 py-1 rounded border border-black">
            {geminiKey ? 'Gemini 1.5 Direct Active' : 'Demo Fallback Mode'}
          </span>
        )}
      </div>

      {/* Prompt Template Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-black uppercase text-black block">Pilih Template Generasi AI:</span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className={`p-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-wide transition-all text-left flex flex-col justify-between gap-2 cursor-pointer shadow-[2px_2px_0px_#000] ${
                selectedTemplate === t.id
                  ? 'bg-[#8B5CF6] text-white shadow-[3px_3px_0px_#000] translate-y-[-1px]'
                  : 'bg-white text-black hover:bg-amber-100'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="text-[11px] leading-tight">{t.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Generator & Result Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Input Column (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-xs font-black uppercase text-black block">Instruksi Prompt AI:</label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={8}
              className="w-full neo-input text-xs font-mono p-3 flex-1 resize-none"
              placeholder="Masukkan instruksi prompt AI di sini..."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white border-[2.5px] border-black rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Memproses AI Gemini...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-white" />
                <span>Generate dengan Gemini 1.5 AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Column (lg:col-span-7) */}
        <div className="lg:col-span-7 p-5 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-4">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b-2 border-black/10">
              <span className="font-black text-xs uppercase text-black flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Hasil Generasi AI & Output Studio</span>
              </span>

              {aiResponse && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black border border-black rounded font-black text-xs uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer flex items-center gap-1"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-[#FAF6ED] border-2 border-black rounded-xl p-4 font-mono text-xs text-black overflow-y-auto whitespace-pre-wrap min-h-[260px]">
              {aiResponse || (
                <div className="h-full flex flex-col items-center justify-center text-center text-black/40 space-y-2 py-12">
                  <Sparkles className="w-8 h-8 text-black/20" />
                  <p className="font-bold text-xs">Klik [Generate dengan Gemini 1.5 AI] di samping untuk menghasilkan judul viral, deskripsi SEO, hashtags, atau lirik!</p>
                </div>
              )}
            </div>
          </div>

          {/* ⚡ DIRECT 1-CLICK STUDIO APPLICATION BUTTONS BAR */}
          {aiResponse && (
            <div className="p-3 bg-[#FEF3C7] border-2 border-black rounded-xl space-y-2 shadow-[2px_2px_0px_#000] animate-fadeIn">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 block">
                ⚡ Terapkan Hasil AI Langsung ke Studio & Metadata (1-Klik):
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={handleApplyTitleToStudio}
                  className="p-2 bg-yellow-400 hover:bg-yellow-300 text-black border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all flex items-center justify-center gap-1 truncate"
                  title="Pasang Judul Ini ke Video Kanvas Studio"
                >
                  <Pin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">📌 Pasang Judul</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyDescriptionToMetadata}
                  className="p-2 bg-purple-500 hover:bg-purple-600 text-white border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all flex items-center justify-center gap-1 truncate"
                  title="Pasang Deskripsi ke Output Metadata Video"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">📝 Pasang Deskripsi</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyTagsToMetadata}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all flex items-center justify-center gap-1 truncate"
                  title="Pasang Hashtag ke Output Metadata Video"
                >
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">#️⃣ Pasang Hashtag</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyLyricsToStep5}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white border border-black rounded-lg font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-y-[1px] cursor-pointer transition-all flex items-center justify-center gap-1 truncate"
                  title="Pasang Lirik ke Step 5 (LRC Studio)"
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">📜 Pasang Lirik</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
