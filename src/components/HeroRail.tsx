import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { createLaptopScene, type LaptopSceneInstance } from '../three/scene'
import { isCompact, prefersReducedMotion } from '@/lib/motion'
import { Icon } from './ui'
import { StudioMock } from './StudioMock'
import { hero, scenes } from '@/content/site'

/**
 * The hero and the pinned laptop rail.
 *
 * Layout and choreography are the reference's, measured from its sheet and
 * scripts: a 100svh hero that space-betweens an empty spacer, the copy block
 * (itself pushed down 8.5rem) and the scroll cue; radar circles that draw in
 * as dash offsets; every line and text block sliding up 150% of its height
 * out of an overflow-hidden wrap; then a 700vh rail that scrubs the laptop.
 *
 * Below 860px and under `prefers-reduced-motion` there is no rail. The hero
 * is followed by a framed still and the four captions as a plain list.
 */
export function HeroRail() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollWrapRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const scrollTextRef = useRef<HTMLDivElement>(null)
  const [rail] = useState(() => !(isCompact() || prefersReducedMotion()))

  useEffect(() => {
    let laptopInstance: LaptopSceneInstance | null = null
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      /* 1. The intro. Circles first, then everything else together 0.4s in. */
      const intro = gsap.timeline({ delay: 0.3 })
      const full = 2
      const step = 0.2
      const base = full - step * 2
      const draw = { strokeDashoffset: 0, ease: 'power3.out' }
      intro
        .to('#circle-small circle', { ...draw, duration: base }, 0)
        .to('#circle-medium circle', { ...draw, duration: base - step }, step)
        .to('#circle-large circle', { ...draw, duration: base - step * 2 }, step * 2)

      const s = { ease: 'power3.out', duration: 1.4 }
      intro.fromTo('#horizontal-line', { width: 0 }, { width: '100%', ...s }, '<')
      intro.fromTo(
        ['#vertical-line-center', '#vertical-line-left', '#vertical-line-right'],
        { height: 0 },
        { height: '100%', ...s },
        '<',
      )

      // The page-wide rules and the nav live outside this component; gsap only
      // scopes selector strings, so hand it the elements directly.
      const rules = Array.from(document.querySelectorAll<HTMLElement>('[data-rule]'))
      if (rules.length) intro.fromTo(rules, { height: 0 }, { height: '100%', ...s }, '<')

      const risers = ['#nav-layout', '#hero-heading', '#hero-paragraph', '#hero-scroll-indicator']
        .map((id) => document.querySelector<HTMLElement>(id))
        .filter((el): el is HTMLElement => !!el)
      intro.fromTo(risers, { yPercent: 150, opacity: 0 }, { yPercent: 0, opacity: 1, ...s }, '<')

      /* 2. The scroll cue loop: the reference's four Webflow keyframe groups,
            2.3s per cycle: rest, fall, snap back, rise. */
      if (!reduced && dotRef.current && ringRef.current && scrollTextRef.current) {
        const dot = dotRef.current
        const ring = ringRef.current
        const text = scrollTextRef.current
        gsap
          .timeline({ repeat: -1, delay: 1.2 })
          .to(dot, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'none' }, 0)
          .to(ring, { yPercent: 0, duration: 0.5, ease: 'none' }, 0)
          .to(text, { opacity: 1, duration: 0.5, ease: 'none' }, 0)
          .to(dot, { y: '2rem', duration: 1, ease: 'power3.out' }, 0.5)
          .to(dot, { scale: 0.6, duration: 1, ease: 'power5.out' }, 0.5)
          .to(ring, { yPercent: 100, duration: 1, ease: 'power3.out' }, 0.5)
          .to(text, { opacity: 0.5, duration: 1, ease: 'power5.out' }, 0.5)
          .to(dot, { opacity: 0, duration: 0.8, ease: 'power4.out' }, 0.7)
          .set(dot, { y: '1rem', scale: 0.6 }, 1.5)
          .set(ring, { yPercent: 0, opacity: 0 }, 1.5)
          .to(dot, { scale: 1, y: 0, duration: 0.8, ease: 'power5.out' }, 1.5)
          .to(dot, { opacity: 1, duration: 0.6, ease: 'power4.out' }, 1.5)
          .to(ring, { opacity: 1, duration: 0.8, ease: 'power4.out' }, 1.5)
          .to(text, { opacity: 1, duration: 0.8, ease: 'power5.out' }, 1.5)
      }

      /* 3. The laptop. */
      if (rail && canvasRef.current && overlayRef.current && scrollWrapRef.current) {
        laptopInstance = createLaptopScene({
          canvas: canvasRef.current,
          overlay: overlayRef.current,
          scrollWrap: scrollWrapRef.current,
        })
      }
    }, rootRef)

    const onResize = () => laptopInstance?.resize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
      laptopInstance?.dispose()
    }
  }, [rail])

  return (
    <div ref={rootRef} className="hero_wrapper">
      {/* Sticky drafting grid and the radar. Stays put for the whole hero + rail. */}
      <div className="hero_scroll-sticky">
        <div className="hero_animation-wrap">
          <div id="horizontal-line" className="hero_line-hrz" />
          <div id="vertical-line-center" className="hero_line-vert is-center" />
          <div id="vertical-line-left" className="hero_line-vert is-left" />
          <div id="vertical-line-right" className="hero_line-vert is-right" />

          <div className="hero_circle-large">
            <svg width="100%" height="100%" viewBox="0 0 1001 1001" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" id="circle-large">
              <circle cx="500.5" cy="500.5" r="500" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="hero_circle-medium">
            <svg width="100%" height="100%" viewBox="0 0 700 700" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" id="circle-medium">
              <circle cx="350" cy="350" r="349.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="hero_circle-small">
            <svg width="100%" height="100%" viewBox="0 0 460 460" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" id="circle-small">
              <circle cx="230" cy="230" r="229.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* The hero proper. */}
      <section id="hero-section" className="hero_section">
        <div />
        <div className="shell">
          <div className="pad-lg" />
          <div className="hero_wrap">
            <div className="hero_item-wrap">
              <h1 id="hero-heading" className="h2 balance">
                {hero.title}
              </h1>
            </div>
            <div className="spacer-lg" />
            <div className="hero_item-wrap is-p">
              <div id="hero-paragraph" className="text-medium ink-70 flex flex-col gap-6">
                {hero.body.map((p) => (
                  <p key={p} className="pretty">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hero_item-wrap is-scroll">
          <div id="hero-scroll-indicator" className="scroll-ind">
            <div className="scroll-icon">
              <div ref={ringRef} className="scroll-bg" />
              <div className="scroll-inner">
                <div ref={dotRef} className="scroll-dot" />
              </div>
            </div>
            <div ref={scrollTextRef} className="scroll-text">
              Scroll
            </div>
          </div>
        </div>
      </section>

      {rail ? (
        <section id="hero-scroll-wrap" ref={scrollWrapRef} className="hero_scroll-wrap pointer-events-none">
          <div className="hero_animation-rail">
            <div className="hero_laptop-animation">
              <div className="laptop">
                <canvas id="laptop-scene" ref={canvasRef} />
                <div id="laptop-overlay" ref={overlayRef}>
                  <div data-intro="wrap" className="home-intro_content-wrap">
                    {scenes.map((scene, i) => (
                      <div
                        key={scene.id}
                        data-intro={`image-wrap-${i + 1}`}
                        className="home-intro_img-wrap"
                        style={{ zIndex: i + 1 }}
                      >
                        <img src={`/shots/${scene.shot}.webp`} alt={scene.alt} className="home-intro_img" />

                        {/* The element that leaves the screen plane. */}
                        <div data-intro={`img-float-${i + 1}`} className={`float-card min-w-[230px] ${scene.float.pos}`}>
                          <div className="flex items-center gap-2.5">
                            {scene.float.live ? (
                              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                            ) : (
                              <Icon name={scene.icon} className="h-3.5 w-3.5 text-accent" />
                            )}
                            <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                              {scene.float.kicker}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs font-medium text-white">{scene.float.title}</p>
                          <p className="text-[11px] text-ink-faint">{scene.float.sub}</p>
                        </div>

                        <div data-intro={`overlay-${i + 1}`} className="home-intro_overlay" />

                        <div data-intro={`text-wrap-${i + 1}`} className="hero_intro-text-wrap">
                          <div className="hero-intro_icon-wrap">
                            <span className="hero-intro_icon">
                              <Icon name={scene.icon} className="h-full w-full" />
                            </span>
                          </div>
                          <h2 className="hero-intro_h balance">{scene.caption}</h2>
                          <div className="hero-intro_h-spacer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <CompactScenes />
      )}
    </div>
  )
}

/** No rail: the end state as a framed still, then the four captions as a list. */
function CompactScenes() {
  return (
    <section className="shell relative z-[2] pad-lg pt-10">
      <div className="relative">
        <div className="[container-type:inline-size]">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--line-12)] bg-ground text-[1cqw]">
            <StudioMock variant="run" />
          </div>
        </div>
        <div className="img-overlay is-vert rounded-2xl" />
      </div>
      <div className="mt-12 flex flex-col gap-8">
        {scenes.map((scene) => (
          <div key={scene.id} className="flex items-start gap-5" data-reveal>
            <span className="hero-intro_icon-wrap !mb-0 !p-3">
              <span className="flex h-5 w-5">
                <Icon name={scene.icon} className="h-full w-full" />
              </span>
            </span>
            <p className="h5 pretty">{scene.caption}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
