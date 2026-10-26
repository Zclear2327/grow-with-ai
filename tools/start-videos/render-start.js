// node render-start.js CUES.json --stills PREFIX            one still per sentence (mid-sentence) + PREFIX_end.jpg
// node render-start.js CUES.json OUT_canvas.mp4              silent 30 fps illustration track (Chris's box left empty)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
(async () => {
  const [cuesPath, out, a3] = process.argv.slice(2); const c = JSON.parse(fs.readFileSync(cuesPath, 'utf8'));
  const job = { v: c.v, dur: c.dur, sents: c.sents.map(s => ({ start: s.start, end: s.end })) };
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  let failed = null; page.on('pageerror', e => { failed = e; });
  await page.addInitScript(j => { window.JOB = j; }, job); await page.goto('file://' + path.resolve(__dirname, 'start-engine.html'));
  await page.evaluate(() => document.fonts.ready);
  const chk = () => { if (failed) { console.error('PAGEERR', String(failed)); process.exit(1); } }; chk();
  try { await page.evaluate(() => validate()); } catch (e) { console.error('INVALID', e.message.split('\n')[0]); process.exit(1); }
  const grab = t => page.evaluate(t => { draw(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]; }, t);
  if (out === '--stills') {
    const ts = job.sents.map((s, k) => { const nx = k + 1 < job.sents.length ? job.sents[k + 1].start - 0.3 : job.dur; return [(s.start - 0.3 + nx) / 2, nx - 0.05]; });
    for (let k = 0; k < ts.length; k++) for (const [j, t] of ts[k].entries()) { fs.writeFileSync(`${a3}_${String(k).padStart(2, '0')}${'ab'[j]}.jpg`, Buffer.from(await grab(t), 'base64')); chk(); }
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.ceil(30 * job.dur);
  for (let f = 0; f < n; f++) { const b = Buffer.from(await grab(f / 30), 'base64'); chk(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); const code = await new Promise(r => ff.on('close', r)); await browser.close(); if (code) process.exit(1); console.log('canvas', out, n);
})();
