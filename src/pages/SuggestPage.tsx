import { useState } from 'react'
import { Check } from 'lucide-react'
import { usePlayerAuthOptional } from '../components/auth/PlayerAuthProvider'
import { AnimatedPage } from '../components/motion/AnimatedPage'
import { GlassButton } from '../components/ui/glass/GlassButton'
import { GlassPanel } from '../components/ui/glass/GlassPanel'
import { GlassTextarea } from '../components/ui/glass/GlassInput'
import { submitGameRequest } from '../services/gameRequests'
import { playFeedback } from '../motion/feedback'

type SubmitState = 'idle' | 'submitting' | 'received' | 'success' | 'error'

export function SuggestPage() {
  const auth = usePlayerAuthOptional()
  const [idea, setIdea] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [buttonLabel, setButtonLabel] = useState('Submit idea')

  const displayName =
    auth?.profile?.displayName?.split(' ')[0] ??
    auth?.profile?.username ??
    'friend'

  async function handleSubmit() {
    setSubmitState('submitting')
    setButtonLabel('Submitting…')
    setError(null)
    const result = await submitGameRequest({ description: idea })
    if (!result.ok) {
      setSubmitState('error')
      setButtonLabel('Submit idea')
      setError(result.error)
      playFeedback({ haptic: 'error', sound: 'error' })
      return
    }
    setSubmitState('received')
    setButtonLabel('Check')
    playFeedback({ haptic: 'success', sound: 'success' })
    window.setTimeout(() => setButtonLabel('Received'), 220)
    window.setTimeout(() => {
      setSubmitState('success')
      setIdea('')
      setButtonLabel('Submit idea')
    }, 480)
  }

  if (submitState === 'success') {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center text-center">
        <GlassPanel className="motion-modal-panel w-full max-w-md border border-[var(--smb-border-strong)]">
          <p className="font-display text-lg font-bold uppercase">Idea received</p>
          <p className="mt-3 text-sm text-foreground">Thanks, {displayName}.</p>
          <p className="mt-2 text-sm text-muted">
            Your game idea is now in the SUMBA build queue.
          </p>
          <p className="mt-1 text-xs text-muted">Target review: 2–3 days.</p>
          <GlassButton className="mt-6" fullWidth onClick={() => setSubmitState('idle')}>
            Done
          </GlassButton>
        </GlassPanel>
      </div>
    )
  }

  return (
    <AnimatedPage className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Suggest a game
        </h1>
        <p className="mt-2 text-sm text-muted">
          Drop a game idea. We&apos;ll turn it into a playable game.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted" htmlFor="idea">
            What game should we build?
          </label>
          <GlassTextarea
            id="idea"
            required
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Tell us your game idea..."
            className="mt-2 font-body normal-case transition-shadow focus:shadow-[0_0_0_1px_rgba(230,57,70,0.35)]"
          />
        </div>

        {error ? (
          <p className="motion-pop-in text-sm font-medium text-primary" role="alert">{error}</p>
        ) : null}

        <GlassButton
          type="submit"
          fullWidth
          disabled={submitState === 'submitting' || submitState === 'received'}
          className={submitState === 'received' ? 'motion-success-pop' : ''}
        >
          {submitState === 'received' ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" aria-hidden />
              {buttonLabel}
            </span>
          ) : (
            buttonLabel
          )}
        </GlassButton>
      </form>
    </AnimatedPage>
  )
}
