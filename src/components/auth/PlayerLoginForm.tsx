import { useCallback, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { usePlayerAuth } from './PlayerAuthProvider'
import { PinKeypad, pinAuthFailed } from './PinKeypad'
import { AnimatedStagger } from '../motion/AnimatedStagger'
import { MotionShake } from '../motion/MotionShake'
import { useDebouncedValue } from '../../motion/useDebounce'
import { isValidUsername, isUsernameAvailable, normalizeUsername } from '../../lib/playerAuth'
import { playFeedback } from '../../motion/feedback'

interface PlayerLoginFormProps {
  onSuccess?: () => void
}

type RegisterStep = 'choose-pin' | 'confirm-pin'
type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export function PlayerLoginForm({ onSuccess }: PlayerLoginFormProps) {
  const { login, register } = usePlayerAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [registerStep, setRegisterStep] = useState<RegisterStep>('choose-pin')
  const [pinDraft, setPinDraft] = useState('')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [loginPhase, setLoginPhase] = useState<'idle' | 'success'>('idle')
  const [loginLabel, setLoginLabel] = useState('Sign in')

  const debouncedUsername = useDebouncedValue(username, 400)

  useEffect(() => {
    if (mode !== 'register') {
      setUsernameStatus('idle')
      return
    }
    const name = normalizeUsername(debouncedUsername)
    if (!name) {
      setUsernameStatus('idle')
      return
    }
    if (!isValidUsername(name)) {
      setUsernameStatus('invalid')
      return
    }
    let cancelled = false
    setUsernameStatus('checking')
    void isUsernameAvailable(name).then((ok) => {
      if (cancelled) return
      setUsernameStatus(ok ? 'available' : 'taken')
      if (ok) playFeedback({ haptic: 'selection', sound: 'success' })
      else playFeedback({ haptic: 'error', sound: 'error' })
    })
    return () => {
      cancelled = true
    }
  }, [debouncedUsername, mode])

  const failInput = useCallback((message: string, resetPin = true) => {
    setError(message)
    pinAuthFailed()
    playFeedback({ haptic: 'error', sound: 'error' })
    setShake(true)
    if (resetPin) setPin('')
    window.setTimeout(() => setShake(false), 350)
  }, [])

  const completeSuccess = useCallback(() => {
    setLoginPhase('success')
    setLoginLabel('Check')
    playFeedback({ haptic: 'success', sound: 'success' })
    window.setTimeout(() => setLoginLabel('Welcome'), 280)
    window.setTimeout(() => {
      setPin('')
      onSuccess?.()
      setLoginPhase('idle')
      setLoginLabel('Sign in')
    }, 650)
  }, [onSuccess])

  const submitLogin = useCallback(
    async (completedPin: string) => {
      const name = username.trim()
      if (!name) {
        failInput('Enter your username first.')
        return
      }
      if (busy || loginPhase === 'success') return

      setBusy(true)
      setError(null)
      setLoginLabel('Checking…')
      const err = await login(name, completedPin)
      setBusy(false)

      if (err) {
        setLoginLabel('Try again')
        failInput(err)
        window.setTimeout(() => setLoginLabel('Sign in'), 1200)
        return
      }
      completeSuccess()
    },
    [username, busy, login, failInput, loginPhase, completeSuccess],
  )

  const submitRegister = useCallback(
    async (completedPin: string) => {
      const name = username.trim()
      if (!name) {
        failInput('Enter your username first.')
        return
      }
      if (!isValidUsername(name)) {
        failInput('Username must be 3–20 letters, numbers, or _.')
        return
      }
      if (usernameStatus === 'taken') {
        failInput('Username already taken.')
        return
      }

      if (registerStep === 'choose-pin') {
        setError(null)
        setPinDraft(completedPin)
        setPin('')
        setRegisterStep('confirm-pin')
        return
      }

      if (completedPin !== pinDraft) {
        failInput("PINs don't match. Try again.")
        setRegisterStep('choose-pin')
        setPinDraft('')
        return
      }

      if (busy) return
      setBusy(true)
      setError(null)
      const err = await register(name, pinDraft)
      setBusy(false)

      if (err) {
        failInput(err)
        setRegisterStep('choose-pin')
        setPinDraft('')
        return
      }
      completeSuccess()
    },
    [username, busy, register, failInput, registerStep, pinDraft, usernameStatus, completeSuccess],
  )

  const handlePinComplete = useCallback(
    (completedPin: string) => {
      if (mode === 'login') {
        void submitLogin(completedPin)
      } else {
        void submitRegister(completedPin)
      }
    },
    [mode, submitLogin, submitRegister],
  )

  function restartPinChoice() {
    setRegisterStep('choose-pin')
    setPinDraft('')
    setPin('')
    setError(null)
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
    setPin('')
    setPinDraft('')
    setRegisterStep('choose-pin')
    setUsernameStatus('idle')
  }

  const pinLabel =
    mode === 'register' && registerStep === 'confirm-pin'
      ? 'Confirm PIN'
      : '4-digit PIN'

  const usernameInputClass = [
    'mt-1 w-full rounded-[var(--radius-md)] border bg-background px-3 py-3 font-bold uppercase transition-colors',
    usernameStatus === 'available' ? 'motion-input-success' : '',
    usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'motion-input-error' : '',
    'border-border',
  ].join(' ')

  return (
    <div className="space-y-4">
      <AnimatedStagger index={0}>
        <p className="motion-scale-in motion-logo-breathe text-center font-display text-2xl font-bold uppercase tracking-[0.3em]">
          Sumba
        </p>
      </AnimatedStagger>

      <AnimatedStagger index={1}>
        <div>
          <label className="text-xs font-bold uppercase text-muted" htmlFor="player-username">
            Username
          </label>
          <MotionShake active={usernameStatus === 'taken' || usernameStatus === 'invalid'}>
            <input
              id="player-username"
              className={usernameInputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={20}
              disabled={busy || loginPhase === 'success'}
            />
          </MotionShake>
          {mode === 'register' && usernameStatus === 'checking' ? (
            <p className="mt-1 text-xs text-muted">Checking…</p>
          ) : null}
          {mode === 'register' && usernameStatus === 'available' ? (
            <p className="motion-check-pop mt-1 flex items-center gap-1 text-xs font-bold text-emerald-400">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Username available
            </p>
          ) : null}
          {mode === 'register' && usernameStatus === 'taken' ? (
            <p className="mt-1 text-xs font-bold text-primary">Username already taken</p>
          ) : null}
          {mode === 'register' && usernameStatus === 'invalid' && username.trim() ? (
            <p className="mt-1 text-xs font-bold text-primary">
              Use 3–20 letters, numbers, or _
            </p>
          ) : null}
        </div>
      </AnimatedStagger>

      <AnimatedStagger index={2}>
        {mode === 'register' && registerStep === 'confirm-pin' ? (
          <p className="text-center text-xs font-bold uppercase text-muted">
            Enter the same PIN again
          </p>
        ) : null}

        <PinKeypad
          value={pin}
          onChange={setPin}
          onComplete={handlePinComplete}
          disabled={busy || loginPhase === 'success'}
          errorShake={shake}
          label={pinLabel}
        />
      </AnimatedStagger>

      <AnimatedStagger index={3}>
        {mode === 'login' && (busy || loginPhase === 'success') ? (
          <p
            className={[
              'text-center text-xs font-bold uppercase',
              loginPhase === 'success' ? 'motion-success-pop text-emerald-400' : 'text-muted',
            ].join(' ')}
            role="status"
          >
            {loginPhase === 'success' ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Check className="h-4 w-4" aria-hidden />
                {loginLabel}
              </span>
            ) : (
              loginLabel
            )}
          </p>
        ) : null}

        {mode === 'register' && registerStep === 'confirm-pin' ? (
          <button
            type="button"
            className="w-full text-xs font-bold uppercase text-muted underline-offset-2 hover:underline"
            onClick={restartPinChoice}
            disabled={busy}
          >
            Use a different PIN
          </button>
        ) : null}

        {error ? (
          <p className="motion-pop-in text-center text-sm font-bold text-primary" role="alert">
            {error}
          </p>
        ) : null}

        {mode === 'register' && registerStep === 'choose-pin' ? (
          <p className="text-center text-xs text-muted">
            Choose a 4-digit PIN, then confirm it.
          </p>
        ) : null}

        <button
          type="button"
          className="w-full text-xs font-bold uppercase text-muted underline-offset-2 hover:underline"
          onClick={switchMode}
          disabled={busy}
        >
          {mode === 'login' ? 'New player? Create account' : 'Already have an account? Sign in'}
        </button>
      </AnimatedStagger>
    </div>
  )
}
