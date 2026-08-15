import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  RefreshCw, 
  Tv,
  Info,
  Home,
  Sliders,
  Clock,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Layers,
  LogOut
} from 'lucide-react';
import { PreviewCanvas } from './components/PreviewCanvas';
import { SpectrumEditor } from './components/SpectrumEditor';
import { OutputMetadataDrawer } from './components/OutputMetadataDrawer';
import { DashboardView } from './components/DashboardView';
import { HistoryView, HistoryItem } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ThumbnailStudioView } from './components/ThumbnailStudioView';
import { AICopilotView } from './components/AICopilotView';
import { BatchQueuePanel } from './components/BatchQueuePanel';
import { LandingPageView } from './components/LandingPageView';
import { QueueView } from './components/QueueView';
import { DirectDownloadModal } from './components/DirectDownloadModal';

// Conditional import of Tauri api to prevent browser crash
let invokeTauri: any = null;
let listenToTauri: any = null;
try {
  // Tauri v2 API Core and Event imports
  import('@tauri-apps/api/core').then(m => {
    invokeTauri = m.invoke;
  });
  import('@tauri-apps/api/event').then(m => {
    listenToTauri = m.listen;
  });
} catch (e) {
  console.log("Not running in Tauri environment, backend bindings will be mocked.");
}

let revealFile: any = null;
try {
  import('@tauri-apps/plugin-opener').then((m: any) => {
    revealFile = m.revealItemInDir || m.open;
  });
} catch (e) {
  // Mock environment fallback
}

const getFileUrl = (file: File): string => {
  if ((file as any).path && typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__?.convertFileSrc) {
    try {
      return (window as any).__TAURI_INTERNALS__.convertFileSrc((file as any).path);
    } catch (e) {
      console.warn("Failed to convert file src using Tauri:", e);
    }
  }
  return URL.createObjectURL(file);
};

interface ExportConfig {
  resolution: string;
  fps: number;
  outputPath: string;
  encoder: 'cpu' | 'gpu';
  codec: 'h264' | 'h265' | 'av1';
  format: 'mp4' | 'mkv' | 'mov';
  language: 'id' | 'en';
  segmentRender: boolean;
  videoBitrate: string;
  audioBitrate: string;
  encodingSpeed: string;
  exportMode: 'render' | 'stream';
  streamKey: string;
  videoCRF: number;
  audioNormalize: boolean;
}

const DEFAULT_SETTINGS = {
  visualizerType: 'bars' as 'bars' | 'wave' | 'circular' | 'symmetric' | 'retro' | 'double-circular' | 'radial-star' | 'wave-fill',
  barColor: '#8B5CF6',
  barWidth: 4,
  barSpacing: 3,
  sensitivity: 1.2,
  backgroundBlur: 0,
  backgroundBrightness: 100,
  particleIntensity: 1.5,
  textTitle: 'Futuristic Resonance',
  textArtist: 'Audira Clip AI Studio',
  textSize: 36,
  textColor: '#FFFFFF',
  textPosition: 50,
  aspectRatio: '16:9' as '16:9' | '9:16',
  socialPreset: 'youtube' as 'youtube' | 'tiktok' | 'ig',
  baseEffect: 'Static Cover (Standard)',
  bgMode: 'upload' as 'template' | 'upload',
  fitMode: 'Fit to Screen (Blurred Background)',
  audioMixer: 'Gunakan Musik Upload Saja (Playlist)',
  syncMode: 'Normal (Latar & Musik jalan masing-masing)',
  autoDucking: true,
  duckingLevel: 25,
  releaseTime: 0.5,
  bgInterval: 10,
  audioFade: true,
  bassBoost: false,
  antiCopyright: false,
  antiCopyrightPitch: 4,
  antiCopyrightZoom: 3,
  antiCopyrightNoise: 2,
  antiCopyrightVignette: 0.3,
  antiCopyrightRotate: 0.005,
  antiCopyrightHighCut: true,
  antiCopyrightLowCut: true,
  antiCopyrightEnvWarp: true,
  antiCopyrightPhaser: true,
  antiCopyrightColorGrading: true,
  antiCopyrightPitchEnabled: true,
  antiCopyrightZoomEnabled: true,
  antiCopyrightNoiseEnabled: true,
  antiCopyrightVignetteEnabled: true,
  antiCopyrightRotateEnabled: true,
  antiCopyrightTempoEnabled: false,
  antiCopyrightTempo: 100,
  antiCopyrightHighCutFreq: 16000,
  antiCopyrightLowCutFreq: 40,
  antiCopyrightEnvFrame: 150,
  antiCopyrightEnvGain: 15,
  antiCopyrightPhaserSpeed: 0.2,
  antiCopyrightPhaserDecay: 0.3,
  antiCopyrightDelayEnabled: true,
  antiCopyrightDelayMs: 20,
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
  antiCopyrightHashStrength: 2,
  antiCopyrightPreset: 'stealth',
  bgVideoVolume: 0,
  bgFlipH: false,
  bgFlipV: false,
  bgGradientType: 'gradient' as 'solid' | 'gradient',
  bgGradientColor1: '#1e1b4b',
  bgGradientColor2: '#5b21b6',
  bgGradientAngle: 135,
  bgTransition: 'Overlap Pudar (Fade Smooth Seamless)',
  vfxOpacity: 30,
  vfxCrt: false,
  vfxFlash: false,
  vfxNeon: false,
  vfxDisco: false,
  vfxMoon: false,
  vfxRain: false,
  vfxFilm: false,
  vfxSpotlight: false,
  vfxIslamic: false,
  neonPadding: 10,
  neonSpeed: 30,
  neonThickness: 4,
  neonLength: 75,
  neonGlow: 60,
  neonBaseColor: '#000000',
  neonStartColor: '#00ffff',
  neonEndColor: '#ff00ff',
  musicPulse: false,
  beatZoom: 5.0,
  beatShake: 2.0,
  transitionSfx: '',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  lofiFilter: false,
  partCosmic: false,
  partConfetti: false,
  partSparks: false,
  partStar: false,
  partLeaves: false,
  partOrbs: false,
  partSakura: false,
  partSnow: false,
  partRain: false,
  partBubbles: false,
  partMagic: false,
  partMatrix: false,
  specShow: true,
  specFocus: 'Semua Frekuensi (Standard)',
  specGlow: false,
  specPulse: false,
  specWidthPct: 0.55,
  specScale: 1.0,
  specHeight: 0.50,
  specOpacity: 100,
  specRotation: 0,
  specSpeed: 1.50,
  specReverse: 'Normal (Tidak Dibalik)',
  specPosX: 640.0,
  specPosY: 560.0,
  spectrumLayers: [
    {
      id: 'layer1',
      name: 'Spektrum 1',
      visualizerType: 'bars' as 'bars' | 'wave' | 'circular' | 'symmetric' | 'retro' | 'double-circular' | 'radial-star' | 'wave-fill',
      barColor: '#8B5CF6',
      specShow: true,
      specFocus: 'Semua Frekuensi (Standard)',
      specGlow: false,
      specPulse: false,
      specWidthPct: 0.55,
      specScale: 1.0,
      specHeight: 0.50,
      specOpacity: 100,
      specRotation: 0,
      specSpeed: 1.50,
      specReverse: 'Normal (Tidak Dibalik)',
      specPosX: 640.0,
      specPosY: 560.0
    }
  ],
  activeLayerId: 'layer1',
  showTitle: false,
  titleOutline: false,
  shadowDistance: 2,
  shadowOpacity: 60,
  titleBeatGlow: false,
  titleText: '{Judul Lagu}\nNama Artis',
  fontType: 'Playfair (Klasik Mewah)',
  titleFontSize: 60,
  titleColor1: '#ffffff',
  titleColor2: '#ffffff',
  titleAnimation: 'Tidak Ada / Statis',
  titleDisplayMode: 'Selalu Tampil di Video',
  titlePosX: 227.0,
  titlePosY: 549.0,
  showProgressBar: false,
  showTimecode: false,
  showRunningText: false,
  runningTextContent: 'Selamat datang! Jangan lupa Like, Comment, dan Subscribe!',
  runningTextSpeed: 100,
  runningTextColor: '#ffffff',
  logoPulseSync: false,
  showLowerThird: false,
  lowerThirdText: 'Cth: @DJ_Terbaik | Subscribe',
  lowerThirdPos: 'Kiri Bawah',
  showLyrics: false,
  lyricMethod: 'Gemini AI Studio (Cloud 1.5 Flash)',
  geminiApiKey: localStorage.getItem('gemini_api_key') || '',
  useAudiraRouter: localStorage.getItem('use_audira_router') === 'true',
  audiraRouterUrl: localStorage.getItem('audira_router_url') || 'http://localhost:20128/v1',
  audiraRouterKey: localStorage.getItem('audira_router_key') || '',
  audiraRouterModel: localStorage.getItem('audira_router_model') || 'kr/gemini-1.5-flash',
  lyricsContent: 'Ketik lirik atau paste lirik format LRC di sini...\n[00:15.30] Ini baris lirik pertama...\n[00:18.45] Dan ini baris kedua...',
  lyricTemplate: 'Standard: Tengah Mengalir (Klasik)',
  lyricFontType: 'Poppins (Estetik Modern)',
  lyricAnimation: 'Scroll: Karaoke (Sapu Warna)',
  lyricFontSize: 40,
  lyricPosition: 'X: 960 | Y: 860',
  lyricActiveBrightness: 100,
  lyricOtherDimness: 40,
  lyricTimeOffset: 0.0,
  lyricFontWeight: 'Regular',
  lyricNormalColor: '#ffffff',
  lyricActiveColor: '#00ffff',
  lyricPosX: 640.0,
  lyricPosY: 650.0,
  lyricShowOutline: true,
  lyricOutlineColor: '#000000',
  lyricOutlineWidth: 3,
  lyricShowShadow: true,
  lyricShadowColor: '#000000',
  lyricShadowDistance: 3,
  lyricShowGlow: false,
  lyricGlowColor: '#00ffff',
  lyricGlowRadius: 10,
  barColorType: 'solid',
  barColor2: '#A78BFA',
  barGradientAngle: 90
};

export default function App() {
  // 0. Authentication State (Default: Username: Admin, Password: Audira)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('audira_authenticated') === 'true' ||
           sessionStorage.getItem('audira_authenticated') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('audira_authenticated');
    sessionStorage.removeItem('audira_authenticated');
    setIsAuthenticated(false);
  };

  // 1. Settings State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // State for Direct Download Modal (Audira Clip Engine)
  const [isDirectDownloadOpen, setIsDirectDownloadOpen] = useState(false);

  const handleOpenDirectDownload = (_type: 'audio' | 'background' = 'audio') => {
    setIsDirectDownloadOpen(true);
  };

  const handleBgUploadDirect = (file: File) => {
    const url = getFileUrl(file);
    setBgFiles(prev => [...prev, file]);
    setBgUrls(prev => [...prev, url]);
    setBgFile(file);
    setBgUrl(url);
    setSettings((prev: any) => ({ ...prev, bgMode: 'upload' }));
  };

  const handleSelectDownloadedFile = (file: File, type: 'audio' | 'background') => {
    if (type === 'audio') {
      handleAudioUpload(file);
    } else {
      handleBgUploadDirect(file);
    }
  };
  // State for Active View/Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'thumbnail' | 'copilot' | 'history' | 'settings' | 'queue'>('dashboard');
  const [activeStep, setActiveStep] = useState<number | null>(1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Parallel Render Queue state
  const [isBatchQueueOpen, setIsBatchQueueOpen] = useState(false);
  const [maxParallelSlots, setMaxParallelSlots] = useState<number>(() => {
    return parseInt(localStorage.getItem('max_parallel_slots') || '2');
  });
  const [activeRenderCount, setActiveRenderCount] = useState(0);

  // Poll active render count for navbar badge
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('http://localhost:1426/queue_status');
        if (res.ok) {
          const data = await res.json();
          setActiveRenderCount(data.activeCount || 0);
        }
      } catch { /* backend offline */ }
    };
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleChangeMaxSlots = async (slots: number) => {
    setMaxParallelSlots(slots);
    localStorage.setItem('max_parallel_slots', String(slots));
    try {
      await fetch('http://localhost:1426/set_parallel_slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots })
      });
    } catch { /* backend offline */ }
  };

  const handleCancelQueueJob = async (jobId: string) => {
    try {
      await fetch(`http://localhost:1426/cancel?job_id=${jobId}`, { method: 'POST' });
      setExportHistory(prev => prev.map(item => {
        if (item.id === jobId) return { ...item, status: 'Cancelled' as any };
        return item;
      }));
    } catch { /* backend offline */ }
  };

  // State for Export History
  const [exportHistory, setExportHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('export_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('export_history', JSON.stringify(exportHistory));
  }, [exportHistory]);

  // 2. Audio & Bg Files State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgFiles, setBgFiles] = useState<File[]>([]);
  const [bgUrls, setBgUrls] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState<number>(0);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [voiceoverFile, setVoiceoverFile] = useState<File | null>(null);
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);

  const [customFontFile, setCustomFontFile] = useState<File | null>(null);
  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const [lrcFile, setLrcFile] = useState<File | null>(null);
  const [lrcFileName, setLrcFileName] = useState<string | null>(null);

  // 3. Audio Player Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 4. Export State
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    resolution: '1920x1080',
    fps: 30,
    outputPath: localStorage.getItem('export_output_path') || 'exports/visualizer.mp4',
    encoder: 'gpu',
    codec: 'h264',
    format: 'mp4',
    language: 'id',
    segmentRender: false,
    videoBitrate: 'Direkomendasikan (Auto)',
    audioBitrate: '192 kbps (Direkomendasikan)',
    encodingSpeed: 'Cepat',
    exportMode: 'render',
    streamKey: '',
    videoCRF: 23,
    audioNormalize: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isConsoleMinimized, setIsConsoleMinimized] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [exportLogHistory, setExportLogHistory] = useState<string[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'ffmpeg' | 'system' | 'warnings'>('all');
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  // Live render statistics states
  const [renderRealProgress, setRenderRealProgress] = useState<string>('0.0%');
  const [renderElapsedVideo, setRenderElapsedVideo] = useState<string>('--:--');
  const [renderTotalVideo, setRenderTotalVideo] = useState<string>('--:--');
  const [renderEncoder, setRenderEncoder] = useState<string>('Mempersiapkan...');
  const [renderElapsedReal, setRenderElapsedReal] = useState<number>(0);

  // Refs for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const voiceoverElementRef = useRef<HTMLAudioElement | null>(null);

  // Setup voiceover source
  useEffect(() => {
    if (voiceoverUrl) {
      if (!voiceoverElementRef.current) {
        voiceoverElementRef.current = new Audio(voiceoverUrl);
      } else {
        voiceoverElementRef.current.src = voiceoverUrl;
        voiceoverElementRef.current.load();
      }
    } else {
      if (voiceoverElementRef.current) {
        voiceoverElementRef.current.pause();
        voiceoverElementRef.current.src = '';
      }
    }
  }, [voiceoverUrl]);

  // Map voiceoverFile to voiceoverUrl
  useEffect(() => {
    if (voiceoverFile) {
      const url = getFileUrl(voiceoverFile);
      setVoiceoverUrl(url);
      return () => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      };
    } else {
      setVoiceoverUrl(null);
    }
  }, [voiceoverFile]);

  // Setup Web Audio Node when file changes
  useEffect(() => {
    if (audioFile) {
      const url = getFileUrl(audioFile);
      setAudioUrl(url);

      if (audioElementRef.current) {
        audioElementRef.current.src = url;
        audioElementRef.current.load();
        setIsPlaying(false);
        setCurrentTime(0);
      }

      return () => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      };}
  }, [audioFile]);

  // Audio Playback Ticker
  useEffect(() => {
    let interval: any;
    if (isPlaying && audioElementRef.current) {
      interval = setInterval(() => {
        const mainAudio = audioElementRef.current;
        const vo = voiceoverElementRef.current;
        if (mainAudio) {
          setCurrentTime(mainAudio.currentTime);
          
          // Audio Mixer volume synchronization & Auto-Ducking
          const mixer = settings.audioMixer;
          if (mixer === 'Campurkan Musik + Voiceover') {
            mainAudio.muted = false;
            if (vo) {
              vo.muted = false;
              // Synchronize current time if out of sync by > 0.3s
              if (Math.abs(vo.currentTime - mainAudio.currentTime) > 0.3) {
                vo.currentTime = mainAudio.currentTime;
              }
              if (vo.paused && !vo.ended) {
                vo.play().catch(() => {});
              }
              
              // Apply volume ducking on music when voiceover is speaking
              if (settings.autoDucking) {
                mainAudio.volume = (settings.duckingLevel ?? 25) / 100;
              } else {
                mainAudio.volume = 1.0;
              }
            } else {
              mainAudio.volume = 1.0;
            }
          } else if (mixer === 'Gunakan Voiceover Saja') {
            mainAudio.muted = true; // Still runs silently to keep visualizer active
            if (vo) {
              vo.muted = false;
              if (Math.abs(vo.currentTime - mainAudio.currentTime) > 0.3) {
                vo.currentTime = mainAudio.currentTime;
              }
              if (vo.paused && !vo.ended) {
                vo.play().catch(() => {});
              }
            }
          } else {
            // Gunakan Musik Upload Saja
            mainAudio.muted = false;
            mainAudio.volume = 1.0;
            if (vo && !vo.paused) vo.pause();
          }
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, settings.audioMixer, settings.autoDucking, settings.duckingLevel]);

  // Web Audio Context initialization
  const initAudioAnalyser = () => {
    if (!audioElementRef.current) return null;
    
    if (!audioContextRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;

        const source = ctx.createMediaElementSource(audioElementRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        audioSourceRef.current = source;
      } catch (err) {
        console.error("Failed to build Web Audio context:", err);
      }
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    return analyserRef.current;
  };

  // Play / Pause toggler
  const handlePlayPause = () => {
    if (!audioElementRef.current) return;
    
    const mainAudio = audioElementRef.current;
    const vo = voiceoverElementRef.current;
    
    if (isPlaying) {
      mainAudio.pause();
      if (vo) vo.pause();
      setIsPlaying(false);
    } else {
      initAudioAnalyser();
      mainAudio.play().then(() => {
        setIsPlaying(true);
        const mixer = settings.audioMixer;
        if (vo && (mixer === 'Campurkan Musik + Voiceover' || mixer === 'Gunakan Voiceover Saja')) {
          vo.currentTime = mainAudio.currentTime;
          vo.play().catch(e => console.warn("Voiceover play blocked:", e));
        }
      }).catch(err => {
        console.warn("Audio play blocked by browser autoplay rules:", err);
      });
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement> | File) => {
    if (e instanceof File) {
      setAudioFile(e);
    } else if (e && 'target' in e && e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length === 0) return;

      const newUrls = filesArray.map(file => getFileUrl(file));

      setBgFiles(prev => [...prev, ...filesArray]);
      setBgUrls(prev => [...prev, ...newUrls]);

      // Always set the newly uploaded file as active background and force upload mode
      setBgFile(filesArray[0]);
      setBgUrl(newUrls[0]);
      setSettings((prev: any) => ({ ...prev, bgMode: 'upload' }));
    }
  };

  const handleClearAudio = () => {
    setAudioFile(null);
    setAudioUrl(null);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
    setIsPlaying(false);
  };

  const handleClearBg = () => {
    bgUrls.forEach(url => URL.revokeObjectURL(url));
    setBgFile(null);
    setBgUrl(null);
    setBgFiles([]);
    setBgUrls([]);
    setCurrentBgIndex(0);
  };

  const handleResetToDefaults = () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus semua konten dan mengembalikan semua setelan ke setelan pabrik (default)?")) {
      return;
    }
    
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (bgUrl) URL.revokeObjectURL(bgUrl);
    bgUrls.forEach(url => URL.revokeObjectURL(url));
    if (voiceoverUrl) URL.revokeObjectURL(voiceoverUrl);
    
    setAudioFile(null);
    setAudioUrl(null);
    setBgFile(null);
    setBgUrl(null);
    setBgFiles([]);
    setBgUrls([]);
    setLogoFile(null);
    setVoiceoverFile(null);
    setVoiceoverUrl(null);
    setCurrentBgIndex(0);
    
    setSettings({
      ...DEFAULT_SETTINGS,
      geminiApiKey: localStorage.getItem('gemini_api_key') || '',
      useAudiraRouter: localStorage.getItem('use_audira_router') === 'true',
      audiraRouterUrl: localStorage.getItem('audira_router_url') || 'http://localhost:20128/v1',
      audiraRouterKey: localStorage.getItem('audira_router_key') || '',
      audiraRouterModel: localStorage.getItem('audira_router_model') || 'kr/gemini-1.5-flash'
    });
    
    setActiveStep(1);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => {
      if (key === 'applyPreset') {
        return { ...prev, ...value };
      }
      // 1. Add new spectrum layer
      if (key === 'addSpectrumLayer') {
        const nextIdx = (prev.spectrumLayers?.length || 0) + 1;
        const newLayerId = `layer_${Date.now()}`;
        const newLayer = {
          id: newLayerId,
          name: `Spektrum ${nextIdx}`,
          visualizerType: 'bars',
          barColor: '#8B5CF6',
          specShow: true,
          specFocus: 'Semua Frekuensi (Standard)',
          specGlow: false,
          specPulse: false,
          specWidthPct: 0.55,
          specScale: 1.0,
          specHeight: 0.50,
          specOpacity: 100,
          specRotation: (nextIdx - 1) * 35,
          specSpeed: 1.50,
          specReverse: 'Normal (Tidak Dibalik)',
          specPosX: 640.0,
          specPosY: 560.0
        };
        const updatedLayers = [...(prev.spectrumLayers || []), newLayer];
        return {
          ...prev,
          spectrumLayers: updatedLayers,
          activeLayerId: newLayerId,
          ...newLayer
        };
      }

      // 2. Delete spectrum layer
      if (key === 'deleteSpectrumLayer') {
        const updatedLayers = (prev.spectrumLayers || []).filter((l: any) => l.id !== value);
        const nextActiveId = updatedLayers[0]?.id || '';
        const selectedLayer = updatedLayers[0] || {};
        
        const syncedFlat = selectedLayer.id ? {
          specShow: selectedLayer.specShow,
          visualizerType: selectedLayer.visualizerType,
          barColor: selectedLayer.barColor,
          specFocus: selectedLayer.specFocus,
          specGlow: selectedLayer.specGlow,
          specPulse: selectedLayer.specPulse,
          specWidthPct: selectedLayer.specWidthPct,
          specScale: selectedLayer.specScale,
          specHeight: selectedLayer.specHeight,
          specOpacity: selectedLayer.specOpacity,
          specRotation: selectedLayer.specRotation,
          specSpeed: selectedLayer.specSpeed,
          specReverse: selectedLayer.specReverse,
          specPosX: selectedLayer.specPosX,
          specPosY: selectedLayer.specPosY
        } : {};

        return {
          ...prev,
          spectrumLayers: updatedLayers,
          activeLayerId: nextActiveId,
          ...syncedFlat
        };
      }

      // 3. Switch active layer
      if (key === 'activeLayerId') {
        const selectedLayer = (prev.spectrumLayers || []).find((l: any) => l.id === value);
        if (!selectedLayer) return { ...prev, activeLayerId: value };
        return {
          ...prev,
          activeLayerId: value,
          specShow: selectedLayer.specShow,
          visualizerType: selectedLayer.visualizerType,
          barColor: selectedLayer.barColor,
          specFocus: selectedLayer.specFocus,
          specGlow: selectedLayer.specGlow,
          specPulse: selectedLayer.specPulse,
          specWidthPct: selectedLayer.specWidthPct,
          specScale: selectedLayer.specScale,
          specHeight: selectedLayer.specHeight,
          specOpacity: selectedLayer.specOpacity,
          specRotation: selectedLayer.specRotation,
          specSpeed: selectedLayer.specSpeed,
          specReverse: selectedLayer.specReverse,
          specPosX: selectedLayer.specPosX,
          specPosY: selectedLayer.specPosY
        };
      }

      // 4. Update property within active spectrum layer
      const specKeys = ['specShow', 'visualizerType', 'barColor', 'specFocus', 'specGlow', 'specPulse', 'specWidthPct', 'specScale', 'specHeight', 'specOpacity', 'specRotation', 'specSpeed', 'specReverse', 'specPosX', 'specPosY'];
      if (specKeys.includes(key) && prev.spectrumLayers) {
        const updatedLayers = prev.spectrumLayers.map((layer: any) => {
          if (layer.id === prev.activeLayerId) {
            return { ...layer, [key]: value };
          }
          return layer;
        });
        return {
          ...prev,
          spectrumLayers: updatedLayers,
          [key]: value
        };
      }

      return { ...prev, [key]: value };
    });
  };

  const handleCustomFontUpload = async (file: File | null) => {
    if (!file) {
      setCustomFontFile(null);
      setCustomFontName(null);
      setSettings((prev: any) => ({ ...prev, customFontPath: null, customFontName: null }));
      return;
    }
    setCustomFontFile(file);
    setCustomFontName(file.name);
    
    try {
      const buffer = await file.arrayBuffer();
      const font = new FontFace('CustomUploadedFont', buffer);
      const loadedFace = await font.load();
      document.fonts.add(loadedFace);
      
      setSettings((prev: any) => ({
        ...prev,
        customFontPath: (file as any).path || file.name,
        customFontName: file.name
      }));
    } catch (err) {
      console.warn("Failed to load custom font in browser:", err);
      setSettings((prev: any) => ({
        ...prev,
        customFontPath: (file as any).path || file.name,
        customFontName: file.name
      }));
    }
  };

  const handleLrcUpload = (file: File | null) => {
    if (!file) {
      setLrcFile(null);
      setLrcFileName(null);
      return;
    }
    setLrcFile(file);
    setLrcFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setSettings((prev: any) => ({
        ...prev,
        lyricsContent: text
      }));
    };
    reader.readAsText(file);
  };

  const handleSaveTemplate = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const filename = `audira-preset-${(settings.textTitle || 'custom').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alert(`📁 Templat berhasil diunduh:\n${filename}`);
    } catch (e) {
      console.error("Failed to save template:", e);
      alert("Gagal menyimpan templat.");
    }
  };

  const handleLoadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          setSettings((prev: any) => ({
            ...prev,
            ...parsed
          }));
          alert("🎉 Templat preset gaya berhasil dimuat ke editor!");
        }
      } catch (err) {
        alert("Gagal membaca berkas templat: format JSON tidak valid.");
      }
      e.target.value = '';
    };
    fileReader.readAsText(file);
  };

  const handleExportConfigChange = (key: string, value: any) => {
    setExportConfig((prev: any) => {
      const nextConfig = { ...prev, [key]: value };
      if (key === 'format') {
        const dotIdx = prev.outputPath.lastIndexOf('.');
        if (dotIdx !== -1) {
          nextConfig.outputPath = `${prev.outputPath.substring(0, dotIdx)}.${value}`;
        }
      }
      if (key === 'outputPath') {
        localStorage.setItem('export_output_path', value);
      }
      return nextConfig;
    });
  };

  // Format time (mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = val;
    }
  };

  // Listen to Tauri progress events if running inside Tauri shell
  useEffect(() => {
    let unsubscribe: any = null;
    if (listenToTauri && typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      try {
        const promise = listenToTauri('render-progress', (event: any) => {
          const payload = event.payload as { progress: number; status: string };
          setExportProgress(payload.progress);
          setExportStatus(payload.status);

          setExportHistory(prev => prev.map(item => {
            if (item.status === 'Exporting') {
              return { ...item, progress: payload.progress, status: payload.progress >= 100 ? 'Completed' : 'Exporting' };
            }
            return item;
          }));

          if (payload.progress >= 100) {
            setIsExporting(false);
            setExportStatus('Finished exporting video successfully!');
          }
        });

        const promiseLog = listenToTauri('render-log', (event: any) => {
          const logMsg = event.payload as string;
          setExportLogHistory(prev => [...prev, logMsg]);
        });

        if (promise && typeof promise.then === 'function') {
          promise.then((unsub: any) => {
            unsubscribe = unsub;
          }).catch(() => {
            // Ignored in standard browser environment
          });
        }
        
        if (promiseLog && typeof promiseLog.then === 'function') {
          promiseLog.then((unsub: any) => {
            const oldUnsub = unsubscribe;
            unsubscribe = () => {
              if (oldUnsub) oldUnsub();
              unsub();
            };
          }).catch(() => {});
        }
      } catch (err) {
        // Ignored in standard browser environment
      }
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Trigger Python Offline Renderer Backend
  const handleExport = async () => {
    if (!audioFile) {
      alert(exportConfig.exportMode === 'stream' 
        ? "Silakan unggah file audio (.mp3/.wav) terlebih dahulu sebelum memulai siaran langsung!"
        : "Silakan unggah file audio (.mp3/.wav) terlebih dahulu di bagian setelan Media & Audio!"
      );
      return;
    }
    if (exportConfig.exportMode === 'stream' && !exportConfig.streamKey?.trim()) {
      alert(exportConfig.language === 'en'
        ? "Please enter your YouTube Stream Key first!"
        : "Silakan masukkan Kunci Streaming (Stream Key) YouTube terlebih dahulu!"
      );
      return;
    }
    setIsExporting(true);
    setIsConsoleMinimized(false);
    setExportProgress(0);
    setExportLogHistory([]);
    setExportStatus(exportConfig.exportMode === 'stream' 
      ? 'Menghubungkan ke YouTube Live (RTMP)...'
      : 'Membaca media & menyiapkan konfigurasi...'
    );

    const newHistoryId = 'exp-' + Date.now();
    const newHistoryItem: HistoryItem = {
      id: newHistoryId,
      fileName: exportConfig.outputPath,
      resolution: exportConfig.resolution,
      fps: exportConfig.fps,
      date: new Date().toLocaleString('id-ID', { hour12: false }),
      status: 'Queued',
      progress: 0
    };

    setExportHistory(prev => [newHistoryItem, ...prev]);

    const payloadMetadata = {
      audioPath: (audioFile as any)?.path || (settings as any).audioPath || null,
      backgroundPath: (bgFile as any)?.path || (settings as any).backgroundPath || null,
      logoPath: (logoFile as any)?.path || (settings as any).logoPath || null,
      voiceoverPath: (voiceoverFile as any)?.path || (settings as any).voiceoverPath || null,
      settings: {
        ...settings,
        resolution: exportConfig.resolution,
        fps: exportConfig.fps,
        encoder: exportConfig.encoder,
        codec: exportConfig.codec,
        format: exportConfig.format,
        segmentRender: exportConfig.segmentRender,
        videoBitrate: exportConfig.videoBitrate,
        audioBitrate: exportConfig.audioBitrate,
        encodingSpeed: exportConfig.encodingSpeed,
        exportMode: exportConfig.exportMode,
        streamKey: exportConfig.streamKey,
        videoCRF: exportConfig.videoCRF,
        audioNormalize: exportConfig.audioNormalize
      },
      outputPath: exportConfig.outputPath
    };

    // Prioritize local Python HTTP Server on port 1426 (avoids Tauri Rust IPC payload serialization size limits)
    try {
      setExportStatus('Menghubungkan ke Python Render Backend (http://localhost:1426)...');
      
      const formData = new FormData();
      formData.append('settings', JSON.stringify(payloadMetadata));
      if (audioFile) formData.append('audioFile', audioFile);
      if (bgFile) formData.append('backgroundFile', bgFile);
      if (logoFile) formData.append('logoFile', logoFile);
      if (voiceoverFile) formData.append('voiceoverFile', voiceoverFile);
      if (customFontFile) formData.append('fontFile', customFontFile);
      if (lrcFile) formData.append('lyricFile', lrcFile);

      const res = await fetch('http://localhost:1426/export', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP Server Error: ${res.statusText}`);
      }

      // Initialize render statistics states
      const startTimestamp = Date.now();
      setRenderElapsedReal(0);
      setRenderRealProgress('0.0%');
      setRenderElapsedVideo('--:--');
      setRenderTotalVideo('--:--');
      setRenderEncoder('Mempersiapkan...');

      let jobId = newHistoryId;
      try {
        const resData = await res.json();
        if (resData.jobId) {
          jobId = resData.jobId;
          // Update the history item ID from newHistoryId to jobId
          setExportHistory(prev => prev.map(item => {
            if (item.id === newHistoryId) {
              return { ...item, id: jobId };
            }
            return item;
          }));
        }
      } catch (e) {}

      // Poll progress from Python server
      const pollInterval = setInterval(async () => {
        try {
          const progRes = await fetch(`http://localhost:1426/progress?jobId=${jobId}`);
          if (progRes.ok) {
            const data = await progRes.json();
            setExportProgress(data.progress);
            setExportStatus(data.status);
            
            // Calculate elapsed real seconds
            const elapsedReal = Math.floor((Date.now() - startTimestamp) / 1000);
            setRenderElapsedReal(elapsedReal);
            
            // Parse status text for advanced progress metrics
            if (data.status) {
              const pctMatch = data.status.match(/\[(\d+(?:\.\d+)?)%\]/);
              if (pctMatch) setRenderRealProgress(pctMatch[1] + '%');
              
              const timeMatch = data.status.match(/time\s+([0-9:]+)\s+\/\s+([0-9:]+)/);
              if (timeMatch) {
                setRenderElapsedVideo(timeMatch[1]);
                setRenderTotalVideo(timeMatch[2]);
              }
              
              const encoderMatch = data.status.match(/\(([^)]+)\)$/);
              if (encoderMatch) {
                setRenderEncoder(encoderMatch[1]);
              }
            }

            setExportLogHistory(prev => {
              if (prev.length === 0 || prev[prev.length - 1] !== data.status) {
                return [...prev, data.status];
              }
              return prev;
            });

            if (data.queue && Array.isArray(data.queue)) {
              setExportHistory(prev => {
                return prev.map(item => {
                  const queueJob = data.queue.find((q: any) => q.id === item.id);
                  if (queueJob) {
                    let statusLabel = item.status;
                    if (queueJob.status === 'queued') statusLabel = 'Queued';
                    else if (queueJob.status === 'rendering') statusLabel = `Rendering ${queueJob.progress}%`;
                    else if (queueJob.status === 'completed') statusLabel = 'Completed';
                    else if (queueJob.status === 'failed') statusLabel = 'Failed';
                    else if (queueJob.status === 'cancelled') statusLabel = 'Cancelled';
                    
                    return {
                      ...item,
                      progress: queueJob.progress,
                      status: statusLabel as any
                    };
                  }
                  return item;
                });
              });
            }

            if (data.progress >= 100 || !data.isRendering) {
              clearInterval(pollInterval);
              setIsExporting(false);
            }
          }
        } catch (e) {
          console.warn("Error polling progress:", e);
          clearInterval(pollInterval);
          setIsExporting(false);
        }
      }, 500);

    } catch (httpErr) {
      console.warn("Python HTTP server offline/unreachable, falling back to local runner...", httpErr);

      if (invokeTauri) {
        // Fallback to Rust subprocess runner in Tauri mode
        try {
          setExportStatus('Menjalankan rendering via Rust Controller subprocess...');
          
          // Update status in history to 'Exporting' so progress events can update it and the console is visible
          setExportHistory(prev => prev.map(item => {
            if (item.id === newHistoryId) {
              return { ...item, status: 'Exporting' };
            }
            return item;
          }));
          
          let audioData: string | null = null;
          let backgroundData: string | null = null;
          let logoData: string | null = null;
          let voiceoverData: string | null = null;
          let fontData: string | null = null;
          let lyricData: string | null = null;
          try {
            if (audioFile && !(audioFile as any).path) {
              audioData = await readFileAsBase64(audioFile);
            }
            if (bgFile && !(bgFile as any).path) {
              backgroundData = await readFileAsBase64(bgFile);
            }
            if (logoFile && !(logoFile as any).path) {
              logoData = await readFileAsBase64(logoFile);
            }
            if (voiceoverFile && !(voiceoverFile as any).path) {
              voiceoverData = await readFileAsBase64(voiceoverFile);
            }
            if (customFontFile && !(customFontFile as any).path) {
              fontData = await readFileAsBase64(customFontFile);
            }
            if (lrcFile && !(lrcFile as any).path) {
              lyricData = await readFileAsBase64(lrcFile);
            }
          } catch (err) {
            console.warn("Could not read files as base64 for Tauri fallback:", err);
          }

          const configPayload = {
            ...payloadMetadata,
            audioData,
            backgroundData,
            logoData,
            voiceoverData,
            fontData,
            lyricData
          };

          await invokeTauri('export_video', { config: JSON.stringify(configPayload) });
        } catch (tauriErr) {
          console.error("Tauri backend call failed:", tauriErr);
          setExportStatus(`Error calling Rust controller: ${tauriErr}`);
          setIsExporting(false);
          setExportHistory(prev => prev.map(item => {
            if (item.id === newHistoryId) {
              return { ...item, status: 'Failed' };
            }
            return item;
          }));
        }
      } else {
        // Fallback to Browser Mode mock simulation
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 5;
          setExportProgress(currentProgress);
          setExportStatus(`[Browser Mode] Rendering frames... ${currentProgress}%`);

          setExportHistory(prev => prev.map(item => {
            if (item.id === newHistoryId) {
              return { ...item, progress: currentProgress, status: currentProgress >= 100 ? 'Completed' : 'Exporting' };
            }
            return item;
          }));

          if (currentProgress >= 100) {
            clearInterval(interval);
            setIsExporting(false);
            setExportStatus('Finished render simulation! (Video exported to exports/visualizer.mp4)');
          }
        }, 150);
      }
    }
  };

  const handleCancelExport = async () => {
    try {
      setExportStatus(exportConfig.exportMode === 'stream' 
        ? 'Menghentikan live streaming YouTube...' 
        : 'Membatalkan proses ekspor video...'
      );
      const res = await fetch('http://localhost:1426/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setIsExporting(false);
        setExportStatus('Proses dihentikan oleh pengguna.');
      } else {
        throw new Error('Server returned error');
      }
    } catch (e) {
      console.warn("Could not send stop signal to backend HTTP server, forcing UI stop:", e);
      setIsExporting(false);
      setExportStatus('Proses dihentikan (UI Force Stop).');
    }
  };

  // Actions & Handlers for Dashboard, Settings, and History
  const handleSelectPreset = (config: Record<string, any>) => {
    setSettings(prev => ({
      ...prev,
      ...config
    }));
    setActiveTab('editor');
  };

  const handleDeleteHistory = async (id: string) => {
    const target = exportHistory.find(item => item.id === id);
    if (target && (target.status === 'Queued' || target.status.toLowerCase().includes('rendering') || target.status === 'Exporting')) {
      try {
        await fetch(`http://localhost:1426/cancel?job_id=${id}`, { method: 'POST' });
      } catch (err) {
        console.warn("Failed to cancel job on delete:", err);
      }
    }
    setExportHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat ekspor?")) {
      setExportHistory([]);
    }
  };

  const handleSaveGeminiApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setSettings(prev => ({
      ...prev,
      geminiApiKey: key
    }));
  };

  const handleSaveAudiraRouterSettings = (useRouter: boolean, url: string, key: string, model: string) => {
    localStorage.setItem('use_audira_router', useRouter ? 'true' : 'false');
    localStorage.setItem('audira_router_url', url);
    localStorage.setItem('audira_router_key', key);
    localStorage.setItem('audira_router_model', model);
    setSettings(prev => ({
      ...prev,
      useAudiraRouter: useRouter,
      audiraRouterUrl: url,
      audiraRouterKey: key,
      audiraRouterModel: model
    }));
  };

  const handleSaveOutputPath = (path: string) => {
    localStorage.setItem('export_output_path', path);
    setExportConfig(prev => ({
      ...prev,
      outputPath: path
    }));
  };

  const handleChooseOutputPath = async () => {
    try {
      const res = await fetch('http://localhost:1426/select_output_file');
      if (res.ok) {
        const data = await res.json();
        if (data.selectedPath) {
          handleSaveOutputPath(data.selectedPath);
        }
      }
    } catch (e) {
      console.warn("Failed to choose output path:", e);
    }
  };

  const handleResetAllSettings = () => {
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('export_output_path');
    localStorage.removeItem('export_history');
    localStorage.removeItem('use_audira_router');
    localStorage.removeItem('audira_router_url');
    localStorage.removeItem('audira_router_key');
    localStorage.removeItem('audira_router_model');
    setSettings(prev => ({
      ...prev,
      geminiApiKey: '',
      useAudiraRouter: false,
      audiraRouterUrl: 'http://localhost:20128/v1',
      audiraRouterKey: '',
      audiraRouterModel: 'kr/gemini-1.5-flash'
    }));
    setExportConfig(prev => ({
      ...prev,
      outputPath: 'exports/visualizer.mp4'
    }));
    setExportHistory([]);
  };

  if (!isAuthenticated) {
    return <LandingPageView onEnterStudio={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAF6ED] font-sans antialiased overflow-hidden select-none">
      {/* 1. Header Navigation Bar */}
      <header className="px-6 py-4 bg-[#FAF6ED] border-b-[3px] border-black flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#8B5CF6] border-2 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000]">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-wider uppercase text-black">
              AudioMix Studio
            </h1>
            <p className="text-[10px] text-black/60 tracking-wider uppercase font-extrabold">Tauri v2 Desktop App</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold text-black flex items-center gap-1.5 shadow-[2px_2px_0px_#000]">
            <Info className="w-4 h-4 text-black" />
            <span>WebGL GPU acceleration active</span>
          </div>
        </div>
      </header>

      {/* Main content body with left navigation sidebar */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Slim Left Sidebar Navigation */}
        <nav className="w-20 bg-[#FAF6ED] border-r-[3px] border-black flex flex-col justify-between items-center py-6 z-10 shadow-[2px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-5 w-full px-2">
            {/* Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000]'
              }`}
              title="Dashboard"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            {/* Editor Tab */}
            <button
              onClick={() => setActiveTab('editor')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all ${
                activeTab === 'editor'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000]'
              }`}
              title="Editor Workspace"
            >
              <Sliders className="w-5 h-5" />
              <span>Studio</span>
            </button>

            {/* Thumbnail Studio Tab */}
            <button
              onClick={() => setActiveTab('thumbnail')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all ${
                activeTab === 'thumbnail'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000]'
              }`}
              title="Thumbnail Studio"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Cover</span>
            </button>

            {/* AI Copilot Tab */}
            <button
              onClick={() => setActiveTab('copilot')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all ${
                activeTab === 'copilot'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000]'
              }`}
              title="AI Copilot Studio"
            >
              <Sparkles className="w-5 h-5" />
              <span>AI Copilot</span>
            </button>

            {/* History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all ${
                activeTab === 'history'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000]'
              }`}
              title="Riwayat Ekspor & Konsol"
            >
              <Clock className="w-5 h-5" />
              <span>Riwayat</span>
            </button>

            {/* Render Queue Tab — opens full page QueueView */}
            <button
              onClick={() => setActiveTab('queue')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all relative ${
                activeTab === 'queue'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white hover:bg-amber-100 text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000]'
              }`}
              title="Render Queue — Paralel Halaman Utuh"
            >
              <div className="relative">
                <Layers className="w-5 h-5" />
                {activeRenderCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-[#10B981] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-black animate-pulse shadow-[1px_1px_0px_#000]">
                    {activeRenderCount}
                  </span>
                )}
              </div>
              <span>Queue</span>
            </button>
          </div>

          {/* Section Divider Line */}
          <div className="w-full px-3">
            <div className="border-t-2 border-black/20 my-1" />
          </div>

          <div className="w-full px-2 flex flex-col gap-3">
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all w-full ${
                activeTab === 'settings'
                  ? 'bg-[#8B5CF6] text-white shadow-[2px_2px_0px_#000] translate-y-[-1px]'
                  : 'bg-white hover:bg-amber-100 text-black shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000]'
              }`}
              title="Pengaturan Studio"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Setelan</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-3 rounded-xl border-2 border-black flex flex-col items-center justify-center gap-1 font-bold text-[9px] uppercase tracking-wider transition-all w-full bg-red-100 hover:bg-red-200 text-red-700 shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2.5px_2.5px_0px_#000] active:translate-y-[1px] cursor-pointer"
              title="Keluar dari Studio (Lock Screen)"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </div>
        </nav>

        {/* Batch Render Queue Panel — Overlay/Drawer */}
        <BatchQueuePanel
          isOpen={isBatchQueueOpen}
          onClose={() => setIsBatchQueueOpen(false)}
          onCancelJob={handleCancelQueueJob}
          maxParallelSlots={maxParallelSlots}
          onChangeMaxSlots={handleChangeMaxSlots}
        />

        {/* Dynamic Views Rendering based on activeTab */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            onSelectPreset={handleSelectPreset}
            exportCount={exportHistory.filter(h => h.status === 'Completed').length}
            lastExportStatus={exportStatus}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'thumbnail' && (
          <ThumbnailStudioView 
            initialTitle={settings.textTitle}
            initialArtist={settings.textArtist}
            initialBgUrl={bgUrl}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilotView 
            apiKey={settings.geminiApiKey}
            songTitle={settings.textTitle}
            artistName={settings.textArtist}
            useAudiraRouter={settings.useAudiraRouter}
            audiraRouterUrl={settings.audiraRouterUrl}
            audiraRouterKey={settings.audiraRouterKey}
            audiraRouterModel={settings.audiraRouterModel}
          />
        )}

        {activeTab === 'editor' && (
          <main className="flex-1 flex overflow-hidden w-full h-full relative">
            {/* Left Side: Visualizer Settings Panel */}
            <aside className={`h-full flex flex-col border-r-[3px] border-black bg-[#FAF6ED] transition-all duration-300 relative ${
              isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden border-r-0' : 'w-[360px] lg:w-[400px] shrink-0'
            }`}>
              <SpectrumEditor
                settings={settings}
                onChange={handleSettingChange}
                onResetToDefaults={handleResetToDefaults}
                onAudioUpload={handleAudioUpload}
                onBgUpload={handleBgUpload}
                onClearAudio={handleClearAudio}
                onClearBg={handleClearBg}
                onAiBgGenerated={(url, name) => {
                  setBgUrl(url);
                  setBgFile(new File([], name));
                }}
                onOpenDirectDownload={handleOpenDirectDownload}
                audioName={audioFile ? audioFile.name : null}
                bgNames={bgFiles.map(f => f.name)}
                activeStep={activeStep}
                onActiveStepChange={setActiveStep}
                onLogoUpload={(file) => setLogoFile(file)}
                logoName={logoFile ? logoFile.name : null}
                onVoiceoverUpload={(file) => setVoiceoverFile(file)}
                voiceoverName={voiceoverFile ? voiceoverFile.name : null}
                onCustomFontUpload={handleCustomFontUpload}
                customFontName={customFontName}
                onLrcUpload={handleLrcUpload}
                lrcFileName={lrcFileName}
                onSaveTemplate={handleSaveTemplate}
                onLoadTemplate={handleLoadTemplate}
              />
            </aside>

            {/* Collapse/Expand Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="absolute top-4 left-3 z-30 p-2 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] hover:bg-amber-200 active:translate-y-[1px] transition-all font-black text-xs flex items-center justify-center cursor-pointer"
              title={isSidebarCollapsed ? "Tampilkan Menu Pengaturan" : "Sembunyikan Menu (Mode Layar Penuh)"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5 text-black" /> : <ChevronLeft className="w-5 h-5 text-black" />}
            </button>

            {/* Right Side: Video Preview Panel & Audio Controls */}
            <div className={`flex-1 p-6 flex flex-col justify-between gap-4 overflow-y-auto w-full h-full bg-[#FAF6ED] transition-all duration-300 ${
              isSidebarCollapsed ? 'pl-16' : ''
            }`}>
              <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0 max-h-[calc(100vh-230px)]">
                <PreviewCanvas
                  backgroundImage={bgUrls[currentBgIndex] || bgUrl}
                  audioAnalyser={analyserRef.current}
                  settings={settings}
                  isPlaying={isPlaying}
                  activeStep={activeStep}
                  bgUrls={bgUrls}
                  currentBgIndex={currentBgIndex}
                  onBgIndexChange={setCurrentBgIndex}
                  currentTime={currentTime}
                  duration={duration}
                  onChange={handleSettingChange}
                />
              </div>

              <audio 
                ref={audioElementRef} 
                className="hidden" 
                onLoadedMetadata={() => {
                  if (audioElementRef.current) {
                    setDuration(audioElementRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="bg-[#FEF8EC] p-5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold text-black">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.01"
                    value={currentTime}
                    onChange={handleTimelineChange}
                    className="flex-1 neo-slider"
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="loop-playback"
                      className="w-4.5 h-4.5 border-2 border-black bg-white rounded cursor-pointer accent-black"
                    />
                    <label htmlFor="loop-playback" className="text-xs font-bold text-black cursor-pointer select-none">
                      Ulangi dari Awal (Loop)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { if (audioElementRef.current) audioElementRef.current.currentTime = 0; }}
                      className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px]"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={handlePlayPause}
                      disabled={!audioUrl}
                      className={`w-10 h-10 rounded border-2 border-black flex items-center justify-center font-bold text-sm transition-all shadow-[2px_2px_0px_#000] ${
                        audioUrl 
                          ? 'bg-white text-black hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000]' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button 
                      onClick={() => {
                        if (audioElementRef.current) {
                          audioElementRef.current.pause();
                          audioElementRef.current.currentTime = 0;
                          setIsPlaying(false);
                        }
                      }}
                      className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000]"
                    >
                      ■
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs">🔊</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      defaultValue="0.8"
                      onChange={(e) => {
                         if (audioElementRef.current) {
                           audioElementRef.current.volume = parseFloat(e.target.value);
                         }
                      }}
                      className="w-20 neo-slider"
                    />
                  </div>
                </div>
              </div>

              {/* Save Location Selector Exposed on Main Workspace Sidebar */}
              <div className="p-4 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] text-xs font-bold space-y-2 mb-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-black uppercase tracking-wider text-[9px]">&gt;_ LOKASI & NAMA FILE OUTPUT</span>
                  <span className="text-[8px] text-[#8B5CF6] uppercase font-black">Mandatori</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={exportConfig.outputPath}
                    onChange={(e) => handleSaveOutputPath(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border-2 border-black rounded font-mono text-[9px] text-black/80 focus:outline-none"
                    placeholder="Contoh: D:/Render/video.mp4"
                  />
                  <button
                    type="button"
                    onClick={handleChooseOutputPath}
                    className="px-3 py-2 bg-[#8B5CF6] text-white border-2 border-black rounded font-black text-[9px] uppercase shadow-[1.5px_1.5px_0px_#000] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-[0.5px_0.5px_0px_#000] transition-all cursor-pointer"
                  >
                    Pilih...
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handlePlayPause}
                  disabled={!audioUrl}
                  className="py-4 neo-btn-secondary text-sm uppercase font-black tracking-wider flex items-center justify-center gap-2"
                >
                  <span>{isPlaying ? '⏹ HENTIKAN PREVIEW' : '▷ MULAI PREVIEW'}</span>
                </button>

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="py-4 neo-btn-primary text-sm uppercase font-black tracking-wider flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>
                        {exportConfig.exportMode === 'stream' 
                          ? `STREAMING (${exportProgress}%)` 
                          : `MENGEXPORT (${exportProgress}%)`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 text-white" />
                      <span>
                        {exportConfig.exportMode === 'stream' 
                          ? 'MULAI LIVE STREAM YOUTUBE' 
                          : 'MULAI RENDER MP4'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
                className="w-full py-3 bg-[#FFF] border-[2.5px] border-black rounded-lg font-black text-xs uppercase tracking-wider text-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_#000] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[1px] transition-all"
              >
                <span>{showAdvancedPanel ? '▲ TUTUP PENGATURAN RESOLUSI & METADATA' : '▼ TAMPILKAN PENGATURAN RESOLUSI & METADATA'}</span>
              </button>

              {showAdvancedPanel && (
                <OutputMetadataDrawer 
                  settings={settings} 
                  exportConfig={exportConfig}
                  onChangeExportConfig={handleExportConfigChange}
                  onExport={handleExport}
                  isExporting={isExporting}
                />
              )}

              {isExporting && !isConsoleMinimized && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-6 select-none animate-fadeIn text-black">
                  <div className="bg-[#FEF8EC] border-[4px] border-black rounded-2xl p-6 w-full max-w-6xl shadow-[8px_8px_0px_#000] min-h-[580px] flex flex-col justify-between animate-scaleUp text-black">
                    
                    {/* Header Title */}
                    <div className="flex items-center justify-between pb-4 border-b-3 border-black">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#8B5CF6] border-2 border-black flex items-center justify-center shadow-[2.5px_2.5px_0px_#000]">
                          <RefreshCw className="w-6 h-6 text-white animate-spin" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-black uppercase tracking-wider text-black">
                            {exportConfig.exportMode === 'stream' ? 'YouTube Live Streaming Console' : 'Console Ekspor MP4 Video'}
                          </h3>
                          <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">
                            FFmpeg Engine Subprocess Renderer
                          </p>
                        </div>
                      </div>
                      
                      {/* Active/Minimize Badges */}
                      <div className="flex items-center gap-3">
                        {exportProgress < 100 && (
                          <button
                            type="button"
                            onClick={() => setIsConsoleMinimized(true)}
                            className="px-3 py-1 bg-[#F59E0B] text-black border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1"
                            title="Sembunyikan ke Latar Belakang (Minimize)"
                          >
                            <span>Minimize</span>
                          </button>
                        )}
                        
                        {exportProgress < 100 ? (
                          <div className="px-3 py-1 bg-emerald-100 border-2 border-black rounded-full text-[10px] font-black text-emerald-800 uppercase tracking-wider animate-pulse">
                            ● PROCESSING
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-red-100 border-2 border-black rounded-full text-[10px] font-black text-red-800 uppercase tracking-wider">
                            ■ STOPPED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main Three-Column Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 flex-1">
                      
                      {/* Column 1: Progress & Performance Metrics (lg:col-span-4) */}
                      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                        
                        {/* Circular/Bar Progress Box */}
                        <div className="flex flex-col items-center justify-center p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] relative overflow-hidden flex-1 justify-center">
                          <span className="text-[10px] font-black text-black/40 uppercase tracking-wider mb-2">Overall Export Progress</span>
                          <div className="text-5xl font-black text-black tracking-tighter mb-1">
                            {exportProgress}%
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-3 text-center">
                            Video Duration Encoded: {renderRealProgress}
                          </span>
                          
                          <div className="w-full bg-[#FAF6ED] border-2 border-black rounded-full h-5 overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <div 
                              className="bg-[#10B981] h-full transition-all duration-300 border-r-2 border-black" 
                              style={{ width: `${exportProgress}%` }}
                            />
                          </div>
                        </div>

                        {/* Real-time Render Performance Grid */}
                        <div className="p-4 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] space-y-3 text-xs font-bold">
                          <span className="text-[9px] font-black text-black/40 uppercase tracking-wider block border-b-2 border-black/10 pb-1">
                            Live Performance Metrics
                          </span>
                          
                          <div className="grid grid-cols-2 gap-3 text-left">
                            <div className="p-2.5 bg-slate-50 border-2 border-black/10 rounded-lg space-y-0.5">
                              <span className="text-[8px] text-black/50 uppercase block">Waktu Berjalan (Real)</span>
                              <span className="text-sm font-black font-mono">
                                {(() => {
                                  const h = Math.floor(renderElapsedReal / 3600);
                                  const m = Math.floor((renderElapsedReal % 3600) / 60);
                                  const s = renderElapsedReal % 60;
                                  return h > 0 
                                    ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
                                    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                })()}
                              </span>
                            </div>
                            
                            <div className="p-2.5 bg-slate-50 border-2 border-black/10 rounded-lg space-y-0.5">
                              <span className="text-[8px] text-black/50 uppercase block">Estimasi Sisa (ETA)</span>
                              <span className="text-sm font-black font-mono text-[#8B5CF6]">
                                {(() => {
                                  const progressFloat = parseFloat(renderRealProgress);
                                  if (isNaN(progressFloat) || progressFloat <= 0) return '--:--';
                                  const totalEstSeconds = renderElapsedReal / (progressFloat / 100);
                                  const remainingSeconds = Math.max(0, Math.floor(totalEstSeconds - renderElapsedReal));
                                  const h = Math.floor(remainingSeconds / 3600);
                                  const m = Math.floor((remainingSeconds % 3600) / 60);
                                  const s = remainingSeconds % 60;
                                  return h > 0 
                                    ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
                                    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                })()}
                              </span>
                            </div>
                            
                            <div className="p-2.5 bg-slate-50 border-2 border-black/10 rounded-lg space-y-0.5">
                              <span className="text-[8px] text-black/50 uppercase block">Kecepatan Render</span>
                              <span className="text-sm font-black font-mono text-emerald-600">
                                {(() => {
                                  const parseTimeToSecs = (timeStr: string) => {
                                    if (timeStr === '--:--' || !timeStr) return 0;
                                    const parts = timeStr.split(':').map(Number);
                                    return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
                                  };
                                  const elapsedVideoSecs = parseTimeToSecs(renderElapsedVideo);
                                  if (elapsedVideoSecs > 0 && renderElapsedReal > 0) {
                                    return `${(elapsedVideoSecs / renderElapsedReal).toFixed(1)}x`;
                                  }
                                  return '--';
                                })()}
                              </span>
                            </div>
                            
                            <div className="p-2.5 bg-slate-50 border-2 border-black/10 rounded-lg space-y-0.5">
                              <span className="text-[8px] text-black/50 uppercase block">Framerate Ekspor</span>
                              <span className="text-sm font-black font-mono text-sky-600">
                                {(() => {
                                  const parseTimeToSecs = (timeStr: string) => {
                                    if (timeStr === '--:--' || !timeStr) return 0;
                                    const parts = timeStr.split(':').map(Number);
                                    return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
                                  };
                                  const elapsedVideoSecs = parseTimeToSecs(renderElapsedVideo);
                                  if (elapsedVideoSecs > 0 && renderElapsedReal > 0) {
                                    const frames = elapsedVideoSecs * exportConfig.fps;
                                    return `${Math.round(frames / renderElapsedReal)} FPS`;
                                  }
                                  return '--';
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Column 2: Assets & Config Metadata Details (lg:col-span-4) */}
                      <div className="lg:col-span-4 p-4 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#000] text-xs font-bold space-y-2.5 text-left flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black text-black/40 uppercase tracking-wider block border-b-2 border-black/10 pb-1 mb-3">
                            Configuration & Assets
                          </span>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between border-b border-black/5 pb-1">
                              <span className="text-black/60">Resolusi Output:</span>
                              <span className="font-mono">{exportConfig.resolution}</span>
                            </div>
                            <div className="flex justify-between border-b border-black/5 pb-1">
                              <span className="text-black/60">Target Frame Rate:</span>
                              <span className="font-mono">{exportConfig.fps} fps</span>
                            </div>
                            <div className="flex justify-between border-b border-black/5 pb-1">
                              <span className="text-black/60">Active Video Codec:</span>
                              <span className="font-mono text-violet-700 max-w-[140px] truncate block text-right">
                                {renderEncoder}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-black/5 pb-1">
                              <span className="text-black/60">Format Video:</span>
                              <span className="font-mono uppercase">{exportConfig.format}</span>
                            </div>
                            <div className="flex justify-between border-b border-black/5 pb-1">
                              <span className="text-black/60">Durasi Video:</span>
                              <span className="font-mono">{renderTotalVideo}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-black/10 pt-3 space-y-2 mt-auto">
                          <span className="text-[9px] font-black text-black/40 uppercase tracking-wider block mb-1">Source Assets File</span>
                          <div className="space-y-1 text-[10px] text-black/80">
                            <div className="truncate"><span className="text-black/50 font-medium">🎵 Audio:</span> {audioFile ? audioFile.name : 'temp_fallback_audio.mp3'}</div>
                            <div className="truncate"><span className="text-black/50 font-medium">🖼 Background:</span> {bgFile ? bgFile.name : 'temp_fallback_bg.jpg'}</div>
                            <div className="truncate"><span className="text-black/50 font-medium">📁 Export To:</span> {exportConfig.outputPath}</div>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Full Height Scrollable Terminal (lg:col-span-4) */}
                      <div className="lg:col-span-4 flex flex-col h-full min-h-[350px]">
                        <div className="flex-1 bg-black border-3 border-black rounded-xl p-4 font-mono text-[10px] text-[#10B981] flex flex-col shadow-[4px_4px_0px_#000] relative">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#047857]/30 pb-2 mb-2 gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#059669]">&gt;_ Terminal Log Output</span>
                            
                            <div className="flex flex-wrap gap-1">
                              {(['all', 'system', 'ffmpeg', 'warnings'] as const).map(f => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => setLogFilter(f)}
                                  className={`px-1.5 py-0.5 border border-emerald-600 rounded text-[8px] font-bold uppercase transition-all select-none cursor-pointer ${
                                    logFilter === f ? 'bg-[#10B981] text-black' : 'bg-transparent text-[#10B981] hover:bg-emerald-950'
                                  }`}
                                >
                                  {f}
                                </button>
                              ))}
                              
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(exportLogHistory.join('\n'));
                                  alert("Seluruh log berhasil disalin!");
                                }}
                                className="px-1.5 py-0.5 border border-emerald-600 rounded text-[8px] font-bold uppercase bg-[#10B981] text-black hover:bg-emerald-400 cursor-pointer ml-1"
                              >
                                Salin Log
                              </button>
                            </div>
                            
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shrink-0 hidden sm:block" />
                          </div>
                          
                          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[310px] text-left font-mono">
                            {exportLogHistory
                              .filter(log => {
                                if (logFilter === 'all') return true;
                                if (logFilter === 'ffmpeg') return log.includes('FFMPEG:');
                                if (logFilter === 'system') return !log.includes('FFMPEG:');
                                if (logFilter === 'warnings') return log.toLowerCase().includes('warning') || log.toLowerCase().includes('error');
                                return true;
                              })
                              .map((log, idx) => (
                                <div key={idx} className="break-all font-mono leading-relaxed text-[#10B981]/90">
                                  <span className="text-emerald-700 select-none">[{idx + 1}]</span> &gt;&gt; {log}
                                </div>
                              ))}
                            {/* Auto-scroll anchor */}
                            <div ref={(el) => { if (el) el.scrollIntoView({ behavior: 'smooth' }); }} />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-2 space-y-4">
                      {/* Success / Failure Banner inside the modal */}
                      {exportProgress >= 100 && (
                        <div className={`p-4 rounded-xl border-3 border-black shadow-[4px_4px_0px_#000] flex items-center gap-3 text-left ${
                          exportStatus.toLowerCase().includes('failed')
                            ? 'bg-red-50 border-red-500 text-red-905'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-905'
                        }`}>
                          {exportStatus.toLowerCase().includes('failed') ? (
                            <>
                              <XCircle className="w-9 h-9 text-red-600 shrink-0" />
                              <div>
                                <h4 className="font-black text-xs uppercase text-red-900">Proses Render Gagal!</h4>
                                <p className="text-[10px] font-bold text-red-700/80">{exportStatus}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-black text-xs uppercase text-emerald-900">Video Berhasil Dirender!</h4>
                                <p className="text-[10px] font-bold text-emerald-700/80">
                                  File tersimpan di: <span className="font-mono">{exportConfig.outputPath}</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (revealFile) {
                                    try {
                                      await revealFile(exportConfig.outputPath);
                                    } catch (e) {
                                      alert(`Lokasi file: ${exportConfig.outputPath}`);
                                    }
                                  } else {
                                    alert(`Lokasi file: ${exportConfig.outputPath}`);
                                  }
                                }}
                                className="px-3 py-1.5 bg-white border-2 border-black rounded-lg text-[9px] font-black uppercase tracking-wider hover:translate-y-[-1px] shadow-[2px_2px_0px_#000] transition-all cursor-pointer text-black"
                              >
                                Buka Folder
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {exportProgress >= 100 ? (
                        <button
                          type="button"
                          onClick={() => setIsExporting(false)}
                          className={`w-full py-3.5 ${
                            exportStatus.toLowerCase().includes('failed')
                              ? 'bg-[#EF4444] hover:bg-[#DC2626]'
                              : 'bg-[#10B981] hover:bg-[#059669]'
                          } text-white border-3 border-black rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer`}
                        >
                          <span>{exportStatus.toLowerCase().includes('failed') ? 'TUTUP (RENDER GAGAL)' : 'SELESAI & TUTUP'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCancelExport}
                          className="w-full py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white border-3 border-black rounded-xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>{exportConfig.exportMode === 'stream' ? '⏹ HENTIKAN SIARAN LIVE' : '⏹ BATALKAN PROSES EKSPOR'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {activeTab === 'history' && (
          <HistoryView 
            history={exportHistory}
            onDeleteHistory={handleDeleteHistory}
            onClearHistory={handleClearHistory}
            onMaximizeConsole={() => {
              setIsConsoleMinimized(false);
              setActiveTab('editor');
            }}
            isExporting={isExporting}
            exportProgress={exportProgress}
            exportStatus={exportStatus}
            renderElapsedReal={renderElapsedReal}
            renderRealProgress={renderRealProgress}
            renderElapsedVideo={renderElapsedVideo}
            renderTotalVideo={renderTotalVideo}
            renderEncoder={renderEncoder}
            exportLogHistory={exportLogHistory}
            logFilter={logFilter}
            setLogFilter={setLogFilter as any}
            onCancelExport={handleCancelExport}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            geminiApiKey={settings.geminiApiKey}
            onSaveGeminiApiKey={handleSaveGeminiApiKey}
            outputPath={exportConfig.outputPath}
            onSaveOutputPath={handleSaveOutputPath}
            onResetAllSettings={handleResetAllSettings}
            useAudiraRouter={settings.useAudiraRouter}
            audiraRouterUrl={settings.audiraRouterUrl}
            audiraRouterKey={settings.audiraRouterKey}
            audiraRouterModel={settings.audiraRouterModel}
            onSaveAudiraRouterSettings={handleSaveAudiraRouterSettings}
          />
        )}

        {activeTab === 'queue' && (
          <QueueView 
            onCancelJob={handleCancelQueueJob}
            maxParallelSlots={maxParallelSlots}
            onChangeMaxSlots={handleChangeMaxSlots}
            onNavigateToStudio={() => setActiveTab('editor')}
          />
        )}
        {/* Direct Download Modal (yt-dlp Audira Clip Engine) */}
        <DirectDownloadModal 
          isOpen={isDirectDownloadOpen}
          onClose={() => setIsDirectDownloadOpen(false)}
          onSelectDownloadedFile={handleSelectDownloadedFile}
        />
      </div>

      {/* 3. Footer Mockup Status Bar */}
      <footer className="px-6 py-2.5 bg-[#FAF6ED] border-t-[3px] border-black z-10 flex flex-wrap gap-2 items-center justify-between text-[10px] font-black uppercase tracking-wider text-black/70">
        <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
          <span>Background: <strong className="text-black">{bgFile ? bgFile.name : 'No Image/Video Selected'}</strong></span>
          <span>•</span>
          <span>Audio: <strong className="text-black">{audioFile ? audioFile.name : 'No MP3 Selected'}</strong></span>
          <span>•</span>
          <span>Config: <strong className="text-black">{exportConfig.resolution} @ {exportConfig.fps} FPS</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#FFDE4D] text-black px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] text-[9px] font-black">
            License & Copyright © 2026 by AUDIRA (Agus Dwi R)
          </span>
        </div>
      </footer>
      {/* Minimized Background Render Status Bar */}
      {isExporting && isConsoleMinimized && (
        <div 
          onClick={() => setIsConsoleMinimized(false)}
          className="fixed bottom-16 right-6 z-50 bg-[#FEF8EC] border-3 border-black p-4 rounded-xl shadow-[4px_4px_0px_#000] flex items-center gap-3 font-black text-[11px] text-black hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] transition-all cursor-pointer animate-bounce text-left"
          title="Klik untuk membuka Console Ekspor kembali"
        >
          <div className="w-7 h-7 rounded bg-[#8B5CF6] border-2 border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="uppercase text-black/85 tracking-wide">Background Rendering</span>
              <span className="px-1.5 py-0.5 bg-[#10B981]/25 text-emerald-800 rounded font-mono text-[9px] border border-emerald-400">
                {exportProgress}%
              </span>
            </div>
            <p className="text-[9px] font-bold text-black/50 uppercase mt-1 max-w-[200px] truncate">
              {exportStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
