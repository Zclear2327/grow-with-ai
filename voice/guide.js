/* Grow With AI voice setup guide.
   Runs entirely in the visitor's browser: speech-to-text and text-to-speech come from the browser itself.
   No server, no recording kept by us. It follows a fixed script; it is not a free-form AI chat.
   Every spoken choice also has a button, so it works without a mic and in browsers with no speech support. */
(function () {
  var box = document.getElementById("vg");
  if (!box) return;
  var DOWNLOAD = "https://claude.com/download";
  var TRAIN = "train/";
  var micBtn = box.querySelector(".vg-mic");
  var say = box.querySelector(".vg-say");
  var heard = box.querySelector(".vg-heard");
  var choices = box.querySelector(".vg-choices");
  var note = box.querySelector(".vg-note");

  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var canTalk = !!Rec;
  var canSpeak = "speechSynthesis" in window;
  var rec = null, listening = false, state = "start", platform = guessPlatform();

  if (!canTalk) {
    micBtn.querySelector(".vg-mic-label").textContent = "Start the setup guide";
    note.textContent = "Your browser can't listen, so tap the buttons instead. It works the same way.";
  }

  function guessPlatform() {
    var ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod|Android/i.test(ua)) return "phone";
    if (/Mac/i.test(ua)) return "mac";
    if (/Win/i.test(ua)) return "windows";
    return "";
  }
  var NAMES = { windows: "Windows", mac: "Mac" };

  // Each state: what we say, and the choices (spoken words that pick it, plus a button).
  function scene(name) {
    state = name;
    box.classList.add("started");
    var s = SCENES[name]();
    show(s.text, s.choices || []);
    speak(s.speak || s.text, function () { if (canTalk && s.listen !== false && s.choices && s.choices.length) listen(); });
  }

  var SCENES = {
    start: function () {
      if (platform === "phone") return SCENES.phone();
      var guess = NAMES[platform];
      return {
        text: guess
          ? "Hi, I'll help you put Claude on your computer. It looks like you're on " + guess + ". Is that right? Say yes, or say Windows or Mac."
          : "Hi, I'll help you put Claude on your computer. Are you on Windows or Mac?",
        choices: guess
          ? [c("Yes, " + guess, ["yes", "yeah", "yep", "right", "correct", "sure"].concat(platform === "mac" ? ["mac", "apple"] : ["windows", "pc"]), function () { scene("download"); }),
             c(platform === "mac" ? "No, Windows" : "No, Mac", ["no", "nope"].concat(platform === "mac" ? ["windows", "pc"] : ["mac", "apple"]), function () { platform = platform === "mac" ? "windows" : "mac"; scene("download"); })]
          : [c("Windows", ["windows", "pc"], function () { platform = "windows"; scene("download"); }),
             c("Mac", ["mac", "apple", "macbook"], function () { platform = "mac"; scene("download"); })]
      };
    },
    download: function () {
      return {
        text: "Great. Click the green button that says Download Claude. It opens Claude's own download page in a new tab. Pick " + (NAMES[platform] || "your computer") + ", and the file will download. When it's downloaded, say next.",
        choices: [c("Download Claude", ["download", "open", "go"], openDownload, true),
                  c("It's downloaded, next", ["next", "done", "downloaded", "finished", "ok", "okay"], function () { scene("install"); })]
      };
    },
    install: function () {
      var how = platform === "mac"
        ? "Open your Downloads folder and double-click the Claude file. Drag Claude into your Applications folder, then open it."
        : "Open your Downloads folder and double-click the Claude setup file. If Windows asks whether to allow it, click Yes. Claude opens when it's done.";
      return {
        text: how + " Then sign in. When you can see Claude's message box, say done.",
        choices: [c("Claude is open, done", ["done", "next", "open", "finished", "ok", "okay", "yes"], function () { scene("finish"); }),
                  c("I'm stuck", ["stuck", "help", "problem", "not working", "error"], function () { scene("help"); })]
      };
    },
    finish: function () {
      return {
        text: "You did it. Claude is on your computer. Next, the free training sets up your first AI helper, one small step at a time. Click Start the free training.",
        choices: [c("Start the free training", ["training", "start", "next", "yes", "go"], function () { location.href = TRAIN; }, true)],
        listen: true
      };
    },
    phone: function () {
      return {
        text: "It looks like you're on a phone. On your phone, open the App Store or Google Play, search for Claude by Anthropic, and install it. To put Claude on a computer, open this page on that computer and click the mic again. Or start the free training now.",
        choices: [c("Start the free training", ["training", "start", "go", "yes"], function () { location.href = TRAIN; }, true),
                  c("I'm on a computer", ["computer", "laptop", "desktop", "windows", "mac"], function () { platform = ""; scene("start"); })]
      };
    },
    help: function () {
      return {
        text: "No problem. The free training shows this step in a short video, and every step has a help button that reaches us. Want to open it?",
        choices: [c("Open the training", ["yes", "open", "training", "ok", "okay"], function () { location.href = TRAIN; }, true),
                  c("Start over", ["start over", "again", "restart", "back"], function () { scene("start"); })]
      };
    }
  };

  function c(label, words, fn, primary) { return { label: label, words: words, fn: fn, primary: !!primary }; }

  function show(text, list) {
    say.textContent = text;
    choices.innerHTML = "";
    list.forEach(function (ch) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn big " + (ch.primary ? "primary" : "ghost");
      b.textContent = ch.label;
      b.addEventListener("click", function () { stopAll(); ch.fn(); });
      choices.appendChild(b);
    });
    current = list;
  }
  var current = [];

  function openDownload() {
    // A voice command is not a click, so the browser may block the new tab. Only say it opened if it did.
    var w = null;
    try { w = window.open(DOWNLOAD, "_blank"); if (w) w.opener = null; } catch (e) {}
    var msg = w
      ? "The download page is open in a new tab. When the file has downloaded, come back here and say next."
      : "Your browser stopped the page from opening by voice. Click the green Download Claude button, then say next when the file has downloaded.";
    say.textContent = msg;
    speak(msg, function () { if (canTalk) listen(); });
  }

  function speak(text, then) {
    if (!canSpeak) { if (then) then(); return; }
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 1;
      var done = false, fin = function () { if (!done) { done = true; if (then) then(); } };
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
      setTimeout(fin, Math.max(4000, text.length * 90)); // some browsers never fire onend
    } catch (e) { if (then) then(); }
  }

  function listen() {
    if (!canTalk || listening) return;
    try {
      rec = new Rec();
      rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 3;
      rec.onresult = function (e) {
        var alts = [];
        for (var i = 0; i < e.results[0].length; i++) alts.push(e.results[0][i].transcript.toLowerCase());
        heard.textContent = "You said: “" + alts[0] + "”";
        route(alts);
      };
      rec.onerror = function (e) {
        listening = false; box.classList.remove("on");
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          note.textContent = "The mic is blocked in this browser, so tap the buttons instead. They do the same thing.";
        }
      };
      rec.onend = function () { listening = false; box.classList.remove("on"); micBtn.querySelector(".vg-mic-label").textContent = "Tap the mic to talk"; };
      rec.start(); listening = true; box.classList.add("on");
      micBtn.querySelector(".vg-mic-label").textContent = "Listening: tap to stop";
      heard.textContent = "Listening…";
    } catch (e) { listening = false; }
  }

  // Match whole words only, so "no" never matches inside "know".
  function route(alts) {
    for (var a = 0; a < alts.length; a++) {
      var words = " " + alts[a].replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ") + " ";
      for (var i = 0; i < current.length; i++) {
        for (var j = 0; j < current[i].words.length; j++) {
          if (words.indexOf(" " + current[i].words[j] + " ") !== -1) { current[i].fn(current[i].words[j]); return; }
        }
      }
    }
    speak("Sorry, I didn't catch that. You can say it again, or tap one of the buttons.", listen);
  }

  function stopAll() {
    try { if (rec) rec.abort(); } catch (e) {}
    listening = false; box.classList.remove("on");
    if (canSpeak) try { speechSynthesis.cancel(); } catch (e) {}
  }

  micBtn.addEventListener("click", function () {
    if (listening) { stopAll(); heard.textContent = ""; return; }
    if (state === "start" && !say.textContent) { scene("start"); return; }
    if (canTalk) listen(); else scene(state);
  });

  // Exposed for automated tests only.
  window.__vg = { route: route, scene: scene, state: function () { return state; }, setPlatform: function (p) { platform = p; } };
})();
