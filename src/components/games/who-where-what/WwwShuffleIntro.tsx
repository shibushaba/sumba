import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'

interface WwwShuffleIntroProps {
  onComplete: () => void
}

export function WwwShuffleIntro({ onComplete }: WwwShuffleIntroProps) {
  const reduced = usePrefersReducedMotion()
  const [showReady, setShowReady] = useState(false)

  useEffect(() => {
    if (reduced) {
      onComplete()
      return
    }
    const readyTimer = window.setTimeout(() => setShowReady(true), 520)
    const doneTimer = window.setTimeout(() => onComplete(), 920)
    return () => {
      window.clearTimeout(readyTimer)
      window.clearTimeout(doneTimer)
    }
  }, [reduced, onComplete])

  if (reduced) return null

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-2">
      <div className="www-shuffle-stage" aria-hidden>
        <div className="www-shuffle-card" />
        <div className="www-shuffle-card" />
        <div className="www-shuffle-card" />
      </div>
      {showReady ? (
        <p className="motion-pop-in mt-8 font-display text-3xl font-black uppercase">Ready</p>
      ) : (
        <p className="mt-8 text-sm font-bold uppercase tracking-widest text-muted">Mixing…</p>
      )}
    </div>
  )
}
