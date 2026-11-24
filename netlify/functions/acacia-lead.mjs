// Acacia landing page → the agency's Google Sheet ("Acacia Leads" tab).
//
// The page posts each lead here as well as to Web3Forms. This function adds the
// Apps Script secret and forwards it, in exactly the shape the agency's Next.js
// build sent (lib/leads/submit-lead.ts in their repo), so the sheet's columns
// and the Apps Script that writes them need no change.
//
// It runs on Netlify rather than in the page because the repository is PUBLIC:
// the script URL and the secret live in Netlify's environment variables
// (Site configuration → Environment variables), never in this file.
//   GOOGLE_SCRIPT_URL     the Apps Script /exec URL
//   GOOGLE_SCRIPT_SECRET  must equal SHARED_SECRET in the Apps Script project
// An environment-variable change only reaches the function after a new deploy.

const FIELDS = ['name', 'phone', 'email', 'project', 'location', 'units', 'interest', 'consent'];
const TRACKING = ['pageUrl', 'pageTitle', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_term', 'utm_content', 'gclid', 'fbclid'];

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

// The agency's rule, verbatim: 10 digits starting 6–9, optional +91 / 91 / 0.
function mobile(raw) {
  if (/[^\d\s+\-()]/.test(raw)) return null;
  const d = raw.replace(/\D/g, '');
  const local = d.length === 12 && d.startsWith('91') ? d.slice(2)
    : d.length === 11 && d.startsWith('0') ? d.slice(1) : d;
  if (!/^[6-9]\d{9}$/.test(local) || /^(\d)\1{9}$/.test(local)) return null;
  return local;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405);
  const endpoint = process.env.GOOGLE_SCRIPT_URL;
  if (!endpoint) return json({ ok: false, error: 'GOOGLE_SCRIPT_URL is not set' }, 503);

  let data;
  try { data = await req.json(); } catch { return json({ ok: false, error: 'bad request' }, 400); }
  const text = (k, max = 300) => (typeof data[k] === 'string' ? data[k].trim().slice(0, max) : '');

  const phone = mobile(text('phone'));
  if (text('name').length < 2 || !phone) return json({ ok: false, error: 'invalid lead' }, 400);

  const now = new Date();
  const payload = {
    sheet: 'Acacia Leads',
    form: 'acacia',
    submittedAt: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    timestamp: now.toISOString(),
  };
  for (const k of FIELDS) payload[k] = text(k);
  payload.phone = phone;
  payload.consent = data.consent ? 'Yes' : '';
  for (const k of TRACKING) { const v = text(k, 1000); if (v) payload[k] = v; }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      // Apps Script reads the raw body; text/plain is what the agency's build sent.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: process.env.GOOGLE_SCRIPT_SECRET || '', ...payload }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || !body.ok) {
      console.error('[acacia-lead] Apps Script refused:', res.status, body && body.error);
      return json({ ok: false, error: (body && body.error) || 'http ' + res.status }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error('[acacia-lead] Apps Script unreachable:', err);
    return json({ ok: false, error: 'unreachable' }, 502);
  }
};

export const config = { path: '/api/acacia-lead' };
