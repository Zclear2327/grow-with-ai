"""Force-align each start video's approved script to its audio. Writes cues/<V>.json with word times and sentences."""
import json, os, re, subprocess, sys, wave, glob
from pocketsphinx import Decoder
sys.path.insert(0, os.environ.get('GWAI_ENGINE', '/home/user/Zclear-Agent-HQ/assets/training-videos')); import build  # Zclear-Agent-HQ: sentences(), caption(), silences()
IN = os.environ.get('GWAI_IN', 'in')  # folder holding the HeyGen MP4s, named GWAI-V1-Welcome.mp4 ... GWAI-V10-First-Win.mp4
os.chdir(os.path.dirname(os.path.abspath(__file__))); SC = json.load(open('scripts.json')); os.makedirs('cues', exist_ok=True); os.makedirs('wav', exist_ok=True)
SPOKEN = {'claude.com/download': 'claude dot com slash download', 'xai': 'x a i', "'": ''}
def norm(s):
    s = s.lower().replace('claude.com/download', 'claude dot com slash download').replace('xai', 'x a i')
    return re.findall(r"[a-z]+(?:'[a-z]+)?", s)
EXTRA = {'anthropic': 'AE N TH R AA P IH K', "claude's": 'K L AO D Z', 'grok': 'G R AA K', 'gmail': 'G IY M EY L', 'xai': 'EH K S EY AY',
         "google's": 'G UW G AH L Z', 'claude': 'K L AO D'}
for v in (sys.argv[1:] or SC):
    src = glob.glob(f'{IN}/GWAI-{v}-*.mp4')[0]; wav = f'wav/{v}.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-vn', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav], check=True)
    sents = build.sentences(SC[v]); words, owner = [], []
    for i, s in enumerate(sents):
        ws = norm(s); words += ws; owner += [i] * len(ws)
    d = Decoder(samprate=16000)
    for w, p in EXTRA.items():
        try: d.add_word(w, p, False)
        except Exception: pass
    d.set_align_text(' '.join(words))
    w = wave.open(wav); raw = w.readframes(w.getnframes()); dur = w.getnframes() / w.getframerate()
    d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
    real = [(s.word, s.start_frame / 100, (s.end_frame + 1) / 100) for s in d.seg() if s.word not in ('<sil>', '(NULL)', '<s>', '</s>')]
    ok = len(real) == len(words)
    sil = build.silences(wav, -38, 0.12)
    out = {'v': v, 'src': src, 'dur': round(dur, 3), 'aligned': ok, 'words': [], 'sents': []}
    if ok:
        out['words'] = [{'w': words[i], 's': real[i][1], 'e': real[i][2], 'k': owner[i]} for i in range(len(words))]
        inpause = 0
        for k, s in enumerate(sents):
            ws = [x for x in out['words'] if x['k'] == k]
            out['sents'].append({'text': s, 'cap': build.caption(s), 'start': ws[0]['s'], 'end': ws[-1]['e']})
            if k < len(sents) - 1:
                mid = (ws[-1]['e'] + [x for x in out['words'] if x['k'] == k + 1][0]['s']) / 2
                inpause += any(a - 0.05 <= mid <= (b or 1e9) + 0.05 for a, b in sil)
        out['bounds_in_pause'] = f'{inpause}/{len(sents) - 1}'
    json.dump(out, open(f'cues/{v}.json', 'w'), indent=1)
    print(v, 'dur', round(dur, 2), 'aligned', ok, len(real), '/', len(words), out.get('bounds_in_pause'),
          'speech', out['sents'][0]['start'] if ok else '', out['sents'][-1]['end'] if ok else '')
