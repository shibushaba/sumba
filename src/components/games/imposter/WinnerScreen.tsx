import type { ReactNode } from 'react'

interface WinnerScreenProps {
  winnerLabel: string
  imposterNames: string
  secretWord: string
  playerCount: number
  imposterCount: number
  footer: ReactNode
}

export function WinnerScreen({
  winnerLabel,
  imposterNames,
  secretWord,
  playerCount,
  imposterCount,
  footer,
}: WinnerScreenProps) {
  return (
    <div className="game-phase-enter">
      <div className="glass-panel border-2 border-foreground p-6 brutal-shadow">
        <p className="text-center font-display text-sm font-black uppercase text-muted">
          Game over
        </p>
        <p className="mt-2 text-center font-display text-3xl font-black uppercase text-primary">
          {winnerLabel}
        </p>
        <dl className="mt-8 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase text-muted">Imposter</dt>
            <dd className="font-display text-xl font-black uppercase">{imposterNames}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted">Secret word</dt>
            <dd className="font-display text-2xl font-black uppercase">{secretWord}</dd>
          </div>
          <div className="flex gap-6 pt-2 text-xs font-bold uppercase text-muted">
            <span>{playerCount} players</span>
            <span>{imposterCount} imposters</span>
          </div>
        </dl>
      </div>
      <div className="mt-6 space-y-3">{footer}</div>
    </div>
  )
}
