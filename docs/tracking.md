# Tracking links for creators and campaigns

Added 2026-10-26 (launch hardening v6, item E). No analytics scripts are on the site; this is only the
link format and where the codes go.

## The link to give a creator
```
https://zclear2327.github.io/grow-with-ai/?ref=CREATORCODE&utm_source=tiktok&utm_medium=influencer&utm_campaign=launch1
```
Change `CREATORCODE` (letters, digits, - and _ only) and the `utm_` values. `src` works too, for example `&src=podcast`.

## What happens to the codes
- `affiliates/ref.js` saves `ref`, `aff`, `src` and the five `utm_` codes for 90 days in the visitor's browser
  (`gwai-attrib-v1`), keeping the FIRST visit and the LATEST visit separately.
- They are added to links to `/start/` and `/packages/`, so they survive clicking around.
- They are added to the checkout buttons once checkout is live. The ThriveCart affiliate ID still goes in the
  address prefix exactly as before; checkout links and keys are unchanged.
- Both forms send them to HubSpot (or the old inbox until the HubSpot form ID is set) as `ref`, `src`, `utm_source`,
  `utm_medium`, `utm_campaign`, `utm_term` and `utm_content`.

## Pages that read the codes
Home, packages, start, affiliates, the affiliate guide and security load `affiliates/ref.js`. A creator link to any
of those pages works; members, training and the legal pages don't capture codes.
