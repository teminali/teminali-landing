import { useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGsap, isCompact, prefersReducedMotion } from '@/lib/motion'
import { createLaptopScene, HOLD_START, type LaptopScene } from '@/three/scene'
import { StudioMock, BreakoutCard } from './StudioMock'
import { Icon } from './ui'
import { hero, scenes } from '@/content/site'

/**
 * The hero and the laptop rail — one tall section with a sticky viewport inside.
 *
 * The reference pins with `#hero-scroll-wrap` and
 * `{ start: 'top top', end: 'bottom 150%', scrub: 2 }`. We keep the scrub and
 * the overscroll, but pin with `position: sticky` rather than ScrollTrigger's
 * pin. Lenis rewrites scroll position every frame, and a pin-spacer that is
 * being measured while that happens is the classic source of a half-pixel
 * jitter at the top of the rail. Sticky has no spacer to fight over.
 *
 * `scrub: 2` is the whole feel: a two-second eased catch-up, never a 1:1 lock.
 * Under `prefers-reduced-motion` it drops to a 1:1 scrub instead of being
 * removed — the scene is the page, so it stays; only the drift goes.
 */

const VARIANTS = ['run', 'route', 'verify'] as const

const smoothstep = (a: number, b: number, x: number) => {
  const t = gsap.utils.clamp(0, 1, (x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function HeroRail() {
  const root = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const indRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  // `prefers-reduced-motion` used to drop the rail with the compact case, which
  // took the laptop — the page's whole product visual — off the screen for
  // anyone with macOS Reduce Motion on. Reduced motion now means *reduced*: the
  // scene still plays, but Lenis smoothing is off (see `smoothScroll`) and the
  // scrub is 1:1 rather than a two-second eased catch-up, so nothing drifts
  // after the user's fingers stop. Only the compact breakpoint still swaps in
  // the static frame, and that is a WebGL-cost decision, not a motion one.
  const reduced = useState(() => prefersReducedMotion())[0]
  const [fallback] = useState(() => isCompact())

  useGsap(
    () => {
      if (fallback) return
      const canvas = canvasRef.current
      const overlay = overlayRef.current
      if (!canvas || !overlay) return

      let scene: LaptopScene
      try {
        scene = createLaptopScene(canvas)
      } catch {
        // No WebGL, or a context that refused to allocate. The static frame
        // below is already in the DOM; leave it and take the loss quietly.
        overlay.style.display = 'none'
        return
      }

      const groups = sceneRefs.current.filter(Boolean) as HTMLDivElement[]
      const n = groups.length

      const place = () => {
        const r = scene.screenRect()
        overlay.style.left = `${r.x}px`
        overlay.style.top = `${r.y}px`
        overlay.style.width = `${r.w}px`
        overlay.style.height = `${r.h}px`
        // 1em == 1% of the screen width, so the mock scales with the dolly
        // instead of reflowing at every distance.
        overlay.style.fontSize = `${r.w / 100}px`

        // How far the scene-2 breakout may hang past the bezel is not a fixed
        // 4em: the width guard in `measure()` shrinks the margin the screen
        // leaves, and at 1024 a flat -4em put the card off the viewport. Solve
        // it against the margin actually available, keeping 12px of air.
        const margin = canvas.clientWidth - (r.x + r.w)
        const overhang = gsap.utils.clamp(0, Math.max(0, margin - 12), r.w * 0.04)
        overlay.style.setProperty('--breakout', `${-overhang}px`)
      }

      const draw = (p: number) => {
        scene.setProgress(p)
        scene.render()
        place()

        // The DOM overlay is a plain AABB, which is only a true fit once the
        // dolly has finished and the lid is exactly parallel to the image
        // plane. Light the screen over the last sliver of the approach so the
        // mock is never seen sitting square on a lid that is still tilted.
        const lit = gsap.utils.clamp(0, 1, (p - 0.57) / 0.07)
        overlay.style.opacity = String(lit)

        // Three scene groups split the held stretch. Each fades up over the
        // first sixth of its band and back down over the last sixth, so two
        // captions are never legible at once — a straight cross-fade leaves
        // both readable at the midpoint and looks like a bug.
        const held = gsap.utils.clamp(0, 1, (p - HOLD_START) / (1 - HOLD_START))
        groups.forEach((g, i) => {
          const local = held * n - i
          // The first scene is already up when the hold begins and the last one
          // must still be up when it ends, so only the interior edges fade.
          const up = i === 0 ? 1 : smoothstep(0, 0.16, local)
          const down = i === n - 1 ? 1 : 1 - smoothstep(0.84, 1, local)
          const a = up * down
          g.style.opacity = String(a)
          g.style.transform = `translate3d(0, ${(local - 0.5) * -2.4}%, 0)`
        })
      }

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom 150%',
        scrub: reduced ? true : 2,
        onUpdate: (self) => draw(self.progress),
        onRefresh: (self) => draw(self.progress),
      })
      // Exposed for the screenshot harness, which needs to land on an exact
      // rail progress rather than guess at a page offset.
      ;(window as unknown as { __rail?: ScrollTrigger }).__rail = st

      // The hero copy leaves before the laptop arrives — it is not scrubbed
      // with the rail, it just scrolls away on its own shorter trigger.
      gsap.to(copyRef.current, {
        yPercent: -26,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '11% top', scrub: 1 },
      })
      gsap.to(indRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '8% top', scrub: true },
      })

      const onResize = () => {
        scene.resize()
        draw(st.progress)
      }
      window.addEventListener('resize', onResize)

      draw(0)

      return () => {
        window.removeEventListener('resize', onResize)
        scene.dispose()
      }
    },
    root,
    [fallback],
  )

  // Compact and reduced-motion get a flow layout instead of the rail: a single
  // hero screen with the end state shown as a still beneath it. The 560vh
  // scroll only earns its keep when there is a scene being scrubbed through —
  // without one it is five screens of a motionless image.
  if (fallback) {
    return (
      <section id="top" ref={root} className="relative overflow-hidden">
        <Radar />
        <div className="relative flex min-h-[100svh] flex-col">
          <div className="flex flex-1 items-center pb-8 pt-[calc(var(--nav-h)+3rem)]">
            <div className="shell w-full">
              <HeroCopy />
            </div>
          </div>
          <ScrollCue />
          <StaticFrame />
        </div>
      </section>
    )
  }

  return (
    <section id="top" ref={root} className="relative h-[560vh]" data-hero-rail>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Concentric radar behind the headline. Achromatic, barely there. */}
        <Radar />

        {(
          <>
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            <div
              ref={overlayRef}
              className="pointer-events-none absolute"
              style={{ opacity: 0 }}
              aria-hidden="true"
            >
              {VARIANTS.map((v, i) => (
                <div
                  key={v}
                  ref={(el) => {
                    sceneRefs.current[i] = el
                  }}
                  className="absolute inset-0"
                  style={{ opacity: 0 }}
                >
                  {/* Clipped to the screen. Everything in here is behind glass. */}
                  <div className="absolute inset-0 overflow-hidden">
                    <StudioMock variant={v} />
                    <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#151515] via-[#151515]/88 to-transparent" />
                    <div className="absolute inset-x-0 bottom-[8%] flex flex-col items-center gap-[1.7em]">
                      <span className="grid h-[5em] w-[5em] place-items-center rounded-[1em] border border-[#3a3a3a] bg-[#262626] text-[#f0f0f0]">
                        <Icon name={['play', 'route', 'check'][i]} className="h-[2.4em] w-[2.4em]" />
                      </span>
                      <p className="text-[2.7em] font-light tracking-tight text-[#f0f0f0]">
                        {scenes[i].caption}
                      </p>
                    </div>
                  </div>

                  {/* The breakout. It leaves the screen plane and floats in
                      front of the bezel — the reference's signature move, and
                      the reason this wrapper is not clipped. */}
                  {i === 1 && (
                    <div className="absolute top-[9%]" style={{ right: 'var(--breakout, 0px)' }}>
                      <BreakoutCard title={scenes[1].detail.title} rows={scenes[1].detail.rows} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Hero copy */}
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div ref={copyRef} className="shell w-full">
            <HeroCopy />
          </div>
        </div>

        <div ref={indRef} className="pointer-events-none absolute inset-x-0 bottom-10">
          <ScrollCue />
        </div>
      </div>
    </section>
  )
}

function Radar() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      <svg viewBox="0 0 800 800" className="h-[130vmin] w-[130vmin] opacity-[0.5]">
        {[120, 200, 280, 360].map((r) => (
          <circle key={r} cx="400" cy="400" r={r} fill="none" stroke="var(--border)" strokeWidth="1" />
        ))}
        <circle cx="400" cy="400" r="40" fill="none" stroke="var(--border-strong)" strokeWidth="1" />
      </svg>
    </div>
  )
}

function HeroCopy() {
  return (
    <div className="mx-auto max-w-[60rem] text-center">
      <h1 className="text-h1 font-extralight text-ink-bright balance">{hero.title}</h1>
      {hero.body.map((p) => (
        <p key={p} className="mx-auto mt-6 max-w-xl text-lead text-ink-soft pretty">
          {p}
        </p>
      ))}
    </div>
  )
}

function ScrollCue() {
  return (
    <div className="pointer-events-none flex flex-col items-center gap-3">
      <span className="relative block h-9 w-[22px] rounded-full border border-line-strong">
        <span className="absolute left-1/2 top-[6px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-accent-dim [animation:scrolldot_1.8s_ease-in-out_infinite]" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-ghost">
        Scroll
      </span>
    </div>
  )
}

/** Mobile and prefers-reduced-motion: the whole scroll-driven scene is skipped
 *  and the end state is shown as a plain framed still, in flow beneath the copy
 *  rather than absolutely placed over it — at 390 the copy is four H1 lines and
 *  a `top-[58%]` still landed on top of it.
 *
 *  The em size is solved rather than stepped, the same way the section frames
 *  do it: `1em = 1cqw = 1% of the frame width`. */
function StaticFrame() {
  return (
    <div className="px-4 pb-4 pt-10">
      <div className="mx-auto max-w-5xl [container-type:inline-size]">
        <div className="aspect-[16/10] overflow-hidden rounded-card border border-line-strong bg-ground text-[1cqw]">
          <StudioMock variant="run" />
        </div>
      </div>
    </div>
  )
}
