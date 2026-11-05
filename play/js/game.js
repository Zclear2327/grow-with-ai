(function () {
  var COLS = 5;
  var ROWS = 3;
  var COPIES = 8;
  var POINTS_CORRECT = 100;
  var order = window.SLOT_SYMBOL_ORDER;
  var symbols = window.SLOT_SYMBOLS;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);
  var fast = params.get("fast") === "1";
  var shotMode = params.get("shot");
  var setupTool = params.get("tool") === "grok" ? "grok" : (params.get("tool") === "claude" ? "claude" : "");
  var setupMode = params.get("mode") === "setup" && window.setupCatalog;
  if (fast) reduceMotion = true;

  var questions = setupMode ? window.setupCatalog(setupTool, []) : window.SLOT_QUESTIONS.slice();

  var state = {
    screen: "idle",
    qIndex: 0,
    points: 0,
    displayPoints: 0,
    correctCount: 0,
    current: null,
    spinning: false,
    answers: [],
    tool: setupTool,
    pending: null
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
  var checkCard = document.getElementById("checkCard");
  var guideCard = document.getElementById("guideCard");
  var winLayer = document.getElementById("winLayer");
  var winTitle = document.getElementById("winTitle");
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
    if (checkCard) checkCard.hidden = true;
    if (guideCard) guideCard.hidden = true;
    overlay.hidden = true;
    overlay.classList.remove("center");
  }

  function showCard(el) {
    questionCard.hidden = true;
    teachCard.hidden = true;
    endCard.hidden = true;
    if (checkCard) checkCard.hidden = true;
    if (guideCard) guideCard.hidden = true;
    overlay.hidden = false;
    overlay.classList.toggle("center", el === endCard || el === checkCard || el === guideCard);
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
    document.getElementById("qMeta").textContent = "Question " + (state.qIndex + 1) + " of " + questions.length;
    document.getElementById("qHeading").textContent = setupMode
      ? "Setup check"
      : (q.topic === "myth" ? "A common idea about AI" : "From the trainer");
    document.getElementById("qText").textContent = q.q;
    var context = document.getElementById("qContext");
    if (context) {
      var hint = setupMode && window.onboardHint ? window.onboardHint(q.id, window.SETUP_ONBOARD_PROFILE) : "";
      context.hidden = !hint;
      context.textContent = hint || "";
    }
    var box = document.getElementById("choices");
    var free = document.getElementById("freeText");
    box.innerHTML = "";
    if (q.kind === "text") {
      free.hidden = false;
      document.getElementById("freeTextSend").disabled = false;
      document.getElementById("freeTextSkip").disabled = false;
      document.getElementById("freeTextLabel").textContent = q.hint || "";
      var input = document.getElementById("freeTextInput");
      input.value = "";
      input.placeholder = q.placeholder || "";
      updateHud();
      showCard(questionCard);
      input.focus();
      return;
    }
    if (free) free.hidden = true;
    if (setupMode) {
      q.choices.forEach(function (choice) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.textContent = choice.text;
        b.addEventListener("click", function () { answerSetup(choice); });
        box.appendChild(b);
      });
    } else {
      var indexed = q.choices.map(function (text, i) { return { text: text, i: i }; });
      shuffle(indexed).forEach(function (item) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.textContent = item.text;
        b.dataset.index = String(item.i);
        b.addEventListener("click", function () { answer(item.i, b); });
        box.appendChild(b);
      });
    }
    updateHud();
    showCard(questionCard);
    var first = box.querySelector(".choice");
    if (first) first.focus();
  }

  function syncSetupQuestions() {
    var tool = state.tool || setupTool || "";
    questions = window.setupCatalog(tool, state.answers);
    state.qIndex = state.answers.length;
    if (state.qIndex > questions.length) state.qIndex = questions.length;
  }

  function storeSetup(done) {
    if (!window.saveSetupCheck) return;
    window.saveSetupCheck({
      savedAt: new Date().toISOString(),
      openedFrom: setupTool || "direct",
      tool: state.tool || "",
      done: !!done,
      answers: state.answers
    });
  }

  function commitSetup(q, choice, outcome, guideInfo) {
    var row = window.makeSetupRow(state.tool, q, choice, outcome, guideInfo);
    if (!choice && q.kind === "text") {
      row.answer = outcome;
      row.outcome = "note";
      row.guide = "";
    }
    var replaced = false;
    var i;
    for (i = 0; i < state.answers.length; i++) {
      if (state.answers[i].id === q.id) {
        state.answers[i] = row;
        replaced = true;
      }
    }
    if (!replaced) state.answers.push(row);
    syncSetupQuestions();
    storeSetup(false);
  }

  function answerSetup(choice) {
    if (state.screen !== "question") return;
    var q = state.current;
    var buttons = document.querySelectorAll("#choices .choice");
    buttons.forEach(function (b) { b.disabled = true; });
    if (q.id === "platform") state.tool = choice.id;
    if (choice.outcome === "trouble" || choice.outcome === "assist") {
      var guide = window.setupGuideFor(state.tool, q, choice);
      if (guide) {
        state.pending = { q: q, choice: choice, guide: guide };
        showGuide(guide);
        return;
      }
    }
    commitSetup(q, choice, choice.outcome, null);
    showWin();
  }

  function showGuide(guide) {
    state.screen = "guide";
    document.getElementById("guideHeading").textContent = guide.title;
    document.getElementById("guideBody").textContent = guide.body;
    var tryLink = document.getElementById("guideTry");
    tryLink.href = guide.href;
    tryLink.textContent = guide.mode === "assist" ? "Open that step" : "Try again";
    document.getElementById("guideFixed").hidden = guide.mode === "assist";
    document.getElementById("guideOwn").hidden = guide.mode !== "assist";
    showCard(guideCard);
  }

  function finishGuide(outcome) {
    if (state.screen !== "guide" || !state.pending) return;
    var pending = state.pending;
    state.pending = null;
    commitSetup(pending.q, pending.choice, outcome, pending.guide);
    showWin();
  }

  function answer(choiceIndex) {
    if (state.screen !== "question" || setupMode) return;
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

  function answerText(raw) {
    if (state.screen !== "question" || !state.current || state.current.kind !== "text") return;
    var value = (raw || "").replace(/\s+/g, " ").trim();
    if (!value) value = "Nothing else";
    document.getElementById("freeTextSend").disabled = true;
    document.getElementById("freeTextSkip").disabled = true;
    commitSetup(state.current, null, value, null);
    showWin();
  }

  function showWin() {
    state.screen = "win";
    hideCards();
    if (winTitle) winTitle.textContent = setupMode ? "Thank you" : "You got it";
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
    if (setupMode) {
      if (state.qIndex >= questions.length) openEnd();
      else {
        state.screen = "idle";
        updateHud();
        setSpinEnabled(true);
        spinBtn.focus();
      }
      return;
    }
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

  function fillCheckList(ul, wrap, rows) {
    ul.innerHTML = "";
    wrap.hidden = rows.length === 0;
    rows.forEach(function (row) {
      var li = document.createElement("li");
      var q = document.createElement("span");
      q.className = "check-q";
      q.textContent = row.stepTitle || row.label;
      var a = document.createElement("span");
      a.className = "check-a";
      a.textContent = row.answer;
      li.appendChild(q);
      li.appendChild(a);
      if (row.guide) {
        var g = document.createElement("span");
        g.className = "check-mail-note";
        g.textContent = row.guide;
        li.appendChild(g);
      }
      ul.appendChild(li);
    });
  }

  function openCheckEnd() {
    state.screen = "end";
    var buckets = { unresolved: [], fixed: [], later: [], ok: [] };
    var note = "";
    state.answers.forEach(function (row) {
      if (row.id === "platform" || row.outcome === "branch") return;
      if (row.outcome === "note") { note = row.answer; return; }
      if (row.outcome === "unresolved") buckets.unresolved.push(row);
      else if (row.outcome === "fixed") buckets.fixed.push(row);
      else if (row.outcome === "later") buckets.later.push(row);
      else if (row.outcome === "ok" || row.outcome === "skipped") buckets.ok.push(row);
    });
    var next = window.setupNextAction(state.tool || setupTool || "claude", state.answers, window.SETUP_ONBOARD_PROFILE || null);
    var payload = {
      savedAt: new Date().toISOString(),
      openedFrom: setupTool || "direct",
      tool: state.tool || "",
      done: true,
      answers: state.answers,
      unresolved: buckets.unresolved,
      fixed: buckets.fixed,
      later: buckets.later,
      ok: buckets.ok,
      note: note,
      next: next
    };
    window.saveSetupCheck(payload);
    var delivery = window.deliverSetupCheck(payload);
    fillCheckList(document.getElementById("checkOpen"), document.getElementById("checkOpenWrap"), buckets.unresolved);
    fillCheckList(document.getElementById("checkFixed"), document.getElementById("checkFixedWrap"), buckets.fixed);
    fillCheckList(document.getElementById("checkLater"), document.getElementById("checkLaterWrap"), buckets.later);
    fillCheckList(document.getElementById("checkOk"), document.getElementById("checkOkWrap"), buckets.ok);
    var nextBox = document.getElementById("checkNext");
    nextBox.hidden = false;
    nextBox.innerHTML = "";
    var k = document.createElement("p");
    k.className = "check-q";
    k.textContent = next.kind === "resume" ? "Start here" : "Next";
    var body = document.createElement("p");
    body.className = "check-a";
    body.textContent = next.body;
    nextBox.appendChild(k);
    nextBox.appendChild(body);
    if (next.href) {
      var link = document.createElement("a");
      link.className = "btn secondary";
      link.href = next.href;
      link.textContent = next.link;
      nextBox.appendChild(link);
    }
    document.getElementById("checkScore").textContent = pad4(state.points) + " pts";
    var send = document.getElementById("sendWard");
    send.href = delivery.mailto;
    send.textContent = "Open email draft";
    window.SlotAudio.end();
    showCard(checkCard);
  }

  function openEnd() {
    if (setupMode) {
      openCheckEnd();
      return;
    }
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
    questions = setupMode ? window.setupCatalog(setupTool, []) : shuffle(window.SLOT_QUESTIONS.slice());
    state.screen = "idle";
    state.qIndex = 0;
    state.points = 0;
    state.displayPoints = 0;
    state.correctCount = 0;
    state.current = null;
    state.answers = [];
    state.tool = setupTool;
    state.pending = null;
    if (setupMode) syncSetupQuestions();
    var input = document.getElementById("freeTextInput");
    if (input) input.value = "";
    var sendNote = document.getElementById("freeTextSend");
    var skipNote = document.getElementById("freeTextSkip");
    if (sendNote) sendNote.disabled = false;
    if (skipNote) skipNote.disabled = false;
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
    var n = reduceMotion ? 16 : 72;
    var cx = canvas.width / 2;
    var cy = canvas.height * 0.44;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2;
      var speed = reduceMotion ? 0.15 : 0.35 + Math.random() * 1.7;
      bits.push({
        x: cx + (Math.random() - 0.5) * 36,
        y: cy + (Math.random() - 0.5) * 16,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed * 0.72 - 0.25,
        life: 0.35 + Math.random() * 0.65,
        decay: reduceMotion ? 0.02 : 0.005 + Math.random() * 0.008,
        r: Math.random() < 0.12 ? 1.6 + Math.random() * 1.2 : 0.45 + Math.random() * 0.9,
        gold: Math.random() < 0.16
      });
    }
    var running = true;
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bits.forEach(function (c) {
        c.x += c.vx;
        c.y += c.vy;
        c.life -= c.decay;
        if (c.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, c.life));
        ctx.shadowBlur = 14;
        ctx.shadowColor = c.gold ? "rgba(214, 186, 120, .85)" : "rgba(150, 240, 255, .95)";
        ctx.fillStyle = c.gold ? "#f3e6c4" : "#f3fdff";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = c.gold ? "rgba(231, 215, 168, .55)" : "rgba(190, 246, 255, .7)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 7, c.y - c.vy * 7);
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
  document.getElementById("freeTextSend").addEventListener("click", function () {
    answerText(document.getElementById("freeTextInput").value);
  });
  document.getElementById("freeTextSkip").addEventListener("click", function () {
    answerText("");
  });
  document.getElementById("checkAgain").addEventListener("click", function () {
    resetGame();
    spinBtn.focus();
  });
  document.getElementById("guideStuck").addEventListener("click", function () { finishGuide("unresolved"); });
  document.getElementById("guideFixed").addEventListener("click", function () { finishGuide("fixed"); });
  document.getElementById("guideOwn").addEventListener("click", function () { finishGuide("ok"); });

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

  var showQuestionBtn = document.getElementById("showQuestion");
  if (showQuestionBtn) {
    showQuestionBtn.hidden = !setupMode;
    showQuestionBtn.addEventListener("click", function () {
      if (state.screen !== "idle" || state.spinning) return;
      openQuestion();
    });
  }
  window.__SLOT.beginDiagnostic = function (profile) {
    window.SETUP_ONBOARD_PROFILE = profile || null;
    if (profile && (profile.platform === "claude" || profile.platform === "grok")) {
      state.tool = profile.platform;
      setupTool = profile.platform;
    }
    document.body.classList.remove("setup-onboard");
    document.title = "Setup Check | Grow With AI";
    var sub = document.querySelector(".subtitle");
    var title = document.querySelector(".jackpot");
    var tag = document.querySelector(".tagline");
    if (sub) sub.textContent = "Setup check";
    if (title) title.textContent = "How did setup go?";
    if (tag) tag.textContent = "Spin is optional. Show the question, or spin first. If a step did not work, the check shows that training step. Points only. These notes are from the training, not a live assistant.";
    if (showQuestionBtn) showQuestionBtn.hidden = false;
    resetGame();
  };

  if (setupMode && params.get("phase") === "check") {
    document.body.classList.remove("setup-onboard");
    window.__SLOT.beginDiagnostic(window.SETUP_ONBOARD_PROFILE || null);
  } else if (setupMode) {
    document.body.classList.add("setup-onboard");
    document.title = "Set up your AI | Grow With AI";
  }

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
    if (setupMode) {
      state.tool = setupTool || "claude";
      state.answers = [];
      syncSetupQuestions();
    } else {
      state.correctCount = 16;
      state.points = 1600;
      state.displayPoints = 1600;
    }
    updateHud();
    openEnd();
  } else if (shot === "text" && setupMode) {
    state.qIndex = questions.length - 1;
    openQuestion();
  }
})();
