# JR's Grok training clips (2026-10-30)

Source: HeyGen "Grow With AI Grok training - JR" (225.2 s, 20 scenes), shrunk to 1280x720 on Chris's PC and
uploaded in 8 pieces, joined back with `ffmpeg -f concat -c copy` (no re-encode).

- `scripts.json`: JR's exact words, training scripts 1-20 (T01-T20) = the 20 steps of /train/grok/, in order.
- Force-aligned the whole video against all 20 scripts in one pass: 666/666 words. Each cut sits in the middle of
  the pause between two scripts (`cuts.json`; every cut inside a pause).
- Each clip re-aligned on its own for captions (19/20 matched every word; T03 missed one word alone, so its
  caption timing comes from the whole-video alignment).
- Built with `tools/start-videos/make.py` in the label style ("JR · Grok trainer"), same backdrop crop as the
  setup clips. Output: `media/train-grok/step-NN.mp4`, `step-NN-poster.jpg`, `step-NN.vtt`.
