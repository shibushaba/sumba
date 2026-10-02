import type { HTMLAttributes, ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface MotionShakeProps extends HTMLAttributes<HTMLDivElement> {
  active: boolean
  children: ReactNode
}

export function MotionShake({ active, children, className = '', ...props }: MotionShakeProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <div
      className={[
        className,
        active && !reduced ? 'motion-shake' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
