import { Smartphone } from 'lucide-react'
import { GameButton } from './imposter/GameButton'

export interface PassPhoneScreenProps {
  playerName: string
  currentIndex: number
  totalPlayers: number
  onReady: () => void
  onCancel?: () => void
  context?: 'reveal' | 'vote'
  readyLabel?: string
}

export function PassPhoneScreen({
  playerName,
  currentIndex,
  totalPlayers,
  onReady,
  onCancel,
  context = 'reveal',
  readyLabel,
}: PassPhoneScreenProps) {
  const firstName = playerName.split(' ')[0]

  return (
    <div className="game-phase-enter game-no-select flex flex-1 flex-col items-center justify-center px-2 text-center">
      <p className="sr-only">
        Player {currentIndex} of {totalPlayers}. Hand the device to {firstName}.
      </p>
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-muted">
        Pass phone
      </p>
      <Smartphone className="mt-6 h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden />
      <p className="mt-10 font-display text-[clamp(2rem,12vw,3.25rem)] font-bold uppercase leading-none tracking-wide">
        {firstName}
      </p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">
        Only {firstName} should look
      </p>
      <div className="mt-12 w-full max-w-sm pb-safe-inline">
        <GameButton fullWidth haptic="medium" onClick={onReady}>
          {readyLabel ?? (context === 'vote' ? 'Tap to vote' : "I'm ready")}
        </GameButton>
        {onCancel ? (
          <GameButton variant="secondary" fullWidth className="mt-3" onClick={onCancel}>
            Cancel
          </GameButton>
        ) : null}
      </div>
    </div>
  )
}
