import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'

export function RoundReadyScreen() {
  const { state, dispatch } = useImposterGame()
  const round = state.round
  if (!round) return null

  return (
    <GameShell
      footer={
        <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'ROUND_READY_START' })}>
          Start
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-sm font-black uppercase tracking-[0.35em] text-muted">
          Round
        </p>
        <p className="font-display text-6xl font-black text-primary">
          {String(round.roundNumber).padStart(2, '0')}
        </p>
        <p className="mt-6 font-display text-sm font-black uppercase">
          {round.players.length} players
        </p>
        <p className="mt-2 font-display text-sm font-black uppercase">
          {round.imposterCount} imposter{round.imposterCount > 1 ? 's' : ''}
        </p>
        <p className="mt-6 text-xs font-bold uppercase text-muted">Pack</p>
        <p className="font-display text-xl font-black uppercase">{round.packLabel}</p>
      </div>
    </GameShell>
  )
}
