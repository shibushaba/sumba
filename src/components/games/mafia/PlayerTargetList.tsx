import type { MafiaPlayer } from '../../../games/mafia/types'
import { playFeedback } from '../../../motion/feedback'

export type TargetAccent = 'mafia' | 'doctor' | 'detective' | 'neutral'

interface PlayerTargetListProps {
  players: MafiaPlayer[]
  selectedId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
  accent?: TargetAccent
}

export function PlayerTargetList({
  players,
  selectedId,
  onSelect,
  disabled = false,
  accent = 'neutral',
}: PlayerTargetListProps) {
  return (
    <ul className="space-y-3">
      {players.map((player) => {
        const selected = selectedId === player.id
        const accentClass =
          selected && accent === 'mafia'
            ? 'target-selected-mafia border-primary bg-primary/15'
            : selected && accent === 'doctor'
              ? 'target-selected-doctor border-emerald-500/60 bg-emerald-500/10'
              : selected && accent === 'detective'
                ? 'target-selected-detective border-sky-500/60 bg-sky-500/10'
                : selected
                  ? 'border-primary bg-primary/15'
                  : 'border-border bg-surface/60 hover:border-foreground'

        return (
          <li key={player.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onSelect(player.id)
                playFeedback({ haptic: 'selection' })
              }}
              className={[
                'motion-press-card w-full min-h-[52px] border-2 px-4 py-3 text-left font-display text-lg font-black uppercase transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                accentClass,
                selected ? 'scale-[1.01]' : '',
              ].join(' ')}
              aria-pressed={selected}
            >
              {player.name}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
