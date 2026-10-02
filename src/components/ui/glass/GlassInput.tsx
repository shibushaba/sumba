import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const fieldClass =
  'glass-input w-full min-h-[52px] rounded-[var(--radius-md)] px-4 py-3 font-body text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function GlassInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input className={[fieldClass, className].join(' ')} {...rest} />
}

export function GlassTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return (
    <textarea
      className={[fieldClass, 'min-h-[140px] resize-none', className].join(' ')}
      {...rest}
    />
  )
}
