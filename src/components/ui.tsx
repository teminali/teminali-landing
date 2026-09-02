import { useEffect, useRef, useState } from 'react'
import { scrollToSection } from '@/lib/motion'
import { nav, site } from '@/content/site'
import { linkProps, navigate, useRoute } from '@/lib/route'

/* ---------------------------------------------------------------- icons ---
   Hand-rolled, 20px grid, 1.5 stroke. An icon library would be 40 KB to draw
   fourteen shapes. */

const paths: Record<string, string> = {
  play: 'M8 5.5 15.5 10 8 14.5z',
  route: 'M4 6h4a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3h2M4 6l2-2M4 6l2 2M16 14l-2-2M16 14l-2 2',
  check: 'M4.5 10.5 8 14l7.5-8',
  stack: 'M10 3 3 6.5 10 10l7-3.5zM3 10.5 10 14l7-3.5M3 14 10 17.5 17 14',
  chart: 'M4 16V9M8.5 16V5M13 16v-4.5M17 16V7',
  mic: 'M10 3a2.2 2.2 0 0 1 2.2 2.2v4.4a2.2 2.2 0 1 1-4.4 0V5.2A2.2 2.2 0 0 1 10 3ZM5 9.4a5 5 0 0 0 10 0M10 14.4V17',
  eye: 'M2.5 10S5.5 5 10 5s7.5 5 7.5 5-3 5-7.5 5-7.5-5-7.5-5Z M10 8.2A1.8 1.8 0 1 0 10 11.8 1.8 1.8 0 1 0 10 8.2Z',
  term: 'M3.5 4.5h13v11h-13zM6 8.5l2.2 2L6 12.5M10.5 12.5h4',
  shield: 'M10 3 4.5 5.2v4.3c0 3.3 2.3 6.3 5.5 7.5 3.2-1.2 5.5-4.2 5.5-7.5V5.2z',
  cross: 'M6 6l8 8M14 6l-8 8',
  mail: 'M3 5.5h14v9H3zM3 6l7 5 7-5',
  github:
    'M10 2.5a7.5 7.5 0 0 0-2.4 14.6c.4.07.5-.16.5-.36v-1.4c-2 .4-2.5-.5-2.7-1-.1-.25-.5-1-.9-1.2-.3-.17-.75-.57 0-.58.7 0 1.2.65 1.37.92.8 1.35 2.08.97 2.6.74.07-.58.3-.97.56-1.2-1.95-.22-4-1-4-4.33 0-.95.34-1.74.9-2.35-.1-.22-.4-1.12.08-2.32 0 0 .73-.23 2.4.9a8.2 8.2 0 0 1 4.36 0c1.66-1.13 2.4-.9 2.4-.9.47 1.2.17 2.1.08 2.32.56.61.9 1.4.9 2.35 0 3.34-2.05 4.1-4 4.32.31.27.59.8.59 1.62v2.4c0 .2.13.44.52.36A7.5 7.5 0 0 0 10 2.5Z',
  arrow: 'M4 10h12M11.5 5.5 16 10l-4.5 4.5',
  download: 'M10 3.5v9M6 9l4 4 4-4M4 16.5h12',
  spark: 'M10 3v4M10 13v4M3 10h4M13 10h4M5.8 5.8l2.4 2.4M11.8 11.8l2.4 2.4M14.2 5.8l-2.4 2.4M8.2 11.8l-2.4 2.4',
}

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  const d = paths[name] ?? paths.spark
  const filled = name === 'play' || name === 'github'
  return (
    <svg
      viewBox="0 0 20 20"
      className={className || 'h-[18px] w-[18px]'}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

/* ------------------------------------------------------------ grid rules ---
   The drafting overlay. Two vertical hairlines on the gutters and one
   horizontal band, drawn over everything at very low alpha. It is the single
   device that makes the whole page feel like one drawing. */

export function GridOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <div className="mx-auto h-full w-full max-w-shell relative">
        <span className="absolute inset-y-0 left-gutter w-px bg-line-strong/50" />
        <span className="absolute inset-y-0 right-gutter w-px bg-line-strong/50" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-line/40 hidden lg:block" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- nav ---*/

export function Nav() {
  const route = useRoute()
  const onHome = route === '/'
  const [active, setActive] = useState<string>('')
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  /* The section targets only exist on the home page, so from any other route
     we navigate home first and scroll once React has committed it. */
  const goToSection = (id: string) => {
    setOpen(false)
    if (onHome) return scrollToSection(id)
    navigate('/')
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id)))
  }

  useEffect(() => {
    const ids = nav.map((n) => n.id)
    const onScroll = () => {
      setSolid(window.scrollY > 24)
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= window.innerHeight * 0.4) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ease-brand ${
        solid ? 'bg-ground/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="relative flex h-[var(--nav-h)] items-stretch border-b border-line-subtle">
        <a
          href="#top"
          className="grid w-[var(--nav-h)] place-items-center border-r border-line-subtle text-mark"
          aria-label={site.name}
        >
          <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.56 12.13 10.06 16 6.56 19.88" />
            <path d="M12.25 19.88h7.5" />
            <path d="M25.44 12.13 21.94 16 25.44 19.88" />
          </svg>
        </a>

        <div className="flex flex-1 items-center pl-5">
          <span className="whitespace-nowrap text-[15px] font-medium tracking-tight text-ink-bright">
            {site.name}
          </span>
        </div>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => goToSection(item.id)}
              className={`text-[13.5px] transition-colors duration-150 ease-brand ${
                active === item.id ? 'text-accent' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            {...linkProps('/downloads')}
            className={`text-[13.5px] transition-colors duration-150 ease-brand ${
              route === '/downloads' ? 'text-accent' : 'text-ink-soft hover:text-ink'
            }`}
          >
            Downloads
          </a>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-0 pr-0">
          {/* Under md the centred link row does not fit. Rather than drop the
              navigation entirely, it collapses into a bordered cell that
              matches the logo cell and opens a sheet under the bar. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-[var(--nav-h)] w-[var(--nav-h)] place-items-center border-l border-line-subtle text-ink-soft transition-colors duration-150 ease-brand hover:text-ink md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
              {open ? (
                <>
                  <path d="M5 5l14 14" />
                  <path d="M19 5L5 19" />
                </>
              ) : (
                <>
                  <path d="M3.5 8h17" />
                  <path d="M3.5 16h17" />
                </>
              )}
            </svg>
          </button>
          <a
            {...linkProps('/downloads')}
            className="relative z-10 flex h-[calc(var(--nav-h)+14px)] items-center gap-2 self-start bg-accent px-4 text-[13px] font-medium text-ground transition-colors duration-150 ease-brand hover:bg-accent-hover sm:px-7 sm:text-[13.5px]"
          >
            <Icon name="download" className="h-4 w-4" />
            {/* Under 360px the logo cell, wordmark, menu and a labelled CTA do
                not all fit and the wordmark wraps to two lines. The icon alone
                still reads in a corner CTA. */}
            <span className="hidden min-[360px]:inline">Download</span>
          </a>
        </div>
      </div>

      {open && (
        <nav
          className="border-b border-line-subtle bg-ground md:hidden"
          aria-label="Sections"
        >
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => goToSection(item.id)}
              className={`block w-full border-b border-line-subtle px-5 py-3.5 text-left font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-150 ease-brand last:border-b-0 ${
                active === item.id ? 'text-accent' : 'text-ink-soft'
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            {...linkProps('/downloads')}
            onClickCapture={() => setOpen(false)}
            className={`block w-full border-b border-line-subtle px-5 py-3.5 text-left font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-150 ease-brand last:border-b-0 ${
              route === '/downloads' ? 'text-accent' : 'text-ink-soft'
            }`}
          >
            Downloads
          </a>
        </nav>
      )}
    </header>
  )
}

/* --------------------------------------------------------------- section ---*/

/** Pill badge centred on a full-bleed hairline. */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex justify-center" data-reveal>
      <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <span className="pill relative">{children}</span>
    </div>
  )
}

export function SectionHead({
  badge,
  title,
  body,
  align = 'left',
}: {
  badge: string
  title: string
  body?: string
  align?: 'left' | 'center'
}) {
  const c = align === 'center'
  return (
    <>
      <Badge>{badge}</Badge>
      <div
        className={`mt-16 ${c ? 'mx-auto max-w-3xl text-center' : 'max-w-4xl'}`}
        data-reveal-stagger
      >
        <h2 className="text-h2 text-ink-bright balance" data-reveal>
          {title}
        </h2>
        {body && (
          <p
            className={`mt-6 text-lead text-ink-soft pretty ${c ? '' : 'max-w-xl'}`}
            data-reveal
          >
            {body}
          </p>
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------------ email form ---*/

export function EmailCapture({
  placeholder,
  action,
}: {
  placeholder: string
  action: string
}) {
  const [sent, setSent] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <form
      className="mx-auto flex w-full max-w-md overflow-hidden rounded-ctl border border-line-strong bg-surface"
      onSubmit={(e) => {
        e.preventDefault()
        if (!ref.current?.value) return
        setSent(true)
      }}
    >
      <input
        ref={ref}
        type="email"
        required
        placeholder={placeholder}
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[13px] outline-none sm:px-4 sm:text-[14px]"
      />
      <button
        type="submit"
        className="shrink-0 bg-accent px-4 text-[13px] font-medium text-ground transition-colors duration-150 ease-brand hover:bg-accent-hover sm:px-5 sm:text-[14px]"
      >
        {sent ? 'Thanks' : action}
      </button>
    </form>
  )
}

/* ------------------------------------------------------- dot-matrix world ---
   The reference puts a dotted world map behind both mid-page CTAs. Rather than
   ship a raster, the continents are coarse lon/lat polygons and the dots are a
   regular grid in screen space tested against them — so the spacing stays even
   and the whole thing is one <path> node, not two thousand circles. */

const LAND: [number, number][][] = [
  // North America
  [[-168, 65], [-155, 71], [-130, 70], [-110, 68], [-95, 70], [-80, 73], [-65, 60],
   [-53, 48], [-65, 44], [-70, 41], [-76, 36], [-80, 25], [-90, 29], [-97, 26],
   [-98, 19], [-105, 20], [-114, 23], [-117, 32], [-124, 40], [-125, 48],
   [-135, 58], [-150, 59], [-165, 62]],
  // Central America
  [[-92, 17], [-84, 10], [-78, 8], [-83, 15], [-88, 18]],
  // Greenland
  [[-45, 60], [-52, 68], [-58, 75], [-45, 83], [-25, 82], [-20, 72], [-30, 65]],
  // South America
  [[-81, 8], [-76, 10], [-60, 11], [-52, 5], [-35, -5], [-38, -13], [-48, -25],
   [-58, -34], [-62, -40], [-65, -45], [-68, -52], [-75, -52], [-73, -45],
   [-71, -30], [-70, -18], [-81, -6]],
  // Africa
  [[-17, 21], [-10, 27], [0, 31], [10, 37], [20, 32], [32, 31], [37, 22], [43, 12],
   [51, 12], [41, -1], [40, -11], [35, -22], [28, -33], [18, -35], [12, -16],
   [9, 0], [5, 5], [-5, 5], [-14, 11], [-17, 15]],
  // Madagascar
  [[43, -13], [50, -16], [48, -25], [44, -22]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 48], [2, 51], [8, 54], [10, 58], [15, 62], [22, 66],
   [30, 70], [40, 66], [45, 55], [40, 47], [30, 45], [28, 40], [23, 36], [15, 38],
   [12, 45], [3, 42], [-2, 37]],
  // British Isles
  [[-7, 50], [-2, 53], [-3, 58], [-7, 57]],
  // Asia
  [[45, 55], [50, 68], [70, 73], [90, 75], [105, 78], [130, 73], [150, 70],
   [160, 62], [163, 55], [140, 50], [135, 43], [127, 38], [122, 30], [110, 20],
   [105, 10], [100, 3], [95, 15], [90, 22], [85, 20], [80, 8], [72, 22], [65, 25],
   [58, 25], [50, 30], [45, 40]],
  // Japan
  [[131, 32], [138, 35], [142, 41], [146, 45], [143, 44], [138, 37], [133, 33]],
  // Indonesia and the archipelago
  [[95, 5], [105, -6], [118, -8], [130, -3], [141, -6], [138, 1], [120, 2], [105, 3]],
  // Australia
  [[113, -22], [114, -33], [120, -34], [129, -32], [137, -35], [140, -38],
   [147, -38], [150, -33], [153, -27], [146, -19], [142, -11], [132, -11],
   [127, -14], [122, -17]],
  // New Zealand
  [[172, -41], [175, -37], [178, -38], [174, -42], [170, -46], [166, -46]],
]

const MAP_W = 1200
const MAP_H = 560
const STEP = 10
const LAT_TOP = 80
const LAT_BOTTOM = -58

function inside(x: number, y: number, poly: [number, number][]) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

/** Built once at module load: ~1.4k points, emitted as a single path. */
const WORLD_D = (() => {
  const out: string[] = []
  for (let py = STEP / 2; py < MAP_H; py += STEP) {
    const lat = LAT_TOP - (py / MAP_H) * (LAT_TOP - LAT_BOTTOM)
    for (let px = STEP / 2; px < MAP_W; px += STEP) {
      const lon = (px / MAP_W) * 360 - 180
      if (LAND.some((poly) => inside(lon, lat, poly))) out.push(`M${px} ${py}h.01`)
    }
  }
  return out.join('')
})()

export function WorldDots({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      <path
        d={WORLD_D}
        stroke="currentColor"
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
