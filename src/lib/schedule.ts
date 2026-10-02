/**
 * Utilidades para repartir trabajo pesado en tareas cortas y no trabar la página.
 */

/** Cede el control al navegador (pinta y atiende la entrada) y sigue en una tarea nueva. */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  if (scheduler?.yield) return scheduler.yield()
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => resolve()
    channel.port2.postMessage(null)
  })
}

/** Espera `ms` milisegundos. */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
