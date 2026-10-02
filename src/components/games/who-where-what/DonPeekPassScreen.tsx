import { GameButton } from '../imposter/GameButton'

interface DonPeekPassScreenProps {
  onContinue: () => void
}

export function DonPeekPassScreen({ onContinue }: DonPeekPassScreenProps) {
  return (
    <div className="game-phase-enter game-no-select flex flex-1 flex-col items-center justify-center px-2 text-center">
      <p className="font-display text-sm font-black uppercase tracking-[0.3em] text-muted">
        Pass the phone
      </p>
      <p className="mt-10 font-display text-[clamp(1.75rem,8vw,2.5rem)] font-black uppercase leading-tight">
        Don&apos;t peek
      </p>
      <p className="mt-4 text-sm text-muted">Hand the device to the next player.</p>
      <div className="mt-12 w-full max-w-sm pb-safe-inline">
        <GameButton fullWidth haptic="medium" onClick={onContinue}>
          Continue
        </GameButton>
      </div>
    </div>
  )
}
