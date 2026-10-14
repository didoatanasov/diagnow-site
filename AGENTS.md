# AGENTS.md — diagnow.ai website

Context for AI agents working in this repository (the diagnow.ai marketing site).

## The business

**diagnow.ai** is an early-stage Bulgarian health-tech startup building an **AI copilot for remote follow-up of chronic patients**, starting with **high blood pressure and type 2 diabetes**. Home devices send readings; AI prepares summaries and guideline-based suggestions; the patient's **GP decides and signs**; a **pharmacist** reviews medication, follows adherence and delivers. Pre-launch: preparing a first pilot and a pre-seed round. Founders: an engineer (CEO/CTO), a GP and a pharmacist.

Audiences of the site: patients and families (waitlist), insurers and employers (programmes), GPs and pharmacies (pilot partners), investors.

Motto: **"Грижа между прегледите." / "Care between visits."**

## Rules for all copy (non-negotiable)

- Never claim or imply that AI replaces the doctor; the GP always decides. AI never prescribes.
- Not an emergency service: always point urgent cases to **112**.
- No promises of medical outcomes, no invented numbers, users or partners. Be honest that we are pre-launch.
- Every fact or statistic needs a source (the 29.7% hypertension figure: NSI, European Health Interview Survey 2019).
- Bulgarian and English must say the same thing. `src/i18n/bg.ts` and `src/i18n/en.ts` share one type (`Copy`), so a missing key fails the type check.

## Tech overview

- **Astro**, static output, i18n: Bulgarian default at `/`, English at `/en/`. All copy lives in `src/i18n/`; components in `src/components/` only read from it. `Home.astro` and `Privacy.astro` render both languages; the files in `src/pages/` are one-line wrappers.
- **Cloudflare Worker with static assets** (`wrangler.jsonc`): `dist/` is served directly; only `/api/*` runs `worker/index.ts` first (`assets.run_worker_first`). Page requests never reach the Worker, so the `www` → apex redirect is a Cloudflare Redirect Rule (README step 6), not code.
- **Contact form** (`src/components/ContactForm.astro` → `POST /api/contact`): honeypot + Turnstile + server-side validation. In Mailchimp, the contact is upserted as `transactional`, a note holds the message, tags record role and language, and status becomes `pending` (double opt-in) only when the updates box is ticked. Server limits (message ≤ 800 chars, etc.) must match the form attributes.
- **Brand:** colours in `src/styles/global.css` match the logo (`public/logo*.svg`, master copies in the project's `marketing/` folder). The hero chart reuses the logo idea: readings settle into the target band. Amber = out of range, teal/mint = in range; keep that meaning.
- **Deploy:** GitHub Actions (`.github/workflows/deploy.yml`) runs check + build on PRs and deploys `main` with `cloudflare/wrangler-action`.

## Commands

```sh
npm run dev       # pages only
npm run preview   # build + wrangler dev (needs .dev.vars, see .dev.vars.example)
npm run check     # astro check + Worker type check
npm run build
```

Test the form API locally (with `npm run preview` running and the default `.dev.vars`):
```sh
curl -s -X POST http://localhost:8787/api/contact -H 'Origin: http://localhost:8787' \
  -F name=Test -F email=test@example.com -F role=patient -F consent=yes -F lang=en \
  -F cf-turnstile-response=XXXX.DUMMY.TOKEN.XXXX
```

## Open items

Placeholders still to replace before launch are listed in `README.md` → "Before launch": founders, company details, and the privacy policy (a draft pending lawyer review).
