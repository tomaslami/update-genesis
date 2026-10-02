import * as THREE from 'three'
import { BONE, ORANGE } from './palette'

function boneMaterial() {
  return new THREE.MeshStandardMaterial({
    color: BONE.clone(),
    roughness: 0.5,
    metalness: 0,
    emissive: ORANGE.clone(),
    emissiveIntensity: 0,
    // Siempre transparente (opacidad 1 en reposo): así atenuarse a silueta no
    // obliga a recompilar el shader en medio del scroll.
    transparent: true,
    opacity: 1,
  })
}

/** Una sola vez por modelo; la escena anima sus colores y opacidades. */
export function createMaterials() {
  return {
    C: boneMaterial(),
    T: boneMaterial(),
    L: boneMaterial(),
    pelvis: boneMaterial(),
    femur: boneMaterial(),
    disc: new THREE.MeshStandardMaterial({ color: '#9fc3db', roughness: 0.3, transparent: true, opacity: 0.9 }),
    ribs: new THREE.MeshStandardMaterial({
      color: '#ece7de',
      roughness: 0.45,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    cartilage: new THREE.MeshStandardMaterial({
      color: '#b9d5e8',
      roughness: 0.3,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
    chain: new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, depthWrite: false }),
    joint: new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, opacity: 0, depthWrite: false }),
    halo: new THREE.MeshBasicMaterial({
      color: ORANGE,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    plumb: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }),
    flow: new THREE.MeshBasicMaterial({ color: '#ffd2ad', transparent: true, opacity: 0, depthWrite: false }),
  }
}

export type Materials = ReturnType<typeof createMaterials>

export function disposeMaterials(mats: Materials) {
  Object.values(mats).forEach((m) => m.dispose())
}
