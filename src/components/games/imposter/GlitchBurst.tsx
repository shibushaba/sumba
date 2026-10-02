import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'

export function GlitchBurst({ active }: { active: boolean }) {
  const reduced = usePrefersReducedMotion()
  if (!active || reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className="absolute h-1 w-8 bg-primary/60"
          style={{
            left: `${(i * 9) % 100}%`,
            top: `${(i * 13) % 100}%`,
            transform: `rotate(${i * 30}deg)`,
            animation: `sumba-glitch ${0.4 + (i % 3) * 0.1}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}
