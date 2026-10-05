'use client'

import { useEffect, useState } from 'react'

/**
 * Cómo se reparte la pantalla entre el modelo 3D y el texto:
 *  - desktop:   pantalla ancha (≥ 1024 px). Modelo a un lado, texto al otro; el lado alterna por sección.
 *  - landscape: pantalla angosta en horizontal (celular girado). El mismo esquema que en escritorio, a escala.
 *  - portrait:  pantalla angosta en vertical (celular, tablet). El modelo asoma por un costado, grande,
 *               y alterna de lado en cada sección; el titular va junto a él y el cuerpo del texto
 *               sube en un panel opaco debajo.
 *
 * Las mismas consultas definen las variantes `prt:` y `lsc:` de Tailwind.
 */
export type LayoutMode = 'desktop' | 'landscape' | 'portrait'

export const LAYOUT_QUERIES = {
  portrait: '(max-width: 1023px) and (orientation: portrait)',
  landscape: '(max-width: 1023px) and (orientation: landscape)',
} as const

export function getLayoutMode(): LayoutMode {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia(LAYOUT_QUERIES.portrait).matches) return 'portrait'
  if (window.matchMedia(LAYOUT_QUERIES.landscape).matches) return 'landscape'
  return 'desktop'
}

/** Modo actual; se actualiza al girar el dispositivo o cambiar el tamaño de la ventana. */
export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(getLayoutMode)
  useEffect(() => {
    const lists = Object.values(LAYOUT_QUERIES).map((q) => window.matchMedia(q))
    const on = () => setMode(getLayoutMode())
    on()
    lists.forEach((l) => l.addEventListener('change', on))
    return () => lists.forEach((l) => l.removeEventListener('change', on))
  }, [])
  return mode
}
