import { gsap, ScrollTrigger, prefersReducedMotion } from './motion'

/**
 * The page-wide entrance. Anything marked `data-reveal` rises 18px and fades in
 * once as it crosses 88% of the viewport; `data-reveal-stagger` on a parent
 * sequences its children instead of firing them together.
 *
 * Deliberately small: the reference's sections do not slide or scale in, they
 * just arrive. Overdoing this is what makes a scroll site feel cheap.
 */
export function initReveals(root: HTMLElement | Document = document) {
  if (prefersReducedMotion()) return

  const groups = root.querySelectorAll<HTMLElement>('[data-reveal-stagger]')
  groups.forEach((group) => {
    const kids = group.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!kids.length) return
    gsap.set(kids, { opacity: 0, y: 18 })
    ScrollTrigger.create({
      trigger: group,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(kids, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.08,
        }),
    })
  })

  const singles = root.querySelectorAll<HTMLElement>('[data-reveal]')
  singles.forEach((el) => {
    if (el.closest('[data-reveal-stagger]')) return
    gsap.set(el, { opacity: 0, y: 18 })
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }),
    })
  })
}
