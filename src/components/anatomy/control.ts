/**
 * Estado compartido entre la escena (que decide qué dibujar) y el pipeline de
 * render (que decide cómo). Es un objeto mutable a propósito: se lee y escribe
 * en cada cuadro sin pasar por React.
 */
export type RenderControl = {
  /**
   * La cámara viaja entre dos poses (o el modelo está entrando). Mientras dura,
   * el pipeline abarata el cuadro apagando la oclusión ambiental, que vuelve
   * con un fundido al llegar. La oscilación lenta del hero no cuenta.
   */
  busy: boolean
  /** El cuadro anterior se pidió a ritmo completo (sirve para medir la fluidez real). */
  fullRate: boolean
}

export const createRenderControl = (): RenderControl => ({ busy: true, fullRate: false })

/**
 * Niveles de calidad. Se baja solo si el dispositivo no sostiene la fluidez
 * y nunca se vuelve a subir en la sesión:
 *  0 completo · 1 resolución 1× · 2 sin oclusión ambiental
 */
export type QualityTier = 0 | 1 | 2
