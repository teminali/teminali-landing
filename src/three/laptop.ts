import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * The laptop shell.
 *
 * The reference opens its lid with glTF morph targets. We hinge it instead: for
 * a lid that only rotates about one axis the result is identical on screen, and
 * it costs us no third-party model, no Draco decoder and no 20 MB download.
 * Everything below is generated at runtime — the whole scene is ~40 KB of code
 * and zero asset bytes.
 *
 * Units are centimetres at roughly 14" laptop scale, which keeps the camera
 * numbers legible.
 */

export const LID_CLOSED = -Math.PI / 2
export const LID_OPEN = 0.28 // ~16° reclined past vertical, like a real hinge

const BASE_W = 32
const BASE_D = 22
const BASE_H = 1.05
const LID_H = 21.5
const LID_T = 0.72
const SCREEN_W = 29.6
const SCREEN_H = 18.8

export interface Laptop {
  group: THREE.Group
  lid: THREE.Group
  /** Screen plane, in lid-local space. Used to project the DOM overlay. */
  screen: THREE.Mesh
  dispose(): void
}

/** Keyboard and trackpad, drawn once into a texture. */
function deckTexture(): THREE.CanvasTexture {
  const S = 16 // px per cm
  const w = Math.round(BASE_W * S)
  const h = Math.round(BASE_D * S)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!

  g.fillStyle = '#9a9a9a'
  g.fillRect(0, 0, w, h)

  // Keyboard well — a milled pocket, one step darker than the deck.
  const kx = w * 0.075
  const ky = h * 0.075
  const kw = w * 0.85
  const kh = h * 0.5
  g.fillStyle = '#7c7c7c'
  roundRect(g, kx, ky, kw, kh, 8)
  g.fill()

  // Keys. Six rows, last one the wide modifier row with a spacebar.
  const rows = 6
  const gap = S * 0.16
  const rowH = (kh - gap * (rows + 1)) / rows
  const counts = [14, 14, 13, 12, 11, 9]
  for (let r = 0; r < rows; r++) {
    const n = counts[r]
    const y = ky + gap + r * (rowH + gap)
    const usable = kw - gap * (n + 1)
    let x = kx + gap
    for (let i = 0; i < n; i++) {
      let unit = usable / n
      // Bottom row: a long spacebar in the middle, modifiers either side.
      if (r === rows - 1) unit = i === 4 ? usable * 0.4 : (usable * 0.6) / (n - 1)
      g.fillStyle = '#1c1c1c'
      roundRect(g, x, y, unit, rowH, S * 0.14)
      g.fill()
      // A single soft highlight along the top of the keycap. No glow beyond it.
      g.fillStyle = 'rgba(255,255,255,0.06)'
      roundRect(g, x + 1, y + 1, unit - 2, rowH * 0.42, S * 0.12)
      g.fill()
      x += unit + gap
    }
  }

  // Trackpad, centred below the well.
  const tw = w * 0.34
  const th = h * 0.28
  const tx = (w - tw) / 2
  const ty = ky + kh + h * 0.055
  g.fillStyle = '#8d8d8d'
  roundRect(g, tx, ty, tw, th, 10)
  g.fill()
  g.strokeStyle = 'rgba(0,0,0,0.3)'
  g.lineWidth = 2
  roundRect(g, tx, ty, tw, th, 10)
  g.stroke()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function roundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2)
  g.beginPath()
  g.moveTo(x + rr, y)
  g.arcTo(x + w, y, x + w, y + h, rr)
  g.arcTo(x + w, y + h, x, y + h, rr)
  g.arcTo(x, y + h, x, y, rr)
  g.arcTo(x, y, x + w, y, rr)
  g.closePath()
}

export function buildLaptop(): Laptop {
  const group = new THREE.Group()

  const shell = new THREE.MeshStandardMaterial({
    color: 0x9c9c9c,
    metalness: 0.72,
    roughness: 0.38,
  })

  // --- base -----------------------------------------------------------------
  const base = new THREE.Mesh(
    new RoundedBoxGeometry(BASE_W, BASE_H, BASE_D, 4, 0.36),
    shell,
  )
  base.castShadow = true
  base.receiveShadow = true
  group.add(base)

  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(BASE_W - 0.7, BASE_D - 0.7),
    new THREE.MeshStandardMaterial({
      map: deckTexture(),
      metalness: 0.45,
      roughness: 0.62,
    }),
  )
  deck.rotation.x = -Math.PI / 2
  deck.position.y = BASE_H / 2 + 0.012
  group.add(deck)

  // --- lid ------------------------------------------------------------------
  // The pivot sits on the back edge of the base, so the hinge line is real.
  const lid = new THREE.Group()
  lid.position.set(0, BASE_H / 2 - 0.1, -BASE_D / 2 + 0.5)
  group.add(lid)

  const lidShell = new THREE.Mesh(
    new RoundedBoxGeometry(BASE_W, LID_H, LID_T, 4, 0.3),
    shell,
  )
  lidShell.position.set(0, LID_H / 2, -LID_T / 2)
  lidShell.castShadow = true
  lid.add(lidShell)

  // Black bezel face, then the screen itself a hair proud of it.
  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(BASE_W - 0.6, LID_H - 0.6),
    new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.1, roughness: 0.55 }),
  )
  bezel.position.set(0, LID_H / 2, 0.012)
  lid.add(bezel)

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    new THREE.MeshBasicMaterial({ color: 0x151515 }),
  )
  screen.position.set(0, LID_H / 2 + 0.15, 0.02)
  lid.add(screen)

  // Hinge barrel, so the gap at the back does not read as a seam.
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, BASE_W * 0.42, 20),
    new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.85, roughness: 0.4 }),
  )
  hinge.rotation.z = Math.PI / 2
  hinge.position.set(0, 0, 0)
  lid.add(hinge)

  lid.rotation.x = LID_CLOSED

  return {
    group,
    lid,
    screen,
    dispose() {
      group.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else if (mat) mat.dispose()
      })
    },
  }
}

export const screenSize = { w: SCREEN_W, h: SCREEN_H }
