# Member area setup (for Chris)

Written 2026-10-26 for launch hardening v6, item B. Nothing here has been done by an agent: these steps are
in ThriveCart, which no agent can sign in to. The site side is ready and waits for one link.

## What changed on the site
- `members/` no longer takes unlock codes. Paid agents live in a hosted member area with a login per person.
- `members/members.js` line 5 holds `var MEMBER_LOGIN_URL = "";`. While it is empty, the page says
  "Member area opens at launch. Bought already? Check your welcome email."
- `members/vault.json` (the old encrypted agents) is still in the repo and still public, though encrypted.
  Delete it only after the member area is live and you have checked a paid login works.

## ThriveCart steps (you, signed in to the `wardconsultingai` account)
1. Turn on ThriveCart Learn and make one member area (course) per plan: Starter, Pro, Elite.
2. Put the four paid agents in it: Pro and Elite get all 4; Starter gets the 1 the buyer picks.
3. Link each product to its member area, with access removed on cancel and on a failed payment.
4. Elite: set it up for up to 20 seats (team or quantity), so each person gets their own login.
   These are Grow With AI member logins, not Grok team seats.
5. Prices (Chris, 2026-11-09): Starter $29.99/month, Pro $99.99/month, Elite $249/month.
6. Create a "Grok team seat" add-on product at $35/month, quantity = number of seats (one seat per person).
   Offer it only to Pro and Elite buyers (a bump or upsell on those two checkouts), not on Starter or Free.
   We send each seat's xAI invite by hand, usually within 1 business day, and remove the seat when the plan
   ends or the add-on is cancelled. Terms: `/terms/#team-seat`.
7. Copy the member-area login address and send it to Spider-Man; it goes into `MEMBER_LOGIN_URL`.
8. Set the refund policy to match `/refund/` (7 days on the first payment; seat charges follow the same terms).
9. Test with a real card: buy, log in, refund, cancel, and check access ends.

## Weekly sign-up cap (item H)
`start/capacity.js` has one setting: `mode: "open"` runs the setup flow; `mode: "waitlist"` shows the
waitlist instead. Change the one word, commit, and push to `main`. `nextCohort` is the date shown, for
example "Monday, Nov 2". A static site can't count sign-ups, so `weeklyCap` is a note only: flip `mode`
yourself when the week is full.
