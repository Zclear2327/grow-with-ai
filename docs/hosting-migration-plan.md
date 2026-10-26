# Hosting migration plan (PLAN ONLY: nothing here has been done)

Written 2026-10-26 for launch hardening v6, item G. **Needs Chris's "go" before any step.** No account was
created, no DNS was changed and no file was moved.

## Why move
- GitHub's own terms say Pages is not meant to run an online business or e-commerce site
  (GitHub Terms for Additional Products and Features), and Pages has a soft limit of 100 GB of bandwidth a month,
  a 1 GB published-site limit and 10 builds an hour (GitHub Pages limits page). Selling memberships from it is
  against the first; a launch with video could hit the second.
- Measured 2026-10-26: about 61 MB of video in the site's files (`media/` 44 MB, `start/video/` 20 MB), and
  138 MB of git history. Every video view is served from Pages.

## Target
- **Recommended: Cloudflare Pages** for the site (free tier, custom domain, HTTPS). Netlify is the alternative.
  Check the current free-tier limits on the provider's own pricing page before choosing; this plan does not
  vouch for them.
- **Videos on a video host** (Cloudflare Stream, Bunny Stream or Vimeo), with each `<video>` source swapped for
  that host's player or file URL.
- **Not in scope, ever: `z-clear.com`.** Fleet rule: z-clear.com never moves to Cloudflare. This plan covers only
  the Grow With AI site and its own domain.

## Steps (after "go")
1. Chris creates the hosting account and the video-host account, and picks the domain.
2. Connect the repo `Zclear2327/grow-with-ai`: build command none, output folder `/`.
3. Test the preview address: every page, the setup flow, members, forms, checkout buttons (test mode).
4. Upload the videos to the video host; swap the sources; re-test playback and captions.
5. Add the custom domain and DNS records; wait for HTTPS.
6. Redirect `zclear2327.github.io/grow-with-ai/*` to the new domain (a redirect page per path on Pages, since
   Pages has no server-side 301), then update canonical tags, `sitemap.xml`, ThriveCart return URLs, the HubSpot
   form's allowed domain and every link in emails.
7. Watch a week of traffic and leads, then turn off Pages for the repo.

## Rollback
Pages stays on until step 7, so going back is pointing DNS back and removing the redirect pages. Keep the
`backup/pre-hardening-v6-2026-10-26` branch.

## What Chris must provide
Hosting account, video-host account, the domain and DNS access, and the "go".
