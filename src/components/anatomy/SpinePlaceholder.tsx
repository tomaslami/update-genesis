/** Columna en 2D mientras carga el modelo 3D (o si el dispositivo no soporta WebGL). */
export default function SpinePlaceholder() {
  const widths = [30, 32, 34, 36, 37, 38, 40, 42, 44, 45, 46, 48, 50, 51, 52, 54, 55, 56, 58, 62, 66, 69, 72, 76]
  return (
    <div className="spine-placeholder flex h-full w-full items-center justify-end pr-[18%] prt:items-start prt:justify-center prt:pr-0 prt:pt-[18svh] lsc:pr-[16%]">
      {/* En horizontal hay menos alto: la columna se achica para entrar entera. */}
      <div className="flex flex-col items-center gap-[5px] lsc:scale-[0.7]">
        {widths.map((w, i) => (
          <span
            key={i}
            className="block rounded-[4px] border border-white/60"
            style={{ width: w, height: i < 7 ? 10 : i < 19 ? 12 : 16, animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
