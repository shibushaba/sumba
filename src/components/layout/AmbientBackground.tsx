import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

export function AmbientBackground() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <>
      <div className="grain-layer" aria-hidden />
      <div
        className="ambient-glow pointer-events-none fixed -left-20 top-24 z-0 h-56 w-56 rounded-full bg-primary/25 blur-3xl"
        style={reducedMotion ? undefined : { animation: 'sumba-glow-pulse 8s ease-in-out infinite' }}
        aria-hidden
      />
      <div
        className="ambient-glow pointer-events-none fixed -right-16 bottom-32 z-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        style={
          reducedMotion
            ? undefined
            : { animation: 'sumba-glow-pulse 10s ease-in-out infinite 2s' }
        }
        aria-hidden
      />
    </>
  )
}
