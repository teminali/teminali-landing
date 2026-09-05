import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { createLaptopScene, type LaptopSceneInstance } from '../three/scene'
import { isCompact, lockScroll, prefersReducedMotion } from '@/lib/motion'
import { VideoPlayer } from '@/components/VideoPlayer'
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
 *
 * The scene that names a video (the last one) is a player. On the laptop it
 * starts as the screenshot with a play and a full-screen control; play mounts
 * the YouTube embed on the screen, full screen opens it in a dialog without
 * the laptop. One state drives both so only one embed exists at a time.
 */
type VideoState = 'poster' | 'inline' | 'theatre'
type SceneVideo = NonNullable<(typeof scenes)[number]['video']>

const videoScene = scenes.find((scene) => scene.video)

export function HeroRail() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrollWrapRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const scrollTextRef = useRef<HTMLDivElement>(null)
  const [rail] = useState(() => !(isCompact() || prefersReducedMotion()))
  const [video, setVideo] = useState<VideoState>('poster')
  const videoWrapRef = useRef<HTMLDivElement>(null)

  // Stop the embed when its scene is no longer in view: the scrub fades the
  // wrap out when the user scrubs back to the previous scene, and the whole
  // rail leaves the viewport once they scroll on past it. Audio must never
  // keep going under an invisible screen.
  useEffect(() => {
    const wrap = videoWrapRef.current
    if (video !== 'inline' || !wrap) return
    const stop = () => setVideo('poster')
    const faded = new MutationObserver(() => {
      if (parseFloat(getComputedStyle(wrap).opacity) < 0.5) stop()
    })
    faded.observe(wrap, { attributes: true, attributeFilter: ['style'] })
    const gone = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) stop()
    }, { threshold: 0.5 })
    gone.observe(wrap)
    return () => {
      faded.disconnect()
      gone.disconnect()
    }
  }, [video])

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
                        ref={scene.video ? videoWrapRef : undefined}
                        data-intro={`image-wrap-${i + 1}`}
                        className={`home-intro_img-wrap${scene.video && video === 'inline' ? ' is-playing' : ''}`}
                        style={{ zIndex: i + 1 }}
                      >
                        <div className="home-intro_screen">
                          <img src={`/shots/${scene.shot}.webp`} alt={scene.alt} className="home-intro_img" />
                          <div data-intro={`overlay-${i + 1}`} className="home-intro_overlay" />
                          <div data-intro={`text-wrap-${i + 1}`} className="hero_intro-text-wrap">
                            <h2 className="hero-intro_h balance">{scene.caption}</h2>
                          </div>
                          {scene.video && (
                            <ScreenPlayer
                              intro={`player-${i + 1}`}
                              video={scene.video}
                              poster={`/shots/${scene.shot}.webp`}
                              playing={video === 'inline'}
                              onPlay={() => setVideo('inline')}
                              onStop={() => setVideo('poster')}
                              onExpand={() => setVideo('theatre')}
                            />
                          )}
                        </div>
                        <FloatCard intro={`img-float-${i + 1}`} float={scene.float} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <CompactScenes onWatch={() => setVideo('theatre')} />
      )}

      {videoScene?.video && (
        <VideoDialog video={videoScene.video} open={video === 'theatre'} onClose={() => setVideo('poster')} />
      )}
    </div>
  )
}

/** The player on the laptop screen. Poster: the play control on the screen's
    centre with the full-screen pill under it; the scrub timeline reveals them
    as the scene's last beat (`data-intro="player-n"`), so the controls stay
    mounted while playing and only hide, keeping that tween target alive.
    Playing: `VideoPlayer`, which fills the screen with its own transport,
    scrubber, clock and volume. YouTube's chrome is off. */
function ScreenPlayer({
  intro,
  video,
  poster,
  playing,
  onPlay,
  onStop,
  onExpand,
}: {
  intro: string
  video: SceneVideo
  poster: string
  playing: boolean
  onPlay: () => void
  onStop: () => void
  onExpand: () => void
}) {
  return (
    <>
      <div data-intro={intro} className="screen-player_controls" hidden={playing}>
        <button type="button" className="screen-player_play" onClick={onPlay} aria-label={`Play ${video.title}`}>
          <Icon name="play" className="h-6 w-6" />
        </button>
        <button type="button" className="screen-player_btn" onClick={onExpand}>
          <Icon name="expand" className="h-3.5 w-3.5" />
          Full screen
        </button>
      </div>
      {playing && (
        <VideoPlayer video={video} variant="inline" poster={poster} onClose={onStop} onExpand={onExpand} />
      )}
    </>
  )
}

/** The video without the laptop: a modal dialog with the embed at 16:9.
    Escape, the close control and the backdrop all close it; the embed is
    unmounted on close so the audio stops with it. */
function VideoDialog({ video, open, onClose }: { video: SceneVideo; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!open || !el) return
    if (!el.open) el.showModal()
    lockScroll(true)
    return () => {
      lockScroll(false)
      if (el.open) el.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="video-dialog"
      aria-label={video.title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
    >
      {open && (
        <>
          <button type="button" className="video-dialog_close" onClick={() => ref.current?.close()} aria-label="Close the video">
            <Icon name="cross" className="h-5 w-5" />
          </button>
          <div className="video-dialog_body">
            <div className="video-dialog_frame">
              <VideoPlayer video={video} variant="theatre" onClose={() => ref.current?.close()} />
            </div>
            <p className="video-dialog_meta">
              <span>{video.title}</span>
              <span>Space to play, F for full screen, Esc to close</span>
            </p>
          </div>
        </>
      )}
    </dialog>
  )
}

type SceneFloat = (typeof scenes)[number]['float']

/** Status dot plus mono label. The dot pulses while the scene is live. */
function Kicker({ float }: { float: SceneFloat }) {
  return (
    <p className="float-kicker">
      <span className={`float-dot is-${float.status}`} aria-hidden="true" />
      {float.kicker}
    </p>
  )
}

/** The status card that lifts off the screen plane. It anchors to the laptop
    bezel, not to the screenshot, so it never covers the app's sidebar or copy. */
function FloatCard({ float, intro }: { float: SceneFloat; intro: string }) {
  return (
    <div data-intro={intro} className={`float-card is-${float.slot}`}>
      <Kicker float={float} />
      <p className="float-title">{float.title}</p>
      <p className="float-sub">{float.sub}</p>
      {float.chips && (
        <p className="float-chips">
          {float.chips.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </p>
      )}
    </div>
  )
}

/** No rail: the end state as a framed still, then the four captions as a list.
    The video scene keeps its player as a button that opens the dialog. */
function CompactScenes({ onWatch }: { onWatch: () => void }) {
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
          <div key={scene.id} className="compact-scene" data-reveal>
            <Kicker float={scene.float} />
            <p className="hero-intro_h pretty">{scene.caption}</p>
            {scene.video && (
              <button type="button" className="screen-player_btn self-start" onClick={onWatch}>
                <Icon name="play" className="h-3.5 w-3.5" />
                Watch the video
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
