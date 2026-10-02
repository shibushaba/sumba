import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'
import { triggerHaptic } from '../../../lib/haptics'
import { playSound } from '../../../lib/sound'
import { GameButton } from './GameButton'

interface RoleRevealProps {
  isImposter: boolean
  secretWord: string
  onHide: () => void
}

export function RoleReveal({ isImposter, secretWord, onHide }: RoleRevealProps) {
  const reduced = usePrefersReducedMotion()
  const [showWord, setShowWord] = useState(false)

  useEffect(() => {
    setShowWord(false)
    const delay = reduced ? 0 : 400
    const timer = window.setTimeout(() => setShowWord(true), delay)
    return () => clearTimeout(timer)
  }, [isImposter, secretWord, reduced])

  useEffect(() => {
    if (!showWord) return
    if (isImposter) {
      triggerHaptic('heavy')
      playSound('imposter')
    } else {
      triggerHaptic('medium')
      playSound('reveal')
    }
  }, [showWord, isImposter])

  return (
    <div className="game-no-select flex flex-1 flex-col touch-manipulation">
      <div
        className={[
          'flex flex-1 flex-col items-center justify-center text-center px-2',
          isImposter && showWord ? 'game-red-pulse border-2 border-primary/40 bg-primary/5 p-4' : '',
          isImposter && showWord ? 'shake-once' : '',
        ].join(' ')}
      >
        <p className="font-display text-sm font-black uppercase tracking-widest text-muted">
          Your word
        </p>
        {!showWord ? (
          <p className="mt-10 font-display text-4xl font-black text-muted">...</p>
        ) : isImposter ? (
          <>
            <p className="motion-scale-in game-word-sharp mt-10 font-display text-[clamp(3rem,14vw,5rem)] font-black">
              ???
            </p>
            <p className="glitch-once mt-8 font-display text-4xl font-black uppercase text-primary sm:text-5xl">
              Imposter
            </p>
            <p className="mt-6 max-w-xs text-sm text-muted">You don&apos;t know the word.</p>
          </>
        ) : (
          <p className="motion-scale-in game-word-sharp mt-10 font-display text-[clamp(2.5rem,12vw,4.5rem)] font-black uppercase leading-tight">
            {secretWord}
          </p>
        )}
      </div>
      {showWord ? (
        <div className="game-phase-enter pb-safe-inline pt-4">
          <GameButton fullWidth haptic="light" onClick={onHide}>
            Hide &amp; pass
          </GameButton>
        </div>
      ) : null}
    </div>
  )
}
