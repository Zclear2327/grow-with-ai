/* Grow With AI: fill-in-the-blanks prompts for the training steps.
   A prompt like "I run [what your business does]." gets one box per [lowercase blank].
   The finished prompt updates as people type, and "Copy my prompt" copies it in one tap.
   Blanks in CAPITALS, like [DATE], are left alone: they are part of the prompt itself.
   Answers are remembered in this browser only, so a repeat blank is already filled.
   A pasted customer message is never remembered. */
(function () {
  var BLANK = /\[([a-z][^\]]*)\]/g;
  var LONG = /list|paste/;
  var PRIVATE = /paste/; // never remember pasted customer messages
  var LABELS = {
    "what your business does": "What your business does (for example: lawn care in Ogden)",
    "day": "The day you want to be paid by (for example: Friday, Nov 14)",
    "one sentence on what you sell and who buys it": "One sentence: what you sell and who buys it",
    "what you do": "What your business does",
    "paste it here": "Paste the customer's email here",
    "list": "Things you need to get done",
    "list with day and time": "Fixed appointments, with day and time",
    "hours": "Your working hours",
    "one sentence": "Your most important goal this week, in one sentence"
  };

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem("gwai.blank." + k) || ""; localStorage.setItem("gwai.blank." + k, v); } catch (e) { return ""; }
  }
  function blanksIn(t) {
    var out = [], m; BLANK.lastIndex = 0;
    while ((m = BLANK.exec(t))) if (out.indexOf(m[1]) < 0) out.push(m[1]);
    return out;
  }
  function fill(t, vals) {
    return t.replace(BLANK, function (all, k) { var v = (vals[k] || "").trim(); return v ? v : all; });
  }
  function copyText(txt, ok, fail) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length);
      var done = false; try { done = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done ? ok() : fail();
    }
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, fallback);
    else fallback();
  }

  /* host: the element that holds the boxes. textEl: where the finished prompt shows.
     btn/msg: the copy button and its status line. appName: "Claude" or "Grok". */
  function render(host, textEl, btn, msg, template, appName) {
    host.innerHTML = ""; msg.textContent = "";
    var keys = blanksIn(template), vals = {}, inputs = {};
    function update() { textEl.textContent = fill(template, vals); }
    keys.forEach(function (k, i) {
      var id = "blank-" + i, wrap = document.createElement("p"), lab = document.createElement("label");
      wrap.className = "blank";
      lab.setAttribute("for", id); lab.textContent = LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1));
      var inp = document.createElement(LONG.test(k) ? "textarea" : "input");
      if (inp.tagName === "INPUT") inp.type = "text";
      inp.id = id; inp.autocomplete = "off"; inp.value = vals[k] = PRIVATE.test(k) ? "" : store(k);
      inp.addEventListener("input", function () { vals[k] = inp.value; if (!PRIVATE.test(k)) store(k, inp.value); msg.textContent = ""; update(); });
      inputs[k] = inp; wrap.appendChild(lab); wrap.appendChild(inp); host.appendChild(wrap);
    });
    host.hidden = keys.length === 0;
    btn.textContent = keys.length ? "Copy my prompt" : "Copy this";
    btn.onclick = function () {
      for (var i = 0; i < keys.length; i++) {
        if (!(vals[keys[i]] || "").trim()) { msg.textContent = " Fill in this box first: " + (LABELS[keys[i]] || keys[i]) + "."; inputs[keys[i]].focus(); return; }
      }
      copyText(fill(template, vals),
        function () { msg.textContent = " Copied. Now paste it into " + appName + "."; },
        function () { msg.textContent = " Your phone blocked copying. Press and hold the prompt above, then tap Copy."; });
    };
    update();
  }
  window.GWAIBlanks = { render: render, blanksIn: blanksIn, fill: fill };
})();
