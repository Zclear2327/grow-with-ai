/* Grow With AI members page.
   The free Email & Inbox Agent is public. Paid agents are stored encrypted (AES-GCM, key from PBKDF2-SHA256)
   and only open with that agent's unlock code. Nothing is sent anywhere; codes are kept on this device. */
(function () {
"use strict";
var KEY = "gwai-members-v1";
var AGENTS = [
  { id: "Email-Inbox", name: "Email & Inbox Agent", tag: "Free", job: "Sorts your inbox, flags what needs you today, and drafts replies for you to send.", start: "Say hello, then send a screenshot of your inbox list (or paste the senders and subjects).", free: true },
  { id: "Customer-Questions", name: "Customer Questions Agent", tag: "Pro & Business", job: "Answers the questions customers ask most, from your own information, and hands the tricky ones to you.", start: "It builds your answer sheet with you first (about 15 minutes)." },
  { id: "Sales-Follow-Up", name: "Sales & Follow-Up Agent", tag: "Pro & Business", job: "Keeps track of leads, drafts follow-ups and quotes, and reminds you so nobody slips through.", start: "Each day, say “who do I chase?”" },
  { id: "Daily-Assistant", name: "Daily Assistant", tag: "Pro & Business", job: "Your morning brief: calendar, to-dos, bookings and errands, and an eye on prices or competitors you care about.", start: "Each morning, say “brief me”." },
  { id: "Content-Social", name: "Content & Social Agent", tag: "Pro & Business", job: "Drafts posts, newsletters and short video scripts in your voice for you to approve.", start: "Each week, say “plan my posts”." }
];
var state = load(), vault = null, opened = {}, free = { grok: "", claude: "" };
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { codes: {}, trainer: "Sam", tool: "grok" }; } catch (e) { return { codes: {}, trainer: "Sam", tool: "grok" }; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
function el(t, a, x) { var n = document.createElement(t); if (a) for (var k in a) n.setAttribute(k, a[k]); if (x != null) n.textContent = x; return n; }
function norm(c) { return (c || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

function decrypt(id, code) {
  var v = vault && vault[id]; if (!v || !window.crypto || !crypto.subtle) return Promise.reject(new Error("unsupported"));
  return crypto.subtle.importKey("raw", new TextEncoder().encode(norm(code)), "PBKDF2", false, ["deriveKey"])
    .then(function (base) { return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(v.salt), iterations: v.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]); })
    .then(function (key) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(v.iv) }, key, b64(v.ct)); })
    .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
}

function promptFor(a) {
  var t = a.free ? free[state.tool] : (opened[a.id] || {})[state.tool];
  return t ? t.split("[NAME]").join(state.trainer) : "";
}

function copy(text, pre, btn) {
  var ok = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy this agent"; }, 2000); };
  var fb = function () { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    try { if (document.execCommand("copy")) return ok(); } catch (e) {} btn.textContent = "Selected: press Ctrl+C (Cmd+C on a Mac)"; };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fb); else fb();
}

function render() {
  var host = document.getElementById("agents"); host.innerHTML = "";
  AGENTS.forEach(function (a, i) {
    var isOpen = a.free || !!opened[a.id];
    var card = el("article", { class: "agent" + (isOpen ? " open" : ""), id: "agent-" + a.id, "aria-labelledby": "h-" + a.id });
    var h = el("h2", { id: "h-" + a.id }, (i + 1) + ". " + a.name); h.appendChild(el("span", { class: "tag" }, isOpen ? (a.free ? "Free" : "Unlocked") : a.tag));
    card.appendChild(h); card.appendChild(el("p", null, a.job));
    if (isOpen) {
      var base = promptFor(a), text = base ? base + window.GWAIWalk.walkthrough(state.tool, a) : "";
      if (!text) { card.appendChild(el("p", { class: "msg" }, "Loading…")); host.appendChild(card); return; }
      card.appendChild(el("p", null, a.start));
      var pre = el("pre", { class: "prompt", tabindex: "0", "aria-label": a.name + " text" }, text); card.appendChild(pre);
      var row = el("div", { class: "btns" });
      var cb = el("button", { class: "btn primary", type: "button" }, "Copy this agent"); cb.onclick = function () { copy(text, pre, cb); };
      row.appendChild(cb); card.appendChild(row);
      card.appendChild(window.GWAIWalk.openBlock({ tool: state.tool, agent: a, text: base }));
    } else {
      var f = el("form", { class: "unlock", novalidate: "novalidate" });
      var lab = el("label", { for: "c-" + a.id, class: "sr" }, "Unlock code for " + a.name);
      var inp = el("input", { id: "c-" + a.id, type: "text", autocomplete: "off", autocapitalize: "characters", spellcheck: "false", placeholder: "GWAI-XXXX-XXXX", maxlength: "20" });
      var go = el("button", { class: "btn primary", type: "submit" }, "Unlock");
      var msg = el("p", { class: "msg", role: "status", "aria-live": "polite" });
      f.appendChild(lab); f.appendChild(inp); f.appendChild(go); card.appendChild(f); card.appendChild(msg);
      f.onsubmit = function (e) {
        e.preventDefault(); var c = inp.value; if (!norm(c)) { msg.className = "msg err"; msg.textContent = "Type the code from your welcome email."; inp.focus(); return; }
        go.disabled = true; msg.className = "msg"; msg.textContent = "Checking…";
        decrypt(a.id, c).then(function (data) {
          opened[a.id] = data; state.codes[a.id] = c; save(); render();
          var n = document.getElementById("agent-" + a.id); if (n) { var b = n.querySelector("button"); if (b) b.focus(); }
        }, function (err) {
          go.disabled = false; msg.className = "msg err";
          msg.textContent = err && err.message === "unsupported" ? "This browser can't open agents. Try the latest Chrome, Edge or Safari." : "That code doesn't match this agent. Check it against your welcome email and try again.";
        });
      };
    }
    host.appendChild(card);
  });
  var how = document.getElementById("how"); how.innerHTML = "";
  (state.tool === "grok"
    ? ["Tap “Copy this agent”.", "Open Grok (grok.com or the Grok app) and start a new chat.", "Paste and send. Your trainer says “Hi, I'm here.”", "Use one chat per agent so they don't get mixed up."]
    : ["Tap “Copy this agent”.", "On a computer: in Claude, click Projects, then New project, name it after the agent, and paste into “Set project instructions”. On a phone: paste into a new chat.", "Start a chat in that project and say hello. Your trainer says “Hi, I'm here.”", "One project per agent keeps them separate."]
  ).forEach(function (t) { how.appendChild(el("li", null, t)); });
}

function bindChoices() {
  ["trainer", "tool"].forEach(function (name) {
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (r) {
      r.checked = r.value === state[name];
      r.onchange = function () { state[name] = r.value; save(); render(); };
    });
  });
}

bindChoices(); render();
Promise.all([
  fetch("vault.json").then(function (r) { return r.json(); }),
  fetch("../start/prompts/free-email-grok.txt").then(function (r) { return r.text(); }),
  fetch("../start/prompts/free-email-claude.txt").then(function (r) { return r.text(); })
]).then(function (res) {
  vault = res[0]; free.grok = res[1]; free.claude = res[2]; render();
  // re-open anything this device already unlocked
  Object.keys(state.codes).forEach(function (id) {
    decrypt(id, state.codes[id]).then(function (d) { opened[id] = d; render(); }, function () { delete state.codes[id]; save(); });
  });
}).catch(function () {
  var host = document.getElementById("agents");
  host.insertBefore(el("p", { class: "msg err" }, "Couldn't load your agents. Check your connection and refresh the page."), host.firstChild);
});
})();
