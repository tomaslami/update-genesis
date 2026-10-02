'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { QualityTier, RenderControl } from './control'

/** Cuadros por ventana de medición (≈ 1 s a ritmo completo). */
const WINDOW = 45
/** Por encima de este promedio (s por cuadro) el ritmo cae por debajo de ~50 fps. */
const SLOW = 0.02
/** Ventanas lentas consecutivas que justifican bajar un nivel. */
const STRIKES = 2

/**
 * Calidad adaptativa. Mide solo los cuadros que se pidieron a ritmo completo
 * (los del movimiento "ambiente" a 30 fps o los que siguen a una pausa no
 * cuentan: una escena que duerme no es una escena lenta). Si el dispositivo no
 * sostiene ~50 fps durante dos ventanas seguidas, baja un nivel de calidad.
 * Nunca sube: evita el vaivén de resolución y de pipeline.
 */
export default function Governor({
  control,
  tier,
  onTier,
}: {
  control: RenderControl
  tier: QualityTier
  onTier: (t: QualityTier) => void
}) {
  const win = useRef({ n: 0, sum: 0, strikes: 0 })

  useFrame((_, delta) => {
    const w = win.current
    if (!control.fullRate || delta <= 0 || delta > 0.1) {
      w.n = 0
      w.sum = 0
      return
    }
    w.n++
    w.sum += delta
    if (w.n < WINDOW) return
    const slow = w.sum / w.n > SLOW
    w.n = 0
    w.sum = 0
    w.strikes = slow ? w.strikes + 1 : 0
    if (w.strikes >= STRIKES && tier < 2) {
      w.strikes = 0
      onTier((tier + 1) as QualityTier)
    }
  })

  return null
}
