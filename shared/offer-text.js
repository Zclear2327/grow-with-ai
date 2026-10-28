/* One place for offer wording that must read the same everywhere (refund page, /founding/ guarantee
 * box and FAQ). Any element with data-offer-text="<key>" gets the text below. Each element also holds
 * the same text in the HTML, so the page reads correctly without JavaScript.
 * Chris picked V2 (refund) and R1 (renewal) on 2026-10-28. */
var FOUNDING_REFUND_PICK = "V2"; // "V1" (plan guarantee) or "V2" (keep the standard 7-day policy)
var RENEWAL_PICK = "R1"; // "R1" (Pro renews) or "R2" (nothing renews); Chris picked R1, 2026-10-28
var OFFER_TEXT = {
  "founding-refund": {
    V1: "Ask for a full refund within 14 days after Module 1 ships. If any module ships more than 7 days late, you can ask for a full refund.",
    V2: "Founding purchases follow our standard policy: a full refund if you ask within 7 days of your first payment."
  },
  "renewal": {
    R1: "After your included Pro months, Pro renews at $49/month unless you cancel. We'll email you 30 days before. Cancel anytime by emailing hello@wardconsulting.ai or from the billing link in your receipt email; it takes effect at the end of the paid period.",
    R2: "Pro ends after your included months. Nothing renews unless you choose to."
  }
};
(function () {
  "use strict";
  document.querySelectorAll("[data-offer-text]").forEach(function (el) {
    var k = el.getAttribute("data-offer-text"), t = OFFER_TEXT[k];
    if (!t) return;
    // The HTML holds the picked text (V2, R1, Chris 2026-10-28); JS only swaps it if a pick changes.
    if (k === "founding-refund" && FOUNDING_REFUND_PICK !== "V2") el.textContent = t[FOUNDING_REFUND_PICK] || t.V1;
    if (k === "renewal" && RENEWAL_PICK !== "R1") el.textContent = t[RENEWAL_PICK] || t.R1;
  });
})();
