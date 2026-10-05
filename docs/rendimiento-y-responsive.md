# Rendimiento y responsive — auditoría y arquitectura

Octubre 2026. Auditoría de rendimiento del sitio (en particular del modelo 3D),
optimización completa y adaptación responsive. Escritorio quedó **visualmente
idéntico**: verificado con comparación estricta píxel a píxel (11 poses del
modelo, diferencia máxima 2/255) y pantallas completas.

## Resultados

Medido en Chrome con GPU real (Intel Arc 140V), canvas 1920×1200. "Celular" es
390×844 con la CPU 4× más lenta. Mediana de varias corridas.

| | Antes | Ahora |
|---|---|---|
| GPU con el modelo quieto (motor 3D) | 18–99 %, 54–79 cuadros/s del mismo cuadro | **3 %**, 0 cuadros/s |
| GPU en el hero (oscilación lenta) | 74–99 % | **29 %** (30 cuadros/s, imperceptible) |
| Hilo principal con el modelo quieto — celular | 96 % | **20 %** |
| CPU del proceso GPU con el modelo quieto — celular | 26 % | **2 %** |
| Entrada del modelo: cuadros perdidos (mayor congelamiento) | 44–107 (hasta 1.2 s) | **0** (17 ms) |
| Entrada del hero: cuadros perdidos | 28–47 | 3–7 |
| Scroll por la zona 3D, calidad completa | p95 34 ms con GPU a 21 ms/cuadro; el sitio se degradaba solo | **p95 17 ms, 0 % de cuadros lentos**, 6 ms/cuadro |
| LCP | 1.9 s | 1.3 s |
| Tarea más larga en la carga | 441 ms | 215 ms |
| JS de la carga inicial (First Load) | 173 kB | 153 kB |
| Geometría del modelo | 110 550 vértices, 2.6 MB | 21 577 vértices, 0.72 MB (mismos triángulos) |
| Dependencias | — | −36 paquetes (drei y su árbol, maath, postprocessing wrapper) |

## Qué se encontró (causas raíz)

1. **Se dibujaba siempre, aunque nada cambiara.** El lienzo renderizaba a 60 fps
   el mismo cuadro con el modelo quieto: GPU saturada, ventiladores, batería.
2. **El pipeline de post-proceso costaba 16× la escena.** La escena en sí
   cuesta 0.8 ms/cuadro; el pipeline la llevaba a 13–21 ms:
   - N8AO (oclusión ambiental) ≈ la mitad: con los huesos marcados como
     transparentes, redibujaba la escena entera dos veces más por cuadro.
   - Antialias del contexto WebGL activo *además* del MSAA del compositor:
     costo sin ningún efecto visual (comparación: 0 píxeles distintos).
   - El wrapper de React agregaba un `CopyPass` extra a pantalla completa.
3. **El "detector de calidad" degradaba el sitio en máquinas capaces.** Como el
   render saturaba la GPU, el `PerformanceMonitor` bajaba resolución y quitaba
   el AO en plena navegación (y recompilaba shaders: otro tirón).
4. **Arranque bloqueante.** Una tarea de ~660 ms al iniciar el 3D (compilación
   de shaders en el hilo principal, sobre todo N8AO) justo durante la animación
   de entrada del hero; además se creaba un contexto WebGL extra solo para
   detectar soporte (57 ms).
5. **Animaciones CSS caras.** Las 12 notas animaban su pulso con `box-shadow`
   (repintado por cuadro) aunque se viera una sola.
6. **Trabajo de React y layout por cuadro de scroll**: la barra vertebral se
   re-renderizaba en cada cuadro; `useScroll` de framer medía la página en cada
   evento; las apariciones (`Reveal`) animaban en el hilo principal.
7. **Terceros**: GA + GTM = 317 kB de JS (más que todo el 3D) ejecutándose
   durante la entrada.

## Qué se cambió

### Modelo y render 3D (`src/components/anatomy/`)
- **Render a demanda** (`Anatomy.tsx`): se dibuja solo cuando algo se mueve
  (amortiguaciones que no llegaron, entrada, pulsos) y despierta con scroll,
  puntero, cambio de zona o tamaño. Animación ambiente (oscilación del hero,
  pulsos) a 30 fps.
- **Geometría indexada y por módulos** (`geometry/`): los mismos triángulos en el
  mismo orden, vértices compartidos. Se construye en tareas cortas
  (`buildAnatomyAsync`) para no bloquear.
- **Pipeline propio** (`pipeline.tsx`): mismo resultado (HDR + MSAA 4× + N8AO +
  AgX) sin el `CopyPass` extra ni el antialias redundante. N8AO y
  `postprocessing` solo se descargan en escritorio (`desktop-prefetch.ts`).
- **La oclusión ambiental se apaga mientras la cámara viaja entre poses** y
  vuelve con un fundido de 0.25 s al llegar. Con el modelo quieto la imagen es
  exactamente la de siempre.
- **Nada se compila después de mostrar el modelo**: entorno, prefiltrado,
  shaders (en paralelo con `compileAsync`) y un primer cuadro invisible se hacen
  antes del fundido de entrada.
- **Sin drei**: entorno de estudio (`studio.ts`), notas (`notes.tsx`, una sola
  capa DOM con la misma proyección que `<Html>`) y calidad adaptativa
  (`governor.tsx`, solo mide cuadros a ritmo completo y nunca oscila).
- Lo que no se ve (opacidad 0) no se dibuja; amortiguación propia (`damp.ts`,
  misma fórmula que maath).

### Carga
- **Coreografía** (`src/lib/intro.ts`): el paquete 3D se descarga en segundo
  plano (`webpackPrefetch`) y se ejecuta recién al terminar la entrada del hero;
  el modelo entra con un fundido sobre la columna 2D.
- **GA y GTM** se cargan al terminar la entrada del modelo, en un momento ocioso
  (`components/tools/Analytics.tsx`).
- framer-motion en modo liviano (`LazyMotion` + `m`); fuente variable declarada
  una sola vez.

### Página
- Pulso de las notas por `transform`/`opacity` (compositor); las notas apagadas
  no animan.
- Progreso de lectura fuera del store de React (`readingProgress`) y médula de la
  barra con `transform`.
- Apariciones (`Reveal`) como transición CSS con un único IntersectionObserver.
- Pasos de Kinesiología sin lecturas de layout por cuadro (mismo resorte).

## Responsive

Tres modos, definidos una sola vez en `src/lib/layout-mode.ts` y usados por el CSS
(variantes `prt:` y `lsc:` de Tailwind) y por la escena:

| Modo | Cuándo | Cómo se ve |
|---|---|---|
| `desktop` | ≥ 1024 px de ancho | Sin cambios: modelo a un lado, texto al otro. |
| `portrait` (`prt:`) | angosto y vertical (celular, tablet) | **Modelo al costado**: asoma por un borde, grande y recortado, y alterna de lado en cada sección (`SIDES`). El titular (`.zone-head`) va junto a él, del lado libre; el cuerpo del texto va en un panel opaco debajo (`--stage`, 54 % del alto) que sube sobre el modelo. Las etiquetas del modelo apuntan hacia el lado libre. Encuadre por pose en `PORTRAIT` (`config.ts`). |
| `landscape` (`lsc:`) | angosto y horizontal | El concepto de escritorio a escala: modelo a un lado, texto al otro, alternando. |

- **WhatsApp vive dentro de la barra vertebral** en pantallas < 1024 px (siempre a
  un toque y sin tapar texto); en escritorio ocupa el mismo lugar, al pie de la columna. No hay menú ni botón flotante.
- En vertical la pose cambia cuando el escenario de la sección (titular + modelo)
  llega a la pantalla (`layout.ts`), no al centro de la sección.

## Decisiones para revisar

- **GA/GTM diferidos**: no se registran visitas que se van antes de ~5–7 s. Si
  eso importa, en `Analytics.tsx` se puede adelantar (a costa de tirones en la
  entrada). Además, el seguimiento de scroll de GA4 cuesta ~0.5 s de CPU por
  recorrido en celular: si no se usa, conviene desactivarlo en GA (Medición
  mejorada → Desplazamientos). Y conviene revisar si GTM ya incluye el GA4 que
  también se carga directo (doble conteo).
- **AO en movimiento**: si se prefiere el AO también mientras la cámara viaja,
  cambiar `want` en `pipeline.tsx` (el scroll vuelve a costar ~13–17 ms/cuadro).
- **`powerPreference: 'default'`**: en laptops con dos GPUs se usa la integrada
  (alcanza de sobra y consume menos).
- `public/` tiene archivos que no usa el sitio (p. ej. `Portada.png`, 4.8 MB);
  no afectan a los visitantes, pero pesan en el repositorio y en el deploy.

## Cómo verificar

- Escritorio y celular con el servidor de desarrollo; en celular real, abrir la IP
  local del equipo en el puerto del `next dev` (misma red Wi-Fi).
- `prefers-reduced-motion`: sin entrada animada, el modelo salta a cada pose.
