import React, { useEffect, useRef } from 'react';
import { Maximize2 } from 'lucide-react';

interface PreviewCanvasProps {
  backgroundImage: string | null;
  audioAnalyser: AnalyserNode | null;
  settings: Record<string, any>;
  isPlaying: boolean;
  activeStep: number | null;
  bgUrls: string[];
  currentBgIndex: number;
  onBgIndexChange: (idx: number) => void;
  currentTime: number;
  duration: number;
  onChange?: (key: string, value: any) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  backgroundImage,
  audioAnalyser,
  settings,
  isPlaying,
  activeStep,
  bgUrls,
  currentBgIndex,
  onBgIndexChange,
  currentTime,
  duration,
  onChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Store active props in refs so render loop always sees live values
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const audioAnalyserRef = useRef(audioAnalyser);
  audioAnalyserRef.current = audioAnalyser;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const activeStepRef = useRef(activeStep);
  activeStepRef.current = activeStep;

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const dragRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = ((e.clientX - rect.left) / rect.width) * 1280;
    const canvasY = ((e.clientY - rect.top) / rect.height) * 720;

    const currentPosX = settingsRef.current.specPosX ?? 640;
    const currentPosY = settingsRef.current.specPosY ?? 560;

    const dist = Math.hypot(canvasX - currentPosX, canvasY - currentPosY);
    if (dist < 180) {
      dragRef.current = {
        isDragging: true,
        offsetX: canvasX - currentPosX,
        offsetY: canvasY - currentPosY
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = ((e.clientX - rect.left) / rect.width) * 1280;
    const canvasY = ((e.clientY - rect.top) / rect.height) * 720;

    const newPosX = Math.max(0, Math.min(1280, canvasX - dragRef.current.offsetX));
    const newPosY = Math.max(0, Math.min(720, canvasY - dragRef.current.offsetY));

    if (onChange) {
      onChange('specPosX', newPosX);
      onChange('specPosY', newPosY);
    }
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = ((e.clientX - rect.left) / rect.width) * 1280;
      const canvasY = ((e.clientY - rect.top) / rect.height) * 720;
      
      const currentPosX = settingsRef.current.specPosX ?? 640;
      const currentPosY = settingsRef.current.specPosY ?? 560;
      
      const dist = Math.hypot(canvasX - currentPosX, canvasY - currentPosY);
      if (dist < 220) {
        e.preventDefault();
        const delta = -e.deltaY;
        const currentScale = settingsRef.current.specScale ?? 1.0;
        const newScale = Math.max(0.2, Math.min(4.0, currentScale + (delta > 0 ? 0.1 : -0.1)));
        if (onChange) {
          onChange('specScale', parseFloat(newScale.toFixed(2)));
        }
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [onChange]);

  // Expose global visualizer canvas frame capture function for thumbnail generation
  useEffect(() => {
    (window as any).captureVisualizerThumbnail = () => {
      try {
        if (canvasRef.current) {
          return canvasRef.current.toDataURL('image/png');
        }
      } catch (e) {
        console.warn("Could not capture canvas frame:", e);
      }
      return null;
    };
    return () => {
      delete (window as any).captureVisualizerThumbnail;
    };
  }, []);

  // Background slideshow interval ticker
  useEffect(() => {
    if (!isPlaying || bgUrls.length <= 1) return;

    const intervalTime = (settings.bgInterval || 10) * 1000;
    const interval = setInterval(() => {
      onBgIndexChange((currentBgIndex + 1) % bgUrls.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, bgUrls.length, currentBgIndex, settings.bgInterval, onBgIndexChange]);

  // Handle Background Image / Video Loading
  useEffect(() => {
    let active = true;
    console.log("PreviewCanvas: backgroundImage changed to:", backgroundImage);

    if (backgroundImage) {
      const isVideo = backgroundImage.includes('video') || 
                      backgroundImage.endsWith('.mp4') || 
                      backgroundImage.endsWith('.webm');

      if (isVideo) {
        const video = document.createElement('video');
        video.src = backgroundImage;
        video.autoplay = true;
        video.loop = true;
        video.muted = (settingsRef.current.bgVideoVolume ?? 0) === 0;
        video.volume = (settingsRef.current.bgVideoVolume ?? 0) / 100;
        video.playsInline = true;

        video.onloadedmetadata = () => {
          console.log("PreviewCanvas: Background video metadata loaded.");
          if (active) bgMediaRef.current = video;
        };
        video.onerror = (e) => {
          console.error("PreviewCanvas: Background video failed to load:", e);
        };

        video.play().catch(e => console.warn("Video play notice:", e));

        return () => {
          active = false;
          video.pause();
          video.src = '';
          bgMediaRef.current = null;
        };
      } else {
        const img = new Image();
        if (backgroundImage.startsWith('http') || backgroundImage.startsWith('https')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          console.log("PreviewCanvas: Background image loaded successfully:", img.naturalWidth, img.naturalHeight);
          if (active) bgMediaRef.current = img;
        };
        img.onerror = (e) => {
          console.error("PreviewCanvas: Background image failed to load:", backgroundImage, e);
        };
        img.src = backgroundImage;

        return () => {
          active = false;
          bgMediaRef.current = null;
        };
      }
    } else {
      bgMediaRef.current = null;
    }
  }, [backgroundImage]);

  // Adjust volume dynamically on change
  useEffect(() => {
    const media = bgMediaRef.current;
    if (media && media instanceof HTMLVideoElement) {
      media.volume = (settings.bgVideoVolume ?? 0) / 100;
      media.muted = (settings.bgVideoVolume ?? 0) === 0;
    }
  }, [settings.bgVideoVolume]);

  // Handle Circular Logo Loading
  useEffect(() => {
    if (settings.logoPath) {
      const img = new Image();
      if (settings.logoPath.startsWith('http') || settings.logoPath.startsWith('https')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        logoImgRef.current = img;
      };
      img.src = settings.logoPath;
    } else {
      logoImgRef.current = null;
    }
  }, [settings.logoPath]);

  // Main 60 FPS Render Loop with Step-Aware Layering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal render resolution
    canvas.width = 1280;
    canvas.height = 720;

    let animId: number;
    let t = 0;
    const dataArray = new Uint8Array(128);

    // Particle pool with custom physics properties
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, (_, idx) => ({
      x: Math.random() * 1280,
      y: Math.random() * 720,
      speedX: (Math.random() - 0.5) * 0.7,
      speedY: -(Math.random() * 1.3 + 0.4),
      radius: Math.random() * 4 + 2,
      alpha: Math.random() * 0.5 + 0.2,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      hue: (idx * 15) % 360
    }));

    const renderFrame = () => {
      t += 0.02;
      const liveSettings = settingsRef.current;
      const liveIsPlaying = isPlayingRef.current;
      const liveAnalyser = audioAnalyserRef.current;


      // 1. Fetch Audio Frequency Data
      let volumeAverage = 0;
      if (liveIsPlaying && liveAnalyser) {
        liveAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        volumeAverage = sum / dataArray.length / 255;
      } else if (liveIsPlaying) {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, Math.sin(t + i * 0.1) * 80 + Math.cos(t * 1.5 + i * 0.05) * 40 + 100);
          volumeAverage += dataArray[i];
        }
        volumeAverage = (volumeAverage / dataArray.length) / 255;
      } else {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = 0;
        }
        volumeAverage = 0;
      }

      const volumeFactor = volumeAverage * (liveSettings.sensitivity || 1.2);

      // Save state for Camera Shake & Beat Pulse
      ctx.save();

      // Anti-Copyright Shield Simulation (Zoom & Micro-rotation)
      if (liveSettings.antiCopyright) {
        const zoomEnabled = liveSettings.antiCopyrightZoomEnabled !== false;
        const rotateEnabled = liveSettings.antiCopyrightRotateEnabled !== false;
        const zoomFactor = zoomEnabled ? (1 + (liveSettings.antiCopyrightZoom || 3) / 100) : 1.0;
        const rotateFactor = rotateEnabled ? (liveSettings.antiCopyrightRotate || 0.005) : 0.0;
        
        if (zoomEnabled || rotateEnabled) {
          ctx.translate(640, 360);
          ctx.scale(zoomFactor, zoomFactor);
          ctx.rotate(rotateFactor);
          ctx.translate(-640, -360);
        }
      }

      // Camera Shake Effect (Bass React) - applies in Step 1+
      const baseShakeVal = liveSettings.beatShake ?? 2.0;
      const shakeFactor = liveSettings.musicPulse ? (volumeFactor * baseShakeVal * 7.5) : (volumeFactor * 14);
      if (liveSettings.baseEffect === 'Camera Shake (Bass React)' || (liveSettings.musicPulse && volumeFactor > 0.35)) {
        const shakeX = (Math.random() - 0.5) * shakeFactor;
        const shakeY = (Math.random() - 0.5) * shakeFactor;
        ctx.translate(shakeX, shakeY);
      }

      // Draw custom gradient background if in gradient template mode or no media uploaded
      const media = bgMediaRef.current;
      if (liveSettings.bgMode === 'template' || !media) {
        ctx.save();
        const color1 = liveSettings.bgGradientColor1 || '#1e1b4b';
        const color2 = liveSettings.bgGradientColor2 || '#5b21b6';
        const gradType = liveSettings.bgGradientType || 'gradient';
        const angle = liveSettings.bgGradientAngle ?? 135;

        if (gradType === 'solid') {
          ctx.fillStyle = color1;
          ctx.fillRect(0, 0, 1280, 720);
        } else {
          const angleRad = (angle * Math.PI) / 180;
          const x1 = 640 - Math.cos(angleRad) * 640;
          const y1 = 360 - Math.sin(angleRad) * 360;
          const x2 = 640 + Math.cos(angleRad) * 640;
          const y2 = 360 + Math.sin(angleRad) * 360;

          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, color1);
          grad.addColorStop(1, color2);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1280, 720);
        }
        ctx.restore();
      } else {
        // Fallback standard background fill color
        ctx.fillStyle = '#FEF8EC';
        ctx.fillRect(0, 0, 1280, 720);
      }

      // 2. Draw Background Media (Image or Video) with flips & custom colors
      if (media && liveSettings.bgMode === 'upload') {
        ctx.save();

        // Incorporate both Step 1 & Step 2 blur/brightness/color settings
        const blurVal = (liveSettings.backgroundBlur ?? 0) + (liveSettings.blur ?? 0);
        const brightPct = ((liveSettings.backgroundBrightness ?? 100) / 100) * ((liveSettings.brightness ?? 100) / 100);
        const contrastPct = (liveSettings.contrast ?? 100) / 100;
        const saturatePct = (liveSettings.saturation ?? 100) / 100;

        let filterStr = `blur(${blurVal}px) brightness(${brightPct}) contrast(${contrastPct}) saturate(${saturatePct})`;
        if (liveSettings.antiCopyright && liveSettings.antiCopyrightColorGrading !== false) {
          filterStr += " hue-rotate(-6deg) saturate(1.15) contrast(1.05)";
        }
        ctx.filter = filterStr;

        const mWidth = (media as HTMLVideoElement).videoWidth || (media as HTMLImageElement).naturalWidth || media.width || 1280;
        const mHeight = (media as HTMLVideoElement).videoHeight || (media as HTMLImageElement).naturalHeight || media.height || 720;

        const fitMode = liveSettings.fitMode || 'Fit to Screen (Blurred Background)';
        let drawW = 1280;
        let drawH = 720;
        let drawX = 0;
        let drawY = 0;
        let isBlurredBg = false;

        if (fitMode === 'Fit to Screen (Blurred Background)') {
          isBlurredBg = true;
          const scale = Math.min(1280 / mWidth, 720 / mHeight);
          drawW = mWidth * scale;
          drawH = mHeight * scale;
          drawX = (1280 - drawW) / 2;
          drawY = (720 - drawH) / 2;
        } else if (fitMode === 'Fit to Screen (Letterbox)') {
          const scale = Math.min(1280 / mWidth, 720 / mHeight);
          drawW = mWidth * scale;
          drawH = mHeight * scale;
          drawX = (1280 - drawW) / 2;
          drawY = (720 - drawH) / 2;
        } else if (fitMode === 'Stretch to Fit') {
          drawW = 1280;
          drawH = 720;
          drawX = 0;
          drawY = 0;
        } else {
          // Crop to Fill (Proportional)
          const scale = Math.max(1280 / mWidth, 720 / mHeight);
          drawW = mWidth * scale;
          drawH = mHeight * scale;
          drawX = (1280 - drawW) / 2;
          drawY = (720 - drawH) / 2;
        }

        // Apply Mirror / Flipping transformation
        let scaleX = 1;
        let scaleY = 1;
        let transX = 0;
        let transY = 0;

        if (liveSettings.bgFlipH) {
          scaleX = -1;
          transX = 1280;
        }
        if (liveSettings.bgFlipV) {
          scaleY = -1;
          transY = 720;
        }

        if (liveSettings.bgFlipH || liveSettings.bgFlipV) {
          ctx.translate(transX, transY);
          ctx.scale(scaleX, scaleY);
        }

        // Pulsing Effect (Audio React / Beat Sync) - applies in Step 1+
        const baseZoomVal = liveSettings.musicPulse ? (liveSettings.beatZoom ?? 5.0) : 1.0;
        const pulseMult = liveSettings.musicPulse ? (volumeFactor * (baseZoomVal / 50.0)) : (volumeFactor * 0.08);
        if (liveSettings.baseEffect === 'Smooth Pulsing (Audio React)' || liveSettings.musicPulse || liveSettings.syncMode === 'Sinkronkan Latar dengan Ketukan (Beat Sync)') {
          const pulseScale = 1 + pulseMult;
          ctx.translate(640, 360);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-640, -360);
        }

        // Draw blurred backdrop if blurred background fit mode is selected
        if (isBlurredBg) {
          ctx.save();
          const baseBlur = Math.max(15, blurVal + 15);
          ctx.filter = `blur(${baseBlur}px) brightness(${brightPct * 0.65}) contrast(${contrastPct}) saturate(${saturatePct})`;
          
          const bgScale = Math.max(1280 / mWidth, 720 / mHeight);
          const bgW = mWidth * bgScale;
          const bgH = mHeight * bgScale;
          const bgX = (1280 - bgW) / 2;
          const bgY = (720 - bgH) / 2;
          
          try {
            ctx.drawImage(media, bgX, bgY, bgW, bgH);
          } catch (e) {}
          ctx.restore();
        }

        try {
          ctx.drawImage(media, drawX, drawY, drawW, drawH);
        } catch (e) {
          // Ignore transient media draw errors
        }

        ctx.restore();
      }

      // Live Simulation of L8 Grain Noise and L9 Vignette
      if (liveSettings.antiCopyright) {
        if (liveSettings.antiCopyrightNoiseEnabled !== false) {
          const noiseLvl = liveSettings.antiCopyrightNoise === undefined ? 2 : liveSettings.antiCopyrightNoise;
          if (noiseLvl > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            for (let i = 0; i < noiseLvl * 80; i++) {
              const nx = Math.random() * 1280;
              const ny = Math.random() * 720;
              const nw = Math.random() * 2 + 1;
              ctx.fillRect(nx, ny, nw, nw);
            }
            ctx.restore();
          }
        }
        if (liveSettings.antiCopyrightVignetteEnabled !== false) {
          const vignetteVal = liveSettings.antiCopyrightVignette === undefined ? 0.3 : liveSettings.antiCopyrightVignette;
          ctx.save();
          const gradient = ctx.createRadialGradient(640, 360, 320, 640, 360, 800);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, `rgba(0,0,0,${vignetteVal * 1.5})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 1280, 720);
          ctx.restore();
        }
        if (liveSettings.antiCopyrightHashEnabled !== false) {
          const hashLvl = liveSettings.antiCopyrightHashStrength || 2;
          if (hashLvl > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            for (let i = 0; i < hashLvl * 80; i++) {
              const hx = Math.random() * 1280;
              const hy = Math.random() * 720;
              const hw = Math.random() * 2 + 1;
              ctx.fillRect(hx, hy, hw, hw);
            }
            ctx.restore();
          }
        }
      }

      // 3. Draw Particle Animation - Supports 12 custom particle designs
      const hasActiveParticles = liveSettings.partCosmic || liveSettings.partSakura || liveSettings.partConfetti || liveSettings.partSnow || liveSettings.partSparks || liveSettings.partRain || liveSettings.partStar || liveSettings.partBubbles || liveSettings.partLeaves || liveSettings.partMagic || liveSettings.partOrbs || liveSettings.partMatrix;
      if (hasActiveParticles) {
        // Collect active types based on checkboxes
        const activeTypes: string[] = [];
        if (liveSettings.partCosmic) activeTypes.push('cosmic');
        if (liveSettings.partSakura) activeTypes.push('sakura');
        if (liveSettings.partConfetti) activeTypes.push('confetti');
        if (liveSettings.partSnow) activeTypes.push('snow');
        if (liveSettings.partSparks) activeTypes.push('sparks');
        if (liveSettings.partRain) activeTypes.push('rain');
        if (liveSettings.partStar) activeTypes.push('star');
        if (liveSettings.partBubbles) activeTypes.push('bubbles');
        if (liveSettings.partLeaves) activeTypes.push('leaves');
        if (liveSettings.partMagic) activeTypes.push('magic');
        if (liveSettings.partOrbs) activeTypes.push('orbs');
        if (liveSettings.partMatrix) activeTypes.push('matrix');

        if (activeTypes.length === 0) {
          activeTypes.push('default');
        }

        particles.forEach((p, idx) => {
          const type = activeTypes[idx % activeTypes.length];
          const intensity = liveSettings.particleIntensity || 1.5;
          const speed = 1 + volumeFactor * intensity * 4.0;

          // Process different types of motion and boundaries
          if (type === 'sparks' || type === 'magic') {
            // Rising sparks physics
            p.x += p.speedX * speed * 0.8;
            p.y += p.speedY * speed * 1.5; // Rise faster
            if (p.y < -10) {
              p.y = 730;
              p.x = Math.random() * 1280;
            }
          } else if (type === 'rain') {
            // Diagonal falling fast lines
            p.x += -speed * 2.0;
            p.y += speed * 4.5;
            if (p.y > 730 || p.x < -10) {
              p.y = -10;
              p.x = Math.random() * 1280 + 200;
            }
          } else if (type === 'sakura' || type === 'leaves') {
            // Swaying floating leaves
            p.x += Math.sin(t + idx) * 0.4 + p.speedX;
            p.y += (Math.abs(p.speedY) * 0.4 + 0.3) * speed;
            if (p.y > 730) {
              p.y = -10;
              p.x = Math.random() * 1280;
            }
          } else {
            // Standard floating particles
            p.x += p.speedX * speed;
            p.y += p.speedY * speed;
            if (p.y < -10) {
              p.y = 730;
              p.x = Math.random() * 1280;
            }
          }

          p.angle += p.rotSpeed * speed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          const alphaVal = Math.min(1.0, p.alpha * (1 + volumeFactor * 0.8));

          // Draw shapes based on type
          if (type === 'sakura') {
            ctx.fillStyle = `rgba(253, 164, 189, ${alphaVal})`; // Pink
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius * 1.6, p.radius * 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (type === 'leaves') {
            ctx.fillStyle = `rgba(202, 138, 4, ${alphaVal})`; // Autumn brown/orange
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-p.radius * 1.2, 0);
            ctx.lineTo(0, -p.radius * 1.8);
            ctx.lineTo(p.radius * 1.2, 0);
            ctx.lineTo(0, p.radius * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (type === 'confetti') {
            ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${alphaVal})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
            ctx.fill();
            ctx.stroke();
          } else if (type === 'sparks') {
            ctx.fillStyle = `rgba(249, 115, 22, ${alphaVal})`; // Orange spark
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (type === 'snow') {
            ctx.fillStyle = `rgba(255, 255, 255, ${alphaVal * 0.9})`; // Fluffy snow
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (type === 'bubbles') {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alphaVal * 0.75})`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.35})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.6 + 1, 0, Math.PI * 2);
            ctx.stroke();
          } else if (type === 'star' || type === 'magic') {
            ctx.fillStyle = type === 'star' ? `rgba(254, 240, 138, ${alphaVal})` : `rgba(232, 121, 249, ${alphaVal})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -p.radius * 2);
            ctx.lineTo(p.radius * 0.5, -p.radius * 0.5);
            ctx.lineTo(p.radius * 2, 0);
            ctx.lineTo(p.radius * 0.5, p.radius * 0.5);
            ctx.lineTo(0, p.radius * 2);
            ctx.lineTo(-p.radius * 0.5, p.radius * 0.5);
            ctx.lineTo(-p.radius * 2, 0);
            ctx.lineTo(-p.radius * 0.5, -p.radius * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else if (type === 'rain') {
            ctx.strokeStyle = `rgba(147, 197, 253, ${alphaVal * 0.8})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(-3, 12);
            ctx.stroke();
          } else if (type === 'orbs') {
            // Bokeh lights
            const bokehRadius = p.radius * 6.5;
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, bokehRadius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${alphaVal * 0.3})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, bokehRadius, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 'matrix') {
            ctx.fillStyle = `rgba(34, 197, 94, ${alphaVal})`; // Matrix Green
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.font = `bold ${p.radius * 2.8}px monospace`;
            ctx.fillText(String.fromCharCode(33 + (idx % 93)), 0, 0);
            ctx.strokeText(String.fromCharCode(33 + (idx % 93)), 0, 0);
          } else if (type === 'cosmic') {
            ctx.fillStyle = `rgba(147, 197, 253, ${alphaVal * 0.9})`; // Brighter Cosmic Blue
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Default bubble sparks
            ctx.fillStyle = `rgba(255, 255, 255, ${alphaVal})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${alphaVal * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius * 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        });
      }

      // Subtle indicator for developers to verify active overlays
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      let statusStr = '';
      if (liveSettings.vfxCrt) statusStr += '[CRT] ';
      if (liveSettings.vfxNeon) statusStr += '[Neon] ';
      if (liveSettings.vfxSpotlight) statusStr += '[Spot] ';
      if (liveSettings.vfxFilm) statusStr += '[Film] ';
      if (liveSettings.vfxRain) statusStr += '[Rain] ';
      if (liveSettings.vfxDisco) statusStr += '[Disco] ';
      if (liveSettings.vfxMoon) statusStr += '[Moon] ';
      if (liveSettings.partCosmic) statusStr += '[Cosmic] ';
      if (liveSettings.partSnow) statusStr += '[Snow] ';
      if (liveSettings.partSakura) statusStr += '[Sakura] ';
      if (liveSettings.partSparks) statusStr += '[Sparks] ';
      if (statusStr) {
        ctx.fillText(`Active Effects: ${statusStr}`, 40, 710);
      }


      // 4. Draw VFX Overlays
      const hasActiveVfx = liveSettings.vfxSpotlight || liveSettings.vfxDisco || liveSettings.vfxMoon || liveSettings.vfxIslamic || liveSettings.vfxFilm || liveSettings.vfxRain || liveSettings.vfxCrt || liveSettings.vfxFlash || liveSettings.vfxNeon;
      if (hasActiveVfx) {
        const vfxAlpha = (liveSettings.vfxOpacity ?? 30) / 100;

        // A. Spotlight Effect
        if (liveSettings.vfxSpotlight) {
          const angleL = Math.sin(t * 1.2) * 0.35 - 0.15;
          const angleR = Math.cos(t * 1.2) * 0.35 + 0.15;
          
          const drawCone = (startX: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(startX, 0);
            ctx.rotate(angle);
            const grad = ctx.createLinearGradient(0, 0, 0, 800);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-180, 800);
            ctx.lineTo(180, 800);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          };
          
          drawCone(250, angleL, `rgba(168, 85, 247, ${0.4 * vfxAlpha})`); // Purple
          drawCone(1030, angleR, `rgba(59, 130, 246, ${0.4 * vfxAlpha})`); // Blue
        }

        // B. Disco Ball Glare
        if (liveSettings.vfxDisco) {
          ctx.save();
          ctx.translate(640, 0);
          ctx.rotate(t * 0.1);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * vfxAlpha})`;
          const beams = 10;
          for (let i = 0; i < beams; i++) {
            ctx.rotate((Math.PI * 2) / beams);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-30, 1000);
            ctx.lineTo(30, 1000);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // C. Crescent Moon
        if (liveSettings.vfxMoon) {
          ctx.save();
          ctx.fillStyle = `rgba(254, 240, 138, ${0.9 * vfxAlpha})`;
          ctx.beginPath();
          ctx.arc(1140, 110, 42, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.arc(1120, 105, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // D. Islamic Pattern Grid
        if (liveSettings.vfxIslamic) {
          ctx.save();
          ctx.strokeStyle = `rgba(251, 191, 36, ${0.28 * vfxAlpha})`;
          ctx.lineWidth = 1.8;
          const stepSize = 140;
          for (let x = 0; x < 1350; x += stepSize) {
            for (let y = 0; y < 760; y += stepSize) {
              ctx.save();
              ctx.translate(x, y);
              ctx.beginPath();
              ctx.rect(-25, -25, 50, 50);
              ctx.stroke();
              ctx.rotate(Math.PI / 4);
              ctx.beginPath();
              ctx.rect(-25, -25, 50, 50);
              ctx.stroke();
              ctx.restore();
            }
          }
          ctx.restore();
        }

        // E. Film Scratches & Dust
        if (liveSettings.vfxFilm) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * vfxAlpha})`;
          ctx.lineWidth = 1.2;
          if (Math.random() < 0.35) {
            const xPos = Math.random() * 1280;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos + (Math.random() - 0.5) * 15, 720);
            ctx.stroke();
          }
          if (Math.random() < 0.25) {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.4 * vfxAlpha})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 1280, Math.random() * 720, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // F. Raindrops on Glass
        if (liveSettings.vfxRain) {
          ctx.fillStyle = `rgba(156, 163, 175, ${0.5 * vfxAlpha})`;
          for (let i = 0; i < 22; i++) {
            const dropY = ((t * 180 + i * 140) % 760) - 20;
            const dropX = (i * 71) % 1260 + 10;
            ctx.beginPath();
            ctx.ellipse(dropX, dropY, 3, 9, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // G. CRT Screen Flicker Scanlines
        if (liveSettings.vfxCrt) {
          ctx.fillStyle = `rgba(0, 0, 0, ${0.15 * vfxAlpha})`;
          for (let y = 0; y < 720; y += 4.5) {
            ctx.fillRect(0, y, 1280, 1.5);
          }
          if (Math.random() < 0.1) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * vfxAlpha})`;
            ctx.fillRect(0, 0, 1280, 720);
          }
        }

        // H. White Flash Beat
        if (liveSettings.vfxFlash && volumeFactor > 0.38) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(volumeFactor - 0.38) * 0.7 * vfxAlpha})`;
          ctx.fillRect(0, 0, 1280, 720);
        }

        // I. Running Glowing Neon Border
        if (liveSettings.vfxNeon) {
          const pad = liveSettings.neonPadding ?? 10;
          const thick = liveSettings.neonThickness ?? 4;
          const neonSpd = liveSettings.neonSpeed ?? 30;
          const lenPct = liveSettings.neonLength ?? 75;
          
          ctx.strokeStyle = liveSettings.neonStartColor || '#00ffff';
          ctx.lineWidth = thick;
          ctx.lineCap = 'round';
          ctx.shadowColor = liveSettings.neonEndColor || '#ff00ff';
          ctx.shadowBlur = (liveSettings.neonGlow ?? 60) / 4.5;
          
          ctx.setLineDash([((lenPct) / 100) * 450, 450 * (1 - lenPct / 100)]);
          ctx.lineDashOffset = -t * neonSpd * 2.2;
          
          ctx.strokeRect(pad, pad, 1280 - pad * 2, 720 - pad * 2);
          
          ctx.shadowBlur = 0;
          ctx.setLineDash([]);
        }
      }

      // 5. Draw Audio Visualizer Spectrum (supports multi-layer)
      const spectrumLayers = liveSettings.spectrumLayers || [{
        id: 'root',
        specShow: liveSettings.specShow ?? true,
        visualizerType: liveSettings.visualizerType || 'bars',
        barColor: liveSettings.barColor || '#8B5CF6',
        specFocus: liveSettings.specFocus || 'Semua Frekuensi (Standard)',
        specGlow: liveSettings.specGlow || false,
        specPulse: liveSettings.specPulse || false,
        specWidthPct: liveSettings.specWidthPct ?? 1.10,
        specScale: liveSettings.specScale ?? 1.0,
        specHeight: liveSettings.specHeight ?? 0.50,
        specOpacity: liveSettings.specOpacity ?? 100,
        specRotation: liveSettings.specRotation ?? 0,
        specSpeed: liveSettings.specSpeed ?? 1.50,
        specReverse: liveSettings.specReverse || 'Normal (Tidak Dibalik)',
        specPosX: liveSettings.specPosX ?? 640.0,
        specPosY: liveSettings.specPosY ?? 560.0
      }];

      spectrumLayers.forEach((layer: any) => {
        if (!(layer.specShow ?? true)) return;

        ctx.save();

        // A. Setup Opacity
        ctx.globalAlpha = (layer.specOpacity ?? 100) / 100;

        // B. Setup Position, Rotation and Scales
        const posX = layer.specPosX ?? 640;
        const posY = layer.specPosY ?? 560;
        const rotDeg = layer.specRotation ?? 0;
        const scaleW = layer.specWidthPct ?? 1.0;
        const scaleH = layer.specScale ?? 1.0;
        const ampHeight = layer.specHeight ?? 1.0;

        ctx.translate(posX, posY);
        ctx.rotate((rotDeg * Math.PI) / 180);
        ctx.scale(scaleW, scaleH);

        // C. Setup Glow Neon
        const barColor = layer.barColor || '#8B5CF6';
        if (layer.specGlow) {
          ctx.shadowColor = barColor;
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowBlur = 0;
        }

        const barW = liveSettings.barWidth || 4;
        const barGap = liveSettings.barSpacing || 3;
        const numBars = Math.floor(500 / Math.max(1, barW + barGap)) || 71;
        const totalWidth = numBars * (barW + barGap) - barGap;
        const startX = -totalWidth / 2;

        // D. Setup Focus Slicing
        let startFreq = 0;
        let endFreq = dataArray.length;

        const getLayerGradient = (x1: number, y1: number, x2: number, y2: number) => {
          if (layer.barColorType === 'gradient') {
            const color1 = layer.barColor || '#8B5CF6';
            const color2 = layer.barColor2 || '#A78BFA';
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            return grad;
          }
          return layer.barColor || '#8B5CF6';
        };

        if (layer.specFocus === 'Low-End (Bass)') {
          startFreq = 0;
          endFreq = Math.floor(dataArray.length * 0.2);
        } else if (layer.specFocus === 'Mid-Range (Vocals)') {
          startFreq = Math.floor(dataArray.length * 0.2);
          endFreq = Math.floor(dataArray.length * 0.65);
        } else if (layer.specFocus === 'High-End (Treble)') {
          startFreq = Math.floor(dataArray.length * 0.65);
          endFreq = dataArray.length;
        }
        const freqSpan = endFreq - startFreq;

        // E. Beat Pulse multiplier
        const specPulseAmp = layer.specPulse ? (1.0 + volumeFactor * 0.45) : 1.0;

        if (layer.visualizerType === 'bars') {
          for (let i = 0; i < numBars; i++) {
            let dataIdx = startFreq + Math.floor((i / numBars) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numBars) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 200 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const x = startX + i * (barW + barGap);
            const y = 0; // Relative to translate

            ctx.fillStyle = getLayerGradient(x, y, x, y - val);
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y - val, barW, Math.max(4, val), 4);
            } else {
              ctx.rect(x, y - val, barW, Math.max(4, val));
            }
            ctx.fill();
          }
        } else if (layer.visualizerType === 'symmetric') {
          const halfBars = Math.floor(numBars / 2);
          for (let i = 0; i < halfBars; i++) {
            let dataIdx = startFreq + Math.floor((i / halfBars) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / halfBars) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 200 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            
            // Draw right side
            const xRight = i * (barW + barGap);
            ctx.fillStyle = getLayerGradient(xRight, 0, xRight, -val);
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(xRight, 0 - val, barW, Math.max(4, val), 4);
            } else {
              ctx.rect(xRight, 0 - val, barW, Math.max(4, val));
            }
            ctx.fill();

            // Draw left side
            const xLeft = -i * (barW + barGap) - barW;
            ctx.fillStyle = getLayerGradient(xLeft, 0, xLeft, -val);
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(xLeft, 0 - val, barW, Math.max(4, val), 4);
            } else {
              ctx.rect(xLeft, 0 - val, barW, Math.max(4, val));
            }
            ctx.fill();
          }
        } else if (layer.visualizerType === 'retro') {
          const blockSize = 6;
          const blockGap = 2;
          for (let i = 0; i < numBars; i++) {
            let dataIdx = startFreq + Math.floor((i / numBars) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numBars) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 200 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const x = startX + i * (barW + barGap);
            
            const numBlocks = Math.floor(val / (blockSize + blockGap));
            ctx.fillStyle = getLayerGradient(x, 0, x, -val);
            for (let j = 0; j < Math.max(1, numBlocks); j++) {
              const y = 0 - j * (blockSize + blockGap);
              ctx.fillRect(x, y, barW, blockSize);
            }
          }
        } else if (layer.visualizerType === 'wave') {
          ctx.beginPath();
          ctx.strokeStyle = getLayerGradient(startX, 0, startX + totalWidth, 0);
          ctx.lineWidth = liveSettings.barWidth || 4;
          ctx.lineCap = 'round';

          for (let i = 0; i < numBars; i++) {
            let dataIdx = startFreq + Math.floor((i / numBars) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numBars) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = ((rawVal - 128) / 128) * 160 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const x = startX + i * (barW + barGap);
            const y = val;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else if (layer.visualizerType === 'wave-fill') {
          ctx.beginPath();
          const solidColor = layer.barColor || '#8B5CF6';
          ctx.fillStyle = layer.barColorType === 'gradient'
            ? getLayerGradient(startX, 0, startX + totalWidth, 0)
            : (solidColor.startsWith('#') ? solidColor + '40' : 'rgba(139, 92, 246, 0.25)');
          ctx.strokeStyle = getLayerGradient(startX, 0, startX + totalWidth, 0);
          ctx.lineWidth = liveSettings.barWidth || 4;
          ctx.lineCap = 'round';

          let hasPoints = false;
          let endX = startX;

          for (let i = 0; i < numBars; i++) {
            let dataIdx = startFreq + Math.floor((i / numBars) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numBars) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = ((rawVal - 128) / 128) * 160 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const x = startX + i * (barW + barGap);
            const y = val;

            if (i === 0) {
              ctx.moveTo(x, 0);
              ctx.lineTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            endX = x;
            hasPoints = true;
          }

          if (hasPoints) {
            ctx.lineTo(endX, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        } else if (layer.visualizerType === 'circular') {
          const baseRadius = 130 + volumeFactor * 25;
          const numCircles = Math.min(100, numBars);

          ctx.strokeStyle = getLayerGradient(0, 0, baseRadius + 110, baseRadius + 110);
          ctx.lineWidth = liveSettings.barWidth || 4;
          ctx.lineCap = 'round';

          // Rotation speed multiplier over time t
          const rotSpeed = layer.specSpeed ?? 1.0;
          ctx.rotate(t * rotSpeed * 0.25);

          for (let i = 0; i < numCircles; i++) {
            let dataIdx = startFreq + Math.floor((i / numCircles) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numCircles) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 110 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const angle = (i / numCircles) * Math.PI * 2;

            const x1 = Math.cos(angle) * baseRadius;
            const y1 = Math.sin(angle) * baseRadius;
            const x2 = Math.cos(angle) * (baseRadius + val);
            const y2 = Math.sin(angle) * (baseRadius + val);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        } else if (layer.visualizerType === 'double-circular') {
          const baseRadius = 130 + volumeFactor * 25;
          const numCircles = Math.min(100, numBars);

          ctx.strokeStyle = barColor;
          ctx.lineWidth = liveSettings.barWidth || 4;
          ctx.lineCap = 'round';

          const rotSpeed = layer.specSpeed ?? 1.0;
          ctx.rotate(t * rotSpeed * 0.25);

          for (let i = 0; i < numCircles; i++) {
            let dataIdx = startFreq + Math.floor((i / numCircles) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numCircles) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 110 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const angle = (i / numCircles) * Math.PI * 2;

            // Outward
            const x1_out = Math.cos(angle) * baseRadius;
            const y1_out = Math.sin(angle) * baseRadius;
            const x2_out = Math.cos(angle) * (baseRadius + val);
            const y2_out = Math.sin(angle) * (baseRadius + val);

            ctx.beginPath();
            ctx.moveTo(x1_out, y1_out);
            ctx.lineTo(x2_out, y2_out);
            ctx.stroke();

            // Inward
            const innerVal = val * 0.45;
            const x2_in = Math.cos(angle) * (baseRadius - innerVal);
            const y2_in = Math.sin(angle) * (baseRadius - innerVal);

            ctx.beginPath();
            ctx.moveTo(x1_out, y1_out);
            ctx.lineTo(x2_in, y2_in);
            ctx.stroke();
          }
        } else if (layer.visualizerType === 'radial-star') {
          const numCircles = Math.min(120, numBars);

          ctx.strokeStyle = barColor;
          ctx.lineWidth = 2.0;
          ctx.lineCap = 'round';

          const rotSpeed = layer.specSpeed ?? 1.0;
          ctx.rotate(-t * rotSpeed * 0.15);

          for (let i = 0; i < numCircles; i++) {
            let dataIdx = startFreq + Math.floor((i / numCircles) * freqSpan);
            if (layer.specReverse === 'Reverse (Dibalik)') {
              dataIdx = endFreq - 1 - Math.floor((i / numCircles) * freqSpan);
            }
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 150 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const angle = (i / numCircles) * Math.PI * 2;

            const x1 = Math.cos(angle) * (50 + volumeFactor * 12);
            const y1 = Math.sin(angle) * (50 + volumeFactor * 12);
            const x2 = Math.cos(angle) * (50 + volumeFactor * 12 + val);
            const y2 = Math.sin(angle) * (50 + volumeFactor * 12 + val);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        } else if (layer.visualizerType === 'liquid-wave') {
          ctx.beginPath();
          ctx.strokeStyle = barColor;
          ctx.lineWidth = liveSettings.barWidth || 5;
          ctx.lineCap = 'round';
          const fillGrad = ctx.createLinearGradient(startX, -100, startX, 100);
          fillGrad.addColorStop(0, barColor + '70');
          fillGrad.addColorStop(1, barColor + '05');
          ctx.fillStyle = fillGrad;

          ctx.moveTo(startX, 0);
          for (let i = 0; i < numBars; i++) {
            let dataIdx = startFreq + Math.floor((i / numBars) * freqSpan);
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 160 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const x = startX + i * (barW + barGap);
            const y = -val + Math.sin(i * 0.15 + t * 4) * 8;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(startX + numBars * (barW + barGap), 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (layer.visualizerType === 'glow-particles') {
          const numParticles = Math.min(45, numBars);
          ctx.fillStyle = barColor;
          for (let i = 0; i < numParticles; i++) {
            const dataIdx = startFreq + Math.floor((i / numParticles) * freqSpan);
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * (liveSettings.sensitivity || 1.2) * specPulseAmp;
            
            const x = startX + (i / numParticles) * (numBars * (barW + barGap));
            const y = -val * 280 - Math.abs(Math.sin(t * 1.5 + i) * 60);
            const r = Math.max(3, val * 16);
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = barColor;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        } else if (layer.visualizerType === 'cyber-grid') {
          ctx.fillStyle = barColor;
          for (let i = 0; i < numBars; i++) {
            const dataIdx = startFreq + Math.floor((i / numBars) * freqSpan);
            const rawVal = dataArray[dataIdx] || 0;
            const val = (rawVal / 255) * 280 * (liveSettings.sensitivity || 1.2) * ampHeight * specPulseAmp;
            const x = startX + i * (barW + barGap);
            
            const segmentH = 8;
            const segmentGap = 3;
            const segments = Math.floor(val / (segmentH + segmentGap));
            
            for (let j = 0; j < Math.max(1, segments); j++) {
              const y = -j * (segmentH + segmentGap);
              ctx.shadowBlur = 8;
              ctx.shadowColor = barColor;
              ctx.fillRect(x, y, barW, segmentH);
            }
          }
          ctx.shadowBlur = 0;
        } else if (layer.visualizerType === 'ambient-glow') {
          const baseRadius = 80 + volumeFactor * 45;
          ctx.strokeStyle = barColor;
          ctx.lineWidth = 3;
          
          for (let rOffset = 0; rOffset < 30; rOffset += 10) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = barColor;
            ctx.beginPath();
            ctx.arc(0, 0, baseRadius + rOffset, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // 6. Draw Circular Logo Overlay (Always visible if uploaded)
      if (logoImgRef.current) {
        ctx.save();
        
        let logoScale = 1.0;
        if (liveSettings.logoPulseSync) {
          logoScale = 1.0 + volumeFactor * 0.15;
        }

        ctx.translate(100, 100);
        ctx.scale(logoScale, logoScale);
        ctx.translate(-100, -100);

        ctx.beginPath();
        ctx.arc(100, 100, 45, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImgRef.current, 55, 55, 90, 90);
        ctx.restore();

        // Border around logo with same scaling
        ctx.save();
        ctx.translate(100, 100);
        ctx.scale(logoScale, logoScale);
        ctx.translate(-100, -100);
        ctx.beginPath();
        ctx.arc(100, 100, 45, 0, Math.PI * 2);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // 7. Draw Text Overlays & Progress Bars
      if (true) {
        ctx.save();

        const playTime = currentTimeRef.current;
        const totalDuration = durationRef.current;
        const showTitle = liveSettings.showTitle ?? true;
        const titleTextRaw = liveSettings.titleText || liveSettings.textTitle || 'Futuristic Resonance';
        const artistText = liveSettings.textArtist || 'Audira Clip AI Studio';

        const posX = liveSettings.titlePosX ?? 640;
        const posY = liveSettings.titlePosY ?? (((liveSettings.textPosition || 50) / 100) * 720);
        const titleFontSize = liveSettings.titleFontSize ?? liveSettings.textSize ?? 36;
        const color1 = liveSettings.titleColor1 || liveSettings.textColor || '#FFFFFF';
        const color2 = liveSettings.titleColor2 || '#EC4899';

        // Font Family mapping
        let fontFam = 'Outfit';
        if (liveSettings.fontType === 'Playfair (Klasik Mewah)') {
          fontFam = 'Playfair Display, serif';
        } else if (liveSettings.fontType === 'Poppins (Modern)') {
          fontFam = 'Poppins, sans-serif';
        } else if (liveSettings.fontType === 'Inter (Sederhana/Sleek)') {
          fontFam = 'Inter, sans-serif';
        }

        // Title display fade out
        let textAlpha = 1.0;
        if (liveSettings.titleDisplayMode === 'Tampil 10 Detik Awal') {
          const elapsedSec = t / 1.25;
          if (elapsedSec > 10) {
            textAlpha = Math.max(0, 1 - (elapsedSec - 10) * 0.8); // Fade out over ~1.2s
          }
        }

        if (showTitle && textAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = textAlpha;
          ctx.textAlign = 'center';

          // Split title text into lines
          const lines = titleTextRaw.split('\n');

          lines.forEach((lineText: string, index: number) => {
            ctx.save();
            
            // Set font style
            ctx.font = `bold ${titleFontSize}px "${fontFam}", sans-serif`;
            
            // Text color selection (line 1 gets color1, line 2 gets color2)
            ctx.fillStyle = index === 0 ? color1 : color2;

            // Set Shadows & Beat Glow
            if (liveSettings.titleBeatGlow) {
              ctx.shadowColor = index === 0 ? color1 : color2;
              ctx.shadowBlur = 10 + volumeFactor * 25;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            } else if (liveSettings.titleOutline) {
              ctx.shadowColor = `rgba(0, 0, 0, ${(liveSettings.shadowOpacity ?? 60) / 100})`;
              ctx.shadowBlur = liveSettings.shadowDistance ?? 6;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 4;
            } else {
              ctx.shadowColor = 'rgba(0,0,0,0.6)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 4;
            }

            const yPos = posY + index * (titleFontSize * 1.1);

            // Draw outline stroke if selected
            if (liveSettings.titleOutline) {
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = Math.max(2, titleFontSize * 0.08);
              ctx.strokeText(lineText, posX, yPos);
            }

            // Draw fill text
            ctx.fillText(lineText, posX, yPos);
            ctx.restore();
          });

          // Draw Artist Subtitle
          const artistFontSize = Math.max(16, titleFontSize * 0.6);
          ctx.font = `${artistFontSize}px "${fontFam}", sans-serif`;
          ctx.fillStyle = liveSettings.textColor || '#FFFFFF';
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 2;

          const artistY = posY + lines.length * (titleFontSize * 1.05) + 12;
          ctx.fillText(artistText, posX, artistY);

          ctx.restore();
        }

        // Draw LRC Karaoke Lyrics
        if (liveSettings.showLyrics && liveSettings.lyricsContent) {
          ctx.save();
          
          const parseLrcLyrics = (lrcText: string) => {
            if (!lrcText) return [];
            const lrcLines = lrcText.split('\n');
            const result: { time: number, text: string }[] = [];
            const timeRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/;
            
            lrcLines.forEach(line => {
              const match = timeRegex.exec(line);
              if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseFloat(match[2]);
                const time = minutes * 60 + seconds;
                const text = line.replace(timeRegex, '').trim();
                result.push({ time, text });
              }
            });
            return result.sort((a, b) => a.time - b.time);
          };

          const lyricsList = parseLrcLyrics(liveSettings.lyricsContent);
          const lyricTimeOffset = liveSettings.lyricTimeOffset ?? 0.0;
          const adjustedTime = playTime + lyricTimeOffset;
          
          let activeIndex = -1;
          for (let i = 0; i < lyricsList.length; i++) {
            if (adjustedTime >= lyricsList[i].time) {
              activeIndex = i;
            } else {
              break;
            }
          }
          
          if (activeIndex !== -1) {
            const activeLyric = lyricsList[activeIndex];
            const lPosX = liveSettings.lyricPosX ?? 640;
            const lPosY = liveSettings.lyricPosY ?? 650;
            const lFontSize = liveSettings.lyricFontSize ?? 40;
            const lFontFam = liveSettings.customFontName ? 'CustomUploadedFont' : fontFam;
            const lFontWeight = liveSettings.lyricFontWeight || 'bold';
            
            ctx.font = `${lFontWeight} ${lFontSize}px "${lFontFam}", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (liveSettings.lyricShowShadow) {
              ctx.shadowColor = liveSettings.lyricShadowColor || '#000000';
              ctx.shadowBlur = liveSettings.lyricShadowDistance ?? 3;
              ctx.shadowOffsetX = liveSettings.lyricShadowDistance ?? 2;
              ctx.shadowOffsetY = liveSettings.lyricShadowDistance ?? 2;
            } else {
              ctx.shadowColor = 'rgba(0,0,0,0)';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            }
            
            if (liveSettings.lyricShowGlow) {
              ctx.shadowColor = liveSettings.lyricGlowColor || '#00ffff';
              ctx.shadowBlur = liveSettings.lyricGlowRadius ?? 10;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            }
            
            const textToDraw = activeLyric.text;
            
            if (liveSettings.lyricShowOutline) {
              ctx.strokeStyle = liveSettings.lyricOutlineColor || '#000000';
              ctx.lineWidth = liveSettings.lyricOutlineWidth ?? 3;
              ctx.strokeText(textToDraw, lPosX, lPosY);
            }
            
            ctx.fillStyle = liveSettings.lyricActiveColor || '#00ffff';
            ctx.fillText(textToDraw, lPosX, lPosY);
          }
          ctx.restore();
        }

        // Draw Progress Bar

        if (liveSettings.showProgressBar) {
          ctx.save();
          const barWidth = 1100;
          const barHeight = 8;
          const barX = (1280 - barWidth) / 2;
          const barY = 675;
          const progress = totalDuration > 0 ? playTime / totalDuration : 0;

          // Draw track backdrop
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.beginPath();
          ctx.roundRect(barX, barY, barWidth, barHeight, 4);
          ctx.fill();

          // Draw filled progress
          ctx.fillStyle = liveSettings.barColor || '#8B5CF6';
          if (liveSettings.specGlow) {
            ctx.shadowColor = liveSettings.barColor || '#8B5CF6';
            ctx.shadowBlur = 10;
          }
          ctx.beginPath();
          ctx.roundRect(barX, barY, barWidth * progress, barHeight, 4);
          ctx.fill();
          ctx.restore();

          // Draw Timecode text if enabled
          if (liveSettings.showTimecode && totalDuration > 0) {
            ctx.save();
            const formatTime = (secs: number) => {
              const m = Math.floor(secs / 60);
              const s = Math.floor(secs % 60);
              return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };
            const timecodeStr = `${formatTime(playTime)} / ${formatTime(totalDuration)}`;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 13px "Poppins", sans-serif';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(timecodeStr, barX + barWidth, barY - 8);
            ctx.restore();
          }
        }

        // Draw Infinite Running Text
        if (liveSettings.showRunningText && liveSettings.runningTextContent) {
          ctx.save();
          const rText = liveSettings.runningTextContent;
          ctx.font = 'bold 20px "Poppins", sans-serif';
          const rTextWidth = ctx.measureText(rText).width;
          const rSpeed = liveSettings.runningTextSpeed ?? 80;
          
          // Scroll offset calculates linear movement
          const rOffset = (t * rSpeed * 0.7) % (1280 + rTextWidth);
          const rX = 1280 - rOffset;
          const rY = 645;

          ctx.fillStyle = liveSettings.runningTextColor || '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 5;
          ctx.fillText(rText, rX, rY);
          ctx.restore();
        }

        // Draw Circular Logo if provided
        const logoImg = logoImgRef.current;
        if (logoImg) {
          ctx.save();
          // Draw standard circular logo in center
          const cx = 1280 / 2;
          const cy = 720 / 2;
          let radius = 70; // Standard radius

          // Pulsate if logoPulseSync is enabled
          if (liveSettings.logoPulseSync) {
            radius = 70 + volumeFactor * 15;
          }

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.clip();

          // Draw image cropped in circle
          try {
            ctx.drawImage(logoImg, cx - radius, cy - radius, radius * 2, radius * 2);
          } catch (e) {}

          // Draw border outline
          ctx.restore();
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3.5;
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn("Error entering fullscreen mode:", err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn("Error exiting fullscreen mode:", err);
      });
    }
  };

  const hasGradientBackground = settings.bgMode === 'template' || !backgroundImage;

  return (
    <div 
      ref={containerRef} 
      className={`relative rounded-xl overflow-hidden bg-[#FEF8EC] border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] transition-all duration-300 mx-auto ${
        settings.aspectRatio === '9:16' ? 'w-[326px] aspect-[9/16] max-h-[580px]' : 'w-full aspect-video'
      }`}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {!backgroundImage && !hasGradientBackground && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FEF8EC] pointer-events-none z-[1] select-none">
          <div className="flex items-center gap-3 text-black font-black uppercase tracking-wider text-sm bg-white border-2 border-black px-6 py-4 shadow-[4px_4px_0px_0px_#000]">
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span>No Background Selected</span>
          </div>
        </div>
      )}

      {/* Visual overlay indicator */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-white border-2 border-black font-bold text-[10px] uppercase tracking-wider text-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000] pointer-events-none z-[2]">
        <span className={`w-2.5 h-2.5 rounded-full border border-black ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        {isPlaying ? 'Rendering Preview (60 FPS)' : 'Preview Paused'}
      </div>

      {/* Fullscreen Button */}
      <button 
        onClick={handleToggleFullscreen}
        className="absolute top-4 right-4 px-3 py-1 bg-white hover:bg-amber-100 border-2 border-black font-extrabold text-[10px] uppercase tracking-wider text-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000000] z-[2] transition-all hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
        title="Layar Penuh / Fullscreen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span>Full Screen</span>
      </button>
    </div>
  );
};
