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
   The radial module wheel: ten icon tiles on a 3rem grid around a concentric
   centre, tilting with the pointer; a click swings the wheel aside and slides
   in the module's card from the near edge. */

type Module = (typeof studio.modules)[number]

export function Studio() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [hubState, setHubState] = useState<'normal' | 'left' | 'right'>('normal')

  const left = studio.modules.filter((m) => m.group === 'left')
  const right = studio.modules.filter((m) => m.group === 'right')

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hubState !== 'normal' || !wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    const rotX = -((((e.clientY - r.top) / r.height) * 100 - 50) / (50 / 15))
    const rotY = (((e.clientX - r.left) / r.width) * 100 - 50) / (50 / 15)
    gsap.to(wrapRef.current, { rotationX: rotX, rotationY: rotY, duration: 0.5, ease: 'power1.out' })
  }
  const onLeave = () => {
    if (hubState !== 'normal' || !wrapRef.current) return
    gsap.to(wrapRef.current, { rotationX: 0, rotationY: 0, duration: 0.5, ease: 'power1.out' })
  }
  const openCard = (m: Module) => {
    if (!wrapRef.current) return
    setHubState(m.group as 'left' | 'right')
    setActiveCard(m.id)
    const rotY = m.group === 'left' ? -30 : 30
    const x = m.group === 'left' ? '14vw' : '-14vw'
    gsap.to(wrapRef.current, { rotationX: 10, rotationY: rotY, x, duration: 1, ease: 'power3.out' })
  }
  const close = () => {
    if (!wrapRef.current) return
    setHubState('normal')
    setActiveCard(null)
    gsap.to(wrapRef.current, { rotationX: 0, rotationY: 0, x: 0, duration: 1, ease: 'power3.out' })
  }

  const card = (m: Module) => (
    <div key={m.id} id={m.id} className={`software_card ${activeCard === m.id ? 'is-active' : ''}`}>
      <div className="software_card-icon-wrap">
        <span className="software_card-icon">
          <Icon name={m.icon} className="h-6 w-6" />
        </span>
      </div>
      <div className="software_card-text">
        <h4 className="h4">{m.title}</h4>
        <h5 className="h6 ink-70">{m.sub}</h5>
        <p className="ink-70 pretty">{m.desc}</p>
        <ul className="mt-2 flex flex-col gap-2">
          {m.points.map((pt) => (
            <li key={pt} className="flex items-start gap-3 text-small ink-70">
              <span className="mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
              <span>{pt}</span>
            </li>
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
        <Icon name="cross" className="h-5 w-5" />
      </button>
    </div>
  )

  return (
    <section id="studio" className="relative overflow-hidden">
      <div className="pad-lg" />
      <div className="shell">
        <SectionHead badge={studio.badge} title={studio.title} body={studio.body} />
      </div>
      <div className="pad-md" />

      <div className="software_component hide-tablet" data-reveal="scale">
        <div className="software_card-wrap is-first">{left.map(card)}</div>

        <div ref={wrapRef} className="software_wrap" onMouseMove={onMove} onMouseLeave={onLeave}>
          {studio.modules.map((m) => (
            <div key={m.id} data-card={m.id} className="software_item" onClick={() => openCard(m)}>
              <div className="software_icon-wrap">
                <div className="software_icon">
                  <Icon name={m.icon} className="h-7 w-7" />
                </div>
              </div>
              <div>{m.label}</div>
            </div>
          ))}

          <div className="software_smart0-wrap div-square" data-parallax="-0.04">
            <div className="software_smart0-outer">
              <div className="software_blur" />
              <div className="software_smart0-middle">
                <div className="software_smart0-inner">
                  <Mark className="h-24 w-24" />
                  <span className="mt-2 font-mono text-[12px] font-medium uppercase tracking-[0.24em]">Studio</span>
                </div>
              </div>
            </div>
          </div>
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
