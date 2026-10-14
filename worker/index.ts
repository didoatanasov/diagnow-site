/**
 * diagnow.ai Worker.
 *
 * - POST /api/contact → validate → Cloudflare Turnstile → Mailchimp
 * - other /api/* → 404
 * Pages are served directly from static assets (./dist) without running this
 * Worker (assets.run_worker_first only matches /api/*). The www → apex
 * redirect is therefore a Cloudflare Redirect Rule, not code (see README).
 *
 * Mailchimp model: every sender becomes a non-marketing contact
 * (status "transactional") with tags and their message as a note.
 * Only if they tick "send me updates" is the status set to "pending",
 * which makes Mailchimp send its double opt-in confirmation email.
 */

export interface Env {
  ASSETS: Fetcher;
  CANONICAL_HOST: string;
  MAILCHIMP_AUDIENCE_ID: string;
  /** Optional override, e.g. "https://us6.api.mailchimp.com/3.0". */
  MAILCHIMP_API_BASE?: string;
  /** "1" = log instead of calling Mailchimp (local testing). */
  MAILCHIMP_DRY_RUN?: string;
  /** Secret. */
  MAILCHIMP_API_KEY?: string;
  /** Secret. */
  TURNSTILE_SECRET_KEY?: string;
}

const ROLES = ['patient', 'insurer-employer', 'gp', 'pharmacy', 'investor', 'other'] as const;
type Role = (typeof ROLES)[number];

const MAX_BODY_BYTES = 20_000;
const MAX_NOTE = 1000; // Mailchimp limit for member notes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'method' }, 405, { Allow: 'POST' });
      }
      try {
        return await handleContact(request, env, url);
      } catch (err) {
        console.error('contact: unexpected error', err);
        return json({ ok: false, error: 'server' }, 500);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'not_found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

type ContactInput = {
  name: string;
  email: string;
  role: Role;
  organisation: string;
  message: string;
  newsletter: boolean;
  lang: 'bg' | 'en';
};

async function handleContact(request: Request, env: Env, url: URL): Promise<Response> {
  // Same-origin only (browsers always send Origin on POST).
  const origin = request.headers.get('Origin');
  if (origin && !isAllowedOrigin(origin, env, url)) {
    return json({ ok: false, error: 'forbidden' }, 403);
  }

  const length = Number(request.headers.get('Content-Length') ?? '0');
  if (length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'too_large' }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'validation', fields: ['form'] }, 400);
  }

  const field = (key: string) => String(form.get(key) ?? '').trim();

  // Honeypot: real people never see or fill this field. Pretend success.
  if (field('website') !== '') {
    return json({ ok: true, newsletter: false });
  }

  const input: ContactInput = {
    name: field('name'),
    email: field('email').toLowerCase(),
    role: field('role') as Role,
    organisation: field('organisation'),
    message: field('message'),
    newsletter: field('newsletter') === 'yes',
    lang: field('lang') === 'en' ? 'en' : 'bg',
  };

  const invalid: string[] = [];
  if (input.name.length < 2 || input.name.length > 100) invalid.push('name');
  if (input.email.length > 254 || !EMAIL_RE.test(input.email)) invalid.push('email');
  if (!ROLES.includes(input.role)) invalid.push('role');
  if (input.organisation.length > 150) invalid.push('organisation');
  if (input.message.length > 800) invalid.push('message');
  if (field('consent') !== 'yes') invalid.push('consent');
  if (invalid.length > 0) {
    return json({ ok: false, error: 'validation', fields: invalid }, 400);
  }

  const token = field('cf-turnstile-response');
  const ip = request.headers.get('CF-Connecting-IP') ?? undefined;
  if (!(await verifyTurnstile(token, ip, env))) {
    return json({ ok: false, error: 'captcha' }, 400);
  }

  if (env.MAILCHIMP_DRY_RUN === '1') {
    console.log('contact (dry run)', JSON.stringify(input));
    return json({ ok: true, newsletter: input.newsletter });
  }

  await saveToMailchimp(input, env);
  return json({ ok: true, newsletter: input.newsletter });
}

function isAllowedOrigin(origin: string, env: Env, url: URL): boolean {
  try {
    const host = new URL(origin).hostname;
    return (
      host === env.CANONICAL_HOST ||
      host === url.hostname ||
      host === 'localhost' ||
      host === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

async function verifyTurnstile(token: string, ip: string | undefined, env: Env): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) {
    throw new Error('TURNSTILE_SECRET_KEY is not set');
  }
  if (!token) return false;

  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  if (!res.ok) return false;
  const result = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
  if (!result.success) {
    console.warn('turnstile failed', result['error-codes']);
  }
  return result.success === true;
}

class MailchimpError extends Error {}

async function saveToMailchimp(input: ContactInput, env: Env): Promise<void> {
  if (!env.MAILCHIMP_API_KEY) throw new Error('MAILCHIMP_API_KEY is not set');

  const base = mailchimpBase(env);
  const list = env.MAILCHIMP_AUDIENCE_ID;
  const member = `${base}/lists/${list}/members/${await md5(input.email)}`;
  const headers = {
    Authorization: `Basic ${btoa(`diagnow:${env.MAILCHIMP_API_KEY}`)}`,
    'Content-Type': 'application/json',
  };

  // 1. Add or update the contact. New contacts are non-marketing ("transactional").
  const upsert = await fetch(`${member}?skip_merge_validation=true`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      email_address: input.email,
      status_if_new: 'transactional',
      merge_fields: { FNAME: input.name },
      language: input.lang,
    }),
  });
  if (!upsert.ok) {
    console.error('mailchimp upsert failed', upsert.status, await upsert.text());
    throw new MailchimpError('upsert');
  }
  const { status } = (await upsert.json()) as { status?: string };

  // 2. Keep the message as a note on the contact (max 1,000 characters).
  const note = [
    `Role: ${input.role}`,
    input.organisation ? `Organisation: ${input.organisation}` : '',
    `Language: ${input.lang}`,
    `Newsletter requested: ${input.newsletter ? 'yes' : 'no'}`,
    '',
    input.message || '(no message)',
  ]
    .filter((line, i) => line !== '' || i === 4)
    .join('\n')
    .slice(0, MAX_NOTE);

  const noteRes = await fetch(`${member}/notes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ note }),
  });
  if (!noteRes.ok) {
    console.error('mailchimp note failed', noteRes.status, await noteRes.text());
    throw new MailchimpError('note');
  }

  // 3. Tags (created automatically if they don't exist). Failure is logged, not fatal.
  const tags = ['website-contact', input.role, `site-${input.lang}`];
  if (input.newsletter) tags.push('newsletter-requested');
  const tagRes = await fetch(`${member}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ tags: tags.map((name) => ({ name, status: 'active' })) }),
  });
  if (!tagRes.ok) {
    console.error('mailchimp tags failed', tagRes.status, await tagRes.text());
  }

  // 4. Newsletter: "pending" triggers Mailchimp's double opt-in email.
  if (input.newsletter && status !== 'subscribed' && status !== 'pending') {
    const optIn = await fetch(member, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'pending' }),
    });
    if (!optIn.ok) {
      // e.g. a contact who unsubscribed earlier must re-subscribe via a Mailchimp form.
      console.error('mailchimp opt-in failed', optIn.status, await optIn.text());
    }
  }
}

function mailchimpBase(env: Env): string {
  if (env.MAILCHIMP_API_BASE) return env.MAILCHIMP_API_BASE.replace(/\/$/, '');
  // Classic API keys end with the data centre, e.g. "...-us6".
  const dc = env.MAILCHIMP_API_KEY?.split('-')[1];
  return dc && /^[a-z]+\d+$/.test(dc)
    ? `https://${dc}.api.mailchimp.com/3.0`
    : 'https://api.mailchimp.com/3.0';
}

async function md5(text: string): Promise<string> {
  // Workers support MD5 in crypto.subtle (Mailchimp's subscriber hash).
  const digest = await crypto.subtle.digest('MD5', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extra,
    },
  });
}
