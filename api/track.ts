/**
 * Anonymous site events for the Teminali OS landing page.
 *
 * The page is a static SPA, so there is nowhere else to put a write: this edge
 * function is the only server-side code in the repo. It holds the Supabase
 * service-role key, which is why the insert cannot happen from the browser —
 * the table has RLS on and no policies, so the anon key would be refused.
 *
 * The rows land in `teminali_events` in the DukaBot Supabase project
 * (supabase/migrations/20260911000001_teminali_events.sql over in
 * my_projects/teminali/dukabot).
 *
 * Two rules shape everything below:
 *
 *   1. Tracking must never cost the visitor their download. Every failure
 *      path returns rather than throws, and the client fires this with
 *      sendBeacon, which does not wait for the response.
 *   2. No PII. The IP is used by the edge for the country header and is
 *      neither stored nor hashed; `visitor_id` is a random localStorage id.
 *
 * The endpoint is public and unauthenticated, so the counts are inflatable by
 * anyone who can read this file. That is the same exposure as the DukaBot
 * storefront tracker and is accepted for the same reason: these are product
 * signals, not billing.
 */

export const config = { runtime: 'edge' }

/** Mirrors `downloads.platforms` in src/content/site.ts, and the CHECK on the table. */
const PLATFORMS = new Set(['mac-arm', 'mac-x64', 'win', 'linux'])
const DEVICES = new Set(['mobile', 'tablet', 'desktop'])

/** The kinds this endpoint accepts. Widen here and in the migration's comment together. */
const EVENTS = new Set(['download'])

/** Trim, drop empties, and cap length so a hostile body cannot write a novel. */
function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s === '' ? null : s.slice(0, max)
}

function oneOf(v: unknown, allowed: Set<string>, max: number): string | null {
  const s = str(v, max)
  return s !== null && allowed.has(s) ? s : null
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    // Unconfigured is not an error the visitor should ever see or feel.
    console.warn('[track] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset; dropping event')
    return new Response(null, { status: 204 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return new Response('Malformed JSON', { status: 400 })
  }

  const eventType = oneOf(body.event_type, EVENTS, 40)
  if (eventType === null) return new Response('Unknown event_type', { status: 400 })

  const size = body.asset_size
  const row = {
    source: 'landing',
    event_type: eventType,
    visitor_id: str(body.visitor_id, 64),
    session_id: str(body.session_id, 64),
    platform: oneOf(body.platform, PLATFORMS, 20),
    version: str(body.version, 40),
    asset_name: str(body.asset_name, 200),
    asset_size: typeof size === 'number' && Number.isFinite(size) && size >= 0 ? Math.trunc(size) : null,
    referrer: str(body.referrer, 200),
    utm_source: str(body.utm_source, 80),
    device: oneOf(body.device, DEVICES, 10),
    // Set by the Vercel edge. Absent in local dev, which is correct: unknown
    // beats a guess.
    country: req.headers.get('x-vercel-ip-country'),
  }

  try {
    const r = await fetch(`${url}/rest/v1/teminali_events`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    })
    if (!r.ok) {
      console.error(`[track] supabase rejected the insert: ${r.status} ${await r.text()}`)
      return new Response(null, { status: 502 })
    }
  } catch (e) {
    console.error('[track] supabase unreachable', e)
    return new Response(null, { status: 502 })
  }

  return new Response(null, { status: 202 })
}
