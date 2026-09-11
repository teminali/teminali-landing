/**
 * The contact form's destination.
 *
 * The form used to be a shape on the page: its submit handler called
 * preventDefault and stopped there, so every message typed into it was
 * silently discarded. This sends them.
 *
 * Mail goes through Resend, which already serves dukabotai.com, so the sending
 * domain is verified and nothing new had to be set up for it. The message is
 * sent FROM a no-reply address on that domain and the visitor's own address
 * goes in reply_to: sending as the visitor would be a forged From header on a
 * domain we do not own, which is what SPF and DMARC exist to reject.
 *
 * Public and unauthenticated, like any contact form. The defences are
 * proportionate rather than absolute: a honeypot field, required fields,
 * a shape check on the address, and hard length caps so nobody can post a
 * novel. A determined sender can still send; that is what an inbox is for.
 */

export const config = { runtime: 'edge' }

const TO = 'teminali@dukabotai.com'
const FROM = 'Teminali OS site <noreply@dukabotai.com>'

/** Generous enough for a real enquiry, small enough to bound the payload. */
const LIMITS = { name: 120, email: 200, company: 160, role: 160, message: 6000 }

function str(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

/** Not a validator so much as a sanity check; the real test is whether a reply arrives. */
function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
}

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('[contact] RESEND_API_KEY is unset; the message was not sent')
    return new Response('Mail is not configured', { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return new Response('Malformed JSON', { status: 400 })
  }

  // The honeypot. A real person never sees this field, so anything in it came
  // from something filling every input on the page. Answer 202 rather than an
  // error: a bot that is told it failed simply tries again.
  if (str(body.website, 200) !== '') return new Response(null, { status: 202 })

  const name = str(body.name, LIMITS.name)
  const email = str(body.email, LIMITS.email)
  const company = str(body.company, LIMITS.company)
  const role = str(body.role, LIMITS.role)
  const message = str(body.message, LIMITS.message)

  if (!name || !email || !message) return new Response('Name, email and message are required', { status: 400 })
  if (!looksLikeEmail(email)) return new Response('That email address does not look right', { status: 400 })

  const country = req.headers.get('x-vercel-ip-country') ?? 'unknown'
  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Company', company || 'not given'],
    ['Position', role || 'not given'],
    ['Country', country],
  ]

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    message,
    '',
    'Sent from the contact form on teminali.dukabotai.com',
  ].join('\n')

  const html = [
    '<div style="font:14px/1.55 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#151515">',
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px">',
    ...rows.map(
      ([k, v]) =>
        `<tr><td style="padding:3px 14px 3px 0;color:#6b6b6b">${k}</td>` +
        `<td style="padding:3px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
    ),
    '</table>',
    `<div style="white-space:pre-wrap;padding:14px 16px;border-left:3px solid #65c466;background:#f6f6f6">${escapeHtml(message)}</div>`,
    '<p style="margin-top:18px;color:#6b6b6b;font-size:12px">Sent from the contact form on teminali.dukabotai.com. Reply goes straight back to the sender.</p>',
    '</div>',
  ].join('')

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // So hitting reply in the inbox writes to the person, not to no-reply.
        reply_to: email,
        subject: `Teminali OS contact: ${name}${company ? ` (${company})` : ''}`,
        text,
        html,
      }),
    })
    if (!r.ok) {
      console.error(`[contact] resend refused: ${r.status} ${await r.text()}`)
      return new Response('The message could not be sent', { status: 502 })
    }
  } catch (e) {
    console.error('[contact] resend unreachable', e)
    return new Response('The message could not be sent', { status: 502 })
  }

  return new Response(null, { status: 202 })
}
