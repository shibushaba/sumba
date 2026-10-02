import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { triggerHaptic } from '../../../lib/haptics'
import { playSound, unlockAudio } from '../../../lib/sound'

export type GlassButtonVariant = 'primary' | 'secondary' | 'ghost'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant
  children: ReactNode
  fullWidth?: boolean
  haptic?: 'light' | 'medium' | 'heavy'
  sound?: boolean
}

const variants: Record<GlassButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground border border-primary/80 shadow-[var(--shadow-tactile)]',
  secondary:
    'glass-panel border border-[var(--smb-border-strong)] text-foreground',
  ghost: 'bg-transparent border border-transparent text-muted hover:text-foreground',
}

export function GlassButton({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  haptic = 'light',
  sound = true,
  onClick,
  type = 'button',
  ...props
}: GlassButtonProps) {
  return (
    <button
      type={type}
      className={[
        'btn-tactile min-h-[52px] rounded-[var(--radius-md)] px-5 py-3 font-display text-xs font-bold uppercase tracking-widest',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:opacity-45 disabled:pointer-events-none',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        unlockAudio()
        triggerHaptic(haptic)
        if (sound) playSound('button')
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </button>
  )
}
