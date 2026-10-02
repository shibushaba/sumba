import type { ReactNode } from 'react'

interface ImposterScreenProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  large?: boolean
}

export function ImposterScreen({
  title,
  subtitle,
  children,
  footer,
  large = false,
}: ImposterScreenProps) {
  return (
    <div className="page-enter flex min-h-[60dvh] flex-col">
      <header className="mb-6 space-y-2">
        <h1
          className={`font-display font-black uppercase leading-tight tracking-tight ${large ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-muted sm:text-base">{subtitle}</p>
        ) : null}
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      {footer ? <div className="sticky bottom-0 mt-6 space-y-3 bg-background/80 pb-2 pt-4 backdrop-blur-sm">{footer}</div> : null}
    </div>
  )
}
