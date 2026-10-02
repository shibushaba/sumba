import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { GlassButton, type GlassButtonVariant } from '../../ui/glass/GlassButton'

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant | 'danger'
  children: ReactNode
  fullWidth?: boolean
  haptic?: 'light' | 'medium' | 'heavy'
  sound?: boolean
}

export function GameButton({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  haptic = 'light',
  sound = true,
  ...props
}: GameButtonProps) {
  const glassVariant: GlassButtonVariant =
    variant === 'danger' ? 'primary' : variant

  return (
    <GlassButton
      variant={glassVariant}
      fullWidth={fullWidth}
      className={[
        variant === 'danger' ? 'bg-[#5c1018] border-primary/80' : '',
        className,
      ].join(' ')}
      haptic={haptic}
      sound={sound}
      {...props}
    >
      {children}
    </GlassButton>
  )
}
