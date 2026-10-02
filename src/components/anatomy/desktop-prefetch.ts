/**
 * Solo se carga en escritorio. Al cargarse, el navegador empieza a descargar
 * en segundo plano (sin ejecutar) el compositor y la oclusión ambiental, que
 * en celular no se usan y por eso no viven en el paquete principal del 3D.
 * `webpackExports` deja en el paquete solo lo que se usa de cada librería.
 */
export const loadPostprocessing = () =>
  import(
    /* webpackPrefetch: true */
    /* webpackExports: ["EffectComposer", "EffectPass", "RenderPass", "ToneMappingEffect", "ToneMappingMode"] */
    'postprocessing'
  )
export const loadAmbientOcclusion = () =>
  import(
    /* webpackPrefetch: true */
    /* webpackExports: ["N8AOPostPass"] */
    'n8ao'
  )
