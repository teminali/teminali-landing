import { useEffect, useRef, useState } from 'react'
import { scrollToSection } from '@/lib/motion'
import { nav, site } from '@/content/site'
import { linkProps, navigate, useRoute } from '@/lib/route'

/* ---------------------------------------------------------------- icons ---
   Hand-rolled, 20px grid, 1.5 stroke. An icon library would be 40 KB to draw
   twenty shapes. */

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
  video: 'M3 5.5h10a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 3 5.5zm11.5 3 4-2.5v8l-4-2.5V8.5z',
  screen: 'M3 4.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 14v-8A1.5 1.5 0 0 1 3 4.5zm5 12h4m-2-1.5v1.5',
  browser: 'M3 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 15v-9A1.5 1.5 0 0 1 3 4.5zm0 3.5h14M5 6.25h.01M7.5 6.25h.01M10 6.25h.01',
  lock: 'M5.5 9V7a4.5 4.5 0 0 1 9 0v2M4 9h12v8H4z',
  clock: 'M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM10 6.5V10l2.5 1.5',
  cpu: 'M6 6h8v8H6zM8.5 8.5h3v3h-3zM10 2.5V6M10 14v3.5M2.5 10H6M14 10h3.5',
  git: 'M6 3.5v13M6 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM14 6.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM14 6.5c0 4-8 3-8 7M6 16.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  coins: 'M10 3.5c3.6 0 6.5 1 6.5 2.2S13.6 8 10 8 3.5 7 3.5 5.7 6.4 3.5 10 3.5zM3.5 5.7v8.6c0 1.2 2.9 2.2 6.5 2.2s6.5-1 6.5-2.2V5.7M3.5 10c0 1.2 2.9 2.2 6.5 2.2s6.5-1 6.5-2.2',
  film: 'M3.5 4.5h13v11h-13zM3.5 8h13M3.5 12h13M7 4.5v11M13 4.5v11',
  scissors: 'M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.6 8.8 16 3.5M7.6 11.2 16 16.5',
  wave: 'M2.5 10h2l1.5-4 2 8 2-8 2 6 1.5-2h4',
  linkedin: 'M5 8v7M5 5v.01M9 15V8m0 3.2c0-2 1-3.2 2.8-3.2 1.7 0 2.7 1.1 2.7 3.1V15',
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

/** The wordmark glyph, `>_<`. Coordinates are `public/favicon.svg` over 32. */
export function Mark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.56 12.13 10.06 16 6.56 19.88" />
      <path d="M12.25 19.88h7.5" />
      <path d="M25.44 12.13 21.94 16 25.44 19.88" />
    </svg>
  )
}

/* ------------------------------------------------------------ grid rules ---
   The drafting overlay: a hairline 4.5rem in from each edge — the width of
   the logo cell, so the cell's right border runs straight down the page —
   and one on the centre line. Drawn over everything at very low alpha. */

export function GridOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <span data-rule className="absolute top-0 h-full w-px bg-[var(--bg-lines)]" style={{ left: 'var(--rule)' }} />
      <span data-rule className="absolute top-0 h-full w-px bg-[var(--bg-lines)]" style={{ right: 'var(--rule)' }} />
      <span data-rule className="absolute left-1/2 top-0 hidden h-full w-px bg-[var(--bg-lines)] lg:block" />
    </div>
  )
}

/* -------------------------------------------------------------------- nav ---
   Reference chrome: a 4.5rem bar, the logo in a bordered 4.5rem cell flush to
   the left edge, a light Sora wordmark, a centred link row, and a solid CTA
   block welded into the corner at the full height of the bar. */

export function Nav() {
  const route = useRoute()
  const onHome = route === '/'
  const [active, setActive] = useState<string>('')
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
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = (on: boolean) =>
    `flex items-center justify-center p-4 font-medium tracking-[0.005em] transition-colors duration-200 ${
      on ? 'text-accent' : 'text-white hover:text-accent'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 overflow-hidden border-b border-[var(--bg-lines)] bg-ground/40 backdrop-blur-[16px]">
      <div
        id="nav-layout"
        className="grid h-[var(--nav-h)] grid-cols-[auto_1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]"
      >
        <a href="#top" className="flex h-full items-center" aria-label={site.name}>
          <span className="grid h-[var(--nav-h)] w-[var(--nav-h)] flex-none place-items-center border-r border-[var(--bg-lines)] px-3 text-mark lg:mr-6">
            <Mark className="h-9 w-9" />
          </span>
          <span className="hidden whitespace-nowrap font-display text-[1.5rem] font-light leading-[1.3] text-white lg:block">
            {site.name}
          </span>
        </a>

        <nav className="hidden items-center justify-center lg:flex" aria-label="Sections">
          {nav.map((item) => (
            <button key={item.id} onClick={() => goToSection(item.id)} className={linkClass(active === item.id)}>
              {item.label}
            </button>
          ))}
          <a {...linkProps('/downloads')} className={linkClass(route === '/downloads')}>
            Downloads
          </a>
        </nav>

        <div className="flex h-full items-center justify-end">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid h-[var(--nav-h)] w-[var(--nav-h)] place-items-center text-white lg:hidden"
          >
            <span className="flex w-6 flex-col items-start gap-[5px]">
              <span className={`h-0.5 bg-white transition-all duration-300 ${open ? 'w-6 translate-y-[7px] rotate-45' : 'w-6'}`} />
              <span className={`h-0.5 bg-white transition-all duration-300 ${open ? 'w-0 opacity-0' : 'w-4'}`} />
              <span className={`h-0.5 bg-white transition-all duration-300 ${open ? 'w-6 -translate-y-[7px] -rotate-45' : 'w-6'}`} />
            </span>
          </button>
          <a {...linkProps('/downloads')} className="btn btn-nav h-[var(--nav-h)]">
            <Icon name="download" className="h-4 w-4" />
            <span className="hidden min-[360px]:inline">Download</span>
          </a>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--bg-lines)] bg-ground py-6 lg:hidden" aria-label="Sections">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => goToSection(item.id)}
              className={`block w-full px-6 py-4 text-left text-[1.5rem] font-medium ${
                active === item.id ? 'text-accent' : 'text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            {...linkProps('/downloads')}
            onClickCapture={() => setOpen(false)}
            className={`block w-full px-6 py-4 text-left text-[1.5rem] font-medium ${
              route === '/downloads' ? 'text-accent' : 'text-white'
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

/** Pill badge centred between two hairlines that fade out towards the edges. */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="badge-wrap" data-badge>
      <span className="badge-line is-left" data-badge-line />
      <span className="pill" data-badge-pill>
        {children}
      </span>
      <span className="badge-line is-right" data-badge-line />
    </div>
  )
}

export function SectionHead({
  badge,
  title,
  sub,
  body,
  align = 'left',
  wide = false,
}: {
  badge: string
  title: string
  sub?: string
  body?: string
  align?: 'left' | 'center'
  /** Lets the heading run past the 64rem measure (the mission statement). */
  wide?: boolean
}) {
  const c = align === 'center'
  return (
    <>
      <Badge>{badge}</Badge>
      <div className={`intro ${c ? 'is-center' : ''}`}>
        <h2 className={`h2 balance ${wide ? '' : 'max-xl'}`} data-reveal="words">
          {title}
        </h2>
        {sub && (
          <p className="intro-p is-sub max-lg" data-reveal>
            {sub}
          </p>
        )}
        {body && (
          <p className="intro-p max-md pretty" data-reveal>
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
  center = false,
}: {
  placeholder: string
  action: string
  center?: boolean
}) {
  const [sent, setSent] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <form
      className={`email-form ${center ? 'is-center' : ''}`}
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
        className="input is-email"
      />
      <button type="submit" className="btn btn-email">
        <span>{sent ? 'Thanks' : action}</span>
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
      <path d={WORLD_D} stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" fill="none" />
    </svg>
  )
}
