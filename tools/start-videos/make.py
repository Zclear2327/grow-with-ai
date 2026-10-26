"""Build the 10 start videos: web MP4 (1280x720), captions (VTT) and a poster for each.
V2-V7, V10: illustrated screens with Chris's HeyGen video in the framed box. V1, V8, V9: the HeyGen video, with a name label."""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
B = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(B, 'out'); os.makedirs(OUT, exist_ok=True)
NAMES = {'V1': 'welcome', 'V2': 'gmail', 'V3': 'grok-phone', 'V4': 'grok-computer', 'V5': 'claude-mac', 'V6': 'claude-windows',
         'V7': 'claude-phone', 'V8': 'meet-sam', 'V9': 'meet-travis', 'V10': 'first-win'}
LABEL = {'V1': ('Chris Ward', 'Grow With AI'), 'V8': ('Sam', 'AI trainer'), 'V9': ('Travis', 'AI trainer')}
def run(c): subprocess.run(c, check=True)
def norm(s): s = s.lower().replace('claude.com/download', 'claude dot com slash download').replace('xai', 'x a i'); return re.findall(r"[a-z]+(?:'[a-z]+)?", s)
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f'{int(h):02d}:{int(m):02d}:{s:06.3f}'
def vtt(c, path):
    cues = []
    for k, s in enumerate(c['sents']):
        ws = [w for w in c['words'] if w['k'] == k]; toks = s['cap'].split(); i = 0; chunk = []
        for j, tok in enumerate(toks):
            n = len(norm(tok)); tw = ws[i:i + n] or ws[max(0, i - 1):i]; i += n; chunk.append((tok, tw))
            line = ' '.join(x for x, _ in chunk)
            nxt = toks[j + 1] if j + 1 < len(toks) else None
            inq = line.count("'") - len(re.findall(r"[A-Za-z]'[A-Za-z]", line))  # an open quoted button name
            if nxt is None or (inq % 2 == 0 and (len(line) + 1 + len(nxt) > 64 or (len(line) > 30 and re.search(r'[,;:]$', tok)))) or len(line) > 90:
                st = next(w for _, tw_ in chunk for w in tw_)['s']; en = [w for _, tw_ in chunk for w in tw_][-1]['e']
                cues.append([st, en, line]); chunk = []
    for a, b in zip(cues, cues[1:]): a[1] = max(a[1], min(b[0], a[1] + 0.6))  # hold each line briefly, never overlapping
    cues[-1][1] = min(c['dur'], cues[-1][1] + 0.6)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('WEBVTT\n\n'); [f.write(f'{ts(a)} --> {ts(b)}\n{t}\n\n') for a, b, t in cues]
    return len(cues)
def label_png(name, role, path):
    f1 = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 30); f2 = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf', 26)
    w1 = f1.getlength(name); w2 = f2.getlength(role); W = int(w1 + w2 + 74); im = Image.new('RGBA', (W, 60), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, W - 1, 59), radius=30, fill=(255, 255, 255, 235)); d.text((24, 30), name, font=f1, fill='#16201D', anchor='lm')
    d.text((24 + w1 + 22, 31), role, font=f2, fill='#2F6B5A', anchor='lm'); im.save(path)
for v in (sys.argv[1:] or NAMES):
    c = json.load(open(f'{B}/cues/{v}.json')); base = f'{OUT}/gwai-{NAMES[v]}'; src = c['src']
    if v in LABEL:
        label_png(*LABEL[v], f'{B}/label-{v}.png')
        run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-i', f'{B}/label-{v}.png', '-filter_complex', '[0:v][1:v]overlay=28:H-h-28',
             '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', base + '.mp4'])
        pt = 2.0
    else:
        canvas = f'{B}/canvas-{v}.mp4'
        run(['node', f'{B}/render-start.js', f'{B}/cues/{v}.json', canvas])
        fc = ('[1:v]crop=600:540:280:0,scale=500:450,format=rgba[ch];[2:v]format=gray,scale=500:450[m];[ch][m]alphamerge[chr];'
              '[0:v][chr]overlay=1380:104:shortest=1,scale=1280:720:flags=lanczos,format=yuv420p[v]')
        run(['ffmpeg', '-y', '-loglevel', 'error', '-i', canvas, '-i', src, '-loop', '1', '-i', f'{B}/pipmask.png', '-filter_complex', fc,
             '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', base + '.mp4'])
        s = c['sents'][1]; pt = (s['start'] + s['end']) / 2
    n = vtt(c, base + '.vtt')
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{pt:.2f}', '-i', base + '.mp4', '-frames:v', '1', '-q:v', '4', base + '.jpg'])
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', base + '.mp4'], capture_output=True, text=True).stdout)
    print(v, os.path.basename(base), f'{d:.2f}s (source {c["dur"]:.2f})', f'{os.path.getsize(base + ".mp4") / 1e6:.1f} MB', n, 'caption lines')
