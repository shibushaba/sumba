import type { ReactNode } from 'react'
import { classifyVotes } from '../../../../game-engine/imposter/scoring'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'

export function ResultScreen() {
  const { state, dispatch } = useImposterGame()
  const round = state.round
  if (!round) return null

  const imposters = round.players.filter((p) => p.isImposter)
  const { caught, missed } = classifyVotes(round.players, round.imposterIds, round.votes)
  const step = round.resultsStep

  function advance() {
    dispatch({ type: 'RESULTS_ADVANCE' })
  }

  let body: ReactNode
  if (step === 'imposters') {
    body = (
      <>
        <p className="font-display text-sm uppercase text-muted">The Imposter</p>
        <div className="mt-6 space-y-2">
          {imposters.map((p) => (
            <p key={p.id} className="game-name-pop font-display text-4xl font-black uppercase text-primary">
              {p.name}
            </p>
          ))}
        </div>
      </>
    )
  } else if (step === 'word') {
    body = (
      <>
        <p className="font-display text-sm uppercase text-muted">The word</p>
        <p className="game-word-sharp mt-6 font-display text-5xl font-black uppercase">{round.secretWord}</p>
      </>
    )
  } else if (step === 'caught') {
    body = (
      <>
        <p className="font-display text-lg font-black uppercase">Who caught them?</p>
        <ul className="mt-4 space-y-2 text-left">
          {caught.map((row, i) => (
            <li key={i} className="text-sm">
              ✓ {row.voterName} → {row.targetName}
            </li>
          ))}
          {caught.length === 0 ? <li className="text-sm text-muted">Nobody caught an Imposter.</li> : null}
        </ul>
      </>
    )
  } else if (step === 'missed') {
    body = (
      <>
        <p className="font-display text-lg font-black uppercase">Missed</p>
        <ul className="mt-4 space-y-2 text-left">
          {missed.map((row, i) => (
            <li key={i} className="text-sm text-muted">
              {row.voterName} → {row.targetName}
            </li>
          ))}
          {missed.length === 0 ? <li className="text-sm text-muted">No misses.</li> : null}
        </ul>
      </>
    )
  } else {
    body = (
      <>
        <p className="font-display text-lg font-black uppercase">Round points</p>
        <ul className="mt-4 w-full max-w-sm space-y-2">
          {round.pointsEarned.map((row) => (
            <li
              key={row.playerId}
              className="flex justify-between border-b border-border py-2 font-display text-lg font-black uppercase"
            >
              <span>{row.name}</span>
              <span className="text-primary">{row.points > 0 ? `+${row.points}` : '0'}</span>
            </li>
          ))}
        </ul>
      </>
    )
  }

  const isLast = step === 'round-points'

  return (
    <GameShell
      immersive
      footer={
        <GameButton fullWidth onClick={advance}>
          {isLast ? 'Leaderboard' : 'Continue'}
        </GameButton>
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
        {body}
      </div>
    </GameShell>
  )
}
