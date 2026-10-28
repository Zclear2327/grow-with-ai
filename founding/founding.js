/* Founding countdown. Counts down to ONE fixed date for everyone: no per-visitor timers, no cookies,
 * no localStorage. After FOUNDING_CLOSE the offers are swapped for the waitlist. */
var FOUNDING_CLOSE = "2026-11-22T23:59:00-07:00"; // Sunday Nov 22, 11:59 PM Mountain Time
var BONUS_CLOSE = "2026-11-18T23:59:00-07:00";    // Wednesday Nov 18, 11:59 PM Mountain Time (72-hour bonus)
(function () {
  "use strict";
  var close = new Date(FOUNDING_CLOSE).getTime(), bonus = new Date(BONUS_CLOSE).getTime();
  function fmt(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return d + " days, " + h + " hours, " + m + " minutes";
  }
  function tick() {
    var now = Date.now(), closed = now >= close;
    document.querySelectorAll("[data-founding-open]").forEach(function (e) { e.hidden = closed; });
    document.querySelectorAll("[data-founding-closed]").forEach(function (e) { e.hidden = !closed; });
    var c = document.querySelector("[data-countdown]");
    if (c) c.textContent = closed ? "Founding is closed." : "Founding closes in " + fmt(close - now) + ".";
    var b = document.getElementById("bonus"); if (b) b.hidden = now >= bonus;
    return closed;
  }
  if (!tick()) setInterval(tick, 30000);
})();
