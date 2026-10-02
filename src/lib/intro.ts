/**
 * Coreografía de la entrada de la página:
 *  1. el titular del hero se anima;
 *  2. recién después se prepara el modelo 3D (así no le quita cuadros al titular);
 *  3. cuando el modelo terminó su propia entrada, se cargan los scripts de terceros.
 */
function signal() {
  let fire: () => void = () => {}
  const done = new Promise<void>((resolve) => {
    fire = resolve
  })
  return { fire: () => fire(), done: () => done }
}

const hero = signal()
const model = signal()

/** Lo llama el hero cuando termina su animación de entrada. */
export const markHeroIntroDone = hero.fire
/** Se resuelve cuando la entrada del hero terminó. */
export const heroIntroDone = hero.done

/** Lo llama la escena cuando el modelo terminó su animación de entrada. */
export const markModelIntroDone = model.fire
/** Se resuelve cuando el modelo terminó de entrar. */
export const modelIntroDone = model.done
