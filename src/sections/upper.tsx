import { Badge, SectionHead, Icon, EmailCapture } from '@/components/ui'
import { StudioMock } from '@/components/StudioMock'
import { linkProps } from '@/lib/route'
import { platform, studio, demoCta, process as flow, site } from '@/content/site'

/* --------------------------------------------------------------- platform ---
   Three alternating rows. The figure always bleeds off one edge — that break
   out of the gutter is what stops the page reading as a stack of boxes. */

const FIGURES = { studio: 'run', gateway: 'route', verify: 'verify' } as const

export function Platform() {
  return (
    <section id="platform" className="section-lg relative">
      <div className="shell">
        <SectionHead badge={platform.badge} title={platform.title} body={platform.body} />
      </div>

      <div className="mt-24 flex flex-col gap-28 md:gap-40">
        {platform.rows.map((row, i) => {
          const right = i % 2 === 0
          return (
            <div key={row.kicker} className="shell">
              <div
                className={`grid items-center gap-14 lg:grid-cols-2 lg:gap-20 ${
                  right ? '' : 'lg:[&>*:first-child]:order-2'
                }`}
              >
                <div data-reveal-stagger>
                  <p className="kicker" data-reveal>
                    {row.kicker}
                  </p>
                  <h3 className="mt-5 text-h3 text-ink-bright balance" data-reveal>
                    {row.title}
                  </h3>
                  <p className="mt-5 max-w-md text-body text-ink-soft pretty" data-reveal>
                    {row.body}
                  </p>

                  <ul className="mt-10 max-w-md">
                    {row.points.map((p, j) => (
                      <li
                        key={p}
                        className={`flex gap-4 py-5 ${j ? 'border-t border-line' : ''}`}
                        data-reveal
                      >
                        <span className="plate">
                          <Icon name={['shield', 'route', 'check'][j]} />
                        </span>
                        <span className="text-body text-ink-body pretty">{p}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    className="btn btn-ghost mt-8"
                    data-reveal
                    {...(row.cta.href.startsWith('http')
                      ? { href: row.cta.href, target: '_blank', rel: 'noreferrer' }
                      : linkProps(row.cta.href))}
                  >
                    {row.cta.label}
                    <Icon name="arrow" className="h-4 w-4" />
                  </a>
                </div>

                <Figure variant={FIGURES[row.figure as keyof typeof FIGURES]} side={right ? 'right' : 'left'} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Figure({
  variant,
  side,
}: {
  variant: 'run' | 'route' | 'verify'
  side: 'left' | 'right'
}) {
  return (
    <div
      className={`relative ${
        side === 'right'
          ? 'lg:mr-[calc(var(--gutter)*-1-6rem)]'
          : 'lg:ml-[calc(var(--gutter)*-1-6rem)]'
      }`}
      data-reveal
    >
      <div className="dotfield absolute -inset-6 -z-10 opacity-40" aria-hidden="true" />
      {/* Every mock sizes itself in `em` against `1em = 1% of the frame width`.
          Stepped `text-[Npx]` values only held that at the width they were
          picked for — at 768 this frame ran 31% under. A container query solves
          it once, at every width. */}
      <div className="[container-type:inline-size]">
        <div
          className={`aspect-[16/10] overflow-hidden border border-line-strong bg-ground text-[1cqw] ${
            side === 'right' ? 'rounded-l-card' : 'rounded-r-card'
          }`}
        >
          <StudioMock variant={variant} />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- hub ---
   The reference's radial module hub: filled concentric rings at the centre with
   icon tiles orbiting it. Ours is achromatic — the rings are borders, not fills. */

export function Studio() {
  const n = studio.modules.length
  return (
    <section id="studio" className="section-lg relative">
      <div className="shell">
        <SectionHead badge={studio.badge} title={studio.title} body={studio.body} />

        <div className="relative mx-auto mt-24 hidden aspect-square w-full max-w-[620px] md:block">
          {[1, 0.74, 0.48, 0.26].map((s, i) => (
            <span
              key={s}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
              style={{
                width: `${s * 100}%`,
                height: `${s * 100}%`,
                background: i === 3 ? 'var(--surface-raised)' : 'transparent',
              }}
            />
          ))}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-mono text-[12px] uppercase tracking-[0.18em] text-ink-muted">
            Studio
          </span>

          {studio.modules.map((m, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2
            return (
              <div
                key={m.label}
                className="absolute flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                style={{
                  left: `${50 + Math.cos(a) * 43}%`,
                  top: `${50 + Math.sin(a) * 43}%`,
                }}
                data-reveal
              >
                <span className="grid h-14 w-14 place-items-center rounded-card border border-line-strong bg-surface text-ink-dim transition-colors duration-200 ease-brand hover:border-line-popover hover:text-accent">
                  <Icon name={m.icon} className="h-5 w-5" />
                </span>
                <span className="text-center text-micro text-ink-soft">{m.label}</span>
              </div>
            )
          })}
        </div>

        {/* Under the hub breakpoint the ring becomes a plain grid — but the
            concentric rings stay behind it, so the section still reads as the
            radial hub spec row 4 asks for rather than a generic tile grid. */}
        <div className="mt-16 md:hidden">
          {/* Rings behind the tiles only showed through the gaps and read as
              stray hairlines, so the motif sits above the grid instead: the
              same concentric core the desktop ring is built around. */}
          <div className="relative mx-auto aspect-square w-[186px]" data-reveal aria-hidden="true">
            {[1, 0.74, 0.48, 0.26].map((s, i) => (
              <span
                key={s}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line"
                style={{
                  width: `${s * 100}%`,
                  height: `${s * 100}%`,
                  background: i === 3 ? 'var(--surface-raised)' : 'transparent',
                }}
              />
            ))}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Studio
            </span>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4" data-reveal-stagger>
            {studio.modules.map((m) => (
              <div key={m.label} className="card flex flex-col items-center gap-3 p-5" data-reveal>
                <span className="plate">
                  <Icon name={m.icon} />
                </span>
                <span className="text-center text-micro text-ink-soft">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- demo CTA ---*/

export function DemoCta() {
  return (
    <section id="demo" className="shell pb-[8.5rem]">
      <div className="card relative overflow-hidden px-8 py-20 md:px-16" data-reveal>
        {/* Tilted screenshot collage, exactly the reference's device. */}
        {/* Achromatic mocks on an achromatic card would vanish, so the collage
            is brightened and then knocked back with opacity: the panel edges
            and the type survive, the near-black fills do not. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5] [filter:brightness(2.6)_contrast(1.05)]"
          aria-hidden="true"
        >
          {[
            {
              v: 'route',
              pos: '-right-[14%] top-[1%] w-[62%] md:-right-[6%] md:-top-[26%] md:w-[56%]',
            },
            {
              v: 'verify',
              pos: '-left-[12%] bottom-[1%] w-[60%] md:-bottom-[34%] md:-left-[3%] md:w-[50%]',
            },
            {
              v: 'run',
              pos: 'left-[24%] -top-[13%] w-[54%] md:left-[27%] md:-top-[46%] md:w-[46%]',
            },
          ].map(({ v, pos }) => (
            <div
              key={v}
              className={`absolute ${pos} rotate-[-15deg] overflow-hidden rounded-card border border-line-strong text-[3px] md:text-[4px]`}
            >
              <div className="aspect-[16/10]">
                <StudioMock variant={v as 'run' | 'route' | 'verify'} />
              </div>
            </div>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_54%_at_50%_50%,rgba(21,21,21,0.94)_0%,rgba(21,21,21,0.5)_72%,rgba(21,21,21,0)_100%)] md:bg-[radial-gradient(ellipse_52%_88%_at_50%_50%,rgba(21,21,21,0.94)_0%,rgba(21,21,21,0.45)_70%,rgba(21,21,21,0)_100%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-xl text-center">
          <h2 className="text-h2 text-ink-bright balance">{demoCta.title}</h2>
          <p className="mx-auto mt-5 max-w-md text-body text-ink-soft pretty">{demoCta.body}</p>
          <div className="mt-9">
            <EmailCapture placeholder={demoCta.placeholder} action={demoCta.action} />
          </div>
          <p className="mt-4 font-mono text-[11px] text-ink-ghost">
            {site.version} · macOS · runs offline
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- process ---*/

export function Process() {
  return (
    <section id="process" className="section-lg relative">
      <div className="shell">
        <Badge>{flow.badge}</Badge>
        <div className="mx-auto mt-16 max-w-2xl text-center" data-reveal-stagger>
          <h2 className="text-h2 text-ink-bright balance" data-reveal>
            {flow.title}
          </h2>
          <p className="mt-5 text-lead text-ink-soft pretty" data-reveal>
            {flow.body}
          </p>
        </div>

        <div className="mt-24 grid gap-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-10" data-reveal-stagger>
          {flow.steps.map((s) => (
            <div key={s.n} data-reveal>
              <div className="flex items-center gap-5">
                <span className="font-mono text-[34px] font-light leading-none text-ink-ghost">
                  {s.n}
                  <span className="text-ink-dim">.</span>
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <h3 className="mt-7 text-h4 text-ink-bright balance">
                {s.title}
              </h3>
              {s.body.map((p) => (
                <p key={p} className="mt-4 text-body text-ink-soft pretty">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
