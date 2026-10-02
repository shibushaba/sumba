import { Link } from 'react-router-dom'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { LeaderboardPanel } from '../../../leaderboard/LeaderboardPanel'
import { submitMafiaGame } from '../../../../services/mafiaRounds'
import { useMafiaGameId } from '../../../../hooks/useMafiaGameId'
import { useMafia } from '../MafiaContext'
import { useEffect, useRef, useState } from 'react'

export function LeaderboardScreen() {
  const { fullState, dispatch, goBack } = useMafia()
  const gameId = useMafiaGameId()
  const [refreshKey, setRefreshKey] = useState(0)
  const [submitError, setSubmitError] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    if (!gameId || fullState.scoreSubmitted || submitting.current) return
    submitting.current = true
    void submitMafiaGame(fullState).then((ok) => {
      if (ok) {
        dispatch({ type: 'MARK_SCORE_SUBMITTED' })
        setRefreshKey((k) => k + 1)
        setSubmitError(false)
      } else {
        setSubmitError(true)
      }
    }).finally(() => {
      submitting.current = false
    })
  }, [fullState, gameId, dispatch])

  return (
    <GameShell
      title="Leaderboard"
      onBack={goBack}
      footer={
        <div className="space-y-3">
          <GameButton fullWidth onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
            Play again
          </GameButton>
          <Link to="/leaderboard/mafia" className="block">
            <GameButton variant="secondary" fullWidth>
              Full leaderboard
            </GameButton>
          </Link>
          <Link to="/games" className="block">
            <GameButton variant="secondary" fullWidth>Back to games</GameButton>
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
          gameTab="mafia"
          showGameTabs={false}
          compact
          refreshKey={refreshKey}
        />
      </div>
    </GameShell>
  )
}
