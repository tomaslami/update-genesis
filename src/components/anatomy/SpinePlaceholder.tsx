'use client'

import { useEffect, useRef } from 'react'

/** Ancho (px) de cada vértebra, de C1 a L5. */
const WIDTHS = [30, 32, 34, 36, 37, 38, 40, 42, 44, 45, 46, 48, 50, 51, 52, 54, 55, 56, 58, 62, 66, 69, 72, 76]
const height = (i: number) => (i < 7 ? 10 : i < 19 ? 12 : 16)
/** Espacio entre vértebras (el disco). */
const GAP = 5
/** Ancho del dibujo: lo marca el sacro. */
const W = 130
const CX = W / 2

const VERTEBRAE = WIDTHS.map((w, i) => ({
  w,
  h: height(i),
  y: WIDTHS.slice(0, i).reduce((y, _, k) => y + height(k) + GAP, 0),
}))
/** El sacro empieza debajo de L5, separado por el disco L5–S1. */
const S = VERTEBRAE[23].y + VERTEBRAE[23].h + GAP

/** Sacro de frente (el mismo contorno que el modelo 3D): alas, borde auricular y vértice. */
const SACRUM = [
  `M ${CX} ${S - 1}`,
  `C ${CX + 12} ${S - 1} ${CX + 25} ${S - 0.5} ${CX + 32} ${S + 1.5}`,
  `C ${CX + 35} ${S + 2.6} ${CX + 38} ${S + 3.8} ${CX + 42} ${S + 4.1}`,
  `C ${CX + 50} ${S + 4.5} ${CX + 57.5} ${S + 4.9} ${CX + 61} ${S + 8.3}`,
  `C ${CX + 64.5} ${S + 12} ${CX + 63.5} ${S + 20} ${CX + 60} ${S + 27}`,
  `C ${CX + 56.5} ${S + 34.5} ${CX + 44} ${S + 46.5} ${CX + 36} ${S + 55.5}`,
  `C ${CX + 31.5} ${S + 61} ${CX + 29} ${S + 66} ${CX + 26.5} ${S + 71}`,
  `C ${CX + 22.5} ${S + 76.5} ${CX + 16} ${S + 82} ${CX + 12} ${S + 85.5}`,
  `C ${CX + 8} ${S + 87.8} ${CX + 3} ${S + 88} ${CX} ${S + 88}`,
  `C ${CX - 3} ${S + 88} ${CX - 8} ${S + 87.8} ${CX - 12} ${S + 85.5}`,
  `C ${CX - 16} ${S + 82} ${CX - 22.5} ${S + 76.5} ${CX - 26.5} ${S + 71}`,
  `C ${CX - 29} ${S + 66} ${CX - 31.5} ${S + 61} ${CX - 36} ${S + 55.5}`,
  `C ${CX - 44} ${S + 46.5} ${CX - 56.5} ${S + 34.5} ${CX - 60} ${S + 27}`,
  `C ${CX - 63.5} ${S + 20} ${CX - 64.5} ${S + 12} ${CX - 61} ${S + 8.3}`,
  `C ${CX - 57.5} ${S + 4.9} ${CX - 50} ${S + 4.5} ${CX - 42} ${S + 4.1}`,
  `C ${CX - 38} ${S + 3.8} ${CX - 35} ${S + 2.6} ${CX - 32} ${S + 1.5}`,
  `C ${CX - 25} ${S - 0.5} ${CX - 12} ${S - 1} ${CX} ${S - 1}`,
  'Z',
].join(' ')
/** Agujeros sacros: cuatro pares que convergen y se achican hacia abajo [x, y, rx, ry]. */
const FORAMINA = [
  [28, 22.5, 8.3, 4.6],
  [23.5, 41, 7.1, 4],
  [19.5, 57, 5.8, 3.2],
  [13.8, 70.5, 4.6, 2.6],
]
/** Cóccix: segmentos que se afinan [ancho, alto]. */
const COCCYX = [
  [16, 6],
  [11, 5],
  [7, 4],
]
const COCCYX_Y = COCCYX.map((_, i) => COCCYX.slice(0, i).reduce((y, [, h]) => y + h + 2, S + 90))
const H = COCCYX_Y[COCCYX.length - 1] + COCCYX[COCCYX.length - 1][1]

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' } as const

/**
 * Columna en 2D mientras carga el modelo 3D (o si el dispositivo no soporta
 * WebGL), con el sacro y el cóccix. Va donde aparece el modelo en el hero, del
 * mismo tamaño (las medidas siguen a la cámara de `config.ts`): el modelo entra
 * encima del dibujo. En vertical, al costado y con el sacro sobre el panel del texto.
 * `onDrawn` avisa cuando terminó de dibujarse (enseguida si no hay animación).
 */
export default function SpinePlaceholder({ onDrawn }: { onDrawn?: () => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const drawn = useRef(onDrawn)
  drawn.current = onDrawn
  useEffect(() => {
    let alive = true
    const animations = svg.current?.getAnimations?.({ subtree: true }) ?? []
    void Promise.allSettled(animations.map((a) => a.finished)).then(() => alive && drawn.current?.())
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="spine-placeholder relative h-full w-full text-white/60">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="absolute left-[73%] top-[15.6svh] h-[65.6svh] w-auto -translate-x-1/2 overflow-visible prt:left-[82%] prt:top-[-4svh] prt:h-[60svh]"
      >
        {VERTEBRAE.map((v, i) => (
          <rect
            key={i}
            className="v"
            x={CX - v.w / 2 + 0.5}
            y={v.y + 0.5}
            width={v.w - 1}
            height={v.h - 1}
            rx={3.5}
            style={{ ...stroke, animationDelay: `${i * 40}ms` }}
          />
        ))}
        <g className="v" style={{ animationDelay: `${24 * 40}ms` }}>
          <path d={SACRUM} style={stroke} />
          {FORAMINA.map(([x, y, rx, ry]) =>
            [-1, 1].map((s) => <ellipse key={`${x}${s}`} cx={CX + s * x} cy={S + y} rx={rx} ry={ry} style={stroke} />),
          )}
          {COCCYX.map(([w, h], i) => (
            <rect key={i} x={CX - w / 2} y={COCCYX_Y[i]} width={w} height={h} rx={h / 2} style={stroke} />
          ))}
        </g>
      </svg>
    </div>
  )
}
