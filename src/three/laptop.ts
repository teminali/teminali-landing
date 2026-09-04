import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export interface Laptop {
  group: THREE.Group
  screenGroup: THREE.Group
  contentMesh: THREE.Mesh | null
  isReady: boolean
  dispose(): void
}

/**
 * Authentic 14\" MacBook Pro shell from Reventador.global.
 *
 * Uses the exact GLB model (/models/macbook.glb) with authentic Apple keyboard
 * (/models/keyboard.webp) and unibody chassis (/models/macbook_BaseColor.webp)
 * PBR textures.
 */
export function createLaptop(onLoaded?: () => void): Laptop {
  const group = new THREE.Group()
  const screenGroup = new THREE.Group()
  group.add(screenGroup)

  let contentMesh: THREE.Mesh | null = null
  let isReady = false

  const manager = new THREE.LoadingManager()
  const texLoader = new THREE.TextureLoader(manager)

  const kbTex = texLoader.load("/models/keyboard.webp")
  kbTex.flipY = false

  const bodyTex = texLoader.load("/models/macbook_BaseColor.webp")
  bodyTex.flipY = false

  const bodyMat = new THREE.MeshStandardMaterial({
    map: bodyTex,
    metalness: 0.8,
    roughness: 0.45,
    color: 0xcccccc,
  })

  const kbMat = new THREE.MeshStandardMaterial({
    map: kbTex,
    metalness: 0.75,
    roughness: 0.8,
  })

  const contentMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })

  const gltfLoader = new GLTFLoader(manager)
  gltfLoader.load(
    "/models/macbook.glb",
    (gltf) => {
      const children = [...gltf.scene.children]
      children.forEach((m) => {
        if (m.name === "keyboard" && m instanceof THREE.Mesh) {
          m.material = kbMat
          m.castShadow = true
          m.receiveShadow = true
          group.add(m)
        } else if (m.name === "Cube.002" && m instanceof THREE.Mesh) {
          m.material = bodyMat
          m.castShadow = true
          m.receiveShadow = true
          group.add(m)
        } else if (m.name === "screen" && m instanceof THREE.Mesh) {
          m.material = bodyMat
          m.castShadow = true
          screenGroup.add(m)
        } else if (m.name === "content" && m instanceof THREE.Mesh) {
          m.material = contentMat
          screenGroup.add(m)
          contentMesh = m
        }
      })

      isReady = true
      group.rotation.y = 0.5 * Math.PI
      onLoaded?.()
    },
    undefined,
    (err) => {
      console.error("Failed to load /models/macbook.glb", err)
    }
  )

  return {
    group,
    screenGroup,
    get contentMesh() {
      return contentMesh
    },
    get isReady() {
      return isReady
    },
    dispose() {
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry?.dispose()
          if (Array.isArray(o.material)) {
            o.material.forEach((mat) => mat.dispose())
          } else {
            o.material?.dispose()
          }
        }
      })
      kbTex.dispose()
      bodyTex.dispose()
      bodyMat.dispose()
      kbMat.dispose()
      contentMat.dispose()
    },
  }
}
