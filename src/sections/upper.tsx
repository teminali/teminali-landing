import { Fragment, useRef, useState } from 'react'
import gsap from 'gsap'
import { Badge, SectionHead, Icon, EmailCapture, Mark } from '@/components/ui'
import { StudioMock, type ShotName } from '@/components/StudioMock'
import { linkProps } from '@/lib/route'
import { scrollToSection } from '@/lib/motion'
import { platform, studio, demoCta, process as flow, site } from '@/content/site'

type Shot = ShotName

/** In-page anchors scroll through Lenis; everything else is a real link. */
function ctaProps(href: string) {
  if (href.startsWith('#')) {
    return {
      href,
      onClick(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault()
        scrollToSection(href.slice(1))
      },
    }
  }
  if (href.startsWith('http')) return { href, target: '_blank', rel: 'noreferrer' }
  return linkProps(href)
}

/* --------------------------------------------------------------- platform ---
   Four alternating split rows on the reference's medium container: text at
   1fr, a 49% figure column whose 50vw shot bleeds off the outer edge. */

export function Platform() {
  return (
    <section id="platform" className="relative rule-clip">
      <div className="shell">
        <div className="pad-lg" />
        <SectionHead badge={platform.badge} title={platform.title} body={platform.body} />
        <div className="pad-md" />
      </div>

      <div className="shell is-medium">
        {platform.rows.map((row, i) => {
          const rev = i % 2 === 1
          return (
            <Fragment key={row.tagline}>
              {i > 0 && <div className="pad-lg" />}
              <div className={`split ${rev ? 'is-rev' : ''}`}>
                <div className="split-text" data-reveal-stagger>
                  <div className="split-head">
                    <p className="tagline" data-reveal>
                      {row.tagline}
                    </p>
                    <h3 className="h4 balance" data-reveal>
                      {row.title}
                    </h3>
                    <p className="ink-70 pretty" data-reveal>
                      {row.body}
                    </p>
                  </div>

                  <div className="split-list">
                    {row.points.map((pt, j) => (
                      <Fragment key={pt.text}>
                        {j > 0 && <div className="split-line" data-line />}
                        <div className="split-item" data-reveal>
                          <span className="split-icon">
                            <Icon name={pt.icon} className="h-6 w-6" />
                          </span>
                          <p className="pretty">{pt.text}</p>
                        </div>
                      </Fragment>
                    ))}
                  </div>

                  <div data-reveal>
                    <a className="btn" data-magnetic {...ctaProps(row.cta.href)}>
                      <span>{row.cta.label}</span>
                    </a>
                  </div>
                </div>

                <div className={`split-figure ${rev ? 'is-rev' : ''}`}>
                  <Figure variant={row.figure as Shot} rev={rev} />
                </div>
              </div>
            </Fragment>
          )
        })}
        <div className="pad-lg" />
      </div>
    </section>
  )
}

function Figure({ variant, rev }: { variant: Shot; rev: boolean }) {
  return (
    <div className="relative" data-parallax="0.05">
      <div className={`split-shot-bg dotfield ${rev ? 'is-rev' : ''}`} aria-hidden="true" />
      <div className="split-shot [container-type:inline-size]" data-reveal="scale">
        <div className="aspect-[16/10] text-[1cqw]">
          <StudioMock variant={variant} />
        </div>
        <div className="img-overlay is-vert" aria-hidden="true" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- hub ---
   The module wheel: ten icon tiles on one ellipse around a concentric core,
   tilting a few degrees with the pointer; a click swings the wheel aside and
   slides the module's detail card in from the near edge. */

type Module = (typeof studio.modules)[number]

/** Tile order around the ellipse, clockwise from the upper right. The left
 *  half of the ring is the `left` group so a card never opens over its tile. */
const RING = [
  'verification',
  'browser-devtools',
  'terminal',
  'voice-speech',
  'video-editor',
  'routing-gateway',
  'screen-studio',
  'guardian-security',
  'skills-mcp',
  'agent-runner',
] as const

const TILT_DEG = 3
const TILT_PX = 6
/** Must match `.software_card` width and the open-state step back. */
const CARD_W_REM = 22
const OPEN_SCALE = 0.9

export function Studio() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [hubState, setHubState] = useState<'normal' | 'left' | 'right'>('normal')

  const byId = new Map(studio.modules.map((m) => [m.id, m]))
  const ring = RING.map((id) => byId.get(id)).filter((m): m is Module => Boolean(m))
  const left = studio.modules.filter((m) => m.group === 'left')
  const right = studio.modules.filter((m) => m.group === 'right')

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hubState !== 'normal' || !wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * 2 - 1
    const py = ((e.clientY - r.top) / r.height) * 2 - 1
    gsap.to(wrapRef.current, {
      rotationX: -py * TILT_DEG,
      rotationY: px * TILT_DEG,
      x: px * TILT_PX,
      y: py * TILT_PX,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }
  const onLeave = () => {
    if (hubState !== 'normal' || !wrapRef.current) return
    gsap.to(wrapRef.current, { rotationX: 0, rotationY: 0, x: 0, y: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
  }
  /* Step the wheel back and slide it just far enough that the near tile
     clears the card by 1.5rem. The orbit's rendered width is `2 * --rx`, so
     the geometry is measured, not recomputed. */
  const openCard = (m: Module) => {
    const wrap = wrapRef.current
    if (!wrap) return
    setHubState(m.group as 'left' | 'right')
    setActiveCard(m.id)
    const dir = m.group === 'left' ? 1 : -1
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const rx = (wrap.querySelector<HTMLElement>('.software_orbit')?.offsetWidth ?? 0) / 2
    const w = wrap.offsetWidth
    const clear = (CARD_W_REM + 1.5) * rem
    // Half-width of the wheel at the side tiles' outer edge, unscaled.
    const half = rx * Math.cos(Math.PI / 10) + 3 * rem
    // Shrink further on narrow viewports so the far tile, grown ~15% by the
    // perspective swing, still lands inside the wrap.
    const scale = Math.max(0.6, Math.min(OPEN_SCALE, (w - clear - 1.5 * rem) / (half * 2.15)))
    const shift = Math.max(0, clear - (w / 2 - scale * half))
    gsap.to(wrap, {
      rotationX: 4,
      rotationY: -dir * 8,
      x: dir * shift,
      y: 0,
      scale,
      duration: 0.9,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }
  const close = () => {
    if (!wrapRef.current) return
    setHubState('normal')
    setActiveCard(null)
    gsap.to(wrapRef.current, { rotationX: 0, rotationY: 0, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', overwrite: 'auto' })
  }

  const card = (m: Module) => (
    <div key={m.id} id={m.id} className={`software_card ${activeCard === m.id ? 'is-active' : ''}`}>
      <span className="software_card-icon">
        <Icon name={m.icon} className="h-5 w-5" />
      </span>
      <div className="software_card-text">
        <h4 className="software_card-title">{m.title}</h4>
        <p className="software_card-sub">{m.sub}</p>
        <p className="software_card-desc pretty">{m.desc}</p>
        <ul className="software_card-points">
          {m.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
      </div>
      <div className="software_card-btn-wrap">
        <a className="btn" {...linkProps('/downloads')}>
          <Icon name="download" className="h-4 w-4" />
          <span>Download</span>
        </a>
      </div>
      <button type="button" className="software_card-close" onClick={close} aria-label="Close">
        <Icon name="cross" className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <section id="studio" className="relative overflow-hidden">
      <div className="pad-lg" />
      <div className="shell">
        <Badge>{studio.badge}</Badge>
        <div className="studio-head" data-reveal-stagger>
          <h2 className="h2 balance" data-reveal="words">
            {studio.title}
          </h2>
          <div className="studio-head_aside">
            <p className="intro-p pretty" data-reveal>
              {studio.body}
            </p>
            <p className="studio-stats" data-reveal>
              {studio.stats.map((s, i) => (
                <Fragment key={s}>
                  {i > 0 && <span className="studio-stats_dot" aria-hidden="true" />}
                  <span>{s}</span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>
      </div>
      <div className="pad-md" />

      <div className="software_component hide-tablet">
        <div className="software_card-wrap is-first">{left.map(card)}</div>

        <div
          ref={wrapRef}
          className="software_wrap"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          data-reveal-stagger="0.04"
        >
          <div className="software_orbit" aria-hidden="true" data-reveal />

          <div className="software_core" aria-hidden="true" data-reveal>
            <div className="software_core-drift" data-parallax="-0.04">
              <div className="software_glow" />
              <div className="software_ring is-outer" />
              <div className="software_ring is-middle" />
              <div className="software_pill">
                <Mark className="h-14 w-14" />
                <span className="software_pill-label">Studio</span>
              </div>
            </div>
          </div>

          {ring.map((m, i) => (
            <button
              key={m.id}
              type="button"
              data-card={m.id}
              className={`software_item ${activeCard === m.id ? 'is-active' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
              onClick={() => openCard(m)}
              aria-pressed={activeCard === m.id}
              data-reveal
            >
              <span className="software_tile">
                <Icon name={m.icon} className="h-6 w-6" />
              </span>
              <span className="software_label">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="software_card-wrap is-second">{right.map(card)}</div>
      </div>

      {/* Tablet and phone: the same modules as a plain list of cards. */}
      <div className="shell lg:hidden">
        <div className="grid gap-4 sm:grid-cols-2" data-reveal-stagger>
          {studio.modules.map((m) => (
            <div key={m.id} className="mission-card" data-reveal>
              <span className="mission-icon">
                <Icon name={m.icon} className="h-6 w-6" />
              </span>
              <div className="mission-text">
                <h4 className="h5">{m.title}</h4>
                <p className="ink-70">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pad-md" />
    </section>
  )
}

/* ---------------------------------------------------------------- demo CTA ---
   The reference's tour card: a bordered panel, copy on the left, a collage of
   product screens rotated 24° bleeding off the right edge behind a veil. */

export function DemoCta() {
  const cols: Shot[][] = [
    ['record', 'export'],
    ['editor', 'home'],
  ]
  return (
    <section id="demo" className="shell">
      <div className="tour" data-reveal="scale">
        <div className="tour-text" data-reveal-stagger>
          <h2 className="h2 balance" data-reveal="words">
            {demoCta.title}
          </h2>
          <div className="spacer-sm" />
          <p className="max-md ink-70 pretty" data-reveal>
            {demoCta.body}
          </p>
          <div className="spacer-lg" />
          <div data-reveal>
            <EmailCapture placeholder={demoCta.placeholder} action={demoCta.action} />
          </div>
          <p className="mt-4 font-mono text-[11px] text-ink-ghost" data-reveal>
            {site.version} · macOS, Windows, Linux · runs offline
          </p>
        </div>

        <div className="tour-bg" aria-hidden="true">
          <div className="tour-bg-overlay" />
          <div className="tour-collage" data-parallax="-0.08">
            {cols.map((col, i) => (
              <div key={i} className={`tour-col is-${i + 1}`}>
                {col.map((v) => (
                  <div key={v} className="tour-shot [container-type:inline-size]">
                    <div className="h-full w-full text-[1cqw]">
                      <StudioMock variant={v} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pad-lg" />
    </section>
  )
}

/* --------------------------------------------------------------- process ---*/

export function Process() {
  return (
    <section id="process" className="relative">
      <div className="shell">
        <div className="pad-lg" />
        <SectionHead badge={flow.badge} title={flow.title} body={flow.body} align="center" />
        <div className="spacer-xl" />

        <div className="process" data-reveal-stagger>
          {flow.steps.map((s) => (
            <div key={s.n} className="process-item" data-reveal>
              <div className="process-top">
                <span className="process-num">{s.n}.</span>
                <span className="process-line" data-line />
              </div>
              <div className="process-bottom">
                <p className="process-heading balance">{s.title}</p>
                <div className="flex flex-col gap-4 ink-70">
                  {s.body.map((p) => (
                    <p key={p} className="pretty">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pad-lg" />
      </div>
    </section>
  )
}

export { Badge }
