import { useEffect, useState } from 'react'

/**
 * A two-page router in twenty lines, because the brief rules out new
 * dependencies and the site only ever has to tell "/" from "/downloads".
 *
 * `history.pushState` does not emit an event of its own, so `navigate` fires
 * one; `popstate` covers the back button.
 */
const EVENT = 'teminali:navigate'
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Strips the deploy base and any trailing slash, so "/base/downloads/" reads as "/downloads". */
export function normalize(path: string) {
  const p = (BASE && path.startsWith(BASE) ? path.slice(BASE.length) : path).replace(/\/+$/, '')
  return p === '' ? '/' : p
}

export function useRoute() {
  const [path, setPath] = useState(() => normalize(window.location.pathname))
  useEffect(() => {
    const sync = () => setPath(normalize(window.location.pathname))
    window.addEventListener('popstate', sync)
    window.addEventListener(EVENT, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(EVENT, sync)
    }
  }, [])
  return path
}

export function navigate(to: string) {
  if (normalize(window.location.pathname) === normalize(to)) return
  window.history.pushState({}, '', `${BASE}${to}`)
  window.dispatchEvent(new Event(EVENT))
  window.scrollTo(0, 0)
}

/** Intercepts a plain left-click so in-app links do not reload the document. */
export function linkProps(to: string) {
  return {
    href: `${BASE}${to}`,
    onClick(e: React.MouseEvent<HTMLAnchorElement>) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()
      navigate(to)
    },
  }
}
