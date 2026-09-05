import { useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * One rAF loop for the whole page.
 *
 * Lenis and GSAP both want to own the frame. If they each run their own rAF the
 * scrubbed timelines read Lenis's *previous* frame position and the laptop
 * judders, which is exactly what `scrub` is meant to smooth out. So Lenis is
 * driven from gsap.ticker, ScrollTrigger's scroll source is pointed at Lenis,
 * and lag smoothing is off so a dropped frame doesn't get silently absorbed.
 */
let lenis: Lenis | null = null

export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}
  if (lenis) return () => {}

  lenis = new Lenis({
    // ~1s to settle. Paired with `scrub: 2` this is what gives the reference
    // its unhurried catch-up; a shorter duration makes the rail feel snappy
    // and wrong.
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  })

  const instance = lenis
  instance.on('scroll', ScrollTrigger.update)

  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Exposed so the screenshot harness can drive the rail deterministically.
  ;(window as unknown as { __lenis?: Lenis }).__lenis = instance

  // No `scrollerProxy` here, deliberately. Lenis is running on the window in
  // its default mode, so it moves the *real* document scroll: window.scrollY,
  // documentElement.scrollTop and lenis.scroll all read the same number. That
  // makes a proxy redundant, and a redundant proxy is a trap: it pins
  // ScrollTrigger's scroll source to one Lenis closure, and nothing unregisters
  // it when that instance is destroyed. Under React StrictMode the effects run
  // twice, so the second pass built its triggers against the *first*, already
  // destroyed Lenis, whose `.scroll` is frozen at 0, so the rail's progress stuck
  // at 0 for the whole page, the laptop parked below frame and no parallax, in
  // dev only. The production build never double-invokes, which is why it looked
  // fine on :4173 and was broken on :5173. `lenis.on('scroll', ...)` above is
  // the whole integration ScrollTrigger needs.
  //
  // Triggers built before this ran are still reading a pre-Lenis scroll
  // position, so rebind them now that the loop owns the frame.
  ScrollTrigger.refresh()

  return () => {
    gsap.ticker.remove(tick)
    instance.off('scroll', ScrollTrigger.update)
    instance.destroy()
    lenis = null
  }
}

/** Freeze the page behind a modal layer. Lenis swallows wheel and touch while
    stopped, so nothing under the dialog moves; `start` hands control back. */
export function lockScroll(locked: boolean) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 8
  if (lenis) lenis.scrollTo(top, { duration: 1.2 })
  else window.scrollTo({ top, behavior: 'smooth' })
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Coarse pointer or narrow viewport: the WebGL rail is skipped entirely. */
export function isCompact(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 860px)').matches
}

export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Runs `fn` inside a gsap.context scoped to `scope`, and reverts every tween and
 * ScrollTrigger it created on cleanup. Without the scope, a hot reload leaves
 * orphaned triggers behind and the pin spacing doubles up.
 */
export function useGsap(
  fn: (ctx: gsap.Context) => void,
  scope: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) {
  useIsoLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(fn, scope.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap, ScrollTrigger }
