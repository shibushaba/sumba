import { useEffect, useState } from 'react'
import { usePlayerAuth } from '../../../auth/PlayerAuthProvider'
import { PlayerLoginForm } from '../../../auth/PlayerLoginForm'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'
import { LeaderboardPanel } from '../../../leaderboard/LeaderboardPanel'
import { fetchMyImposterPoints } from '../../../../services/imposterStats'
import { useImposterGameId } from '../../../../hooks/useImposterGameId'

export function SetupScreen() {
  const { dispatch } = useImposterGame()
  const { user, loading } = usePlayerAuth()
  const gameId = useImposterGameId()
  const [points, setPoints] = useState<number | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  useEffect(() => {
    if (!user || !gameId) return
    void fetchMyImposterPoints(gameId, user.id).then(setPoints)
  }, [user, gameId])

  if (!loading && !user && showAuth) {
    return (
      <GameShell title="Sign in" onBack={() => setShowAuth(false)}>
        <div className="game-phase-enter w-full">
          <PlayerLoginForm onSuccess={() => setShowAuth(false)} />
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      footer={
        <div className="space-y-3">
          {user ? (
            <GameButton fullWidth haptic="medium" onClick={() => dispatch({ type: 'START_GAME' })}>
              Start game
            </GameButton>
          ) : (
            <GameButton fullWidth haptic="medium" onClick={() => setShowAuth(true)}>
              Sign in to play
            </GameButton>
          )}
          <GameButton
            variant="secondary"
            fullWidth
            onClick={() => setShowLeaderboard(true)}
          >
            Leaderboard
          </GameButton>
        </div>
      }
    >
      <div className="game-phase-enter w-full text-center">
        <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Imposter</h1>
        {user && points !== null ? (
          <p className="mt-4 font-display text-xs font-bold uppercase text-primary">
            Your score · {points}
          </p>
        ) : null}
      </div>
      {showLeaderboard ? (
        <div className="fixed inset-0 z-30 flex items-end bg-black/70 p-4 pb-safe">
          <div className="max-h-[80dvh] w-full overflow-auto glass-panel rounded-[var(--radius-md)] p-4">
            <LeaderboardPanel gameTab="imposter" showGameTabs={false} compact />
            <GameButton fullWidth className="mt-4" onClick={() => setShowLeaderboard(false)}>
              Close
            </GameButton>
          </div>
        </div>
      ) : null}
    </GameShell>
  )
}
