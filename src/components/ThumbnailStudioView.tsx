import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Download, 
  Sparkles, 
  Type, 
  Layers, 
  Tag
} from 'lucide-react';

interface ThumbnailStudioProps {
  initialTitle?: string;
  initialArtist?: string;
  initialBgUrl?: string | null;
}

export const ThumbnailStudioView: React.FC<ThumbnailStudioProps> = ({
  initialTitle = 'Futuristic Resonance',
  initialArtist = 'Audira Clip AI Studio',
  initialBgUrl = null
}) => {
  // Config state
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [title, setTitle] = useState(initialTitle);
  const [artist, setArtist] = useState(initialArtist);
  const [badgeText, setBadgeText] = useState('OFFICIAL AUDIO');
  const [badgeColor, setBadgeColor] = useState('#8B5CF6');
  
  // Style state
  const fontFamily = 'Outfit';
  const [titleColor, setTitleColor] = useState('#FFFFFF');
  const artistColor = '#F3F4F6';
  const [fontSize, setFontSize] = useState(64);
  const bgColor = '#1E1B4B';
  const [bgImage, setBgImage] = useState<string | null>(initialBgUrl);
  const [overlayBrightness, setOverlayBrightness] = useState(40);
  const [blurAmount, setBlurAmount] = useState(4);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Quick Badges
  const presetBadges = [
    'OFFICIAL AUDIO',
    'NEW RELEASE',
    'LO-FI CHILL',
    '4K ULTRA HD',
    'REMIX 2026',
    'NO COPYRIGHT MUSIC'
  ];

  // Draw thumbnail on HTML5 canvas
  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions based on ratio
    let width = 1280;
    let height = 720;
    if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    } else if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    if (bgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw image cover scale
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;

        if (blurAmount > 0) {
          ctx.filter = `blur(${blurAmount}px)`;
        }
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.filter = 'none';

        // Dark overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayBrightness / 100})`;
        ctx.fillRect(0, 0, width, height);

        renderTextAndBadges(ctx, width, height);
      };
      img.src = bgImage;
    } else {
      // Solid / Gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, bgColor);
      gradient.addColorStop(1, '#0F0D24');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      renderTextAndBadges(ctx, width, height);
    }
  };

  const renderTextAndBadges = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 2. Draw Decorative Accent Lines / Neon Glow
    ctx.shadowColor = badgeColor;
    ctx.shadowBlur = 20;

    // 3. Draw Badge Tag (Top Left or Center)
    if (badgeText) {
      ctx.font = `bold 24px ${fontFamily}, sans-serif`;
      const textMetrics = ctx.measureText(badgeText.toUpperCase());
      const paddingX = 24;
      const badgeW = textMetrics.width + paddingX * 2;
      const badgeH = 44;
      const badgeX = (width - badgeW) / 2;
      const badgeY = height * 0.25;

      // Badge Container Box
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
      ctx.fill();

      // Badge Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText.toUpperCase(), width / 2, badgeY + badgeH / 2 + 2);
    }

    // 4. Draw Title
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    const scaledFontSize = Math.round(fontSize * (width / 1280));
    ctx.font = `black ${scaledFontSize}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const titleY = height * 0.52;
    ctx.fillText(title, width / 2, titleY);

    // 5. Draw Artist Subtitle
    const artistFontSize = Math.round(scaledFontSize * 0.5);
    ctx.font = `bold ${artistFontSize}px ${fontFamily}, sans-serif`;
    ctx.fillStyle = artistColor;
    const artistY = titleY + scaledFontSize * 0.8 + 15;
    ctx.fillText(artist.toUpperCase(), width / 2, artistY);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  useEffect(() => {
    drawThumbnail();
  }, [
    aspectRatio,
    title,
    artist,
    badgeText,
    badgeColor,
    fontFamily,
    titleColor,
    artistColor,
    fontSize,
    bgColor,
    bgImage,
    overlayBrightness,
    blurAmount
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBgImage(url);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `thumbnail-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF6ED] overflow-y-auto select-none p-8">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B5CF6] border-2 border-black rounded-xl text-white shadow-[3px_3px_0px_#000]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-black">
              Thumbnail Studio
            </h1>
            <p className="text-xs text-black/60 font-extrabold uppercase tracking-wide">
              Buat Cover Miniatur YouTube, TikTok, & Instagram Visualizer Estetik
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="px-5 py-3 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Unduh Thumbnail PNG</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Side: Controls Form Panel */}
        <div className="lg:col-span-5 bg-white border-[3px] border-black rounded-2xl p-6 shadow-[5px_5px_0px_#000] space-y-6 overflow-y-auto">
          {/* Aspect Ratio Switcher */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-black block mb-2">
              Format & Rasio Gambar
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: 'YouTube (16:9)' },
                { id: '9:16', label: 'TikTok/Shorts (9:16)' },
                { id: '1:1', label: 'Instagram (1:1)' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setAspectRatio(r.id as any)}
                  className={`py-2 px-3 border-2 border-black rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    aspectRatio === r.id
                      ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000]'
                      : 'bg-white text-black hover:bg-amber-100 shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black/20 pb-2">
              <Type className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Teks & Tipografi</span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-black block mb-1">Judul Lagu</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#FEF8EC] border-2 border-black rounded-lg font-bold text-xs focus:outline-none shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-black block mb-1">Nama Artis</label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="w-full px-3 py-2 bg-[#FEF8EC] border-2 border-black rounded-lg font-bold text-xs focus:outline-none shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-black block mb-1">Warna Judul</label>
                <input
                  type="color"
                  value={titleColor}
                  onChange={e => setTitleColor(e.target.value)}
                  className="w-full h-9 p-1 border-2 border-black rounded-lg bg-white cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-black block mb-1">Ukuran Font</label>
                <input
                  type="range"
                  min="32"
                  max="110"
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value))}
                  className="w-full neo-slider mt-2"
                />
              </div>
            </div>
          </div>

          {/* Badge Tag Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black/20 pb-2">
              <Tag className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Badge Tag Lencana</span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-black block mb-1">Teks Badge</label>
              <input
                type="text"
                value={badgeText}
                onChange={e => setBadgeText(e.target.value)}
                placeholder="Contoh: OFFICIAL AUDIO"
                className="w-full px-3 py-2 bg-[#FEF8EC] border-2 border-black rounded-lg font-bold text-xs focus:outline-none shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-black/70 block mb-1.5">Preset Badge Instan</label>
              <div className="flex flex-wrap gap-1.5">
                {presetBadges.map(b => (
                  <button
                    key={b}
                    onClick={() => setBadgeText(b)}
                    className="px-2 py-1 bg-[#FEF8EC] border border-black rounded font-bold text-[9px] uppercase tracking-wider hover:bg-purple-100 shadow-[1px_1px_0px_#000] cursor-pointer"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-black block mb-1">Warna Badge</label>
              <input
                type="color"
                value={badgeColor}
                onChange={e => setBadgeColor(e.target.value)}
                className="w-full h-9 p-1 border-2 border-black rounded-lg bg-white cursor-pointer"
              />
            </div>
          </div>

          {/* Background Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-black/20 pb-2">
              <Layers className="w-4 h-4 text-black stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-wider">Latar Belakang & Blur</span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-black block mb-1">Unggah Gambar Latar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs font-bold text-black border-2 border-black rounded-lg p-2 bg-[#FEF8EC] cursor-pointer shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-black block mb-1">Blur Gambar ({blurAmount}px)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blurAmount}
                  onChange={e => setBlurAmount(parseInt(e.target.value))}
                  className="w-full neo-slider mt-2"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-black block mb-1">Gelap Overlay ({overlayBrightness}%)</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={overlayBrightness}
                  onChange={e => setOverlayBrightness(parseInt(e.target.value))}
                  className="w-full neo-slider mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000]">
          <div className="mb-3 flex items-center justify-between w-full">
            <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              Pratinjau Kanvas Live ({aspectRatio})
            </span>
            <span className="text-[10px] font-bold text-black/60 uppercase bg-amber-100 border border-black px-2.5 py-1 rounded">
              High Definition
            </span>
          </div>

          <div className="w-full max-h-[600px] flex items-center justify-center overflow-hidden rounded-xl border-[3px] border-black shadow-[4px_4px_0px_#000] bg-[#1E1B4B]">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[550px] object-contain block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
