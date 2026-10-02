import { Check } from 'lucide-react'
import { triggerHaptic } from '../../../lib/haptics'

interface VotingCardProps {
  index: number
  name: string
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}

export function VotingCard({
  index,
  name,
  selected,
  disabled = false,
  onSelect,
}: VotingCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        triggerHaptic('light')
        onSelect()
      }}
      className={[
        'min-h-[120px] w-full border-2 px-4 py-5 text-center transition-transform duration-150 active:scale-[0.98]',
        selected
          ? 'border-primary bg-primary/15 scale-[1.02] shadow-[0_0_24px_rgba(230,57,70,0.35)] brutal-shadow-sm'
          : 'border-border bg-surface/80 hover:border-foreground',
        disabled ? 'cursor-not-allowed opacity-35' : '',
      ].join(' ')}
      aria-pressed={selected}
    >
      <p className="font-display text-3xl font-black text-muted">
        {String(index + 1).padStart(2, '0')}
      </p>
      <p className="mt-2 font-display text-xl font-black uppercase">{name}</p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted">
        {selected ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <Check className="h-3 w-3" aria-hidden /> Selected
          </span>
        ) : (
          'Select'
        )}
      </p>
    </button>
  )
}
