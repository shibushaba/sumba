import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { GlassButton, type GlassButtonVariant } from './glass/GlassButton'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const glassVariant: GlassButtonVariant = variant
  return (
    <GlassButton
      variant={glassVariant}
      fullWidth={fullWidth}
      sound={false}
      className={[
        size === 'lg' ? 'min-h-[56px] text-sm' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </GlassButton>
  )
}
