# Leverage pages v7: QA record (2026-10-28)

Checked locally on branch leverage/v7 with Chromium (Playwright) and Lighthouse 12.6.1.

| Check | Result |
|---|---|
| 375 px and 1280 px, no sideways scroll | founding, teams, partners, creators: pass. Screenshots in `docs/qa/v7/` |
| Lighthouse accessibility | founding 100, teams 100, partners 100, creators 100 (after F's eyebrow-contrast fix; 96-97 before) |
| Console errors | none from the pages (the only error was the Google Fonts request, blocked on purpose in the test) |
| Local links and in-page anchors | all return 200 / exist |
| Countdown | counts to the fixed `FOUNDING_CLOSE` only; no cookies or localStorage. With the clock set to 2026-12-01 (test only, not committed) the offers hide and the "Founding is closed" waitlist shows. Bonus box hides after `BONUS_CLOSE`. |
| Buy buttons | all `data-checkout` placeholders, `href="#"`, `aria-disabled="true"`, text "Opens soon". affiliates/ref.js leaves unknown keys alone. |
| Forms (FormSubmit request intercepted; this container cannot reach formsubmit.co, so nothing was sent) | teams with consent unticked: blocked, nothing sent. teams / creators: sent with list, fields, `consent_casl=true` and the CONSENT text. founding with region Quebec, and partners with a Canadian postal code starting H: Quebec message shown, sent as `<list>-quebec-waitlist`, `region=QC`, kept off the marketing list. Test address used: chris+test@z-clear.com. |
| Existing packages waitlist form after the leads.js edit | still sends, list=Packages |

Known follow-ups, not done here:
- The site-wide gold eyebrow colour (affiliates/aff.css) is 4.03:1, under WCAG AA, on every existing page. Fixed only on the new pages in shared/offer.css.
- Footers are per-page, so "Teams" and "Partners" footer links were not added to other pages.

© Ward Consulting AI
