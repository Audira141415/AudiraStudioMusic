import sys
import os
import json

# Add current folder to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import render_service
# Mock duration to 5.0 seconds for quick testing
render_service.get_audio_duration = lambda x: 5.0

from render_service import render_video

config = {
  "audioPath": "job_1786521089_1_audio.mp3",
  "backgroundPath": "job_1786521089_1_bg.png",
  "settings": {
    "visualizerType": "bars",
    "barColor": "#8B5CF6",
    "barWidth": 4,
    "barSpacing": 3,
    "sensitivity": 1.2,
    "backgroundBlur": 6,
    "backgroundBrightness": 65,
    "particleIntensity": 1.5,
    
    # Text overlays
    "showTitle": True,
    "titleText": "ADAB DULU BARU ILMU\nReggae Religi Islami",
    "textArtist": "Audira Music",
    "titleFontSize": 60,
    "titleColor1": "#FFFFFF",
    "titleColor2": "#EC4899",
    "titleOutline": True,
    "titlePosX": 640,
    "titlePosY": 360,
    
    # Spectrum Layer
    "spectrumLayers": [
      {
        "id": "layer1",
        "name": "Spektrum 1",
        "visualizerType": "bars",
        "barColor": "#8B5CF6",
        "specShow": True,
        "specFocus": "Semua Frekuensi (Standard)",
        "specGlow": False,
        "specPulse": False,
        "specWidthPct": 1.10,
        "specScale": 1.0,
        "specHeight": 0.50,
        "specOpacity": 100,
        "specRotation": 0,
        "specSpeed": 1.50,
        "specReverse": "Normal (Tidak Dibalik)",
        "specPosX": 640.0,
        "specPosY": 560.0
      }
    ],
    
    "resolution": "720p",
    "fps": 30
  },
  "outputPath": "test_reproduced_output.mp4"
}

print("Starting reproduced render...")
try:
    render_video(config)
    print("Reproduced render completed successfully!")
except Exception as e:
    print(f"Reproduced render failed: {e}")
