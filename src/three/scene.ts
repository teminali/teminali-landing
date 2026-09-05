import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface LaptopSceneConfig {
  canvas: HTMLCanvasElement
  overlay: HTMLElement
  scrollWrap: HTMLElement
  onReady?: () => void
}

export interface LaptopSceneInstance {
  resize(): void
  render(): void
  dispose(): void
  timeline: gsap.core.Timeline | null
}

/**
 * Authentic Reventador Global Three.js Laptop Animation & Screen Projection.
 *
 * Choreography:
 *   - Camera: PerspectiveCamera(45, aspect, 0.01, 1000)
 *   - Model: 14" MacBook Pro GLB with authentic PBR materials
 *   - Lid Opening: screenGroup.rotation.z from 0.5*PI (closed) to 0.08*PI (open)
 *   - Scene rotation & lift: s.position.y from -2, s.rotation.z from 0.6*PI
 *   - Camera dolly: e.position from {y: 0.2, z: 3} to {y: 0.75, z: 2}
 *   - Screen Projection: maps 3D corners (-1.103, 0.59) and (0.782, -0.5505) to DOM overlay
 */
export function createLaptopScene(config: LaptopSceneConfig): LaptopSceneInstance {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
  camera.position.set(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({
    canvas: config.canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const ambient = new THREE.AmbientLight(0xffffff, 0.55)
  scene.add(ambient)

  const pointLight = new THREE.PointLight(0xffffff, 11, 40)
  pointLight.position.set(0, 2.2, 2.2)
  scene.add(pointLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
  rimLight.position.set(0, 3, -4)
  scene.add(rimLight)

  const screenGroup = new THREE.Group()
  scene.add(screenGroup)

  let contentMesh: THREE.Mesh | null = null
  let timeline: gsap.core.Timeline | null = null
  let isDisposed = false

  const manager = new THREE.LoadingManager()
  const texLoader = new THREE.TextureLoader(manager)

  const kbTex = texLoader.load('/models/keyboard.webp')
  kbTex.flipY = false

  const bodyTex = texLoader.load('/models/macbook_BaseColor.webp')
  bodyTex.flipY = false

  const bodyMat = new THREE.MeshStandardMaterial({
    map: bodyTex,
    metalness: 0.8,
    roughness: 0.5,
    color: 0xcccccc,
  })

  const kbMat = new THREE.MeshStandardMaterial({
    map: kbTex,
    metalness: 0.8,
    roughness: 0.9,
  })

  const contentMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })

  function projectScreen() {
    if (!contentMesh || isDisposed) return
    const l = contentMesh.position.clone()
    l.z += scene.position.z
    const c = l.clone()
    const h = l.clone()
    c.x -= 1.103
    c.y += 0.59
    h.x += 0.782
    h.y -= 0.5505
    c.project(camera)
    h.project(camera)
    const left = (c.x + 1) * 0.5 * window.innerWidth
    const top = (1 - c.y) * 0.5 * window.innerHeight
    const width = (h.x + 1) * 0.5 * window.innerWidth - left
    const height = (1 - h.y) * 0.5 * window.innerHeight - top
    config.overlay.style.top = `${top}px`
    config.overlay.style.left = `${left}px`
    config.overlay.style.width = `${width}px`
    config.overlay.style.height = `${height}px`
  }

  function render() {
    if (isDisposed) return
    renderer.render(scene, camera)
  }

  function resize() {
    if (isDisposed) return
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (camera.aspect > 1.1) {
      scene.position.z = 0
    } else {
      scene.position.z = -4 * (1 - camera.aspect / 1.1)
    }
    render()
    projectScreen()
  }

  const gltfLoader = new GLTFLoader(manager)
  gltfLoader.load(
    '/models/macbook.glb',
    (gltf) => {
      if (isDisposed) return
      const children = [...gltf.scene.children]
      children.forEach((m) => {
        if (m.name === 'keyboard' && m instanceof THREE.Mesh) {
          m.material = kbMat
          m.castShadow = true
          m.receiveShadow = true
          scene.add(m)
        } else if ((m.name === 'Cube.002' || m.name === 'Cube002') && m instanceof THREE.Mesh) {
          m.material = bodyMat
          m.castShadow = true
          m.receiveShadow = true
          scene.add(m)
        } else if (m.name === 'screen' && m instanceof THREE.Mesh) {
          m.material = bodyMat
          m.castShadow = true
          screenGroup.add(m)
        } else if (m.name === 'content' && m instanceof THREE.Mesh) {
          m.material = contentMat
          screenGroup.add(m)
          contentMesh = m
        }
      })

      scene.rotation.y = 0.5 * Math.PI

      // Set initial state
      gsap.set(config.scrollWrap, { autoAlpha: 1 })
      gsap.set('[data-intro="wrap"]', { rotateX: 0, opacity: 0 })
      gsap.set('[data-intro="image-wrap-2"]', { y: 12, autoAlpha: 0 })
      gsap.set('[data-intro="image-wrap-3"]', { y: 12, autoAlpha: 0 })
      gsap.set('[data-intro="image-wrap-4"]', { y: 12, autoAlpha: 0 })
      gsap.set('[data-intro*="text-wrap"]', { opacity: 0 })
      gsap.set('[data-intro*="img-float"]', { y: 12, opacity: 0 })
      gsap.set('[data-intro*="player"]', { autoAlpha: 0 })

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: config.scrollWrap,
          start: 'top top',
          end: 'bottom 150%',
          scrub: 2,
        },
        onUpdate: () => {
          render()
          projectScreen()
        },
      })

      // Laptop arrival & choreography
      timeline.from(scene.position, { duration: 0.9, y: -2 }, 0)
      timeline.from(scene.rotation, { duration: 1, z: 0.6 * Math.PI }, 0.8)
      timeline.fromTo(camera.position, { y: 0.2, z: 3 }, { duration: 2, y: 0.75, z: 2 }, 0.8)
      timeline.fromTo(screenGroup.rotation, { z: 0.5 * Math.PI }, { duration: 1, z: 0.08 * Math.PI, ease: 'power1.inOut' }, 1)

      // Screen overlay fade in
      timeline.to('[data-intro="wrap"]', { duration: 0.2, opacity: 1 }, 1.9)

      // Scene 1: Autonomous Code Studio
      timeline.to('[data-intro="overlay-1"]', { opacity: 1, duration: 0.5 })
      timeline.to('[data-intro="text-wrap-1"]', { opacity: 1, duration: 1 }, '<')
      timeline.to('[data-intro=\"img-float-1\"]', { y: 0, opacity: 1, z: 40, duration: 0.5 }, '<0.15')

      // Scene 2: Video Editor & Creative Suite
      timeline.to('[data-intro="image-wrap-2"]', { y: 0, autoAlpha: 1, duration: 1, delay: 1.5 })
      timeline.to('[data-intro="image-wrap-1"]', { autoAlpha: 0, duration: 0.5 }, '<')
      timeline.to('[data-intro="overlay-2"]', { opacity: 1, duration: 0.5 })
      timeline.to('[data-intro="text-wrap-2"]', { opacity: 1, duration: 1 }, '<')
      timeline.to('[data-intro=\"img-float-2\"]', { y: 0, opacity: 1, z: 40, duration: 0.5 }, '<0.15')

      // Scene 3: Multi-Model Router & Cost Optimisation
      timeline.to('[data-intro="image-wrap-3"]', { y: 0, autoAlpha: 1, duration: 1, delay: 1.5 })
      timeline.to('[data-intro="image-wrap-2"]', { autoAlpha: 0, duration: 0.5 }, '<')
      timeline.to('[data-intro="overlay-3"]', { opacity: 1, duration: 0.5 })
      timeline.to('[data-intro="text-wrap-3"]', { opacity: 1, duration: 1 }, '<')
      timeline.to('[data-intro=\"img-float-3\"]', { y: 0, opacity: 1, z: 40, duration: 0.5 }, '<0.15')

      // Scene 4: 5 Verification Runtimes
      timeline.to('[data-intro="image-wrap-4"]', { y: 0, autoAlpha: 1, duration: 1, delay: 1.5 })
      timeline.to('[data-intro="image-wrap-3"]', { autoAlpha: 0, duration: 0.5 }, '<')
      timeline.to('[data-intro="overlay-4"]', { opacity: 1, duration: 0.5 })
      timeline.to('[data-intro="text-wrap-4"]', { opacity: 1, duration: 1 }, '<')
      timeline.to('[data-intro=\"img-float-4\"]', { y: 0, opacity: 1, z: 40, duration: 0.5 }, '<0.15')
      // The player's controls are the last beat: only once the scene has landed.
      timeline.to('[data-intro*="player"]', { autoAlpha: 1, duration: 0.5 }, '<0.3')

      resize()
      ScrollTrigger.refresh()
      config.onReady?.()
    },
    undefined,
    (err) => {
      console.error('Failed to load authentic /models/macbook.glb', err)
    }
  )

  resize()

  return {
    resize,
    render,
    get timeline() {
      return timeline
    },
    dispose() {
      isDisposed = true
      timeline?.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === config.scrollWrap) st.kill()
      })
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry?.dispose()
          if (Array.isArray(o.material)) {
            o.material.forEach((m) => m.dispose())
          } else {
            o.material?.dispose()
          }
        }
      })
      kbTex.dispose()
      bodyTex.dispose()
      renderer.dispose()
    },
  }
}
