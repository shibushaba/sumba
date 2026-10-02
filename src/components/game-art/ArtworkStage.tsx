import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useIntersectionVisible } from './useIntersectionVisible'
import { useSignatureCycle } from './useSignatureCycle'
import type { GameArtId } from './types'

export interface ArtworkHandle {
  playIdle: () => void
  playPress: () => void
  pause: () => void
  resume: () => void
  cleanup: () => void
}

interface ArtworkStageProps {
  game: GameArtId
  children: ReactNode
  /** Signature event cadence (ms). */
  signatureEvery?: number
  signatureDuration?: number
  interactive?: boolean
  className?: string
}

const PARALLAX_MAX = 4
const PRESS_MS = 420

/**
 * Shared 2.5D stage for every game artwork.
 * - IntersectionObserver pause/resume
 * - prefers-reduced-motion → static artwork
 * - pointer parallax (≤ 4px) via CSS variables --px / --py
 * - signature-event + press classes driven by CSS
 */
export const ArtworkStage = forwardRef<ArtworkHandle, ArtworkStageProps>(function ArtworkStage(
  {
    game,
    children,
    signatureEvery = 6000,
    signatureDuration = 1000,
    interactive = true,
    className = '',
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const visible = useIntersectionVisible(rootRef)
  const reduced = usePrefersReducedMotion()
  const [manualPause, setManualPause] = useState(false)
  const [pressed, setPressed] = useState(false)
  const pressTimer = useRef<number | null>(null)

  const paused = !visible || reduced || manualPause
  const signature = useSignatureCycle(signatureEvery, signatureDuration, !paused)

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }, [])

  const playPress = useCallback(() => {
    clearPressTimer()
    setPressed(true)
    pressTimer.current = window.setTimeout(() => {
      setPressed(false)
      pressTimer.current = null
    }, PRESS_MS)
  }, [clearPressTimer])

  useImperativeHandle(
    ref,
    () => ({
      playIdle: () => setManualPause(false),
      playPress,
      pause: () => setManualPause(true),
      resume: () => setManualPause(false),
      cleanup: () => {
        clearPressTimer()
        setPressed(false)
        setManualPause(true)
      },
    }),
    [playPress, clearPressTimer],
  )

  useEffect(() => clearPressTimer, [clearPressTimer])

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (paused || !interactive) return
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    el.style.setProperty('--px', `${(nx * PARALLAX_MAX).toFixed(2)}px`)
    el.style.setProperty('--py', `${(ny * PARALLAX_MAX).toFixed(2)}px`)
  }

  const resetParallax = () => {
    const el = rootRef.current
    if (!el) return
    el.style.setProperty('--px', '0px')
    el.style.setProperty('--py', '0px')
  }

  return (
    <div
      ref={rootRef}
      className={[
        'game-art',
        `game-art--${game}`,
        paused ? 'is-paused' : '',
        reduced ? 'is-reduced' : '',
        signature ? 'is-signature' : '',
        pressed ? 'is-pressed' : '',
        interactive ? 'is-interactive' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPointerMove={onPointerMove}
      onPointerLeave={resetParallax}
      onPointerDown={() => interactive && playPress()}
      aria-hidden
    >
      {children}
    </div>
  )
})
