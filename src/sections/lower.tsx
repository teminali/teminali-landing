import { Badge, SectionHead, Icon, EmailCapture, WorldDots, Mark } from '@/components/ui'
import { StudioMock, BreakoutCard, type ShotName } from '@/components/StudioMock'
import { linkProps } from '@/lib/route'
import { scrollToSection } from '@/lib/motion'
import { compare, midCta, about, mission, roadmapCta, stats, contact, site } from '@/content/site'

type Shot = ShotName

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

/* --------------------------------------------------------------- compare ---*/

export function Compare() {
  return (
    <section id="compare" className="relative">
      <div className="shell">
        <div className="pad-lg" />
        <SectionHead badge={compare.badge} title={compare.title} sub={compare.sub} body={compare.body} align="center" />
        <div className="spacer-xl" />

        <div className="compare" data-reveal-stagger>
          <div className="compare-card" data-reveal>
            <div className="compare-heading">
              <span className="grid h-16 w-16 place-items-center text-mark">
                <Mark className="h-12 w-12" />
              </span>
              <h3 className="h4">{site.name}</h3>
            </div>
            <div className="compare-list">
              {compare.ours.map((t) => (
                <div key={t} className="compare-item">
                  <span className="compare-icon text-accent">
                    <Icon name="check" className="h-5 w-5" />
                  </span>
                  <p className="pretty">{t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="compare-card is-2" data-reveal>
            <div className="compare-heading">
              <h3 className="h4">The subscription stack</h3>
            </div>
            <div className="compare-list">
              {compare.theirs.map((t) => (
                <div key={t} className="compare-item">
                  <span className="compare-icon ink-60">
                    <Icon name="cross" className="h-4 w-4" />
                  </span>
                  <p className="ink-70 pretty">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pad-lg" />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- mid CTA ---*/

export function MidCta() {
  return (
    <section id="midcta" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
        <div className="h-[120%] w-full" data-parallax="-0.1">
          <WorldDots className="h-full w-full text-[#3d3d3d]" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(21,21,21,0.95)_0%,rgba(21,21,21,0)_18%,rgba(21,21,21,0)_82%,rgba(21,21,21,0.95)_100%)]"
        aria-hidden="true"
      />
      <div className="shell is-medium relative">
        <div className="pad-lg" />
        <div className="flex flex-col items-center text-center" data-reveal-stagger>
          <h2 className="h3 balance" data-reveal="words">
            {midCta.title}
          </h2>
          <div className="spacer-md" />
          <p className="text-large ink-70 max-lg pretty" data-reveal>
            {midCta.body}
          </p>
          <div className="spacer-xl" />
          <div className="w-full" data-reveal>
            <EmailCapture placeholder={midCta.placeholder} action={midCta.action} center />
          </div>
        </div>
        <div className="pad-lg" />
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- about ---
   Two split rows. The reference floats UI cards over both the top and the
   bottom edge of the photo, so the frame never reads as a closed rectangle. */

const FIGURE_CARDS = {
  a: [
    { title: 'Verify', rows: ['Types clean', 'Tests 1,006 / 1,006', 'Build passed'] },
    { title: 'Runtimes', rows: ['agent · quality', 'visual · performance', 'mcp'] },
  ],
  b: [
    { title: 'Take saved', rows: ['Screen · 30 fps', 'Camera · narration', 'Zooms placed'] },
    { title: 'Gateway', rows: ['127.0.0.1:4310', 'Ollama connected', 'Frontier Auto'] },
  ],
} as const

export function About() {
  const [first, second] = about.rows
  return (
    <section id="about" className="relative">
      <div className="shell">
        <div className="pad-lg" />
        <SectionHead badge={about.badge} title={about.title} body={about.body} align="center" />
        <div className="spacer-huge" />

        <div className="split">
          <div className="split-text" data-reveal-stagger>
            <div className="split-head">
              <h3 className="h4 balance" data-reveal>
                {first.title}
              </h3>
              <div className="flex flex-col gap-4 ink-70" data-reveal>
                {first.body.map((p) => (
                  <p key={p} className="pretty">
                    {p}
                  </p>
                ))}
                <ul className="flex list-disc flex-col gap-1 pl-5">
                  {first.bullets?.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
            {first.cta && (
              <div data-reveal>
                <a className="btn" data-magnetic {...ctaProps(first.cta.href)}>
                  <span>{first.cta.label}</span>
                </a>
              </div>
            )}
          </div>
          <div className="split-figure">
            <UiFigure variant={first.figure as Shot} pair="a" />
          </div>
        </div>

        <div className="pad-md" />

        <div className="split is-rev">
          <div className="split-text" data-reveal-stagger>
            <div className="split-head">
              <h3 className="h4 balance" data-reveal>
                {second.title}
              </h3>
              <div className="flex flex-col gap-4 ink-70" data-reveal>
                {second.body.map((p) => (
                  <p key={p} className="pretty">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            {second.cta && (
              <div data-reveal>
                <a className="btn" data-magnetic {...ctaProps(second.cta.href)}>
                  <Icon name="github" className="h-4 w-4" />
                  <span>{second.cta.label}</span>
                </a>
              </div>
            )}
          </div>
          <div className="split-figure is-rev">
            <UiFigure variant={second.figure as Shot} pair="b" />
          </div>
        </div>

        <div className="pad-sm" />
        <div className="pad-lg" />
      </div>
    </section>
  )
}

function UiFigure({ variant, pair }: { variant: Shot; pair: 'a' | 'b' }) {
  const [lead, trail] = FIGURE_CARDS[pair]
  const [topCls, bottomCls] = pair === 'a' ? ['is-1', 'is-2'] : ['is-3', 'is-4']
  return (
    <div className="relative w-full">
      <div className={`ui-card ${topCls} [container-type:inline-size]`} data-parallax="-0.08">
        <div style={{ fontSize: 'calc(100cqw / 32)' }}>
          <BreakoutCard title={lead.title} rows={[...lead.rows]} />
        </div>
      </div>
      <div className={`ui-card ${bottomCls} [container-type:inline-size]`} data-parallax="0.06">
        <div style={{ fontSize: 'calc(100cqw / 32)' }}>
          <BreakoutCard title={trail.title} rows={[...trail.rows]} />
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--line-12)] bg-ground [container-type:inline-size]" data-reveal="scale">
        <div className="aspect-square text-[1.35cqw]">
          <StudioMock variant={variant} />
        </div>
        <div className="img-overlay is-diag" aria-hidden="true" />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- mission ---*/

export function Mission() {
  return (
    <section id="mission" className="relative">
      <div className="shell">
        <div className="pad-lg" />
        <Badge>{mission.badge}</Badge>
        <div className="intro">
          <h2 className="h2 balance" data-reveal="words">
            {mission.title}
          </h2>
          <h3 className="h5" data-reveal>
            {mission.lead}
          </h3>
          <div className="intro-split" data-reveal-stagger>
            {mission.cols.map((c) => (
              <p key={c} className="intro-p pretty" data-reveal>
                {c}
              </p>
            ))}
          </div>
        </div>
        <div className="spacer-xl" />

        <div className="mission" data-reveal-stagger>
          {mission.cards.map((c) => (
            <div key={c.title} className="mission-card" data-reveal>
              <span className="mission-icon">
                <Icon name={c.icon} className="h-6 w-6" />
              </span>
              <div className="mission-text">
                <h3 className="h5">{c.title}</h3>
                <p className="ink-70 pretty">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pad-lg" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ roadmap CTA ---*/

export function RoadmapCta() {
  return (
    <section id="roadmap" className="shell">
      <div className="roadmap" data-reveal="scale">
        <div className="roadmap-content">
          <div className="roadmap-text" data-reveal-stagger>
            <h2 className="h2 balance" data-reveal="words">
              {roadmapCta.title}
            </h2>
            <p className="h5" data-reveal>
              {roadmapCta.sub}
            </p>
            <p className="ink-70 pretty" data-reveal>
              {roadmapCta.body}
            </p>
            <div className="spacer-md w-full" data-reveal>
              <EmailCapture placeholder={roadmapCta.placeholder} action={roadmapCta.action} center />
            </div>
          </div>
        </div>
        <div className="roadmap-bg" aria-hidden="true">
          <div className="h-full w-[110%] max-w-none" data-parallax="-0.06">
            <WorldDots className="h-full w-full text-[#3d3d3d]" />
          </div>
        </div>
      </div>
      <div className="pad-lg" />
    </section>
  )
}

/* ----------------------------------------------------------------- stats ---*/

export function Stats() {
  return (
    <section id="stats" className="relative rule-clip">
      <div className="shell">
        <div className="intro">
          <h2 className="h2 max-xl balance" data-reveal="words">
            {stats.title}
          </h2>
        </div>
        <div className="spacer-lg" />
        <div className="hairline" data-line />
        <div className="spacer-xl" />

        <div className="split is-contact">
          <div className="stats flex-1" data-reveal-stagger>
            {stats.figures.map((f) => (
              <div key={f.value} className="stat" data-reveal>
                <div className="h3" data-counter>
                  {f.value}
                </div>
                <p className="ink-70 pretty">{f.label}</p>
              </div>
            ))}
          </div>
          <div className="split-figure is-rev">
            <div className="split-shot [container-type:inline-size]" data-reveal="scale" data-parallax="0.05">
              <div className="aspect-[4/3] text-[1cqw]">
                <StudioMock variant="settings" />
              </div>
              <div className="img-overlay is-vert" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="pad-lg" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------- contact + footer ---*/

export function Contact() {
  return (
    <section id="contact" className="relative">
      <div className="shell">
        <div className="pad-lg" />
        <div className="contact-grid">
          <div className="contact-details" data-reveal-stagger>
            <div className="contact-head">
              <h2 className="h1" data-reveal="words">
                {contact.title}
              </h2>
              <p className="pretty" data-reveal>
                {contact.body}
              </p>
            </div>

            <div className="flex flex-col gap-8" data-reveal>
              <p className="contact-col-heading">{contact.quickTitle}</p>
              <div className="flex flex-col gap-6">
                {contact.quick.map((q) => (
                  <a
                    key={q.label}
                    href={q.href}
                    target={q.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="contact-link"
                  >
                    <span className="contact-icon">
                      <Icon name={q.kind} className="h-5 w-5" />
                    </span>
                    {q.label}
                  </a>
                ))}
              </div>
              <div className="contact-copyright">
                <span className="grid h-12 w-12 place-items-center text-mark">
                  <Mark className="h-10 w-10" />
                </span>
                <p className="text-small ink-70">
                  © {new Date().getFullYear()} {site.name}. All rights reserved. · {site.version}
                </p>
              </div>
            </div>
          </div>

          <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()} data-reveal-stagger>
            <div className="form-2col">
              {contact.fields.map((f) => (
                <label key={f.name} className="block" data-reveal>
                  <span className="field-label">
                    {f.label}
                    {f.required && ' *'}
                  </span>
                  <input name={f.name} type={f.type} required={f.required} placeholder="Type here" className="input" />
                </label>
              ))}
            </div>
            <label className="block" data-reveal>
              <span className="field-label">{contact.message} *</span>
              <textarea name="message" required rows={6} placeholder="Type here" className="input is-area" />
            </label>
            <div data-reveal>
              <button type="submit" className="btn" data-magnetic>
                <span>{contact.send}</span>
              </button>
            </div>
          </form>
        </div>

        <footer className="footer-legal pb-10">
          {contact.legal.map((l) => (
            <a key={l.label} href={l.href} className="text-small">
              {l.label}
            </a>
          ))}
        </footer>
      </div>
    </section>
  )
}
