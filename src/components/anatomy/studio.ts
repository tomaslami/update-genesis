import * as THREE from 'three'

/**
 * Estudio de luces: cuatro paneles emisivos (caja de luz suave, relleno azul,
 * rebote cálido y luz de piso) que se renderizan una sola vez a un mapa de
 * entorno cúbico de 128 px. No se descarga ningún mapa HDR.
 *
 * Se prepara en dos pasos para repartir el trabajo en tareas cortas:
 *  1. `captureStudio`: dibuja los paneles en el cubo.
 *  2. `prefilter`: lo prefiltra (PMREM) y lo asigna a la escena. Es lo mismo que
 *     three haría por su cuenta en el primer cuadro, pero hecho por adelantado.
 */

type Panel = {
  form: 'rect' | 'circle'
  intensity: number
  color: string
  position: [number, number, number]
  scale: number | [number, number]
}

const PANELS: Panel[] = [
  { form: 'rect', intensity: 3, color: '#ffffff', position: [0, 6, 6], scale: [10, 4] },
  { form: 'rect', intensity: 2, color: '#8fc2ff', position: [-8, 1, -4], scale: [8, 10] },
  { form: 'rect', intensity: 1.2, color: '#ffd2ad', position: [8, -2, -2], scale: [6, 8] },
  { form: 'circle', intensity: 1.5, color: '#ffffff', position: [0, -6, 4], scale: 4 },
]

const RESOLUTION = 128
const ENVIRONMENT_INTENSITY = 0.75

export type Studio = {
  /** Prefiltra el entorno y lo asigna a la escena. */
  prefilter: () => void
  dispose: () => void
}

/** Paso 1: dibuja el estudio en un mapa cúbico. */
export function captureStudio(gl: THREE.WebGLRenderer, scene: THREE.Scene): Studio {
  const virtual = new THREE.Scene()
  const disposables: { dispose(): void }[] = []

  for (const p of PANELS) {
    const geometry = p.form === 'circle' ? new THREE.RingGeometry(0, 0.5, 64) : new THREE.PlaneGeometry(1, 1)
    const material = new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide })
    // La intensidad multiplica el color: valores > 1 son luz HDR.
    material.color.set(p.color).multiplyScalar(p.intensity)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...p.position)
    if (Array.isArray(p.scale)) mesh.scale.set(p.scale[0], p.scale[1], 1)
    else mesh.scale.setScalar(p.scale)
    // Todos los paneles miran al centro (el modelo).
    mesh.lookAt(0, 0, 0)
    virtual.add(mesh)
    disposables.push(geometry, material)
  }

  const cubeTarget = new THREE.WebGLCubeRenderTarget(RESOLUTION)
  cubeTarget.texture.type = THREE.HalfFloatType
  const cube = new THREE.CubeCamera(0.1, 1000, cubeTarget)
  virtual.add(cube)

  const autoClear = gl.autoClear
  gl.autoClear = true
  cube.update(gl, virtual)
  gl.autoClear = autoClear
  disposables.forEach((d) => d.dispose())

  let prefiltered: THREE.WebGLRenderTarget | null = null

  return {
    prefilter() {
      const pmrem = new THREE.PMREMGenerator(gl)
      prefiltered = pmrem.fromCubemap(cubeTarget.texture)
      pmrem.dispose()
      scene.environment = prefiltered.texture
      scene.environmentIntensity = ENVIRONMENT_INTENSITY
    },
    dispose() {
      if (prefiltered && scene.environment === prefiltered.texture) scene.environment = null
      prefiltered?.dispose()
      cubeTarget.dispose()
    },
  }
}
