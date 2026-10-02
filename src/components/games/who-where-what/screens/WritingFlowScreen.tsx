import { useState } from 'react'
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion'
import { playFeedback } from '../../../../motion/feedback'
import {
  MAX_WHAT_LENGTH,
  MAX_WHERE_LENGTH,
  MAX_WHO_LENGTH,
} from '../../../../games/who-where-what/constants'
import { validateWritingFields } from '../../../../games/who-where-what/validation'
import { PassPhoneScreen } from '../../PassPhoneScreen'
import { GameShell } from '../../imposter/GameShell'
import { GameButton } from '../../imposter/GameButton'
import { DonPeekPassScreen } from '../DonPeekPassScreen'
import { useWhoWhereWhat } from '../WhoWhereWhatContext'

export function WritingFlowScreen() {
  const { state, dispatch, currentPlayerName, goBack } = useWhoWhereWhat()
  const [who, setWho] = useState('')
  const [where, setWhere] = useState('')
  const [what, setWhat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [sealing, setSealing] = useState(false)
  const reduced = usePrefersReducedMotion()

  const total = state.players.length
  const index = state.currentPlayerIndex + 1
  const playerName = currentPlayerName ?? 'Player'

  if (state.phase === 'writing-ready') {
    return (
      <GameShell title="Who, Where, What" onBack={goBack} progress={`${index}/${total}`}>
        <PassPhoneScreen
          playerName={playerName}
          currentIndex={index}
          totalPlayers={total}
          onReady={() => dispatch({ type: 'WRITING_READY_ACK' })}
        />
      </GameShell>
    )
  }

  if (state.phase === 'writing-complete') {
    return (
      <GameShell title="Who, Where, What" onBack={goBack} immersive>
        <DonPeekPassScreen onContinue={() => dispatch({ type: 'WRITING_PASS_ACK' })} />
      </GameShell>
    )
  }

  if (state.phase !== 'writing') {
    return null
  }

  function handleSubmit() {
    const validated = validateWritingFields({ who, where, what })
    if (!validated.ok) {
      setError(validated.error)
      setShakeKey((k) => k + 1)
      playFeedback({ haptic: 'error', sound: 'error' })
      return
    }
    setError(null)
    const submit = () => {
      dispatch({ type: 'SUBMIT_WRITING', fields: validated.value })
      setWho('')
      setWhere('')
      setWhat('')
      setSealing(false)
    }
    if (reduced) {
      submit()
      return
    }
    setSealing(true)
    playFeedback({ haptic: 'light', sound: 'button_press' })
    window.setTimeout(submit, 220)
  }

  const inputClass =
    'motion-input-focus mt-1 w-full min-h-12 border-2 border-border bg-background px-3 py-3 text-base font-bold transition-shadow'

  return (
    <GameShell
      title="Who, Where, What"
      onBack={goBack}
      progress={`${index}/${total}`}
      centerContent={false}
      footer={
        <GameButton fullWidth haptic="medium" onClick={handleSubmit}>
          Done &amp; pass
        </GameButton>
      }
    >
      <div
        className={[
          'game-phase-enter flex flex-1 flex-col gap-5 pb-4',
          sealing ? 'motion-www-seal' : '',
          error ? 'motion-shake' : '',
        ].join(' ')}
        key={error ? `shake-${shakeKey}` : 'form'}
      >
        <p className="motion-slide-up text-center text-sm text-muted">
          Only <span className="font-black text-foreground">{playerName}</span> — fill all three.
        </p>
        <div className="motion-slide-up motion-stagger-1">
          <label className="font-display text-sm font-black uppercase text-primary" htmlFor="www-who">
            Who
          </label>
          <input
            id="www-who"
            className={inputClass}
            value={who}
            maxLength={MAX_WHO_LENGTH}
            onChange={(e) => setWho(e.target.value)}
            autoComplete="off"
            enterKeyHint="next"
          />
        </div>
        <div className="motion-slide-up motion-stagger-2">
          <label className="font-display text-sm font-black uppercase" htmlFor="www-where">
            Where
          </label>
          <input
            id="www-where"
            className={inputClass}
            value={where}
            maxLength={MAX_WHERE_LENGTH}
            onChange={(e) => setWhere(e.target.value)}
            autoComplete="off"
            enterKeyHint="next"
          />
        </div>
        <div className="motion-slide-up motion-stagger-3">
          <label className="font-display text-sm font-black uppercase text-primary" htmlFor="www-what">
            What
          </label>
          <input
            id="www-what"
            className={inputClass}
            value={what}
            maxLength={MAX_WHAT_LENGTH}
            onChange={(e) => setWhat(e.target.value)}
            autoComplete="off"
            enterKeyHint="done"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        {error ? (
          <p className="motion-pop-in text-sm font-bold text-primary" role="alert">{error}</p>
        ) : null}
      </div>
    </GameShell>
  )
}
