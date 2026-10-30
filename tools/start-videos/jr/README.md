# JR's Grok setup clips (2026-10-30)

Source: HeyGen "Grow With AI Grok setup - JR" (74.0 s, 3 scenes), re-encoded to 1280x720 by Chris before upload.

- Cut at the two long pauses: 0-30.65 s (J1, phone), 30.65-52.53 s (J2, computer), 52.53 s-end (J3, first win).
- `scripts.json` holds JR's exact words (HeyGen setup scripts 1-3). Each part was force-aligned with `../align.py`
  (added dictionary words: "grok's", "x"): 96/96, 62/62 and 65/65 words, every sentence break inside a pause.
- Built with `../make.py` in the name-label style (label "JR · Grok trainer"). HeyGen renders JR in a portrait frame,
  so the clip is cropped to his backdrop (crop=620:660:332:40) with a blurred copy filling the sides.
- Output: `start/video/gwai-grok-phone-jr`, `gwai-grok-computer-jr`, `gwai-first-win-grok` (.mp4/.vtt/.jpg).
  Chris's older Grok Bot clips (`gwai-grok-phone`, `gwai-grok-computer`) are left in place, unused.
