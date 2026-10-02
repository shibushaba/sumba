import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function BackButton({
  onClick,
  label = 'Back',
  className = '',
}: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex min-h-[44px] min-w-[44px] items-center gap-1',
        'font-display text-xs font-black uppercase tracking-wide text-muted',
        'transition-colors hover:text-foreground',
        className,
      ].join(' ')}
    >
      <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
      {label}
    </button>
  )
}
