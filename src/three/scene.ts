import * as THREE from 'three'
import { buildLaptop, LID_CLOSED, LID_OPEN, screenSize, type Laptop } from './laptop'

/**
 * The scroll-scrubbed laptop scene.
 *
 * `setProgress(0..1)` is the only input. It is called from a GSAP ScrollTrigger
 * with `scrub: 2`, so this function must be a pure mapping from progress to
 * transform — no easing, no state, no time. All the feel lives in the scrub.
 *
 * Phases, in progress space:
 *   0.00 – 0.16   the closed laptop rises into frame
 *   0.16 – 0.46   the lid opens on its hinge
 *   0.46 – 0.64   the camera dollies in until the screen fills the frame and
 *                 settles exactly head-on, so the DOM overlay can sit on it
 *   0.64 – 1.00   held. The overlay scenes cross-fade over this stretch.
 */

// How much of the viewport height the open screen takes. The reference lands
// near 0.62, which is what leaves the whole body visible beneath it — push this
// past ~0.75 and the base crops off the bottom of the frame.
const FILL = 0.88
// The camera ends this far above the screen centre, with no pitch. Raising it
// without pitching reveals the top of the body while leaving the lid exactly
// parallel to the image plane — which is what keeps the DOM overlay a plain
// rectangle instead of a trapezoid.
const EYE_LIFT = 1.6
const HOLD_START = 0.64

export interface LaptopScene {
  setProgress(p: number): void
  /** Screen rectangle in CSS pixels, relative to the canvas. */
  screenRect(): { x: number; y: number; w: number; h: number }
  resize(): void
  render(): void
  dispose(): void
}

/** A neutral vertical-gradient environment. Achromatic on purpose — the token
 *  sheet forbids tinted surfaces, and a metal without an environment reads black. */
function neutralEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const w = 4
  const h = 128
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1)
    // Bright above, dark below, with a soft horizon — a room, flattened.
    const v = Math.round(255 * (0.06 + 0.72 * Math.pow(1 - t, 1.6)))
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, w, h)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true

  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromEquirectangular(tex).texture
  pmrem.dispose()
  tex.dispose()
  return env
}

export function createLaptopScene(canvas: HTMLCanvasElement): LaptopScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.environment = neutralEnv(renderer)

  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 400)

  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const key = new THREE.DirectionalLight(0xffffff, 1.9)
  key.position.set(16, 34, 28)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.55)
  fill.position.set(-26, 10, 20)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0xffffff, 0.9)
  rim.position.set(0, 14, -30)
  scene.add(rim)

  const laptop: Laptop = buildLaptop()
  scene.add(laptop.group)

  // Distance at which the open screen fills FILL of the viewport height, also
  // respecting width on narrow viewports. Recomputed on resize.
  let dollyEnd = 60
  let dollyStart = 96
  const screenCentre = new THREE.Vector3()

  function measure() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    camera.aspect = w / h
    const vFov = (camera.fov * Math.PI) / 180
    const neededH = screenSize.h / FILL
    let d = neededH / 2 / Math.tan(vFov / 2)
    // If the screen would overflow horizontally, back off until it fits.
    const visibleW = 2 * d * Math.tan(vFov / 2) * camera.aspect
    if (screenSize.w / visibleW > 0.94) {
      d *= screenSize.w / (visibleW * 0.94)
    }
    dollyEnd = d
    dollyStart = d * 1.85
    camera.updateProjectionMatrix()
    calibrate()
  }

  /**
   * The closed form above solves for a screen sitting at the origin, but the
   * lid stands at the *back* of the laptop, so the real screen is always a
   * little further away and lands short of FILL. Rather than fudge a constant,
   * pose the end state and iterate the distance against what actually projects.
   * Converges in three or four passes; six is free insurance.
   */
  function calibrate() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    for (let i = 0; i < 6; i++) {
      setProgress(1)
      const r = screenRect()
      // Height is the target; width is a ceiling so the bezel never runs off.
      const f = Math.max(r.h / h / FILL, r.w / w / 0.94)
      if (Math.abs(f - 1) < 0.002) break
      dollyEnd *= f
    }
    dollyStart = dollyEnd * 1.85
  }

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    measure()
  }

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
  const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  // Only used for the two purely presentational eases (rise, dolly). The scrub
  // supplies the real easing; these just keep the ends from snapping.
  const smooth = (t: number) => t * t * (3 - 2 * t)

  function setProgress(p: number) {
    const rise = smooth(seg(p, 0, 0.16))
    const open = seg(p, 0.16, 0.46)
    const dolly = smooth(seg(p, 0.46, HOLD_START))

    // Rise: comes up from below, tipped back so the closed lid faces us.
    laptop.group.position.y = lerp(-49, 0, rise)
    laptop.group.position.z = lerp(-6, 0, rise)

    // The lid unfolds, and the body levels out as it does.
    laptop.lid.rotation.x = lerp(LID_CLOSED, LID_OPEN, easeOpen(open))

    // Approach. By the end the lid is exactly vertical and parallel to the
    // image plane, which is what lets the DOM overlay be a plain rectangle.
    laptop.group.rotation.x = lerp(lerp(0.5, 0.12, rise), 0, dolly)
    laptop.lid.rotation.x = lerp(laptop.lid.rotation.x, 0, dolly)

    camera.position.z = lerp(dollyStart, dollyEnd, dolly)

    // Track the screen's centre so the dolly ends framed on it, not on the body.
    laptop.group.updateMatrixWorld(true)
    laptop.screen.getWorldPosition(screenCentre)
    const eyeY = lerp(lerp(2, 6, rise), screenCentre.y + EYE_LIFT, dolly)
    camera.position.x = 0
    camera.position.y = eyeY
    camera.lookAt(0, eyeY, 0) // straight ahead: no pitch, no keystone
    camera.updateMatrixWorld(true)
  }

  /** A hinge does not open linearly. Slow to break, quick through the middle,
   *  slow to settle — this is the difference between "3D model" and "laptop". */
  function easeOpen(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const corner = new THREE.Vector3()
  function screenRect() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    const hw = screenSize.w / 2
    const hh = screenSize.h / 2
    for (const [sx, sy] of [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh],
    ] as const) {
      corner.set(sx, sy, 0)
      laptop.screen.localToWorld(corner)
      corner.project(camera)
      const px = ((corner.x + 1) / 2) * w
      const py = ((1 - corner.y) / 2) * h
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
  }

  function render() {
    renderer.render(scene, camera)
  }

  resize()
  setProgress(0)

  return {
    setProgress,
    screenRect,
    resize,
    render,
    dispose() {
      laptop.dispose()
      scene.environment?.dispose()
      renderer.dispose()
    },
  }
}

export { HOLD_START }
