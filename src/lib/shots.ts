/**
 * Content-hashed URLs for the product captures.
 *
 * These used to sit in `public/` and be referenced as `/shots/<name>.webp`, so
 * replacing an image never changed its URL. Paired with the seven day
 * `max-age` that path carried, every returning visitor kept serving the
 * screenshot they had already cached: the 2026-09-11 refresh was live on the
 * origin, byte for byte, and still invisible in a browser that had been to the
 * site before.
 *
 * Routing them through Vite instead puts a content hash in each filename, so
 * new bytes are a new URL and caches are bypassed by construction rather than
 * by remembering to bump a version token. The hashed files land under
 * `/assets/`, which vercel.json already marks immutable for a year, and that
 * is now honest: the URL really does identify those exact bytes.
 */
const files = import.meta.glob<string>('../assets/shots/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const byName = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  byName.set(path.slice(path.lastIndexOf('/') + 1).replace(/\.webp$/, ''), url)
}

/** `shotUrl('copilot')` for `src/assets/shots/copilot.webp`. */
export function shotUrl(name: string): string {
  const url = byName.get(name)
  if (url === undefined) {
    // Loud, because the alternative is a silent broken image in production.
    console.error(`[shots] no capture named "${name}" in src/assets/shots`)
    return ''
  }
  return url
}

/** Every capture that exists, for tests and for catching orphans. */
export const shotNames = [...byName.keys()].sort()
