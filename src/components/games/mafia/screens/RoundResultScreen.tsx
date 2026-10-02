import { getPublicRoundOutcome } from '../../../../games/mafia/reducer'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useMafia } from '../MafiaContext'

export function RoundResultScreen() {
  const { fullState, dispatch, goBack } = useMafia()
  const outcome = getPublicRoundOutcome(fullState)

  return (
    <GameShell title="Mafia" onBack={goBack}>
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
        <p className="font-display text-2xl font-black uppercase">
          Round {fullState.roundsCompleted} complete
        </p>
        {outcome.eliminatedName ? (
          <p className="mt-4 font-display text-lg font-black uppercase text-primary">
            {outcome.eliminatedName} is out.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">No one was eliminated.</p>
        )}
        <div className="mt-10 w-full max-w-sm">
          <GameButton fullWidth onClick={() => dispatch({ type: 'START_NEXT_ROUND' })}>
            {fullState.currentRound >= 3 && !fullState.winner
              ? 'See final result'
              : 'Start next round'}
          </GameButton>
        </div>
      </div>
    </GameShell>
  )
}
