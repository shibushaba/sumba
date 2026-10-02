import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** Class names for tactile press feedback (pair with motion-press-card in CSS). */
export function usePressAnimation(extra?: string): string {
  const reduced = usePrefersReducedMotion()
  if (reduced) return extra ?? ''
  return ['motion-press-card', extra].filter(Boolean).join(' ')
}
