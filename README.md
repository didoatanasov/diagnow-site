# diagnow.ai website

Marketing site for diagnow.ai: one page in Bulgarian (`/`) and English (`/en/`), plus a privacy policy. Built with **Astro** (static) and served by a **Cloudflare Worker with static assets**. The contact form posts to the Worker, which checks **Cloudflare Turnstile** and saves the contact in **Mailchimp**.

## Local development

Requires Node 22.12 or newer.

```sh
npm install
npm run dev          # Astro dev server, pages only (the form needs the Worker, see below)
cp .dev.vars.example .dev.vars
npm run preview      # build + wrangler dev: full site incl. /api/contact on http://localhost:8787
npm run check        # type checks (Astro + Worker)
```

With the default `.dev.vars`, Turnstile uses Cloudflare's test keys (always passes) and `MAILCHIMP_DRY_RUN=1` logs submissions in the terminal instead of calling Mailchimp.

## Where to edit

| What | File |
|---|---|
| All text (BG / EN) | `src/i18n/bg.ts`, `src/i18n/en.ts` (same structure) |
| Founders (names, roles, bios, photos) | `src/data/team.ts`; photos in `public/team/` |
| Privacy policy (draft) | `src/components/Privacy.astro` |
| Colours, type, spacing | `src/styles/global.css` |
| Contact form → Mailchimp | `worker/index.ts` |
| Security headers | `public/_headers` |

## One-time setup

### 1. Mailchimp
1. Create (or pick) an **audience** and copy its **Audience ID** (Audience → Settings → Audience name and defaults).
2. Make sure double opt-in confirmation emails are set up for this audience (they are sent when a contact ticks "Send me updates").
3. Create an **API key** (Profile → Extras → API keys).
4. Put the Audience ID in `wrangler.jsonc` → `vars.MAILCHIMP_AUDIENCE_ID`.

The Worker adds every sender as a **non-marketing contact** (status `transactional`), adds tags (`website-contact`, the role, `site-bg`/`site-en`, `newsletter-requested`) and saves the message as a **note**. Only senders who tick the updates box are set to `pending`, which triggers Mailchimp's confirmation email.

The API host is derived from the key's data-centre suffix (e.g. `-us6` → `https://us6.api.mailchimp.com/3.0`). If your key has no suffix, set `vars.MAILCHIMP_API_BASE`.

### 2. Cloudflare Turnstile
Create a Turnstile widget for `diagnow.ai` (Cloudflare dashboard → Turnstile). You get a **site key** (public) and a **secret key**.

### 3. Worker secrets
```sh
npx wrangler login
npx wrangler secret put MAILCHIMP_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```
(Secrets persist across deployments. If the Worker doesn't exist yet, deploy once first; see step 5.)

### 4. GitHub repository settings
Settings → Secrets and variables → Actions:
- **Secrets:**
  - `CLOUDFLARE_API_TOKEN`: an API token with the "Edit Cloudflare Workers" template, plus permission to manage the `diagnow.ai` zone's routes/custom domains;
  - `CLOUDFLARE_ACCOUNT_ID`.
- **Variable:** `PUBLIC_TURNSTILE_SITE_KEY`, the Turnstile site key (it is baked into the HTML at build time).

### 5. Deploy
Push to `main`. `.github/workflows/deploy.yml` then:
1. installs dependencies;
2. runs `npm run check` and `npm run build`;
3. deploys with `wrangler deploy`.

Pull requests only build and check, they don't deploy. `wrangler.jsonc` attaches the Worker to `diagnow.ai` as a custom domain (there must be no conflicting DNS record for the apex).

### 6. Redirect www → diagnow.ai
Pages are served straight from static assets, so the Worker can't do this redirect. In the Cloudflare dashboard for the `diagnow.ai` zone:
1. **DNS:** make sure `www` has a **proxied** record (e.g. `AAAA www 100::`, orange cloud on).
2. **Rules → Redirect Rules:** create a rule using the "Redirect from WWW to root" template (301, preserve path and query string).

## Before launch
- Replace the placeholders: founders (`src/data/team.ts`), company name/address/UIC (`footer.company` in both i18n files), `hello@diagnow.ai` if a different address is used.
- Have a lawyer review the privacy policy, then remove its draft notice.
- Check that the Turnstile site key variable and both Worker secrets are set.
