# Start-flow videos (V1-V10)

Builds the 10 videos in `start/video/` from Chris's HeyGen MP4s and the scripts Chris approved on 2026-10-26
(Drive: Start-Videos-Scripts-v1). V2-V7 and V10 are illustrated screens drawn in `start-engine.html`, with Chris's
video laid into the framed box. V1, V8 and V9 are the HeyGen video with a name label (Sam and Travis say "AI trainer").

```
python3 -m pip install pocketsphinx pillow        # once
GWAI_IN=/path/to/heygen-mp4s python3 align.py     # times every word; refuses a clip whose words don't match its script
python3 make.py                                   # writes out/gwai-*.mp4, .vtt, .jpg; copy them to start/video/
node render-start.js cues/V3.json --stills x      # optional: one still per sentence, to check the pictures
```

`align.py` needs `build.py` from Zclear-Agent-HQ `assets/training-videos` (set `GWAI_ENGINE` if it lives elsewhere).
Checked 2026-10-26: 10/10 clips aligned word for word and every sentence break lands in a real pause; giving V3 the V6
script makes the aligner refuse.
