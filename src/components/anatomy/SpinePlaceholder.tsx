/** Columna en 2D mientras carga el modelo 3D (o si el dispositivo no soporta WebGL). */
export default function SpinePlaceholder() {
  const widths = [30, 32, 34, 36, 37, 38, 40, 42, 44, 45, 46, 48, 50, 51, 52, 54, 55, 56, 58, 62, 66, 69, 72, 76]
  return (
    <div className="spine-placeholder flex h-full w-full items-center justify-end pr-[18%] max-[1023px]:items-start max-[1023px]:justify-center max-[1023px]:pr-0 max-[1023px]:pt-[18svh]">
      <div className="flex flex-col items-center gap-[5px]">
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
