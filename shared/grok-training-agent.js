/* Current Grok training-agent handoff.
   Checked in this repo on 2026-11-05. No publishable Grok bot or template URL
   was found. shared/walkthrough.js opens https://grok.com for every Grok
   "open" button. That is Grok's home page, not our agent. start/flow.js also
   links https://docs.x.ai/grok-bot/get-started and mentions
   cursor.com/download/bot for an optional paid Grok Bot app. Neither is a
   Ward training-agent template, and neither is offered here as one.
   The current training text is start/prompts/free-email-grok.txt
   (Free-Email-Agent-Grok-v2.1.txt, prepared by Trainer Agent, Oct 26, 2026 MT).
   The members page at members/#agent-Email-Inbox loads that same file.
   This file does not create or edit a live agent. */
(function () {
  var FACT = {
    publishableTemplateUrl: null,
    version: "Free-Email-Agent-Grok-v2.1.txt",
    prepared: "Oct 26, 2026 MT",
    preparedBy: "Trainer Agent",
    sourceFile: "start/prompts/free-email-grok.txt",
    membersHash: "members/#agent-Email-Inbox",
    blocker: "No publishable Grok bot or template link for our training agent is in this site.",
    notTheAgent: "grok.com is Grok's home page. It is not our training agent.",
    appNote: "This site has not verified that the Grok phone app can import a Grok Bot template. The route written in our files is to paste the prompt into a new chat yourself.",
    humanGate: "Copying or pasting does not change Grok. It does not send, publish, spend, delete, or change settings or content. The prompt says the assistant must wait for your yes in the chat before any of those. This page never does them."
  };

  function mount(host, root) {
    if (!host) return;
    host.innerHTML = "";
    host.hidden = false;
    var h = document.createElement("p");
    h.className = "part";
    h.textContent = "Training agent";
    var block = document.createElement("p");
    block.className = "do";
    block.textContent = FACT.blocker + " " + FACT.notTheAgent;
    var fall = document.createElement("p");
    fall.className = "tip";
    fall.textContent = "Fallback, not a bot link: copy the current training prompt and paste it into a new Grok chat yourself. " + FACT.appNote;
    var src = document.createElement("p");
    src.className = "tip";
    src.textContent = "Source: " + FACT.sourceFile + " · " + FACT.version + " · Prepared by " + FACT.preparedBy + ", " + FACT.prepared + ". The same file is what the members page copies.";
    var gate = document.createElement("p");
    gate.className = "tip";
    gate.textContent = FACT.humanGate;
    var a = document.createElement("a");
    a.className = "go-link";
    a.href = root + FACT.membersHash;
    a.textContent = "Open the members page that holds this prompt";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn ghost";
    btn.textContent = "Copy the training prompt";
    var msg = document.createElement("p");
    msg.className = "tip";
    msg.setAttribute("role", "status");
    btn.addEventListener("click", function () {
      msg.textContent = "Loading the prompt from this site…";
      fetch(root + FACT.sourceFile).then(function (r) {
        if (!r.ok) throw new Error("status " + r.status);
        return r.text();
      }).then(function (text) {
        if (!/Free-Email-Agent-Grok-v2\.1/.test(text)) throw new Error("unexpected file");
        var write = navigator.clipboard && navigator.clipboard.writeText
          ? navigator.clipboard.writeText(text)
          : Promise.reject(new Error("no clipboard"));
        return write.then(function () {
          msg.textContent = "Copied " + FACT.version + " on this device. Paste it into a new Grok chat only if you want to. Nothing was changed in Grok.";
        });
      }).catch(function () {
        msg.textContent = "Couldn't copy from here. Use the members page link above. The prompt stays there for you to copy. Nothing was changed in Grok.";
      });
    });
    [h, block, fall, src, gate, a, btn, msg].forEach(function (n) { host.appendChild(n); });
  }

  window.GWAIGrokTrainingAgent = { fact: FACT, mount: mount };
})();
