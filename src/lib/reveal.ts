import { gsap, ScrollTrigger, prefersReducedMotion } from './motion'

/**
 * The page-wide motion layer. Everything is declared in markup and wired here
 * once per route, inside one gsap.context so a navigation or a StrictMode
 * re-mount reverts it cleanly:
 *
 *   data-reveal              rises 24px and fades in once, at 88% of the viewport
 *   data-reveal="words"      the same, but word by word out of a clipping wrap
 *   data-reveal="scale"      settles from 0.96 to 1, for figures and cards
 *   data-reveal-stagger      a parent that sequences its data-reveal children
 *   data-line                a hairline that draws from its origin
 *   data-badge               the section pill: lines draw outwards, pill fades
 *   data-parallax="0.08"     drifts by that fraction of the scroll through the viewport
 *   data-counter             a stat that counts up to the number in its text
 *   data-magnetic            a button that leans a few px towards the pointer
 *
 * Deliberately restrained: the reference's sections do not slide or spin in,
 * they arrive. Every value here is small on purpose.
 */

const EASE = 'power3.out'

export function initReveals(root: HTMLElement | Document = document): () => void {
  if (prefersReducedMotion()) return () => {}

  const ctx = gsap.context(() => {
    splitWords(root)
    reveals(root)
    lines(root)
    badges(root)
    parallax(root)
    counters(root)
    magnetic(root)
  })

  return () => ctx.revert()
}

/* ------------------------------------------------------------ word split --- */

function splitWords(root: HTMLElement | Document) {
  root.querySelectorAll<HTMLElement>('[data-reveal="words"]').forEach((el) => {
    if (el.dataset.split) return
    el.dataset.split = '1'
    const text = el.textContent ?? ''
    el.setAttribute('aria-label', text)
    el.textContent = ''
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(' '))
        return
      }
      const outer = document.createElement('span')
      outer.className = 'split-word'
      outer.setAttribute('aria-hidden', 'true')
      const inner = document.createElement('span')
      inner.textContent = part
      outer.appendChild(inner)
      el.appendChild(outer)
    })
  })
}

/* --------------------------------------------------------------- reveals --- */

function revealTween(el: HTMLElement, delay = 0): gsap.core.Tween | gsap.core.Timeline {
  const kind = el.dataset.reveal
  if (kind === 'words') {
    const words = el.querySelectorAll<HTMLElement>('.split-word > span')
    gsap.set(words, { yPercent: 110 })
    return gsap.to(words, { yPercent: 0, duration: 0.9, ease: EASE, stagger: 0.035, delay })
  }
  if (kind === 'scale') {
    gsap.set(el, { opacity: 0, scale: 0.96, transformOrigin: '50% 60%' })
    return gsap.to(el, { opacity: 1, scale: 1, duration: 1.1, ease: EASE, delay })
  }
  gsap.set(el, { opacity: 0, y: 24 })
  return gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: EASE, delay })
}

function reveals(root: HTMLElement | Document) {
  const groups = root.querySelectorAll<HTMLElement>('[data-reveal-stagger]')
  groups.forEach((group) => {
    const kids = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
      (k) => k.closest('[data-reveal-stagger]') === group,
    )
    if (!kids.length) return
    // `data-reveal-stagger="0.04"` overrides the default 80ms step.
    const step = parseFloat(group.dataset.revealStagger || '') || 0.08
    const tweens = kids.map((k, i) => revealTween(k, i * step).pause())
    ScrollTrigger.create({
      trigger: group,
      start: 'top 88%',
      once: true,
      onEnter: () => tweens.forEach((t) => t.play()),
    })
  })

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.closest('[data-reveal-stagger]')) return
    const tween = revealTween(el).pause()
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => tween.play(),
    })
  })
}

/* ----------------------------------------------------------------- lines --- */

function lines(root: HTMLElement | Document) {
  root.querySelectorAll<HTMLElement>('[data-line]').forEach((el) => {
    gsap.set(el, { scaleX: 0 })
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => gsap.to(el, { scaleX: 1, duration: 1.2, ease: EASE }),
    })
  })
}

function badges(root: HTMLElement | Document) {
  root.querySelectorAll<HTMLElement>('[data-badge]').forEach((wrap) => {
    const ls = wrap.querySelectorAll<HTMLElement>('[data-badge-line]')
    const pill = wrap.querySelector<HTMLElement>('[data-badge-pill]')
    gsap.set(ls, { scaleX: 0 })
    if (pill) gsap.set(pill, { opacity: 0, y: 8 })
    ScrollTrigger.create({
      trigger: wrap,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(ls, { scaleX: 1, duration: 1.4, ease: EASE })
        if (pill) gsap.to(pill, { opacity: 1, y: 0, duration: 0.8, ease: EASE, delay: 0.15 })
      },
    })
  })
}

/* -------------------------------------------------------------- parallax --- */

function parallax(root: HTMLElement | Document) {
  root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax ?? '0')
    if (!amount) return
    // Move by `amount` of a viewport height across the element's whole pass
    // through the viewport, centred so it sits at rest when in the middle.
    const px = amount * window.innerHeight
    gsap.fromTo(
      el,
      { y: -px },
      {
        y: px,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
      },
    )
  })
}

/* -------------------------------------------------------------- counters --- */

function counters(root: HTMLElement | Document) {
  root.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    // The first pass zeroes the text, and a StrictMode re-mount runs this
    // again against that zero, so the original is kept on the element.
    const text = el.dataset.counterText ?? (el.dataset.counterText = el.textContent?.trim() ?? '')
    // Only a leading number counts. "127.0.0.1" and "3 platforms" keep their
    // text but still get the reveal from their parent.
    const m = text.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/)
    if (!m || /\d\.\d+\.\d/.test(text)) return
    const [, prefix, num, suffix] = m
    const decimals = (num.split('.')[1] ?? '').length
    const target = parseFloat(num.replace(/,/g, ''))
    const state = { v: 0 }
    const fmt = (v: number) =>
      prefix +
      v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
      suffix
    el.textContent = fmt(0)
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = fmt(state.v)
          },
          onComplete: () => {
            el.textContent = text
          },
        }),
    })
  })
}

/* -------------------------------------------------------------- magnetic --- */

function magnetic(root: HTMLElement | Document) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.18)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
  })
}
