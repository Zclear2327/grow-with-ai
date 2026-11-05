/* WebAudio synthesized clicks, thunks, and a short win fanfare. No audio files. */
(function () {
  var ctx = null;
  var muted = false;
  var tickTimer = null;

  try {
    muted = localStorage.getItem("gwa_slot_mute") === "1";
  } catch (e) {}

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function now() {
    var c = ac();
    return c ? c.currentTime : 0;
  }

  function envGain(c, start, peak, attack, hold, release) {
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + attack);
    g.gain.setValueAtTime(peak, start + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
    return g;
  }

  function tone(freq, type, peak, attack, hold, release, when) {
    var c = ac();
    if (!c || muted) return;
    var t = when != null ? when : c.currentTime;
    var o = c.createOscillator();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    var g = envGain(c, t, peak, attack, hold, release);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + attack + hold + release + 0.02);
  }

  function noiseBurst(peak, dur, when, hpFreq) {
    var c = ac();
    if (!c || muted) return;
    var t = when != null ? when : c.currentTime;
    var n = c.createBufferSource();
    var len = Math.max(1, Math.floor(c.sampleRate * dur));
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    n.buffer = buf;
    var hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = hpFreq || 800;
    var g = envGain(c, t, peak, 0.005, 0.01, dur);
    n.connect(hp);
    hp.connect(g);
    g.connect(c.destination);
    n.start(t);
    n.stop(t + dur + 0.02);
  }

  var api = {
    isMuted: function () { return muted; },
    setMuted: function (v) {
      muted = !!v;
      try { localStorage.setItem("gwa_slot_mute", muted ? "1" : "0"); } catch (e) {}
      if (muted) api.stopTicks();
      else ac();
    },
    toggleMute: function () {
      api.setMuted(!muted);
      return muted;
    },
    unlock: function () { ac(); },
    click: function () {
      tone(880, "square", 0.04, 0.005, 0.01, 0.04);
      noiseBurst(0.03, 0.04, null, 1200);
    },
    tick: function () {
      tone(420 + Math.random() * 80, "square", 0.025, 0.002, 0.008, 0.03);
    },
    startTicks: function () {
      api.stopTicks();
      if (muted) return;
      tickTimer = setInterval(api.tick, 70);
    },
    stopTicks: function () {
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    },
    thunk: function (reelIndex) {
      var f = 180 - reelIndex * 12;
      tone(f, "sine", 0.08, 0.005, 0.04, 0.12);
      tone(f * 2.1, "triangle", 0.03, 0.005, 0.03, 0.1);
      noiseBurst(0.04, 0.06, null, 300);
    },
    fanfare: function () {
      var c = ac();
      if (!c || muted) return;
      var t = c.currentTime + 0.02;
      var notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach(function (f, i) {
        tone(f, "triangle", 0.09, 0.01, 0.12, 0.28, t + i * 0.09);
        tone(f * 2, "sine", 0.03, 0.01, 0.08, 0.2, t + i * 0.09);
      });
      tone(1318.5, "sine", 0.05, 0.02, 0.2, 0.45, t + 0.4);
      tone(1568, "sine", 0.035, 0.02, 0.15, 0.4, t + 0.48);
    },
    teach: function () {
      tone(392, "sine", 0.05, 0.02, 0.12, 0.25);
      tone(329.63, "sine", 0.04, 0.02, 0.16, 0.32, now() + 0.16);
    },
    end: function () {
      tone(523.25, "triangle", 0.06, 0.02, 0.12, 0.3);
      tone(659.25, "triangle", 0.05, 0.02, 0.14, 0.34, now() + 0.14);
      tone(783.99, "sine", 0.05, 0.02, 0.22, 0.4, now() + 0.28);
    }
  };

  window.SlotAudio = api;
})();
