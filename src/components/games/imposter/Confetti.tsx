import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'

const COLORS = ['#e63946', '#f5f5f0', '#8a8a8a', '#ff6b6b']

export function Confetti({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion()
  if (!active || reduced) return null

  const pieces = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute top-0 block h-2 w-2"
          style={{
            left: `${(i * 4.3) % 100}%`,
            backgroundColor: COLORS[i % COLORS.length],
            animation: `sumba-confetti-fall ${2.2 + (i % 5) * 0.2}s linear ${(i % 8) * 0.08}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
