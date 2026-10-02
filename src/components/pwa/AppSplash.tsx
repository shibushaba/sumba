import { useEffect, useState } from 'react'
import { SESSION_KEYS } from '../../lib/storageKeys'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

const DURATION_MS = 900

interface AppSplashProps {
  onComplete: () => void
}

export function AppSplash({ onComplete }: AppSplashProps) {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEYS.splashShown, 'true')
    const showMs = reduced ? 200 : DURATION_MS
    const exitTimer = window.setTimeout(() => setExiting(true), showMs - 200)
    const endTimer = window.setTimeout(() => {
      setVisible(false)
      onComplete()
    }, showMs)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(endTimer)
    }
  }, [onComplete, reduced])

  if (!visible) return null

  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080808]',
        'transition-opacity duration-300',
        exiting ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      role="presentation"
      aria-hidden
    >
      <div className="grain-layer" aria-hidden />
      <div
        className={[
          'relative z-10 font-display text-5xl font-black uppercase tracking-[0.2em] text-foreground',
          reduced ? '' : 'sumba-splash-title',
        ].join(' ')}
        style={{
          textShadow: '0 0 48px rgba(230, 57, 70, 0.45), 0 0 12px rgba(230, 57, 70, 0.25)',
        }}
      >
        SUMBA
      </div>
    </div>
  )
}

export function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEYS.splashShown) !== 'true'
}
