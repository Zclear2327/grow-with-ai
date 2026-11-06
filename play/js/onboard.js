/* Set up your AI — ten written questions before the setup check.
   Original wording. Not a live assistant, not a cloned voice, and not the
   film script this pacing is loosely inspired by.
   Sam and Travis are the trainer names already used on this site.
   Meet clips, if played, are the existing files in /start/video/.
   Answers stay in localStorage key gwa_ai_setup. Nothing is sent unless
   the person opens the email draft and sends it themselves. */
(function () {
  var params = new URLSearchParams(location.search);
  if (params.get("mode") !== "setup" || params.get("phase") === "check") return;

  var KEY = "gwa_ai_setup";
  var root = document.getElementById("onboard");
  var done = document.getElementById("obDone");
  if (!root || !done) return;

  var preset = params.get("tool") === "grok" ? "grok" : (params.get("tool") === "claude" ? "claude" : "");
  var speechOn = false;
  var returnTo = "";
  var clearArmed = false;

  var CHOICE = {
    guide: [
      ["sam", "Sam"],
      ["travis", "Travis"]
    ],
    role: [
      ["business", "A small business I run"],
      ["job", "A job I do for someone else"],
      ["home", "Home and personal tasks"],
      ["unsure", "I'm not sure yet"]
    ],
    goal: [
      ["task", "Get one task off my plate this week"],
      ["learn", "Learn the steps without rushing"],
      ["try", "See if this is useful before I rely on it"],
      ["unsure", "I'm not sure yet"]
    ],
    task: [
      ["customers", "Replying to customers"],
      ["payment", "A payment or money email"],
      ["week", "Planning the week"],
      ["photo", "A photo of a note or a receipt"],
      ["unsure", "I'm not sure yet"]
    ],
    experience: [
      ["notyet", "Not yet"],
      ["little", "A little"],
      ["often", "Often"]
    ],
    replies: [
      ["brief", "Brief"],
      ["detailed", "Detailed"],
      ["either", "Either is fine"]
    ],
    learn: [
      ["steps", "One step at a time"],
      ["example", "Show me an example first"],
      ["either", "Either is fine"]
    ],
    device: [
      ["phone", "Phone"],
      ["computer", "Computer"],
      ["both", "Both"]
    ],
    input: [
      ["speak", "Speak"],
      ["type", "Type"],
      ["either", "Either is fine"]
    ],
    result: [
      ["draft", "A draft I can edit"],
      ["list", "A short list"],
      ["step", "The next step, one at a time"],
      ["unsure", "I'm not sure yet"]
    ]
  };

  var ORDER = ["guide", "name", "role", "goal", "task", "experience", "replies", "learn", "device", "input", "result"];

  function blank() {
    return { v: 1, phase: "ask", i: 0, A: {}, platform: preset, at: "" };
  }
  var state = blank();

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && raw.v === 1 && raw.A) state = raw;
    } catch (e) {}
    if (!state.platform && preset) state.platform = preset;
  }
  function save() {
    state.at = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function wipe() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { localStorage.removeItem("gwa_setup_check"); } catch (e) {}
    state = blank();
    returnTo = "";
    clearArmed = false;
  }

  function label(id) {
    var row = state.A[id];
    if (!row) return "";
    return row.label || "";
  }
  function picked(id, choiceId, text) {
    state.A[id] = { id: choiceId, label: text };
    save();
  }

  function ack(id) {
    var row = state.A[id];
    var text = row ? row.label : "";
    if (!row || row.id === "skip") {
      if (id === "name") return "No name saved. The prompt will say \"I\".";
      return "Skipped. You can go back and answer it.";
    }
    if (id === "guide") return text + " is the written name on this setup. This page is not " + text + " talking live.";
    if (id === "name") return "The prompt will use \"" + text + "\". It stays in this browser.";
    if (id === "role") return "Work: " + text + ".";
    if (id === "goal") return "First goal: " + text + ".";
    if (id === "task") return "Repeated task: " + text + ".";
    if (id === "experience") return "AI chat so far: " + text + ".";
    if (id === "replies") return "Replies: " + text + ".";
    if (id === "learn") return "Learning: " + text + ".";
    if (id === "device") return "Where you'll use it: " + text + ".";
    if (id === "input") {
      if (row.id === "speak" && state.A.device && state.A.device.id === "computer") {
        return "You chose speaking. The training's microphone step is the button on a phone keyboard. On a computer you can still type.";
      }
      return "How you'll give instructions: " + text + ".";
    }
    if (id === "result") return "A useful first result: " + text + ".";
    return text;
  }

  function firstTask() {
    var exp = state.A.experience && state.A.experience.id;
    var task = state.A.task && state.A.task.id;
    var map = {
      customers: { diag: "job", step: 16, title: "Answer a customer email", why: "You said the repeated task is replying to customers.", prompt: "Help draft a reply to a customer email, under 150 words. If a fact is missing, leave a blank like [DATE] instead of guessing." },
      payment: { diag: "job", step: 13, title: "Try it on a real job", why: "You said the repeated task is a payment or money email.", prompt: "Help draft a friendly but clear email, under 120 words, asking a customer who paid late for last month's payment. Ask what you need before writing it." },
      week: { diag: "job", step: 17, title: "Plan your week", why: "You said the repeated task is planning the week.", prompt: "Help plan next week as a simple day-by-day table. Ask for tasks, appointments with day and time, working hours, and the most important goal. List anything that will not fit." },
      photo: { diag: "photo", step: 14, title: "Ask about a photo", why: "You said the repeated task is a photo of a note or receipt.", prompt: "When a photo of a receipt or a note is sent, type what is on it as a simple list." }
    };
    if (!task || task === "unsure" || task === "skip" || !map[task]) {
      return {
        diag: "hello",
        step: 9,
        title: "Say hello",
        why: exp === "notyet"
          ? "You said you have not used an AI chat yet, and you did not name a repeated task, so the first training step is say hello."
          : "You did not name a repeated task, so the first training step is say hello.",
        prompt: "Start by asking five questions about the work, one at a time, then suggest three tasks. Wait between questions."
      };
    }
    if (exp === "notyet") {
      return {
        diag: "hello",
        step: 9,
        title: "Say hello",
        why: map[task].why + " You also said you have not used an AI chat yet, so the training starts with say hello before that job.",
        prompt: "Start by asking five questions about the work, one at a time, then suggest three tasks. Wait between questions. After that: " + map[task].prompt
      };
    }
    return map[task];
  }

  function profile() {
    return {
      A: state.A,
      platform: state.platform,
      firstTask: firstTask(),
      at: state.at
    };
  }
  window.onboardHint = function (qid, prof) {
    if (!prof || !prof.A) return "";
    var A = prof.A;
    if (qid === "computer" && A.device && A.device.id === "phone") return "You said you will use this most on your phone. The training says to skip the computer step if you only use a phone.";
    if (qid === "computer" && A.device && A.device.id === "computer") return "You said you will use this most on a computer.";
    if (qid === "mic" && A.input && A.input.id === "type") return "You said you prefer to type. The training says you never have to type, so typing counts.";
    if (qid === "mic" && A.input && A.input.id === "speak") return "You said you prefer to speak. The training's microphone step is the button on a phone keyboard.";
    if (qid === "app" && A.device && A.device.id === "computer") return "You said you will use a computer most. The phone-app step can be skipped.";
    if (qid === "hello" && A.experience && A.experience.id === "notyet") return "You said you have not used an AI chat yet. This is the training's first conversation.";
    if (prof.firstTask && qid === prof.firstTask.diag) return prof.firstTask.why;
    return "";
  };

  function line(id, fallback) {
    var row = state.A[id];
    if (!row || row.id === "skip" || !row.label) return fallback;
    return row.label;
  }
  function promptText() {
    var guide = line("guide", "No guide name chosen");
    var who = state.A.name && state.A.name.id !== "skip" && state.A.name.label ? state.A.name.label : "";
    var app = state.platform === "grok" ? "Grok" : (state.platform === "claude" ? "Claude" : "");
    var task = firstTask();
    var learn = state.A.learn && state.A.learn.id;
    var replies = state.A.replies && state.A.replies.id;
    var parts = [];
    parts.push("You are an AI assistant, not a person. Draft only. Do not send messages, spend money, or change accounts.");
    if (who) parts.push("Call me " + who + ".");
    else parts.push("I did not give a name.");
    if (guide !== "No guide name chosen") parts.push("The written guide name I picked on Grow With AI is " + guide + ". That is a name, not a live voice.");
    parts.push("Work: " + line("role", "not specified") + ".");
    parts.push("First goal: " + line("goal", "not specified") + ".");
    parts.push("Repeated task: " + line("task", "not specified") + ".");
    parts.push("AI chat so far: " + line("experience", "not specified") + ".");
    if (replies === "brief") parts.push("Keep replies brief.");
    else if (replies === "detailed") parts.push("Replies can be detailed.");
    else parts.push("Reply length: " + line("replies", "either is fine") + ".");
    if (learn === "steps") parts.push("Teach one step at a time and wait.");
    else if (learn === "example") parts.push("Show an example first.");
    else parts.push("Learning style: " + line("learn", "either is fine") + ".");
    parts.push("I will use: " + line("device", "not specified") + ". I prefer to " + line("input", "either speak or type") + ".");
    parts.push("A useful first result looks like: " + line("result", "not specified") + ".");
    if (app) parts.push("I will paste this into " + app + " myself.");
    parts.push("First task: " + task.prompt);
    parts.push("If a fact is missing, leave a blank like [DATE] instead of guessing.");
    return parts.join("\n");
  }

  function draftHref() {
    var body = [
      "Set up your AI draft",
      "Opening this draft does not send mail. You send it yourself.",
      "These answers were stored only in the browser until you opened this draft.",
      "This is not a live assistant.",
      "",
      promptText()
    ].join("\n");
    return "mailto:hello@wardconsulting.ai?subject=" + encodeURIComponent("Set up your AI draft") + "&body=" + encodeURIComponent(body);
  }

  function numberFor(id) {
    if (id === "input") return 9;
    if (id === "result") return 10;
    var n = ORDER.indexOf(id);
    return n < 0 ? 1 : n + 1;
  }

  function questionCopy(id) {
    var map = {
      guide: ["Who should be the written guide for this setup?", "Sam and Travis are trainer names already used on this site. The pick changes the name in your prompt and which existing meet clip you can play. It does not start a live voice."],
      name: ["What should we call you?", "Optional. Skip if you prefer not to say. This is only for the prompt on this page."],
      role: ["What work should this help with?", "Pick the closest line. You can change it later."],
      goal: ["What is the first goal?", ""],
      task: ["Which repeated task should it help with first?", "This chooses the training step suggested at the end. It does not start that task."],
      experience: ["How much have you used an AI chat before?", ""],
      replies: ["How long should replies be?", ""],
      learn: ["How do you want to learn a new step?", ""],
      device: ["Where will you use it most?", ""],
      input: ["How do you want to give it instructions?", "Speaking uses your own device. This page does not hear you unless you turn on browser speech below."],
      result: ["What does a useful first result look like?", ""]
    };
    return map[id] || ["", ""];
  }

  function stopSpeech() {
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  }
  function speak(text) {
    stopSpeech();
    if (!speechOn || !window.speechSynthesis) return;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  }
  function speechLine(id) {
    var copy = questionCopy(id);
    var choices = (CHOICE[id] || []).map(function (pair) { return pair[1]; }).join(". ");
    return copy[0] + (copy[1] ? " " + copy[1] : "") + (choices ? " Choices: " + choices + "." : "");
  }

  function showAsk() {
    done.hidden = true;
    root.hidden = false;
    var id = ORDER[state.i] || "guide";
    var copy = questionCopy(id);
    document.getElementById("obCount").textContent = numberFor(id) + " of 10";
    document.getElementById("obQuestion").textContent = copy[0];
    document.getElementById("obHelp").textContent = copy[1];
    document.getElementById("obAck").textContent = state.A[id] ? ack(id) : "";
    var box = document.getElementById("obChoices");
    var textWrap = document.getElementById("obText");
    box.innerHTML = "";
    textWrap.hidden = id !== "name";
    document.getElementById("obSkip").hidden = false;
    document.getElementById("obBack").hidden = state.i === 0;
    document.getElementById("obNext").hidden = false;
    if (id === "name") {
      document.getElementById("obTextLabel").textContent = "Name";
      var input = document.getElementById("obInput");
      input.value = state.A.name && state.A.name.id !== "skip" ? state.A.name.label : "";
    } else {
      (CHOICE[id] || []).forEach(function (pair) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = pair[1];
        b.setAttribute("aria-pressed", state.A[id] && state.A[id].id === pair[0] ? "true" : "false");
        b.addEventListener("click", function () {
          picked(id, pair[0], pair[1]);
          document.getElementById("obAck").textContent = ack(id);
          [].forEach.call(box.children, function (child) { child.setAttribute("aria-pressed", "false"); });
          b.setAttribute("aria-pressed", "true");
        });
        box.appendChild(b);
      });
    }
    document.getElementById("obQuestion").focus();
    if (speechOn) speak(speechLine(id));
    save();
  }

  function showSummary() {
    stopSpeech();
    state.phase = "summary";
    save();
    root.hidden = true;
    done.hidden = false;
    var guideName = label("guide");
    if (!guideName || guideName === "Skipped") guideName = "The written guide";
    document.getElementById("obGreet").textContent = guideName + " is the name on this setup.";
    document.getElementById("obGreetBody").textContent = "The answers below are what you selected. Nothing has been installed, and no account has been opened. This is written text, not a live reply.";
    var clip = document.getElementById("obClip");
    var who = state.A.guide && state.A.guide.id;
    if (who === "sam" || who === "travis") {
      clip.hidden = false;
      var video = document.getElementById("obVideo");
      var file = who === "travis" ? "gwai-meet-travis" : "gwai-meet-sam";
      video.poster = "../start/video/" + file + ".jpg";
      video.innerHTML = "";
      var source = document.createElement("source");
      source.src = "../start/video/" + file + ".mp4";
      source.type = "video/mp4";
      var track = document.createElement("track");
      track.kind = "captions";
      track.srclang = "en";
      track.label = "English";
      track.src = "../start/video/" + file + ".vtt";
      track.default = true;
      video.appendChild(source);
      video.appendChild(track);
      video.load();
      document.getElementById("obClipCap").textContent = "Existing site clip: Meet " + (who === "travis" ? "Travis" : "Sam") + ". Press play if you want it. It does not answer these questions, and it is not a live voice.";
    } else {
      clip.hidden = true;
    }
    renderSummaryFields();
    renderPlatform();
    refreshPrompt();
    document.getElementById("obGreet").focus();
  }

  function renderSummaryFields() {
    var host = document.getElementById("obSummary");
    host.innerHTML = "";
    var fields = [
      ["guide", "Guide"],
      ["name", "Name"],
      ["role", "Work"],
      ["goal", "First goal"],
      ["task", "Repeated task"],
      ["experience", "AI experience"],
      ["replies", "Replies"],
      ["learn", "Learning"],
      ["device", "Device"],
      ["input", "Instructions"],
      ["result", "Useful result"]
    ];
    fields.forEach(function (pair) {
      var row = document.createElement("div");
      row.className = "row";
      var span = document.createElement("span");
      span.textContent = pair[1];
      row.appendChild(span);
      if (pair[0] === "name") {
        var input = document.createElement("input");
        input.value = state.A.name && state.A.name.id !== "skip" ? state.A.name.label : "";
        input.maxLength = 80;
        input.autocomplete = "off";
        input.setAttribute("aria-label", "Name");
        input.addEventListener("input", function () {
          var v = input.value.replace(/\s+/g, " ").trim();
          state.A.name = v ? { id: "given", label: v } : { id: "skip", label: "Skipped" };
          save();
          refreshPrompt();
        });
        row.appendChild(input);
      } else {
        var sel = document.createElement("select");
        sel.setAttribute("aria-label", pair[1]);
        var cur = document.createElement("option");
        cur.value = "skip";
        cur.textContent = "Skipped";
        sel.appendChild(cur);
        (CHOICE[pair[0]] || []).forEach(function (opt) {
          var o = document.createElement("option");
          o.value = opt[0];
          o.textContent = opt[1];
          sel.appendChild(o);
        });
        sel.value = state.A[pair[0]] && state.A[pair[0]].id ? state.A[pair[0]].id : "skip";
        if (sel.value !== "skip" && state.A[pair[0]] && state.A[pair[0]].id !== "skip") {
          var known = (CHOICE[pair[0]] || []).some(function (opt) { return opt[0] === sel.value; });
          if (!known) sel.value = "skip";
        }
        sel.addEventListener("change", function () {
          if (sel.value === "skip") state.A[pair[0]] = { id: "skip", label: "Skipped" };
          else {
            var found = (CHOICE[pair[0]] || []).filter(function (opt) { return opt[0] === sel.value; })[0];
            state.A[pair[0]] = { id: found[0], label: found[1] };
          }
          save();
          if (pair[0] === "guide") showSummary();
          else refreshPrompt();
        });
        row.appendChild(sel);
      }
      host.appendChild(row);
    });
  }

  function renderPlatform() {
    var box = document.getElementById("obPlatformChoices");
    box.innerHTML = "";
    [["grok", "Grok"]].forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = pair[1];
      b.setAttribute("aria-pressed", state.platform === pair[0] ? "true" : "false");
      b.addEventListener("click", function () {
        state.platform = pair[0];
        save();
        renderPlatform();
        refreshPrompt();
      });
      box.appendChild(b);
    });
  }

  function refreshPrompt() {
    var task = firstTask();
    document.getElementById("obTask").textContent = task.why + " Suggested training step: " + task.title + ". Pasting the prompt does not open that step or your account.";
    document.getElementById("obPrompt").value = promptText();
    document.getElementById("obDraft").href = draftHref();
  }

  function advance() {
    if (returnTo === "summary") {
      returnTo = "";
      showSummary();
      return;
    }
    if (state.i < ORDER.length - 1) {
      state.i += 1;
      showAsk();
    } else showSummary();
  }
  function commitCurrent() {
    var id = ORDER[state.i];
    if (id === "name") {
      var v = document.getElementById("obInput").value.replace(/\s+/g, " ").trim();
      if (v) picked("name", "given", v);
      else if (!state.A.name) picked("name", "skip", "Skipped");
      document.getElementById("obAck").textContent = ack("name");
    }
  }

  document.getElementById("obNext").addEventListener("click", function () {
    commitCurrent();
    var id = ORDER[state.i];
    if (id !== "name" && !state.A[id]) return;
    advance();
  });
  document.getElementById("obSkip").addEventListener("click", function () {
    var id = ORDER[state.i];
    picked(id, "skip", "Skipped");
    if (id === "device") picked("input", "skip", "Skipped");
    document.getElementById("obAck").textContent = ack(id);
    if (id === "device") state.i = ORDER.indexOf("input");
    advance();
  });
  document.getElementById("obBack").addEventListener("click", function () {
    if (state.i > 0) {
      state.i -= 1;
      showAsk();
    }
  });
  document.getElementById("obSpeak").addEventListener("click", function () {
    speechOn = !speechOn;
    this.setAttribute("aria-pressed", speechOn ? "true" : "false");
    this.textContent = speechOn ? "Mute browser speech" : "Play question";
    if (speechOn) speak(speechLine(ORDER[state.i]));
    else stopSpeech();
  });
  if (!window.speechSynthesis) document.getElementById("obSpeak").hidden = true;

  document.getElementById("obCopy").addEventListener("click", function () {
    var text = document.getElementById("obPrompt").value;
    var msg = document.getElementById("obCopyMsg");
    function ok() { msg.textContent = "Copied on this device. Paste it into Claude or Grok yourself."; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        document.getElementById("obPrompt").focus();
        document.getElementById("obPrompt").select();
        msg.textContent = "Select the prompt and copy it. This page cannot open your account.";
      });
    } else {
      document.getElementById("obPrompt").focus();
      document.getElementById("obPrompt").select();
      msg.textContent = "Select the prompt and copy it. This page cannot open your account.";
    }
  });
  document.getElementById("obCheck").addEventListener("click", function () {
    if (state.platform !== "claude" && state.platform !== "grok") {
      document.getElementById("obTask").textContent = "Choose Grok first. That picks the training the check uses.";
      return;
    }
    save();
    done.hidden = true;
    if (window.__SLOT && window.__SLOT.beginDiagnostic) window.__SLOT.beginDiagnostic(profile());
  });
  document.getElementById("obEdit").addEventListener("click", function () {
    returnTo = "summary";
    state.phase = "ask";
    state.i = 0;
    showAsk();
  });
  document.getElementById("obClear").addEventListener("click", function () {
    var btn = document.getElementById("obClear");
    if (!clearArmed) {
      clearArmed = true;
      btn.textContent = "Confirm clear";
      document.getElementById("obCopyMsg").textContent = "This deletes the setup answers stored in this browser. It does not send email.";
      return;
    }
    wipe();
    showAsk();
  });

  load();
  window.SETUP_ONBOARD_PROFILE = state.phase === "summary" ? profile() : null;
  if (state.phase === "summary" && state.A.guide) showSummary();
  else {
    state.phase = "ask";
    if (state.i < 0 || state.i >= ORDER.length) state.i = 0;
    showAsk();
  }
})();
