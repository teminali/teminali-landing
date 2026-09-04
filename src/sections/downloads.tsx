import { useEffect, useState } from 'react'
import { downloads, site } from '@/content/site'

type Asset = { name: string; url: string; size: number }
type Release = { version: string; date: string; assets: Asset[]; sums: Record<string, string> }

const REPO = 'teminali/teminalicode'
const mb = (n: number) => `${Math.round(n / 1e6)} MB`

/**
 * The version, the file sizes and the checksums all come from the latest
 * GitHub release rather than from constants, so the page cannot go stale on a
 * release. When the call fails, whether offline, rate-limited, or the repo still
 * private, the page falls back to the copy in `site.ts` and simply omits the
 * things it cannot know. It never invents a checksum.
 */
function useRelease(): Release | null {
  const [rel, setRel] = useState<Release | null>(null)
  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!r.ok) return
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
        if (!live) return
        setRel({
          version: String(j.tag_name ?? site.version),
          date: j.published_at
            ? new Date(j.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
            : '',
          assets,
          sums,
        })
      } catch {
        /* Falls back to the copy in site.ts. */
      }
    })()
    return () => {
      live = false
    }
  }, [])
  return rel
}

/** Best-effort, and only ever used to promote a card, never to hide one. */
function detectPlatform(): string | null {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string; architecture?: string }
  }
  const ua = navigator.userAgent
  const plat = (nav.userAgentData?.platform || navigator.platform || '').toLowerCase()
  if (/win/.test(plat) || /Windows/i.test(ua)) return 'win'
  if (/linux/.test(plat) && !/android/i.test(ua)) return 'linux'
  if (/mac/.test(plat) || /Mac OS X/i.test(ua)) {
    // Apple Silicon Macs report an Intel UA string; the reliable tell is the
    // WebGL renderer, so fall back to Apple Silicon, now the common case.
    return /Intel/i.test(ua) && !/Apple/i.test(ua) ? 'mac-x64' : 'mac-arm'
  }
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
  const [me, setMe] = useState<string | null>(null)
  useEffect(() => setMe(detectPlatform()), [])

  const version = rel?.version ?? site.version

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
              {rel?.date ? ` · ${rel.date}` : ''}
            </span>
            <a
              href={downloads.secondary.href}
              className="text-small text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors duration-150 ease-brand hover:text-ink"
            >
              {downloads.secondary.label}
            </a>
          </div>
        </div>
      </section>

      {/* Platform cards */}
      <section className="pb-[5.5rem]">
        <div className="shell grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {downloads.platforms.map((p) => {
            const asset = rel?.assets.find((a) => p.asset.test(a.name))
            const mine = me === p.match
            return (
              <div
                key={p.id}
                data-reveal
                className={`card flex flex-col p-6 ${mine ? 'border-line-strong' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-h4 text-ink-bright">{p.name}</h2>
                  {mine && <span className="text-micro text-accent">Your platform</span>}
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
