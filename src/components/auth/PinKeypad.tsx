import { useEffect, useRef } from 'react'
import { Delete } from 'lucide-react'
import { triggerHaptic } from '../../lib/haptics'

interface PinKeypadProps {
  value: string
  onChange: (pin: string) => void
  onComplete: (pin: string) => void
  disabled?: boolean
  errorShake?: boolean
  label?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const

export function PinKeypad({
  value,
  onChange,
  onComplete,
  disabled = false,
  errorShake = false,
  label = '4-digit PIN',
}: PinKeypadProps) {
  const lastSubmitted = useRef('')

  useEffect(() => {
    if (value.length < 4) {
      lastSubmitted.current = ''
      return
    }
    if (value.length === 4 && value !== lastSubmitted.current && !disabled) {
      lastSubmitted.current = value
      onComplete(value)
    }
  }, [value, onComplete, disabled])

  function press(key: string) {
    if (disabled) return
    triggerHaptic('light')
    if (key === 'del') {
      onChange(value.slice(0, -1))
      return
    }
    if (!key || value.length >= 4) return
    onChange(value + key)
  }

  return (
    <div className="touch-manipulation select-none">
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <div
        className={[
          'mt-3 flex justify-center gap-3',
          errorShake ? 'pin-shake' : '',
        ].join(' ')}
        aria-live="polite"
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={[
              'h-3 w-3 rounded-full border-2 transition-colors duration-150',
              i < value.length
                ? 'border-primary bg-primary'
                : 'border-muted bg-transparent',
              errorShake && i < value.length ? 'bg-primary/80' : '',
            ].join(' ')}
            aria-hidden
          />
        ))}
      </div>
      <p className="sr-only">
        {value.length} of 4 digits entered
      </p>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {KEYS.map((key, index) => {
          if (key === '') {
            return <div key={`spacer-${index}`} aria-hidden />
          }
          const isDelete = key === 'del'
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-label={isDelete ? 'Delete digit' : `Digit ${key}`}
              className={[
                'game-btn-press flex min-h-[52px] items-center justify-center',
                'border-2 border-border bg-surface font-display text-xl font-black',
                'active:border-primary disabled:opacity-40',
                isDelete ? 'text-muted' : 'text-foreground',
              ].join(' ')}
              onClick={() => press(key)}
            >
              {isDelete ? <Delete className="h-5 w-5" /> : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function pinAuthFailed(): void {
  triggerHaptic('warning')
}
