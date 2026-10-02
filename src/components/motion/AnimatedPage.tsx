import type { HTMLAttributes, ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface AnimatedPageProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function AnimatedPage({ children, className = '', ...props }: AnimatedPageProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <div
      className={[reduced ? '' : 'motion-slide-up', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
