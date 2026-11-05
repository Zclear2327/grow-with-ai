(function () {
  var COLS = 5;
  var ROWS = 3;
  var COPIES = 8;
  var POINTS_CORRECT = 100;
  var order = window.SLOT_SYMBOL_ORDER;
  var symbols = window.SLOT_SYMBOLS;
  var questions = window.SLOT_QUESTIONS.slice();
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var fast = params.get("fast") === "1";
  var shotMode = params.get("shot");
  if (fast) reduceMotion = true;

  var state = {
    screen: "idle",
    qIndex: 0,
    points: 0,
    displayPoints: 0,
    correctCount: 0,
    current: null,
    spinning: false
  };

  var reelsEl = document.getElementById("reels");
  var spinBtn = document.getElementById("spinBtn");
  var muteBtn = document.getElementById("muteBtn");
  var pointsValue = document.getElementById("pointsValue");
  var qValue = document.getElementById("qValue");
  var overlay = document.getElementById("overlay");
  var questionCard = document.getElementById("questionCard");
  var teachCard = document.getElementById("teachCard");
  var endCard = document.getElementById("endCard");
  var winLayer = document.getElementById("winLayer");
  var winSub = document.getElementById("winSub");
  var coins = document.getElementById("coins");
  var reelViews = [];
  var uid = 0;
  var rollTimer = null;
  var winTimer = null;
  var coinAnim = null;

  function pad4(n) {
    var s = String(Math.max(0, Math.round(n)));
    while (s.length < 4) s = "0" + s;
    return s;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function symbolSvg(key) {
    uid += 1;
    var raw = symbols[key].svg;
    return raw
      .replace(/id="([^"]+)"/g, 'id="$1u' + uid + '"')
      .replace(/url\(#([^)]+)\)/g, "url(#$1u" + uid + ")");
  }

  function cellHtml(key) {
    return '<div class="cell"><div class="sym" data-sym="' + key + '">' + symbolSvg(key) + "</div></div>";
  }

  function cellSize() {
    var probe = reelsEl.querySelector(".cell");
    if (probe) return probe.getBoundingClientRect().height;
    var raw = getComputedStyle(document.documentElement).getPropertyValue("--cell").trim();
    var tmp = document.createElement("div");
    tmp.style.height = raw || "64px";
    tmp.style.position = "absolute";
    document.body.appendChild(tmp);
    var h = tmp.getBoundingClientRect().height;
    tmp.remove();
    return h || 64;
  }

  function buildLeds() {
    var box = document.getElementById("leds");
    var html = "";
    for (var i = 0; i < 13; i++) html += "<i></i>";
    box.innerHTML = html;
  }

  function buildReels() {
    reelsEl.innerHTML = "";
    reelViews = [];
    for (var c = 0; c < COLS; c++) {
      var reel = document.createElement("div");
      reel.className = "reel";
      reel.dataset.col = String(c);
      var strip = document.createElement("div");
      strip.className = "strip";
      var rot = shuffle(order);
      var seq = [];
      for (var copy = 0; copy < COPIES; copy++) {
        for (var s = 0; s < rot.length; s++) seq.push(rot[s]);
      }
      var html = "";
      for (var i = 0; i < seq.length; i++) html += cellHtml(seq[i]);
      strip.innerHTML = html;
      reel.appendChild(strip);
      reelsEl.appendChild(reel);
      var startIndex = 3 + (c * 2);
      reelViews.push({
        el: reel,
        strip: strip,
        seq: seq,
        index: startIndex,
        offset: 0
      });
    }
    applyOffsets(false);
  }

  function applyOffsets(withPx) {
    var h = cellSize();
    reelViews.forEach(function (r) {
      r.offset = -r.index * h;
      r.strip.style.transform = "translateY(" + r.offset + "px)";
    });
  }

  function setMuteUi() {
    var muted = window.SlotAudio.isMuted();
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.setAttribute("aria-label", muted ? "Unmute sounds" : "Mute sounds");
    muteBtn.textContent = muted ? "Mute on" : "Mute";
    muteBtn.style.fontSize = "11px";
    muteBtn.style.letterSpacing = ".04em";
    muteBtn.style.padding = "0 10px";
  }

  function updateHud() {
    pointsValue.textContent = pad4(state.displayPoints);
    var shown = Math.min(state.qIndex + 1, questions.length);
    qValue.textContent = shown + "/" + questions.length;
  }

  function rollPoints(to) {
    var from = state.displayPoints;
    state.points = to;
    if (rollTimer) cancelAnimationFrame(rollTimer);
    var start = performance.now();
    var dur = reduceMotion ? 200 : 700;
    function step(t) {
      var p = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      state.displayPoints = from + (to - from) * eased;
      pointsValue.textContent = pad4(state.displayPoints);
      if (p < 1) rollTimer = requestAnimationFrame(step);
      else {
        state.displayPoints = to;
        pointsValue.textContent = pad4(to);
      }
    }
    rollTimer = requestAnimationFrame(step);
  }

  function hideCards() {
    questionCard.hidden = true;
    teachCard.hidden = true;
    endCard.hidden = true;
    overlay.hidden = true;
    overlay.classList.remove("center");
  }

  function showCard(el) {
    questionCard.hidden = true;
    teachCard.hidden = true;
    endCard.hidden = true;
    overlay.hidden = false;
    overlay.classList.toggle("center", el === endCard);
    el.hidden = false;
    var heading = el.querySelector("h2");
    if (heading) heading.focus({ preventScroll: true });
  }

  function setSpinEnabled(on) {
    spinBtn.disabled = !on;
  }

  function spinTo(targets) {
    return new Promise(function (resolve) {
      var h = cellSize();
      var pending = reelViews.length;
      state.spinning = true;
      setSpinEnabled(false);
      window.SlotAudio.unlock();
      window.SlotAudio.startTicks();

      reelViews.forEach(function (r, i) {
        var period = order.length;
        var extraTurns = reduceMotion ? 6 + i * 2 : 16 + i * 4;
        var dest = r.index + extraTurns;
        dest = dest + ((targets[i] - (dest % period) + period) % period);
        var duration = reduceMotion ? 280 + i * 90 : 1100 + i * 280;
        var startOff = r.offset;
        var endOff = -dest * h;
        var start = performance.now();
        r.el.classList.add("blurry");

        function frame(now) {
          var t = Math.min(1, (now - start) / duration);
          var ease = 1 - Math.pow(1 - t, 3);
          if (t > 0.82 || reduceMotion) r.el.classList.remove("blurry");
          r.strip.style.transform = "translateY(" + (startOff + (endOff - startOff) * ease) + "px)";
          if (t < 1) {
            requestAnimationFrame(frame);
          } else {
            r.el.classList.remove("blurry");
            /* Snap back into a middle copy of the repeating strip so later spins cannot run off the end. */
            var wrapped = (dest % period) + period * 2;
            r.index = wrapped;
            r.offset = -wrapped * h;
            r.strip.style.transform = "translateY(" + r.offset + "px)";
            r.el.classList.add("bounce");
            window.SlotAudio.thunk(i);
            setTimeout(function () { r.el.classList.remove("bounce"); }, 300);
            pending -= 1;
            if (pending === 0) {
              window.SlotAudio.stopTicks();
              state.spinning = false;
              resolve();
            }
          }
        }
        requestAnimationFrame(frame);
      });
    });
  }

  function randomTargets() {
    var t = [];
    for (var i = 0; i < COLS; i++) t.push(Math.floor(Math.random() * order.length));
    return t;
  }

  function currentQuestion() {
    return questions[state.qIndex];
  }

  function openQuestion() {
    var q = currentQuestion();
    if (!q) { openEnd(); return; }
    state.current = q;
    state.screen = "question";
    var indexed = q.choices.map(function (text, i) { return { text: text, i: i }; });
    var shuffled = shuffle(indexed);
    document.getElementById("qMeta").textContent = "Question " + (state.qIndex + 1) + " of " + questions.length;
    document.getElementById("qHeading").textContent = q.topic === "myth" ? "A common idea about AI" : "From the trainer";
    document.getElementById("qText").textContent = q.q;
    var box = document.getElementById("choices");
    box.innerHTML = "";
    shuffled.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice";
      b.textContent = item.text;
      b.dataset.index = String(item.i);
      b.addEventListener("click", function () { answer(item.i, b); });
      box.appendChild(b);
    });
    updateHud();
    showCard(questionCard);
    var first = box.querySelector(".choice");
    if (first) first.focus();
  }

  function answer(choiceIndex) {
    if (state.screen !== "question") return;
    var q = state.current;
    var buttons = document.querySelectorAll("#choices .choice");
    buttons.forEach(function (b) { b.disabled = true; });
    var ok = choiceIndex === q.correct;
    if (ok) {
      state.correctCount += 1;
      showWin();
    } else {
      showTeach(q);
    }
  }

  function showWin() {
    state.screen = "win";
    hideCards();
    winSub.textContent = "+" + POINTS_CORRECT + " points";
    winLayer.hidden = false;
    window.SlotAudio.fanfare();
    rollPoints(state.points + POINTS_CORRECT);
    burstCoins();
    if (winTimer) clearTimeout(winTimer);
    if (shotMode !== "win") {
      winTimer = setTimeout(afterResult, reduceMotion ? 700 : 2200);
    }
  }

  function showTeach(q) {
    state.screen = "teach";
    document.getElementById("teachAnswer").textContent = q.choices[q.correct];
    document.getElementById("teachBody").textContent = q.teach;
    window.SlotAudio.teach();
    showCard(teachCard);
    document.getElementById("gotItBtn").focus();
  }

  function afterResult() {
    if (winTimer) { clearTimeout(winTimer); winTimer = null; }
    winLayer.hidden = true;
    stopCoins();
    hideCards();
    state.qIndex += 1;
    if (state.qIndex >= questions.length) {
      openEnd();
      return;
    }
    state.screen = "idle";
    updateHud();
    setSpinEnabled(true);
    spinBtn.focus();
  }

  function openEnd() {
    state.screen = "end";
    var total = questions.length;
    var right = state.correctCount;
    document.getElementById("endScore").textContent = right + " / " + total + "  ·  " + pad4(state.points) + " pts";
    var note;
    if (right === total) {
      note = "You answered every question. The useful idea still stands: AI is a tool you direct, and you check anything that matters.";
    } else if (right >= Math.ceil(total * 0.7)) {
      note = "You have the main ideas. AI can take busywork off your plate, it is sometimes wrong, and you stay in charge.";
    } else {
      note = "Every miss came with a plain explanation. That is the point of this game: less fear, clearer facts. Spin again whenever you like.";
    }
    document.getElementById("endNote").textContent = note;
    window.SlotAudio.end();
    showCard(endCard);
    document.getElementById("againBtn").focus();
  }

  function resetGame() {
    questions = shuffle(window.SLOT_QUESTIONS.slice());
    state.screen = "idle";
    state.qIndex = 0;
    state.points = 0;
    state.displayPoints = 0;
    state.correctCount = 0;
    state.current = null;
    hideCards();
    winLayer.hidden = true;
    stopCoins();
    updateHud();
    setSpinEnabled(true);
  }

  function burstCoins() {
    stopCoins();
    var canvas = coins;
    var ctx = canvas.getContext("2d");
    function size() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    size();
    var bits = [];
    var n = reduceMotion ? 12 : 56;
    for (var i = 0; i < n; i++) {
      bits.push({
        x: canvas.width * (0.2 + Math.random() * 0.6),
        y: -20 - Math.random() * 180,
        r: 6 + Math.random() * 9,
        vx: (Math.random() - 0.5) * 3.2,
        vy: 2.4 + Math.random() * 5.5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25
      });
    }
    var running = true;
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bits.forEach(function (c) {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.12;
        c.rot += c.vr;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.scale(1, 0.72);
        var g = ctx.createRadialGradient(-c.r * 0.3, -c.r * 0.3, 1, 0, 0, c.r);
        g.addColorStop(0, "#fff6c8");
        g.addColorStop(0.45, "#ffd24a");
        g.addColorStop(1, "#8a5a00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,244,192,.8)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      });
      coinAnim = requestAnimationFrame(draw);
    }
    draw();
    canvas._stop = function () { running = false; };
  }

  function stopCoins() {
    if (coinAnim) { cancelAnimationFrame(coinAnim); coinAnim = null; }
    if (coins && coins._stop) coins._stop();
    if (coins) {
      var ctx = coins.getContext("2d");
      ctx && ctx.clearRect(0, 0, coins.width, coins.height);
    }
  }

  async function onSpin() {
    if (state.screen !== "idle" || state.spinning) return;
    window.SlotAudio.unlock();
    window.SlotAudio.click();
    state.screen = "spinning";
    await spinTo(randomTargets());
    openQuestion();
  }

  spinBtn.addEventListener("click", onSpin);
  muteBtn.addEventListener("click", function () {
    window.SlotAudio.unlock();
    window.SlotAudio.toggleMute();
    setMuteUi();
  });
  document.getElementById("gotItBtn").addEventListener("click", afterResult);
  document.getElementById("againBtn").addEventListener("click", function () {
    resetGame();
    spinBtn.focus();
  });

  window.addEventListener("resize", function () { applyOffsets(true); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.screen === "win") afterResult();
    if ((e.key === "Enter" || e.key === " ") && state.screen === "idle" && document.activeElement === document.body) {
      e.preventDefault();
      onSpin();
    }
  });

  /* Test / screenshot helpers. Not shown in the UI. */
  window.__SLOT = {
    state: state,
    getState: function () { return state; },
    questions: function () { return questions; },
    spin: onSpin,
    answer: answer,
    showWin: function () {
      state.screen = "question";
      state.current = questions[state.qIndex] || window.SLOT_QUESTIONS[0];
      showWin();
    },
    showTeach: function () {
      var q = questions[state.qIndex] || window.SLOT_QUESTIONS[0];
      state.current = q;
      showTeach(q);
    },
    showEnd: openEnd,
    showQuestion: function () {
      if (!state.current) state.current = questions[0];
      openQuestion();
    }
  };

  buildLeds();
  buildReels();
  resetGame();
  setMuteUi();
  qValue.textContent = "1/" + questions.length;

  var shot = params.get("shot");
  if (shot === "win") {
    state.qIndex = 0;
    window.__SLOT.showWin();
  } else if (shot === "teach") {
    state.qIndex = 0;
    window.__SLOT.showTeach();
  } else if (shot === "question") {
    openQuestion();
  } else if (shot === "end") {
    state.correctCount = 16;
    state.points = 1600;
    state.displayPoints = 1600;
    updateHud();
    openEnd();
  }
})();
