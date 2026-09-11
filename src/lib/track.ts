/**
 * Client half of the download tracker. Posts to /api/track, which is the only
 * server-side code in this repo (see api/track.ts for why it has to exist).
 *
 * Nothing here may delay or cancel the navigation the visitor asked for. That
 * is what `navigator.sendBeacon` is for: the browser hands the request to the
 * network stack and lets the page unload immediately. Every call is wrapped,
 * because a tracking failure must never surface as a broken Download button.
 *
 * The ids are anonymous and local: a random visitor id in localStorage and a
 * random session id in sessionStorage. No IP, no fingerprint, nothing that
 * identifies a person. Storage can be unavailable (private windows, blocked
 * site data), in which case the event is still sent, just without ids.
 */

const VISITOR_KEY = 'teminali.visitor'
const SESSION_KEY = 'teminali.session'
const UTM_KEY = 'teminali.utm'

function rid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  }
}

/** Read-or-create an id in a store that is allowed to be missing or throwing. */
function durableId(store: () => Storage, key: string): string | null {
  try {
    const s = store()
    const found = s.getItem(key)
    if (found) return found
    const made = rid()
    s.setItem(key, made)
    return made
  } catch {
    return null
  }
}

/**
 * First-touch ?utm_source for this tab, kept the way the DukaBot storefront
 * keeps it: a link shared on social usually arrives with no referrer, and the
 * parameter is gone from the URL by the time the visitor reaches /downloads.
 */
function utmSource(): string | null {
  try {
    const now = new URLSearchParams(window.location.search).get('utm_source')
    if (now) {
      sessionStorage.setItem(UTM_KEY, now)
      return now
    }
    return sessionStorage.getItem(UTM_KEY)
  } catch {
    return null
  }
}

/** Hostname only: where they came from, not what they were reading. */
function referrerHost(): string | null {
  try {
    if (!document.referrer) return null
    const h = new URL(document.referrer).hostname
    return h === window.location.hostname ? null : h
  } catch {
    return null
  }
}

function device(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth
  if (w < 640) return 'mobile'
  return w < 1024 ? 'tablet' : 'desktop'
}

export type DownloadHit = {
  /** A `downloads.platforms` id: mac-arm | mac-x64 | win | linux. */
  platform: string
  /** The release tag the asset came from, which need not be the newest. */
  version: string
  assetName: string
  assetSize: number
}

/**
 * Record that a visitor took a real release asset. Called from the Download
 * anchors' onClick; the anchor's own navigation is left completely alone.
 */
export function trackDownload(hit: DownloadHit): void {
  try {
    const payload = {
      event_type: 'download',
      visitor_id: durableId(() => localStorage, VISITOR_KEY),
      session_id: durableId(() => sessionStorage, SESSION_KEY),
      platform: hit.platform,
      version: hit.version,
      asset_name: hit.assetName,
      asset_size: hit.assetSize,
      referrer: referrerHost(),
      utm_source: utmSource(),
      device: device(),
    }
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (!navigator.sendBeacon('/api/track', blob)) {
      // Beacon queues can be full or the payload over the UA's cap. Fall back
      // to a keepalive fetch, which also survives the unload.
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* Tracking is never worth a broken download. */
  }
}
