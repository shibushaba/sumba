import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useGameTransition() {
  const reduced = usePrefersReducedMotion()

  const enterClass = reduced ? '' : 'game-phase-enter'
  const exitClass = reduced ? '' : 'game-phase-exit'

  return { enterClass, exitClass, reduced }
}
