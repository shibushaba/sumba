import type { HTMLAttributes, ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface AnimatedStaggerProps extends HTMLAttributes<HTMLDivElement> {
  index: number
  children: ReactNode
  max?: number
}

export function AnimatedStagger({
  index,
  children,
  max = 5,
  className = '',
  ...props
}: AnimatedStaggerProps) {
  const reduced = usePrefersReducedMotion()
  const staggerClass =
    !reduced && index < max ? `motion-stagger-${Math.min(index + 1, max)}` : ''

  return (
    <div
      className={[
        reduced ? '' : 'motion-slide-up',
        staggerClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
