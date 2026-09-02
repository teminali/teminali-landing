import { Badge, SectionHead, Icon, EmailCapture, WorldDots } from '@/components/ui'
import { StudioMock, BreakoutCard } from '@/components/StudioMock'
import {
  compare,
  midCta,
  about,
  mission,
  roadmapCta,
  stats,
  contact,
  site,
} from '@/content/site'

/* --------------------------------------------------------------- compare ---*/

export function Compare() {
  return (
    <section id="compare" className="relative py-32 md:py-44">
      <div className="shell">
        <Badge>{compare.badge}</Badge>
        <div className="mx-auto mt-16 max-w-2xl text-center" data-reveal-stagger>
          <h2 className="text-h2 font-light text-ink-bright balance" data-reveal>
            {compare.title}
          </h2>
          <p className="mt-4 text-lead text-ink-dim" data-reveal>
            {compare.sub}
          </p>
          <p className="mx-auto mt-4 max-w-lg text-body text-ink-soft pretty" data-reveal>
            {compare.body}
          </p>
        </div>

        <div className="mt-20 grid gap-5 lg:grid-cols-2" data-reveal-stagger>
          <Column
            title={site.name}
            icon="check"
            tone="var(--success)"
            items={compare.ours}
            lead
          />
          <Column title="Cloud-only assistants" icon="cross" tone="var(--danger)" items={compare.theirs} />
        </div>
      </div>
    </section>
  )
}

function Column({
  title,
  icon,
  tone,
  items,
  lead = false,
}: {
  title: string
  icon: string
  tone: string
  items: string[]
  lead?: boolean
}) {
  return (
    <div
      className={`card p-8 md:p-10 ${lead ? 'border-line-strong bg-surface-sunken' : ''}`}
      data-reveal
    >
      <h3 className="text-h3 font-light text-ink-bright">{title}</h3>
      <ul className="mt-8">
        {items.map((t, i) => (
          <li key={t} className={`flex gap-4 py-5 ${i ? 'border-t border-line' : ''}`}>
            <span className="plate" style={{ color: tone }}>
              <Icon name={icon} />
            </span>
            <span className={`text-body pretty ${lead ? 'text-ink-body' : 'text-ink-soft'}`}>
              {t}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------------------------------------------------------------- mid CTA ---*/

export function MidCta() {
  return (
    <section id="midcta" className="relative overflow-hidden border-y border-line py-28">
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
        <WorldDots className="h-full w-full text-[#565656]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(21,21,21,0.95)_0%,rgba(21,21,21,0)_18%,rgba(21,21,21,0)_82%,rgba(21,21,21,0.95)_100%)]"
        aria-hidden="true"
      />
      <div className="shell relative text-center" data-reveal-stagger>
        <h2 className="text-h2 font-light text-ink-bright balance" data-reveal>
          {midCta.title}
        </h2>
        <p className="mt-5 text-lead text-ink-soft" data-reveal>
          {midCta.body}
        </p>
        <div className="mt-9" data-reveal>
          <EmailCapture placeholder={midCta.placeholder} action={midCta.action} />
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- about ---
   Two image/text rows. The reference floats UI cards over the photo so they
   break its bounding box; ours float over a product frame instead. */

export function About() {
  const [first, second] = about.rows
  return (
    <section id="about" className="relative py-32 md:py-44">
      <div className="shell">
        <SectionHead badge={about.badge} title={about.title} body={about.body} align="center" />

        <div className="mt-24 grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <div data-reveal-stagger>
            <h3 className="text-h3 font-light text-ink-bright balance" data-reveal>
              {first.title}
            </h3>
            {first.body.map((p) => (
              <p key={p} className="mt-5 max-w-md text-body text-ink-soft pretty" data-reveal>
                {p}
              </p>
            ))}
            <ul className="mt-8 flex flex-col gap-3" data-reveal>
              {first.bullets?.map((b) => (
                <li key={b} className="flex items-start gap-3 text-body text-ink-soft">
                  <span className="mt-[10px] h-px w-4 shrink-0 bg-line-strong" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <FramedFigure variant="verify" cardSide="top" />
        </div>

        <div className="mt-28 grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <FramedFigure variant="run" cardSide="bottom" />
          <div data-reveal-stagger>
            <h3 className="text-h3 font-light text-ink-bright balance" data-reveal>
              {second.title}
            </h3>
            {second.body.map((p) => (
              <p key={p} className="mt-5 max-w-md text-body text-ink-soft pretty" data-reveal>
                {p}
              </p>
            ))}
            {second.cta && (
              <a
                className="btn btn-primary mt-9"
                href={second.cta.href}
                target="_blank"
                rel="noreferrer"
                data-reveal
              >
                <Icon name="github" className="h-4 w-4" />
                {second.cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** The reference's photos carry floating UI cards over both the top and the
 *  bottom edge, so the frame never reads as a closed rectangle. */
const FIGURE_CARDS = {
  verify: [
    { title: 'Verify', rows: ['Types clean', 'Tests 610/610', 'Build passed'] },
    { title: 'Runtimes', rows: ['typecheck · unit', 'core · build', 'lint'] },
  ],
  run: [
    { title: 'Plan', rows: ['Spec read', 'Dispatcher found', 'Diff staged'] },
    { title: 'Run', rows: ['Editing 4 files', 'Tests queued', 'Local · 32B'] },
  ],
  route: [
    { title: 'Lanes', rows: ['Flash · local', 'Auto · balanced', 'Max · deep'] },
    { title: 'Budget', rows: ['04:12 elapsed', '18k tokens', 'Under cap'] },
  ],
} as const

function FramedFigure({
  variant,
  cardSide,
}: {
  variant: 'run' | 'route' | 'verify'
  cardSide: 'top' | 'bottom'
}) {
  const [a, b] = FIGURE_CARDS[variant]
  const lead = cardSide === 'top' ? a : b
  const trail = cardSide === 'top' ? b : a
  return (
    <div className="relative" data-reveal>
      <div className="[container-type:inline-size]">
        <div className="aspect-[4/3] overflow-hidden rounded-card border border-line-strong bg-ground text-[1cqw]">
          <StudioMock variant={variant} />
        </div>
      </div>
      <div
        className={`absolute -top-8 text-[5px] ${cardSide === 'top' ? 'right-6' : 'left-8'}`}
      >
        <BreakoutCard title={lead.title} rows={[...lead.rows]} />
      </div>
      <div
        className={`absolute -bottom-8 text-[5px] ${cardSide === 'top' ? 'left-8' : 'right-6'}`}
      >
        <BreakoutCard title={trail.title} rows={[...trail.rows]} />
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- mission ---*/

export function Mission() {
  return (
    <section id="mission" className="relative py-32 md:py-44">
      <div className="shell">
        <Badge>{mission.badge}</Badge>
        <div className="mt-16 max-w-4xl" data-reveal-stagger>
          <h2 className="text-h2 font-light text-ink-bright balance" data-reveal>
            {mission.title}
          </h2>
          <p className="mt-7 text-[20px] font-medium text-ink-bright" data-reveal>
            {mission.lead}
          </p>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16" data-reveal-stagger>
          {mission.cols.map((c) => (
            <p key={c} className="text-body text-ink-soft pretty" data-reveal>
              {c}
            </p>
          ))}
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3" data-reveal-stagger>
          {mission.cards.map((c) => (
            <div key={c.title} className="card p-8" data-reveal>
              <span className="plate">
                <Icon name={c.icon} />
              </span>
              <h3 className="mt-7 text-[17px] font-medium text-ink-bright">{c.title}</h3>
              <p className="mt-4 text-body text-ink-soft pretty">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ roadmap CTA ---*/

export function RoadmapCta() {
  return (
    <section id="roadmap" className="shell py-16">
      <div className="card relative overflow-hidden px-8 py-20 md:px-16" data-reveal>
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <WorldDots className="h-full w-full text-[#565656]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(21,21,21,0.95)_0%,rgba(21,21,21,0)_20%,rgba(21,21,21,0)_80%,rgba(21,21,21,0.95)_100%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="text-h2 font-light text-ink-bright balance">{roadmapCta.title}</h2>
          <p className="mt-4 text-lead text-ink-dim">{roadmapCta.sub}</p>
          <p className="mx-auto mt-5 max-w-md text-body text-ink-soft pretty">{roadmapCta.body}</p>
          <div className="mt-9">
            <EmailCapture placeholder={roadmapCta.placeholder} action={roadmapCta.action} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- stats ---*/

export function Stats() {
  return (
    <section id="stats" className="relative py-32 md:py-44">
      <div className="shell">
        <h2 className="max-w-2xl text-h2 font-light text-ink-bright balance" data-reveal>
          {stats.title}
        </h2>
      </div>

      <div className="mt-16 grid items-start gap-14 lg:grid-cols-2 lg:gap-0">
        <div className="lg:ml-[calc(var(--gutter)*-1)]" data-reveal>
          {/* 16:10 until the two-column split, where the panel instead stretches
              to the height of the stat grid beside it. A flat min-height at
              mobile widths left the mock with a third of the panel empty. */}
          {/* A fixed 16:10 at every width, not stretched to the stat grid: the
              grid is much taller than the mock at 1024 and the panel ran a
              third empty. Spec row 12 wants a photo beside the grid, and a
              photo keeps its own aspect. */}
          <div className="[container-type:inline-size]">
            <div className="aspect-[16/10] overflow-hidden border border-line-strong border-l-0 bg-ground text-[1cqw] lg:rounded-r-card">
              <StudioMock variant="verify" />
            </div>
          </div>
        </div>

        <div className="shell lg:pl-16" data-reveal-stagger>
          <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2">
            {stats.figures.map((f) => (
              <div key={f.value} data-reveal>
                <div className="text-[38px] font-extralight leading-none tracking-tight text-ink-bright">
                  {f.value}
                </div>
                <p className="mt-4 text-body text-ink-soft pretty">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- contact + footer ---*/

export function Contact() {
  return (
    <section id="contact" className="relative border-t border-line pt-28">
      <div className="shell">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div data-reveal-stagger>
            <h2 className="text-display font-extralight tracking-tight text-ink-bright" data-reveal>
              {contact.title}
            </h2>
            <p className="mt-6 max-w-sm text-body text-ink-soft pretty" data-reveal>
              {contact.body}
            </p>

            <div className="mt-14" data-reveal>
              <p className="kicker">Direct</p>
              <div className="mt-6 flex flex-col gap-4">
                {contact.quick.map((q) => (
                  <a
                    key={q.label}
                    href={q.href}
                    target={q.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="flex items-center gap-3 text-body text-ink-body transition-colors duration-150 ease-brand hover:text-accent"
                  >
                    <span className="plate">
                      <Icon name={q.kind} />
                    </span>
                    {q.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-14 flex items-center gap-4 border-t border-line pt-8" data-reveal>
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-line-strong text-mark">
                <svg
                  viewBox="0 0 32 32"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6.56 12.13 10.06 16 6.56 19.88" />
                  <path d="M12.25 19.88h7.5" />
                  <path d="M25.44 12.13 21.94 16 25.44 19.88" />
                </svg>
              </span>
              <div>
                <p className="text-[14px] font-medium tracking-tight text-ink-bright">{site.name}</p>
                <p className="mt-1 text-micro text-ink-ghost">
                  © {new Date().getFullYear()} · {site.version}
                </p>
              </div>
            </div>
          </div>

          <form
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
            data-reveal-stagger
          >
            {contact.fields.map((f) => (
              <label key={f.name} className="flex flex-col gap-2" data-reveal>
                <span className="text-micro text-ink-soft">
                  {f.label}
                  {f.required && <span className="text-ink-ghost"> *</span>}
                </span>
                <input
                  name={f.name}
                  type={f.type}
                  required={f.required}
                  placeholder="Type here"
                  className="h-11 rounded-ctl border border-line-strong bg-surface px-4 text-[14px] outline-none transition-colors duration-150 ease-brand focus:border-line-popover"
                />
              </label>
            ))}
            <label className="flex flex-col gap-2 sm:col-span-2" data-reveal>
              <span className="text-micro text-ink-soft">
                Message<span className="text-ink-ghost"> *</span>
              </span>
              <textarea
                name="message"
                required
                rows={6}
                placeholder="Type here"
                className="resize-y rounded-ctl border border-line-strong bg-surface px-4 py-3 text-[14px] outline-none transition-colors duration-150 ease-brand focus:border-line-popover"
              />
            </label>
            <div className="sm:col-span-2" data-reveal>
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </div>
          </form>
        </div>

        <footer className="mt-28 border-t border-line py-10">
          <nav className="flex flex-wrap items-center justify-center gap-8">
            {contact.legal.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-micro text-ink-ghost transition-colors duration-150 ease-brand hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </footer>
      </div>
    </section>
  )
}
