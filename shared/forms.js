/* Grow With AI enquiry forms (founding, teams, partners, creators). Sends through shared/leads.js.
 * A form opts in with data-lead="<list>". Every named field goes along as an extra field.
 * Consent is a separate, UNCHECKED box (class "consent"); it is never bundled into other terms.
 * Quebec: a region of "QC", or a Canadian postal code starting G, H or J, shows the
 * "not available in Quebec yet" message and sends with region=QC, kept off any marketing list. */
(function () {
  "use strict";
  var START = Date.now();
  var QC_MSG = "Not available in Quebec yet (no French version). Join the waitlist and we'll tell you when it is.";
  function isQuebec(f) {
    var r = f.querySelector("[name=region]"), pc = f.querySelector("[name=postal]"), c = f.querySelector("[name=country]");
    if (r && r.value === "QC") return true;
    var country = c ? c.value : "";
    return !!(pc && country === "Canada" && /^[GHJ]/i.test((pc.value || "").trim()));
  }
  function wireRegion(f) { // show the Quebec note as soon as it is picked, before submit
    var note = f.querySelector(".qc-note"); if (!note) return;
    var upd = function () { note.hidden = !isQuebec(f); };
    f.addEventListener("change", upd); f.addEventListener("input", upd); upd();
  }
  document.querySelectorAll("form[data-lead]").forEach(function (f) {
    var qn = f.querySelector(".qc-note"); if (qn) qn.textContent = QC_MSG;
    wireRegion(f);
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var msg = f.querySelector(".msg"), em = f.querySelector("input[type=email]"), cb = f.querySelector("input.consent"),
          hp = f.querySelector("input[name=_honey]"), btn = f.querySelector("button[type=submit]");
      var v = (em.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = "That email does not look right. Check it and try again."; em.focus(); return; }
      var req = f.querySelectorAll("[required]:not(.consent)");
      for (var i = 0; i < req.length; i++) { if (!String(req[i].value || "").trim()) { msg.textContent = "Please fill in: " + (req[i].getAttribute("data-label") || req[i].name) + "."; req[i].focus(); return; } }
      if (cb && !cb.checked) { msg.textContent = "Tick the box so we are allowed to email you."; cb.focus(); return; }
      if ((hp && hp.value) || (Date.now() - START) / 1000 < 4) { msg.textContent = f.getAttribute("data-thanks") || "Thanks, we have it."; return; }
      var qc = isQuebec(f), extra = {}, list = f.getAttribute("data-lead");
      f.querySelectorAll("[name]").forEach(function (el) {
        if (el.name === "_honey" || el.type === "email" || el.classList.contains("consent")) return;
        if ((el.type === "checkbox" || el.type === "radio") && !el.checked) return;
        extra[el.name] = el.value;
      });
      if (qc) { extra.region = "QC"; }
      btn.disabled = true; msg.textContent = "Sending...";
      window.GWAILead.send({ email: v, firstname: extra.first_name || extra.name || "", list: qc ? list + "-quebec-waitlist" : list,
          interest: extra.interest || extra.tier || "", consent: !!(cb && cb.checked), noMarketing: qc, extra: extra,
          subject: (qc ? "Quebec waitlist: " : "Enquiry: ") + list + " (" + v + ")" })
        .then(function () { msg.textContent = qc ? "Thanks. " + QC_MSG : (f.getAttribute("data-thanks") || "Thanks, we have it."); })
        .catch(function (e) { btn.disabled = false; msg.textContent = "That did not go through (" + e.message + "). Email hello@wardconsulting.ai instead."; });
    });
  });
})();
