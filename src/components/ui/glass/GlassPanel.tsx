import type { HTMLAttributes, ReactNode } from 'react'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const pad: Record<NonNullable<GlassPanelProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function GlassPanel({
  children,
  className = '',
  padding = 'md',
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={[
        'glass-panel rounded-[var(--radius-md)]',
        pad[padding],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
