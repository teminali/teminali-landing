import { useEffect, useState } from 'react'
import { downloads, site } from '@/content/site'

type Asset = { name: string; url: string; size: number }
type Release = { version: string; publishedAt: string; assets: Asset[]; sums: Record<string, string> }
type PlatformId = (typeof downloads.platforms)[number]['id']

/** The public releases repo, read off the releases link so the two can never drift. */
const REPO = new URL(site.releaseUrl).pathname.split('/').filter(Boolean).slice(0, 2).join('/')
const CACHE_KEY = 'tc:release'
const CACHE_TTL = 60 * 60 * 1000
const mb = (n: number) => `${Math.round(n / 1e6)} MB`
const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''

async function fetchRelease(): Promise<Release | null> {
  // One unauthenticated call an hour per visitor; GitHub allows sixty.
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { at, rel } = JSON.parse(cached) as { at: number; rel: Release }
      if (Date.now() - at < CACHE_TTL) return rel
    }
  } catch {
    /* Storage can be unavailable; fetch instead. */
  }
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!r.ok) return null
  const j = await r.json()
  const assets: Asset[] = (j.assets ?? []).map((a: Record<string, unknown>) => ({
    name: String(a.name),
    url: String(a.browser_download_url),
    size: Number(a.size ?? 0),
  }))
  // Checksums live in a published sums file, if the release ships one.
  const sums: Record<string, string> = {}
  const sumFile = assets.find((a) => /checksums?\.txt$|\.sha256$/i.test(a.name))
  if (sumFile) {
    const t = await fetch(sumFile.url).then((x) => (x.ok ? x.text() : ''))
    for (const line of t.split('\n')) {
      const m = line.trim().match(/^([a-f0-9]{64})\s+\*?(.+)$/i)
      if (m) sums[m[2].trim()] = m[1]
    }
  }
  const rel: Release = {
    version: String(j.tag_name ?? site.version),
    publishedAt: String(j.published_at ?? ''),
    assets,
    sums,
  }
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rel }))
  } catch {
    /* Fine without the cache. */
  }
  return rel
}

/**
 * The version, the file sizes and the checksums all come from the latest
 * GitHub release rather than from constants, so the page cannot go stale on a
 * release. When the call fails, whether offline or rate-limited, the page falls
 * back to the copy in `site.ts` and simply omits the things it cannot know. It
 * never invents a checksum.
 */
function useRelease(): Release | null {
  const [rel, setRel] = useState<Release | null>(null)
  useEffect(() => {
    let live = true
    fetchRelease()
      .then((r) => live && r && setRel(r))
      .catch(() => {
        /* Falls back to the copy in site.ts. */
      })
    return () => {
      live = false
    }
  }, [])
  return rel
}

type Hints = { architecture?: string; platform?: string }
type NavigatorUA = Navigator & {
  userAgentData?: { platform?: string; mobile?: boolean; getHighEntropyValues?: (hints: string[]) => Promise<Hints> }
}

/** Every Mac's UA string says "Intel", so the chip has to come from elsewhere:
    client hints on Chromium, the GPU's name on Safari and Firefox, and Apple
    Silicon, now the common case, when neither will say. */
async function macIsArm(nav: NavigatorUA): Promise<boolean> {
  try {
    const hints = await nav.userAgentData?.getHighEntropyValues?.(['architecture'])
    if (hints?.architecture) return /arm/i.test(hints.architecture)
  } catch {
    /* Not on offer; try the GPU. */
  }
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '')
      if (/Apple/i.test(renderer)) return true
      if (/Intel|AMD|Radeon|NVIDIA/i.test(renderer)) return false
    }
  } catch {
    /* No WebGL; fall through. */
  }
  return true
}

/** Best-effort, and only ever used to promote a build, never to hide one.
    Phones and tablets get no recommendation: there is nothing to install. */
async function detectPlatform(): Promise<PlatformId | null> {
  const nav = navigator as NavigatorUA
  const ua = navigator.userAgent
  if (nav.userAgentData?.mobile || /Android|iPhone|iPad|iPod/i.test(ua)) return null
  // iPadOS Safari presents itself as a Mac; the touch points give it away.
  if (/Mac/i.test(ua) && navigator.maxTouchPoints > 1) return null
  const plat = (nav.userAgentData?.platform || navigator.platform || '').toLowerCase()
  if (/win/.test(plat) || /Windows/i.test(ua)) return 'win'
  if (/linux/.test(plat) || /Linux/i.test(ua)) return 'linux'
  if (/mac/.test(plat) || /Mac OS X/i.test(ua)) return (await macIsArm(nav)) ? 'mac-arm' : 'mac-x64'
  return null
}

function Copy({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setDone(true)
            setTimeout(() => setDone(false), 1600)
          },
          () => {},
        )
      }}
      className="shrink-0 rounded-ctl border border-line-strong px-3 py-1.5 text-micro text-ink-soft transition-colors duration-150 ease-brand hover:border-line-popover hover:text-ink"
    >
      {done ? 'Copied' : 'Copy'}
    </button>
  )
}

/** Monospace, scrolls inside itself. The page must never scroll sideways. */
function CodeRow({ text, label }: { text: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-ctl border border-line bg-surface-sunken px-4 py-3">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-micro text-ink-body">
        {text}
      </code>
      <Copy text={text} label={label} />
    </div>
  )
}

export function Downloads() {
  const rel = useRelease()
  const [me, setMe] = useState<PlatformId | null>(null)
  useEffect(() => {
    let live = true
    detectPlatform().then((id) => live && setMe(id))
    return () => {
      live = false
    }
  }, [])

  const version = rel?.version ?? site.version
  const date = rel ? formatDate(rel.publishedAt) : ''
  const assetFor = (p: (typeof downloads.platforms)[number]) => rel?.assets.find((a) => p.asset.test(a.name))
  const mine = downloads.platforms.find((p) => p.id === me)
  const mineAsset = mine ? assetFor(mine) : undefined

  return (
    <>
      {/* Header */}
      <section className="section-hero pb-[4rem]">
        <div className="shell">
          <p className="kicker" data-reveal>
            {downloads.kicker}
          </p>
          <h1 className="mt-6 max-w-3xl text-h1 text-ink-bright balance" data-reveal>
            {downloads.title}
          </h1>
          <p className="mt-6 max-w-xl text-lead text-ink-soft pretty" data-reveal>
            {downloads.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4" data-reveal>
            <span className="pill">
              {version}
              {date ? ` · ${date}` : ''}
            </span>
            <a
              href={downloads.secondary.href}
              className="text-small text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-brand hover:text-ink"
            >
              {downloads.secondary.label}
            </a>
          </div>

          {/* The build this browser says it wants, ahead of the four cards. */}
          {mine && (
            <div className="card mt-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between" data-reveal>
              <div>
                <p className="kicker">{downloads.recommended.kicker}</p>
                <p className="mt-3 text-h4 text-ink-bright">
                  {mine.name} · {mine.arch}
                </p>
                <p className="mt-2 font-mono text-micro text-ink-muted">
                  {version} · {mine.ext} · {mineAsset ? mb(mineAsset.size) : mine.size}
                </p>
                <p className="mt-2 text-small text-ink-soft">{downloads.recommended.note}</p>
              </div>
              <a className="btn btn-primary shrink-0" href={mineAsset?.url ?? downloads.secondary.href}>
                Download for {mine.name}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Platform cards */}
      <section className="pb-[5.5rem]">
        <div className="shell grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {downloads.platforms.map((p) => {
            const asset = assetFor(p)
            const yours = me === p.id
            return (
              <div
                key={p.id}
                data-reveal
                className={`card flex flex-col p-6 ${yours ? 'border-line-strong' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-h4 text-ink-bright">{p.name}</h2>
                  {yours && <span className="text-micro text-accent">Your platform</span>}
                </div>
                <p className="mt-1 text-small text-ink-soft">{p.arch}</p>
                <p className="mt-6 font-mono text-micro text-ink-muted">
                  {p.ext} · {asset ? mb(asset.size) : p.size}
                </p>
                <a
                  className="btn btn-primary mt-5 w-full"
                  href={asset?.url ?? downloads.secondary.href}
                >
                  Download
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* First launch on macOS, directly beneath the macOS cards. */}
      <section id="first-launch" className="section-md border-y border-line bg-surface-sunken">
        <div className="shell">
          <p className="kicker" data-reveal>
            {downloads.mac.kicker}
          </p>
          <h2 className="mt-6 max-w-2xl text-h2 text-ink-bright balance" data-reveal>
            {downloads.mac.title}
          </h2>
          <p className="mt-6 max-w-2xl text-body text-ink-soft pretty" data-reveal>
            {downloads.mac.body}
          </p>
          <p className="mt-4 max-w-2xl text-body text-ink-bright" data-reveal>
            {downloads.mac.once}
          </p>

          <ol className="mt-12 grid gap-5 lg:grid-cols-3">
            {downloads.mac.steps.map((s) => (
              <li key={s.n} className="card flex flex-col p-6" data-reveal>
                <span className="kicker">{s.n}</span>
                <h3 className="mt-4 text-h4 text-ink-bright balance">{s.title}</h3>
                <p className="mt-3 text-body text-ink-soft pretty">{s.body}</p>
                {/* The screenshots are supplied later; the layout has to read
                    correctly with the frames empty, so they carry their own
                    caption rather than relying on an image to explain them. */}
                <figure className="mt-6 flex flex-col gap-2">
                  <div className="grid aspect-[16/10] place-items-center rounded-ctl border border-dashed border-line-strong bg-ground">
                    <span className="px-4 text-center text-micro text-ink-ghost">Screenshot to come</span>
                  </div>
                  <figcaption className="text-micro text-ink-muted">{s.figure}</figcaption>
                </figure>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-3" data-reveal>
            <p className="text-body text-ink-bright">{downloads.mac.note}</p>
            <p className="text-small text-ink-muted">{downloads.mac.closing}</p>
          </div>
        </div>
      </section>

      {/* Advanced, verify, requirements: all deliberately quiet. */}
      <section className="section-md">
        <div className="shell grid gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-10">
            <details className="card group p-6" data-reveal>
              <summary className="cursor-pointer list-none text-body text-ink marker:hidden">
                {downloads.terminal.summary}
              </summary>
              <p className="mt-4 text-small text-ink-soft">{downloads.terminal.body}</p>
              <div className="mt-4">
                <CodeRow text={downloads.terminal.command} label="Copy the install command" />
              </div>
              <p className="mt-3 text-micro text-ink-muted">{downloads.terminal.pending}</p>
            </details>

            <div data-reveal>
              <p className="kicker">{downloads.verify.kicker}</p>
              <p className="mt-4 text-small text-ink-soft">{downloads.verify.body}</p>
              <div className="mt-4 flex flex-col gap-3">
                {rel && Object.keys(rel.sums).length > 0 ? (
                  Object.entries(rel.sums).map(([file, sum]) => (
                    <div key={file}>
                      <p className="mb-2 font-mono text-micro text-ink-muted">{file}</p>
                      <CodeRow text={sum} label={`Copy the checksum for ${file}`} />
                    </div>
                  ))
                ) : (
                  <p className="text-micro text-ink-muted">{downloads.verify.empty}</p>
                )}
                <CodeRow text={downloads.verify.command} label="Copy the verify command" />
              </div>
            </div>
          </div>

          <div data-reveal>
            <p className="kicker">{downloads.requirements.kicker}</p>
            <dl className="mt-6">
              {downloads.requirements.rows.map((r, i) => (
                <div
                  key={r.k}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8"
                  style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}
                >
                  <dt className="w-28 shrink-0 text-small text-ink-muted">{r.k}</dt>
                  <dd className="text-small text-ink-body">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  )
}
