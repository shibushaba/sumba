import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center border-2 border-border bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
