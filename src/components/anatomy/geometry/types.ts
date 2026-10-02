import type * as THREE from 'three'

export type Region = 'C' | 'T' | 'L'

export type Vertebra = {
  region: Region
  index: number
  y: number
  z: number
  width: number
  height: number
  /** Geometría compartida por región, escalada a esta vértebra. */
  geometry: THREE.BufferGeometry
  scale: [number, number, number]
}

export type Anatomy = {
  vertebrae: Vertebra[]
  discs: THREE.BufferGeometry
  ribs: THREE.BufferGeometry
  cartilage: THREE.BufferGeometry
  sacrum: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }
  wings: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[]
  femurs: THREE.BufferGeometry
  chain: THREE.CatmullRomCurve3[]
  chainGeometry: THREE.BufferGeometry
  anchors: Record<string, THREE.Vector3>
  joints: THREE.Vector3[]
  bounds: { top: number; bottom: number }
}
