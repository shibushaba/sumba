interface PlayerProgressProps {
  current: number
  total: number
  label?: string
}

export function PlayerProgress({ current, total, label = 'Player' }: PlayerProgressProps) {
  return (
    <div className="mb-4 text-center" aria-label={`${label} ${current} of ${total}`}>
      <p className="font-display text-xs font-black uppercase tracking-widest text-muted">
        {label} {current} / {total}
      </p>
      <div className="mt-2 flex justify-center gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const filled = index < current
          const active = index === current - 1
          return (
            <span
              key={index}
              className={[
                'h-2.5 w-2.5 rounded-full border border-border transition-transform',
                filled ? 'bg-primary border-primary' : 'bg-transparent',
                active ? 'scale-125' : '',
              ].join(' ')}
              aria-hidden
            />
          )
        })}
      </div>
    </div>
  )
}
