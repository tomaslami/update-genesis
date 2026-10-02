'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'
import TagManager from 'react-gtm-module'
import { modelIntroDone } from '@/lib/intro'
import { wait } from '@/lib/schedule'

const GA_ID = 'G-BNR9CJ65S6'
const GTM_ID = 'GTM-TVBQDN2X'

/**
 * Google Analytics y Tag Manager (≈ 300 kB de JS de terceros). Se cargan
 * cuando terminó la entrada de la página (titular y modelo 3D), en un momento
 * ocioso del navegador, para que no le quiten cuadros a ninguna animación. El
 * registro de la visita es el mismo; solo cambia cuándo se descargan.
 */
export default function Analytics() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    let alive = true
    void (async () => {
      // Sin 3D (o si tarda) se cargan igual, a lo sumo a los 7 s.
      await Promise.race([modelIntroDone(), wait(7000)])
      const idle = (window as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      const start = () => {
        if (!alive) return
        TagManager.initialize({ gtmId: GTM_ID })
        setOn(true)
      }
      if (idle) idle(start, { timeout: 3000 })
      else start()
    })()
    return () => {
      alive = false
    }
  }, [])

  return on ? <GoogleAnalytics gaId={GA_ID} /> : null
}
