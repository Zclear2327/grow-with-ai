/* Grow With AI free setup flow.
   One question per screen. A formal setup voice asks; then the trainer (Sam or Travis) takes over.
   Answers stay in this browser (localStorage) until the visitor chooses to send them.
   Never asks for passwords, codes, card, bank or ID details. */
(function () {
"use strict";
var CFG = { form_endpoint: "https://formsubmit.co/ajax/7fbd7e6f9b9178360b909504bd877f07", min_seconds_before_send: 10, mailchimp_action: (typeof MC_ACTION !== "undefined" && MC_ACTION) || "" /* set in shared/leads.js */ };
var KEY = "wc-intake-v5"; // v5 = guided conversation + setup details (Nov 5 2026); v4 answers no longer fit
var SECTIONS = ["Welcome", "Getting to know you", "Setup details", "Your summary", "Your result"];
var START = Date.now();
var A = {}, step = 0, meta = { backs: {}, hes: 0, reached: {} };
var PROMPT = { grok: text("P_GROK"), claude: text("P_CLAUDE") };
function text(id) { var n = document.getElementById(id); return n ? n.textContent.replace(/^\n/, "") : ""; }

/* ---------- theme (unchanged from v2) ---------- */
try { var t = localStorage.getItem("wc-intake-v1-theme"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
function isDark() { var d = document.documentElement.dataset.theme; return d === "dark" || (!d && matchMedia("(prefers-color-scheme:dark)").matches); }
function paintTheme() { document.getElementById("theme").textContent = isDark() ? "Light" : "Dark"; }
document.getElementById("theme").onclick = function () {
  document.documentElement.dataset.theme = isDark() ? "light" : "dark";
  try { localStorage.setItem("wc-intake-v1-theme", document.documentElement.dataset.theme); } catch (e) {}
  paintTheme();
};
paintTheme();

/* ---------- storage ---------- */
function save() { try { localStorage.setItem(KEY, JSON.stringify({ A: A, step: step, meta: meta })); } catch (e) {} }
function restore() { try { var r = JSON.parse(localStorage.getItem(KEY) || "null"); if (r && r.A) { A = r.A; step = r.step || 0; meta = r.meta || meta; } } catch (e) {} }
function clearAll() { try { localStorage.removeItem(KEY); } catch (e) {} A = {}; step = 0; meta = { backs: {}, hes: 0, reached: {} }; }

/* ---------- questions ---------- */
var EMAIL_OPTS = [
  { v: "gmail", label: "Gmail" },
  { v: "m365", label: "Microsoft 365 / Outlook for work (blue Outlook logo, company address)" },
  { v: "outlookcom", label: "Outlook.com, Hotmail or Live (personal)" },
  { v: "other", label: "Something else" },
  { v: "none", label: "I don't have an email address yet" }
];
/* Guided setup (Chris, Nov 5 2026: "Combine them"). A scripted, one-question-at-a-time conversation with Sam or
   Travis: Chris's 10 questions (n 1-10), then 4 short setup details (d 1-4) that keep the Grok/Claude and
   Grok Bot routing. Every question can be skipped; the summary lets people change any answer.
   This is scripted guidance, not a live AI. The copy box is the free email helper.
   There is no verified training-agent share link, so that agent is not offered here. */
var Q = {
  q6: { sec: 1, n: 1, type: "single", text: "First, who would you like as your guide: Sam or Travis?", help: "Both are AI trainer characters, not real people. You can switch any time.", options: [{ v: "Sam", label: "Sam" }, { v: "Travis", label: "Travis" }, { v: "Sam", label: "Either is fine", id: "either" }] },
  nm: { sec: 1, n: 2, type: "text", optional: true, text: "What should we call you?", help: "Optional. A first name or nickname is plenty.", ph: "For example: Dana" },
  s1: { sec: 1, n: 3, type: "single", text: "What kind of work do you do?", other: "other", ph: "For example: dog grooming", options: [{ v: "home", label: "Home services or trades" }, { v: "shop", label: "Shop or online store" }, { v: "beauty", label: "Beauty or wellness" }, { v: "pro", label: "Professional services" }, { v: "food", label: "Food or events" }, { v: "other", label: "Something else" }] },
  goal: { sec: 1, n: 4, type: "single", text: "What's your first goal with AI?", other: "other", ph: "In a few words", options: [{ v: "inbox", label: "Get my inbox under control" }, { v: "customers", label: "Answer customers faster" }, { v: "sales", label: "Follow up and win more work" }, { v: "admin", label: "Spend less time on paperwork" }, { v: "learn", label: "Just learn what AI can do" }, { v: "other", label: "Something else" }] },
  s4: { sec: 1, n: 5, type: "multi", max: 2, text: "Which repetitive task would you like help with first?", help: "Pick up to 2. These become your 2 free workflows.", options: [{ v: "email", label: "Email" }, { v: "quotes", label: "Quotes and invoices" }, { v: "scheduling", label: "Scheduling" }, { v: "followups", label: "Following up with leads" }, { v: "social", label: "Social posts" }, { v: "books", label: "Bookkeeping" }] },
  q5b: { sec: 1, n: 6, type: "single", text: "How much have you used an AI chat app before?", options: [{ v: "no", label: "Not yet" }, { v: "little", label: "A little" }, { v: "lot", label: "A lot" }] },
  len: { sec: 1, n: 7, type: "single", text: "Do you like answers brief or detailed?", options: [{ v: "brief", label: "Brief: just the key points" }, { v: "detailed", label: "Detailed: walk me through it" }] },
  learn: { sec: 1, n: 8, type: "single", text: "How do you learn a new step best?", options: [{ v: "steps", label: "Step by step" }, { v: "examples", label: "Show me an example" }] },
  q4a: { sec: 1, n: 9, type: "single", text: "What will you use most days?", options: [{ v: "phone", label: "Phone" }, { v: "mac", label: "Mac" }, { v: "windows", label: "Windows computer" }] },
  q4b: { sec: 1, n: 9, type: "single", text: "Which web browser do you use?", options: [{ v: "chrome", label: "Chrome" }, { v: "edge", label: "Edge" }, { v: "safari", label: "Safari" }, { v: "other", label: "Other / not sure" }] },
  talk: { sec: 1, n: 9, type: "single", text: "Would you rather type or talk to it?", options: [{ v: "type", label: "Type" }, { v: "speak", label: "Talk out loud" }, { v: "both", label: "Both" }] },
  win: { sec: 1, n: 10, type: "single", text: "What would a useful first result look like?", other: "other", ph: "In a few words", options: [{ v: "inbox", label: "My inbox sorted" }, { v: "reply", label: "A customer reply drafted" }, { v: "week", label: "My week planned" }, { v: "quote", label: "A quote or invoice drafted" }, { v: "post", label: "A social post drafted" }, { v: "other", label: "Something else" }] },
  q3: { sec: 2, d: 1, type: "single", text: "Where does your work email live?", help: "Not sure? Check the address you send email from. Ending in @gmail.com means Gmail.", options: EMAIL_OPTS },
  s6: { sec: 2, d: 2, type: "multi", text: "What do you run the business on?", help: "Pick all that apply.", options: [{ v: "google", label: "Google (Gmail, Calendar, Sheets)" }, { v: "m365", label: "Microsoft 365" }, { v: "quickbooks", label: "QuickBooks" }, { v: "square", label: "Square or Shopify" }, { v: "crm", label: "A customer list app (CRM)" }, { v: "paper", label: "Paper or a whiteboard" }] },
  s9: { sec: 2, d: 3, type: "multi", all: true, text: "What should AI never do without asking you first?", help: "All are ticked to start. Untick only what you're happy for it to do on its own.", options: [{ v: "send", label: "Send emails or texts" }, { v: "spend", label: "Spend money" }, { v: "prices", label: "Change prices" }, { v: "contact", label: "Contact customers" }, { v: "delete", label: "Delete anything" }, { v: "site", label: "Change my website or settings" }, { v: "connect", label: "Connect my accounts" }] },
  s10: { sec: 2, d: 4, type: "single", text: "How do you want to start?", options: [{ v: "free", label: "Free, no new costs" }, { v: "pay", label: "I'll pay about $20 to $30 a month so the AI can connect to my email and calendar" }, { v: "unsure", label: "Not sure yet" }] }
};
var SURVEY_TOTAL = 10, DETAIL_TOTAL = 4;
function labelOf(id, v) { var o = (Q[id].options || []).filter(function (x) { return x.v === v; })[0]; return o ? o.label : v; }
function labelsOf(id) { return (A[id] || []).map(function (v) { return labelOf(id, v); }); }
function joinAnd(a) { return a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }

/* ---------- no-email branch ---------- */
var GMAIL_STEPS = [
  { t: "Open Google's sign-up page.", link: ["https://accounts.google.com/signup", "Open accounts.google.com/signup"], see: "Google's “Create a Google Account” page" },
  { t: "Type your first and last name. Click Next.", see: "a page asking for your birthday" },
  { t: "Enter your birthday and gender. Click Next.", see: "a page about choosing your Gmail address" },
  { t: "Pick “Create your own Gmail address” and type one you like (for example yourbusinessname@gmail.com). Click Next.", see: "a page asking you to create a password" },
  { t: "Create a strong password you'll remember. Write it somewhere safe, not here. Click Next.", see: "the next page (Google may ask for a phone number)" },
  { t: "Google may ask for a phone number and send a code by text. Type the code on Google's page only.", see: "Google accept the code, or move to the next page" },
  { t: "Add a recovery email or phone if asked (recommended). Review and click “I agree”.", see: "Google finish creating your account" },
  { t: "Open your new Gmail.", link: ["https://mail.google.com", "Open Gmail"], see: "your new Gmail inbox", final: true }
];
var GMAIL_HELP = ["Username taken? Add your town or a number.", "No code arrived? Wait a minute, check the number, and try “Resend”.", "Asked for a phone you don't have? Use Outlook.com instead."];
var OUTLOOK_STEPS = [
  { t: "Open Microsoft's sign-up page.", link: ["https://signup.live.com", "Open signup.live.com"], see: "Microsoft's “Create your Microsoft account” page" },
  { t: "Type the address you want and pick @outlook.com. Click Next.", see: "a page asking you to create a password" },
  { t: "Create your password (only on Microsoft's page). Click Next.", see: "a page asking for your name" },
  { t: "Type your name, country and birthday.", see: "a quick puzzle check" },
  { t: "Complete the puzzle check.", see: "Microsoft finish creating your account" },
  { t: "Open your new Outlook inbox.", link: ["https://outlook.live.com", "Open Outlook.com"], see: "your Outlook inbox", final: true }
];
var OUTLOOK_HELP = ["Address taken? Add your town or a number.", "The puzzle won't load? Refresh the page and try again."];

/* ---------- plan of screens ---------- */
/* Approved routing: Grok is the default (the easy path). Claude (the power path) only on a computer,
   when they will pay for connections AND they run on real tools or already use AI a lot. */
var CONNECT_TOOLS = ["google", "m365", "quickbooks", "square", "crm"];
function usesTools() { return (A.s6 || []).some(function (v) { return CONNECT_TOOLS.indexOf(v) >= 0; }); }
/* Chris, Nov 6: "set people up only on grok for now". Everyone gets the Grok track. The Claude branch
   below stays in the code (unused) so it can come back with one change. */
var GROK_ONLY = true;
// TEAM_SEAT: people get a seat on the Ward Consulting AI Grok Business team instead of their own Grok account
// (Chris, 2026-11-09, "Do it anyway" after being told xAI's Enterprise Terms limit seats to people working on our behalf).
// Set to false to go back to "use your own Grok account".
var TEAM_SEAT = true;
function baseTrack() {
  if (GROK_ONLY) return "grok";
  if (!A.q4a || A.q4a === "phone") return "grok";
  if (A.s10 === "pay" && (usesTools() || A.q5b === "lot")) return "claude";
  return "grok";
}
function whyTrack(tr) {
  if (A.switched && !GROK_ONLY) return "You chose this track yourself.";
  if (isBot(tr)) return "Why Grok Bot: you chose to pay so the AI can connect to your email, and Grok Bot connects to your inbox directly.";
  if (tr === "claude") return "Why Claude: you work on a computer, you're happy to pay for connections, and " + (usesTools() ? "you run the business on tools Claude can connect to." : "you already use AI a lot.");
  if (A.q4a === "phone") return "Why Grok: it's the simplest to start on a phone.";
  if (A.s10 !== "pay") return "Why Grok: it's the simplest free start, on your phone or your computer.";
  return "Why Grok: it's the simplest place to start, and you can add Grok Bot later to connect your inbox.";
}
function track() { var b = baseTrack(); if (GROK_ONLY) return b; return A.switched ? (b === "grok" ? "claude" : "grok") : b; }
/* Chris, Nov 5: "Grok Bot for paid, free Grok for free". On the Grok track, people who said they will pay
   get the Grok Bot app; everyone else stays on free Grok. They can switch to free with one tap. */
function isBot(tr) { return tr === "grok" && A.s10 === "pay" && !A.botOff; }
function trackKey(tr) { return isBot(tr) ? "grokbot" : tr; }
function emailType() { return A.q3 === "none" ? (A.newEmail || "gmail") : A.q3; }
function trainer() { return A.q6 || "Sam"; }

function plan() {
  var P = [{ k: "welcome", sec: 0 }];
  ["q6", "nm", "s1", "goal", "s4", "q5b", "len", "learn", "q4a"].forEach(function (id) { P.push({ k: "ask", id: id }); });
  if (A.q4a && A.q4a !== "phone") P.push({ k: "ask", id: "q4b" });
  P.push({ k: "ask", id: "talk" }, { k: "ask", id: "win" }, { k: "ask", id: "q3" });
  if (A.q3 === "none") {
    P.push({ k: "ne_choice", sec: 2 });
    var steps = A.neKind === "outlookcom" ? OUTLOOK_STEPS : GMAIL_STEPS;
    if (A.neKind) steps.forEach(function (s, i) { P.push({ k: "ne_step", sec: 2, i: i }); });
  }
  P.push({ k: "ask", id: "s6" }, { k: "ask", id: "s9" }, { k: "ask", id: "s10" });
  P.push({ k: "summary", sec: 3 }, { k: "handoff", sec: 3 }, { k: "result", sec: 4 });
  return P;
}
function stepOf(id) { var P = plan(); for (var i = 0; i < P.length; i++) if (P[i].id === id) return i; return -1; }
function secOf(s) { return s.k === "ask" ? Q[s.id].sec : s.sec; }

/* ---------- dom helpers ---------- */
function el(tag, attrs, txt) { var n = document.createElement(tag); if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]); if (txt != null) n.textContent = txt; return n; }
function host() { return document.getElementById("q"); }
// Short videos: Chris (V1-V7, V10), JR on the Grok track (grok-phone-jr, grok-computer-jr, first-win-grok) and the AI trainers Sam and Travis. Never autoplay; captions on by default.
var VIDEO_BASE = "video/";
// Batch 2 teal holograms. Sam/Travis and the JR Grok clips stay on the original filenames.
var TEAL_V3 = { welcome: 1, gmail: 1, "claude-mac": 1, "claude-phone": 1, "claude-windows": 1, "first-win": 1 };
function vidStem(name) { return "gwai-" + name + (TEAL_V3[name] ? "-teal-v3" : ""); }
// JR's clips were tagged with the wrong pixel shape (93:176), so phones squeezed him thin. The -sq copies carry the right tag (Nov 5 2026); the originals stay.
var SQUARE_FIX = { "grok-phone-jr": 1, "grok-computer-jr": 1, "first-win-grok": 1 };
function vid(name, label, cls) {
  var stem = vidStem(name);
  var f = el("figure", { class: "vid" + (cls ? " " + cls : "") });
  var v = el("video", { controls: "", preload: "none", playsinline: "", poster: VIDEO_BASE + stem + ".jpg", "aria-label": label });
  v.appendChild(el("source", { src: VIDEO_BASE + stem + (SQUARE_FIX[name] ? "-sq" : "") + ".mp4", type: "video/mp4" }));
  v.appendChild(el("track", { kind: "captions", srclang: "en", label: "English", src: VIDEO_BASE + stem + ".vtt", default: "" }));
  f.appendChild(v); f.appendChild(el("figcaption", null, label));
  return f;
}
var idleTimer = null;

function waitlistScreen(h) { // CAPACITY.mode === "waitlist" (start/capacity.js)
  var when = (window.CAPACITY && CAPACITY.nextCohort) ? " (" + CAPACITY.nextCohort + ")" : "";
  h.appendChild(el("p", { class: "voice" }, "Setup"));
  h.appendChild(el("h1", null, "This week's setup spots are full."));
  h.appendChild(el("p", null, "Join the waitlist and we'll email you when the next group opens" + when + "."));
  var f = el("form", { novalidate: "novalidate" });
  var l = el("label", { class: "fl", for: "wem" }, "Your email"); var em = el("input", { id: "wem", type: "email", autocomplete: "email", required: "required" });
  var cons = el("label", { class: "opt", style: "margin-top:12px" }); var cb = el("input", { type: "checkbox", id: "wcons" });
  var cl = el("span", { class: "lab" }, (window.GWAILead ? GWAILead.consentText : "Email me when the next group opens.") + " "); cl.appendChild(el("a", { href: "../privacy/" }, "Privacy"));
  cons.appendChild(cb); cons.appendChild(cl);
  var send = el("button", { class: "go", type: "submit", style: "margin-top:18px" }, "Join the waitlist");
  var msg = el("p", { class: "help", role: "status", "aria-live": "polite" }, "");
  [l, em, cons, send, msg].forEach(function (n) { f.appendChild(n); }); h.appendChild(f);
  f.onsubmit = function (ev) {
    ev.preventDefault(); var v = (em.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = "That email doesn't look right. Check it and try again."; em.focus(); return; }
    if (!cb.checked) { msg.textContent = "Tick the box so we're allowed to email you."; cb.focus(); return; }
    send.disabled = true; msg.textContent = "Sending…";
    var lead = { email: v, list: "start-waitlist", consent: true, subject: "Setup waitlist (" + v + ")" };
    window.GWAILead.send(lead)
      .then(function () { msg.textContent = "Thanks, you're on the list. We'll email you when the next group opens."; })
      .catch(function (e) { send.disabled = false; msg.textContent = "That didn't go through (" + e.message + "). Try again in a minute, or: "; msg.appendChild(window.GWAILead.fallbackLink(lead)); });
  };
}

function render() {
  clearTimeout(idleTimer);
  if (window.CAPACITY && CAPACITY.mode === "waitlist" && !/[?&]member=1(&|$)/.test(location.search)) { // members (from /welcome/) skip the waitlist
    var wh = host(); wh.innerHTML = ""; wh.className = "screen"; waitlistScreen(wh); return; }
  var P = plan(); if (step >= P.length) step = P.length - 1; if (step < 0) step = 0;
  var s = P[step], h = host();
  h.innerHTML = ""; h.className = "screen";
  var si = secOf(s), ul = document.getElementById("steps"); ul.innerHTML = "";
  SECTIONS.forEach(function (_, i) { ul.appendChild(el("li", { "data-on": i <= si ? "1" : "0" })); });
  document.getElementById("stepname").textContent = "Section " + (si + 1) + " of " + SECTIONS.length + " · " + SECTIONS[si];
  if (step > 0) { var bt = el("button", { class: "backtop", type: "button", "aria-label": "Go back to the previous screen" }, "← Back"); bt.onclick = back; h.appendChild(bt); }
  ({ welcome: welcome, summary: summary, ask: ask, ne_choice: neChoice, ne_step: neStep, handoff: handoff, reflect: reflect, result: result })[s.k](h, s);
  save();
  var f = h.querySelector("h1"); if (f && render.ready) { f.setAttribute("tabindex", "-1"); f.focus(); }
  render.ready = true;
}
function go(n) { step += n; save(); render(); window.scrollTo(0, 0); }
function next() { go(1); }
function back() {
  var P = plan(), prev = P[step - 1];
  if (prev && prev.k === "ask") meta.backs[prev.id] = (meta.backs[prev.id] || 0) + 1;
  go(-1);
}
function thanks(msg, then) {
  var h = host(); h.innerHTML = "";
  var p = el("p", { class: "flash", role: "status" }, msg || "Thank you."); h.appendChild(p);
  setTimeout(then, msg && msg.length > 12 ? 1200 : 650);
}
function navRow(h, onNext, enabled, label) {
  var row = el("div", { class: "nav" });
  var b = el("button", { class: "go", type: "button" }, label || "Next");
  if (!enabled) b.disabled = true;
  b.onclick = onNext; row.appendChild(b); h.appendChild(row); return b;
}
function hesitance(h, id) {
  var note = el("p", { class: "help hes", role: "status", "aria-live": "polite" });
  h.appendChild(note);
  var show = function () {
    if (note.textContent) return;
    note.textContent = "Sounds like this one's a bit unclear. That's normal. Pick the closest answer; you can change it later.";
    save();
  };
  if ((meta.backs[id] || 0) >= 2) show();
  idleTimer = setTimeout(show, 45000);
}

/* ---------- screens ---------- */
function welcome(h) {
  h.appendChild(vid("welcome", "Video: Chris Ward welcomes you (20 seconds)"));
  h.appendChild(el("p", { class: "voice" }, "Setup"));
  h.appendChild(el("h1", null, "Welcome to Ward Consulting AI."));
  h.appendChild(el("p", null, "First, Sam or Travis asks you 10 quick questions, one at a time, then 4 short setup details. It takes about 2 minutes, and you can skip or change any answer. Your answers set up Grok for you and brief your trainer, so you never get asked twice. Your first win takes about 10 minutes. The setup is free."));
  h.appendChild(el("p", { class: "help" }, "Available in English in the US and Canada, except Quebec for now (no French version yet)."));
  h.appendChild(el("p", { class: "help" }, "This part is a scripted setup, not a live AI. Sam and Travis are AI trainer characters. The copy box at the end is your free email helper, not a separate training agent. We don't have a verified share link to a training agent, so that agent is not available from this page. Never type passwords, codes, card numbers or customer details here. Your answers stay in this browser unless you choose to send them, and you can clear them any time."));
  navRow(h, next, true, "Begin");
}

function ask(h, s) {
  var q = Q[s.id];
  meta.reached[s.id] = 1;
  h.appendChild(el("p", { class: "voice" }, q.n ? "Question " + q.n + " of " + SURVEY_TOTAL + " \u00b7 scripted setup with " + (A.q6 ? trainer() : "Sam or Travis") : q.d ? "Setup detail " + q.d + " of " + DETAIL_TOTAL : "Setup"));
  h.appendChild(el("h1", { id: "qh" }, q.text));
  if (q.help) h.appendChild(el("p", { class: "help" }, q.help));
  if (q.type === "text") {
    var inp = el("input", { type: "text", maxlength: "120", "aria-labelledby": "qh", autocomplete: "off", placeholder: q.ph || "" });
    inp.value = A[s.id] || "";
    h.appendChild(inp);
    var count = el("p", { class: "help count", "aria-live": "polite" }); h.appendChild(count);
    if (q.chips) {
      var chips = el("div", { class: "chips", role: "group", "aria-label": "Suggestions" });
      q.chips.forEach(function (c) {
        var b = el("button", { class: "chipbtn", type: "button" }, c);
        b.onclick = function () { inp.value = c === "Other" ? "" : c; inp.focus(); upd(); };
        chips.appendChild(b);
      });
      h.appendChild(chips);
    }
    var nb;
    var upd = function () { var v = inp.value.trim(); nb.disabled = !v; count.textContent = (120 - inp.value.length) + " characters left"; };
    var submit = function () {
      var v = inp.value.trim().slice(0, 120); if (!v) return;
      A[s.id] = v; delete A[s.id + "_skipped"]; save();
      thanks(s.id === "nm" ? "Nice to meet you, " + v + "." : ack(), next);
    };
    nb = navRow(h, submit, false);
    inp.addEventListener("input", upd);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    upd();
  } else if (q.type === "multi") {
    if (!A[s.id]) A[s.id] = q.all ? q.options.map(function (o) { return o.v; }) : [];
    var mul = el("ul", { class: "opts", role: "list" }), note = el("p", { class: "help", role: "status", "aria-live": "polite" }), mnb;
    var paint = function () { mnb.disabled = !q.all && A[s.id].length === 0; };
    q.options.forEach(function (o) {
      var li = el("li");
      var b = el("button", { class: "opt", type: "button", "aria-pressed": String(A[s.id].indexOf(o.v) >= 0) });
      b.appendChild(el("span", { class: "tick", "aria-hidden": "true" }, "\u2713"));
      b.appendChild(el("span", { class: "lab" }, o.label));
      b.onclick = function () {
        var cur = A[s.id], i = cur.indexOf(o.v);
        if (i >= 0) cur.splice(i, 1);
        else if (q.max && cur.length >= q.max) { note.textContent = "You can pick up to " + q.max + ". Untick one first."; return; }
        else cur.push(o.v);
        note.textContent = ""; b.setAttribute("aria-pressed", String(cur.indexOf(o.v) >= 0)); save(); paint();
      };
      li.appendChild(b); mul.appendChild(li);
    });
    h.appendChild(mul); h.appendChild(note);
    mnb = navRow(h, function () { if (!q.all && !A[s.id].length) return; save(); thanks(ack(), next); }, true);
    paint();
  } else {
    var ul = el("ul", { class: "opts", role: "list" });
    var otherBox = null;
    q.options.forEach(function (o) {
      var li = el("li");
      var b = el("button", { class: "opt", type: "button", "aria-pressed": String(A[s.id] === o.v && (o.id ? A[s.id + "_either"] : !A[s.id + "_either"])) });
      b.appendChild(el("span", { class: "tick", "aria-hidden": "true" }, "\u2713"));
      b.appendChild(el("span", { class: "lab" }, o.label));
      b.onclick = function () {
        var prevEmail = A.q3;
        A[s.id] = o.v; delete A[s.id + "_skipped"];
        if (s.id === "q6") A.q6_either = !!o.id;
        if (s.id === "q3" && prevEmail !== o.v) { delete A.neKind; delete A.newEmail; }
        if (s.id === "q4a" && o.v === "phone") delete A.q4b;
        save();
        if (q.other && o.v === q.other) { showOther(); return; }
        if (q.other) delete A[s.id + "_text"];
        thanks(ack(), next);
      };
      li.appendChild(b); ul.appendChild(li);
    });
    h.appendChild(ul);
    var showOther = function () {
      if (otherBox) { otherBox.querySelector("input").focus(); return; }
      otherBox = el("div", { class: "otherbox" });
      var lab = el("label", { class: "fl", for: s.id + "-other" }, "In a few words:");
      var inp = el("input", { id: s.id + "-other", type: "text", maxlength: "60", autocomplete: "off", placeholder: q.ph || "" });
      inp.value = A[s.id + "_text"] || "";
      otherBox.appendChild(lab); otherBox.appendChild(inp); h.appendChild(otherBox);
      var ob = navRow(otherBox, function () { var v = inp.value.trim().slice(0, 60); if (!v) return; A[s.id + "_text"] = v; save(); thanks(ack(), next); }, !!inp.value.trim());
      inp.addEventListener("input", function () { ob.disabled = !inp.value.trim(); });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ob.click(); });
      inp.focus();
    };
    if (q.other && A[s.id] === q.other) showOther();
  }
  if (s.id === "q6") {
    var pair = el("div", { class: "vidpair" });
    pair.appendChild(vid("meet-sam", "Meet Sam, AI trainer (9 seconds)", "small"));
    pair.appendChild(vid("meet-travis", "Meet Travis, AI trainer (8 seconds)", "small"));
    h.insertBefore(pair, h.querySelector(".voice"));
  }
  // Every question can be skipped; the summary shows it as "skipped" and lets them answer later.
  var sk = el("button", { class: "back skipq", type: "button" }, q.optional ? "Skip" : "Skip this question");
  sk.onclick = function () { A[s.id + "_skipped"] = 1; save(); next(); };
  h.appendChild(sk);
  hesitance(h, s.id);
}
function ack() { var n = (A.nm || "").trim(); return n ? "Thanks, " + n + "." : "Thank you."; }

function neChoice(h) {
  h.appendChild(el("p", { class: "voice" }, "Setup"));
  h.appendChild(el("h1", null, "No problem. Let's make you a free email address first."));
  h.appendChild(el("p", null, "You'll type your own password; we never see it."));
  var ul = el("ul", { class: "opts", role: "list" });
  [["gmail", "Gmail (recommended)"], ["outlookcom", "Outlook.com"]].forEach(function (o) {
    var li = el("li"), b = el("button", { class: "opt", type: "button", "aria-pressed": String(A.neKind === o[0]) });
    b.appendChild(el("span", { class: "tick", "aria-hidden": "true" }, "✓")); b.appendChild(el("span", { class: "lab" }, o[1]));
    b.onclick = function () { A.neKind = o[0]; save(); next(); };
    li.appendChild(b); ul.appendChild(li);
  });
  h.appendChild(ul);
}

function neStep(h, s) {
  var gm = A.neKind !== "outlookcom", list = gm ? GMAIL_STEPS : OUTLOOK_STEPS, st = list[s.i];
  h.appendChild(el("p", { class: "voice" }, (gm ? "Gmail" : "Outlook.com") + " · step " + (s.i + 1) + " of " + list.length));
  h.appendChild(el("h1", null, st.t));
  if (gm && s.i === 0) h.appendChild(vid("gmail", "Video: make a free Gmail, step by step (28 seconds)"));
  if (st.link) { var a = el("a", { class: "go linkbtn", href: st.link[0], target: "_blank", rel: "noopener" }, st.link[1] + " (new tab)"); h.appendChild(a); }
  h.appendChild(el("p", { class: "seeq" }, "Did you see " + st.see + "?"));
  var row = el("div", { class: "nav" });
  var ok = el("button", { class: "go", type: "button" }, st.final ? "Yes!" : "I did it");
  ok.onclick = function () {
    if (st.final) { A.newEmail = gm ? "gmail" : "outlookcom"; save(); thanks("You've got email. That's step one done.", next); }
    else next();
  };
  row.appendChild(ok); h.appendChild(row);
  var d = el("details", { class: "stuck" }); d.appendChild(el("summary", null, "Stuck?"));
  var ul = el("ul"); (gm ? GMAIL_HELP : OUTLOOK_HELP).forEach(function (x) { ul.appendChild(el("li", null, x)); }); d.appendChild(ul);
  d.appendChild(el("p", { class: "help" }, "Still stuck? Tell us what you see at hello@wardconsulting.ai. Never send passwords."));
  h.appendChild(d);
}

function handoff(h) {
  h.classList.add("center");
  var p1 = el("p", { class: "voice", role: "status" }, "Thank you. Your trainer is ready.");
  h.appendChild(p1);
  var wrap = el("div", { class: "warm", hidden: "hidden" });
  var hi = el("h1", { class: "warmh" }, "Hi, I'm here. How are you doing?");
  wrap.appendChild(vid(trainer() === "Travis" ? "meet-travis" : "meet-sam", trainer() + ", your AI trainer, says hi", "small center"));
  wrap.appendChild(el("p", { class: "who" }, trainer()));
  wrap.appendChild(hi);
  var row = el("div", { class: "nav center" }), reply = el("p", { class: "reply", role: "status", "aria-live": "polite" });
  [["Good", "Love that. Let's keep it that way."], ["Busy", "Then let's give you some time back."]].forEach(function (o) {
    var b = el("button", { class: "go", type: "button" }, o[0]);
    b.onclick = function () { reply.textContent = o[1]; row.innerHTML = ""; var c = el("button", { class: "go", type: "button" }, "Continue"); c.onclick = next; row.appendChild(c); c.focus(); };
    row.appendChild(b);
  });
  wrap.appendChild(row); wrap.appendChild(reply); h.appendChild(wrap);
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(function () { wrap.hidden = false; hi.setAttribute("tabindex", "-1"); hi.focus(); }, reduce ? 0 : 1200);
}

var EMAIL_NAME = { gmail: "Gmail", m365: "Microsoft 365 work email", outlookcom: "Outlook.com", other: "your email" };
var DEVICE_NAME = { mac: "a Mac", windows: "a Windows computer", phone: "your phone" };
function lower1(s) { s = (s || "").replace(/[.!\s]+$/, ""); return s.charAt(0).toLowerCase() + s.slice(1); }
function short(s, n) { s = s || ""; return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; }

function bizLabel() { return A.s1 === "other" ? (A.s1_text || "your business") : lower1(labelOf("s1", A.s1)); }
function sizeLabel() { return { "1": "just you", "2-5": "2 to 5 people", "6-20": "6 to 20 people", "21+": "more than 20 people" }[A.s2] || ""; }
function reflect(h) {
  h.appendChild(el("p", { class: "who" }, trainer()));
  var wk = labelsOf("s4").map(lower1);
  h.appendChild(el("h1", null, "So you run " + short(bizLabel(), 60) + (sizeLabel() ? ", " + sizeLabel() : "") + ". " +
    (wk.length ? joinAnd(wk).charAt(0).toUpperCase() + joinAnd(wk).slice(1) + " take" + (wk.length > 1 ? "" : "s") + " up too much of your week. " : "") +
    "You're on " + (EMAIL_NAME[emailType()] || "your email") + " and " + (DEVICE_NAME[A.q4a] || "your computer") + ". Got it."));
  h.appendChild(el("p", null, "Here's the simplest way to get your inbox sorted."));
  navRow(h, next, true, "Show me");
}

/* "About my business": goes at the top of the prompt people copy, so the trainer, the Workflow agent,
   dr eggbot and the CEO agent start from these answers and never re-ask. No customer names, passwords or money. */
function ans(id) { // plain-words answer for the summary and the free email helper
  if (A[id + "_skipped"] && (A[id] == null || (A[id].length === 0))) return "skipped";
  var q = Q[id], v = A[id];
  if (v == null || v === "") return "not answered";
  if (q.type === "multi") return labelsOf(id).join(", ") || "none";
  if (q.type === "text") return v;
  if (q.other && v === q.other) return A[id + "_text"] || "something else";
  if (id === "q3") return EMAIL_NAME[emailType()] || labelOf(id, v);
  return labelOf(id, v);
}
var SUMMARY_ROWS = [["q6", "Guide"], ["nm", "Name"], ["s1", "Work"], ["goal", "First goal"], ["s4", "Tasks to help with first"], ["q5b", "AI experience"], ["len", "Answers"], ["learn", "Learning style"], ["q4a", "Device"], ["q4b", "Browser"], ["talk", "Type or talk"], ["win", "Useful first result"], ["q3", "Work email"], ["s6", "Runs the business on"], ["s9", "Never without asking"], ["s10", "Plan"]];

/* First training task, from their answers (same idea as the Setup Check in play/). Step numbers match
   train/ and train/grok/, which open a step with ?step=N. */
function firstTask() {
  var t = A.s4 || [], w = A.win;
  if (A.q5b === "no") return { n: 9, title: "Say hello", why: "You're new to AI chat, so start with a friendly first conversation." };
  // the first result they asked for wins; their task list breaks ties
  if (w === "reply" || w === "inbox") return { n: 16, title: "Answer a customer email", why: "You want a customer reply or a sorted inbox first." };
  if (w === "week") return { n: 17, title: "Plan your week", why: "You want your week planned first." };
  if (w === "quote") return { n: 13, title: "Try it on a real job", why: "You want a quote or invoice first." };
  if (t.indexOf("email") >= 0 || t.indexOf("followups") >= 0) return { n: 16, title: "Answer a customer email", why: "Email and follow-ups take your time." };
  if (t.indexOf("scheduling") >= 0) return { n: 17, title: "Plan your week", why: "You want help with scheduling." };
  if (t.indexOf("quotes") >= 0 || t.indexOf("books") >= 0) return { n: 13, title: "Try it on a real job", why: "Quotes, invoices and payments are on your list." };
  return { n: 9, title: "Say hello", why: "A good first step for everyone." };
}
function taskHref(tr, n) { return (tr === "claude" ? "../train/" : "../train/grok/") + "?step=" + n; }

function summary(h) {
  var tr = track(), ft = firstTask();
  h.appendChild(el("p", { class: "voice" }, "Your summary"));
  h.appendChild(el("h1", null, (A.nm ? A.nm + ", here's" : "Here's") + " what you told " + trainer() + "."));
  h.appendChild(el("p", { class: "help" }, "Tap Change to fix anything. These answers stay in this browser and go into your free email helper so " + trainer() + " doesn't ask again."));
  var dl = el("ul", { class: "sumlist", role: "list" });
  SUMMARY_ROWS.forEach(function (r) {
    if (r[0] === "q4b" && A.q4a === "phone") return;
    if (r[0] === "nm" && !A.nm) { if (!A.nm_skipped) return; }
    var li = el("li");
    li.appendChild(el("span", { class: "sk" }, r[1]));
    li.appendChild(el("span", { class: "sv" }, ans(r[0])));
    var b = el("button", { class: "back sumedit", type: "button", "aria-label": "Change " + r[1] }, "Change");
    b.onclick = function () { var i = stepOf(r[0]); if (i >= 0) { step = i; save(); render(); window.scrollTo(0, 0); } };
    li.appendChild(b); dl.appendChild(li);
  });
  h.appendChild(dl);
  var box = el("div", { class: "note" });
  box.appendChild(el("p", null, "Your track: " + (isBot(tr) ? "Grok Bot (paid)" : tr === "grok" ? "Grok (free)" : "Claude") + ". " + whyTrack(tr)));
  box.appendChild(el("p", null, "Your first training task: step " + ft.n + ", " + ft.title + ". " + ft.why));
  h.appendChild(box);
  navRow(h, next, true, "Looks right. Continue");
}

function aboutBlock(tr) {
  var lines = [
    "About me (from my setup answers. Use these and don't ask me again):",
    "- Guide: " + trainer() + (A.nm ? "; call me " + A.nm : ""),
    "- My work: " + ans("s1") + "; first goal: " + ans("goal"),
    "- What I want help with first (my 2 free workflows): " + ans("s4"),
    "- AI experience: " + ans("q5b") + "; answers: " + ans("len") + "; I learn best: " + ans("learn"),
    "- Device: " + ans("q4a") + (A.q4b && A.q4a !== "phone" ? " (" + ans("q4b") + ")" : "") + "; I prefer to: " + ans("talk"),
    "- A useful first result for me: " + ans("win"),
    "- Work email: " + ans("q3") + "; I run the business on: " + ans("s6"),
    "- Never do these without my explicit yes first: " + ans("s9"),
    "- Plan: " + ans("s10") + "; Platform: " + (isBot(tr) ? "Grok Bot (paid)" : tr === "grok" ? "Grok (free)" : "Claude"),
    "- My first training task: step " + firstTask().n + ", " + firstTask().title,
    ""
  ];
  return lines.join("\n") + "\n";
}

/* ---------- result ---------- */
var STEPS = {
  grok: {
    phone: [
      ["Open the App Store (iPhone) or Google Play (Android).", "the store open"],
      ["Search “Grok”. Check it's the official app from xAI.", "Grok in the results"],
      ["Tap Get or Install. The app is free.", "the Grok app on your phone"],
      ["Open it and sign in or make a free account. You type your own password and codes.", "the chat box"],
      ["Tap “Copy my email helper” below, paste it into the chat, and send.", "your free email helper say “Hi, I'm here”"],
      ["Send a screenshot of your inbox list when it asks.", "your inbox sorted into groups"]
    ],
    computer: [
      ["Open grok.com in your browser.", "Grok's page", "https://grok.com"],
      ["Sign in or make a free account yourself.", "you're signed in"],
      ["Find the chat box.", "the chat box"],
      ["Tap “Copy my email helper” below, paste it into the chat, and send.", "your free email helper say “Hi, I'm here”"],
      ["Send a screenshot of your inbox list when it asks.", "your inbox sorted into groups"]
    ]
  },
  claude: {
    mac: [
      ["Go to claude.com/download and click Mac.", "a file downloading", "https://claude.com/download"],
      ["Open the downloaded file and drag Claude into Applications.", "Claude in Applications"],
      ["Open Claude from Applications. If your Mac warns you, click Open.", "Claude's sign-in screen"],
      ["Sign up or sign in yourself; the code comes by email.", "“How can I help”"],
      ["Click Projects, then New project, and name it “Inbox”.", "your Inbox project"],
      ["Paste your email helper (copy it below) into “Set project instructions”.", "the instructions saved"],
      ["Start a chat in the project.", "your free email helper say “Hi, I'm here”"]
    ],
    windows: [
      ["Go to claude.com/download and click Windows.", "a file downloading", "https://claude.com/download"],
      ["Open the downloaded installer.", "Claude installing"],
      ["Open Claude from the Start menu.", "Claude's sign-in screen"],
      ["Sign up or sign in yourself; the code comes by email.", "“How can I help”"],
      ["Click Projects, then New project, and name it “Inbox”.", "your Inbox project"],
      ["Paste your email helper (copy it below) into “Set project instructions”.", "the instructions saved"],
      ["Start a chat in the project.", "your free email helper say “Hi, I'm here”"]
    ],
    phone: [
      ["Open the App Store or Google Play and search “Claude” (by Anthropic).", "Claude by Anthropic"],
      ["Install it, open it, and sign in yourself.", "the chat box"],
      ["Paste your email helper (copy it below) into a new chat and send. Projects and Claude in Chrome work best on a computer.", "your free email helper say “Hi, I'm here”"]
    ]
  }
};
// Team seat: replaces the "make your own account" steps (TEAM_SEAT above).
var SEAT_STEPS = {
  phone: [
    ["Ask for your team seat in the box above. We send the invite by hand, usually within 1 business day.", "“Request sent” in the box above"],
    ["Open the invite email from xAI on your phone and tap the button to join the Ward Consulting AI team.", "a page saying you joined the team"],
    ["Open the App Store (iPhone) or Google Play (Android), search “Grok”, check it's the official app from xAI, and install it. It's free.", "the Grok app on your phone"],
    ["Open the app and sign in with the same email the invite went to. You type your own codes.", "the chat box, with the team's name in your account"],
    ["Tap “Copy my email helper” below, paste it into the chat, and send.", "your free email helper say “Hi, I'm here”"],
    ["Send a screenshot of your inbox list when it asks.", "your inbox sorted into groups"]
  ],
  computer: [
    ["Ask for your team seat in the box above. We send the invite by hand, usually within 1 business day.", "“Request sent” in the box above"],
    ["Open the invite email from xAI and click the button to join the Ward Consulting AI team.", "a page saying you joined the team"],
    ["Open grok.com and sign in with the same email the invite went to. You type your own codes.", "the chat box, with the team's name in your account", "https://grok.com"],
    ["Tap “Copy my email helper” below, paste it into the chat, and send.", "your free email helper say “Hi, I'm here”"],
    ["Send a screenshot of your inbox list when it asks.", "your inbox sorted into groups"]
  ]
};
if (TEAM_SEAT) STEPS.grok = SEAT_STEPS;

function seatBox(h) { // the seat request: one email, sent to us so we can invite it from the xAI console
  var box = el("div", { class: "note cost" });
  var bh = el("p"); bh.appendChild(el("strong", null, "Step 1: get your seat on our Grok team")); box.appendChild(bh);
  box.appendChild(el("p", { class: "help", style: "margin:0 0 10px" }, "Type the email you want to use with Grok. We send an invite to it from xAI. Use your work email if you have one."));
  var f = el("form", { novalidate: "novalidate" });
  var l = el("label", { class: "fl", for: "seatem" }, "Email for your Grok seat"); var em = el("input", { id: "seatem", type: "email", autocomplete: "email", required: "required" });
  if (A.seatEmail) em.value = A.seatEmail;
  var cons = el("label", { class: "opt", style: "margin-top:12px" }); var cb = el("input", { type: "checkbox", id: "seatok" });
  var cl = el("span", { class: "lab" }, "Add me to the Ward Consulting AI Grok team. I understand Ward Consulting AI runs the team and can remove my seat. ");
  cl.appendChild(el("a", { href: "../security/#team-seat" }, "How the team seat works"));
  cons.appendChild(cb); cons.appendChild(cl);
  var send = el("button", { class: "go", type: "submit", style: "margin-top:14px" }, A.seatSent ? "Send it again" : "Request my seat");
  var msg = el("p", { class: "help", role: "status", "aria-live": "polite" }, A.seatSent ? "Request sent for " + A.seatEmail + ". Watch for an email from xAI." : "");
  [l, em, cons, send, msg].forEach(function (n) { f.appendChild(n); }); box.appendChild(f);
  f.onsubmit = function (ev) {
    ev.preventDefault(); var v = (em.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = "That email doesn't look right. Check it and try again."; em.focus(); return; }
    if (!cb.checked) { msg.textContent = "Tick the box so we can add you to the team."; cb.focus(); return; }
    send.disabled = true; msg.textContent = "Sending…";
    // not a marketing sign-up: the box covers the team seat only, so it stays off Mailchimp
    var lead = { email: v, firstname: A.nm || "", list: "grok-team-seat", consent: false, noMarketing: true, extra: { seat_ok: "yes", trainer: trainer(), device: A.q4a || "" }, subject: "Grok team seat request (" + v + ")" };
    window.GWAILead.send(lead)
      .then(function () { A.seatEmail = v; A.seatSent = true; save(); send.disabled = false; msg.textContent = "Request sent for " + v + ". Watch for an email from xAI, usually within 1 business day. Then tap “I did it” on step 1 below."; })
      .catch(function (e) { send.disabled = false; msg.textContent = "That didn't go through (" + e.message + "). Try again in a minute, or: "; msg.appendChild(window.GWAILead.fallbackLink(lead)); });
  };
  h.appendChild(box);
}

STEPS.grokbot = {
  computer: [
    ["Open the official Grok Bot download page and download the app for your Mac or Windows computer.", "the app downloading", "https://cursor.com/download/bot"],
    ["Open the app and sign in with your X account. You type your own password and codes.", "you're signed in"],
    ["If it asks for a plan, pick one that includes Grok Bot (X Premium, about $30 a month, paid to X). Skip this if you already have it.", "the Grok Bot home screen"],
    ["Start a new chat. Tap “Copy my email helper” below, paste it in, and send.", "your free email helper say “Hi, I'm here”"],
    ["When your free email helper asks, connect your Gmail or Outlook in the app and click Allow.", "your inbox sorted into groups"]
  ],
  phone: [
    ["On your phone, open the official Grok Bot download page and get the app for iPhone or Android.", "the app installing", "https://cursor.com/download/bot"],
    ["Open the app and sign in with your X account. You type your own password and codes.", "you're signed in"],
    ["If it asks for a plan, pick one that includes Grok Bot (X Premium, about $30 a month, paid to X). Skip this if you already have it.", "the Grok Bot home screen"],
    ["Start a new chat. Tap “Copy my email helper” below, paste it in, and send.", "your free email helper say “Hi, I'm here”"],
    ["When your free email helper asks, connect your Gmail or Outlook in the app and tap Allow.", "your inbox sorted into groups"]
  ]
};
var COST = {
  grokbot: "Our setup is free. Grok Bot is paid: it needs X Premium, about $30 a month, paid to X (the $8 Plus plan doesn't include it). It connects to your inbox directly, so there are no screenshots to send. Rather start free? Tap \u201cStart free with Grok instead\u201d.",
  grok: TEAM_SEAT ? "Our setup is free, and so is your Grok seat for now: we add you to the Ward Consulting AI Grok team, so you don't need your own Grok plan. Send a screenshot of your inbox and get your first sorted list. Optional upgrade: Grok Bot can connect to your inbox directly. It needs X Premium, about $30 a month, paid to X (the $8 Plus plan doesn't include it)." : "Our setup is free, and Grok has a free plan. Start at grok.com or in the free Grok app: send a screenshot of your inbox and get your first sorted list. Optional upgrade: Grok Bot can connect to your inbox directly. It needs X Premium, about $30 a month, paid to X (the $8 Plus plan doesn't include it).",
  claude: "Our setup is free, and Claude has a free plan. On Free, you can send a screenshot of your inbox, or connect Gmail or a Microsoft 365 work account (your admin may need to approve Microsoft 365 once). For Claude in Chrome, which can do the clicks you approve, you need Claude Pro, about $20 a month ($17 billed yearly), paid to Anthropic. Optional."
};
var UPGRADE = {
  grok: "Optional, about $30 a month paid to X (X Premium; the $8 Plus plan doesn't include it). Get Grok Bot: download the desktop app for Mac or Windows from cursor.com/download/bot (or get the phone app), sign in, choose a plan that includes Grok Bot yourself, then connect Gmail or Outlook and click Allow.",
  claude: "Gmail connector (any plan): + \u2192 Connectors \u2192 Gmail \u2192 Connect \u2192 Allow. Claude asks before it sends anything; keep it that way. Microsoft 365: + \u2192 Connectors \u2192 Microsoft 365 (your admin may need to approve). Claude in Chrome (Pro or higher): Chrome Web Store \u2192 Claude by Anthropic \u2192 Add to Chrome \u2192 pin it \u2192 \u201cAsk before acting\u201d."
};

function deviceKey(tr, dev) {
  if (tr === "grok") return dev === "phone" ? "phone" : "computer";
  return dev || "windows";
}

// Counts a finished setup once per browser: a GoatCounter event (when on) and a short note to the form inbox.
// No email, name or answers are sent; only the track, device, trainer and site.
function logFinish(tr, site) {
  if (meta.finishLogged) return;
  meta.finishLogged = Date.now(); save();
  if (window.wcCount) window.wcCount("setup-finished");
  try {
    var b = new FormData();
    b.append("list", "setup-finished"); b.append("track", tr); b.append("device", A.q4a || ""); b.append("trainer", trainer());
    b.append("site", site); b.append("page_url", location.href);
    b.append("_subject", "Setup finished (" + site + ", " + tr + ", " + (A.q4a || "device not given") + ")");
    b.append("_template", "table"); b.append("_honey", "");
    fetch(CFG.form_endpoint, { method: "POST", body: b, headers: { Accept: "application/json" } }).catch(function () {});
  } catch (e) {}
}

function result(h) {
  var tr = track(), name = trainer(), dev = A.viewDevice || A.q4a || "windows";
  // device tabs and the video come first; the steps and details sit under the video (Chris, Nov 5)
  var keys = tr === "grok" ? [["phone", "Phone"], ["computer", "Mac or Windows"]] : [["mac", "Mac"], ["windows", "Windows"], ["phone", "Phone"]];
  var cur = deviceKey(tr, dev === "computer" ? "mac" : dev);
  if (tr === "grok" && dev !== "phone") cur = "computer";
  var tabs = el("div", { class: "tabs", role: "tablist", "aria-label": "Steps for your device" });
  keys.forEach(function (k) {
    var b = el("button", { class: "tab", type: "button", role: "tab", "aria-selected": String(k[0] === cur) }, k[1]);
    b.onclick = function () { A.viewDevice = k[0]; delete A.done; save(); render(); };
    tabs.appendChild(b);
  });
  h.appendChild(tabs);
  var tk = trackKey(tr);
  var DV = { grokbot: {}, grok: { phone: ["grok-phone-jr", "Grok on your phone, with JR (31 seconds)"], computer: ["grok-computer-jr", "Grok on a computer, with JR (22 seconds)"] },
    claude: { mac: ["claude-mac", "Claude on a Mac (26 seconds)"], windows: ["claude-windows", "Claude on Windows (22 seconds)"], phone: ["claude-phone", "Claude on your phone (16 seconds)"] } }[tk][cur];
  if (DV) h.appendChild(vid(DV[0], "Video: " + DV[1]));
  // Grok clips: JR, free grok.com path (2026-10-30). Chris's older Grok Bot clips (grok-phone, grok-computer) stay unused.
  else if (tk === "grokbot") h.appendChild(el("p", { class: "help" }, "Grok Bot video coming soon. The steps are below."));
  else if (tr === "grok") h.appendChild(el("p", { class: "help" }, "Video coming soon."));
  h.appendChild(el("p", { class: "who" }, "Your trainer: " + name + " · Your track: " + (tk === "grokbot" ? "Grok Bot (paid)" : tr === "grok" ? "Grok, the easy path" : "Claude, the power path")));
  h.appendChild(el("h1", null, "Let's get your inbox sorted."));
  h.appendChild(el("p", { class: "help why" }, whyTrack(tr)));
  if (meta.finished !== tr) { meta.finished = tr; save(); }
  logFinish(tr, "growwithai");
  var sw = el("button", { class: "back", type: "button" }, "Prefer " + (tr === "grok" ? "Claude, the power path" : "Grok, the easy path") + "? Switch");
  sw.onclick = function () { A.switched = !A.switched; delete A.done; save(); render(); };
  if (!GROK_ONLY) h.appendChild(sw);
  if (tr === "grok" && A.s10 === "pay") {
    var bt = el("button", { class: "back", type: "button" }, A.botOff ? "Use Grok Bot (paid) instead" : "Start free with Grok instead");
    bt.onclick = function () { A.botOff = !A.botOff; delete A.done; save(); render(); };
    h.appendChild(bt);
  }

  var cost = el("div", { class: "note cost" });
  cost.appendChild(el("p", null, COST[tk]));
  cost.appendChild(el("p", { class: "help", style: "margin:0" }, "Prices as of October 2026. Check x.ai/pricing."));
  h.appendChild(cost);
  if (TEAM_SEAT && tk === "grok") seatBox(h);

  var list = STEPS[tk][cur], done = A.done || 0;
  var ol = el("ol", { class: "isteps" });
  list.forEach(function (s, i) {
    var li = el("li", { class: i < done ? "ok" : i === done ? "now" : "later" });
    li.appendChild(el("p", { class: "st" }, s[0]));
    if (i === done) {
      if (s[2]) { li.appendChild(el("a", { class: "linkbtn go", href: s[2], target: "_blank", rel: "noopener" }, "Open " + s[2].replace(/^https:\/\//, "") + " (new tab)")); }
      li.appendChild(el("p", { class: "seeq" }, "Did you see " + s[1] + "?"));
      var b = el("button", { class: "go", type: "button" }, "I did it");
      b.onclick = function () { A.done = done + 1; save(); render(); var n = host().querySelector(".isteps .now .go:last-of-type,.isteps .now button"); if (n) n.focus(); };
      li.appendChild(b);
    } else if (i > done) { li.setAttribute("aria-disabled", "true"); }
    ol.appendChild(li);
  });
  h.appendChild(ol);
  if (tk === "grok" && cur === "computer") h.appendChild(el("p", { class: "help" }, "Grok doesn't need a desktop app; it runs in your browser at grok.com."));
  if (TEAM_SEAT && tk === "grok") h.appendChild(el("p", { class: "help" }, "No invite after 1 business day? Check spam for an email from xAI, then email hello@wardconsulting.ai with the address you used."));
  if (done >= list.length) h.appendChild(el("p", { class: "flash small", role: "status" }, "Nice work. Your free email helper is set up."));

  var up = el("details", { class: "stuck" });
  up.appendChild(el("summary", null, tr === "grok" ? "Optional upgrade: Grok Bot connects to your inbox (paid)" : "Optional: Claude Pro extras (paid)"));
  up.appendChild(el("p", null, UPGRADE[tr]));
  if (tr === "grok") up.appendChild(el("a", { href: "https://docs.x.ai/grok-bot/get-started", target: "_blank", rel: "noopener" }, "xAI's Grok Bot guide (new tab)"));
  if (tk !== "grokbot") h.appendChild(up); // Grok Bot users already have the upgrade

  // copy box
  var ft = firstTask();
  var nextBox = el("div", { class: "note nextbox" });
  nextBox.appendChild(el("p", null, "Your first training task: step " + ft.n + ", " + ft.title + "."));
  nextBox.appendChild(el("a", { class: "linkbtn go", href: taskHref(tr, ft.n) }, "Open step " + ft.n + " of the " + (tr === "claude" ? "Claude" : "Grok") + " training"));
  h.appendChild(nextBox);
  h.appendChild(el("h2", null, "Your free email helper (copy and paste)"));
  h.appendChild(el("p", { class: "help" }, "This box is the free email helper, not the training agent. We don't have a verified share link to the training agent, so that agent is not available from this page. Grok and Grok Bot are different apps; use the one your steps above are for."));
  h.appendChild(tr === "grok" ? vid("first-win-grok", "Video: your first win, with JR (21 seconds)") : vid("first-win", "Video: your first win (23 seconds)"));
  h.appendChild(el("p", { class: "help" }, "Copy this and paste it into " + (tk === "grokbot" ? "a new chat in your Grok Bot app." : tr === "grok" ? "a new Grok chat." : "your Claude project instructions, or a new Claude chat.")));
  var AG = { id: "Email-Inbox", name: "Email & Inbox Agent" };
  var txt = aboutBlock(tr) + PROMPT[tr].split("[NAME]").join(name) + window.GWAIWalk.walkthrough(tr, AG);
  var pre = el("pre", { class: "copybox", tabindex: "0", "aria-label": "Your free email helper text" }, txt);
  h.appendChild(pre);
  var row = el("div", { class: "nav" });
  var cb = el("button", { class: "go", type: "button" }, "Copy my email helper");
  cb.onclick = function () { copy(txt, pre, cb); };
  row.appendChild(cb);
  h.appendChild(row);
  h.appendChild(window.GWAIWalk.openBlock({ tool: tr, agent: AG, text: aboutBlock(tr) + PROMPT[tr].split("[NAME]").join(name), label: tr === "claude" && cur !== "phone" ? "Copy prompt and open Claude in your browser (or use the desktop app you installed)" : null }));

  h.appendChild(el("p", { class: "help" }, "Stuck? Email hello@wardconsulting.ai and tell us what you see on screen. Please don't email us passwords or inbox screenshots."));
  h.appendChild(el("h2", null, "Your 6 AI agents"));
  h.appendChild(el("p", { class: "help" }, "Your Email & Inbox Agent and Workflow Agent are free. Starter adds 1 paid agent of your choice. Pro and Elite include all 4 paid agents."));
  var five = el("ol", { class: "rows" });
  [["Email & Inbox Agent", "Free: yours now"], ["Workflow Agent", "Free: copy it on the members page"], ["Customer Questions Agent", "Starter, Pro & Elite"], ["Sales & Follow-Up Agent", "Starter, Pro & Elite"], ["Daily Assistant", "Starter, Pro & Elite"], ["Content & Social Agent", "Starter, Pro & Elite"]].forEach(function (a, i) {
    var li = el("li"); li.appendChild(el("span", { class: "num" }, String(i + 1)));
    var d = el("div"); d.appendChild(el("h3", null, a[0])); d.appendChild(el("p", { class: "because" }, a[1]));
    if (i === 1) { d.appendChild(el("a", { href: "../members/#agent-Workflow", class: "unlocklink" }, "Copy your free Workflow Agent")); }
    else if (i > 1) { var u = el("a", { href: "../members/", class: "unlocklink" }, "Members: unlock and copy it"); d.appendChild(u); }
    li.appendChild(d); five.appendChild(li);
  });
  h.appendChild(five);
  var nx = el("p", null, "Want more agents working for you? ");
  var pk = el("a", { href: "../packages/" }, "See the packages"); nx.appendChild(pk); nx.appendChild(document.createTextNode("."));
  h.appendChild(nx);

  capture(h, tr);

  var nav = el("div", { class: "nav" });
  var rs = el("button", { class: "back", type: "button" }, "Start over");
  rs.onclick = function () { if (!confirm("Clear your answers from this browser and start again?")) return; clearAll(); render(); };
  rs.textContent = "Clear my answers and start over";
  var chk = el("a", { class: "linkbtn", href: "../play/?mode=setup&phase=check&tool=" + (tr === "claude" ? "claude" : "grok") }, "Something not working? Run the Setup Check");
  nav.appendChild(chk);
  nav.appendChild(rs); h.appendChild(nav);
}

function copy(txt, pre, btn) {
  var ok = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy my email helper"; }, 2000); };
  var fallback = function () { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    try { if (document.execCommand("copy")) { ok(); return; } } catch (e) {} btn.textContent = "Selected: press Ctrl+C (Cmd+C on a Mac)"; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback();
}

function capture(h, tr) {
  h.appendChild(el("h2", null, "Want the steps by email and a check-in in a week?"));
  var f = el("form", { novalidate: "novalidate" });
  var l1 = el("label", { class: "fl", for: "fn" }, "First name (optional)"); var fn = el("input", { id: "fn", type: "text", maxlength: "40", autocomplete: "given-name" });
  var l2 = el("label", { class: "fl", for: "em", style: "margin-top:12px" }, "Your email"); var em = el("input", { id: "em", type: "email", autocomplete: "email", required: "required" });
  var emNote = el("p", { class: "help", id: "em-note" }, "We use your email only to send your setup and updates. Unsubscribe anytime. "); emNote.appendChild(el("a", { href: "../privacy/" }, "Privacy")); em.setAttribute("aria-describedby", "em-note");
  var hp = el("input", { type: "text", name: "_honey", tabindex: "-1", "aria-hidden": "true", autocomplete: "off", style: "position:absolute;left:-9999px;width:1px;height:1px;opacity:0" });
  var cons = el("label", { class: "opt", style: "margin-top:12px" }); var cb = el("input", { type: "checkbox", id: "cons" });
  cons.appendChild(cb); var cl = el("span", { class: "lab" }, window.GWAILead ? GWAILead.consentText + " " : "Email me the steps and one check-in a week from now. "); cl.appendChild(el("a", { href: "../privacy/" }, "Privacy")); cons.appendChild(cl);
  var msg = el("p", { class: "help", role: "status", "aria-live": "polite" }, "");
  var send = el("button", { class: "go", type: "submit", style: "margin-top:18px" }, "Send me the steps");
  [l1, fn, l2, em, emNote, hp, cons, send, msg].forEach(function (n) { f.appendChild(n); });
  h.appendChild(f);
  h.appendChild(el("p", { class: "help" }, "We'll send: your first name, email, track, trainer, device, email type and the 2 things that take your week. Nothing else. We don't sell or share your address."));
  f.onsubmit = function (ev) {
    ev.preventDefault();
    var v = (em.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = "That email doesn't look right. Check it and try again."; em.focus(); return; }
    if (!cb.checked) { msg.textContent = "Tick the box so we're allowed to email you."; cb.focus(); return; }
    if (hp.value || (Date.now() - START) / 1000 < CFG.min_seconds_before_send) { msg.textContent = "Sent."; return; }
    send.disabled = true; msg.textContent = "Sending…";
    var intake = "track: " + trackKey(tr) + "; trainer: " + trainer() + "; device: " + (A.q4a || "") + "; email type: " + (emailType() || "") + "; time sinks: " + labelsOf("s4").join(", ");
    var lead = { email: v, firstname: (fn.value || "").trim().slice(0, 40), list: "free-setup", gwai_intake: intake, consent: cb.checked, subject: "Free setup: " + tr + " (" + v + ")" };
    window.GWAILead.send(lead)
      .then(function () { msg.textContent = "Sent. Check your inbox for the steps."; })
      .catch(function (e) { send.disabled = false; msg.textContent = "That didn't go through (" + e.message + "). Your answers are still here. Try again in a minute, or: "; msg.appendChild(window.GWAILead.fallbackLink(lead)); });
  };
}

restore();
render();
window.__flow = { plan: plan, track: track, state: function () { return { A: A, step: step, meta: meta }; } };
})();
