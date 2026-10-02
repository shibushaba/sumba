import { useEffect, useState } from 'react'
import { useImposterGame } from '../ImposterGameContext'
import { GameShell } from '../GameShell'
import { GameButton } from '../GameButton'
import { playSound } from '../../../../lib/sound'
import { triggerHaptic } from '../../../../lib/haptics'
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion'

const TOTAL_SECONDS = 300

export function DiscussionScreen() {
  const { state, dispatch } = useImposterGame()
  const round = state.round
  const reduced = usePrefersReducedMotion()
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)

  useEffect(() => {
    if (!round?.discussionEndsAt) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((round.discussionEndsAt! - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left === 60 || left === 30) {
        triggerHaptic('light')
      }
      if (left === 10 && !reduced) {
        playSound('transition')
      }
      if (left === 0) {
        triggerHaptic('heavy')
        playSound('transition')
        dispatch({ type: 'DISCUSSION_END' })
      }
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [round?.discussionEndsAt, dispatch, reduced])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const urgent = secondsLeft <= 30
  const warning = secondsLeft <= 60 && !urgent

  function skipDiscussion() {
    triggerHaptic('light')
    dispatch({ type: 'DISCUSSION_END' })
  }

  return (
    <GameShell
      immersive
      footer={
        secondsLeft > 0 ? (
          <GameButton variant="secondary" fullWidth onClick={skipDiscussion}>
            Skip timer
          </GameButton>
        ) : null
      }
    >
      <div className="game-phase-enter flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-sm font-black uppercase tracking-[0.3em] text-muted">
          Discussion
        </p>
        <p
          className={[
            'mt-6 font-display font-black tabular-nums',
            urgent ? 'text-6xl text-primary game-red-pulse' : warning ? 'text-6xl text-primary' : 'text-7xl',
          ].join(' ')}
        >
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
        <p className="mt-6 text-sm text-muted">Find the Imposter.</p>
        {secondsLeft === 0 ? (
          <p className="mt-4 font-display text-2xl font-black uppercase">Time&apos;s up</p>
        ) : null}
      </div>
    </GameShell>
  )
}
