import { useEffect, useRef } from 'react'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useMafia } from '../MafiaContext'
import { playFeedback } from '../../../../motion/feedback'

export function GameOverScreen() {
  const { fullState, dispatch, goBack } = useMafia()
  const played = useRef(false)

  useEffect(() => {
    if (played.current) return
    played.current = true
    playFeedback({
      haptic: fullState.winner === 'detective' ? 'success' : 'medium',
      sound: fullState.winner === 'detective' ? 'game_win' : 'game_over',
    })
  }, [fullState.winner])

  const mafia = fullState.players.find((p) => p.role === 'mafia')
  const doctor = fullState.players.find((p) => p.role === 'doctor')
  const detective = fullState.players.find((p) => p.role === 'detective')
  const civilians = fullState.players.filter((p) => p.role === 'civilian')

  const detectiveWin = fullState.winner === 'detective'
  const reason = fullState.winReason

  let headline = detectiveWin ? 'Detective wins' : 'Mafia wins'
  let subline = detectiveWin
    ? 'The Mafia was discovered.'
    : reason === 'detective-killed'
      ? 'The Detective was eliminated.'
      : 'The Mafia survived all 3 rounds.'

  return (
    <GameShell title="Mafia" onBack={goBack} centerContent={false}>
      <div className="game-phase-enter flex flex-1 flex-col gap-6 pb-6">
        <div className="text-center">
          <p
            className={[
              'motion-scale-in font-display text-[clamp(1.75rem,8vw,2.5rem)] font-black uppercase',
              detectiveWin ? 'detective-win-headline text-primary' : '',
            ].join(' ')}
          >
            {headline}
          </p>
          <p className="mt-2 text-sm text-muted">{subline}</p>
        </div>

        <div className="border-2 border-border bg-surface/60 p-4 space-y-2 text-sm">
          <p className="font-display text-xs font-black uppercase text-muted">Roles</p>
          <p><span className="text-primary font-bold">Mafia</span> — {mafia?.name}</p>
          <p><span className="text-emerald-400 font-bold">Doctor</span> — {doctor?.name}</p>
          <p><span className="text-sky-400 font-bold">Detective</span> — {detective?.name}</p>
          <p>
            <span className="font-bold">Civilians</span> —{' '}
            {civilians.map((c) => c.name).join(', ')}
          </p>
        </div>

        <div className="text-center text-sm text-muted">
          <p>Rounds played: {fullState.roundsCompleted || fullState.currentRound}</p>
          {detectiveWin ? (
            <p className="mt-2 font-display font-black uppercase text-primary">Detective +1</p>
          ) : (
            <p className="mt-2 font-display font-black uppercase text-primary">Mafia +1</p>
          )}
        </div>

        <GameButton fullWidth onClick={() => dispatch({ type: 'GO_TO_LEADERBOARD' })}>
          Leaderboard
        </GameButton>
      </div>
    </GameShell>
  )
}
