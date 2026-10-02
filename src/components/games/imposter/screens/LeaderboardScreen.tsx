import { Link } from 'react-router-dom'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'
import { LeaderboardPanel } from '../../../leaderboard/LeaderboardPanel'
import { submitImposterRound } from '../../../../services/imposterRounds'
import { useImposterGameId } from '../../../../hooks/useImposterGameId'
import { useEffect, useRef, useState } from 'react'

export function LeaderboardScreen() {
  const { state, dispatch } = useImposterGame()
  const gameId = useImposterGameId()
  const [refreshKey, setRefreshKey] = useState(0)
  const [submitError, setSubmitError] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    const round = state.round
    if (!round || round.roundSubmitted || !gameId || submitting.current) return
    submitting.current = true
    void submitImposterRound(gameId, round).then((ok) => {
      if (ok) {
        dispatch({ type: 'MARK_ROUND_SUBMITTED' })
        setRefreshKey((k) => k + 1)
        setSubmitError(false)
      } else {
        setSubmitError(true)
      }
    }).finally(() => {
      submitting.current = false
    })
  }, [state.round, gameId, dispatch])

  return (
    <GameShell
      title="Leaderboard"
      footer={
        <div className="space-y-3">
          <GameButton fullWidth onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
            Play again
          </GameButton>
          <Link to="/leaderboard/imposter" className="block">
            <GameButton variant="secondary" fullWidth>
              Full leaderboard
            </GameButton>
          </Link>
          <Link to="/games" className="block">
            <GameButton variant="secondary" fullWidth onClick={() => dispatch({ type: 'BACK_TO_GAMES' })}>
              Back to games
            </GameButton>
          </Link>
        </div>
      }
    >
      <div className="game-phase-enter space-y-3">
        {submitError ? (
          <p className="text-center text-sm font-bold text-primary" role="alert">
            Could not save scores. Check you&apos;re signed in and try again.
          </p>
        ) : null}
        <LeaderboardPanel
          gameTab="imposter"
          showGameTabs={false}
          compact
          refreshKey={refreshKey}
        />
      </div>
    </GameShell>
  )
}
