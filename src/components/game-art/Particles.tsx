/** Deterministic SVG dust/spark particles animated by CSS (no canvas, no RAF). */
export function Particles({
  count,
  color,
  area,
  size = 2.2,
  className = '',
}: {
  count: number
  color: string
  area: { x: number; y: number; w: number; h: number }
  size?: number
  className?: string
}) {
  const items = Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1)
    const x = area.x + area.w * ((t * 7.31) % 1)
    const y = area.y + area.h * ((t * 3.17 + 0.21) % 1)
    const r = size * (0.6 + ((i * 0.37) % 1) * 0.8)
    const delay = -((i * 1.37) % 8)
    const dur = 7 + ((i * 1.9) % 5)
    return { x, y, r, delay, dur, key: i }
  })

  return (
    <g className={['ga-particles', className].filter(Boolean).join(' ')}>
      {items.map((p) => (
        <circle
          key={p.key}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={color}
          className="ga-particle"
          style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </g>
  )
}
