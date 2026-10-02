import { useEffect, useRef, useState } from 'react'
import { playFeedback } from '../../../../motion/feedback'
import { PassPhoneScreen } from '../../PassPhoneScreen'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { useMafia } from '../MafiaContext'

export function PrivateNotifyScreen() {
  const { fullState, dispatch, getPlayerWithRole, goBack } = useMafia()
  const item = fullState.notifyQueue[fullState.notifyIndex]
  const [ready, setReady] = useState(false)
  const [passAfter, setPassAfter] = useState(false)
  const feedbackPlayed = useRef(false)

  useEffect(() => {
    setReady(false)
    setPassAfter(false)
    feedbackPlayed.current = false
  }, [fullState.notifyIndex, item?.playerId, item?.kind])

  useEffect(() => {
    if (!ready || !item || item.kind !== 'saved' || feedbackPlayed.current) return
    feedbackPlayed.current = true
    playFeedback({ haptic: 'success', sound: 'doctor_save' })
  }, [ready, item])

  if (!item) return null
  const player = getPlayerWithRole(item.playerId)
  if (!player) return null

  if (!ready) {
    return (
      <GameShell title="Mafia" onBack={goBack} immersive>
        <PassPhoneScreen
          playerName={player.name}
          currentIndex={fullState.notifyIndex + 1}
          totalPlayers={fullState.notifyQueue.length}
          onReady={() => setReady(true)}
        />
      </GameShell>
    )
  }

  if (passAfter) {
    return (
      <GameShell title="Mafia" onBack={goBack} immersive>
        <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
          <p className="font-display text-sm font-black uppercase tracking-[0.25em] text-muted">
            Pass the phone
          </p>
          <div className="mt-10 w-full max-w-sm">
            <GameButton
              fullWidth
              onClick={() => dispatch({ type: 'NOTIFY_ACK' })}
            >
              Pass
            </GameButton>
          </div>
        </div>
      </GameShell>
    )
  }

  const isEliminated = item.kind === 'eliminated'
  const wasDoctor = isEliminated && player.role === 'doctor'

  return (
    <GameShell title="Mafia" onBack={goBack} immersive>
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center px-2">
        {isEliminated ? (
          <>
            <p className="font-display text-2xl font-black uppercase text-primary">
              You have been eliminated
            </p>
            {wasDoctor ? (
              <p className="mt-4 font-display text-lg font-black uppercase text-emerald-400/90">
                Your role was Doctor
              </p>
            ) : null}
            <p className="mt-4 text-sm text-muted">You are out of the game.</p>
          </>
        ) : (
          <>
            <p className="font-display text-xl font-black uppercase">You were targeted</p>
            <p className="motion-success-pop mt-4 font-display text-2xl font-black uppercase text-emerald-400">
              You were saved
            </p>
            <p className="mt-2 text-sm text-muted">You survived.</p>
          </>
        )}
        <div className="mt-10 w-full max-w-sm">
          <GameButton fullWidth onClick={() => setPassAfter(true)}>
            I understand
          </GameButton>
        </div>
      </div>
    </GameShell>
  )
}
