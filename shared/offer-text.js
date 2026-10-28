/* One place for offer wording that must read the same everywhere (refund page, /founding/ guarantee
 * box and FAQ). Any element with data-offer-text="<key>" gets the text below. Each element also holds
 * the same text in the HTML, so the page reads correctly without JavaScript.
 * [CHRIS CONFIRM] W2: pick V1 or V2 for "founding-refund", then set FOUNDING_REFUND_PICK. */
var FOUNDING_REFUND_PICK = "V1"; // "V1" (plan guarantee) or "V2" (keep the standard 7-day policy)
var RENEWAL_PICK = "R1"; // [CHRIS CONFIRM] W3: "R1" (Pro renews) or "R2" (nothing renews)
var OFFER_TEXT = {
  "founding-refund": {
    V1: "Ask for a full refund within 14 days after Module 1 ships. If any module ships more than 7 days late, you can ask for a full refund.",
    V2: "Founding purchases follow our standard policy: a full refund if you ask within 7 days of your first payment."
  },
  "renewal": {
    R1: "After your included Pro months, Pro renews at $[49]/month unless you cancel. We'll email you [30] days before. Cancel anytime by emailing hello@wardconsulting.ai or from your account page; it takes effect at the end of the paid period.",
    R2: "Pro ends after your included months. Nothing renews unless you choose to."
  }
};
(function () {
  "use strict";
  document.querySelectorAll("[data-offer-text]").forEach(function (el) {
    var k = el.getAttribute("data-offer-text"), t = OFFER_TEXT[k];
    if (!t) return;
    // The HTML already holds the default (V1, R1); only swap the text when a different pick is set.
    if (k === "founding-refund" && FOUNDING_REFUND_PICK !== "V1") el.textContent = t[FOUNDING_REFUND_PICK] || t.V1;
    if (k === "renewal" && RENEWAL_PICK !== "R1") el.textContent = t[RENEWAL_PICK] || t.R1;
  });
})();
