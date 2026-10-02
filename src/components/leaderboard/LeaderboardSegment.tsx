import type { ReactNode } from 'react'

export interface LeaderboardSegmentOption<T extends string> {
  value: T
  label: ReactNode
}

interface LeaderboardSegmentProps<T extends string> {
  options: LeaderboardSegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  'aria-label': string
  className?: string
  equalWidth?: boolean
}

export function LeaderboardSegment<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  className = '',
  equalWidth = false,
}: LeaderboardSegmentProps<T>) {
  return (
    <div
      className={[
        'lb-segment-track',
        equalWidth ? 'lb-segment-track--equal' : '',
        className,
      ].join(' ')}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          data-active={value === opt.value}
          className="lb-segment-btn touch-manipulation"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
